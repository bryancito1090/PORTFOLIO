using Portfolio.Domain.Common;
using Portfolio.Domain.Enums;

namespace Portfolio.Domain.Entities;

public sealed class ContactInquiry : BaseEntity
{
    public string FullNameOrCompany { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string ServiceType { get; private set; } = "General";
    public string ProjectDetails { get; private set; } = string.Empty;
    public InquiryStatus Status { get; private set; } = InquiryStatus.New;
    public string? IpAddress { get; private set; }
    public DateTime? RepliedAtUtc { get; private set; }

    private ContactInquiry() { }

    public static ContactInquiry Create(
        string fullNameOrCompany,
        string email,
        string projectDetails,
        string serviceType = "General",
        string? phone = null,
        string? ipAddress = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fullNameOrCompany);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(projectDetails);

        return new ContactInquiry
        {
            FullNameOrCompany = fullNameOrCompany.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            ProjectDetails = projectDetails.Trim(),
            ServiceType = serviceType.Trim(),
            Phone = phone?.Trim(),
            IpAddress = ipAddress,
            Status = InquiryStatus.New
        };
    }
}
