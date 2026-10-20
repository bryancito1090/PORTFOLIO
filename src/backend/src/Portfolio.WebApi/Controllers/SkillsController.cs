using MediatR;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.Features.Skills.DTOs;
using Portfolio.Application.Features.Skills.Queries;
using Portfolio.Domain.Enums;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public sealed class SkillsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SkillResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SkillResponseDto>>> GetAll(
        [FromQuery] SkillCategory? category = null,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetSkillsQuery(category), ct);
        return Ok(result);
    }
}
