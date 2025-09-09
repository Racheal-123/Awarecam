import axios from 'axios';

export class Entity {
  static client = axios.create({
    baseURL: import.meta.env.VITE_API_URL
  });

  static setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  static clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  static async get(id) {
    const response = await this.client.get(`/${this.endpoint}/${id}`);
    return response.data;
  }

  static async list(params = {}) {
    const response = await this.client.get(`/${this.endpoint}`, { params });
    return response.data;
  }

  static async create(data) {
    const response = await this.client.post(`/${this.endpoint}`, data);
    return response.data;
  }

  static async update(id, data) {
    const response = await this.client.patch(`/${this.endpoint}/${id}`, data);
    return response.data;
  }

  static async delete(id) {
    await this.client.delete(`/${this.endpoint}/${id}`);
  }
}
