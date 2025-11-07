namespace AdminRobin.DTOs
{
    public class ExtensionHealthDto
    {
        public string Status { get; set; } = "healthy";
        public DateTime Timestamp { get; set; }
        public string Version { get; set; } = "1.0";
    }
}