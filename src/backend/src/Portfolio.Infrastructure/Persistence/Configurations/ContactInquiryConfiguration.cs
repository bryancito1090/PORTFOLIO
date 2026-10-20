using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class ContactInquiryConfiguration : IEntityTypeConfiguration<ContactInquiry>
{
    public void Configure(EntityTypeBuilder<ContactInquiry> builder)
    {
        builder.ToTable("contact_inquiries");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id").HasMaxLength(36);

        builder.Property(c => c.FullNameOrCompany).HasColumnName("full_name_or_company").HasMaxLength(100).IsRequired();
        builder.Property(c => c.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
        builder.Property(c => c.Phone).HasColumnName("phone").HasMaxLength(30);
        builder.Property(c => c.ServiceType).HasColumnName("service_type").HasMaxLength(50).IsRequired();
        builder.Property(c => c.ProjectDetails).HasColumnName("project_details").HasColumnType("TEXT").IsRequired();
        builder.Property(c => c.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(c => c.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
        builder.Property(c => c.CreatedAtUtc).HasColumnName("created_at_utc").IsRequired();
        builder.Property(c => c.RepliedAtUtc).HasColumnName("replied_at_utc");

        builder.HasIndex(c => new { c.Status, c.CreatedAtUtc });
    }
}
