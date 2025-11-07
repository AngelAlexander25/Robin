using AdminRobin.Data;
using AdminRobin.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace AdminRobin.Data.Repositories
{
    public class LogsRepository : GenericRepository<Logs>
    {
        private readonly AdminRobinDbContext _context; // ✅ Corregido: AdminRobinDbContext
        private readonly DbSet<Logs> _dbSet;

        public LogsRepository(AdminRobinDbContext context) : base(context) // ✅ Corregido: AdminRobinDbContext
        {
            _context = context;
            _dbSet = _context.Set<Logs>(); // ✅ Corregido: sin asteriscos
        }

        public async Task<IEnumerable<Logs>> GetLogsWithDetailsAsync()
        {
            return await _dbSet
                .Include(log => log.Pages)
                .Include(log => log.ActionType)
                .ToListAsync();
        }

        // Métodos adicionales útiles
        public async Task<IEnumerable<Logs>> GetPaginatedAsync(int pageNumber, int pageSize)
        {
            return await _dbSet
                .Include(log => log.Pages)
                .Include(log => log.ActionType)
                .OrderByDescending(log => log.StartTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<Logs?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(log => log.Pages)
                .Include(log => log.ActionType)
                .FirstOrDefaultAsync(log => log.IdLogs == id);
        }

        public async Task<IEnumerable<Logs>> GetRecentAsync(int count)
        {
            return await _dbSet
                .Include(log => log.Pages)
                .Include(log => log.ActionType)
                .OrderByDescending(log => log.StartTime)
                .Take(count)
                .ToListAsync();
        }

        // Alias con el nombre esperado por los servicios: GetRecentLogsAsync
        public async Task<IEnumerable<Logs>> GetRecentLogsAsync(int count)
        {
            return await GetRecentAsync(count);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _dbSet.CountAsync();
        }

        // Consulta en BD para devolver logs dentro de un rango de fechas (start inclusive, end inclusive)
        public async Task<IEnumerable<Logs>> GetByDateRangeAsync(DateTime from, DateTime to)
        {
            var start = from.Date;
            var endExclusive = to.Date.AddDays(1); // usar exclusivo para incluir todo el día "to"

            return await _dbSet
                .Include(log => log.Pages)
                .Include(log => log.ActionType)
                .Where(log => log.Timestamp >= start && log.Timestamp < endExclusive)
                .OrderByDescending(log => log.StartTime)
                .ToListAsync();
        }

        // Devuelve logs paginados con filtros opcionales por página y tipo de acción
        public async Task<IEnumerable<Logs>> GetPagedFilteredAsync(int pageNumber, int pageSize, int? pageId = null, int? actionTypeId = null)
        {
            var query = _dbSet
                .Include(log => log.Pages)
                .Include(log => log.ActionType)
                .AsQueryable();

            if (pageId.HasValue)
                query = query.Where(l => l.IdPages == pageId.Value);

            if (actionTypeId.HasValue)
                query = query.Where(l => l.ActionTypeId == actionTypeId.Value);

            return await query
                .OrderByDescending(l => l.StartTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetCountFilteredAsync(int? pageId = null, int? actionTypeId = null)
        {
            var query = _dbSet.AsQueryable();

            if (pageId.HasValue)
                query = query.Where(l => l.IdPages == pageId.Value);

            if (actionTypeId.HasValue)
                query = query.Where(l => l.ActionTypeId == actionTypeId.Value);

            return await query.CountAsync();
        }
    }
}