import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';

interface ILogoProps {
  icon: ReactNode;
  name: string;
  textColor?: string; // Added color prop
}

const CustomLogo = (props: ILogoProps) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Listen for theme changes
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark-mode');
      setIsDarkMode(isDark);
    };

    // Check initial theme
    updateTheme();

    // Set up observer for class changes on the html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex items-center">
      {props.icon}
      <div
        className={`text-3xl font-extrabold uppercase ${
          props.textColor ||
          (isDarkMode ? 'text-neutral-100' : 'text-neutral-900')
        }`}
        // style={{ textShadow: '1px 1px 2px #05966999' }}
      >
        {props.name}
      </div>
    </div>
  );
};

export { CustomLogo };
