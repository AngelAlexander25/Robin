using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRobin.Models.Entities
{
    [Table("pages")]
    public class Pages
    {
        [Key]
        [Column("idPages")]
        public int IdPages { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("domain")]
        public string Domain { get; set; }

        [Column("selectors", TypeName = "TEXT")]
        public string? Selectors { get; set; }

        [Required]
        [MaxLength(200)]
        [Column("tags")]
        public string Tags { get; set; }

        [Required]
        [Column("active")]
        public bool Active { get; set; } = true;

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual ICollection<Logs> Logs { get; set; } = new List<Logs>();
    }
}