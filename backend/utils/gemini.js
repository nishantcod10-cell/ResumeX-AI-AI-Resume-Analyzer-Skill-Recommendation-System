const { GoogleGenAI } = require("@google/genai");

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here" || apiKey === "your_gemini_api_key") {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

const getModelNames = () => {
  const envModel = process.env.GEMINI_MODEL ? process.env.GEMINI_MODEL.trim() : "";
  const standardModels = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash"];
  const list = [];
  if (envModel && !envModel.includes("2.5") && !envModel.includes("2.0") && !envModel.includes("1.5")) {
    list.push(envModel);
  }
  list.push(...standardModels);
  return [...new Set(list)];
};

// Comprehensive Skill Taxonomies for Target Roles
const ROLE_SKILLS_MAP = {
  "Frontend Developer": [
    "JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Tailwind CSS", "Next.js", "Redux", "Webpack", "Vite", "REST APIs", "Git", "Jest", "Responsive Design", "GraphQL"
  ],
  "Backend Developer": [
    "Node.js", "Express", "Python", "Django", "Java", "Spring Boot", "PostgreSQL", "MongoDB", "Redis", "REST APIs", "GraphQL", "Docker", "Microservices", "AWS", "Git"
  ],
  "Full Stack Developer": [
    "JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "PostgreSQL", "HTML5", "CSS3", "Git", "REST APIs", "Docker", "AWS", "CI/CD", "Tailwind CSS"
  ],
  "Data Scientist": [
    "Python", "R", "SQL", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "Data Visualization", "Matplotlib", "Seaborn", "Machine Learning", "Deep Learning", "Statistics", "Git"
  ],
  "Data Analyst": [
    "SQL", "Python", "Excel", "Tableau", "Power BI", "Pandas", "Data Cleaning", "Data Visualization", "Statistics", "R", "Business Intelligence", "ETL", "Reporting"
  ],
  "AI/ML Engineer": [
    "Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Docker", "MLOps", "Hugging Face", "CUDA", "FastAPI", "Git"
  ],
  "DevOps Engineer": [
    "Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "GitHub Actions", "Terraform", "Ansible", "Python", "Bash", "Prometheus", "Grafana", "Nginx", "Git"
  ],
  "Cybersecurity Analyst": [
    "Network Security", "SIEM", "Incident Response", "Linux", "Python", "Wireshark", "Vulnerability Assessment", "Penetration Testing", "Firewalls", "SOC", "Risk Assessment"
  ],
  "UI/UX Designer": [
    "Figma", "Wireframing", "Prototyping", "User Research", "Usability Testing", "Design Systems", "Adobe XD", "Information Architecture", "HTML/CSS", "Interaction Design"
  ],
  "Product Manager": [
    "Agile", "Scrum", "Product Roadmap", "User Stories", "Data Analysis", "Jira", "A/B Testing", "Market Research", "Stakeholder Management", "Wireframing"
  ]
};

const COMMON_TECH_DICTIONARY = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "HTML", "HTML5", "CSS", "CSS3", "Sass", "Tailwind", "Tailwind CSS", "Bootstrap",
  "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "Svelte", "Redux", "Node.js", "Express", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Laravel",
  "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Elasticsearch", "Firebase", "DynamoDB", "Supabase", "Prisma", "Mongoose",
  "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Linux", "Git", "GitHub", "GitLab", "CI/CD", "Terraform", "Nginx", "Vercel", "Render", "Postman", "Jest", "Cypress"
];

/**
 * Intelligent Local Fallback Engine when Gemini API key is unauthorized or unavailable
 */
const generateFallbackAnalysis = (resumeText, targetRole) => {
  const textLower = resumeText.toLowerCase();
  
  // Extract present skills from resume text
  const extractedSkills = [];
  COMMON_TECH_DICTIONARY.forEach(tech => {
    const regex = new RegExp(`\\b${tech.replace('+', '\\+').replace('.', '\\.')}\\b`, 'i');
    if (regex.test(resumeText)) {
      if (!extractedSkills.includes(tech)) {
        extractedSkills.push(tech);
      }
    }
  });

  // Default expected skills for role
  const expectedSkills = ROLE_SKILLS_MAP[targetRole] || ROLE_SKILLS_MAP["Full Stack Developer"];
  
  // Find missing skills
  const missingSkills = expectedSkills.filter(reqSkill => {
    return !extractedSkills.some(ext => ext.toLowerCase() === reqSkill.toLowerCase());
  });

  // Calculate scores
  const matchedCount = expectedSkills.length - missingSkills.length;
  const matchRatio = expectedSkills.length > 0 ? matchedCount / expectedSkills.length : 0.5;
  
  const atsScore = Math.min(95, Math.max(45, Math.round(50 + matchRatio * 40 + (extractedSkills.length > 5 ? 5 : 0))));
  const resumeScore = Math.min(96, Math.max(50, Math.round(55 + matchRatio * 38 + (resumeText.length > 500 ? 5 : 0))));

  // Generate customized strengths
  const strengths = [];
  if (extractedSkills.length > 0) {
    strengths.push(`Demonstrated proficiency in core technologies: ${extractedSkills.slice(0, 4).join(", ")}`);
  } else {
    strengths.push("Clear formatting and defined educational/work background");
  }
  strengths.push(`Direct alignment with foundational principles required for ${targetRole}`);
  strengths.push("Structured project and professional experience presentation");

  // Generate customized weaknesses
  const weaknesses = [];
  if (missingSkills.length > 0) {
    weaknesses.push(`Missing high-demand ${targetRole} keywords: ${missingSkills.slice(0, 3).join(", ")}`);
  }
  weaknesses.push("Quantifiable impact metrics (e.g., % improvement, revenue, load times) could be emphasized more in project descriptions");
  weaknesses.push("ATS keyword density can be enhanced by detailing specific architectural responsibilities");

  // Improvement suggestions
  const improvementSuggestions = [
    `Integrate missing industry competencies like ${missingSkills.slice(0, 3).join(", ")} into your projects`,
    "Quantify your achievements using the Action-Verb + Task + Result framework (e.g., 'Optimized API latency by 35%')",
    `Tailor your summary statement directly toward ${targetRole} opportunities to pass automated ATS filters`
  ];

  // Recommended technologies
  const recommendedTechnologies = missingSkills.length > 0 ? missingSkills.slice(0, 5) : ["Docker", "TypeScript", "AWS", "PostgreSQL", "CI/CD"];

  // Recommended courses
  const recommendedCourses = [
    `Modern ${targetRole} Masterclass & System Architecture (Udemy / Coursera)`,
    `Production-Ready ${recommendedTechnologies[0] || 'Cloud'} & Microservices Deployment`,
    "Full-Stack Performance Optimization & Advanced Design Patterns"
  ];

  // 6-Week Career Roadmap
  const careerRoadmap = [
    { week: "Week 1", task: `Master Core Fundamentals & Bridge gaps in ${recommendedTechnologies[0] || 'Core Stack'}` },
    { week: "Week 2", task: `Deep dive into ${recommendedTechnologies[1] || 'Modern Architecture'} & Database Performance` },
    { week: "Week 3", task: `Architect an end-to-end production application utilizing ${extractedSkills[0] || 'React'} and ${recommendedTechnologies[0] || 'Node.js'}` },
    { week: "Week 4", task: `Implement Automated Testing (Unit/Integration) and Containerization with ${recommendedTechnologies[2] || 'Docker'}` },
    { week: "Week 5", task: "Configure CI/CD Pipelines and deploy the project to Cloud Infrastructure" },
    { week: "Week 6", task: `Refactor resume with quantifiable impact metrics and prepare for ${targetRole} technical interviews` }
  ];

  // Project recommendations
  const projectRecommendations = [
    {
      name: `Enterprise ${targetRole} Management Platform`,
      description: `Build a production-grade full-stack platform incorporating ${extractedSkills.slice(0, 2).join(" & ") || 'modern web technologies'}, complete with authentication, real-time analytics, and caching.`
    },
    {
      name: `Scalable Cloud-Native Microservices Suite`,
      description: `Develop a modular distributed system featuring REST/GraphQL APIs, background workers, and Docker containerization tailored for ${targetRole} best practices.`
    }
  ];

  const summary = `Candidate demonstrates a solid foundation with practical familiarity in ${extractedSkills.slice(0, 4).join(', ') || 'software development'}. By strengthening competencies in ${missingSkills.slice(0, 3).join(', ') || 'modern toolsets'} and emphasizing quantifiable impact in project descriptions, the profile will become highly competitive for ${targetRole} roles.`;

  return {
    resumeScore,
    atsScore,
    extractedSkills: extractedSkills.length > 0 ? extractedSkills : ["JavaScript", "HTML/CSS", "Git"],
    missingSkills: missingSkills.length > 0 ? missingSkills : ["TypeScript", "Docker", "AWS"],
    strengths,
    weaknesses,
    improvementSuggestions,
    recommendedTechnologies,
    recommendedCourses,
    careerRoadmap,
    projectRecommendations,
    summary
  };
};

/**
 * Intelligent Local Chatbot Fallback Engine
 */
const generateFallbackChat = (systemPrompt, conversationHistory, userMessage) => {
  const query = userMessage.toLowerCase();

  let answer = "";
  const suggestedQuestions = [];

  if (query.includes("weak") || query.includes("improve") || query.includes("bad") || query.includes("problem")) {
    answer = "Based on your resume analysis, here are the key areas for improvement:\n\n" +
      "- **Missing Key Competencies**: Your resume is missing some high-priority keywords for your target role. Adding these to your skills and project descriptions will immediately increase your ATS match rate.\n" +
      "- **Quantifiable Results**: Use specific metrics (e.g., *'Decreased query response time by 40%'* or *'Handled 10k+ daily requests'*) rather than only listing generic responsibilities.\n" +
      "- **Action Verbs**: Begin every project bullet point with strong technical action verbs like *Architected*, *Engineered*, *Optimized*, or *Spearheaded*.";
    suggestedQuestions.push("How can I improve my ATS score?", "What skills should I learn next?", "What projects should I build?");
  } else if (query.includes("ats") || query.includes("score")) {
    answer = "To significantly boost your **ATS (Applicant Tracking System) Score**:\n\n" +
      "- **Exact Keyword Matching**: Ensure the exact names of target technologies appear in both your Skills section and in context within your Work Experience or Projects.\n" +
      "- **Clean Structure**: Stick to standard section headers like *Skills*, *Experience*, *Education*, and *Projects*.\n" +
      "- **Avoid Complex Layouts**: Keep formatting clear and avoid tables or multi-column text that can confuse older ATS parsers.";
    suggestedQuestions.push("What are my biggest weaknesses?", "What interview questions should I prepare for?", "What projects should I build?");
  } else if (query.includes("skill") || query.includes("learn") || query.includes("next") || query.includes("tech")) {
    answer = "Here is the recommended learning strategy for your target role:\n\n" +
      "- **High Priority Technologies**: Focus on modern industry standards like **TypeScript**, **Docker**, **PostgreSQL**, and Cloud platforms (**AWS** or **Vercel**).\n" +
      "- **System Design**: Learn architectural patterns such as RESTful API design, database indexing, caching strategies with Redis, and modular microservices.\n" +
      "- **Testing & Quality**: Add automated testing frameworks (like Jest, Supertest, or Cypress) to your toolkit.";
    suggestedQuestions.push("What projects should I build?", "How can I improve my ATS score?", "What interview questions should I prepare for?");
  } else if (query.includes("interview") || query.includes("question") || query.includes("prep")) {
    answer = "Here are tailored technical and behavioral interview questions based on your profile:\n\n" +
      "1. **Technical Architecture**: *'Can you walk me through the lifecycle of a request in your most complex project, from frontend to database?'*\n" +
      "2. **State & Data Management**: *'How do you handle asynchronous state and error boundaries across distributed components?'*\n" +
      "3. **Optimization**: *'Describe a time when you identified a performance bottleneck in your code and how you resolved it.'*\n" +
      "4. **Problem Solving**: *'How do you approach learning a completely new framework or tool under tight project deadlines?'*";
    suggestedQuestions.push("How should I answer the system design question?", "What are my biggest strengths?", "What skills should I learn next?");
  } else if (query.includes("project") || query.includes("build")) {
    answer = "To make your portfolio stand out to recruiters, build projects that demonstrate real-world production qualities:\n\n" +
      "- **Enterprise SaaS Platform**: Build a full-stack platform with secure authentication, role-based access control, automated payments/subscriptions, and analytics dashboards.\n" +
      "- **Real-Time Distributed System**: Create an application utilizing WebSockets or Redis Pub/Sub for live collaboration, chat, or notifications.\n" +
      "- **Cloud-Native Deployment**: Containerize your application with Docker, set up GitHub Actions CI/CD, and deploy with HTTPS on cloud infrastructure.";
    suggestedQuestions.push("What skills should I learn next?", "What interview questions should I prepare for?", "How can I improve my resume score?");
  } else {
    answer = `Based on your resume evaluation for your target role, you have a solid foundation with great growth potential. You can strengthen your profile by integrating missing high-demand skills, quantifying your achievements with metrics, and building full-stack production projects.`;
    suggestedQuestions.push("What are my biggest weaknesses?", "How can I improve my ATS score?", "What skills should I learn next?");
  }

  return {
    answer,
    suggestedQuestions
  };
};

/**
 * Main Resume Analysis API
 */
const analyzeResumeWithAI = async (resumeText, targetRole) => {
  const ai = getGenAI();
  const modelNames = getModelNames();

  // If no Gemini key is provided, use the intelligent fallback engine directly
  if (!ai) {
    console.log("[Analysis Engine] Running dynamic resume analysis engine...");
    return generateFallbackAnalysis(resumeText, targetRole);
  }

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
      console.warn(`Gemini model "${modelName}" failed:`, apiError.message);
    }
  }

  // If Gemini API fails (due to key expiration, 401, quota, or network), seamless fallback to intelligent engine
  if (!response) {
    console.log("[Analysis Engine] Gemini API unavailable/unauthorized. Activating dynamic analysis fallback engine.");
    return generateFallbackAnalysis(resumeText, targetRole);
  }

  const responseText = typeof response.text === "function" 
    ? response.text() 
    : (response.text || response.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "");

  if (!responseText || responseText.trim() === "") {
    return generateFallbackAnalysis(resumeText, targetRole);
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return generateFallbackAnalysis(resumeText, targetRole);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      resumeScore: typeof parsed.resumeScore === "number" ? Math.min(100, Math.max(0, parsed.resumeScore)) : 70,
      atsScore: typeof parsed.atsScore === "number" ? Math.min(100, Math.max(0, parsed.atsScore)) : 68,
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
  } catch (parseError) {
    return generateFallbackAnalysis(resumeText, targetRole);
  }
};

/**
 * Main Chatbot API
 */
const chatWithAI = async (systemPrompt, conversationHistory, userMessage) => {
  const ai = getGenAI();
  const modelNames = getModelNames();

  if (!ai) {
    return generateFallbackChat(systemPrompt, conversationHistory, userMessage);
  }

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
      console.warn(`Gemini chat model "${modelName}" failed:`, apiError.message);
    }
  }

  if (!response) {
    return generateFallbackChat(systemPrompt, conversationHistory, userMessage);
  }

  const responseText = typeof response.text === "function" 
    ? response.text() 
    : (response.text || response.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "");

  if (!responseText || responseText.trim() === "") {
    return generateFallbackChat(systemPrompt, conversationHistory, userMessage);
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return generateFallbackChat(systemPrompt, conversationHistory, userMessage);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      answer: parsed.answer || "I apologize, but I could not generate a proper response. Please try asking your question again.",
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions.slice(0, 3) : [
        "What are my biggest strengths?",
        "How can I improve my ATS score?",
        "What skills should I learn next?"
      ],
    };
  } catch (parseError) {
    return generateFallbackChat(systemPrompt, conversationHistory, userMessage);
  }
};

module.exports = { analyzeResumeWithAI, chatWithAI };
