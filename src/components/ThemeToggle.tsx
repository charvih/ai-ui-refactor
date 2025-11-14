"use client";

import React from "react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  disabled?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  toggleTheme,
  disabled,
}) => {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={disabled}
      className="relative inline-flex h-10 w-20 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:scale-105 hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      aria-label="Toggle color theme"
    >
      <span
        className={`absolute inset-y-1 left-1 flex w-8 items-center justify-center rounded-full border transition-all ${theme === "dark" ? "translate-x-9 border-slate-600 bg-white" : "translate-x-0 border-slate-900 bg-slate-900"}`}
        aria-hidden="true"
      >
        {theme === "dark" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-4 w-4 text-slate-900"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12.79A9 9 0 1 1 11.21 3c-.08.63-.12 1.27-.12 1.91A7.09 7.09 0 0 0 18.17 12c0 .67-.1 1.32-.29 1.94.37-.02.74-.06 1.12-.15Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-4 w-4 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.75v-2m0 18.5v-2m7.25-7.25h2m-18.5 0h2m12.99-5.25 1.41-1.41m-13.42 13.42 1.41-1.41m0-10.6-1.41-1.41m13.42 13.42-1.41-1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
            />
          </svg>
        )}
      </span>
      <span className="sr-only">
        Switch to {theme === "dark" ? "light" : "dark"} mode
      </span>
    </button>
  );
};

export default ThemeToggle;
