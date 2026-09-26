process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long-for-testing';

const request = require('supertest');
const express = require('express');

jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../middleware/auth', () => ({
  auth: (req, res, next) => { req.user = { id: 1, role: 'admin', permissions: [] }; next(); },
  authorize: () => (req, res, next) => next(),
  optionalAuth: (req, res, next) => { req.user = null; next(); },
  requirePermission: () => (req, res, next) => next(),
}));

const db = require('../config/db');
const opportunitiesRouter = require('../routes/opportunities');

const app = express();
app.use(express.json());
app.use('/api/opportunities', opportunitiesRouter);

describe('Opportunities Routes', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/opportunities', () => {
    it('should return published opportunities', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, title: 'Job 1', type: 'job', status: 'published' }]]);

      const res = await request(app).get('/api/opportunities');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support type filter', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/opportunities?type=tender');
      expect(res.status).toBe(200);
    });

    it('should support country filter', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/opportunities?country=CM');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/opportunities/:id', () => {
    it('should return opportunity by ID', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 1, title: 'Job', type: 'job', status: 'published' }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).get('/api/opportunities/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for missing opportunity', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/opportunities/999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/opportunities/stats', () => {
    it('should return statistics', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 10 }]])
        .mockResolvedValueOnce([[{ type: 'job', count: 5 }, { type: 'tender', count: 3 }]])
        .mockResolvedValueOnce([[{ total: 2 }]]);

      const res = await request(app).get('/api/opportunities/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
