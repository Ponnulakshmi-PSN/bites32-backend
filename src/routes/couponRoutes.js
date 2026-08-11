const express = require('express');
const { getActiveCoupons, validateCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getActiveCoupons);
router.post('/validate', protect, validateCoupon);

module.exports = router;