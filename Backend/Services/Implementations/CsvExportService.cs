using System.Text;
using AdminRobin.Models.DTOs;
using AdminRobin.Services.Interfaces;

namespace AdminRobin.Services.Implementations
{
    public class CsvExportService : ICsvExportService
    {
        public async Task<string> ExportUsersToCsvAsync(List<UserExportDto> users, string? fileName = null)
        {
            fileName ??= $"users_export_{DateTime.Now:yyyyMMddHHmmss}.csv";
            var filePath = Path.Combine("Exports", fileName);

            Directory.CreateDirectory("Exports");

            var csvData = await GenerateCsvBytesAsync(users);
            await File.WriteAllBytesAsync(filePath, csvData);
            return filePath;
        }

        public async Task<byte[]> GenerateCsvBytesAsync(List<UserExportDto> users)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Id,UserName,Name,LastName,UserTypeName,Status,CreatedAt,LastLogin");

            foreach (var u in users)
            {
                sb.AppendLine($"{u.Id},{u.UserName},{u.Name},{u.LastName},{u.UserTypeName},{u.Status},{u.CreatedAt:yyyy-MM-dd HH:mm:ss},{u.LastLogin:yyyy-MM-dd HH:mm:ss}");
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public async Task<string> ExportUsersWithStatsToCsvAsync(int? userTypeId, bool? isActive, bool includeStats, string? fileName)
        {
            // TODO: implementar si necesitas estadísticas
            throw new NotImplementedException();
        }

        public async Task<int> CleanOldCsvExportsAsync(int olderThanDays = 7)
        {
            var exportsPath = "Exports";
            if (!Directory.Exists(exportsPath))
                return 0;

            var files = Directory.GetFiles(exportsPath, "*.csv");
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

        public async Task<List<string>> GetAvailableCsvExportsAsync()
        {
            var exportsPath = "Exports";
            if (!Directory.Exists(exportsPath))
                return new List<string>();

            var files = Directory.GetFiles(exportsPath, "*.csv")
                .Select(Path.GetFileName)
                .Where(f => f != null)
                .ToList();

            return await Task.FromResult(files!);
        }
    }
}