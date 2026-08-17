using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.Facturacion
{
    [Authorize]
    [Route("[controller]")]
    public class FacturacionController : Controller
    {
        [HttpGet("Panel")]
        public IActionResult Panel()
        {
            return View();
        }
    }
}
