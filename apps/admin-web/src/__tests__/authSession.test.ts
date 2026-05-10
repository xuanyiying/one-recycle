import {
  clearAuthSession,
  readStoredAuthSession,
  writeAuthSession,
} from '@/lib/authSession';

describe('authSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('writes auth data to localStorage only', () => {
    writeAuthSession({
      token: 'token-123',
      refreshToken: 'refresh-456',
      user: { id: 'u1', name: 'tester' },
    });

    expect(localStorage.getItem('auth_token')).toBe('token-123');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-456');
    expect(localStorage.getItem('user_info')).toBe(JSON.stringify({ id: 'u1', name: 'tester' }));
    expect(document.cookie).not.toContain('auth_token=token-123');
  });

  it('clears stored auth session', () => {
    writeAuthSession({
      token: 'token-123',
      refreshToken: 'refresh-456',
      user: { id: 'u1' },
    });

    clearAuthSession();

    expect(readStoredAuthSession()).toBeNull();
  });

  it('returns null for malformed user object without required id', () => {
    localStorage.setItem('auth_token', 'token-123');
    localStorage.setItem('user_info', JSON.stringify({ username: 'tester' }));

    const session = readStoredAuthSession();

    expect(session).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('user_info')).toBeNull();
  });

  it('stores tokenExpiry in user info during refresh write', () => {
    writeAuthSession({
      token: 'token-123',
      refreshToken: 'refresh-456',
      user: { id: 'u1', username: 'tester' },
      expiresIn: 3600,
    });

    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');

    expect(typeof userInfo.tokenExpiry).toBe('number');
    expect(userInfo.tokenExpiry).toBeGreaterThan(Date.now());
  });
});
