const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CouponRedemption = sequelize.define(
  'CouponRedemption',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    couponId: { type: DataTypes.UUID, allowNull: false },
    orderId: { type: DataTypes.UUID },
  },
  { tableName: 'coupon_redemptions' }
);

module.exports = CouponRedemption;