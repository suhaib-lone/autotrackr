const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Job {
  _id: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  link: string;
  applied: boolean;
  date_added: string;
  source?: string;
  skills_matched: string[];
}

export interface JobCreate {
  title: string;
  company: string;
  location?: string;
  description: string;
  link: string;
  applied?: boolean;
  skills_matched?: string[];
  source?: string;
}

export interface User {
  username: string;
  email: string;
  skills: string[];
  telegram_chat_id?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async signup(username: string, email: string, password: string, telegram_chat_id: string = '') {
    return this.request<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, telegram_chat_id, skills: [] }),
    });
  }

  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Invalid credentials');
    }

    const data: LoginResponse = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  // Jobs
  async getJobs() {
    return this.request<Job[]>('/jobs/');
  }

  async getJob(id: string) {
    return this.request<Job>(`/jobs/${id}`);
  }

  async createJob(job: JobCreate) {
    return this.request<Job>('/jobs/', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  async updateJob(id: string, job: Partial<JobCreate>) {
    return this.request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(job),
    });
  }

  async deleteJob(id: string) {
    return this.request<{ message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async updateSkills(skills: string[]) {
    return this.request<{ message: string; skills: string[] }>('/auth/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    });
  }

  async getProfile() {
    return this.request<{
      username: string;
      email: string;
      telegram_chat_id: string;
      skills: string[];
    }>('/auth/me');
  }

  async updateTelegramChatId(telegram_chat_id: string) {
    return this.request<{ message: string; telegram_chat_id: string }>('/auth/telegram', {
      method: 'PUT',
      body: JSON.stringify({ telegram_chat_id }),
    });
  }

  async getTelegramLink() {
    return this.request<{ link: string; token: string; bot_username: string }>('/auth/telegram/link');
  }
}

export const apiClient = new ApiClient();
