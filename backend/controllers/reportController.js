const mongoose = require('mongoose');
const Report = require('../models/Report');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .select('-resumeText')
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: "Failed to fetch reports." });
  }
};

const getReportById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid report ID format." });
    }
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }
    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: "Failed to fetch report." });
  }
};

const deleteReport = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid report ID format." });
    }
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ error: "Report not found." });
    }
    res.status(200).json({ message: "Report deleted successfully." });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: "Failed to delete report." });
  }
};

module.exports = { getAllReports, getReportById, deleteReport };
