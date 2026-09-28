# ✨ Velora Studio — Salon Management System

A modern, responsive and full-stack salon management web application built for **Velora Studio**.

The project provides a premium customer-facing salon website along with a secure admin dashboard for managing appointments, services, gallery images, customer reviews and business settings.

---

## 🚀 Features

### 👤 Customer Website

* Premium responsive salon landing page
* Hero section with salon branding
* Dynamic services
* Online appointment booking
* Booking date and time selection
* Customer details collection
* Service selection
* Booking status management
* Customer reviews
* Dynamic gallery
* Gallery category filtering
* Business information
* Opening hours
* Social media links
* Google Maps integration support
* Responsive design for mobile, tablet and desktop
* Smooth animations and modern UI

---

### 🔐 Admin Dashboard

Secure admin panel for salon owners.

#### Dashboard

* Total appointments
* Pending appointments
* Confirmed appointments
* Completed booking revenue
* Total services
* Recent appointments

#### Appointments

* View all bookings
* Customer information
* Service information
* Booking date and time
* Booking status
* Confirm / complete / cancel bookings
* Delete bookings
* Search bookings
* Filter by status
* Filter by date
* Export completed bookings

#### Services

* Add services
* Edit services
* Delete services
* Change service price
* Change service duration
* Add service description
* Add service image
* Activate/deactivate services

#### Gallery

* Upload gallery images
* JPG / PNG / WEBP support
* Maximum 5MB image validation
* Image preview
* Edit gallery details
* Activate/deactivate gallery images
* Delete gallery images
* Category-based gallery filtering

#### Reviews

* Add customer reviews
* Edit reviews
* Delete reviews
* Activate/deactivate reviews
* Rating management
* Review source management
* Average rating calculation

#### Business Settings

* Business name
* Tagline
* Phone number
* WhatsApp number
* Email
* Address
* Opening time
* Closing time
* Instagram
* Facebook
* Google Maps
* Business logo upload

---

## 🔒 Authentication & Security

The admin dashboard uses JWT-based authentication.

### Authentication Flow

```text
Admin Login
     ↓
Email + Password
     ↓
Server Validation
     ↓
bcrypt Password Verification
     ↓
JWT Token Generated
     ↓
Token Stored in Browser
     ↓
Protected Admin APIs
```

Security features include:

* JWT authentication
* bcrypt password hashing
* Protected admin routes
* Bearer token authorization
* Token expiration
* Admin role verification
* Protected CRUD operations
* Input validation
* File type validation
* File size validation

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive Design
* Google Fonts

### Backend

* Node.js
* Express.js
* REST API
* JWT
* bcryptjs
* Multer

### Database

* MySQL
* phpMyAdmin
* mysql2

### Development

* XAMPP
* VS Code
* Git
* GitHub

--
