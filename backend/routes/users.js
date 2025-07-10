const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { verifyToken } = require('./auth');
const { users } = require('../data/users');

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    college: Joi.string().min(2).max(100),
    gender: Joi.string().valid('male', 'female', 'non-binary', 'prefer-not-to-say'),
    roomType: Joi.string().valid('single', 'shared', 'studio', 'house'),
    bio: Joi.string().max(500),
    age: Joi.number().min(18).max(100),
    interests: Joi.array().items(Joi.string().max(50)),
    preferences: Joi.object({
        sleepSchedule: Joi.string().valid('early-bird', 'night-owl', 'flexible'),
        cleanliness: Joi.string().valid('very-clean', 'moderately-clean', 'relaxed'),
        studyStyle: Joi.string().valid('quiet-study', 'background-music', 'group-study'),
        socialLevel: Joi.string().valid('social-butterfly', 'moderate-social', 'prefer-quiet')
    })
});

// Get user profile
router.get('/profile', verifyToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/profile', verifyToken, (req, res) => {
    try {
        // Validate input
        const { error, value } = updateProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userIndex = users.findIndex(u => u.id === req.user.userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user data
        users[userIndex] = {
            ...users[userIndex],
            ...value,
            updatedAt: new Date().toISOString()
        };

        // Check if profile is completed
        const user = users[userIndex];
        const requiredFields = ['firstName', 'lastName', 'college', 'gender', 'roomType'];
        const isProfileCompleted = requiredFields.every(field => user[field]);
        
        if (isProfileCompleted) {
            users[userIndex].profileCompleted = true;
        }

        const { password: _, ...userWithoutPassword } = users[userIndex];
        
        res.json({
            message: 'Profile updated successfully',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users (for matching)
router.get('/all', verifyToken, (req, res) => {
    try {
        const currentUser = users.find(u => u.id === req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Filter out current user and users without completed profiles
        const otherUsers = users
            .filter(u => u.id !== req.user.userId && u.profileCompleted)
            .map(user => {
                const { password: _, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });

        res.json(otherUsers);

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user by ID
router.get('/:id', verifyToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user account
router.delete('/profile', verifyToken, (req, res) => {
    try {
        const userIndex = users.findIndex(u => u.id === req.user.userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users.splice(userIndex, 1);
        
        res.json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;