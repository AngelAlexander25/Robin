using Microsoft.EntityFrameworkCore;
using AdminRobin.Models.Entities;

namespace AdminRobin.Data
{
    public class AdminRobinDbContext : DbContext
    {
        public AdminRobinDbContext(DbContextOptions<AdminRobinDbContext> options) : base(options)
        {
        }

        // Propiedades DbSet para cada una de tus tablas
        public DbSet<Logs> Logs { get; set; }
        public DbSet<Pages> Pages { get; set; }
        public DbSet<ActionType> ActionType { get; set; }
        public DbSet<UserType> UserTypes { get; set; }
        public DbSet<User> Usuario { get; set; }
        public DbSet<PauseEvent> PauseEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuraciones específicas si necesitas
            base.OnModelCreating(modelBuilder);
        }
    }
}