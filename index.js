// Importing required packages
require('dotenv').config();  // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');  // Your authentication routes
const db = require('./config/db');  // Database connection setup

const app = express();

// Middleware
app.use(cors());  // Enable CORS
app.use(bodyParser.json());  // Parse incoming JSON requests

// Test database connection
db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Routes
app.use('/auth', authRoutes);  // Authentication routes

// Start the server
const PORT = process.env.PORT || 5001;  // Use the port from environment variable or default to 5001
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
