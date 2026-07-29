namespace checklist.Models.Firebase
{
    public class MailRegistro
    {
        public string? smtpServer { get; set; }
        public string? asunto { get; set; }
        public string? bodyHTML { get; set; }
        public string? correo { get; set; }
        public string? password { get; set; }
        public int? puerto { get; set; }
        public bool? ssl { get; set; }
    }
}
