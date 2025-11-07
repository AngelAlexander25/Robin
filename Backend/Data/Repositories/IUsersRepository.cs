using AdminRobin.Models.DTOs;
using AdminRobin.Models.Entities;

namespace AdminRobin.Data.Repositories
{
    public interface IUsersRepository
    {
        // Métodos originales (si los necesitas en otro lugar)
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByUsernameAsync(string username);
        Task<IEnumerable<User>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);

        // Métodos requeridos por AdminService
        Task<List<UserDto>> GetAllUsersAsync(int pageNumber = 1, int pageSize = 10, int? userTypeId = null, bool? isActive = null);
        Task<UserDto?> GetUserByIdAsync(int userId);
        Task<bool> UpdateUserAsync(int userId, AdminUpdateUserDto updateDto);
        Task<bool> DeleteUserAsync(int userId);
        Task<bool> ResetPasswordAsync(int userId, string newPassword);
        Task<bool> UpdateUserStatusAsync(int userId, bool isActive);
        Task<object> GetUserStatsAsync();
        Task<List<UserExportDto>> GetUsersForExportAsync(int? userTypeId = null, bool? isActive = null);
    }
}