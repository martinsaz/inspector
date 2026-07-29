using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.CheckApp
{
    public class CheckAppController : Controller
    {
        public IActionResult Pattern()
        {
            return View();
        }
    }
}
