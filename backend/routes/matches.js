const express = require('express');
const { verifyToken } = require('./auth');
const { users } = require('../data/users');
const { matches } = require('../data/matches');

const router = express.Router();

// Calculate compatibility score between two users
function calculateCompatibilityScore(user1, user2) {
    let score = 0;
    let totalFactors = 0;

    // Check if both users have preferences
    if (!user1.preferences || !user2.preferences) {
        return 0;
    }

    // Sleep schedule compatibility (30% weight)
    if (user1.preferences.sleepSchedule && user2.preferences.sleepSchedule) {
        totalFactors += 30;
        if (user1.preferences.sleepSchedule === user2.preferences.sleepSchedule) {
            score += 30;
        } else if (user1.preferences.sleepSchedule === 'flexible' || user2.preferences.sleepSchedule === 'flexible') {
            score += 20;
        }
    }

    // Cleanliness compatibility (25% weight)
    if (user1.preferences.cleanliness && user2.preferences.cleanliness) {
        totalFactors += 25;
        if (user1.preferences.cleanliness === user2.preferences.cleanliness) {
            score += 25;
        } else {
            const cleanlinessLevels = ['relaxed', 'moderately-clean', 'very-clean'];
            const user1Level = cleanlinessLevels.indexOf(user1.preferences.cleanliness);
            const user2Level = cleanlinessLevels.indexOf(user2.preferences.cleanliness);
            const difference = Math.abs(user1Level - user2Level);
            
            if (difference === 1) {
                score += 15;
            } else if (difference === 2) {
                score += 5;
            }
        }
    }

    // Study style compatibility (20% weight)
    if (user1.preferences.studyStyle && user2.preferences.studyStyle) {
        totalFactors += 20;
        if (user1.preferences.studyStyle === user2.preferences.studyStyle) {
            score += 20;
        } else if (user1.preferences.studyStyle === 'background-music' || user2.preferences.studyStyle === 'background-music') {
            score += 10;
        }
    }

    // Social level compatibility (15% weight)
    if (user1.preferences.socialLevel && user2.preferences.socialLevel) {
        totalFactors += 15;
        if (user1.preferences.socialLevel === user2.preferences.socialLevel) {
            score += 15;
        } else if (user1.preferences.socialLevel === 'moderate-social' || user2.preferences.socialLevel === 'moderate-social') {
            score += 10;
        }
    }

    // College compatibility (10% weight)
    if (user1.college && user2.college) {
        totalFactors += 10;
        if (user1.college === user2.college) {
            score += 10;
        }
    }

    // Calculate final percentage
    if (totalFactors === 0) return 0;
    return Math.round((score / totalFactors) * 100);
}

// Get potential matches for current user
router.get('/potential', verifyToken, (req, res) => {
    try {
        const currentUser = users.find(u => u.id === req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get all other users with completed profiles
        const potentialMatches = users
            .filter(u => u.id !== req.user.userId && u.profileCompleted && u.surveyCompleted)
            .map(user => {
                const { password: _, ...userWithoutPassword } = user;
                const compatibilityScore = calculateCompatibilityScore(currentUser, user);
                
                return {
                    ...userWithoutPassword,
                    compatibilityScore
                };
            })
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore); // Sort by highest compatibility

        // Apply filters if provided
        const { college, gender, minAge, maxAge, sleepSchedule, cleanliness } = req.query;
        
        let filteredMatches = potentialMatches;

        if (college) {
            filteredMatches = filteredMatches.filter(u => 
                u.college.toLowerCase().includes(college.toLowerCase())
            );
        }

        if (gender && gender !== 'any') {
            filteredMatches = filteredMatches.filter(u => u.gender === gender);
        }

        if (minAge || maxAge) {
            filteredMatches = filteredMatches.filter(u => {
                if (!u.age) return true;
                const age = u.age;
                return (!minAge || age >= parseInt(minAge)) && (!maxAge || age <= parseInt(maxAge));
            });
        }

        if (sleepSchedule) {
            filteredMatches = filteredMatches.filter(u => 
                u.preferences && u.preferences.sleepSchedule === sleepSchedule
            );
        }

        if (cleanliness) {
            filteredMatches = filteredMatches.filter(u => 
                u.preferences && u.preferences.cleanliness === cleanliness
            );
        }

        res.json({
            matches: filteredMatches,
            total: filteredMatches.length
        });

    } catch (error) {
        console.error('Get potential matches error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's current matches
router.get('/current', verifyToken, (req, res) => {
    try {
        const userMatches = matches.filter(m => 
            m.user1Id === req.user.userId || m.user2Id === req.user.userId
        );

        const matchesWithUserData = userMatches.map(match => {
            const otherUserId = match.user1Id === req.user.userId ? match.user2Id : match.user1Id;
            const otherUser = users.find(u => u.id === otherUserId);
            
            if (otherUser) {
                const { password: _, ...userWithoutPassword } = otherUser;
                return {
                    ...match,
                    otherUser: userWithoutPassword
                };
            }
            
            return match;
        });

        res.json(matchesWithUserData);

    } catch (error) {
        console.error('Get current matches error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new match
router.post('/create', verifyToken, (req, res) => {
    try {
        const { otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({ error: 'Other user ID is required' });
        }

        // Check if the other user exists
        const otherUser = users.find(u => u.id === otherUserId);
        if (!otherUser) {
            return res.status(404).json({ error: 'Other user not found' });
        }

        // Check if match already exists
        const existingMatch = matches.find(m => 
            (m.user1Id === req.user.userId && m.user2Id === otherUserId) ||
            (m.user1Id === otherUserId && m.user2Id === req.user.userId)
        );

        if (existingMatch) {
            return res.status(400).json({ error: 'Match already exists' });
        }

        // Create new match
        const newMatch = {
            id: require('uuid').v4(),
            user1Id: req.user.userId,
            user2Id: otherUserId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        matches.push(newMatch);

        res.status(201).json({
            message: 'Match created successfully',
            match: newMatch
        });

    } catch (error) {
        console.error('Create match error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update match status
router.put('/:matchId/status', verifyToken, (req, res) => {
    try {
        const { matchId } = req.params;
        const { status } = req.body;

        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const matchIndex = matches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const match = matches[matchIndex];
        
        // Check if user is part of this match
        if (match.user1Id !== req.user.userId && match.user2Id !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to update this match' });
        }

        // Update match status
        matches[matchIndex] = {
            ...match,
            status,
            updatedAt: new Date().toISOString()
        };

        res.json({
            message: 'Match status updated successfully',
            match: matches[matchIndex]
        });

    } catch (error) {
        console.error('Update match status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;