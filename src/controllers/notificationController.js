const asyncHandler = require('express-async-handler');
const { Notification } = require('../models');

// @desc    Get logged-in user's notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.findAll({
    where: {
      userId: req.user.id,
    },
    order: [['created_at', 'DESC']],
    limit: 100,
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const count = await Notification.count({
    where: {
      userId: req.user.id,
      isRead: false,
    },
  });

  res.status(200).json({
    success: true,
    count,
  });
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const [updatedCount] = await Notification.update(
    {
      isRead: true,
    },
    {
      where: {
        userId: req.user.id,
        isRead: false,
      },
    }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    updatedCount,
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const deletedCount = await Notification.destroy({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (deletedCount === 0) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
  });
});

module.exports = {
  getMyNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};