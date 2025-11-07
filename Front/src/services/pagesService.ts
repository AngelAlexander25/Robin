import axiosInstance from '@/lib/axios';

export interface Page {
  id: number;
  name: string;
  domain: string;
  selectors: string;
  tags: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePageDto {
  name: string;
  domain: string;
  selectors: string;
  tags: string;
  active: boolean;
}

export interface UpdatePageDto {
  name?: string;
  domain?: string;
  selectors?: string;
  tags?: string;
  active?: boolean;
}

export const pagesService = {
  async getAll(): Promise<Page[]> {
    const response = await axiosInstance.get('/Pages');
    return response.data;
  },

  async getById(id: number): Promise<Page> {
    const response = await axiosInstance.get(`/Pages/${id}`);
    return response.data;
  },

  async create(data: CreatePageDto): Promise<Page> {
    const response = await axiosInstance.post('/Pages', data);
    return response.data;
  },

  async update(id: number, data: UpdatePageDto): Promise<Page> {
    const response = await axiosInstance.put(`/Pages/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/Pages/${id}`);
  },

  async activate(id: number): Promise<void> {
    await axiosInstance.patch(`/Pages/${id}/activate`);
  },

  async deactivate(id: number): Promise<void> {
    await axiosInstance.patch(`/Pages/${id}/deactivate`);
  },

  async getActive(): Promise<Page[]> {
    const response = await axiosInstance.get('/Pages/active');
    return response.data;
  },

  async getStats(): Promise<any> {
    const response = await axiosInstance.get('/Pages/stats');
    return response.data;
  },
};
