const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },

    type: {
      type: DataTypes.ENUM(
        'order_update',
        'offer',
        'payment',
        'general'
      ),
      allowNull: false,
      defaultValue: 'general',
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'reference_id',
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
    },
  },
  {
    tableName: 'notifications',

    timestamps: true,

    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
      {
        name: 'notifications_user_id',
        fields: ['user_id'],
      },
      {
        name: 'notifications_user_id_is_read',
        fields: ['user_id', 'is_read'],
      },
    ],
  }
);

module.exports = Notification;