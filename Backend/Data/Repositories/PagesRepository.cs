using AdminRobin.Data;
using AdminRobin.Models.Entities;

namespace AdminRobin.Data.Repositories
{
    public class PagesRepository : GenericRepository<Pages>
    {
        private readonly AdminRobinDbContext _context;
        public PagesRepository(AdminRobinDbContext context) : base(context)
        {
            _context = context;
        }
    }
}