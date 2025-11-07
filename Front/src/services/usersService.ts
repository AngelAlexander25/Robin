import axiosInstance from '@/lib/axios';

export interface User {
  id: number;
  userName: string;
  name: string;
  lastName: string;
  userTypeName: string;
  userTypeId: number;
  createdAt: string;
}

export interface AdminResetPasswordDto {
  newPassword: string;
}

export const usersService = {
  async getAll(params?: { 
    pageNumber?: number; 
    pageSize?: number; 
    userTypeId?: number; 
    isActive?: boolean 
  }): Promise<User[]> {
    const finalParams = { pageNumber: 1, pageSize: 50, ...(params || {}) };
    const response = await axiosInstance.get('/Admin/users', { params: finalParams });
    return response.data;
  },

  async getById(userId: number): Promise<User> {
    const response = await axiosInstance.get(`/Admin/users/${userId}`);
    return response.data;
  },

  async resetPassword(userId: number, newPassword: string): Promise<void> {
    console.log('Resetting password for user ID:', newPassword);

    await axiosInstance.post(`/Admin/users/${userId}/reset-password`, { 
      newPassword 
    });
  },

  async exportCSV(params?: { userTypeId?: number; isActive?: boolean }): Promise<Blob> {
    const response = await axiosInstance.get('/Admin/users/export/csv', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async generatePassword(length: number = 12): Promise<string> {
    const response = await axiosInstance.get('/Admin/users/generate-password', {
      params: { length }
    });
    return response.data.password;
  },

  async activateUser(userId: number): Promise<void> {
    await axiosInstance.post(`/Admin/users/${userId}/activate`);
  },

  async deactivateUser(userId: number): Promise<void> {
    await axiosInstance.post(`/Admin/users/${userId}/deactivate`);
  },

  async getStats(): Promise<any> {
    const response = await axiosInstance.get('/Admin/users/stats');
    return response.data;
  },
};
