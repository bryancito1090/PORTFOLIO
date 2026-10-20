using System.Diagnostics;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.Features.Telemetry.DTOs;
using Portfolio.Application.Features.Telemetry.Queries;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public sealed class TelemetryController(ISender sender) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ServerTelemetryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ServerTelemetryDto>> GetServerTelemetry(CancellationToken ct)
    {
        var result = await sender.Send(new GetServerTelemetryQuery(), ct);
        return Ok(result);
    }

    [HttpGet("ping")]
    [ProducesResponseType(typeof(PingResponseDto), StatusCodes.Status200OK)]
    public ActionResult<PingResponseDto> Ping()
    {
        var sw = Stopwatch.StartNew();
        sw.Stop();

        return Ok(new PingResponseDto(
            Message: "PONG // ZEN SERVER HEALTHY",
            LatencyMs: sw.ElapsedMilliseconds,
            TimestampUtc: DateTime.UtcNow
        ));
    }
}
