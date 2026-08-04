const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Feedback = sequelize.define(
  'Feedback',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, defaultValue: '' },
    imageUrls: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  },
  { tableName: 'feedback' }
);

module.exports = Feedback;
