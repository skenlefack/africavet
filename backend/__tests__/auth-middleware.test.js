const jwt = require('jsonwebtoken');

// Mock db before requiring auth middleware
jest.mock('../config/db', () => ({
    query: jest.fn(),
}));

const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

const SECRET = 'your-secret-key';

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('auth middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('rejects request without token', async () => {
        const req = { header: jest.fn().mockReturnValue(undefined) };
        const res = mockRes();
        const next = jest.fn();

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false, message: expect.stringContaining('No token') })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('rejects request with invalid token', async () => {
        const req = { header: jest.fn().mockReturnValue('Bearer invalid-token-here') };
        const res = mockRes();
        const next = jest.fn();

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false, message: 'Invalid token.' })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('rejects if user not found in DB', async () => {
        const token = jwt.sign({ id: 999 }, SECRET);
        const req = { header: jest.fn().mockReturnValue(`Bearer ${token}`) };
        const res = mockRes();
        const next = jest.fn();

        db.query.mockResolvedValueOnce([[]]); // empty user result

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'User not found.' })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('calls next() with valid token and active user', async () => {
        const token = jwt.sign({ id: 1 }, SECRET);
        const req = { header: jest.fn().mockReturnValue(`Bearer ${token}`) };
        const res = mockRes();
        const next = jest.fn();

        db.query
            .mockResolvedValueOnce([[{ id: 1, username: 'admin', email: 'admin@test.com', role: 'admin', status: 'active' }]])
            .mockResolvedValueOnce([[{ slug: 'manage_posts' }]]);

        await auth(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual(expect.objectContaining({ id: 1, role: 'admin' }));
        expect(req.user.permissions).toContain('manage_posts');
    });
});

describe('authorize middleware', () => {
    test('allows user with matching role', () => {
        const middleware = authorize('admin', 'editor');
        const req = { user: { role: 'admin' } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('rejects user without matching role', () => {
        const middleware = authorize('admin');
        const req = { user: { role: 'viewer' } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
