using AdminRobin.Models.DTOs;

namespace AdminRobin.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<IEnumerable<RecentLogDto>> GetRecentLogsAsync(int count = 10);
        Task<IEnumerable<TopActionDto>> GetTopActionsAsync(int count = 5);
        Task<IEnumerable<TopPageDto>> GetTopPagesAsync(int count = 5);
        Task<IEnumerable<LogsChartDataDto>> GetLogsChartDataAsync(int days = 7);
        Task<DashboardStatsDto> GetDashboardStatsByDateRangeAsync(DateTime from, DateTime to);
    }
}