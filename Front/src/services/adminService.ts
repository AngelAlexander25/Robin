import axiosInstance from '@/lib/axios';

export interface UserDto {
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

export const adminService = {
  async getUsers(params?: { pageNumber?: number; pageSize?: number; userTypeId?: number; isActive?: boolean }): Promise<UserDto[]> {
    const response = await axiosInstance.get('/Admin/users', { params });
    return response.data;
  },

  async resetUserPassword(userId: number, newPassword: string): Promise<void> {
    await axiosInstance.post(`/Admin/users/${userId}/reset-password`, {
      newPassword,
    });
  },

  async generatePassword(length: number = 12): Promise<string> {
    const response = await axiosInstance.get(`/Admin/users/generate-password`, {
      params: { length },
    });
    return response.data.password;
  },

  async activateUser(userId: number): Promise<void> {
    await axiosInstance.post(`/Admin/users/${userId}/activate`);
  },

  async deactivateUser(userId: number): Promise<void> {
    await axiosInstance.post(`/Admin/users/${userId}/deactivate`);
  },

  async exportUsersCsv(params?: { userTypeId?: number; isActive?: boolean }): Promise<void> {
    const response = await axiosInstance.get('/Admin/users/export/csv', {
      params,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};