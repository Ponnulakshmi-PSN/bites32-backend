const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Restaurant = sequelize.define(
  'Restaurant',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    imageUrl: { type: DataTypes.STRING, defaultValue: '' },
    coverUrl: { type: DataTypes.STRING, defaultValue: '' },
    cuisineTypes: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    addressLine1: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    priceRange: { type: DataTypes.ENUM('$', '$$', '$$$'), defaultValue: '$$' },
    deliveryFee: { type: DataTypes.FLOAT, defaultValue: 0 },
    minOrderAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    estimatedDeliveryTime: { type: DataTypes.STRING, defaultValue: '30-40 min' },
    isOpen: { type: DataTypes.BOOLEAN, defaultValue: true },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'restaurants' }
);

module.exports = Restaurant;
