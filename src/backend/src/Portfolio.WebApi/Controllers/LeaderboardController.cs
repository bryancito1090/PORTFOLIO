using MediatR;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.Features.Leaderboard.Commands;
using Portfolio.Application.Features.Leaderboard.DTOs;
using Portfolio.Application.Features.Leaderboard.Queries;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public sealed class LeaderboardController(ISender sender) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<GameScoreResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<GameScoreResponseDto>>> GetLeaderboard(
        [FromQuery] string game = "Minesweeper",
        [FromQuery] int limit = 10,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetLeaderboardQuery(game, limit), ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(GameScoreResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GameScoreResponseDto>> SubmitScore(
        [FromBody] SubmitGameScoreRequestDto request,
        CancellationToken ct = default)
    {
        var command = new SubmitGameScoreCommand(
            request.PlayerName,
            request.GameName,
            request.Score,
            request.DurationSeconds,
            request.CountryCode
        );

        var result = await sender.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }
}
