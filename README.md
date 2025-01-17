# E-Commerce Web Application for Laptops 💻🛒

This project is a fully functional **e-commerce web application** exclusively designed for laptops. It showcases expertise in full-stack development, covering front-end, back-end, and deployment aspects.

---

## Project Overview 📋

The application has two main sides: **User** and **Admin**, each packed with multiple features. It follows the **MVC (Model-View-Controller)** architecture, with middleware for authentication and security.

- **Security:** Configured with SSL certificates for secure image uploads.
- **Hosting:** Deployed on **AWS EC2** and **ECS**, with **Nginx** for server management and reverse proxy.

---

## Technologies Used ⚙️

- **Frontend:** HTML, CSS, Bootstrap, EJS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

---

## Modules & Libraries 🛠️

- **bcrypt:** Password hashing
- **crypto:** Random string generation
- **multer:** Image upload handling
- **mongoose:** Database models and operations
- **nodemailer:** Email notifications
- **pdfkit:** Generating order invoices
- **sweetalert:** User-friendly alerts

---

## Payment Gateway 💳

- **Razorpay**: For handling online payments securely.

---

## Features 🌟

### User Side Features 👤

- **Authentication:**
  - Sign up with email verification.
  - Login and Forgot Password functionality.
  - Change password with email verification.
- **Profile Management:**
  - Detailed profile with address management.
  - Profile image management.
  - Change password.
  - Change user info.
- **Shopping Features:**
  - **Product details** page with inbuilt zooming funcationality, necessary details, popular products and same-category products and review-adding feature.
  - **Filter** by brands and categories.
  - **Sort** by name.
  - **Debouncing** featuring in search functionality.
  - **Cart** with Save for Later functionality.
  - **Wishlist**: Save products for future reference.
  - **Wallet** : wallet with detailed debit and credit transaction data.
  - **Chckout** : Address management directly in the checkout page.
- **Payment Methods:**
  - Online payment using Razorpay.
  - Cash on Delivery (COD).
  - Wallet payment.
  - Wallet combined with online Razorpay payment.
- **Order Management:**
  - **Purchase confirmation** page with order details.
  - **Email** notifications for product purchases.
  - **Order details** with return and cancel options.
  - **Detailed order tracking**
  - **Invoice** download.
- **Product Reviews:** Ability to leave reviews for purchased products.
- **Coupons:** Apply coupons during payment.
- **Advertisement Banners:** Display banners dynamically on the website.
- **Contact page**
- **Responsive design**

---

### Admin Side Features 🧑‍💼

- **Product Management:** Add, edit, and delete products with multiple images
- **Brand & Category Management:** Manage laptop brands and categories
- **Coupon Management:** Create and manage coupons
- **Advertisement Banners:** Dynamic management of homepage banners
- **Order Management:** View detailed order data and update order statuses
- **User Management:** Block/unblock users as required
- **Dashboard:**
  - Overview of all data with multiple graph representations
  - Best-performing product, category, and brand lists
  - Order details filtered by day, month, or year
  - Print and export order data to Excel

---

## Deployment 🌐

- **AWS EC2:** For reliable cloud hosting
- **Nginx:** Configured for reverse proxy and SSL certificates

---

This project was built from scratch, requiring significant time and effort to implement a wide range of features. It has been a continuous process of optimization, adding new functionalities, and thoroughly testing new ideas. The project has evolved and improved with each iteration, ensuring a solid and feature-rich e-commerce platform.

## Final Thoughts 💭

This project has been a fantastic learning experience. The combination of front-end, back-end, and secure deployment has helped me develop a full-fledged e-commerce platform. I am excited to continue improving this application by adding new features and enhancing its performance.

---
