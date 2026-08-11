const express = require('express');

const {
  getMyNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get logged-in user's notifications
router.get('/', protect, getMyNotifications);

// Get unread notification count
router.get('/unread-count', protect, getUnreadNotificationCount);

// Mark all notifications as read
// Must come before /:id/read
router.put('/read-all', protect, markAllAsRead);

// Mark single notification as read
router.put('/:id/read', protect, markAsRead);

// Delete single notification
router.delete('/:id', protect, deleteNotification);

module.exports = router;