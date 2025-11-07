import axiosInstance from '@/lib/axios';

export interface Log {
  id: number;
  extension: string;
  asesor: string;
  callRef: string;
  idPages?: number;
  totalDuration?: number;
  pauseCount?: number;
  totalPauseTime?: number;
  startTime: string;
  endTime: string;
  userAgent: string;
  actionTypeId?: number;
  createdAt?: string;
  page?: {
    name: string;
    domain: string;
  };
}

export interface PaginatedLogs {
  items: Log[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const logsService = {
  async getAll(): Promise<Log[]> {
    const response = await axiosInstance.get('/Logs');
    return response.data;
  },

  async getPaginated(
    pageNumber: number = 1,
    pageSize: number = 10,
    pageId?: number,
    actionTypeId?: number
  ): Promise<PaginatedLogs> {
    const params: any = { pageNumber, pageSize };
    if (pageId) params.pageId = pageId;
    if (actionTypeId) params.actionTypeId = actionTypeId;
    
    const response = await axiosInstance.get('/Logs/paginated', { params });
    return response.data;
  },

  async getById(id: number): Promise<Log> {
    const response = await axiosInstance.get(`/Logs/${id}`);
    return response.data;
  },

  async getRecent(count: number = 10): Promise<Log[]> {
    const response = await axiosInstance.get(`/Logs/recent?count=${count}`);
    return response.data;
  },

  async getCount(): Promise<number> {
    const response = await axiosInstance.get('/Logs/count');
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/Logs/${id}`);
  },
};
