namespace AdminRobin.Models.DTOs
{
    public class PauseEventDto
    {
        public int IdPauseEvent { get; set; }
        public int? LogsId { get; set; }
        public string Action { get; set; }
        public int? DurationSeconds { get; set; }
    }

    public class CreatePauseDto
    {
        public int? LogsId { get; set; }
        public string Action { get; set; }
        public int? DurationSeconds { get; set; }
    }
}
