process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long-for-testing';

const request = require('supertest');
const express = require('express');

jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../middleware/auth', () => ({
  auth: (req, res, next) => { req.user = { id: 1, role: 'admin', permissions: [] }; next(); },
  authorize: () => (req, res, next) => next(),
}));
jest.mock('../services/emailService', () => ({
  getTransporter: jest.fn().mockResolvedValue({
    transporter: { sendMail: jest.fn().mockResolvedValue({}) },
    from: 'test@test.com',
  }),
}));

const db = require('../config/db');
const contactRouter = require('../routes/contact');

const app = express();
app.use(express.json());
app.use('/api/contact', contactRouter);

describe('Contact Routes', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/contact', () => {
    it('should submit a valid contact message', async () => {
      db.query
        .mockResolvedValueOnce([[{ count: 0 }]])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'John', email: 'john@test.com', subject: 'Test', message: 'Hello world' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'John' });

      expect(res.status).toBe(400);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'John', email: 'bad', subject: 'Test', message: 'Hello' });

      expect(res.status).toBe(400);
    });

    it('should enforce rate limiting', async () => {
      db.query.mockResolvedValueOnce([[{ count: 3 }]]);

      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'John', email: 'john@test.com', subject: 'Test', message: 'Hello' });

      expect(res.status).toBe(429);
    });
  });

  describe('GET /api/contact', () => {
    it('should return messages list (admin)', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, name: 'John', email: 'john@test.com', status: 'new' }]]);

      const res = await request(app).get('/api/contact');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/contact/:id/status', () => {
    it('should update message status', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/contact/1/status')
        .send({ status: 'read' });

      expect(res.status).toBe(200);
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .put('/api/contact/1/status')
        .send({ status: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/contact/:id', () => {
    it('should delete a message', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete('/api/contact/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
