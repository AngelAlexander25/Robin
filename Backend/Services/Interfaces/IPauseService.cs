using AdminRobin.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AdminRobin.Services.Interfaces
{
    public interface IPauseService
    {
        Task<PauseEventDto> CreatePauseAsync(CreatePauseDto dto);
        Task<IEnumerable<PauseEventDto>> GetPausesByLogIdAsync(int logId);
        Task<bool> DeletePauseAsync(int id);
    }
}
