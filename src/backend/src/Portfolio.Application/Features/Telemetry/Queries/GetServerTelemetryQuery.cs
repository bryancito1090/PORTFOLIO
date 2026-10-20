using System.Diagnostics;
using System.Runtime.InteropServices;
using MediatR;
using Portfolio.Application.Features.Telemetry.DTOs;

namespace Portfolio.Application.Features.Telemetry.Queries;

public sealed record GetServerTelemetryQuery : IRequest<ServerTelemetryDto>;

public sealed class GetServerTelemetryQueryHandler : IRequestHandler<GetServerTelemetryQuery, ServerTelemetryDto>
{
    private static readonly DateTime StartTime = DateTime.UtcNow;

    public Task<ServerTelemetryDto> Handle(GetServerTelemetryQuery request, CancellationToken cancellationToken)
    {
        var process = Process.GetCurrentProcess();
        var memoryMb = Math.Round((double)process.WorkingSet64 / (1024 * 1024), 2);
        var uptime = DateTime.UtcNow - StartTime;

        var dto = new ServerTelemetryDto(
            Status: "OPERATIONAL",
            Region: "us-ashburn-1",
            Provider: "Oracle Cloud Infrastructure (OCI)",
            Architecture: $"{RuntimeInformation.OSDescription} ({RuntimeInformation.ProcessArchitecture})",
            RuntimeVersion: RuntimeInformation.FrameworkDescription,
            Uptime: uptime,
            ProcessMemoryMb: memoryMb,
            ActiveThreads: process.Threads.Count,
            ServerTimeUtc: DateTime.UtcNow
        );

        return Task.FromResult(dto);
    }
}
