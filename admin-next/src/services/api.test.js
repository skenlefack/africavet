import { getToken } from './api';

describe('getToken', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('returns null when no userDetails in localStorage', () => {
        expect(getToken()).toBeNull();
    });

    test('returns token when userDetails exists with token', () => {
        localStorage.setItem('userDetails', JSON.stringify({ token: 'abc123' }));
        expect(getToken()).toBe('abc123');
    });

    test('returns null when userDetails has no token', () => {
        localStorage.setItem('userDetails', JSON.stringify({ email: 'test@test.com' }));
        expect(getToken()).toBeNull();
    });

    test('returns null on invalid JSON', () => {
        localStorage.setItem('userDetails', 'not-json');
        expect(getToken()).toBeNull();
    });
});
