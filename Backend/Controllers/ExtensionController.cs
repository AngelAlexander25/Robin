using AdminRobin.Data;
using AdminRobin.Models.DTOs;
using AdminRobin.Models.Entities;
using AdminRobin.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdminRobin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExtensionController : ControllerBase
    {
        private readonly ILogger<ExtensionController> _logger;
        private readonly IExtensionService _extensionService;

        public ExtensionController(
            ILogger<ExtensionController> logger,
            IExtensionService extensionService)
        {
            _logger = logger;
            _extensionService = extensionService;
        }

        /// <summary>
        /// Obtiene la configuración de una página específica para la extensión
        /// No requiere autenticación - la extensión puede llamarlo libremente
        /// </summary>
        [HttpGet("config")]
        [AllowAnonymous]
        public async Task<IActionResult> GetConfig([FromQuery] string host)
        {
            try
            {
                if (string.IsNullOrEmpty(host))
                {
                    return BadRequest(new { message = "Host is required" });
                }

                var config = await _extensionService.GetConfigAsync(host);

                if (!config.Tracked)
                {
                    return NotFound(new
                    {
                        message = "Page not configured",
                        tracked = false
                    });
                }

                return Ok(new
                {
                    tracked = config.Tracked,
                    pageId = config.PageId,
                    pageName = config.PageName,
                    selectors = config.Selectors,
                    tags = config.Tags
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting extension config for host: {Host}", host);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Verifica si un dominio está siendo rastreado
        /// </summary>
        [HttpGet("verify-domain")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyDomain([FromQuery] string domain)
        {
            try
            {
                if (string.IsNullOrEmpty(domain))
                {
                    return BadRequest(new { message = "Domain is required" });
                }

                var tracked = await _extensionService.VerifyDomainAsync(domain);

                return Ok(new { tracked });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying domain: {Domain}", domain);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Recibe múltiples logs en batch desde la extensión
        /// Útil cuando la extensión acumula varios logs antes de enviar
        /// </summary>
        [HttpPost("logs/batch")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateLogsBatch([FromBody] List<CreateLogDto> logs)
        {
            try
            {
                if (logs == null || !logs.Any())
                {
                    return BadRequest(new { message = "No logs provided" });
                }

                if (logs.Count > 100)
                {
                    return BadRequest(new { message = "Maximum 100 logs per batch" });
                }

                var count = await _extensionService.CreateLogsBatchAsync(logs);

                return Ok(new
                {
                    message = "Logs created successfully",
                    count = count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating logs batch");
                return StatusCode(500, new { message = "Error saving logs" });
            }
        }

        /// <summary>
        /// Endpoint de health check para la extensión
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                version = "1.0"
            });
        }

        /// <summary>
        /// Obtiene los tipos de acciones disponibles
        /// Útil para que la extensión sepa qué actionTypeId usar
        /// </summary>
        [HttpGet("action-types")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActionTypes()
        {
            try
            {
                var actionTypes = await _extensionService.GetActionTypesAsync();
                return Ok(actionTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting action types");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}