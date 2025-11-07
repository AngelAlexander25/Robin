using AdminRobin.Models.DTOs;

namespace AdminRobin.Services.Interfaces
{
    public interface IAdminService
    {
        // Métodos CSV Export
        Task<string> ExportUsersToCsvAsync(List<UserExportDto> users, string? fileName = null);
        Task<byte[]> GenerateCsvBytesAsync(List<UserExportDto> users);
        Task<string> ExportUsersWithStatsToCsvAsync(int? userTypeId = null, bool? isActive = null, bool includeStats = true, string? fileName = null);
        Task<int> CleanOldCsvExportsAsync(int olderThanDays = 7);
        Task<List<string>> GetAvailableCsvExportsAsync();

        // Métodos PPT Export
        Task<byte[]> ExportUsersToPptAsync(List<UserExportDto> users, string? fileName = null);
        Task<byte[]> GeneratePptBytesAsync(List<UserExportDto> users);
        Task<string> ExportUsersWithStatsToPptAsync(int? userTypeId = null, bool? isActive = null, bool includeStats = true, string? fileName = null);
        Task<string> GenerateExecutiveSummaryAsync(string? fileName = null);
        Task<int> CleanOldPptExportsAsync(int olderThanDays = 7);
        Task<List<string>> GetAvailablePptExportsAsync();

        // Métodos Users Repository
        Task<List<UserDto>> GetAllUsersAsync(int pageNumber = 1, int pageSize = 10, int? userTypeId = null, bool? isActive = null);
        Task<UserDto?> GetUserByIdAsync(int userId);
        Task<bool> UpdateUserAsync(int userId, AdminUpdateUserDto updateDto);
        Task<bool> DeleteUserAsync(int userId);
        Task<bool> ResetUserPasswordAsync(int userId, AdminResetPasswordDto resetDto);
        Task<GeneratePasswordResponseDto> GenerateRandomPasswordAsync(int length = 12);
        Task<bool> ActivateUserAsync(int userId);
        Task<bool> DeactivateUserAsync(int userId);
        Task<object> GetUserStatsAsync();
        Task<List<UserExportDto>> GetUsersForExportAsync(int? userTypeId = null, bool? isActive = null);
    }
}