const { GoogleGenAI } = require("@google/genai");

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here" || apiKey === "your_gemini_api_key") {
    throw new Error("GEMINI_API_KEY is missing or unconfigured. Please set a valid Gemini API key in your environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

const getModelNames = () => {
  const envModel = process.env.GEMINI_MODEL ? process.env.GEMINI_MODEL.trim() : "";
  const standardModels = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash"];
  
  // If env model is specified and not in list, try it first, then fallbacks
  const list = [];
  if (envModel && !envModel.includes("2.5") && !envModel.includes("2.0") && !envModel.includes("1.5")) {
    list.push(envModel);
  }
  list.push(...standardModels);
  
  // Deduplicate
  return [...new Set(list)];
};

/**
 * Analyze resume text against a target role using Google GenAI SDK
 */
const analyzeResumeWithAI = async (resumeText, targetRole) => {
  try {
    const ai = getGenAI();
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
      - Do not wrap the response in markdown code blocks like \`\`\`json or \`\`\`.
      - Do not add explanation text outside the JSON.
      - Return only valid, parseable JSON.
    `;

    let response;
    let lastError;

    for (const modelName of modelNames) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });
        if (response) break;
      } catch (apiError) {
        lastError = apiError;
        console.warn(`Gemini model "${modelName}" failed:`, apiError.message);
        
        const errMsg = apiError.message || "";
        if (
          apiError.status === 400 && errMsg.includes("API_KEY_INVALID") ||
          apiError.status === 401 ||
          errMsg.includes("401") ||
          errMsg.includes("API key not valid") ||
          errMsg.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED")
        ) {
          throw new Error("Invalid or unauthorized Gemini API key. Please check that GEMINI_API_KEY in your environment configuration is correct and active.");
        }
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to communicate with Gemini AI API.");
    }

    const responseText = typeof response.text === "function" 
      ? response.text() 
      : (response.text || response.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "");

    if (!responseText || responseText.trim() === "") {
      throw new Error("Gemini AI returned an empty response. Please try again.");
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return a valid JSON format.");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error from Gemini response:", responseText);
      throw new Error("Failed to parse AI analysis response. Please try again.");
    }

    // Sanitize and ensure consistent data structure
    return {
      resumeScore: typeof parsed.resumeScore === "number" ? Math.min(100, Math.max(0, parsed.resumeScore)) : 0,
      atsScore: typeof parsed.atsScore === "number" ? Math.min(100, Math.max(0, parsed.atsScore)) : 0,
      extractedSkills: Array.isArray(parsed.extractedSkills) ? parsed.extractedSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      improvementSuggestions: Array.isArray(parsed.improvementSuggestions) ? parsed.improvementSuggestions : [],
      recommendedTechnologies: Array.isArray(parsed.recommendedTechnologies) ? parsed.recommendedTechnologies : [],
      recommendedCourses: Array.isArray(parsed.recommendedCourses) ? parsed.recommendedCourses : [],
      careerRoadmap: Array.isArray(parsed.careerRoadmap) ? parsed.careerRoadmap : [],
      projectRecommendations: Array.isArray(parsed.projectRecommendations) ? parsed.projectRecommendations : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    };

  } catch (error) {
    console.error("Analysis Process Error:", error);
    throw error;
  }
};

/**
 * Chat with AI using conversation context and full resume background
 */
const chatWithAI = async (systemPrompt, conversationHistory, userMessage) => {
  try {
    const ai = getGenAI();
    const modelNames = getModelNames();

    let fullPrompt = systemPrompt + "\n\n";

    if (conversationHistory && conversationHistory.length > 0) {
      fullPrompt += "=== CONVERSATION HISTORY ===\n";
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        const role = msg.role === "user" ? "USER" : "ASSISTANT";
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

    let response;
    let lastError;

    for (const modelName of modelNames) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            responseMimeType: "application/json",
          },
        });
        if (response) break;
      } catch (apiError) {
        lastError = apiError;
        console.warn(`Gemini chat model "${modelName}" failed:`, apiError.message);

        const errMsg = apiError.message || "";
        if (
          apiError.status === 400 && errMsg.includes("API_KEY_INVALID") ||
          apiError.status === 401 ||
          errMsg.includes("401") ||
          errMsg.includes("API key not valid") ||
          errMsg.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED")
        ) {
          throw new Error("Invalid or unauthorized Gemini API key. Please check your GEMINI_API_KEY in environment variables.");
        }
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to communicate with Gemini AI.");
    }

    const responseText = typeof response.text === "function" 
      ? response.text() 
      : (response.text || response.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "");

    if (!responseText || responseText.trim() === "") {
      throw new Error("Gemini AI returned an empty response.");
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return a valid JSON format.");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error from Gemini chat response:", responseText);
      throw new Error("Failed to parse AI response. Please try asking again.");
    }

    return {
      answer: parsed.answer || "I apologize, but I could not generate a proper response. Please try asking your question again.",
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions.slice(0, 3) : [
        "What are my biggest strengths?",
        "How can I improve my ATS score?",
        "What skills should I learn next?"
      ],
    };

  } catch (error) {
    console.error("Chat Process Error:", error);
    throw error;
  }
};

module.exports = { analyzeResumeWithAI, chatWithAI };
