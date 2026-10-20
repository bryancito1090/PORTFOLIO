using MediatR;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.Features.Projects.DTOs;
using Portfolio.Application.Features.Projects.Queries;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public sealed class ProjectsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProjectResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ProjectResponseDto>>> GetAll(
        [FromQuery] bool featuredOnly = false,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetProjectsQuery(featuredOnly), ct);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    [ProducesResponseType(typeof(ProjectResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectResponseDto>> GetBySlug(string slug, CancellationToken ct = default)
    {
        var result = await sender.Send(new GetProjectBySlugQuery(slug), ct);
        return Ok(result);
    }
}
