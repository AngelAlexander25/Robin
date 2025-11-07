import axiosInstance from '@/lib/axios';

export interface DashboardStats {
  totalLogs: number;
  totalPages: number;
  activePages: number;
  todayLogs: number;
}

export interface LogsChartData {
  date: string;
  count: number;
}

export interface TopAction {
  actionTypeId: number;
  count: number;
  actionName: string;
}

export interface TopPage {
  pageId: number;
  pageName: string;
  count: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await axiosInstance.get('/Dashboard/stats');
    return response.data;
  },

  async getRecentLogs(count: number = 10): Promise<any[]> {
    const response = await axiosInstance.get(`/Dashboard/recent-logs?count=${count}`);
    return response.data;
  },

  async getTopActions(count: number = 5): Promise<TopAction[]> {
    const response = await axiosInstance.get(`/Dashboard/top-actions?count=${count}`);
    return response.data;
  },

  async getTopPages(count: number = 5): Promise<TopPage[]> {
    const response = await axiosInstance.get(`/Dashboard/top-pages?count=${count}`);
    return response.data;
  },

  async getLogsChart(days: number = 7): Promise<LogsChartData[]> {
    const response = await axiosInstance.get(`/Dashboard/logs-chart?days=${days}`);
    return response.data;
  },

  async getStatsByDate(fromDate?: string, toDate?: string): Promise<any> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    
    const response = await axiosInstance.get('/Dashboard/stats-by-date', { params });
    return response.data;
  },

  async getHealth(): Promise<any> {
    const response = await axiosInstance.get('/Dashboard/health');
    return response.data;
  },
};
