using MediatR;
using Portfolio.Application.Features.Projects.DTOs;
using Portfolio.Domain.Exceptions;
using Portfolio.Domain.Interfaces;

namespace Portfolio.Application.Features.Projects.Queries;

public sealed record GetProjectBySlugQuery(string Slug) : IRequest<ProjectResponseDto>;

public sealed class GetProjectBySlugQueryHandler(IProjectRepository projectRepository)
    : IRequestHandler<GetProjectBySlugQuery, ProjectResponseDto>
{
    public async Task<ProjectResponseDto> Handle(GetProjectBySlugQuery request, CancellationToken cancellationToken)
    {
        var p = await projectRepository.GetBySlugAsync(request.Slug, cancellationToken)
            ?? throw new NotFoundException("Project", request.Slug);

        return new ProjectResponseDto(
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
        );
    }
}
