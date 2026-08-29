const { GoogleGenerativeAI } = require("@google/generative-ai");

const getModelNames = () => {
  const primary = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const fallbacks = ["gemini-2.5-flash", "gemini-2.0-flash"];
  // Deduplicate while preserving order
  const seen = new Set();
  return [primary, ...fallbacks].filter(name => {
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });
};

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const analyzeResumeWithAI = async (resumeText, targetRole) => {
  try {
    const genAI = getGenAI();
    const modelNames = getModelNames();

    const prompt = `
      You are an expert AI Resume Analyzer and Career Coach.
      Analyze the following resume text against the target role of "${targetRole}".

      Resume Text:
      """
      ${resumeText}
      """

      You must respond ONLY with a valid JSON object following this EXACT structure:
      {
        "resumeScore": 0,
        "atsScore": 0,
        "extractedSkills": ["skill1", "skill2"],
        "missingSkills": ["skill1", "skill2"],
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "improvementSuggestions": ["suggestion1", "suggestion2"],
        "recommendedTechnologies": ["tech1", "tech2"],
        "recommendedCourses": ["course1", "course2"],
        "careerRoadmap": [
          { "week": "Week 1", "task": "description of task" },
          { "week": "Week 2", "task": "description of task" },
          { "week": "Week 3", "task": "description of task" },
          { "week": "Week 4", "task": "description of task" },
          { "week": "Week 5", "task": "description of task" },
          { "week": "Week 6", "task": "description of task" }
        ],
        "projectRecommendations": [
          { "name": "Project Name", "description": "Brief description of the project" }
        ],
        "summary": "Overall summary of the resume"
      }

      Important rules:
      - resumeScore and atsScore must be numbers between 0 and 100.
      - Do not add markdown.
      - Do not add explanation outside JSON.
      - Return only valid JSON.
    `;

    let lastError;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
          throw new Error("AI did not return a valid JSON format.");
        }

        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        lastError = error;
        console.error(`Gemini model failed: ${modelName}`, error.message);
      }
    }

    throw lastError || new Error("All Gemini models failed.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze resume with AI.");
  }
};

const chatWithAI = async (systemPrompt, conversationHistory, userMessage) => {
  try {
    const genAI = getGenAI();
    const modelNames = getModelNames();

    // Build the full prompt with system context, conversation history, and user message
    let fullPrompt = systemPrompt + "\n\n";

    // Add conversation history for context (last 10 exchanges)
    if (conversationHistory && conversationHistory.length > 0) {
      fullPrompt += "=== CONVERSATION HISTORY ===\n";
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        const role = msg.role === 'user' ? 'USER' : 'ASSISTANT';
        fullPrompt += `${role}: ${msg.content}\n\n`;
      }
      fullPrompt += "=== END CONVERSATION HISTORY ===\n\n";
    }

    fullPrompt += `USER'S CURRENT QUESTION: ${userMessage}\n\n`;
    fullPrompt += `You must respond ONLY with a valid JSON object following this exact structure:
{
  "answer": "Your detailed, well-structured answer here. Use **bold** for emphasis, bullet points with - for lists, and \\n for line breaks.",
  "suggestedQuestions": [
    "Relevant follow-up question 1",
    "Relevant follow-up question 2",
    "Relevant follow-up question 3"
  ]
}

IMPORTANT:
- Return ONLY valid JSON, no markdown code blocks, no extra text.
- The "answer" field should contain your complete response as a string.
- The "suggestedQuestions" should be 3 contextually relevant follow-up questions.
- Make your answer detailed, actionable, and well-organized.`;

    let lastError;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("AI did not return a valid JSON format.");
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Ensure required fields exist
        return {
          answer: parsed.answer || "I apologize, but I could not generate a proper response. Please try asking your question again.",
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions.slice(0, 3) : [
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
  } catch (error) {
    console.error("Chat AI Error:", error);
    throw new Error(error.message || "Failed to get AI response.");
  }
};

module.exports = { analyzeResumeWithAI, chatWithAI };
