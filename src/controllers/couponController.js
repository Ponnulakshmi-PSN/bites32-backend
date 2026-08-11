const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Coupon, CouponRedemption } = require('../models');

// @desc    List currently active, non-expired coupons (for offers screen)
// @route   GET /api/coupons
// @access  Public
const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.findAll({
    where: {
      isActive: true,
      [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
    },
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, coupons });
});

// @desc    Validate a coupon code against the current cart subtotal
// @route   POST /api/coupons/validate
// @access  Private
// @body    { code, subtotal }
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code || subtotal === undefined) {
    res.status(400);
    throw new Error('code and subtotal are required');
  }

  const coupon = await Coupon.findOne({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) {
    res.status(404);
    throw new Error('Invalid or inactive coupon code');
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    res.status(400);
    throw new Error('This coupon has expired');
  }
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('This coupon has reached its usage limit');
  }
  if (subtotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`);
  }

  const userRedemptions = await CouponRedemption.count({
    where: { userId: req.user.id, couponId: coupon.id },
  });
  if (userRedemptions >= coupon.perUserLimit) {
    res.status(400);
    throw new Error("You've already used this coupon the maximum number of times");
  }

  let discount = coupon.discountType === 'percentage'
    ? (subtotal * coupon.discountValue) / 100
    : coupon.discountValue;

  if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
    discount = coupon.maxDiscountAmount;
  }
  discount = Math.min(discount, subtotal); // never discount more than the order itself

  res.json({
    success: true,
    coupon: { id: coupon.id, code: coupon.code, description: coupon.description },
    discount: Math.round(discount * 100) / 100,
  });
});

module.exports = { getActiveCoupons, validateCoupon };