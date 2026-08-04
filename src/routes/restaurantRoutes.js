const express = require('express');
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.post('/', protect, authorize('admin', 'restaurant_owner'), createRestaurant);
router.put('/:id', protect, authorize('admin', 'restaurant_owner'), updateRestaurant);
router.delete('/:id', protect, authorize('admin'), deleteRestaurant);

module.exports = router;
