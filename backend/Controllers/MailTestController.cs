using Microsoft.AspNetCore.Mvc;
using backend.Services; // MailService burada!

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MailTestController : ControllerBase
    {
        private readonly MailService _mailService;

        public MailTestController(MailService mailService)
        {
            _mailService = mailService;
        }

        /// <summary>
        /// Mail gönderim test endpointi.
        /// </summary>
        /// <param name="to">Alıcı mail adresi</param>
        /// <returns></returns>
        [HttpGet("send")]
        public async Task<IActionResult> SendTestMail([FromQuery] string to)
        {
            await _mailService.SendMailAsync(to, "Test Maili", "Bu bir test mailidir.");
            return Ok("Mail gönderildi!");
        }
    }
}
