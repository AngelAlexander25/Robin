using AdminRobin.Models.DTOs;

namespace AdminRobin.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto?> GetUserByUsernameAsync(string username);
        Task<string> GenerateJwtTokenAsync(UserDto user);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
        Task<bool> UpdateUserAsync(int userId, UpdateUserDto updateUserDto);
        Task LogoutAsync(int userId, string token, DateTime expiration);
    }
}