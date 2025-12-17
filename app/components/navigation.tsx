'use client';

import React from 'react';
import { FaChalkboardUser, FaUserAstronaut, FaMoon, FaSun, FaQuestion } from 'react-icons/fa6';

interface NavigationProps {
  currentView?: 'teacher' | 'student';
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onStartTutorial?: () => void;
  showTutorial?: boolean;
  onNavigate?: (view: 'teacher' | 'student') => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  isDarkMode,
  onToggleTheme,
  onStartTutorial,
  showTutorial = false,
  onNavigate
}) => {
  const handleNavigate = (view: 'teacher' | 'student') => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold font-mono text-lg shadow-lg shadow-indigo-500/20">
            C
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
            CanvasClassroom
          </span>
        </div>

        <div className="flex items-center gap-4">
          {showTutorial && onStartTutorial && (
            <button
              onClick={onStartTutorial}
              className="p-2 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              title="Start Tutorial"
            >
              <FaQuestion />
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleNavigate('teacher')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentView === 'teacher'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaChalkboardUser /> Teacher
            </button>
            <button
              onClick={() => handleNavigate('student')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentView === 'student'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaUserAstronaut /> Student
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

