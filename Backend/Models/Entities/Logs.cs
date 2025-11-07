using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRobin.Models.Entities
{
    [Table("logs")]
    public class Logs
    {
        [Key]
        [Column("idlogs")]
        public int IdLogs { get; set; }

        [Required]
        [MaxLength(45)]
        [Column("extension")]
        public string Extension { get; set; }

        [Required]
        [MaxLength(45)]
        [Column("asesor")]
        public string Asesor { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("callRef")]
        public string CallRef { get; set; }

        [Column("idPages")]
        public int? IdPages { get; set; }

        [Required]
        [Column("timestamp")]
        public DateTime Timestamp { get; set; }

        [Column("totalDuration")]
        public int? TotalDuration { get; set; }

        [Column("pauseCount")]
        public int? PauseCount { get; set; }

        [Column("totalPauseTime")]
        public int? TotalPauseTime { get; set; }

        [Required]
        [Column("startTime")]
        public DateTime StartTime { get; set; }

        [Required]
        [Column("endTime")]
        public DateTime EndTime { get; set; }

        [Column("userAgent", TypeName = "TEXT")]
        public string? UserAgent { get; set; }

        [Column("ActionType_idActionType")]
        public int? ActionTypeId { get; set; }

        // Navigation properties
        [ForeignKey("IdPages")]
        public virtual Pages? Pages { get; set; }

        [ForeignKey("ActionTypeId")]
        public virtual ActionType? ActionType { get; set; }
    }
}