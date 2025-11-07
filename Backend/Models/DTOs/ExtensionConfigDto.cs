namespace AdminRobin.DTOs
{
    public class ExtensionConfigDto
    {
        public bool Tracked { get; set; }
        public int? PageId { get; set; }
        public string? PageName { get; set; }
        public string? Selectors { get; set; }
        public string? Tags { get; set; }
    }
}