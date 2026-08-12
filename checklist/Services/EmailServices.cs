using checklist.Models.Firebase;
using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Utils;

namespace checklist.Services
{
    public sealed class EmailAttachment
    {
        public string FileName { get; set; } = "archivo";
        public byte[] Content { get; set; } = Array.Empty<byte>();
        public string ContentType { get; set; } = "application/octet-stream";
    }

    public class EmailServices
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailServices> _logger;

        public EmailServices(IConfiguration configuration, ILogger<EmailServices> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> EnviarCorreoAsync(string nombre, string destinatario, MailRegistro mailRegistro, IEnumerable<EmailAttachment>? attachments = null)
        {
            string result = "Ok";
            try
            {
                MimeMessage oMail = new MimeMessage();
                oMail.From.Add(new MailboxAddress("Soporte Checklist", mailRegistro.correo));
                oMail.To.Add(new MailboxAddress(nombre, destinatario));
                oMail.Subject = mailRegistro.asunto;
                var builder = new BodyBuilder();
                builder.HtmlBody = mailRegistro.bodyHTML;  // cuerpo;
                AddAttachments(builder, attachments);
                oMail.Body = builder.ToMessageBody();
                oMail.Priority = MessagePriority.Normal;
                using (var smtp = new SmtpClient())
                {
                    smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    smtp.CheckCertificateRevocation = false;
                    smtp.Connect(mailRegistro.smtpServer, (int)mailRegistro.puerto, (bool)mailRegistro.ssl);  // , MailKit.Security.SecureSocketOptions.Auto);
                    smtp.AuthenticationMechanisms.Remove("XOAUTH2");
                    smtp.Authenticate(mailRegistro.correo, mailRegistro.password);
                    await smtp.SendAsync(oMail);
                    smtp.Disconnect(true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Fallo el envio SMTP principal para MailRegistro. Host: {Host}. Puerto: {Puerto}. Remitente: {Remitente}",
                    mailRegistro.smtpServer,
                    mailRegistro.puerto,
                    mailRegistro.correo);

                try
                {
                    MimeMessage oMail = new MimeMessage();
                    oMail.From.Add(new MailboxAddress("Soporte Checklist", mailRegistro.correo));
                    oMail.To.Add(new MailboxAddress(nombre, destinatario));
                    oMail.Subject = mailRegistro.asunto;
                    var builder = new BodyBuilder();
                    builder.HtmlBody = mailRegistro.bodyHTML;  // cuerpo;
                    AddAttachments(builder, attachments);
                    oMail.Body = builder.ToMessageBody();
                    oMail.Priority = MessagePriority.Normal;
                    using (var smtp = new SmtpClient())
                    {
                        smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
                        smtp.CheckCertificateRevocation = false;
                        smtp.Connect(mailRegistro.smtpServer, (int)mailRegistro.puerto, MailKit.Security.SecureSocketOptions.None);
                        smtp.Authenticate(mailRegistro.correo, mailRegistro.password);
                        await smtp.SendAsync(oMail);
                        smtp.Disconnect(true);
                    }
                }
                catch (Exception ex2)
                {
                    _logger.LogWarning(
                        ex2,
                        "Fallo el envio SMTP alterno para MailRegistro. Host: {Host}. Puerto: {Puerto}. Remitente: {Remitente}",
                        mailRegistro.smtpServer,
                        mailRegistro.puerto,
                        mailRegistro.correo);

                    string sComp = string.Empty;
                    if (ex.InnerException != null) sComp = ex.InnerException.Message;
                    result = $"{ex.Message} || {sComp}";
                }
            }
            return result;
        }

        private static void AddAttachments(BodyBuilder builder, IEnumerable<EmailAttachment>? attachments)
        {
            if (attachments == null)
            {
                return;
            }

            foreach (EmailAttachment attachment in attachments)
            {
                if (attachment == null || attachment.Content == null || attachment.Content.Length == 0)
                {
                    continue;
                }

                string fileName = string.IsNullOrWhiteSpace(attachment.FileName) ? "archivo" : attachment.FileName.Trim();
                string mimeType = string.IsNullOrWhiteSpace(attachment.ContentType) ? "application/octet-stream" : attachment.ContentType.Trim();
                builder.Attachments.Add(fileName, attachment.Content, ContentType.Parse(mimeType));
            }
        }
    }
}
