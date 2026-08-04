# Bites32 Backend (Node.js + Express + PostgreSQL)

Same API surface as the Mongo version, rebuilt on **PostgreSQL + Sequelize**.
Your Flutter `api_service.dart` calls don't need to change — only the
database underneath does.

## What changed vs. MongoDB

| Mongo concept | Postgres equivalent |
|---|---|
| Mongoose schemas | Sequelize models (`src/models/*.js`) |
| `ObjectId` refs (`ref: 'X'`) | Foreign keys + associations in `src/models/index.js` |
| Embedded arrays (e.g. `user.addresses`) | Separate `addresses` table with `userId` FK |
| Embedded `cart.items` / `order.items` | Separate `cart_items` / `order_items` tables |
| Free-form nested objects (customizations, status history, rider location) | Kept as **JSONB** columns — same shape, no schema migration needed for those |
| `_id` (ObjectId string) | `id` (UUID string) — so your Dart code doesn't need to change how it stores/sends ids |

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your DB_* values
```

Create the database first (Sequelize won't create the database itself, only tables):
```bash
psql -U postgres -c "CREATE DATABASE appointment_booking;"
```

> Heads up: your `.env` had `DB_PORT=5000`, but PostgreSQL's default port is
> **5432**. If you're running a stock local Postgres install, double check
> that value — 5000 is more commonly a Node app's port (which is why your
> `PORT` and `DB_PORT` looked swapped).

```bash
npm run dev   # nodemon, http://localhost:3001
```

On startup, `server.js` calls `sequelize.sync({ alter: true })` in
development, which auto-creates/updates all tables from the models — no
manual SQL or migration files needed to get started. Switch to real
migrations (`sequelize-cli`) before going to production.

## Folder structure

```
backend/
├── server.js                 # connects DB, syncs models, starts app
├── package.json
├── .env.example
└── src/
    ├── app.js
    ├── config/db.js           # Sequelize connection (was mongoose connection)
    ├── models/
    │   ├── index.js            # all associations (foreign keys) live here
    │   ├── User.js
    │   ├── Address.js          # NEW — was embedded in User before
    │   ├── Restaurant.js
    │   ├── FoodItem.js
    │   ├── Cart.js              # exports { Cart, CartItem }
    │   ├── Order.js             # exports { Order, OrderItem }
    │   └── Feedback.js
    ├── controllers/            # same responsibilities, Sequelize queries
    ├── routes/                 # unchanged — same endpoints as before
    ├── middleware/
    │   ├── authMiddleware.js    # now uses User.findByPk
    │   └── errorMiddleware.js   # now catches Sequelize error types
    └── utils/generateToken.js   # unchanged
```

## API endpoints (unchanged from the Mongo version)

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/PUT /api/auth/profile`, `POST/DELETE /api/auth/addresses`
- `GET /api/restaurants`, `GET /api/restaurants/:id`
- `GET /api/food-items`, `GET /api/food-items/:id`
- `GET/POST/PUT/DELETE /api/cart`, `/api/cart/items/:itemId`
- `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/status`, `PUT /api/orders/:id/cancel`
- `POST /api/feedback`, `GET /api/feedback?restaurantId=&foodItemId=`

All request/response JSON shapes are the same as before, so no frontend
changes are required beyond pointing `baseUrl` at this server.
