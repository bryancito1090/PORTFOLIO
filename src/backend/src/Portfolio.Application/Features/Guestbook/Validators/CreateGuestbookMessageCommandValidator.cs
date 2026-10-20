using FluentValidation;
using Portfolio.Application.Features.Guestbook.Commands;

namespace Portfolio.Application.Features.Guestbook.Validators;

public sealed class CreateGuestbookMessageCommandValidator : AbstractValidator<CreateGuestbookMessageCommand>
{
    public CreateGuestbookMessageCommandValidator()
    {
        RuleFor(x => x.SenderName)
            .NotEmpty().WithMessage("El nombre o alias del remitente es obligatorio.")
            .MaximumLength(60).WithMessage("El nombre no puede exceder 60 caracteres.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("El mensaje no puede estar vacío.")
            .MinimumLength(3).WithMessage("El mensaje debe contener al menos 3 caracteres.")
            .MaximumLength(500).WithMessage("El mensaje no puede exceder 500 caracteres.");
    }
}
