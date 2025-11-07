namespace AdminRobin.Models.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string UserTypeName { get; set; }
        public int UserTypeId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserDto
    {
        public string UserName { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
        public int UserTypeId { get; set; }
    }

    public class UpdateUserDto
    {
        public string? UserName { get; set; }
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public int? UserTypeId { get; set; }
    }
}