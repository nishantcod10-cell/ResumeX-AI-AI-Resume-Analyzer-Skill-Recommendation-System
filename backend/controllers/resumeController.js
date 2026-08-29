const pdfParse = require('pdf-parse');
const Report = require('../models/Report');
const { analyzeResumeWithAI } = require('../utils/gemini');

const analyzeResume = async (req, res) => {
  try {
    const { name, email, targetRole, textResume } = req.body;
    let resumeText = textResume || "";

    if (!name || !email || !targetRole) {
      return res.status(400).json({ error: "Name, email, and target role are required." });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    if (req.file) {
      // Parse PDF with isolated error handling
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return res.status(400).json({
          error: "Failed to parse the PDF file. Please ensure it is a valid, text-based PDF (scanned/image PDFs are not supported)."
        });
      }
    }

    if (!resumeText || resumeText.trim() === "") {
      return res.status(400).json({ error: "Please upload a valid PDF or provide text resume." });
    }

    // Call Gemini API
    const analysisResult = await analyzeResumeWithAI(resumeText, targetRole);

    // Create Report
    const newReport = new Report({
      name,
      email,
      targetRole,
      resumeText,
      ...analysisResult
    });

    const savedReport = await newReport.save();

    res.status(201).json({
      message: "Analysis complete",
      reportId: savedReport._id,
      analysis: savedReport
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume. Please try again." });
  }
};

module.exports = { analyzeResume };
