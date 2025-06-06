import React, { useEffect, useState } from 'react';
import { FaGithub, FaInfoCircle } from 'react-icons/fa';
import { MdSlowMotionVideo } from 'react-icons/md';
import { VscPreview } from 'react-icons/vsc';

interface ProjectProps {
  name: string;
  description: string;
  link: string;
  repoLink?: string;
  detailLink: string;
  img: {
    src: string;
    alt: string;
  };
  category: React.ReactNode;
}

const Project: React.FC<ProjectProps> = ({
  name,
  description,
  link,
  repoLink,
  detailLink,
  img,
  category,
}) => {
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

  // Modify the tags to work with light mode
  const transformTags = (categoryContent: React.ReactNode) => {
    if (!isLightMode || !React.isValidElement(categoryContent)) {
      return category;
    }

    // This is a workaround - since we can't directly modify the Tag component,
    // we add a class to the parent that will be used in Base.astro to adjust tag styles
    // and we apply our own wrapper with light-mode-specific styling
    return <div className="light-mode-tags">{category}</div>;
  };

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg ${
        isLightMode
          ? 'border-gray-200 bg-white hover:border-emerald-300/50 hover:bg-gray-50 hover:shadow-emerald-100/20'
          : 'border-neutral-700/50 bg-neutral-800/50 hover:border-emerald-700/50 hover:bg-neutral-800/70 hover:shadow-emerald-900/10'
      }`}
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={img.src}
          alt={img.alt}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            isLightMode
              ? 'from-gray-200/70 to-transparent'
              : 'from-neutral-900 to-transparent'
          } opacity-70`}
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-transparent opacity-0 transition-all duration-300 hover:bg-neutral-900/50 group-hover:opacity-100">
          <button
            className="shadow-black transition-all duration-300 hover:scale-105 group-hover:shadow-2xl"
            aria-label="Play demo video"
          >
            <MdSlowMotionVideo className="h-16 w-16 rounded-full text-emerald-400/90 ring-0 ring-emerald-400/50 transition ease-in-out group-hover:text-emerald-400 group-hover:ring-1" />
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="flex grow flex-col p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3
            className={`text-xl font-bold transition-colors duration-300 group-hover:text-emerald-500 ${
              isLightMode ? 'text-gray-800' : 'text-neutral-100'
            }`}
          >
            {name}
          </h3>

          <div className="flex items-center space-x-3">
            <a
              href={link}
              className={`group/link relative rounded-full p-2 transition-all duration-200 ${
                isLightMode ? 'hover:bg-gray-200/70' : 'hover:bg-neutral-700/50'
              }`}
              target="_blank"
              rel="noopener noreferrer"
              title="Live Demo"
              aria-label="View live demo"
            >
              <VscPreview
                className={`h-4 w-4 transition-colors group-hover/link:text-emerald-400 ${
                  isLightMode ? 'text-gray-500' : 'text-neutral-400'
                }`}
              />
            </a>
            {repoLink && (
              <a
                href={repoLink}
                className={`group/github relative rounded-full p-2 transition-all duration-200 ${
                  isLightMode
                    ? 'hover:bg-gray-200/70'
                    : 'hover:bg-neutral-700/50'
                }`}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Repository"
                aria-label="View GitHub repository"
              >
                <FaGithub
                  className={`h-4 w-4 transition-colors group-hover/github:text-emerald-400 ${
                    isLightMode ? 'text-gray-500' : 'text-neutral-400'
                  }`}
                />
              </a>
            )}
          </div>
        </div>

        <div className="mb-4 grow">
          <p
            className={`line-clamp-3 ${
              isLightMode ? 'text-gray-600' : 'text-neutral-300'
            }`}
          >
            {description}
          </p>
        </div>

        {/* Tags */}
        <div
          className={`mb-4 flex flex-wrap gap-2 ${
            isLightMode ? 'tags-light-mode' : ''
          }`}
        >
          {category}
        </div>

        {/* View Details Button */}
        <a
          href={detailLink}
          className={`group/details mt-2 flex w-full items-center justify-center rounded-lg px-4 py-2 font-medium backdrop-blur-sm transition-all duration-200 ${
            isLightMode
              ? 'border border-gray-200 bg-gray-50/25 text-emerald-600 hover:border-emerald-300/50 hover:bg-gray-100 hover:text-emerald-500'
              : 'border border-neutral-700/30 bg-neutral-800/25 text-emerald-400 hover:border-emerald-600/25 hover:bg-neutral-800 hover:text-emerald-300'
          }`}
        >
          <FaInfoCircle className="mr-2 h-4 w-4 transition-all duration-200" />
          Project Details
        </a>
      </div>

      {/* Decorative border effect */}
      <div className="h-0.5 w-0 bg-gradient-to-r from-emerald-500/25 to-blue-600/25 transition-all duration-300 group-hover:w-full" />
    </div>
  );
};

export default Project;
