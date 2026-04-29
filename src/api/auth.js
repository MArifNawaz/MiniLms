import data from '../../data.json';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('auth_user') || 'null');
  }

  setToken(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  clearToken() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async signup(userInfo) {
    // Mock signup
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Date.now(),
          name: userInfo.name,
          email: userInfo.email,
          role: 'student'
        };
        this.setToken('mock-jwt-token-123', newUser);
        resolve({ user: newUser, accessToken: 'mock-jwt-token-123' });
      }, 500);
    });
  }

  async signin(creds) {
    // Mock signin against data.json
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = data.users.find(u => u.email === creds.email && u.password === creds.password);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          this.setToken('mock-jwt-token-123', userWithoutPassword);
          resolve({ user: userWithoutPassword, accessToken: 'mock-jwt-token-123' });
        } else {
          reject(new Error('Invalid credentials. Hint: use admin@minilms.com / admin123'));
        }
      }, 500);
    });
  }

  async signout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.clearToken();
        resolve();
      }, 200);
    });
  }

  async fetchUser() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.token && this.user) {
          resolve(this.user);
        } else {
          reject(new Error('Unauthorized'));
        }
      }, 300);
    });
  }
}

export const authService = new AuthService();
