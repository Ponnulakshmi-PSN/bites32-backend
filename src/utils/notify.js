const { Notification } = require('../models');

const notifyUser = async ({ userId, type, title, message, referenceId }) => {
  try {
    await Notification.create({ userId, type, title, message, referenceId });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

const notifyAllUsers = async ({ type, title, message, referenceId }) => {
  const { User } = require('../models');
  try {
    const users = await User.findAll({ attributes: ['id'] });
    await Notification.bulkCreate(
      users.map((u) => ({ userId: u.id, type, title, message, referenceId }))
    );
  } catch (err) {
    console.error('Failed to broadcast notification:', err.message);
  }
};

module.exports = { notifyUser, notifyAllUsers };