const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Coupon = sequelize.define(
  'Coupon',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING, defaultValue: '' },
    discountType: { type: DataTypes.ENUM('percentage', 'flat'), allowNull: false },
    discountValue: { type: DataTypes.FLOAT, allowNull: false },
    minOrderAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    maxDiscountAmount: { type: DataTypes.FLOAT }, // caps a percentage discount, optional
    usageLimit: { type: DataTypes.INTEGER }, // total redemptions allowed, null = unlimited
    usageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    perUserLimit: { type: DataTypes.INTEGER, defaultValue: 1 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    expiresAt: { type: DataTypes.DATE },
  },
  { tableName: 'coupons' }
);

module.exports = Coupon;