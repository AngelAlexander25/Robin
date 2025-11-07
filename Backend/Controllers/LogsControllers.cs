using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AdminRobin.Services.Interfaces;
using AdminRobin.Models.DTOs;

namespace AdminRobin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LogsController : ControllerBase
    {
        private readonly ILogService _logService;

        public LogsController(ILogService logService)
        {
            _logService = logService;
        }

        /// <summary>
        /// Obtiene todos los logs
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllLogs()
        {
            try
            {
                var logs = await _logService.GetAllLogsAsync();
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene un log por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLogById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("ID debe ser mayor que 0");

                var log = await _logService.GetLogByIdAsync(id);
                if (log == null)
                    return NotFound($"Log con ID {id} no encontrado");

                return Ok(log);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene logs con paginación
        /// </summary>
        [HttpGet("paginated")]
        public async Task<IActionResult> GetPaginatedLogs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] int? pageId = null, [FromQuery] int? actionTypeId = null)
        {
            try
            {
                if (pageNumber <= 0)
                    pageNumber = 1;
                if (pageSize <= 0 || pageSize > 100)
                    pageSize = 10;

                var logs = await _logService.GetPaginatedLogsAsync(pageNumber, pageSize, pageId, actionTypeId);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene logs recientes
        /// </summary>
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentLogs([FromQuery] int count = 10)
        {
            try
            {
                if (count <= 0 || count > 50)
                    count = 10;

                var logs = await _logService.GetRecentLogsAsync(count);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Crea un nuevo log
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateLog([FromBody] CreateLogDto createLogDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var log = await _logService.CreateLogAsync(createLogDto);
                return CreatedAtAction(nameof(GetLogById), new { id = log.Id }, log);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Elimina un log
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLog(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("ID debe ser mayor que 0");

                var success = await _logService.DeleteLogAsync(id);
                if (!success)
                    return NotFound($"Log con ID {id} no encontrado");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene el total de logs
        /// </summary>
        [HttpGet("count")]
        public async Task<IActionResult> GetLogsCount()
        {
            try
            {
                var count = await _logService.GetTotalLogsCountAsync();
                return Ok(new { totalLogs = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }
    }
}