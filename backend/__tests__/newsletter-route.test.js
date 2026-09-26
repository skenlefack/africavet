process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long-for-testing';

const request = require('supertest');
const express = require('express');

jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../middleware/auth', () => ({
  auth: (req, res, next) => { req.user = { id: 1, role: 'admin', permissions: [] }; next(); },
  authorize: () => (req, res, next) => next(),
  requirePermission: () => (req, res, next) => next(),
}));
jest.mock('../services/emailService', () => ({
  getTransporter: jest.fn().mockResolvedValue({
    transporter: { sendMail: jest.fn().mockResolvedValue({}) },
    from: 'test@test.com',
  }),
}));

const db = require('../config/db');
const newsletterRouter = require('../routes/newsletter');

const app = express();
app.use(express.json());
app.use('/api/newsletter', newsletterRouter);

describe('Newsletter Routes', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/newsletter/subscribe', () => {
    it('should subscribe a new email', async () => {
      db.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should handle already subscribed', async () => {
      db.query.mockResolvedValueOnce([[{ id: 1, email: 'test@example.com', status: 'active' }]]);

      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/newsletter/subscribers', () => {
    it('should return subscribers list (admin)', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, email: 'sub@test.com', status: 'active' }]]);

      const res = await request(app).get('/api/newsletter/subscribers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/newsletter/campaigns', () => {
    it('should return campaigns list', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, name: 'Campaign 1', status: 'draft' }]]);

      const res = await request(app).get('/api/newsletter/campaigns');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
