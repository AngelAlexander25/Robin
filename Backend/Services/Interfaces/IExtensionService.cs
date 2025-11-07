using AdminRobin.DTOs;
using AdminRobin.Models.DTOs;
using AdminRobin.Models.Entities;

namespace AdminRobin.Services.Interfaces
{
    public interface IExtensionService
    {
        Task<ExtensionConfigDto> GetConfigAsync(string host);
        Task<bool> VerifyDomainAsync(string domain);
        Task<int> CreateLogsBatchAsync(List<CreateLogDto> logs);
        Task<List<ActionType>> GetActionTypesAsync();
    }
}