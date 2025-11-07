using AdminRobin.Models.DTOs;
using AdminRobin.Services.Interfaces;

namespace AdminRobin.Services.Implementations
{
    public class PptExportService : IPptExportService
    {
        public async Task<byte[]> ExportUsersToPptAsync(List<UserExportDto> users, string? fileName = null)
        {
            // TODO: implementar exportación a PPT
            throw new NotImplementedException();
        }

        public async Task<byte[]> GeneratePptBytesAsync(List<UserExportDto> users)
        {
            // TODO: implementar generación de bytes PPT
            throw new NotImplementedException();
        }

        public async Task<string> ExportUsersWithStatsToPptAsync(int? userTypeId = null, bool? isActive = null, bool includeStats = true, string? fileName = null)
        {
            // TODO: implementar exportación con estadísticas
            throw new NotImplementedException();
        }

        public async Task<string> GenerateExecutiveSummaryAsync(string? fileName = null)
        {
            // TODO: implementar resumen ejecutivo
            throw new NotImplementedException();
        }

        public async Task<int> CleanOldPptExportsAsync(int olderThanDays = 7)
        {
            var exportsPath = "Exports";
            if (!Directory.Exists(exportsPath))
                return 0;

            var files = Directory.GetFiles(exportsPath, "*.pptx");
            var cutoffDate = DateTime.Now.AddDays(-olderThanDays);
            var deletedCount = 0;

            foreach (var file in files)
            {
                var fileInfo = new FileInfo(file);
                if (fileInfo.CreationTime < cutoffDate)
                {
                    File.Delete(file);
                    deletedCount++;
                }
            }

            return await Task.FromResult(deletedCount);
        }

        public async Task<List<string>> GetAvailablePptExportsAsync()
        {
            var exportsPath = "Exports";
            if (!Directory.Exists(exportsPath))
                return new List<string>();

            var files = Directory.GetFiles(exportsPath, "*.pptx")
                .Select(Path.GetFileName)
                .Where(f => f != null)
                .ToList();

            return await Task.FromResult(files!);
        }
    }
}