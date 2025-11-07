using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AdminRobin.Services.Interfaces;
using AdminRobin.Models.DTOs;
using System.Security.Claims;

namespace AdminRobin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Iniciar sesión de usuario
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _authService.LoginAsync(loginDto);
                if (result == null)
                    return Unauthorized("Credenciales inválidas");

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Registrar nuevo usuario
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _authService.RegisterAsync(registerDto);
                return CreatedAtAction(nameof(GetUserProfile), new { id = user.Id }, user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene el perfil del usuario autenticado
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                    return Unauthorized("Token inválido");

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                    return NotFound("Usuario no encontrado");

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene un usuario por su ID (solo para admins)
        /// </summary>
        [HttpGet("user/{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("ID debe ser mayor que 0");

                var user = await _authService.GetUserByIdAsync(id);
                if (user == null)
                    return NotFound("Usuario no encontrado");

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene un usuario por nombre de usuario
        /// </summary>
        [HttpGet("user/username/{username}")]
        [Authorize]
        public async Task<IActionResult> GetUserByUsername(string username)
        {
            try
            {
                if (string.IsNullOrEmpty(username))
                    return BadRequest("El nombre de usuario es requerido");

                var user = await _authService.GetUserByUsernameAsync(username);
                if (user == null)
                    return NotFound("Usuario no encontrado");

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Cambiar contraseña del usuario autenticado
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                    return Unauthorized("Token inválido");

                var success = await _authService.ChangePasswordAsync(userId, changePasswordDto);
                if (!success)
                    return BadRequest("No se pudo cambiar la contraseña. Verifica la contraseña actual.");

                return Ok(new { message = "Contraseña cambiada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Actualizar información del usuario autenticado
        /// </summary>
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                    return Unauthorized("Token inválido");

                var success = await _authService.UpdateUserAsync(userId, updateUserDto);
                if (!success)
                    return BadRequest("No se pudo actualizar el perfil del usuario");

                var updatedUser = await _authService.GetUserByIdAsync(userId);
                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Cerrar sesión (invalidar token)
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                    return Unauthorized("Token inválido");

                // En una implementación real, podrías invalidar el token en una blacklist
                var authHeader = Request.Headers["Authorization"].FirstOrDefault();
                var token = authHeader?.Split(' ').Last() ?? string.Empty;

                // Obtener expiracion del token si esta presente
                DateTime expiration = DateTime.UtcNow.AddHours(24);
                try
                {
                    var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);
                    var expClaim = jwt.Claims.FirstOrDefault(c => c.Type == "exp")?.Value;
                    if (expClaim != null && long.TryParse(expClaim, out var expUnix))
                    {
                        expiration = DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime;
                    }
                }
                catch { /* ignore parse errors */ }

                await _authService.LogoutAsync(userId, token, expiration);

                return Ok(new { message = "Sesión cerrada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Validar token actual
        /// </summary>
        [HttpGet("validate-token")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(usernameClaim))
                return Unauthorized("Token inválido");

            return Ok(new
            {
                valid = true,
                userId = userIdClaim,
                username = usernameClaim,
                message = "Token válido"
            });
        }
    }
}