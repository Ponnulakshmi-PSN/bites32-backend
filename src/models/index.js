const { sequelize } = require('../config/db');
const User = require('./User');
const Address = require('./Address');
const Restaurant = require('./Restaurant');
const FoodItem = require('./FoodItem');
const { Cart, CartItem } = require('./Cart');
const { Order, OrderItem } = require('./Order');
const Feedback = require('./Feedback');
const Favorite = require('./Favorite');

// --- User <-> Address (1:many) ---
User.hasMany(Address, { foreignKey: 'userId', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId' });

// --- User <-> Restaurant (owner, 1:many) ---
User.hasMany(Restaurant, { foreignKey: 'ownerId' });
Restaurant.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// --- Restaurant <-> FoodItem (1:many) ---
Restaurant.hasMany(FoodItem, {
  foreignKey: "restaurantId",
  as: "foodItems",
});

FoodItem.belongsTo(Restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});

// --- User <-> Cart (1:1) ---
User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// --- Cart <-> Restaurant (many:1, which restaurant the cart is currently for) ---
Restaurant.hasMany(Cart, { foreignKey: 'restaurantId' });
Cart.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

// --- Cart <-> CartItem (1:many) ---
Cart.hasMany(CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

// --- CartItem <-> FoodItem (many:1) ---
FoodItem.hasMany(CartItem, { foreignKey: 'foodItemId' });
CartItem.belongsTo(FoodItem, { foreignKey: 'foodItemId', as: 'foodItem' });
// --- User <-> Order (1:many) ---
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// --- Restaurant <-> Order (1:many) ---
Restaurant.hasMany(Order, { foreignKey: 'restaurantId' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

// --- Order <-> OrderItem (1:many) ---
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// --- OrderItem <-> FoodItem (many:1) ---
FoodItem.hasMany(OrderItem, { foreignKey: 'foodItemId' });
OrderItem.belongsTo(FoodItem, { foreignKey: 'foodItemId' });

// --- Feedback associations ---
User.hasMany(Feedback, { foreignKey: 'userId' });
Feedback.belongsTo(User, { foreignKey: 'userId' });

Restaurant.hasMany(Feedback, { foreignKey: 'restaurantId' });
Feedback.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

FoodItem.hasMany(Feedback, { foreignKey: 'foodItemId' });
Feedback.belongsTo(FoodItem, { foreignKey: 'foodItemId' });

Order.hasMany(Feedback, { foreignKey: 'orderId' });
Feedback.belongsTo(Order, { foreignKey: 'orderId' });

// --- User <-> Favorite (1:many) ---
User.hasMany(Favorite, { foreignKey: 'userId', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

// --- Restaurant <-> Favorite (1:many) ---
Restaurant.hasMany(Favorite, { foreignKey: 'restaurantId', onDelete: 'CASCADE' });
Favorite.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

module.exports = {
  sequelize,
  User,
  Address,
  Restaurant,
  FoodItem,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Feedback,
  Favorite,
};
