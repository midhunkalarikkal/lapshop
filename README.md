# E-Commerce Web Application for Laptops 💻🛒

This project is developed from scratch, and it helped me gain valuable knowledge about full-stack development. It is an e-commerce web application exclusively designed for laptops. Throughout the development process, I learned about various aspects of building a complete web application, from front-end to back-end.

## Project Overview

This application has both **user** and **admin** sides, each packed with a variety of functionalities. The architecture follows the **MVC (Model-View-Controller)** pattern, with multiple middlewares to handle authentication and security.

- **Security:** SSL certificates ensure secure image uploads.
- **Hosting:** The application is hosted on **AWS EC2** and **ECS** with **Nginx** for server management and reverse proxy.
  
### Technologies Used ⚙️

- **Frontend:** HTML, CSS, Bootstrap, and EJS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

### Modules & Libraries 🛠️

- **bcrypt:** For password hashing
- **crypto:** For generating random strings
- **multer:** For image upload handling
- **mongoose:** For defining models and database operations
- **nodemailer:** For sending emails to users
- **pdfkit:** For generating printable order invoices
- **sweetalert:** For showing user-friendly alerts

### Payment Gateway 💳

- **Razorpay** for handling online payments

## Features 🌟

### User Side Features 👤

- **Shop Page:** Browse and view laptops.
- **Search, Filter, and Sort:** Find laptops based on brand, category, price range, and alphabetical order.
- **Wishlist:** Users can save laptops for future reference.
- **Cart:** With a 'Save for Later' feature.
- **User Profile:** Manage passwords, profiles, and addresses.
- **Wallet:** Users can manage their wallet balance and view wallet history.
- **Contact Page:** For customer support inquiries.
- **Coupons:** Users can apply coupons during checkout.
- **Payment Methods:** 
  - Cash on Delivery (COD)
  - Online Payment
  - Wallet
  - Wallet with Online Payment
- **Order Management:** Users can view their order history and invoice.

### Admin Side Features 🧑‍💼

- **Dashboard:** A detailed overview of the current status of all data within the application.
- **Order Summary:** Multiple graphs and statistics for easy tracking.
- **Banner Management:** Dynamic management of homepage and advertisement banners.
- **User Management:** Block/unblock users as needed.
- **Coupon Management:** Admin can create and manage coupons.
- **Product Management:** Add products with multiple images and data.
- **Brand and Category Management:** Manage laptop brands and categories.
- **Order Management:** Detailed views and order status management.

## Ongoing Improvements 🚀

I am continuously working on adding new features and improving the code quality to make this application even better. Stay tuned for more updates!

## Deployment 🌐

- **Hosted on AWS EC2** for reliable cloud hosting.
- **AWS ECS** for container management.
- **Nginx** is used for reverse proxy and efficient load balancing.

## Final Thoughts 💭

This project has been an incredible learning experience. The combination of front-end, back-end, and various features, along with secure deployment, has given me hands-on experience in developing a full-fledged e-commerce platform. I am excited to continue improving this project and adding new features to it.

