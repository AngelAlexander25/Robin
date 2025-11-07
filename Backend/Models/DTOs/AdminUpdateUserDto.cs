namespace AdminRobin.Models.DTOs
{
    public class AdminUpdateUserDto
    {
        public string? UserName { get; set; }
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public int? UserTypeId { get; set; }
        public bool? IsActive { get; set; }
    }
}