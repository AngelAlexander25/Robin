namespace AdminRobin.Models.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalPages { get; set; }
        public int ActivePages { get; set; }
        public int TotalLogs { get; set; }
        public int LogsToday { get; set; }
        public int LogsThisWeek { get; set; }
        public int LogsThisMonth { get; set; }
        public IEnumerable<RecentLogDto> RecentLogs { get; set; } = new List<RecentLogDto>();
        public IEnumerable<TopActionDto> TopActions { get; set; } = new List<TopActionDto>();
        public IEnumerable<TopPageDto> TopPages { get; set; } = new List<TopPageDto>();
    }

    public class RecentLogDto
    {
        public int Id { get; set; }
        public string Extension { get; set; }
        public string Asesor { get; set; }
        public string? PageName { get; set; }
        public string CallRef { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class TopActionDto
    {
        public string ActionTypeName { get; set; }
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class TopPageDto
    {
        public string PageName { get; set; }
        public string Domain { get; set; }
        public int VisitCount { get; set; }
        public double Percentage { get; set; }
    }

    public class LogsChartDataDto
    {
        public string Date { get; set; }
        public int Count { get; set; }
    }
}