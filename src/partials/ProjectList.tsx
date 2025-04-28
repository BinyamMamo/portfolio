import { ColorTags, Section } from 'astro-boilerplate-components';
import React from 'react';
import { GrProjects } from 'react-icons/gr';

import Project from '../components/Project';
import { getFeaturedProjects } from '../utils/Projects';

// Custom Tag component with better styling
const Tag = ({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
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
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        colorClasses[color] || 'bg-neutral-700 text-neutral-300'
      }`}
    >
      {children}
    </span>
  );
};

const ProjectList = () => {
  const featuredProjects = getFeaturedProjects();

  return (
    <div
      className="flex min-h-screen flex-col justify-center px-4 pb-0 sm:px-6 md:pb-12 lg:px-8"
      id="projects-section"
    >
      <Section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-center text-2xl font-bold sm:text-left sm:text-3xl">
            Featured{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>

          <a
            href="/projects"
            className="group flex items-center gap-2.5 rounded-lg   px-5 py-2 text-neutral-300 transition-all duration-200 hover:bg-neutral-700/50 hover:text-emerald-400 md:bg-neutral-800/75"
          >
            <GrProjects className="text-base transition-all duration-200 group-hover:font-bold md:text-sm" />
            <span className="hidden md:flex">View All</span>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {featuredProjects.map((project) => (
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
                    <Tag key={index} color={tag.color}>
                      {tag.text}
                    </Tag>
                  ))}
                </>
              }
            />
          ))}
        </div>

        <div className="absolute bottom-1 left-1/2 hidden -translate-x-1/2 animate-bounce md:flex">
          <button
            onClick={() => {
              const footer = document.querySelector('#hero-section');
              if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="rounded-full border border-neutral-700/50 bg-neutral-800/50 p-2 transition-all duration-200 hover:border-emerald-700/50 hover:bg-neutral-700/50"
            aria-label="Scroll to footer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-neutral-400 hover:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </Section>
    </div>
  );
};

export { ProjectList };
