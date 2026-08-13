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

    await sequelize.sync();
    console.log("Tables synced");

    await FoodItem.destroy({ where: {}, force: true });
    await Restaurant.destroy({ where: {}, force: true });
    await Coupon.destroy({ where: {}, force: true });

    const restaurantData = restaurants.map(({ id, cuisine, ...rest }) => ({
      ...rest,
      cuisineTypes: cuisine ? cuisine.split("·").map((c) => c.trim()) : [],
    }));
    const createdRestaurants = await Restaurant.bulkCreate(restaurantData, {
      returning: true,
    });
    console.log(`Inserted ${createdRestaurants.length} restaurants`);

    const restaurantMap = {};
    restaurants.forEach((restaurant, index) => {
      restaurantMap[restaurant.id] = createdRestaurants[index].id;
    });

    const foodData = foodItems.map(({ id, ...food }) => ({
      ...food, // keeps prepTimeMinutes
      restaurantId: restaurantMap[food.restaurantId],
      isAvailable: true,
      isPopular: food.rating >= 4.7,
      ratingCount: 0,
      customizations: [],
    }));
    const createdFoodItems = await FoodItem.bulkCreate(foodData);
    console.log(`Inserted ${createdFoodItems.length} food items`);

    const createdCoupons = await Coupon.bulkCreate(coupons);
    console.log(`Inserted ${createdCoupons.length} coupons`);

    console.log("✅ Database seeded successfully");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedDatabase();