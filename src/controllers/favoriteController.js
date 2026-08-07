const asyncHandler = require('express-async-handler');
const { Favorite, Restaurant } = require('../models');

// @desc    Get logged-in user's favorite restaurants
// @route   GET /api/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.findAll({
    where: { userId: req.user.id },
    include: [{ model: Restaurant, as: 'restaurant' }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, favorites });
});

// @desc  Add a restaurant to favorites
// @route   POST /api/favorites
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const { restaurantId } = req.body;
  if (!restaurantId) {
    res.status(400);
    throw new Error('restaurantId is required');
  }

  const existing = await Favorite.findOne({ where: { userId: req.user.id, restaurantId } });
  if (existing) {
    res.status(200).json({ success: true, message: 'Already favorited' });
    return;
  }

  await Favorite.create({ userId: req.user.id, restaurantId });
  res.status(201).json({ success: true, message: 'Added to favorites' });
});

// @desc    Remove a restaurant from favorites
// @route   DELETE /api/favorites/:restaurantId
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.destroy({ where: { userId: req.user.id, restaurantId: req.params.restaurantId } });
  res.json({ success: true, message: 'Removed from favorites' });
});

module.exports = { getFavorites, addFavorite, removeFavorite };