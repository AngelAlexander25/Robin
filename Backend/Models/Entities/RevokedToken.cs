using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRobin.Models.Entities
{
    [Table("revoked_tokens")]
    public class RevokedToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column("token", TypeName = "TEXT")]
        public string Token { get; set; } = string.Empty;

        [Required]
        [Column("revoked_at")]
        public DateTime RevokedAt { get; set; }

        [Required]
        [Column("expiration")]
        public DateTime Expiration { get; set; }
    }
}
