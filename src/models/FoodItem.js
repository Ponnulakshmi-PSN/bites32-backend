const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FoodItem = sequelize.define(
  'FoodItem',
  {
     id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "restaurants",
        key: "id",
      },
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    imageUrl: { type: DataTypes.STRING, defaultValue: '' },
    category: { type: DataTypes.STRING, allowNull: false }, // powers category_chip.dart
    price: { type: DataTypes.FLOAT, allowNull: false },
    discountPrice: { type: DataTypes.FLOAT },
    isVeg: { type: DataTypes.BOOLEAN, defaultValue: true },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    isPopular: { type: DataTypes.BOOLEAN, defaultValue: false },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Nested customizations kept as JSONB — same shape as before:
    // [{ name, required, options: [{ label, extraPrice }] }]
    customizations: { type: DataTypes.JSONB, defaultValue: [] },
    prepTimeMinutes: {
  type: DataTypes.INTEGER,
  defaultValue: 10,
},
  },
  { tableName: 'food_items' }
);

module.exports = FoodItem;
