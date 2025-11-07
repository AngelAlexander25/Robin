using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AdminRobin.Services.Interfaces;
using AdminRobin.Models.DTOs;

namespace AdminRobin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("users")]
        public async Task<ActionResult<List<UserDto>>> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, 
            [FromQuery] int? userTypeId = null, [FromQuery] bool? isActive = null)
        {
            var users = await _adminService.GetAllUsersAsync(pageNumber, pageSize, userTypeId, isActive);
            return Ok(users);
        }

        [HttpGet("users/{userId}")]
        public async Task<ActionResult<UserDto>> GetUserById(int userId)
        {
            var user = await _adminService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound();
            return Ok(user);
        }

        [HttpPost("users/{userId}/reset-password")]
        public async Task<ActionResult> ResetUserPassword(int userId, [FromBody] AdminResetPasswordDto resetDto)
        {
            var result = await _adminService.ResetUserPasswordAsync(userId, resetDto);
            if (!result)
                return BadRequest("No se pudo restablecer la contraseña");
            return Ok();
        }

        [HttpGet("users/export/csv")]
        public async Task<ActionResult> ExportUsersToCsv([FromQuery] int? userTypeId = null, [FromQuery] bool? isActive = null)
        {
            var users = await _adminService.GetUsersForExportAsync(userTypeId, isActive);
            var filePath = await _adminService.ExportUsersToCsvAsync(users);
            
            if (!System.IO.File.Exists(filePath))
                return NotFound("No se pudo generar el archivo de exportación");

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(fileBytes, "text/csv", Path.GetFileName(filePath));
        }

        [HttpGet("users/generate-password")]
        public async Task<ActionResult<GeneratePasswordResponseDto>> GenerateRandomPassword([FromQuery] int length = 12)
        {
            var response = await _adminService.GenerateRandomPasswordAsync(length);
            return Ok(response);
        }

        [HttpPost("users/{userId}/activate")]
        public async Task<ActionResult> ActivateUser(int userId)
        {
            var result = await _adminService.ActivateUserAsync(userId);
            if (!result)
                return BadRequest("No se pudo activar el usuario");
            return Ok();
        }

        [HttpPost("users/{userId}/deactivate")]
        public async Task<ActionResult> DeactivateUser(int userId)
        {
            var result = await _adminService.DeactivateUserAsync(userId);
            if (!result)
                return BadRequest("No se pudo desactivar el usuario");
            return Ok();
        }

        [HttpGet("users/stats")]
        public async Task<ActionResult> GetUserStats()
        {
            var stats = await _adminService.GetUserStatsAsync();
            return Ok(stats);
        }
    }
}