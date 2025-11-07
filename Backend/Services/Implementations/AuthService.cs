using AdminRobin.Data.Repositories;
using AdminRobin.Models.DTOs;
using AdminRobin.Models.Entities;
using AdminRobin.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AdminRobin.Services.Implementations
{
    public class AuthService : IAuthService
    {
    private readonly AdminRobin.Data.Repositories.IUsersRepository _userRepository;
        private readonly GenericRepository<UserType> _userTypeRepository;
        private readonly IConfiguration _configuration;
        private readonly Services.Interfaces.ITokenBlacklistService? _tokenBlacklistService;
    private readonly Microsoft.Extensions.Logging.ILogger<AuthService> _logger;

        public AuthService(
            AdminRobin.Data.Repositories.IUsersRepository userRepository,
            GenericRepository<UserType> userTypeRepository,
            IConfiguration configuration,
            Services.Interfaces.ITokenBlacklistService? tokenBlacklistService = null,
            Microsoft.Extensions.Logging.ILogger<AuthService>? logger = null)
        {
            _userRepository = userRepository;
            _userTypeRepository = userTypeRepository;
            _configuration = configuration;
            _tokenBlacklistService = tokenBlacklistService;
            _logger = logger ?? Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByUsernameAsync(loginDto.UserName);

            if (user == null || !VerifyPassword(loginDto.Password, user.Password))
                return null;

            var userDto = await MapToUserDto(user);
            string token;
            try
            {
                token = await GenerateJwtTokenAsync(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT for user {UserName}", userDto.UserName);
                throw new InvalidOperationException($"No se pudo generar el token JWT: {ex.Message}", ex);
            }

            // Parse expiration from token claims or keep server default
            var expiresAt = DateTime.UtcNow.AddHours(24);

            return new LoginResponseDto
            {
                Token = token,
                User = userDto,
                ExpiresAt = expiresAt,
                TokenType = "Bearer"
            };
        }

        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            if (registerDto.Password != registerDto.ConfirmPassword)
                throw new ArgumentException("Passwords do not match");

            var users = await _userRepository.GetAllAsync();
            if (users.Any(u => u.UserName == registerDto.UserName))
                throw new ArgumentException("Username already exists");

            var user = new User
            {
                UserName = registerDto.UserName,
                Name = registerDto.Name,
                LastName = registerDto.LastName,
                Password = HashPassword(registerDto.Password),
                UserTypesId = registerDto.UserTypeId,
                CreatedAt = DateTime.Now
            };

            await _userRepository.AddAsync(user);
            return await MapToUserDto(user);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user != null ? await MapToUserDto(user) : null;
        }

        public async Task<UserDto?> GetUserByUsernameAsync(string username)
        {
            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => u.UserName == username);
            return user != null ? await MapToUserDto(user) : null;
        }

        public Task<string> GenerateJwtTokenAsync(UserDto user)
        {
            try
            {
                _logger.LogDebug("Generating JWT token for user {UserName} (id {UserId})", user.UserName, user.Id);
                var tokenHandler = new JwtSecurityTokenHandler();

                // Leer configuración de JWT (compatibilidad con appsettings.json)
                var secret = _configuration["Jwt:SecretKey"] ?? _configuration["Jwt:Key"] ?? "your-secret-key";
                var issuer = _configuration["Jwt:Issuer"];
                var audience = _configuration["Jwt:Audience"];
                var expirationHours = 24;
                if (int.TryParse(_configuration["Jwt:ExpirationHours"], out var eh))
                    expirationHours = eh;

                if (string.IsNullOrEmpty(secret))
                    throw new InvalidOperationException("JWT secret key is not configured. Please set Jwt:SecretKey in appsettings.json or environment variables.");

                var key = Encoding.UTF8.GetBytes(secret);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Name, user.UserName),
                        new Claim("UserTypeId", user.UserTypeId.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddHours(expirationHours),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                    Issuer = issuer,
                    Audience = audience
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var written = tokenHandler.WriteToken(token);
                _logger.LogDebug("JWT token generated for user {UserName}", user.UserName);
                return Task.FromResult(written);
            }
            catch (Exception ex)
            {
                // Proporcionar mensaje claro para debugging en Swagger y loguearlo
                _logger.LogError(ex, "Error generando token JWT para user {UserName}", user?.UserName);
                throw new InvalidOperationException($"Error generando token JWT: {ex.Message}", ex);
            }
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmNewPassword)
                return false;

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || !VerifyPassword(changePasswordDto.CurrentPassword, user.Password))
                return false;

            user.Password = HashPassword(changePasswordDto.NewPassword);
            user.UpdatedAt = DateTime.Now;
            await _userRepository.UpdateAsync(user);

            return true;
        }

        public async Task<bool> UpdateUserAsync(int userId, UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (updateUserDto.UserName != null)
                user.UserName = updateUserDto.UserName;
            if (updateUserDto.Name != null)
                user.Name = updateUserDto.Name;
            if (updateUserDto.LastName != null)
                user.LastName = updateUserDto.LastName;
            if (updateUserDto.UserTypeId.HasValue)
                user.UserTypesId = updateUserDto.UserTypeId.Value;

            user.UpdatedAt = DateTime.Now;
            await _userRepository.UpdateAsync(user);

            return true;
        }

        // Logout: placeholder for token invalidation. Currently no blacklist implemented, so this is a no-op.
        public async Task LogoutAsync(int userId, string token, DateTime expiration)
        {
            if (_tokenBlacklistService != null && !string.IsNullOrEmpty(token))
            {
                await _tokenBlacklistService.RevokeTokenAsync(token, expiration);
            }

            await Task.CompletedTask;
        }

        private async Task<UserDto> MapToUserDto(User user)
        {
            var userType = await _userTypeRepository.GetByIdAsync(user.UserTypesId);

            return new UserDto
            {
                Id = user.IdUsuario,
                UserName = user.UserName,
                Name = user.Name,
                LastName = user.LastName,
                UserTypeName = userType?.Descripcion ?? "Unknown",
                UserTypeId = user.UserTypesId,
                CreatedAt = user.CreatedAt
            };
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private static bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }
}