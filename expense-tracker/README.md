# Expense Tracker

A full-stack personal finance web application for managing income, expenses, and transactions in one place.

## Features

- User registration and login
- JWT-based authentication
- Add income and expenses
- Edit and delete transactions
- Filter transactions by type
- Filter transactions by category
- Automatic balance, income, and expense calculations
- MongoDB data storage
- Responsive modern fintech-style UI
- Glassmorphism-inspired design
- Toast notifications
- Form validation

## Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js
- JWT

**Database**
- MongoDB
- Mongoose

## Project Structure

```text
expense-tracker/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── .gitignore
└── README.md