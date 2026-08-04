const asyncHandler = require('express-async-handler');
const { User, Address } = require('../models');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password, phone });

  res.status(201).json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    token: generateToken(user.id),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    token: generateToken(user.id),
  });
});

// @desc    Get logged-in user's profile (with addresses)
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, { include: [{ model: Address }] });
  res.json({ success: true, user });
});

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name ?? user.name;
  user.phone = req.body.phone ?? user.phone;
  user.avatarUrl = req.body.avatarUrl ?? user.avatarUrl;
  if (req.body.password) user.password = req.body.password;

  await user.save();
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl },
  });
});

// @desc    Add an address
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const address = await Address.create({ ...req.body, userId: req.user.id });
  const addresses = await Address.findAll({ where: { userId: req.user.id } });
  res.status(201).json({ success: true, address, addresses });
});

// @desc    Delete an address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ where: { id: req.params.addressId, userId: req.user.id } });
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }
  await address.destroy();
  const addresses = await Address.findAll({ where: { userId: req.user.id } });
  res.json({ success: true, addresses });
});

module.exports = { registerUser, loginUser, getProfile, updateProfile, addAddress, deleteAddress };
