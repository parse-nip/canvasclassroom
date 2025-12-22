import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaWandMagicSparkles, FaXmark, FaSpinner, FaCircleCheck, FaCircleExclamation, FaLink, FaLayerGroup, FaCode, FaBookOpen } from 'react-icons/fa6';
import { ScratchProjectAnalysis, LessonPlan, Unit } from '../types';
import { analyzeScratchProject, generateProjectSummary } from '../services/scratchProjectService';
import { generateCurriculumFromScratchProject } from '../services/openRouterService';

interface ScratchProjectImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCurriculum: (units: Unit[], lessons: LessonPlan[]) => void;
  classId: string;
  existingUnitsCount: number;
}

type ImportStep = 'input' | 'analyzing' | 'preview' | 'generating' | 'complete' | 'error';

const ScratchProjectImport: React.FC<ScratchProjectImportProps> = ({
  isOpen,
  onClose,
  onImportCurriculum,
  classId,
  existingUnitsCount
}) => {
  const [projectUrl, setProjectUrl] = useState('');
  const [step, setStep] = useState<ImportStep>('input');
  const [error, setError] = useState<string | null>(null);
  const [projectAnalysis, setProjectAnalysis] = useState<ScratchProjectAnalysis | null>(null);
  const [lessonCount, setLessonCount] = useState(6);
  const [generatedUnits, setGeneratedUnits] = useState<Unit[]>([]);
  const [generatedLessons, setGeneratedLessons] = useState<LessonPlan[]>([]);

  const resetState = () => {
    setProjectUrl('');
    setStep('input');
    setError(null);
    setProjectAnalysis(null);
    setLessonCount(6);
    setGeneratedUnits([]);
    setGeneratedLessons([]);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAnalyzeProject = async () => {
    if (!projectUrl.trim()) {
      setError('Please enter a Scratch project URL');
      return;
    }

    setStep('analyzing');
    setError(null);

    try {
      const analysis = await analyzeScratchProject(projectUrl);
      setProjectAnalysis(analysis);
      
      // Set recommended lesson count based on complexity
      if (analysis.complexity === 'Advanced') {
        setLessonCount(10);
      } else if (analysis.complexity === 'Intermediate') {
        setLessonCount(8);
      } else {
        setLessonCount(6);
      }
      
      setStep('preview');
    } catch (err) {
      console.error('Failed to analyze project:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze project. Please check the URL and try again.');
      setStep('error');
    }
  };

  const handleGenerateCurriculum = async () => {
    if (!projectAnalysis) return;

    setStep('generating');
    setError(null);

    try {
      const summary = generateProjectSummary(projectAnalysis);
      const curriculum = await generateCurriculumFromScratchProject(summary, projectAnalysis, lessonCount);

      if (!curriculum) {
        throw new Error('Failed to generate curriculum. Please try again.');
      }

      // Create units
      const newUnits: Unit[] = curriculum.units.map((u, index) => ({
        id: `u-scratch-${Date.now()}-${index}`,
        classId,
        title: u.title,
        description: u.description,
        order: existingUnitsCount + u.order,
        isLocked: true,
        isSequential: true
      }));

      // Create lessons (reversed for proper ordering)
      const newLessons: LessonPlan[] = [...curriculum.lessons].reverse().map((l, idx) => {
        const targetUnit = newUnits[l.unitIndex];
        return {
          id: `l-scratch-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          classId,
          unitId: targetUnit?.id,
          type: 'Lesson' as const,
          topic: l.topic,
          title: l.title,
          difficulty: l.difficulty,
          objective: l.objective,
          description: l.description,
          theory: l.theory,
          steps: l.steps,
          starterCode: l.starterCode || '{}',
          challenge: l.challenge,
          isAiGuided: true,
          tags: l.tags,
          editorType: 'scratch' as const
        };
      });

      setGeneratedUnits(newUnits);
      setGeneratedLessons(newLessons);
      setStep('complete');
    } catch (err) {
      console.error('Failed to generate curriculum:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate curriculum. Please try again.');
      setStep('error');
    }
  };

  const handleConfirmImport = () => {
    onImportCurriculum(generatedUnits, generatedLessons);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <FaWandMagicSparkles className="text-white text-lg" />
            </div>
            <div>
              <CardTitle>Import from Scratch Project</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create a curriculum from an existing Scratch project
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FaXmark className="text-slate-500" />
          </button>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step 1: URL Input */}
          {step === 'input' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex gap-3">
                  <FaLink className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">How it works</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Paste a Scratch project URL and our AI will analyze it, then create a step-by-step curriculum 
                      that teaches students how to build that project from scratch!
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Scratch Project URL
                </label>
                <input
                  type="text"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://scratch.mit.edu/projects/123456789/"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Example: https://scratch.mit.edu/projects/123456789/
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex gap-3">
                    <FaCircleExclamation className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleAnalyzeProject} disabled={!projectUrl.trim()}>
                  <FaWandMagicSparkles className="mr-2" />
                  Analyze Project
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Analyzing */}
          {step === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6">
                <FaSpinner className="text-orange-500 text-2xl animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Analyzing Project...
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                Fetching project data and identifying programming concepts used...
              </p>
            </div>
          )}

          {/* Step 3: Preview Analysis */}
          {step === 'preview' && projectAnalysis && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex gap-3">
                  <FaCircleCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">
                      Project Analyzed Successfully!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Ready to generate a curriculum based on this project.
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBookOpen className="text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Project Title</span>
                  </div>
                  <p className="text-slate-900 dark:text-white font-semibold">{projectAnalysis.title}</p>
                  {projectAnalysis.author && (
                    <p className="text-xs text-slate-500 mt-1">by {projectAnalysis.author}</p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FaLayerGroup className="text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Complexity</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    projectAnalysis.complexity === 'Advanced' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : projectAnalysis.complexity === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {projectAnalysis.complexity}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">{projectAnalysis.totalBlocks} blocks total</p>
                </div>
              </div>

              {/* Concepts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaCode className="text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Programming Concepts Detected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projectAnalysis.concepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sprites */}
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-3">
                  Sprites ({projectAnalysis.sprites.filter(s => !s.isStage).length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {projectAnalysis.sprites.filter(s => !s.isStage).map((sprite, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg"
                    >
                      {sprite.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lesson Count */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Number of Lessons to Generate
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={4}
                    max={14}
                    value={lessonCount}
                    onChange={(e) => setLessonCount(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="w-12 text-center font-semibold text-slate-900 dark:text-white">
                    {lessonCount}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Recommended: {projectAnalysis.complexity === 'Advanced' ? '10-14' : projectAnalysis.complexity === 'Intermediate' ? '6-10' : '4-8'} lessons
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button variant="ghost" onClick={() => { resetState(); }}>
                  Start Over
                </Button>
                <Button onClick={handleGenerateCurriculum}>
                  <FaWandMagicSparkles className="mr-2" />
                  Generate {lessonCount} Lessons
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Generating */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6">
                <FaSpinner className="text-orange-500 text-2xl animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Generating Curriculum...
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                Our AI is creating {lessonCount} lessons that will teach students how to build "{projectAnalysis?.title}"...
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                This may take 30-60 seconds
              </p>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex gap-3">
                  <FaCircleCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">
                      Curriculum Generated!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Created {generatedUnits.length} units and {generatedLessons.length} lessons.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Units & Lessons */}
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {generatedUnits.map((unit, unitIdx) => (
                  <div key={unit.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Unit {unitIdx + 1}: {unit.title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{unit.description}</p>
                    <div className="space-y-2">
                      {generatedLessons
                        .filter(l => l.unitId === unit.id)
                        .map((lesson, lessonIdx) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                          >
                            <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-medium">
                              {lessonIdx + 1}
                            </span>
                            <span>{lesson.title}</span>
                            <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                              lesson.difficulty === 'Advanced'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : lesson.difficulty === 'Intermediate'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {lesson.difficulty}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button variant="ghost" onClick={() => { resetState(); }}>
                  Start Over
                </Button>
                <Button onClick={handleConfirmImport}>
                  <FaCircleCheck className="mr-2" />
                  Add to Curriculum
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="space-y-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex gap-3">
                  <FaCircleExclamation className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">
                      Something went wrong
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={resetState}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScratchProjectImport;

