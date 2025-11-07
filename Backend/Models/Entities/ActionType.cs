using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRobin.Models.Entities
{
    [Table("actiontype")]
    public class ActionType
    {
        [Key]
        [Column("idActionType")]
        public int IdActionType { get; set; }

        [Required]
        [MaxLength(45)]
        [Column("pausar")]
        public string Pausar { get; set; }

        [Required]
        [MaxLength(45)]
        [Column("despausar")]
        public string Despausar { get; set; }

        // Navigation property
        public virtual ICollection<Logs> Logs { get; set; } = new List<Logs>();
    }
}