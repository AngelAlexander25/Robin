using AdminRobin.Data;
using AdminRobin.Models.DTOs;
using AdminRobin.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AdminRobin.Data.Repositories
{
    public class UsersRepository : IUsersRepository
    {
        private readonly AdminRobinDbContext _context;

        public UsersRepository(AdminRobinDbContext context)
        {
            _context = context;
        }

        // Métodos originales
        public async Task AddAsync(User user)
        {
            await _context.Set<User>().AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(User user)
        {
            _context.Set<User>().Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Set<User>().ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Set<User>().FindAsync(id);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Set<User>().FirstOrDefaultAsync(u => u.UserName == username);
        }

        public async Task UpdateAsync(User user)
        {
            _context.Set<User>().Update(user);
            await _context.SaveChangesAsync();
        }

        // Métodos nuevos para AdminService
        public async Task<List<UserDto>> GetAllUsersAsync(int pageNumber = 1, int pageSize = 10, int? userTypeId = null, bool? isActive = null)
        {
            var query = _context.Set<User>()
                .Include(u => u.UserType)
                .AsQueryable();

            if (userTypeId.HasValue)
                query = query.Where(u => u.UserTypesId == userTypeId.Value);

            var users = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDto
                {
                    Id = u.IdUsuario,
                    UserName = u.UserName,
                    Name = u.Name,
                    LastName = u.LastName,
                    UserTypeId = u.UserTypesId,
                    UserTypeName = u.UserType.Descripcion,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return users;
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _context.Set<User>()
                .Include(u => u.UserType)
                .Where(u => u.IdUsuario == userId)
                .Select(u => new UserDto
                {
                    Id = u.IdUsuario,
                    UserName = u.UserName,
                    Name = u.Name,
                    LastName = u.LastName,
                    UserTypeId = u.UserTypesId,
                    UserTypeName = u.UserType.Descripcion,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            return user;
        }

        public async Task<bool> UpdateUserAsync(int userId, AdminUpdateUserDto updateDto)
        {
            var user = await _context.Set<User>().FindAsync(userId);
            if (user == null)
                return false;

            if (!string.IsNullOrEmpty(updateDto.UserName))
                user.UserName = updateDto.UserName;

            if (!string.IsNullOrEmpty(updateDto.Name))
                user.Name = updateDto.Name;

            if (!string.IsNullOrEmpty(updateDto.LastName))
                user.LastName = updateDto.LastName;

            if (updateDto.UserTypeId.HasValue)
                user.UserTypesId = updateDto.UserTypeId.Value;

            user.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _context.Set<User>().FindAsync(userId);
            if (user == null)
                return false;

            _context.Set<User>().Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetPasswordAsync(int userId, string newPassword)
        {
            var user = await _context.Set<User>().FindAsync(userId);
            if (user == null)
                return false;

            user.Password = newPassword;
            user.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserStatusAsync(int userId, bool isActive)
        {
            return await Task.FromResult(true);
        }

        public async Task<object> GetUserStatsAsync()
        {
            var totalUsers = await _context.Set<User>().CountAsync();

            return new
            {
                TotalUsers = totalUsers
            };
        }

        public async Task<List<UserExportDto>> GetUsersForExportAsync(int? userTypeId = null, bool? isActive = null)
        {
            var query = _context.Set<User>()
                .Include(u => u.UserType)
                .AsQueryable();

            if (userTypeId.HasValue)
                query = query.Where(u => u.UserTypesId == userTypeId.Value);

            var users = await query
                .Select(u => new UserExportDto
                {
                    Id = u.IdUsuario,
                    UserName = u.UserName,
                    Name = u.Name,
                    LastName = u.LastName,
                    UserTypeName = u.UserType.Descripcion,
                    Status = "Active",
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return users;
        }
    }
}