const { GoogleGenAI } = require("@google/genai");

const getModelNames = () => {
  const primary = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const fallbacks = ["gemini-2.5-flash", "gemini-2.0-flash"];

  const seen = new Set();

  return [primary, ...fallbacks].filter((name) => {
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });
};

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  return new GoogleGenAI({
    apiKey
  });
};

const generateJSON = async (prompt, modelName) => {
  const ai = getGenAI();

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return response.text;
};

const analyzeResumeWithAI = async (resumeText, targetRole) => {
  const prompt = `
You are an expert AI Resume Analyzer and Career Coach.

Analyze the following resume against the target role:
"${targetRole}"

Resume:
"""
${resumeText}
"""

Return ONLY valid JSON using this exact structure:

{
  "resumeScore": 0,
  "atsScore": 0,
  "extractedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "improvementSuggestions": [],
  "recommendedTechnologies": [],
  "recommendedCourses": [],
  "careerRoadmap": [
    { "week": "Week 1", "task": "" },
    { "week": "Week 2", "task": "" },
    { "week": "Week 3", "task": "" },
    { "week": "Week 4", "task": "" },
    { "week": "Week 5", "task": "" },
    { "week": "Week 6", "task": "" }
  ],
  "projectRecommendations": [
    { "name": "", "description": "" }
  ],
  "summary": ""
}

Rules:
- resumeScore must be 0-100.
- atsScore must be 0-100.
- Return only JSON.
- No markdown.
- No explanation outside JSON.
`;

  let lastError;

  for (const modelName of getModelNames()) {
    try {
      const responseText = await generateJSON(prompt, modelName);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("AI did not return valid JSON.");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      lastError = error;
      console.error(`Gemini model failed: ${modelName}`, error.message);
    }
  }

  throw lastError || new Error("All Gemini models failed.");
};

const chatWithAI = async (
  systemPrompt,
  conversationHistory,
  userMessage
) => {
  const fullPrompt = `
${systemPrompt}

=== CONVERSATION HISTORY ===
${(conversationHistory || [])
  .slice(-10)
  .map(
    (msg) =>
      `${msg.role === "user" ? "USER" : "ASSISTANT"}: ${msg.content}`
  )
  .join("\n\n")}

=== USER QUESTION ===
${userMessage}

Return ONLY valid JSON:

{
  "answer": "",
  "suggestedQuestions": [
    "",
    "",
    ""
  ]
}
`;

  let lastError;

  for (const modelName of getModelNames()) {
    try {
      const responseText = await generateJSON(fullPrompt, modelName);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("AI did not return valid JSON.");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        answer:
          parsed.answer ||
          "I could not generate a response. Please try again.",
        suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
          ? parsed.suggestedQuestions.slice(0, 3)
          : [
              "What are my biggest strengths?",
              "How can I improve my ATS score?",
              "What skills should I learn next?"
            ]
      };
    } catch (error) {
      lastError = error;
      console.error(`Chat model failed: ${modelName}`, error.message);
    }
  }

  throw lastError || new Error("All Gemini models failed.");
};

module.exports = {
  analyzeResumeWithAI,
  chatWithAI
};
