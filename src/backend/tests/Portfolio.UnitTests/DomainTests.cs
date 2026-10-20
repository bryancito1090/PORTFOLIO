using Portfolio.Domain.Entities;
using Portfolio.Domain.Enums;

namespace Portfolio.UnitTests;

public class DomainTests
{
    [Fact]
    public void Project_Create_WithValidArgs_ShouldInstantiateCorrectly()
    {
        // Act
        var project = Project.Create(
            slug: "test-project",
            title: "Test Project Title",
            shortDescription: "Short description of project",
            fullDescription: "Detailed description of architecture and features",
            repositoryUrl: "https://github.com/bryan/test-project",
            isFeatured: true
        );

        // Assert
        Assert.NotNull(project);
        Assert.Equal("test-project", project.Slug);
        Assert.Equal("Test Project Title", project.Title);
        Assert.True(project.IsFeatured);
        Assert.NotEqual(Guid.Empty, project.Id);
    }

    [Theory]
    [InlineData("", "Title")]
    [InlineData("   ", "Title")]
    [InlineData("slug", "")]
    [InlineData("slug", "   ")]
    public void Project_Create_WithInvalidArgs_ShouldThrowArgumentException(string slug, string title)
    {
        // Assert
        Assert.Throws<ArgumentException>(() =>
            Project.Create(
                slug: slug,
                title: title,
                shortDescription: "Short",
                fullDescription: "Full",
                repositoryUrl: "https://repo"
            )
        );
    }

    [Fact]
    public void Skill_Create_WithValidArgs_ShouldInstantiateCorrectly()
    {
        // Act
        var skill = Skill.Create(".NET 8/9", SkillCategory.Backend, "dotnet", proficiency: 95);

        // Assert
        Assert.NotNull(skill);
        Assert.Equal(".NET 8/9", skill.Name);
        Assert.Equal(SkillCategory.Backend, skill.Category);
        Assert.Equal(95, skill.ProficiencyPercentage);
    }
}
