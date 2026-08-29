const express = require('express');
const { getAllReports, getReportById, deleteReport } = require('../controllers/reportController');

const router = express.Router();

router.get('/', getAllReports);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

module.exports = router;
