using AdminRobin.Data;
using AdminRobin.DTOs;
using AdminRobin.Models.DTOs;
using AdminRobin.Models.Entities;
using AdminRobin.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AdminRobin.Services.Implementations
{
    public class ExtensionService : IExtensionService
    {
        private readonly AdminRobinDbContext _context;
        private readonly ILogger<ExtensionService> _logger;

        public ExtensionService(AdminRobinDbContext context, ILogger<ExtensionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ExtensionConfigDto> GetConfigAsync(string host)
        {
            try
            {
                var page = await _context.Pages
                    .Where(p => p.Domain == host && p.Active)
                    .FirstOrDefaultAsync();

                if (page == null)
                {
                    return new ExtensionConfigDto { Tracked = false };
                }

                return new ExtensionConfigDto
                {
                    Tracked = true,
                    PageId = page.IdPages,  // ⬅️ Cambio: era page.Id
                    PageName = page.Name,
                    Selectors = page.Selectors,
                    Tags = page.Tags
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting config for host: {Host}", host);
                throw;
            }
        }

        public async Task<bool> VerifyDomainAsync(string domain)
        {
            try
            {
                return await _context.Pages
                    .AnyAsync(p => p.Domain == domain && p.Active);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying domain: {Domain}", domain);
                throw;
            }
        }

        public async Task<int> CreateLogsBatchAsync(List<CreateLogDto> logs)
        {
            try
            {
                if (logs == null || !logs.Any() || logs.Count > 100)
                {
                    throw new ArgumentException("Invalid logs count");
                }

                foreach (var logDto in logs)
                {
                    var log = new Logs
                    {
                        Extension = logDto.Extension ?? string.Empty,
                        Asesor = logDto.Asesor ?? string.Empty,
                        CallRef = logDto.CallRef ?? string.Empty,
                        IdPages = logDto.IdPages,
                        TotalDuration = logDto.TotalDuration,
                        PauseCount = logDto.PauseCount,
                        TotalPauseTime = logDto.TotalPauseTime,
                        StartTime = logDto.StartTime,
                        EndTime = logDto.EndTime, //?? DateTime.UtcNow,  // ⬅️ EndTime es requerido
                        UserAgent = logDto.UserAgent,
                        ActionTypeId = logDto.ActionTypeId,
                        Timestamp = DateTime.UtcNow  // ⬅️ Cambio: era CreatedAt, ahora es Timestamp
                    };

                    _context.Logs.Add(log);
                }

                await _context.SaveChangesAsync();
                return logs.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating logs batch");
                throw;
            }
        }

        public async Task<List<ActionType>> GetActionTypesAsync()
        {
            try
            {
                return await _context.ActionType
                    .Select(at => new ActionType
                    {
                        IdActionType = at.IdActionType,     // ⬅️ Cambio: era at.Id
                        Pausar = at.Pausar,         // ⬅️ Cambio: usamos Pausar como nombre
                        Despausar = at.Despausar // ⬅️ Cambio: usamos Despausar como descripción
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting action types");
                throw;
            }
        }
    }
}