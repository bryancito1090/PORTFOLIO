using Portfolio.Application.Features.Guestbook.Commands;
using Portfolio.Application.Features.Guestbook.Validators;

namespace Portfolio.UnitTests;

public class GuestbookValidationTests
{
    private readonly CreateGuestbookMessageCommandValidator _validator = new();

    [Fact]
    public void Validator_WithValidData_ShouldNotHaveErrors()
    {
        // Arrange
        var command = new CreateGuestbookMessageCommand("Bryan Baño", "Excelente arquitectura.");

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }

    [Theory]
    [InlineData("", "Mensaje de prueba")]
    [InlineData("Bryan", "")]
    [InlineData("Bryan", "ab")] // Menos de 3 caracteres
    public void Validator_WithInvalidData_ShouldHaveValidationErrors(string senderName, string message)
    {
        // Arrange
        var command = new CreateGuestbookMessageCommand(senderName, message);

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
        Assert.NotEmpty(result.Errors);
    }
}
