const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const foodItemRoutes = require('./routes/foodItemRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

// Core middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

// Feature routes — mirrors lib/screens & lib/providers in the Flutter app
app.use('/api/auth', authRoutes); // login_screen, profile_screen
app.use('/api/restaurants', restaurantRoutes); // restaurant_list_screen, restaurant_detail_screen
app.use('/api/food-items', foodItemRoutes); // food_detail_screen, food_card, category_chip
app.use('/api/cart', cartRoutes); // cart_screen
app.use('/api/orders', orderRoutes); // checkout_screen, order_tracking_screen
app.use('/api/feedback', feedbackRoutes); // feedback_screen

app.use(notFound);
app.use(errorHandler);

module.exports = app;
