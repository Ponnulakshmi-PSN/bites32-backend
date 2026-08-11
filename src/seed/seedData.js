require("dotenv").config();

const { sequelize } = require("../config/db");
const Restaurant = require("../models/Restaurant");
const FoodItem = require("../models/FoodItem");
const Coupon = require("../models/Coupon");

const restaurants = require("./data/restaurants.json");
const foodItems = require("./data/foodItems.json");
const coupons = require("./data/coupons.json");

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database Connected");

    await FoodItem.destroy({ where: {}, force: true });
    await Restaurant.destroy({ where: {}, force: true });

    // Remove temporary ids before insert
    const restaurantData = restaurants.map(({ id, cuisine, ...rest }) => ({
      ...rest,
      cuisineTypes: cuisine
        ? cuisine.split("·").map((c) => c.trim())
        : [],
    }));

    const createdRestaurants = await Restaurant.bulkCreate(restaurantData, {
      returning: true,
    });

    // Map r1 -> generated UUID
    const restaurantMap = {};

    restaurants.forEach((restaurant, index) => {
      restaurantMap[restaurant.id] = createdRestaurants[index].id;
    });

    // Remove temporary food ids and replace restaurantId
    const foodData = foodItems.map(({ id, prepTimeMinutes, ...food }) => ({
      ...food,
      restaurantId: restaurantMap[food.restaurantId],
      isAvailable: true,
      isPopular: food.rating >= 4.7,
      ratingCount: 0,
      customizations: [],
    }));

    await FoodItem.bulkCreate(foodData);

    // --- Seed coupons from JSON file for local development ---
    await Coupon.destroy({ where: {}, force: true });
    await Coupon.bulkCreate(coupons);

    console.log("✅ Database seeded successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();