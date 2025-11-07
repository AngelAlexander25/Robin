using System;
using System.Threading.Tasks;

namespace AdminRobin.Services.Interfaces
{
    public interface ITokenBlacklistService
    {
        Task RevokeTokenAsync(string token, DateTime expiration);
        Task<bool> IsTokenRevokedAsync(string token);
    }
}
