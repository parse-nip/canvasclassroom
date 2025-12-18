import React from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { FaWandMagicSparkles, FaLayerGroup, FaHandsHolding, FaCode, FaRocket, FaChevronRight } from 'react-icons/fa6';

interface HomePageProps {
  onLogin: () => void;
  onLaunch: () => void;
  isLoggedIn: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onLogin, 
  onLaunch, 
  isLoggedIn,
  isDarkMode,
  onToggleTheme
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col overflow-hidden">
      
      {/* Navigation */}
      <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold font-mono text-xl shadow-sm">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              CanvasClassroom
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={onToggleTheme}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium"
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {isLoggedIn ? (
              <Button variant="primary" size="sm" onClick={onLaunch} className="rounded-full px-5">
                Go to App
              </Button>
            ) : (
              <button onClick={onLogin} className="text-sm font-semibold text-slate-900 dark:text-white hover:opacity-70 transition-opacity">
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden bg-grid-slate-200">
        {/* Subtle radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-slate-950/50 dark:to-slate-950 pointer-events-none"></div>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-24 pb-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in opacity-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
              <FaWandMagicSparkles className="animate-pulse" /> AI-Powered Coding Education
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.9]">
              The Intelligent <br /> <span className="text-indigo-600 dark:text-indigo-500">CS Classroom.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Automate lesson planning, provide real-time AI guidance, and manage student growth with a platform built specifically for modern computer science.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isLoggedIn ? (
                <Button size="lg" className="rounded-xl px-10 text-base font-bold shadow-2xl shadow-indigo-500/20" onClick={onLaunch}>
                  Launch Dashboard <FaRocket className="ml-2" />
                </Button>
              ) : (
                <>
                  <Button size="lg" className="rounded-xl px-10 text-base font-bold shadow-2xl shadow-indigo-500/20" onClick={onLogin}>
                    Start Free
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-xl px-10 text-base font-bold border-2" onClick={onLogin}>
                    Student Login
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Visual Preview / Mockup */}
          <div className="mt-24 max-w-6xl mx-auto relative group animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-slate-400 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden aspect-[16/9] flex flex-col">
              {/* Fake Window Controls */}
              <div className="h-10 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2 bg-slate-100/50 dark:bg-slate-800/50">
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="ml-4 h-5 w-48 rounded bg-slate-200 dark:bg-slate-700/50"></div>
              </div>
              <div className="flex-1 flex gap-4 p-4">
                <div className="w-64 border-r border-slate-200 dark:border-slate-800 pr-4 space-y-4 hidden md:block">
                  <div className="h-8 w-full rounded bg-indigo-100 dark:bg-indigo-900/30"></div>
                  <div className="space-y-2 pt-4">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-6 w-full rounded bg-slate-100 dark:bg-slate-800/50"></div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="h-12 w-1/3 rounded bg-slate-100 dark:bg-slate-800/50 animate-pulse"></div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-32 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                  <div className="h-48 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 p-4 relative overflow-hidden">
                    <div className="flex gap-2 mb-4 animate-pulse">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <div className="space-y-2">
                       <div className="h-3 w-full rounded bg-slate-50 dark:bg-slate-800/50 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                       <div className="h-3 w-5/6 rounded bg-slate-50 dark:bg-slate-800/50 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                       <div className="h-3 w-4/6 rounded bg-slate-50 dark:bg-slate-800/50 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    </div>
                    {/* Fake Cursor */}
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-indigo-500 rounded-sm rotate-12 animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="container mx-auto px-6 py-32 border-t border-slate-100 dark:border-slate-900">
          <div className="grid md:grid-cols-3 gap-12">
            
            <div className="space-y-4 animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                <FaWandMagicSparkles />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Pedagogical Engine</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate unit-aligned lessons and assignments that understand your students' progress and suggest the perfect next step.
              </p>
            </div>

            <div className="space-y-4 animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
              <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 text-xl shadow-lg shadow-slate-900/20">
                <FaLayerGroup />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Curriculum Architect</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Drag-and-drop units, sequential locking, and scheduled releases. Organize your entire semester in minutes.
              </p>
            </div>

            <div className="space-y-4 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                <FaHandsHolding />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Live Student Support</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                A real-time help queue with AI-assisted debugging hints. Scale your support without scaling your workload.
              </p>
            </div>

          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-6 py-32 text-center animate-fade-in opacity-0" style={{ animationDelay: '0.7s' }}>
          <div className="bg-slate-900 dark:bg-indigo-600 rounded-[2rem] p-12 md:p-24 text-white space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Ready to transform your <br className="hidden md:block" /> CS classroom?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 pt-4">
              <Button size="lg" variant="secondary" className="rounded-xl px-12 bg-white text-slate-900 hover:bg-slate-100 border-none font-bold" onClick={onLogin}>
                Get Started <FaChevronRight className="ml-2 text-xs" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <div className="h-6 w-6 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold font-mono text-xs">
              C
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              CanvasClassroom
            </span>
          </div>
          <p className="text-slate-400 dark:text-slate-600 text-xs">
            © {new Date().getFullYear()} CanvasClassroom. Built for teachers, by engineers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
