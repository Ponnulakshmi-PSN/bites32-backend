const asyncHandler = require('express-async-handler');
const { sequelize, Order, OrderItem, Cart, CartItem, Restaurant } = require('../models');

// TEMPORARY: simulates order progression for demo/testing purposes.
// Timeouts are in-memory only — they're lost on server restart, and this
// is NOT tied to any real kitchen or delivery event. Remove this once a
// real status-update mechanism (admin panel, delivery partner app, etc.)
// exists — updateOrderStatus() below is the real endpoint for that.
const simulateOrderProgress = (orderId) => {
  const stages = [
    { status: 'preparing', delayMs: 15_000 },
    { status: 'out_for_delivery', delayMs: 45_000 },
    { status: 'delivered', delayMs: 90_000 },
  ];

  stages.forEach(({ status, delayMs }) => {
    setTimeout(async () => {
      try {
        const order = await Order.findByPk(orderId);
        // Don't override if it was cancelled in the meantime
        if (!order || order.status === 'cancelled') return;
        order.status = status;
        order.statusHistory = [...(order.statusHistory || []), { status, note: 'simulated', timestamp: new Date() }];
        if (status === 'delivered') order.deliveredAt = new Date();
        await order.save();
        console.log(`[simulated] Order ${orderId} -> ${status}`);
      } catch (err) {
        console.error(`[simulated] Failed to update order ${orderId}:`, err.message);
      }
    }, delayMs);
  });
};

// @desc    Place an order from the current cart (checkout_screen)
// @route   POST /api/orders
// @access  Private
const placeOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [{ model: CartItem, as: 'items' }],
  });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const extras = (item.selectedCustomizations || []).reduce((s, c) => s + (c.extraPrice || 0), 0);
    return sum + (item.price + extras) * item.quantity;
  }, 0);

  const deliveryFee = req.body.deliveryFee ?? 0;
  const tax = req.body.tax ?? Math.round(subtotal * 0.05 * 100) / 100;
  const discount = req.body.discount ?? 0;
  const total = subtotal + deliveryFee + tax - discount;

  const order = await sequelize.transaction(async (t) => {
    const newOrder = await Order.create(
      {
        userId: req.user.id,
        restaurantId: cart.restaurantId,
        deliveryAddress,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        paymentMethod,
        status: 'placed',
        statusHistory: [{ status: 'placed', timestamp: new Date() }],
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      cart.items.map((item) => ({
        orderId: newOrder.id,
        foodItemId: item.foodItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedCustomizations: item.selectedCustomizations,
        notes: item.notes,
      })),
      { transaction: t }
    );

    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
    cart.restaurantId = null;
    await cart.save({ transaction: t });

    return newOrder;
  });

  simulateOrderProgress(order.id); // TEMPORARY, see comment above

  const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });
  res.status(201).json({ success: true, order: fullOrder });
});

// @desc    Get logged-in user's orders (order history)
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [
      { model: Restaurant, attributes: ['id', 'name', 'imageUrl'] },
      { model: OrderItem, as: 'items' },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, count: orders.length, orders });
});

// @desc    Get single order (for order_tracking_screen, live polling)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: Restaurant, attributes: ['id', 'name', 'imageUrl', 'addressLine1', 'city'] },
      { model: OrderItem, as: 'items' },
    ],
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

// @desc    Update order status / rider location (used by restaurant/admin/rider)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Owner
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { status, note, riderLocation } = req.body;
  if (status) {
    order.status = status;
    order.statusHistory = [...(order.statusHistory || []), { status, note, timestamp: new Date() }];
    if (status === 'delivered') order.deliveredAt = new Date();
  }
  if (riderLocation) order.riderLocation = riderLocation;

  await order.save();
  res.json({ success: true, order });
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }
  if (['out_for_delivery', 'delivered'].includes(order.status)) {
    res.status(400);
    throw new Error('Order can no longer be cancelled');
  }

  order.status = 'cancelled';
  order.statusHistory = [...(order.statusHistory || []), { status: 'cancelled', note: req.body.reason, timestamp: new Date() }];
  await order.save();

  res.json({ success: true, order });
});

module.exports = { placeOrder, getMyOrders, getOrderById, updateOrderStatus, cancelOrder };