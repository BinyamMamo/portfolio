import { ColorTags } from 'astro-boilerplate-components';
import React, { useEffect, useState } from 'react';

import type { ProjectData } from '@/utils/Projects';
import { getProjectCategories } from '@/utils/Projects';

import Project from './Project';

// Custom Tag component with better styling and click functionality
const Tag = ({
  color,
  children,
  onClick,
  isActive = false,
}: {
  color: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}) => {
  const colorClasses = {
    [ColorTags.FUCHSIA]:
      'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
    [ColorTags.LIME]: 'bg-lime-500/10 text-lime-300 border-lime-500/20',
    [ColorTags.SKY]: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    [ColorTags.ROSE]: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    [ColorTags.VIOLET]: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    [ColorTags.EMERALD]:
      'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    [ColorTags.YELLOW]: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    [ColorTags.INDIGO]: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    [ColorTags.BLUE]: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    [ColorTags.RED]: 'bg-red-500/10 text-red-300 border-red-500/20',
    [ColorTags.GREEN]: 'bg-green-500/10 text-green-300 border-green-500/20',
    [ColorTags.PURPLE]: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    [ColorTags.ORANGE]: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    [ColorTags.GRAY]: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
    [ColorTags.BLACK]: 'bg-gray-700/10 text-gray-300 border-gray-700/20',
  };

  // Base classes
  let classes = `rounded-full border px-3 py-1 text-xs font-medium ${
    colorClasses[color] || 'bg-neutral-700 text-neutral-300'
  }`;

  // Add cursor pointer and active state if onClick is provided
  if (onClick) {
    classes += ' cursor-pointer transition-all duration-200 hover:scale-105';
    if (isActive) {
      classes +=
        ' ring-2 ring-offset-2 ring-offset-neutral-900 ring-emerald-500';
    }
  }

  return (
    <span className={classes} onClick={onClick}>
      {children}
    </span>
  );
};

interface AllProjectsProps {
  projects: ProjectData[];
}

const AllProjects: React.FC<AllProjectsProps> = ({ projects }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProjects, setFilteredProjects] =
    useState<ProjectData[]>(projects);
  const categories = ['All', ...getProjectCategories()];

  // Get all unique tags across all projects
  const getAllTags = () => {
    const tags = new Set<string>();
    projects.forEach((project) => {
      project.tags.forEach((tag) => {
        tags.add(tag.text);
      });
    });
    return Array.from(tags);
  };

  useEffect(() => {
    let result = [...projects];

    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (project) => project.category === selectedCategory
      );
    }

    // Apply tag filter
    if (selectedTag) {
      result = result.filter((project) =>
        project.tags.some((tag) => tag.text === selectedTag)
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          project.tags.some((tag) => tag.text.toLowerCase().includes(term))
      );
    }

    setFilteredProjects(result);
  }, [selectedCategory, selectedTag, searchTerm, projects]);

  const handleTagClick = (tagText: string) => {
    // If tag is already selected, clear it, otherwise set it
    if (selectedTag === tagText) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tagText);
      // Also reset category if we're filtering by tag
      setSelectedCategory('All');
    }
  };

  // Check if we're in light mode
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Check initially and add listener for theme changes
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light-mode'));
    };

    checkTheme();

    // Create an observer to watch for class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        {/* Category Filter */}
        <div className="flex overflow-x-auto pb-2 md:pb-0">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  // Clear tag filter when selecting a category
                  setSelectedTag(null);
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white'
                    : `bg-neutral-800 text-gray-300 hover:bg-neutral-700 ${
                        isLightMode
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : ''
                      }`
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 pl-10 text-white placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none md:w-64 ${
              isLightMode
                ? 'border-gray-300 bg-white text-gray-800 placeholder:text-gray-500'
                : ''
            }`}
          />
          <svg
            className={`absolute left-3 top-2.5 h-5 w-5 ${
              isLightMode ? 'text-gray-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Active Tag Filter */}
      {selectedTag && (
        <div className="flex items-center space-x-2">
          <span
            className={`text-gray-400 ${isLightMode ? 'text-gray-600' : ''}`}
          >
            Filtering by:
          </span>
          <Tag
            color={ColorTags.EMERALD}
            isActive={true}
            onClick={() => setSelectedTag(null)}
          >
            {selectedTag} ✕
          </Tag>
        </div>
      )}

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Project
              key={project.id}
              name={project.name}
              description={project.description}
              link={project.link}
              repoLink={project.repoLink}
              detailLink={`/projects/${project.id}`}
              img={project.img}
              category={
                <>
                  {project.tags.map((tag, index) => (
                    <Tag
                      key={index}
                      color={tag.color}
                      onClick={() => handleTagClick(tag.text)}
                      isActive={selectedTag === tag.text}
                    >
                      {tag.text}
                    </Tag>
                  ))}
                </>
              }
            />
          ))}
        </div>
      ) : (
        <div
          className={`flex h-40 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800/50 ${
            isLightMode ? 'border-gray-300 bg-gray-100/50 text-gray-600' : ''
          }`}
        >
          <p className="text-gray-400">
            No projects found. Try a different search or category.
          </p>
        </div>
      )}
    </div>
  );
};

export default AllProjects;
