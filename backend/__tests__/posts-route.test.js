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
const postsRouter = require('../routes/posts');

const app = express();
app.use(express.json());
app.use('/api/posts', postsRouter);

describe('Posts Routes', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/posts', () => {
    it('should return paginated posts', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 2 }]])
        .mockResolvedValueOnce([[
          { id: 1, title: 'Post 1', slug: 'post-1', status: 'published' },
          { id: 2, title: 'Post 2', slug: 'post-2', status: 'published' },
        ]]);

      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should support search parameter', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/posts?search=test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/posts/:slug', () => {
    it('should return a post by slug', async () => {
      db.query.mockResolvedValueOnce([[{ id: 1, title: 'Test', slug: 'test', content: 'Hello' }]]);

      const res = await request(app).get('/api/posts/test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('test');
    });

    it('should return 404 for missing post', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/posts/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 1, title: 'Test' }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete('/api/posts/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
