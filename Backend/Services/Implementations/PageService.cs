using AdminRobin.Data.Repositories;
using AdminRobin.Models.DTOs;
using AdminRobin.Models.Entities;
using AdminRobin.Services.Interfaces;

namespace AdminRobin.Services.Implementations
{
    public class PageService : IPageService
    {
        private readonly PagesRepository _pagesRepository;

        public PageService(PagesRepository pagesRepository)
        {
            _pagesRepository = pagesRepository;
        }

        public async Task<IEnumerable<PageDto>> GetAllPagesAsync()
        {
            var pages = await _pagesRepository.GetAllAsync();
            return pages.Select(MapToPageDto);
        }

        public async Task<PageDto?> GetPageByIdAsync(int id)
        {
            var page = await _pagesRepository.GetByIdAsync(id);
            return page != null ? MapToPageDto(page) : null;
        }

        public async Task<IEnumerable<PageDto>> GetActivePagesAsync()
        {
            var pages = await _pagesRepository.GetByConditionAsync(p => p.Active);
            return pages.Select(MapToPageDto);
        }

        public async Task<PageDto> CreatePageAsync(CreatePageDto createPageDto)
        {
            var page = new Pages
            {
                Name = createPageDto.Name,
                Domain = createPageDto.Domain,
                Selectors = createPageDto.Selectors,
                Tags = createPageDto.Tags,
                Active = createPageDto.Active,
                CreatedAt = DateTime.Now
            };

            await _pagesRepository.AddAsync(page);
            return MapToPageDto(page);
        }

        public async Task<PageDto?> UpdatePageAsync(int id, UpdatePageDto updatePageDto)
        {
            var page = await _pagesRepository.GetByIdAsync(id);
            if (page == null) return null;

            if (updatePageDto.Name != null)
                page.Name = updatePageDto.Name;
            if (updatePageDto.Domain != null)
                page.Domain = updatePageDto.Domain;
            if (updatePageDto.Selectors != null)
                page.Selectors = updatePageDto.Selectors;
            if (updatePageDto.Tags != null)
                page.Tags = updatePageDto.Tags;
            if (updatePageDto.Active.HasValue)
                page.Active = updatePageDto.Active.Value;

            page.UpdatedAt = DateTime.Now;
            await _pagesRepository.UpdateAsync(page);
            return MapToPageDto(page);
        }

        public async Task<bool> DeletePageAsync(int id)
        {
            var page = await _pagesRepository.GetByIdAsync(id);
            if (page == null) return false;

            await _pagesRepository.DeleteAsync(page);
            return true;
        }

        public async Task<int> GetTotalPagesCountAsync()
        {
            var pages = await _pagesRepository.GetAllAsync();
            return pages.Count();
        }

        public async Task<int> GetActivePagesCountAsync()
        {
            var pages = await _pagesRepository.GetByConditionAsync(p => p.Active);
            return pages.Count();
        }

        public async Task<bool> ActivatePageAsync(int id)
        {
            var page = await _pagesRepository.GetByIdAsync(id);
            if (page == null) return false;

            page.Active = true;
            page.UpdatedAt = DateTime.Now;
            await _pagesRepository.UpdateAsync(page);
            return true;
        }

        public async Task<bool> DeactivatePageAsync(int id)
        {
            var page = await _pagesRepository.GetByIdAsync(id);
            if (page == null) return false;

            page.Active = false;
            page.UpdatedAt = DateTime.Now;
            await _pagesRepository.UpdateAsync(page);
            return true;
        }

        private static PageDto MapToPageDto(Pages page)
        {
            return new PageDto
            {
                Id = page.IdPages,
                Name = page.Name,
                Domain = page.Domain,
                Selectors = page.Selectors,
                Tags = page.Tags,
                Active = page.Active,
                CreatedAt = page.CreatedAt,
                UpdatedAt = page.UpdatedAt
            };
        }
    }
}