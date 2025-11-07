using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AdminRobin.Services.Interfaces;

namespace AdminRobin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Obtiene estadísticas generales del dashboard
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _dashboardService.GetDashboardStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene logs recientes para el dashboard
        /// </summary>
        [HttpGet("recent-logs")]
        public async Task<IActionResult> GetRecentLogs([FromQuery] int count = 10)
        {
            try
            {
                if (count <= 0 || count > 50)
                    count = 10;

                var recentLogs = await _dashboardService.GetRecentLogsAsync(count);
                return Ok(recentLogs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene las acciones más frecuentes
        /// </summary>
        [HttpGet("top-actions")]
        public async Task<IActionResult> GetTopActions([FromQuery] int count = 5)
        {
            try
            {
                if (count <= 0 || count > 20)
                    count = 5;

                var topActions = await _dashboardService.GetTopActionsAsync(count);
                return Ok(topActions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene las páginas más visitadas
        /// </summary>
        [HttpGet("top-pages")]
        public async Task<IActionResult> GetTopPages([FromQuery] int count = 5)
        {
            try
            {
                if (count <= 0 || count > 20)
                    count = 5;

                var topPages = await _dashboardService.GetTopPagesAsync(count);
                return Ok(topPages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene datos para gráficos de logs por fecha
        /// </summary>
        [HttpGet("logs-chart")]
        public async Task<IActionResult> GetLogsChartData([FromQuery] int days = 7)
        {
            try
            {
                if (days <= 0 || days > 365)
                    days = 7;

                var chartData = await _dashboardService.GetLogsChartDataAsync(days);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene estadísticas del dashboard por rango de fechas
        /// </summary>
        [HttpGet("stats-by-date")]
        public async Task<IActionResult> GetDashboardStatsByDateRange(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            try
            {
                var from = fromDate ?? DateTime.Today.AddDays(-30);
                var to = toDate ?? DateTime.Today;

                if (from > to)
                    return BadRequest("La fecha inicial debe ser menor que la fecha final");

                var stats = await _dashboardService.GetDashboardStatsByDateRangeAsync(from, to);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Endpoint de prueba para verificar que el dashboard funciona
        /// </summary>
        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                message = "Dashboard API funcionando correctamente"
            });
        }
    }
}