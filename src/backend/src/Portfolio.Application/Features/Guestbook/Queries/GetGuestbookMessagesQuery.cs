using MediatR;
using Portfolio.Application.Features.Guestbook.DTOs;
using Portfolio.Domain.Interfaces;

namespace Portfolio.Application.Features.Guestbook.Queries;

public sealed record GetGuestbookMessagesQuery(int Limit = 50) : IRequest<IReadOnlyList<GuestbookMessageResponseDto>>;

public sealed class GetGuestbookMessagesQueryHandler(IInteractiveMessageRepository messageRepository)
    : IRequestHandler<GetGuestbookMessagesQuery, IReadOnlyList<GuestbookMessageResponseDto>>
{
    public async Task<IReadOnlyList<GuestbookMessageResponseDto>> Handle(GetGuestbookMessagesQuery request, CancellationToken cancellationToken)
    {
        var messages = await messageRepository.GetRecentApprovedAsync(request.Limit, cancellationToken);

        return messages.Select(m => new GuestbookMessageResponseDto(
            m.Id,
            m.SenderName,
            m.Message,
            m.Origin,
            m.CreatedAtUtc
        )).ToList();
    }
}
