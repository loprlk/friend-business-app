using Microsoft.AspNetCore.Mvc;

namespace FriendBusiness.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            message = "The C# backend is working."
        });
    }
}