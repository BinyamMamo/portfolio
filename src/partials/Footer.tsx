import React, { useEffect, useState } from 'react';

import { AppConfig } from '@/utils/AppConfig';

const Footer = () => {
  const currentYear = new Date().getFullYear();
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
    <div
      className={`border-t pt-5 ${
        isLightMode
          ? 'border-gray-200 bg-gray-50'
          : 'border-neutral-800 bg-neutral-900'
      }`}
    >
      <div
        className={`text-center text-sm ${
          isLightMode ? 'text-gray-600' : 'text-gray-400'
        }`}
      >
        <div className="mb-2">
          &copy; {currentYear} {AppConfig.site_name}. All rights reserved.
        </div>
        <div>
          Built with <span className="text-emerald-500">♥</span> using Astro &
          React
        </div>
      </div>
    </div>
  );
};

export { Footer };
