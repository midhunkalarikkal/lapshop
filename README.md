<div align="center">

# 💻 LapShop — Laptop E-Commerce Platform

**A full-stack, server-rendered e-commerce application built with Node.js, Express, EJS, and MongoDB.**

A unified Express application that serves both backend business logic and an EJS-rendered frontend, following the **Model–View–Controller (MVC)** architecture.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?logo=ejs&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

### 🌐 Live Application

[![Visit LapShop](https://img.shields.io/badge/Live%20Demo-LapShop-22C55E?style=for-the-badge&logo=googlechrome&logoColor=white)](https://lapshop-loading.midhunkpaniker.online)
</div>

---

## Project Overview 📋

LapShop is a full-stack e-commerce web application dedicated to laptops. It provides separate **customer-facing** and **administrative** interfaces within a single, server-rendered Node.js application.

Express handles routing, middleware, and business logic, while **EJS templates render the user interface on the server**. The codebase follows the **MVC architecture**, with structured controllers, models, routes, views, and middleware.

The application includes product discovery, shopping cart and wishlist management, secure authentication, order processing, payment integration, wallet transactions, PDF invoices, promotional offers, and administrative analytics.

LapShop is deployed on **Render**, with **GitHub Actions CI/CD** integrated into the deployment workflow to automate code validation and support continuous delivery.

## Screenshots 📸

Explore **15 screenshots** showcasing the LapShop customer interface, shopping experience, and admin dashboard.

[![View Screenshots](https://img.shields.io/badge/View-All%20Screenshots-22C55E?style=for-the-badge&logo=github&logoColor=white)](./SCREENSHOTS.md)

## Technology Stack ⚙️

| Layer                     | Technologies                                             |
| ------------------------- | -------------------------------------------------------- |
| Frontend / Views          | HTML, CSS, JavaScript, Bootstrap, EJS                    |
| Backend                   | Node.js, Express.js (CommonJS)                           |
| Architecture              | Model–View–Controller (MVC)                              |
| Database                  | MongoDB, Mongoose                                        |
| Authentication & Sessions | bcrypt, express-session, cookie-parser                   |
| File Uploads              | Multer                                                   |
| Email                     | Nodemailer                                               |
| Invoice Generation        | PDFKit                                                   |
| Payments                  | Razorpay                                                 |
| Code Quality              | ESLint, Prettier                                         |
| Version Control           | Git, GitHub                                              |
| CI/CD                     | GitHub Actions                                           |
| Deployment & Hosting      | Render                                                   |
| Live Domain               | [lapshop](https://lapshop-loading.midhunkpaniker.online) |

## Features 🌟

### Customer Features 👤

**Authentication and account management**

- Sign up with email verification.
- Log in, recover forgotten passwords, and change passwords with email verification.
- Manage profile information, profile images, and saved addresses.

**Product discovery and shopping**

- View product details with image zoom, specifications, popular products, related products, and reviews.
- Filter products by brand and category; sort by name.
- Search for products with debouncing.
- Manage a shopping cart with **Save for Later** functionality.
- Save products to a wishlist.
- Manage checkout addresses directly from the checkout page.

**Payments, wallet, and promotions**

- Pay using Razorpay, Cash on Delivery (COD), or wallet balance.
- Combine wallet balance with an online Razorpay payment.
- View wallet credit and debit transaction history.
- Apply coupons during checkout.

**Orders and engagement**

- View purchase confirmations and order details.
- Receive purchase-related email notifications.
- Track orders and request returns or cancellations.
- Download PDF invoices.
- Review purchased products.
- View dynamic promotional banners and use the contact page.
- Access a responsive interface across device sizes.

### Administrator Features 🧑‍💼

- **Product management:** Add, edit, and delete products with multiple images.
- **Catalog management:** Manage laptop brands and categories.
- **Coupon management:** Create and manage promotional coupons.
- **Banner management:** Manage dynamic homepage advertisements.
- **Order management:** Inspect orders and update their statuses.
- **User management:** Block or unblock user accounts.
- **Analytics dashboard:** Review key data using multiple charts and graphs, including top-performing products, categories, and brands.
- **Reporting:** Filter order data by day, month, or year; print reports and export order data to Excel.

## Key Libraries 🛠️

| Library           | Role                                 |
| ----------------- | ------------------------------------ |
| `express`         | HTTP server, routing, and middleware |
| `ejs`             | Server-side HTML rendering           |
| `bcrypt`          | Password hashing                     |
| Node.js `crypto`  | Random-string generation             |
| `express-session` | Session management                   |
| `multer`          | Image upload handling                |
| `mongoose`        | MongoDB models and data operations   |
| `nodemailer`      | Transactional email notifications    |
| `pdfkit`          | PDF invoice generation               |
| SweetAlert        | User-facing alerts and confirmations |
| `razorpay`        | Online payment integration           |
| `eslint`          | JavaScript static analysis           |
| `prettier`        | Code formatting and consistency      |

## CI/CD Pipeline 🚀

LapShop uses **GitHub Actions** for continuous integration and **Render** for automated deployment.

The CI workflow validates code quality before deployment, helping maintain consistency across development and production.

### Continuous Integration — GitHub Actions

The GitHub Actions workflow is configured in `.github/workflows/ci.yml`.

The workflow performs the following operations:

1. Triggers on pull requests targeting `main` and pushes to `main`.
2. Checks out the repository.
3. Sets up Node.js 24 with npm dependency caching.
4. Installs project dependencies using `npm ci`.
5. Executes ESLint validation using `npm run lint`.

### Continuous Deployment — Render

LapShop is hosted on Render and integrated with the GitHub repository.

The deployment workflow follows this process:

1. Development changes are pushed to the `dev` branch.
2. A pull request is created from `dev` to `main`.
3. GitHub Actions runs the CI validation workflow.
4. After the changes are reviewed and merged into `main`, CI runs for the updated branch.
5. Render automatically deploys the application after successful CI checks.

Render Build Filters are configured to exclude documentation-only changes from automatic deployments, allowing application updates to trigger deployments while keeping documentation updates independent.

### CI/CD Workflow

```text
Development (dev)
       |
       v
GitHub Pull Request
       |
       v
GitHub Actions CI
       |
       v
ESLint Validation
       |
       v
Merge into main
       |
       v
GitHub Actions CI
       |
       v
Render Auto Deployment
       |
       v
LapShop Production
```

## Project Background

LapShop was developed from scratch as a full-stack learning and engineering project. Its implementation spans frontend rendering, backend development, authentication, catalog and order management, payment integration, administrative reporting, and cloud deployment.

The application has evolved through iterative feature development, UI/UX enhancements, code quality improvements, and the integration of automated CI/CD workflows using GitHub Actions and Render.

## License 📄

This project is licensed under the **ISC License**. See the [LICENSE](./LICENSE) file for details.
