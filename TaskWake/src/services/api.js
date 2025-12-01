const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('taskwave-token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('taskwave-token', token);
    } else {
      localStorage.removeItem('taskwave-token');
    }
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        ...this.getAuthHeaders()
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(updates) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async getTasks() {
    return this.request('/tasks');
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }
}

export default new ApiService();