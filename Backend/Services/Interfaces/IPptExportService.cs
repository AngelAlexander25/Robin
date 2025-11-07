using AdminRobin.Models.DTOs;

namespace AdminRobin.Services.Interfaces
{
    public interface IPptExportService
    {
        Task<byte[]> ExportUsersToPptAsync(List<UserExportDto> users, string? fileName = null);
        Task<byte[]> GeneratePptBytesAsync(List<UserExportDto> users);
        Task<string> ExportUsersWithStatsToPptAsync(int? userTypeId = null, bool? isActive = null, bool includeStats = true, string? fileName = null);
        Task<string> GenerateExecutiveSummaryAsync(string? fileName = null);
        Task<int> CleanOldPptExportsAsync(int olderThanDays = 7);
        Task<List<string>> GetAvailablePptExportsAsync();
    }
}