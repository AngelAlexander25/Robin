using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AdminRobin.Services.Interfaces;
using AdminRobin.Models.DTOs;
using System.Text;
using System.Text.Json;
using System.Security.Cryptography;
using System.Linq;
using System.Collections.Generic;

namespace AdminRobin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PagesController : ControllerBase
    {
        private readonly IPageService _pageService;

        public PagesController(IPageService pageService)
        {
            _pageService = pageService;
        }

        /// <summary>
        /// Obtiene todas las páginas
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllPages()
        {
            try
            {
                var pages = await _pageService.GetAllPagesAsync();
                return Ok(pages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene una página por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPageById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("ID debe ser mayor que 0");

                var page = await _pageService.GetPageByIdAsync(id);
                if (page == null)
                    return NotFound($"Página con ID {id} no encontrada");

                return Ok(page);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene todas las páginas activas
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActivePages()
        {
            try
            {
                var pages = await _pageService.GetActivePagesAsync();
                return Ok(pages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Crea una nueva página
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreatePage([FromBody] CreatePageDto createPageDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var page = await _pageService.CreatePageAsync(createPageDto);
                return CreatedAtAction(nameof(GetPageById), new { id = page.Id }, page);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Actualiza una página existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePage(int id, [FromBody] UpdatePageDto updatePageDto)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("ID debe ser mayor que 0");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedPage = await _pageService.UpdatePageAsync(id, updatePageDto);
                if (updatedPage == null)
                    return NotFound($"Página con ID {id} no encontrada");

                return Ok(updatedPage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Elimina una página
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePage(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("ID debe ser mayor que 0");

                var success = await _pageService.DeletePageAsync(id);
                if (!success)
                    return NotFound($"Página con ID {id} no encontrada");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Activa una página
        /// </summary>
        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> ActivatePage(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("ID debe ser mayor que 0");

                var success = await _pageService.ActivatePageAsync(id);
                if (!success)
                    return NotFound($"Página con ID {id} no encontrada");

                return Ok(new { message = "Página activada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Desactiva una página
        /// </summary>
        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> DeactivatePage(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("ID debe ser mayor que 0");

                var success = await _pageService.DeactivatePageAsync(id);
                if (!success)
                    return NotFound($"Página con ID {id} no encontrada");

                return Ok(new { message = "Página desactivada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene estadísticas de páginas
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetPagesStats()
        {
            try
            {
                var totalPages = await _pageService.GetTotalPagesCountAsync();
                var activePages = await _pageService.GetActivePagesCountAsync();

                return Ok(new
                {
                    totalPages,
                    activePages,
                    inactivePages = totalPages - activePages
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        // ============================
        // NUEVO: Endpoint para extensión
        // ============================

        /// <summary>
        /// Config para la extensión por host (solo páginas activas del dominio).
        /// Serializa 'selectors' como objeto JSON y deriva 'tags' si viene vacío.
        /// </summary>
        [HttpGet("config")]
        [AllowAnonymous] // extensión sin token
        public async Task<IActionResult> GetConfig([FromQuery] string host)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(host))
                    return BadRequest("host es requerido (ej. volaris.com)");

                host = host.Trim().ToLowerInvariant();

                var activePages = await _pageService.GetActivePagesAsync();

                var filtered = activePages
                    .Where(p =>
                    {
                        var domain = (p.Domain ?? string.Empty).Trim().ToLowerInvariant();
                        if (string.IsNullOrWhiteSpace(domain)) return false;
                        return domain == host || domain.EndsWith("." + host);
                    })
                    .ToList();

                var payload = filtered.Select(p =>
                {
                    var selectorsObj = ParseSelectorsSafe(p.Selectors);
                    var tags = string.IsNullOrWhiteSpace(p.Tags)
                        ? string.Join(",", selectorsObj.Keys)
                        : p.Tags;

                    return new
                    {
                        id = p.Id,
                        name = p.Name,
                        domain = p.Domain,
                        match = (string[]?)null, // opcional a futuro
                        selectors = selectorsObj, // objeto JSON
                        tags,
                        updatedAt = p.UpdatedAt ?? p.CreatedAt,
                        version = (int)((p.UpdatedAt ?? p.CreatedAt).Ticks % int.MaxValue)
                    };
                }).ToList();

                var etag = ComputeETag(payload);
                Response.Headers.ETag = $"W/\"{etag}\"";

                return Ok(payload);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        // ---- helpers privados ----
        private static Dictionary<string, string[]> ParseSelectorsSafe(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
                return new Dictionary<string, string[]>();

            try
            {
                var obj = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json)
                          ?? new Dictionary<string, JsonElement>();

                var map = new Dictionary<string, string[]>();
                foreach (var kv in obj)
                {
                    if (kv.Value.ValueKind == JsonValueKind.Array)
                    {
                        var arr = new List<string>();
                        foreach (var el in kv.Value.EnumerateArray())
                        {
                            if (el.ValueKind == JsonValueKind.String)
                                arr.Add(el.GetString() ?? "");
                        }
                        if (arr.Count > 0) map[kv.Key] = arr.ToArray();
                    }
                    else if (kv.Value.ValueKind == JsonValueKind.String)
                    {
                        var s = kv.Value.GetString();
                        if (!string.IsNullOrWhiteSpace(s))
                            map[kv.Key] = new[] { s! };
                    }
                }
                return map;
            }
            catch
            {
                return new Dictionary<string, string[]>();
            }
        }

        private static string ComputeETag(object payload)
        {
            var json = JsonSerializer.Serialize(payload);
            using var sha = SHA256.Create();
            var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(json));
            return Convert.ToHexString(hash);
        }
    }
}
