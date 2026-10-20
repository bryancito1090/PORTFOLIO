using MediatR;
using Portfolio.Application.Features.Projects.DTOs;
using Portfolio.Domain.Interfaces;

namespace Portfolio.Application.Features.Projects.Queries;

public sealed record GetProjectsQuery(bool FeaturedOnly = false) : IRequest<IReadOnlyList<ProjectResponseDto>>;

public sealed class GetProjectsQueryHandler(IProjectRepository projectRepository)
    : IRequestHandler<GetProjectsQuery, IReadOnlyList<ProjectResponseDto>>
{
    public async Task<IReadOnlyList<ProjectResponseDto>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        var projects = await projectRepository.GetAllAsync(request.FeaturedOnly, cancellationToken);

        return projects.Select(p => new ProjectResponseDto(
            p.Id,
            p.Slug,
            p.Title,
            p.ShortDescription,
            p.FullDescription,
            p.RepositoryUrl,
            p.LiveDemoUrl,
            p.ThumbnailUrl,
            p.IsFeatured,
            p.DisplayOrder,
            p.ProjectSkills.Select(ps => ps.Skill.Name).ToList()
        )).ToList();
    }
}
