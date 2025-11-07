using AdminRobin.Data.Repositories;
using AdminRobin.Models.Entities;
using AdminRobin.Services.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AdminRobin.Services.Implementations
{
    public class TokenBlacklistService : ITokenBlacklistService
    {
        private readonly GenericRepository<RevokedToken> _repo;

        public TokenBlacklistService(GenericRepository<RevokedToken> repo)
        {
            _repo = repo;
        }

        public async Task RevokeTokenAsync(string token, DateTime expiration)
        {
            if (string.IsNullOrWhiteSpace(token)) return;
            try
            {
                var existing = (await _repo.GetByConditionAsync(t => t.Token == token)).FirstOrDefault();
                if (existing != null)
                {
                    // Already present: update expiration and revoked time
                    existing.Expiration = expiration;
                    existing.RevokedAt = DateTime.UtcNow;
                    await _repo.UpdateAsync(existing);
                    return;
                }

                var revoked = new RevokedToken
                {
                    Token = token,
                    RevokedAt = DateTime.UtcNow,
                    Expiration = expiration
                };

                await _repo.AddAsync(revoked);
            }
            catch (Exception)
            {
                // Si la tabla no existe o hay error en BD, no impedir el logout; simplemente ignorar.
                // Podríamos loguear aquí si se desea.
            }
        }

        public async Task<bool> IsTokenRevokedAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return false;
            try
            {
                var list = await _repo.GetByConditionAsync(t => t.Token == token && t.Expiration > DateTime.UtcNow);
                return list.Any();
            }
            catch (Exception)
            {
                // Si hay error (por ejemplo tabla no existe), tratamos el token como NO revocado para no romper la autenticación.
                return false;
            }
        }
    }
}
