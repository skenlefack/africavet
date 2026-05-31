const express = require('express');
const request = require('supertest');

// Mock db
jest.mock('../config/db', () => ({
    query: jest.fn(),
}));

// Mock auth middleware to bypass authentication
jest.mock('../middleware/auth', () => ({
    auth: (req, res, next) => {
        req.user = { id: 1, role: 'admin' };
        next();
    },
    authorize: () => (req, res, next) => next(),
}));

const db = require('../config/db');
const analyticsRouter = require('../routes/analytics');

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRouter);

describe('POST /api/analytics/track', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        db.query.mockResolvedValue([{ insertId: 1 }]);
    });

    test('returns 400 when page_url is missing', async () => {
        const res = await request(app)
            .post('/api/analytics/track')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('page_url required');
    });

    test('returns 200 with valid page_url', async () => {
        const res = await request(app)
            .post('/api/analytics/track')
            .send({
                page_url: 'https://africavet.com/articles/test',
                page_title: 'Test Article',
                country_code: 'CM',
                country_name: 'Cameroon'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        // Should have called db.query for insert + daily upsert
        expect(db.query).toHaveBeenCalledTimes(2);
    });

    test('inserts correct data into page_visits', async () => {
        await request(app)
            .post('/api/analytics/track')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36')
            .send({
                page_url: 'https://africavet.com/',
                page_title: 'Home',
                page_type: 'home',
                country_code: 'SN',
                country_name: 'Senegal'
            });

        const insertCall = db.query.mock.calls[0];
        expect(insertCall[0]).toContain('INSERT INTO page_visits');
        // Check params include country_code = 'SN'
        const params = insertCall[1];
        expect(params).toContain('SN');
    });

    test('handles server error gracefully', async () => {
        db.query.mockRejectedValueOnce(new Error('DB connection failed'));

        const res = await request(app)
            .post('/api/analytics/track')
            .send({ page_url: 'https://africavet.com/' });

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

describe('GET /api/analytics/overview', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns overview data', async () => {
        db.query
            .mockResolvedValueOnce([[{ total_visits: 100, unique_visitors: 50, page_views: 200, bounce_rate: 35.5 }]])
            .mockResolvedValueOnce([[{ total_visits: 80, unique_visitors: 40, page_views: 150, bounce_rate: 40.0 }]]);

        const res = await request(app).get('/api/analytics/overview?period=30');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.total_visits).toBe(100);
        expect(res.body.data.unique_visitors).toBe(50);
        expect(res.body.data.changes).toBeDefined();
    });
});
