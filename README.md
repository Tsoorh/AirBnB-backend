# 🏨 Urbnb - Backend API

> The RESTful API and Real-time Server powering the Urbnb vacation rental platform.
> Built with Node.js, Express, and MongoDB.

**Frontend Repository:** https://github.com/Tsoorh/AirBnB-frontend
**Live Demo:**  https://airbnb-backend-aavq.onrender.com

---

## 📖 Overview

This repository hosts the server-side logic for Urbnb. It handles data persistence, authentication, business logic, and real-time bidirectional communication between hosts and guests.
The architecture follows the **MVC (Model-View-Controller)** pattern (adapted for API-first design), ensuring separation of concerns and maintainability.

---

## 🛠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose / Native Driver)
* **Real-Time:** Socket.io (WebSockets)
* **Authentication:** Cookie-based Sessions / JWT (Secure HTTP-only cookies)
* **Encryption:** Bcrypt.js (Password hashing)
* **Logging:** Manual service.

---

## ⚡ Key Features

### 🔐 Authentication & Security
* Secure user registration and login flows.
* Password hashing using **Bcrypt**.
* Protected routes middleware (RequireAuth / RequireAdmin).
* HTTP-Only cookies to prevent XSS attacks.

### 🏠 Accommodation Management (Stays)
* Advanced filtering logic (by location, price, amenities, labels) performed on the database level.
* CRUD operations for hosts to manage their listings.
* Aggregation queries for dashboard statistics.

### 📅 Booking System (Orders)
* Order lifecycle management (Pending -> Approved/Rejected).
* Conflict detection (preventing double bookings for the same dates).

### 💬 Real-Time Communication
* **Instant Messaging:** WebSocket integration allowing guests and hosts to chat in real-time.
* **Live Notifications:** Immediate updates on order status changes (e.g., "Your booking was approved!").

---

## 🔌 API Endpoints

### Auth
* `POST /api/auth/login` - Authenticate user
* `POST /api/auth/signup` - Register new user
* `POST /api/auth/logout` - Clear session

### Stays (Listings)
* `GET /api/stay` - Get all stays (supports query params for filtering)
* `GET /api/stay/:id` - Get stay details
* `POST /api/stay` - Create new stay (Host only)
* `PUT /api/stay/:id` - Update stay
* `DELETE /api/stay/:id` - Remove stay

### Orders
* `GET /api/order` - Get orders (filtered by buyer or seller)
* `POST /api/order` - Create new booking request
* `PUT /api/order/:id` - Update order status (Approve/Reject)

### User
* `GET /api/user/:id` - Get user profile
* `PUT /api/user/:id` - Update user details

---

## 📡 WebSocket Events (Socket.io)

The server listens for and emits the following events:

| Event Name | Direction | Description |
| :--- | :--- | :--- |
| `chat-set-topic` | Client → Server | User joins a specific chat room (Order ID) |
| `chat-send-msg` | Client → Server | User sends a new message |
| `chat-add-msg` | Server → Client | Broadcasts message to the specific room |
| `order-added` | Client → Server | Guest makes a new reservation |
| `order-status-change` | Server → Client | Notifies user of booking approval/rejection |

---

## 📂 Project Structure

```bash
backend/
├── api/             # Route handlers & Business logic
│   ├── auth/        # Authentication service
│   ├── stay/        # Listing logic
│   ├── order/       # Booking logic
│   ├── user/        # User profile logic
│   └── chat/        # Chat history logic
├── config/          # Database connection & Env setup
├── middlewares/     # Auth checks, Error handling
├── services/        # Utility services (Socket, DB helpers)
└── server.js        # Entry point
