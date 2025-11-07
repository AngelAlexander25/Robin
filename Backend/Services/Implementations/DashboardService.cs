using AdminRobin.Data.Repositories;
using AdminRobin.Models.DTOs;
using AdminRobin.Services.Interfaces;

namespace AdminRobin.Services.Implementations
{
    public class DashboardService : IDashboardService
    {
        private readonly LogsRepository _logsRepository;
        private readonly PagesRepository _pagesRepository;
        private readonly GenericRepository<Models.Entities.User> _userRepository;

        public DashboardService(
            LogsRepository logsRepository,
            PagesRepository pagesRepository,
            GenericRepository<Models.Entities.User> userRepository)
        {
            _logsRepository = logsRepository;
            _pagesRepository = pagesRepository;
            _userRepository = userRepository;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var today = DateTime.Today;
            var weekAgo = today.AddDays(-7);
            var monthAgo = today.AddMonths(-1);

            var users = await _userRepository.GetAllAsync();
            var pages = await _pagesRepository.GetAllAsync();
            var allLogs = await _logsRepository.GetAllAsync();

            var stats = new DashboardStatsDto
            {
                TotalUsers = users.Count(),
                TotalPages = pages.Count(),
                ActivePages = pages.Count(p => p.Active),
                TotalLogs = allLogs.Count(),
                LogsToday = allLogs.Count(l => l.Timestamp.Date == today),
                LogsThisWeek = allLogs.Count(l => l.Timestamp >= weekAgo),
                LogsThisMonth = allLogs.Count(l => l.Timestamp >= monthAgo),
                RecentLogs = await GetRecentLogsAsync(10),
                TopActions = await GetTopActionsAsync(5),
                TopPages = await GetTopPagesAsync(5)
            };

            return stats;
        }

        public async Task<IEnumerable<RecentLogDto>> GetRecentLogsAsync(int count = 10)
        {
            var logs = await _logsRepository.GetRecentLogsAsync(count);
            return logs.Select(log => new RecentLogDto
            {
                Id = log.IdLogs,
                Extension = log.Extension,
                Asesor = log.Asesor,
                PageName = log.Pages?.Name,
                CallRef = log.CallRef,
                Timestamp = log.Timestamp
            });
        }

        public async Task<IEnumerable<TopActionDto>> GetTopActionsAsync(int count = 5)
        {
            var logs = await _logsRepository.GetAllAsync();
            var totalLogs = logs.Count();

            var topActions = logs
                .Where(l => l.ActionType != null)
                .GroupBy(l => l.ActionType!.Pausar)
                .OrderByDescending(g => g.Count())
                .Take(count)
                .Select(g => new TopActionDto
                {
                    ActionTypeName = g.Key,
                    Count = g.Count(),
                    Percentage = totalLogs > 0 ? Math.Round((double)g.Count() / totalLogs * 100, 2) : 0
                });

            return topActions;
        }

        public async Task<IEnumerable<TopPageDto>> GetTopPagesAsync(int count = 5)
        {
            var logs = await _logsRepository.GetAllAsync();
            var logsWithPages = logs.Where(l => l.Pages != null);
            var totalPageVisits = logsWithPages.Count();

            var topPages = logsWithPages
                .GroupBy(l => new { l.Pages!.Name, l.Pages.Domain })
                .OrderByDescending(g => g.Count())
                .Take(count)
                .Select(g => new TopPageDto
                {
                    PageName = g.Key.Name,
                    Domain = g.Key.Domain,
                    VisitCount = g.Count(),
                    Percentage = totalPageVisits > 0 ? Math.Round((double)g.Count() / totalPageVisits * 100, 2) : 0
                });

            return topPages;
        }

        public async Task<IEnumerable<LogsChartDataDto>> GetLogsChartDataAsync(int days = 7)
        {
            var startDate = DateTime.Today.AddDays(-days + 1);
            var logs = await _logsRepository.GetAllAsync();

            var chartData = Enumerable.Range(0, days)
                .Select(i => startDate.AddDays(i))
                .Select(date => new LogsChartDataDto
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    Count = logs.Count(l => l.Timestamp.Date == date)
                });

            return chartData;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsByDateRangeAsync(DateTime from, DateTime to)
        {
            // Normalize dates (use Date property)
            var fromDate = from.Date;
            var toDate = to.Date;

            var users = await _userRepository.GetAllAsync();
            var pages = await _pagesRepository.GetAllAsync();
                // Consultar en la BD los logs en el rango (mejor que traer todo y filtrar en memoria)
                var filteredLogs = (await _logsRepository.GetByDateRangeAsync(fromDate, toDate)).ToList();

            var stats = new DashboardStatsDto
            {
                TotalUsers = users.Count(),
                TotalPages = pages.Count(),
                ActivePages = pages.Count(p => p.Active),
                TotalLogs = filteredLogs.Count(),
                LogsToday = filteredLogs.Count(l => l.Timestamp.Date == DateTime.Today),
                LogsThisWeek = filteredLogs.Count(l => l.Timestamp >= DateTime.Today.AddDays(-7)),
                LogsThisMonth = filteredLogs.Count(l => l.Timestamp >= DateTime.Today.AddMonths(-1)),
                RecentLogs = filteredLogs
                    .OrderByDescending(l => l.Timestamp)
                    .Take(10)
                    .Select(l => new RecentLogDto
                    {
                        Id = l.IdLogs,
                        Extension = l.Extension,
                        Asesor = l.Asesor,
                        PageName = l.Pages?.Name,
                        CallRef = l.CallRef,
                        Timestamp = l.Timestamp
                    }),
                TopActions = filteredLogs
                    .Where(l => l.ActionType != null)
                    .GroupBy(l => l.ActionType!.Pausar)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => new TopActionDto
                    {
                        ActionTypeName = g.Key,
                        Count = g.Count(),
                        Percentage = filteredLogs.Count > 0 ? Math.Round((double)g.Count() / filteredLogs.Count * 100, 2) : 0
                    }),
                TopPages = filteredLogs
                    .Where(l => l.Pages != null)
                    .GroupBy(l => new { l.Pages!.Name, l.Pages.Domain })
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => new TopPageDto
                    {
                        PageName = g.Key.Name,
                        Domain = g.Key.Domain,
                        VisitCount = g.Count(),
                        Percentage = filteredLogs.Count > 0 ? Math.Round((double)g.Count() / filteredLogs.Count * 100, 2) : 0
                    })
            };

            return stats;
        }
    }
}