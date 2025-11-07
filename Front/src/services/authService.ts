import axiosInstance from '@/lib/axios';

export interface LoginDto {
  userName: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterDto {
  userName: string;
  name: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  userTypeId: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    userName: string;
    name: string;
    lastName: string;
    userTypeId: number;
  };
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await axiosInstance.post('/Auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await axiosInstance.post('/Auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/Auth/logout');
    localStorage.removeItem('token');
  },

  async getProfile(): Promise<any> {
    const response = await axiosInstance.get('/Auth/profile');
    return response.data;
  },

  async validateToken(): Promise<boolean> {
    try {
      await axiosInstance.get('/Auth/validate-token');
      return true;
    } catch {
      return false;
    }
  },

  async changePassword(data: ChangePasswordDto): Promise<void> {
    await axiosInstance.post('/Auth/change-password', data);
  },
};
