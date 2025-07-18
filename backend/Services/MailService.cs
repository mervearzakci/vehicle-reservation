using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Options;
using backend.Models; // Veya Helpers, dosyayı nereye koyduysan

namespace backend.Services
{
    public class MailService
    {
        private readonly MailSettings _mailSettings;

        public MailService(IOptions<MailSettings> mailSettings)
        {
            _mailSettings = mailSettings.Value;
        }

        public async Task SendMailAsync(string to, string subject, string body, bool isHtml = false)
{
    var smtpServer = _mailSettings.SmtpServer ?? throw new ArgumentNullException(nameof(_mailSettings.SmtpServer));
    var smtpUser = _mailSettings.SmtpUser ?? throw new ArgumentNullException(nameof(_mailSettings.SmtpUser));
    var smtpPass = _mailSettings.SmtpPass ?? throw new ArgumentNullException(nameof(_mailSettings.SmtpPass));
    var senderEmail = _mailSettings.SenderEmail ?? throw new ArgumentNullException(nameof(_mailSettings.SenderEmail));
    var senderName = _mailSettings.SenderName ?? "";

    var smtpClient = new SmtpClient(smtpServer)
    {
        Port = _mailSettings.SmtpPort,
        Credentials = new NetworkCredential(smtpUser, smtpPass),
        EnableSsl = true,
    };

    var mailMessage = new MailMessage
    {
        From = new MailAddress(senderEmail, senderName),
        Subject = subject,
        Body = body,
        IsBodyHtml = isHtml,
    };
    mailMessage.To.Add(to);

    await smtpClient.SendMailAsync(mailMessage);
}
            
    }
}
