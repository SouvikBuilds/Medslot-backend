
---

# ⚙️ Backend — Description

**GitHub repository description:**

> RESTful backend API for MedSlot built with Node.js, Express, and MongoDB, providing authentication, user management, doctor management, appointments, and secure cloud-based services.

### `server/README.md`

```markdown
# 🩺 MedSlot — Backend

This repository contains the **backend API** for MedSlot, a full-stack doctor appointment booking platform.

The backend provides secure REST APIs for authentication, user management, doctor management, appointments, image uploads, and administrative operations.

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- User logout
- JWT authentication
- Access token handling
- Refresh token support
- HTTP-only cookies
- Password hashing with bcrypt
- Magic Link authentication
- Protected API routes

### 👤 User Management

- User profile
- Authenticated user information
- Role-based authorization
- User management

### 🧑‍⚕️ Doctor Management

- Doctor profiles
- Doctor information management
- Doctor application workflow
- Admin-controlled doctor management
- Doctor profile image uploads

### 📅 Appointment Management

- Create appointments
- Retrieve appointments
- Manage appointment status
- Patient appointment management
- Doctor appointment management

### 🛡️ Admin Operations

- Admin authentication
- User management
- Doctor management
- Appointment management
- Doctor application management

### ☁️ Cloud Services

- Cloudinary image upload
- SMTP email integration
- Environment-based configuration

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Cloudinary
- Nodemailer
- REST API

## 📂 Project Structure

```text
server/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── config/
│
├── app.js
├── server.js
├── package.json
└── .env
