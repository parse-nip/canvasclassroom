'use client';

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  // For Vite/React Router compatibility, this would redirect
  // In a real Next.js app, this would use Next.js routing
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold font-mono text-2xl shadow-lg shadow-indigo-500/20 mx-auto mb-4">
          C
        </div>
        <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">CanvasClassroom</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome</p>
      </div>
    </div>
  );
}

