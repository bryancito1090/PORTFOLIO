using Portfolio.Domain.Common;
using Portfolio.Domain.Enums;

namespace Portfolio.Domain.Entities;

public sealed class InteractiveMessage : BaseEntity
{
    public string SenderName { get; private set; } = string.Empty;
    public string? SenderContact { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public MessageOrigin Origin { get; private set; }
    public bool IsApproved { get; private set; } = true;

    private InteractiveMessage() { }

    public static InteractiveMessage Create(
        string senderName,
        string message,
        MessageOrigin origin = MessageOrigin.Terminal,
        string? senderContact = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(senderName);
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        return new InteractiveMessage
        {
            SenderName = senderName.Trim(),
            Message = message.Trim(),
            Origin = origin,
            SenderContact = senderContact?.Trim(),
            IsApproved = true
        };
    }
}
