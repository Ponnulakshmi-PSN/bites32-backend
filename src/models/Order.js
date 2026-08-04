const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    // Snapshot of delivery address at order time
    deliveryAddress: { type: DataTypes.JSONB, defaultValue: {} },
    subtotal: { type: DataTypes.FLOAT, allowNull: false },
    deliveryFee: { type: DataTypes.FLOAT, defaultValue: 0 },
    tax: { type: DataTypes.FLOAT, defaultValue: 0 },
    discount: { type: DataTypes.FLOAT, defaultValue: 0 },
    total: { type: DataTypes.FLOAT, allowNull: false },
    paymentMethod: {
      type: DataTypes.ENUM('card', 'cash', 'wallet', 'upi'),
      defaultValue: 'cash',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    status: {
      type: DataTypes.ENUM('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
      defaultValue: 'placed',
    },
    // [{ status, timestamp, note }]
    statusHistory: { type: DataTypes.JSONB, defaultValue: [] },
    estimatedDeliveryTime: DataTypes.DATE,
    deliveredAt: DataTypes.DATE,
    riderLocation: { type: DataTypes.JSONB, defaultValue: null },
  },
  { tableName: 'orders' }
);

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    quantity: DataTypes.INTEGER,
    selectedCustomizations: { type: DataTypes.JSONB, defaultValue: [] },
    notes: DataTypes.STRING,
  },
  { tableName: 'order_items' }
);

module.exports = { Order, OrderItem };
