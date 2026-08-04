const express = require('express');
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('admin', 'restaurant_owner'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
