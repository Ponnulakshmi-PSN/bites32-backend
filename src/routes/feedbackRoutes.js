const express = require('express');
const { createFeedback, getFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getFeedback);
router.post('/', protect, createFeedback);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
