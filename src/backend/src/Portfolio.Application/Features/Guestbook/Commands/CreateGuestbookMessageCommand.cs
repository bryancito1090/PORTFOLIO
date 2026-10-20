using MediatR;
using Portfolio.Application.Features.Guestbook.DTOs;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Enums;
using Portfolio.Domain.Interfaces;

namespace Portfolio.Application.Features.Guestbook.Commands;

public sealed record CreateGuestbookMessageCommand(
    string SenderName,
    string Message,
    MessageOrigin Origin = MessageOrigin.WebForm,
    string? SenderContact = null
) : IRequest<GuestbookMessageResponseDto>;

public sealed class CreateGuestbookMessageCommandHandler(IInteractiveMessageRepository messageRepository)
    : IRequestHandler<CreateGuestbookMessageCommand, GuestbookMessageResponseDto>
{
    public async Task<GuestbookMessageResponseDto> Handle(CreateGuestbookMessageCommand request, CancellationToken cancellationToken)
    {
        var message = InteractiveMessage.Create(
            request.SenderName,
            request.Message,
            request.Origin,
            request.SenderContact
        );

        await messageRepository.AddAsync(message, cancellationToken);
        await messageRepository.SaveChangesAsync(cancellationToken);

        return new GuestbookMessageResponseDto(
            message.Id,
            message.SenderName,
            message.Message,
            message.Origin,
            message.CreatedAtUtc
        );
    }
}
