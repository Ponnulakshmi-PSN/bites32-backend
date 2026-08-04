const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Address = sequelize.define(
  'Address',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    label: { type: DataTypes.STRING, defaultValue: 'Home' },
    line1: DataTypes.STRING,
    line2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'addresses' }
);

module.exports = Address;
