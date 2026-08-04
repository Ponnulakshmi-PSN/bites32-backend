const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Cart = sequelize.define(
  'Cart',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  },
  { tableName: 'carts' }
);

const CartItem = sequelize.define(
  'CartItem',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING, // snapshot at add-time
    price: DataTypes.FLOAT, // snapshot at add-time
    quantity: { type: DataTypes.INTEGER, defaultValue: 1, validate: { min: 1 } },
    // [{ name, option, extraPrice }]
    selectedCustomizations: { type: DataTypes.JSONB, defaultValue: [] },
    notes: { type: DataTypes.STRING, defaultValue: '' },
  },
  { tableName: 'cart_items' }
);

module.exports = { Cart, CartItem };
