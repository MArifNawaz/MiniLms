const BASE_URL = 'http://localhost:3000/api/v1';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }

  async signup(userInfo) {
    const data = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userInfo)
    });
    this.setToken(data.accessToken);
    return data;
  }

  async signin(creds) {
    const data = await this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(creds)
    });
    this.setToken(data.accessToken);
    return data;
  }

  async signout() {
    await this.request('/sessions/logout', { method: 'DELETE' });
    this.clearToken();
  }

  async fetchUser() {
    return this.request('/me');
  }
}

export const authService = new AuthService();
