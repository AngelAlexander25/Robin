namespace AdminRobin.Models.DTOs
{
    public class PageDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Domain { get; set; }
        public string? Selectors { get; set; }
        public string Tags { get; set; }
        public bool Active { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreatePageDto
    {
        public string Name { get; set; }
        public string Domain { get; set; }
        public string? Selectors { get; set; }
        public string Tags { get; set; }
        public bool Active { get; set; } = true;
    }

    public class UpdatePageDto
    {
        public string? Name { get; set; }
        public string? Domain { get; set; }
        public string? Selectors { get; set; }
        public string? Tags { get; set; }
        public bool? Active { get; set; }
    }
}