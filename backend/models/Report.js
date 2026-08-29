const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  targetRole: { type: String, required: true },
  resumeText: { type: String },
  resumeScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  extractedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  improvementSuggestions: [{ type: String }],
  recommendedTechnologies: [{ type: String }],
  recommendedCourses: [{ type: String }],
  careerRoadmap: [
    {
      week: String,
      task: String
    }
  ],
  projectRecommendations: [
    {
      name: String,
      description: String
    }
  ],
  summary: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
