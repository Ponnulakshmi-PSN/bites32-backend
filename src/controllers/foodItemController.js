const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { FoodItem, Restaurant } = require('../models');

// @desc    List food items (optionally filter by restaurant/category/search)
// @route   GET /api/food-items
// @access  Public
const getFoodItems = asyncHandler(async (req, res) => {
  const { restaurant, category, search, isPopular, page = 1, limit = 30 } = req.query;

  const where = {};
  if (restaurant) where.restaurantId = restaurant;
  if (category) where.category = category;
  if (isPopular) where.isPopular = isPopular === 'true';
  if (search) where.name = { [Op.iLike]: `%${search}%` };

  const { rows: foodItems, count: total } = await FoodItem.findAndCountAll({
    where,
    offset: (Number(page) - 1) * Number(limit),
    limit: Number(limit),
  });

  res.json({ success: true, count: foodItems.length, total, foodItems });
});

// @desc    Get single food item
// @route   GET /api/food-items/:id
// @access  Public
const getFoodItemById = asyncHandler(async (req, res) => {
  const item = await FoodItem.findByPk(req.params.id, {
    include: [{ model: Restaurant, attributes: ['id', 'name', 'imageUrl', 'rating'] }],
  });
  if (!item) {
    res.status(404);
    throw new Error('Food item not found');
  }
  res.json({ success: true, foodItem: item });
});

// @desc    Create food item
// @route   POST /api/food-items
// @access  Private/Admin/Owner
const createFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.create(req.body);
  res.status(201).json({ success: true, foodItem: item });
});

// @desc    Update food item
// @route   PUT /api/food-items/:id
// @access  Private/Admin/Owner
const updateFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.findByPk(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Food item not found');
  }
  await item.update(req.body);
  res.json({ success: true, foodItem: item });
});

// @desc    Delete food item
// @route   DELETE /api/food-items/:id
// @access  Private/Admin/Owner
const deleteFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.findByPk(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Food item not found');
  }
  await item.destroy();
  res.json({ success: true, message: 'Food item removed' });
});

module.exports = { getFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem };
