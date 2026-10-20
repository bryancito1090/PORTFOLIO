using MediatR;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.Features.Guestbook.Commands;
using Portfolio.Application.Features.Guestbook.DTOs;
using Portfolio.Application.Features.Guestbook.Queries;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public sealed class GuestbookController(ISender sender) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<GuestbookMessageResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<GuestbookMessageResponseDto>>> GetRecent(
        [FromQuery] int limit = 50,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetGuestbookMessagesQuery(limit), ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(GuestbookMessageResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GuestbookMessageResponseDto>> Create(
        [FromBody] CreateGuestbookMessageRequestDto request,
        CancellationToken ct = default)
    {
        var command = new CreateGuestbookMessageCommand(
            request.SenderName,
            request.Message,
            request.Origin,
            request.SenderContact
        );

        var result = await sender.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }
}
