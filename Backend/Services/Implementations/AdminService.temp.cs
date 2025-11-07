using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AdminRobin.Data.Repositories;
using AdminRobin.Models.DTOs;
using AdminRobin.Services.Interfaces;

namespace AdminRobin.Services.Implementations
{
    public class AdminServiceTemp : IAdminService
    {
        private readonly ICsvExportService _csvExportService;
        private readonly IPptExportService _pptExportService;
        private readonly IUsersRepository _usersRepository;
        
        public AdminServiceTemp(
            ICsvExportService csvExportService,
            IPptExportService pptExportService,
            IUsersRepository usersRepository)
        {
            _csvExportService = csvExportService;
            _pptExportService = pptExportService;
            _usersRepository = usersRepository;
        }

        public async Task<string> ExportUsersToCsvAsync(List<UserExportDto> users, string? fileName = null)
        {
            return await _csvExportService.ExportUsersToCsvAsync(users, fileName);
        }

        public async Task<byte[]> GenerateCsvBytesAsync(List<UserExportDto> users)
        {
            return await _csvExportService.GenerateCsvBytesAsync(users);
        }

        public async Task<string> ExportUsersWithStatsToCsvAsync(int? userTypeId = null, bool? isActive = null, bool includeStats = true, string? fileName = null)
        {
            return await _csvExportService.ExportUsersWithStatsToCsvAsync(userTypeId, isActive, includeStats, fileName);
        }

        public async Task<int> CleanOldCsvExportsAsync(int olderThanDays = 7)
        {
            return await _csvExportService.CleanOldCsvExportsAsync(olderThanDays);
        }

        public async Task<List<string>> GetAvailableCsvExportsAsync()
        {
            return await _csvExportService.GetAvailableCsvExportsAsync();
        }

        public async Task<byte[]> ExportUsersToPptAsync(List<UserExportDto> users, string? fileName = null)
        {
            return await _pptExportService.ExportUsersToPptAsync(users, fileName);
        }

        public async Task<byte[]> GeneratePptBytesAsync(List<UserExportDto> users)
        {
            return await _pptExportService.GeneratePptBytesAsync(users);
        }

        public async Task<string> ExportUsersWithStatsToPptAsync(int? userTypeId = null, bool? isActive = null, bool includeStats = true, string? fileName = null)
        {
            return await _pptExportService.ExportUsersWithStatsToPptAsync(userTypeId, isActive, includeStats, fileName);
        }

        public async Task<string> GenerateExecutiveSummaryAsync(string? fileName = null)
        {
            return await _pptExportService.GenerateExecutiveSummaryAsync(fileName);
        }

        public async Task<int> CleanOldPptExportsAsync(int olderThanDays = 7)
        {
            return await _pptExportService.CleanOldPptExportsAsync(olderThanDays);
        }

        public async Task<List<string>> GetAvailablePptExportsAsync()
        {
            return await _pptExportService.GetAvailablePptExportsAsync();
        }

        public async Task<List<UserDto>> GetAllUsersAsync(int pageNumber = 1, int pageSize = 10, int? userTypeId = null, bool? isActive = null)
        {
            return await _usersRepository.GetAllUsersAsync(pageNumber, pageSize, userTypeId, isActive);
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            return await _usersRepository.GetUserByIdAsync(userId);
        }

        public async Task<bool> UpdateUserAsync(int userId, AdminUpdateUserDto updateDto)
        {
            return await _usersRepository.UpdateUserAsync(userId, updateDto);
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            return await _usersRepository.DeleteUserAsync(userId);
        }

        public async Task<bool> ResetUserPasswordAsync(int userId, AdminResetPasswordDto resetDto)
        {
            if (string.IsNullOrEmpty(resetDto.NewPassword))
                return false;

            return await _usersRepository.ResetPasswordAsync(userId, resetDto.NewPassword);
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
            return await _usersRepository.UpdateUserStatusAsync(userId, true);
        }

        public async Task<bool> DeactivateUserAsync(int userId)
        {
            return await _usersRepository.UpdateUserStatusAsync(userId, false);
        }

        public async Task<object> GetUserStatsAsync()
        {
            return await _usersRepository.GetUserStatsAsync();
        }

        public async Task<List<UserExportDto>> GetUsersForExportAsync(int? userTypeId = null, bool? isActive = null)
        {
            return await _usersRepository.GetUsersForExportAsync(userTypeId, isActive);
        }
    }
}