process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long-for-testing';

const request = require('supertest');
const express = require('express');

jest.mock('../config/db', () => ({ query: jest.fn() }));

const db = require('../config/db');

// Default: admin user
const mockAuth = (role = 'admin') => (req, res, next) => {
  req.user = { id: 1, role, permissions: [] };
  next();
};

jest.mock('../middleware/auth', () => ({
  auth: (req, res, next) => { req.user = { id: 1, role: 'admin', permissions: [] }; next(); },
  authorize: (...roles) => (req, res, next) => {
    if (req.user.role === 'superadmin' || roles.includes(req.user.role)) return next();
    return res.status(403).json({ success: false, message: 'Forbidden' });
  },
  requirePermission: () => (req, res, next) => next(),
}));

const usersRouter = require('../routes/users');

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

describe('Users Routes', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/users', () => {
    it('should return paginated users for admin', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, username: 'admin', email: 'admin@test.com', role: 'admin' }]]);

      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by ID', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 1, username: 'admin', email: 'admin@test.com' }]])
        .mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/users/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for missing user', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/users/999');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 2, username: 'user2' }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).delete('/api/users/2');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
