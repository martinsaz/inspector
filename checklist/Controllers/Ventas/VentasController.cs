using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.Ventas
{
    [Authorize]
    [Route("[controller]")]
    public class VentasController : Controller
    {
        [HttpGet("Nueva")]
        public IActionResult Nueva()
        {
            return View();
        }

        [HttpGet("Devoluciones")]
        public IActionResult Devoluciones()
        {
            return View();
        }
    }
}
