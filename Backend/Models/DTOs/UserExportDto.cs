namespace AdminRobin.Models.DTOs
{
    public class UserExportDto
    {
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public string? UserTypeName { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        // Propiedades adicionales para estadísticas (si se necesitan)
        public int? TotalLogins { get; set; }
        public int? TotalActions { get; set; }
    }
}