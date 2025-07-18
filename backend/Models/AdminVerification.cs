namespace backend.Models
{
    public class AdminVerification
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? Code { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsUsed { get; set; }
    }
}
