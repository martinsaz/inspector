using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.Ajustes
{
    [Authorize]
    [Route("[controller]")]
    public class AjustesController : Controller
    {
        [HttpGet("AjustesPvPorTienda")]
        public IActionResult AjustesPvPorTienda()
        {
            return View();
        }

        [HttpGet("FormasPago")]
        public IActionResult FormasPago()
        {
            return View();
        }
    }
}
