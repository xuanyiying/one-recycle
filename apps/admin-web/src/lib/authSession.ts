const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';
const LOGIN_MODE_KEY = 'login_mode';
const TENANT_CODE_KEY = 'tenant_code';

export interface AuthUser {
  id: string;
  username?: string;
  account?: string;
  nickname?: string;
  name?: string;
  role?: string;
  avatar?: string;
  tokenExpiry?: number;
  [key: string]: unknown;
}

export interface StoredAuthSession {
  token: string;
  refreshToken: string | null;
  user: AuthUser | null;
}

interface WriteAuthSessionOptions {
  token: string;
  refreshToken?: string | null;
  user?: AuthUser | null;
  expiresIn?: number;
}

function isValidAuthUser(value: unknown): value is AuthUser {
  return (
    !!value &&
    typeof value === 'object' &&
    'id' in value &&
    typeof (value as { id?: unknown }).id === 'string'
  );
}

export function writeAuthSession({
  token,
  refreshToken,
  user,
  expiresIn,
}: WriteAuthSessionOptions) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  if (user) {
    const normalizedUser: AuthUser = {
      ...user,
      ...(expiresIn ? { tokenExpiry: Date.now() + expiresIn * 1000 } : {}),
    };
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalizedUser));
  } else {
    localStorage.removeItem(USER_INFO_KEY);
  }
}

export function readStoredAuthSession(): StoredAuthSession | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userInfo = localStorage.getItem(USER_INFO_KEY);

  if (!token) {
    return null;
  }

  if (!userInfo) {
    return {
      token,
      refreshToken,
      user: null,
    };
  }

  try {
    const parsedUser = JSON.parse(userInfo) as unknown;
    if (!isValidAuthUser(parsedUser)) {
      clearAuthSession();
      return null;
    }

    // Check token expiry
    if (parsedUser.tokenExpiry && Date.now() > parsedUser.tokenExpiry) {
      clearAuthSession();
      return null;
    }

    return {
      token,
      refreshToken,
      user: parsedUser,
    };
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  localStorage.removeItem(LOGIN_MODE_KEY);
  localStorage.removeItem(TENANT_CODE_KEY);
}
