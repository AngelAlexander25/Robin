using AdminRobin.Models.DTOs;

namespace AdminRobin.Services.Interfaces
{
    public interface IPageService
    {
        Task<IEnumerable<PageDto>> GetAllPagesAsync();
        Task<PageDto?> GetPageByIdAsync(int id);
        Task<IEnumerable<PageDto>> GetActivePagesAsync();
        Task<PageDto> CreatePageAsync(CreatePageDto createPageDto);
        Task<PageDto?> UpdatePageAsync(int id, UpdatePageDto updatePageDto);
        Task<bool> DeletePageAsync(int id);
        Task<int> GetTotalPagesCountAsync();
        Task<int> GetActivePagesCountAsync();
        Task<bool> ActivatePageAsync(int id);
        Task<bool> DeactivatePageAsync(int id);
    }
}