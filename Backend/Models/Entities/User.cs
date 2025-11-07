using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRobin.Models.Entities
{
    [Table("usuario")]
    public class User
    {
        [Key]
        [Column("idUsuario")]
        public int IdUsuario { get; set; }

        [Required]
        [MaxLength(45)]
        [Column("user")]
        public string UserName { get; set; }

        [Required]
        [MaxLength(45)]
        [Column("name")]
        public string Name { get; set; }

        [Required]
        [MaxLength(45)]
        [Column("last_name")]
        public string LastName { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("password")]
        public string Password { get; set; }

        [Column("User_types_idUser_types")]
        public int UserTypesId { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserTypesId")]
        public virtual UserType? UserType { get; set; }
    }
}