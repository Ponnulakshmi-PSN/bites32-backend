require('dotenv').config();
const { connectDB } = require('./src/config/db');
const { sequelize } = require('./src/models');
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();
  await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
  console.log('Database synced');

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

start();

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
