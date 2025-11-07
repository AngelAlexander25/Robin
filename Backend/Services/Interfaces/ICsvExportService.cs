using AdminRobin.Models.DTOs;

namespace AdminRobin.Services.Interfaces
{
    public interface ICsvExportService
    {
        Task<string> ExportUsersToCsvAsync(List<UserExportDto> users, string? fileName = null);
        Task<byte[]> GenerateCsvBytesAsync(List<UserExportDto> users);
        Task<string> ExportUsersWithStatsToCsvAsync(int? userTypeId, bool? isActive, bool includeStats, string? fileName);
        Task<int> CleanOldCsvExportsAsync(int olderThanDays = 7);
        Task<List<string>> GetAvailableCsvExportsAsync();
    }
}