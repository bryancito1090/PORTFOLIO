using FluentValidation;
using Portfolio.Application.Features.Leaderboard.Commands;

namespace Portfolio.Application.Features.Leaderboard.Validators;

public sealed class SubmitGameScoreCommandValidator : AbstractValidator<SubmitGameScoreCommand>
{
    public SubmitGameScoreCommandValidator()
    {
        RuleFor(x => x.PlayerName)
            .NotEmpty().WithMessage("El nombre del jugador es obligatorio.")
            .MaximumLength(30).WithMessage("El nombre no puede exceder 30 caracteres.");

        RuleFor(x => x.GameName)
            .NotEmpty().WithMessage("El nombre del juego es obligatorio.")
            .MaximumLength(30);

        RuleFor(x => x.Score)
            .GreaterThanOrEqualTo(0).WithMessage("La puntuación no puede ser negativa.");

        RuleFor(x => x.DurationSeconds)
            .GreaterThanOrEqualTo(0).WithMessage("La duración no puede ser negativa.");
    }
}
