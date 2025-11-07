using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AdminRobin.Data.Repositories;
using AdminRobin.Models.DTOs;
using AdminRobin.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;
namespace AdminRobin.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly ICsvExportService _csvExportSvc;
        private readonly IPptExportService _pptExportSvc;
        private readonly IUsersRepository _usersRepo;

        public AdminService(
            ICsvExportService csvExportService,
            IPptExportService pptExportService,
            IUsersRepository usersRepository)
        {
            _csvExportSvc = csvExportService ?? throw new ArgumentNullException(nameof(csvExportService));
            _pptExportSvc = pptExportService ?? throw new ArgumentNullException(nameof(pptExportService));
            _usersRepo = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
        }

        // Métodos CSV Export
        public async Task<string> ExportUsersToCsvAsync(List<UserExportDto> users, string? fileName = null)
        {
            return await _csvExportSvc.ExportUsersToCsvAsync(users, fileName);
        }

        public async Task<byte[]> GenerateCsvBytesAsync(List<UserExportDto> users)
        {
            return await _csvExportSvc.GenerateCsvBytesAsync(users);
        }

        public async Task<string> ExportUsersWithStatsToCsvAsync(int? userTypeId = null, bool? isActive = null, bool includeStats = true, string? fileName = null)
        {
            return await _csvExportSvc.ExportUsersWithStatsToCsvAsync(userTypeId, isActive, includeStats, fileName);
        }

        public async Task<int> CleanOldCsvExportsAsync(int olderThanDays = 7)
        {
            return await _csvExportSvc.CleanOldCsvExportsAsync(olderThanDays);
        }

        public async Task<List<string>> GetAvailableCsvExportsAsync()
        {
            return await _csvExportSvc.GetAvailableCsvExportsAsync();
        }

        // Métodos PPT Export
        public async Task<byte[]> ExportUsersToPptAsync(List<UserExportDto> users, string? fileName = null)
        {
            return await _pptExportSvc.ExportUsersToPptAsync(users, fileName);
        }

        public async Task<byte[]> GeneratePptBytesAsync(List<UserExportDto> users)
        {
            return await _pptExportSvc.GeneratePptBytesAsync(users);
        }

        public async Task<string> ExportUsersWithStatsToPptAsync(int? userTypeId = null, bool? isActive = null, bool includeStats = true, string? fileName = null)
        {
            return await _pptExportSvc.ExportUsersWithStatsToPptAsync(userTypeId, isActive, includeStats, fileName);
        }

        public async Task<string> GenerateExecutiveSummaryAsync(string? fileName = null)
        {
            return await _pptExportSvc.GenerateExecutiveSummaryAsync(fileName);
        }

        public async Task<int> CleanOldPptExportsAsync(int olderThanDays = 7)
        {
            return await _pptExportSvc.CleanOldPptExportsAsync(olderThanDays);
        }

        public async Task<List<string>> GetAvailablePptExportsAsync()
        {
            return await _pptExportSvc.GetAvailablePptExportsAsync();
        }

        // Métodos Users Repository
        public async Task<List<UserDto>> GetAllUsersAsync(int pageNumber = 1, int pageSize = 10, int? userTypeId = null, bool? isActive = null)
        {
            return await _usersRepo.GetAllUsersAsync(pageNumber, pageSize, userTypeId, isActive);
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            return await _usersRepo.GetUserByIdAsync(userId);
        }

        public async Task<bool> UpdateUserAsync(int userId, AdminUpdateUserDto updateDto)
        {
            return await _usersRepo.UpdateUserAsync(userId, updateDto);
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            return await _usersRepo.DeleteUserAsync(userId);
        }

        public async Task<bool> ResetUserPasswordAsync(int userId, AdminResetPasswordDto resetDto)
        {
            if (string.IsNullOrEmpty(resetDto.NewPassword))
                return false;

            string hashedPassword = HashPassword(resetDto.NewPassword);

            return await _usersRepo.ResetPasswordAsync(userId, hashedPassword);
        }
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        public Task<GeneratePasswordResponseDto> GenerateRandomPasswordAsync(int length = 12)
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            var random = new Random();
            var password = new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            return Task.FromResult(new GeneratePasswordResponseDto { Password = password });
        }

        public async Task<bool> ActivateUserAsync(int userId)
        {
            return await _usersRepo.UpdateUserStatusAsync(userId, true);
        }

        public async Task<bool> DeactivateUserAsync(int userId)
        {
            return await _usersRepo.UpdateUserStatusAsync(userId, false);
        }

        public async Task<object> GetUserStatsAsync()
        {
            return await _usersRepo.GetUserStatsAsync();
        }

        public async Task<List<UserExportDto>> GetUsersForExportAsync(int? userTypeId = null, bool? isActive = null)
        {
            return await _usersRepo.GetUsersForExportAsync(userTypeId, isActive);
        }
    }
}