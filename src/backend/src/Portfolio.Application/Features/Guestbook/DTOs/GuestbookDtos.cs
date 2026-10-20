using Portfolio.Domain.Enums;

namespace Portfolio.Application.Features.Guestbook.DTOs;

public sealed record GuestbookMessageResponseDto(
    Guid Id,
    string SenderName,
    string Message,
    MessageOrigin Origin,
    DateTime CreatedAtUtc
);

public sealed record CreateGuestbookMessageRequestDto(
    string SenderName,
    string Message,
    MessageOrigin Origin = MessageOrigin.WebForm,
    string? SenderContact = null
);
