using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRobin.Models.Entities
{
    [Table("pause_event")]
    public class PauseEvent
    {
        [Key]
        [Column("idPause_Event")]
        public int IdPauseEvent { get; set; }

        [Column("logs_idlogs")]
        public int? LogsId { get; set; }

        [Required]
        [Column("action")]
        public string Action { get; set; }

        [Column("duration_seconds")]
        public int? DurationSeconds { get; set; }

        // Navigation properties
        [ForeignKey("LogsId")]
        public virtual Logs? Logs { get; set; }
    }
}