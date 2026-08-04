const express = require('express');
const {
  getFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
} = require('../controllers/foodItemController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getFoodItems);
router.get('/:id', getFoodItemById);
router.post('/', protect, authorize('admin', 'restaurant_owner'), createFoodItem);
router.put('/:id', protect, authorize('admin', 'restaurant_owner'), updateFoodItem);
router.delete('/:id', protect, authorize('admin', 'restaurant_owner'), deleteFoodItem);

module.exports = router;
