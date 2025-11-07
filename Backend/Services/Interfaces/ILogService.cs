using AdminRobin.Models.DTOs;

namespace AdminRobin.Services.Interfaces
{
    public interface ILogService
    {
        Task<IEnumerable<LogDto>> GetAllLogsAsync();
        Task<LogDto?> GetLogByIdAsync(int id);
    Task<PaginatedLogsDto> GetPaginatedLogsAsync(int pageNumber, int pageSize, int? pageId = null, int? actionTypeId = null);
        Task<IEnumerable<LogDto>> GetRecentLogsAsync(int count);
        Task<LogDto> CreateLogAsync(CreateLogDto createLogDto);
        Task<bool> DeleteLogAsync(int id);
        Task<int> GetTotalLogsCountAsync();
    }
}