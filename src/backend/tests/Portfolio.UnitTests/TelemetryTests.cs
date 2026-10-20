using Portfolio.Application.Features.Telemetry.Queries;

namespace Portfolio.UnitTests;

public class TelemetryTests
{
    [Fact]
    public async Task GetServerTelemetryQueryHandler_ShouldReturnOperationalStatus()
    {
        // Arrange
        var handler = new GetServerTelemetryQueryHandler();
        var query = new GetServerTelemetryQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("OPERATIONAL", result.Status);
        Assert.Equal("us-ashburn-1", result.Region);
        Assert.True(result.ProcessMemoryMb > 0);
        Assert.True(result.ActiveThreads > 0);
    }
}
