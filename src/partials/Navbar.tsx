import React, { useEffect, useState } from 'react';
import { BiMessageDetail } from 'react-icons/bi';
import { CiSun } from 'react-icons/ci';
import { FaTimes } from 'react-icons/fa';
import { PiMoonStarsLight } from 'react-icons/pi';

// Import your custom logo component
import { CustomLogo } from '../components/CustomLogo';

const Navbar = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize theme state from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setDarkMode(savedTheme === 'dark');
  }, []);

  // Handle dark mode toggle directly
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    }

    // Save preference to localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleContactModal = () => {
    setShowContactModal(!showContactModal);
  };

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 py-1.5 transition ease-in-out ${
          isScrolled
            ? darkMode
              ? 'bg-neutral-900/95 shadow-xl shadow-neutral-900/50'
              : 'bg-white/95 shadow-xl shadow-gray-200/50'
            : 'border-0 shadow-none'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <CustomLogo
                textColor={darkMode ? 'text-neutral-100' : 'text-neutral-900'}
                icon={
                  <img
                    className="mr-3.5 h-9 w-9 rounded-full border border-emerald-900/75 bg-neutral-700/80 object-cover object-center opacity-100 ring-1 ring-neutral-700 transition duration-300 hover:ring-2"
                    src="/assets/images/portrait_nobg.png"
                    alt="Avatar image"
                    loading="lazy"
                  />
                }
                name="Binyam Mamo"
              />
            </a>

            {/* Contact Button */}
            <button
              onClick={toggleContactModal}
              className={`hidden items-center gap-2 rounded-lg py-2 text-base transition ease-in-out md:flex md:px-4 ${
                darkMode
                  ? 'border border-neutral-900 bg-neutral-800 !text-white ring-0 ring-neutral-800 hover:bg-neutral-700 hover:ring-2'
                  : 'border border-neutral-800 bg-neutral-800 !text-white hover:border-neutral-800 hover:bg-neutral-800'
              }`}
            >
              <BiMessageDetail className="mt-0.5 text-xl !text-white" />
              <span>Contact Me</span>
            </button>
            <BiMessageDetail
              onClick={toggleContactModal}
              className={`mt-0.5 flex text-3xl md:hidden ${
                darkMode ? 'text-white' : 'text-neutral-800'
              }`}
            />
          </div>
        </div>
      </nav>

      {/* Floating Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed bottom-6 right-6 z-50 rounded-full border p-3 shadow-lg transition-all duration-200 ${
          darkMode
            ? 'border-neutral-700/50 bg-neutral-800/50 text-white hover:border-emerald-700/50 hover:bg-neutral-700/50'
            : 'border-gray-300 bg-white text-neutral-800 hover:border-emerald-400/50 hover:bg-gray-100'
        }`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          <CiSun className="h-5 w-5" />
        ) : (
          <PiMoonStarsLight className="h-5 w-5" />
        )}
      </button>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-all duration-300">
          <div
            className={`contact-modal w-full max-w-md rounded-xl border p-6 shadow-xl transition-all duration-300 ${
              darkMode
                ? 'border-neutral-700 bg-neutral-800'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                Let's Connect
              </h2>
              <button
                onClick={toggleContactModal}
                className={`rounded-full p-2 transition-colors duration-200 ${
                  darkMode
                    ? 'text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className={`mb-1 block text-sm font-medium ${
                    darkMode ? 'text-neutral-300' : 'text-gray-600'
                  }`}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className={`w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode
                      ? 'border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500'
                      : 'border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400'
                  }`}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className={`mb-1 block text-sm font-medium ${
                    darkMode ? 'text-neutral-300' : 'text-gray-600'
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className={`w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode
                      ? 'border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500'
                      : 'border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400'
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className={`mb-1 block text-sm font-medium ${
                    darkMode ? 'text-neutral-300' : 'text-gray-600'
                  }`}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className={`w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode
                      ? 'border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500'
                      : 'border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400'
                  }`}
                  placeholder="How can I help you?"
                ></textarea>
              </div>

              <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 px-4 py-3 font-medium text-white transition ease-in-out hover:from-emerald-600 hover:to-emerald-800 hover:opacity-90"
                >
                  <BiMessageDetail className="mt-0.5 text-xl" />
                  <span>Send Message</span>
                </button>
                <button
                  type="button"
                  onClick={toggleContactModal}
                  className={`w-full rounded-lg border px-6 py-3 font-medium transition-all duration-200 sm:w-auto ${
                    darkMode
                      ? 'border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700'
                      : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
              </div>

              <div
                className={`mt-4 text-center text-sm ${
                  darkMode ? 'text-neutral-400' : 'text-gray-500'
                }`}
              >
                I'll get back to you as soon as possible!
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export { Navbar };
