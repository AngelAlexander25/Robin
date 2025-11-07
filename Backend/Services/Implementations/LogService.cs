using AdminRobin.Data.Repositories;
using AdminRobin.Models.DTOs;
using AdminRobin.Models.Entities;
using AdminRobin.Services.Interfaces;

namespace AdminRobin.Services.Implementations
{
    public class LogService : ILogService
    {
        private readonly LogsRepository _logsRepository;

        public LogService(LogsRepository logsRepository)
        {
            _logsRepository = logsRepository;
        }

        public async Task<IEnumerable<LogDto>> GetAllLogsAsync()
        {
            var logs = await _logsRepository.GetAllAsync();
            return logs.Select(MapToLogDto);
        }

        public async Task<LogDto?> GetLogByIdAsync(int id)
        {
            var log = await _logsRepository.GetByIdAsync(id);
            return log != null ? MapToLogDto(log) : null;
        }

        public async Task<PaginatedLogsDto> GetPaginatedLogsAsync(int pageNumber, int pageSize, int? pageId = null, int? actionTypeId = null)
        {
            var totalRecords = await _logsRepository.GetCountFilteredAsync(pageId, actionTypeId);
            var totalPages = (int)Math.Ceiling((double)(totalRecords == 0 ? 1 : totalRecords) / pageSize);

            var logs = await _logsRepository.GetPagedFilteredAsync(pageNumber, pageSize, pageId, actionTypeId);
            var logDtos = logs.Select(MapToLogDto);

            return new PaginatedLogsDto
            {
                Logs = logDtos,
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalRecords = totalRecords,
                TotalPages = totalPages,
                HasNextPage = pageNumber < totalPages,
                HasPreviousPage = pageNumber > 1
            };
        }

        public async Task<IEnumerable<LogDto>> GetRecentLogsAsync(int count)
        {
            var logs = await _logsRepository.GetRecentLogsAsync(count);
            return logs.Select(MapToLogDto);
        }

        public async Task<LogDto> CreateLogAsync(CreateLogDto createLogDto)
        {
            var log = new Logs
            {
                Extension = createLogDto.Extension,
                Asesor = createLogDto.Asesor,
                CallRef = createLogDto.CallRef,
                IdPages = createLogDto.IdPages,
                Timestamp = DateTime.Now,
                TotalDuration = createLogDto.TotalDuration,
                PauseCount = createLogDto.PauseCount,
                TotalPauseTime = createLogDto.TotalPauseTime,
                StartTime = createLogDto.StartTime,
                EndTime = createLogDto.EndTime,
                UserAgent = createLogDto.UserAgent,
                ActionTypeId = createLogDto.ActionTypeId
            };

            await _logsRepository.AddAsync(log);
            return MapToLogDto(log);
        }

        public async Task<bool> DeleteLogAsync(int id)
        {
            var log = await _logsRepository.GetByIdAsync(id);
            if (log == null) return false;

            await _logsRepository.DeleteAsync(log);
            return true;
        }

        public async Task<int> GetTotalLogsCountAsync()
        {
            var logs = await _logsRepository.GetAllAsync();
            return logs.Count();
        }

        private static LogDto MapToLogDto(Logs log)
        {
            return new LogDto
            {
                Id = log.IdLogs,
                Extension = log.Extension,
                Asesor = log.Asesor,
                CallRef = log.CallRef,
                PageName = log.Pages?.Name,
                Timestamp = log.Timestamp,
                TotalDuration = log.TotalDuration,
                PauseCount = log.PauseCount,
                StartTime = log.StartTime,
                EndTime = log.EndTime,
                ActionTypeName = log.ActionType?.Pausar ?? log.ActionType?.Despausar
            };
        }
    }
}