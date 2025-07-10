const express = require('express');
const Joi = require('joi');
const { verifyToken } = require('./auth');
const { users } = require('../data/users');

const router = express.Router();

// Validation schema for survey data
const surveySchema = Joi.object({
    preferences: Joi.object({
        sleepSchedule: Joi.string().valid('early-bird', 'night-owl', 'flexible').required(),
        cleanliness: Joi.string().valid('very-clean', 'moderately-clean', 'relaxed').required(),
        studyStyle: Joi.string().valid('quiet-study', 'background-music', 'group-study').required(),
        socialLevel: Joi.string().valid('social-butterfly', 'moderate-social', 'prefer-quiet').required(),
        noiseTolerance: Joi.string().valid('quiet-preferred', 'moderate', 'loud-ok'),
        petFriendly: Joi.boolean(),
        smoking: Joi.boolean(),
        drinking: Joi.boolean()
    }).required(),
    interests: Joi.array().items(Joi.string().max(50)).max(20),
    dealBreakers: Joi.array().items(Joi.string().max(100)).max(10),
    additionalInfo: Joi.string().max(500)
});

// Submit survey responses
router.post('/submit', verifyToken, (req, res) => {
    try {
        // Validate input
        const { error, value } = surveySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userIndex = users.findIndex(u => u.id === req.user.userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user with survey data
        users[userIndex] = {
            ...users[userIndex],
            ...value,
            surveyCompleted: true,
            updatedAt: new Date().toISOString()
        };

        const { password: _, ...userWithoutPassword } = users[userIndex];
        
        res.json({
            message: 'Survey submitted successfully',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Submit survey error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's survey responses
router.get('/responses', verifyToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const surveyData = {
            preferences: user.preferences || {},
            interests: user.interests || [],
            dealBreakers: user.dealBreakers || [],
            additionalInfo: user.additionalInfo || '',
            surveyCompleted: user.surveyCompleted || false
        };

        res.json(surveyData);

    } catch (error) {
        console.error('Get survey responses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update survey responses
router.put('/responses', verifyToken, (req, res) => {
    try {
        // Validate input
        const { error, value } = surveySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userIndex = users.findIndex(u => u.id === req.user.userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user with new survey data
        users[userIndex] = {
            ...users[userIndex],
            ...value,
            surveyCompleted: true,
            updatedAt: new Date().toISOString()
        };

        const { password: _, ...userWithoutPassword } = users[userIndex];
        
        res.json({
            message: 'Survey responses updated successfully',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Update survey responses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get survey questions (for frontend)
router.get('/questions', (req, res) => {
    try {
        const questions = [
            {
                id: 'sleepSchedule',
                question: 'What is your preferred sleep schedule?',
                type: 'single-choice',
                options: [
                    { value: 'early-bird', label: 'Early Bird', description: 'Up early, asleep early' },
                    { value: 'night-owl', label: 'Night Owl', description: 'Late to bed, late to rise' },
                    { value: 'flexible', label: 'Flexible', description: 'Can adapt to various schedules' }
                ],
                required: true
            },
            {
                id: 'cleanliness',
                question: 'How clean do you keep your living space?',
                type: 'single-choice',
                options: [
                    { value: 'very-clean', label: 'Very Clean', description: 'Everything in its place, daily cleaning' },
                    { value: 'moderately-clean', label: 'Moderately Clean', description: 'Regular cleaning, organized most of the time' },
                    { value: 'relaxed', label: 'Relaxed', description: 'Lived-in feel, clean when needed' }
                ],
                required: true
            },
            {
                id: 'studyStyle',
                question: 'How do you prefer to study?',
                type: 'single-choice',
                options: [
                    { value: 'quiet-study', label: 'Quiet Environment', description: 'Need silence to focus and concentrate' },
                    { value: 'background-music', label: 'Background Music', description: 'Light music or ambient sounds help' },
                    { value: 'group-study', label: 'Group Study', description: 'Prefer studying with others' }
                ],
                required: true
            },
            {
                id: 'socialLevel',
                question: 'What are your social preferences?',
                type: 'single-choice',
                options: [
                    { value: 'social-butterfly', label: 'Social Butterfly', description: 'Love having friends over regularly' },
                    { value: 'moderate-social', label: 'Moderate Social', description: 'Occasional gatherings are perfect' },
                    { value: 'prefer-quiet', label: 'Prefer Quiet', description: 'Like a peaceful, calm environment' }
                ],
                required: true
            },
            {
                id: 'interests',
                question: 'What are your interests and hobbies?',
                type: 'multiple-text',
                description: 'Add up to 20 interests',
                required: false
            },
            {
                id: 'dealBreakers',
                question: 'What are your deal breakers?',
                type: 'multiple-text',
                description: 'What would make living together difficult?',
                required: false
            }
        ];

        res.json(questions);

    } catch (error) {
        console.error('Get survey questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;