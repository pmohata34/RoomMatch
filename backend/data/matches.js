// In-memory storage for matches (in production, use a proper database)
const matches = [
    {
        id: 'match-1',
        user1Id: 'user-1',
        user2Id: 'user-4',
        status: 'accepted',
        compatibilityScore: 92,
        createdAt: '2024-01-10T00:00:00.000Z',
        updatedAt: '2024-01-10T00:00:00.000Z'
    },
    {
        id: 'match-2',
        user1Id: 'user-2',
        user2Id: 'user-5',
        status: 'pending',
        compatibilityScore: 85,
        createdAt: '2024-01-11T00:00:00.000Z',
        updatedAt: '2024-01-11T00:00:00.000Z'
    },
    {
        id: 'match-3',
        user1Id: 'user-3',
        user2Id: 'user-2',
        status: 'rejected',
        compatibilityScore: 45,
        createdAt: '2024-01-12T00:00:00.000Z',
        updatedAt: '2024-01-12T00:00:00.000Z'
    }
];

module.exports = { matches };