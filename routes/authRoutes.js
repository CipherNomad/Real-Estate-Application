const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Ensure the database connection is correct

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    // Validate passwords
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // Check if user already exists
        const [results] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await db.promise().query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        // Successful user registration
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error during signup' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const [results] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create a JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Adding more user info to the payload for future reference
            process.env.JWT_SECRET, // Ensure you have a secret in your .env
            { expiresIn: '1h' } // Token expiry time
        );

        // Send success response with the token
        res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error during login' });
    }
});

module.exports = router;
