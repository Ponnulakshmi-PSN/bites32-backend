const asyncHandler = require('express-async-handler');
const { Cart, CartItem, FoodItem, Restaurant } = require('../models');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({
    where: { userId },
    include: [
      { model: CartItem, as: 'items', include: [{ model: FoodItem, as: 'foodItem' }] },
      Restaurant,
    ],
  });
  if (!cart) cart = await Cart.create({ userId });
  return cart;
};

// @desc    Get logged-in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  res.json({ success: true, cart });
});

// @desc    Add item to cart (clears cart first if switching restaurants)
// @route   POST /api/cart/items
// @access  Private
const addItemToCart = asyncHandler(async (req, res) => {
  const { foodItemId, quantity = 1, selectedCustomizations = [], notes = '' } = req.body;

  const foodItem = await FoodItem.findByPk(foodItemId);
  if (!foodItem) {
    res.status(404);
    throw new Error('Food item not found');
  }

  let cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart) {
    cart = await Cart.create({ userId: req.user.id, restaurantId: foodItem.restaurantId });
  } else if (cart.restaurantId && cart.restaurantId !== foodItem.restaurantId) {
    // Switching restaurants — reset cart
    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.restaurantId = foodItem.restaurantId;
    await cart.save();
  } else if (!cart.restaurantId) {
    cart.restaurantId = foodItem.restaurantId;
    await cart.save();
  }

  await CartItem.create({
    cartId: cart.id,
    foodItemId: foodItem.id,
    name: foodItem.name,
    price: foodItem.discountPrice || foodItem.price,
    quantity,
    selectedCustomizations,
    notes,
  });

  const fullCart = await getOrCreateCart(req.user.id);
  res.status(201).json({ success: true, cart: fullCart });
});

// @desc    Update quantity/notes of a cart item
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } });
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
  if (req.body.notes !== undefined) item.notes = req.body.notes;
  await item.save();

  const fullCart = await getOrCreateCart(req.user.id);
  res.json({ success: true, cart: fullCart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ where: { userId: req.user.id }, include: [{ model: CartItem, as: 'items' }] });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  await CartItem.destroy({ where: { id: req.params.itemId, cartId: cart.id } });

  const remaining = await CartItem.count({ where: { cartId: cart.id } });
  if (remaining === 0) {
    cart.restaurantId = null;
    await cart.save();
  }

  const fullCart = await getOrCreateCart(req.user.id);
  res.json({ success: true, cart: fullCart });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.restaurantId = null;
    await cart.save();
  }
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addItemToCart, updateCartItem, removeCartItem, clearCart };
