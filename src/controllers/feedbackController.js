const asyncHandler = require('express-async-handler');
const { Feedback, Restaurant, FoodItem, User } = require('../models');

// Recalculates and stores the average rating on a Restaurant or FoodItem
const recalcRating = async (Model, whereKey, id) => {
  const stats = await Feedback.findAll({
    where: { [whereKey]: id },
    attributes: [
      [Feedback.sequelize.fn('AVG', Feedback.sequelize.col('rating')), 'avgRating'],
      [Feedback.sequelize.fn('COUNT', Feedback.sequelize.col('id')), 'count'],
    ],
    raw: true,
  });

  const avgRating = Number(stats[0]?.avgRating) || 0;
  const count = Number(stats[0]?.count) || 0;

  await Model.update(
    { rating: Math.round(avgRating * 10) / 10, ratingCount: count },
    { where: { id } }
  );
};

// @desc    Submit feedback for a restaurant/food item/order
// @route   POST /api/feedback
// @access  Private
const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create({
    userId: req.user.id,
    ...req.body,
  });

  const fullFeedback = await Feedback.findByPk(feedback.id, {
    include: [{ model: User, attributes: ['id', 'name'] }],
  });

  res.status(201).json({ success: true, feedback: fullFeedback });
});

// @desc    Get feedback for a restaurant or food item
// @route   GET /api/feedback?restaurantId=&foodItemId=
// @access  Public
const getFeedback = asyncHandler(async (req, res) => {
  const { restaurantId, foodItemId } = req.query;
  const where = {};
  if (restaurantId) where.restaurantId = restaurantId;
  if (foodItemId) where.foodItemId = foodItemId;

  const feedback = await Feedback.findAll({
    where,
    include: [{ model: User, attributes: ['id', 'name'] }], // only expose id + name, not password/email etc.
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, feedback });
});

// @desc    Delete own feedback
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByPk(req.params.id);
  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }
  if (feedback.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this feedback');
  }

  const { restaurantId, foodItemId } = feedback;
  await feedback.destroy();

  if (restaurantId) await recalcRating(Restaurant, 'restaurantId', restaurantId);
  if (foodItemId) await recalcRating(FoodItem, 'foodItemId', foodItemId);

  res.json({ success: true, message: 'Feedback removed' });
});

const getMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findAll({
    where: { userId: req.user.id },
    include: [Restaurant, FoodItem], // default alias = model name (Restaurant / FoodItem)
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, feedback });
});

module.exports = { createFeedback, getFeedback, deleteFeedback,getMyFeedback };
