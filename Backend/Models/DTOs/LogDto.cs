namespace AdminRobin.Models.DTOs
{
    public class LogDto
    {
        public int Id { get; set; }
        public string Extension { get; set; }
        public string Asesor { get; set; }
        public string CallRef { get; set; }
        public string? PageName { get; set; }
        public DateTime Timestamp { get; set; }
        public int? TotalDuration { get; set; }
        public int? PauseCount { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? ActionTypeName { get; set; }
    }

    public class CreateLogDto
    {
        public string Extension { get; set; }
        public string Asesor { get; set; }
        public string CallRef { get; set; }
        public int? IdPages { get; set; }
        public int? TotalDuration { get; set; }
        public int? PauseCount { get; set; }
        public int? TotalPauseTime { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? UserAgent { get; set; }
        public int? ActionTypeId { get; set; }
    }

    public class PaginatedLogsDto
    {
        public IEnumerable<LogDto> Logs { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
    }
}