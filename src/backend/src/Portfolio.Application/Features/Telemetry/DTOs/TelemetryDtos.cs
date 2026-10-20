namespace Portfolio.Application.Features.Telemetry.DTOs;

public sealed record ServerTelemetryDto(
    string Status,
    string Region,
    string Provider,
    string Architecture,
    string RuntimeVersion,
    TimeSpan Uptime,
    double ProcessMemoryMb,
    int ActiveThreads,
    DateTime ServerTimeUtc
);

public sealed record PingResponseDto(
    string Message,
    long LatencyMs,
    DateTime TimestampUtc
);
