import axios from 'axios';

export class Entity {
  static client = axios.create({
    baseURL: import.meta.env.VITE_API_URL
  });

  static setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  static async get(id) {
    const response = await this.client.get(`/${this.entity}/${id}`);
    return response.data;
  }

  static async list() {
    const response = await this.client.get(`/${this.entity}`);
    return response.data;
  }

  static async create(data) {
    const response = await this.client.post(`/${this.entity}`, data);
    return response.data;
  }

  static async update(id, data) {
    const response = await this.client.patch(`/${this.entity}/${id}`, data);
    return response.data;
  }

  static async delete(id) {
    const response = await this.client.delete(`/${this.entity}/${id}`);
    return response.data;
  }

  static async filter(query) {
    const response = await this.client.get(`/${this.entity}`, { params: query });
    return response.data;
  }
}
