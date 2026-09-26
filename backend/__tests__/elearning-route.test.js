process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long-for-testing';

const request = require('supertest');
const express = require('express');

jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../middleware/auth', () => ({
  auth: (req, res, next) => { req.user = { id: 1, role: 'admin', permissions: [] }; next(); },
  authorize: () => (req, res, next) => next(),
  optionalAuth: (req, res, next) => next(),
  requirePermission: () => (req, res, next) => next(),
}));

const db = require('../config/db');
const elearningRouter = require('../routes/elearning');

const app = express();
app.use(express.json());
app.use('/api/elearning', elearningRouter);

describe('E-Learning Routes', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/elearning/courses', () => {
    it('should return courses list', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, title: 'Course 1', slug: 'course-1', status: 'published' }]]);

      const res = await request(app).get('/api/elearning/courses');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/elearning/courses/:id', () => {
    it('should return course by ID', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 1, title: 'Course 1', slug: 'course-1' }]])
        .mockResolvedValueOnce([[{ id: 1, title: 'Module 1' }]])
        .mockResolvedValueOnce([[{ id: 1, title: 'Lesson 1' }]]);

      const res = await request(app).get('/api/elearning/courses/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for missing course', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/elearning/courses/999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/elearning/dashboard', () => {
    it('should return dashboard stats', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 5 }]])
        .mockResolvedValueOnce([[{ total: 10 }]])
        .mockResolvedValueOnce([[{ total: 3 }]])
        .mockResolvedValueOnce([[{ total: 20 }]])
        .mockResolvedValueOnce([[{ total: 2 }]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/elearning/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
