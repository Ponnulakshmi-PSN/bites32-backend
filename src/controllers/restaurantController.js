const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Restaurant, FoodItem } = require('../models');

// @desc    List restaurants (search, filter by cuisine, sort, paginate)
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
  const { search, cuisine, isFeatured, page = 1, limit = 20, sort = 'rating' } = req.query;

  const where = {};
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  if (cuisine) where.cuisineTypes = { [Op.contains]: [cuisine] };
  if (isFeatured) where.isFeatured = isFeatured === 'true';

  const order = sort.startsWith('-') ? [[sort.slice(1), 'DESC']] : [[sort, 'ASC']];

  const { rows: restaurants, count: total } = await Restaurant.findAndCountAll({
    where,
    order,
    offset: (Number(page) - 1) * Number(limit),
    limit: Number(limit),
  });

  res.json({
    success: true,
    count: restaurants.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    restaurants,
  });
});

// @desc    Get single restaurant + its menu
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  const menu = await FoodItem.findAll({ where: { restaurantId: restaurant.id, isAvailable: true } });

  res.json({ success: true, restaurant, menu });
});

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private/Admin/Owner
const createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.create({ ...req.body, ownerId: req.user.id });
  res.status(201).json({ success: true, restaurant });
});

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin/Owner
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }
  await restaurant.update(req.body);
  res.json({ success: true, restaurant });
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }
  await restaurant.destroy();
  res.json({ success: true, message: 'Restaurant removed' });
});

module.exports = { getRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant };
