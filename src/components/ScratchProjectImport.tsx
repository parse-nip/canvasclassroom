import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaWandMagicSparkles, FaXmark, FaSpinner, FaCircleCheck, FaCircleExclamation, FaUpload, FaLayerGroup, FaCode, FaBookOpen } from 'react-icons/fa6';
import { ScratchProjectAnalysis, LessonPlan, Unit } from '../types';
import {
  analyzeScratchProject,
  generateProjectSummary,
  determineComplexity,
  detectProjectType,
  extractConcepts,
  BLOCK_CATEGORIES,
  getBlockName
} from '../services/scratchProjectService';
import { generateCurriculumFromScratchProject } from '../services/openRouterService';
import SB3FileUpload from './SB3FileUpload';
import { SB3ProjectData } from '../services/sb3FileProcessor';

interface ScratchProjectImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCurriculum: (units: Omit<Unit, 'id'>[], lessons: LessonPlan[]) => void;
  classId: string;
  existingUnitsCount: number;
  onStartBackgroundGeneration?: (analysis: any, data: any, lessonCount: number) => void;
  backgroundGenerationActive?: boolean;
}

type ImportStep = 'input' | 'analyzing' | 'preview' | 'generating' | 'complete' | 'error';

const ScratchProjectImport: React.FC<ScratchProjectImportProps> = ({
  isOpen,
  onClose,
  onImportCurriculum,
  classId,
  existingUnitsCount,
  onStartBackgroundGeneration,
  backgroundGenerationActive
}) => {
  const [projectData, setProjectData] = useState<SB3ProjectData | null>(null);
  const [step, setStep] = useState<ImportStep>('input');
  const [error, setError] = useState<string | null>(null);
  const [projectAnalysis, setProjectAnalysis] = useState<ScratchProjectAnalysis | null>(null);
  const [lessonCount, setLessonCount] = useState(6);
  const [generatedUnits, setGeneratedUnits] = useState<Unit[]>([]);
  const [generatedLessons, setGeneratedLessons] = useState<LessonPlan[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const resetState = () => {
    setProjectData(null);
    setStep('input');
    setError(null);
    setProjectAnalysis(null);
    setLessonCount(6);
    setGeneratedUnits([]);
    setGeneratedLessons([]);
    setIsUploading(false);
  };

  const handleClose = () => {
    // Prevent closing during active operations, unless we support background generation
    if (!onStartBackgroundGeneration && (step === 'analyzing' || step === 'generating' || isUploading)) {
      return;
    }
    resetState();
    onClose();
  };

  // Handle backdrop click - prevent closing during active operations
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not the card
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSB3FileLoaded = (data: SB3ProjectData) => {
    setProjectData(data);
    setIsUploading(false);
    handleAnalyzeProject(data);
  };

  const handleSB3FileError = (error: string) => {
    setError(error);
    setIsUploading(false);
    setStep('error');
  };

  const handleAnalyzeProject = async (sb3Data?: SB3ProjectData) => {
    const dataToAnalyze = sb3Data || projectData;
    if (!dataToAnalyze) {
      setError('No project data available');
      return;
    }

    setStep('analyzing');
    setError(null);

    try {
      // Create a mock analysis from the SB3 project data
      const project = dataToAnalyze.project;
      const analysis = await analyzeSB3Project(project);
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
      setError(err instanceof Error ? err.message : 'Failed to analyze project. Please try again.');
      setStep('error');
    }
  };

  const analyzeSB3Project = async (projectData: any): Promise<ScratchProjectAnalysis> => {
    // Extract information from the SB3 project data
    const targets = projectData.targets || [];
    const stage = targets.find((t: any) => t.isStage);
    const sprites = targets.filter((t: any) => !t.isStage);

    // Extract blocks from all targets
    let allBlocks: any[] = [];
    const spriteData: any[] = [];

    for (const target of targets) {
      const blocks = extractBlocksFromSB3(target);
      allBlocks = allBlocks.concat(blocks);

      if (!target.isStage) {
        spriteData.push({
          name: target.name,
          isStage: false,
          costumes: target.costumes?.length || 0,
          sounds: target.sounds?.length || 0,
          blocks
        });
      }
    }

    // Calculate statistics
    const uniqueBlockTypes = [...new Set(allBlocks.map(b => b.opcode))];
    const categories = [...new Set(allBlocks.map(b => b.category))];
    const concepts = extractConcepts(allBlocks);
    const projectType = detectProjectType(allBlocks);

    // Determine complexity
    const hasClones = uniqueBlockTypes.some(t => t.includes('clone'));
    const hasCustomBlocks = uniqueBlockTypes.some(t => t.includes('procedures'));
    const hasVariables = uniqueBlockTypes.some(t => t.includes('data_'));
    const hasBroadcasts = uniqueBlockTypes.some(t => t.includes('broadcast'));

    const complexity = determineComplexity(
      allBlocks.length,
      categories,
      hasClones,
      hasCustomBlocks,
      hasVariables,
      hasBroadcasts
    );

    return {
      projectId: 'uploaded-sb3',
      title: 'Uploaded Scratch Project',
      author: null,
      description: null,
      sprites: spriteData,
      totalBlocks: allBlocks.length,
      uniqueBlockTypes,
      categories,
      complexity,
      concepts,
      projectType,
    };
  };

  const extractBlocksFromSB3 = (target: any) => {
    const blocks: any[] = [];

    if (!target.blocks) return blocks;

    for (const blockId in target.blocks) {
      const block = target.blocks[blockId];
      if (block.opcode) {
        blocks.push({
          opcode: block.opcode,
          category: BLOCK_CATEGORIES[block.opcode] || 'other',
          inputs: block.inputs,
          fields: block.fields,
        });
      }
    }

    return blocks;
  };

  const handleGenerateCurriculum = async () => {
    if (!projectAnalysis || !projectData) return;

    if (onStartBackgroundGeneration) {
      onStartBackgroundGeneration(projectAnalysis, projectData, lessonCount);
      onClose(); // Close modal immediately
      resetState();
      return;
    }

    setStep('generating');
    setError(null);

    try {
      // Create a summary from the analysis
      const summary = generateProjectSummary(projectAnalysis);

      // Generate curriculum using the SB3 project data
      const curriculum = await generateCurriculumFromScratchProject(summary, projectAnalysis, lessonCount);

      if (!curriculum) {
        throw new Error('Failed to generate curriculum. Please try again.');
      }

      if (!curriculum.lessons || curriculum.lessons.length === 0) {
        throw new Error('No lessons were generated. Please try again.');
      }

      if (!curriculum.units || curriculum.units.length === 0) {
        throw new Error('No units were generated. Please try again.');
      }

      // Validate and fix lesson unitIndex values
      const maxUnitIndex = curriculum.units.length - 1;
      const invalidLessons = curriculum.lessons.filter(l => l.unitIndex < 0 || l.unitIndex > maxUnitIndex);

      if (invalidLessons.length > 0) {
        console.warn(`Found ${invalidLessons.length} lessons with invalid unitIndex. Reassigning to valid units.`);
        console.warn('Invalid lessons:', invalidLessons.map(l => ({ title: l.title, unitIndex: l.unitIndex })));

        // Fix invalid unitIndex values by clamping them to valid range
        curriculum.lessons = curriculum.lessons.map(lesson => ({
          ...lesson,
          unitIndex: Math.max(0, Math.min(lesson.unitIndex, maxUnitIndex))
        }));

        console.log('Fixed lessons:', curriculum.lessons.map(l => ({ title: l.title, unitIndex: l.unitIndex })));
      }

      // Create units (without IDs - let database generate UUIDs)
      const newUnits: Unit[] = curriculum.units.map((u, index) => ({
        classId,
        title: u.title,
        description: u.description,
        order: existingUnitsCount + u.order,
        isLocked: true,
        isSequential: true
      } as Omit<Unit, 'id'>));


      // Create lessons (reversed for proper ordering)
      const newLessons: LessonPlan[] = [...curriculum.lessons]
        .reverse()
        .map((l, idx) => {
          const targetUnit = newUnits[l.unitIndex];

          // Skip lessons with invalid unitIndex
          if (!targetUnit) {
            console.warn(`Skipping lesson with invalid unitIndex ${l.unitIndex}`);
            return null;
          }

          return {
            classId,
            unitId: l.unitIndex.toString(), // Store unitIndex as string for later mapping
            type: 'Lesson' as const,
            topic: l.topic,
            title: l.title,
            difficulty: l.difficulty,
            objective: l.objective,
            description: l.description,
            theory: l.theory,
            steps: l.steps,
            starterCode: l.starterCode, // Use AI-generated progressive starter code
            challenge: l.challenge,
            isAiGuided: true,
            tags: l.tags,
            editorType: 'scratch' as const,
            referenceProject: JSON.stringify(projectData.project) // Full project for reference
          } as LessonPlan;
        })
        .filter((lesson): lesson is LessonPlan => lesson !== null); // Remove null lessons


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
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
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
          {/* Step 1: File Upload */}
          {step === 'input' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex gap-3">
                  <FaUpload className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">How it works</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Upload a .sb3 file from your Scratch project and our AI will analyze it, then create a step-by-step curriculum
                      that teaches students how to build that project from scratch!
                    </p>
                  </div>
                </div>
              </div>

              <SB3FileUpload
                onProjectLoaded={handleSB3FileLoaded}
                onError={handleSB3FileError}
                isLoading={isUploading}
              />

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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${projectAnalysis.complexity === 'Advanced'
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
                <Button onClick={() => { }} disabled={true} className="bg-slate-200 text-slate-500 cursor-not-allowed">
                  <FaWandMagicSparkles className="mr-2" />
                  Generate Lessons (Main App Only)
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
                            <span className={`ml-auto px-2 py-0.5 rounded text-xs ${lesson.difficulty === 'Advanced'
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

