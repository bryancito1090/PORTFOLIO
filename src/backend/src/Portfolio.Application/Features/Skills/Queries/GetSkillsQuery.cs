using MediatR;
using Portfolio.Application.Features.Skills.DTOs;
using Portfolio.Domain.Enums;
using Portfolio.Domain.Interfaces;

namespace Portfolio.Application.Features.Skills.Queries;

public sealed record GetSkillsQuery(SkillCategory? Category = null) : IRequest<IReadOnlyList<SkillResponseDto>>;

public sealed class GetSkillsQueryHandler(ISkillRepository skillRepository)
    : IRequestHandler<GetSkillsQuery, IReadOnlyList<SkillResponseDto>>
{
    public async Task<IReadOnlyList<SkillResponseDto>> Handle(GetSkillsQuery request, CancellationToken cancellationToken)
    {
        var skills = await skillRepository.GetAllAsync(request.Category, cancellationToken);

        return skills.Select(s => new SkillResponseDto(
            s.Id,
            s.Name,
            s.Category,
            s.IconSlug,
            s.ProficiencyPercentage,
            s.DisplayOrder,
            s.IsFeatured
        )).ToList();
    }
}
