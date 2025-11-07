using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRobin.Models.Entities
{
    [Table("user_types")]
    public class UserType
    {
        [Key]
        [Column("idUser_types")]
        public int IdUserTypes { get; set; }

        [Required]
        [MaxLength(45)]
        [Column("descripcion")]
        public string Descripcion { get; set; }

        // Navigation property
        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}