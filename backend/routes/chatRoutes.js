const express = require('express');
const { sendMessage } = require('../controllers/chatController');

const router = express.Router();

router.post('/:reportId', sendMessage);

module.exports = router;
