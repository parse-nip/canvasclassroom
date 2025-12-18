
import React, { useState } from 'react';
import { LessonPlan, Submission, Unit, StepHistory } from '../types';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import P5Editor from './P5Editor';
import ScratchEditor from './ScratchEditor';
import { FaChevronRight, FaCircleCheck, FaLightbulb, FaRobot, FaPaperPlane, FaArrowLeft, FaLock, FaSpinner, FaCheck, FaBookOpen, FaStar, FaPen, FaCommentDots, FaEye, FaClipboardCheck, FaArrowRotateLeft, FaXmark, FaClock } from 'react-icons/fa6';
import { analyzeStudentCode, validateStep, explainError } from '../services/openRouterService';

interface StudentViewProps {
    lessons: LessonPlan[];
    units: Unit[];
    onSubmitLesson: (lessonId: string, code: string, textAnswer?: string) => void;
    onUpdateProgress: (lessonId: string, code: string, step: number, history?: StepHistory) => void;
    submissions: Submission[];
    className?: string;
    classCode?: string;
}

// Simple markdown component for basic formatting without heavy libraries
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const parseBold = (str: string) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-indigo-900 dark:text-indigo-300">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const lines = text.split('\n');

    return (
        <div className="space-y-2">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                        <div key={i} className="flex items-start gap-2 pl-2">
                            <span className="text-indigo-400 mt-1.5 text-[6px]">●</span>
                            <p className="flex-1">{parseBold(trimmed.substring(2))}</p>
                        </div>
                    );
                }
                return <p key={i}>{parseBold(trimmed)}</p>;
            })}
        </div>
    );
};

const StudentView: React.FC<StudentViewProps> = ({ lessons, units, onSubmitLesson, onUpdateProgress, submissions, className, classCode }) => {
    const [activeLesson, setActiveLesson] = useState<LessonPlan | null>(null);
    const [currentCode, setCurrentCode] = useState<string>('');
    const [aiAnalysis, setAiAnalysis] = useState<{ hint: string, encouragement: string } | null>(null);
    const [stepFeedback, setStepFeedback] = useState<{ passed: boolean, message: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [showTheory, setShowTheory] = useState(true);
    const [reflectionAnswer, setReflectionAnswer] = useState('');
    const [stepTextAnswer, setStepTextAnswer] = useState('');
    const [reviewStepIndex, setReviewStepIndex] = useState<number | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(380);
    const [isResizing, setIsResizing] = useState(false);

    const handleStartLesson = (lesson: LessonPlan) => {
        const existingSub = submissions.find(s => s.lessonId === lesson.id);
        setCurrentCode(existingSub ? existingSub.code : lesson.starterCode);
        setActiveLesson(lesson);
        setAiAnalysis(null);
        setStepFeedback(null);
        setShowTheory(true);
        setReflectionAnswer(existingSub?.textAnswer || '');
        setStepTextAnswer('');
        setReviewStepIndex(null);
    };

    const handleExplainSelection = async (selection: string) => {
        if (!activeLesson) return;
        setIsAnalyzing(true);
        const analysis = await analyzeStudentCode(selection, activeLesson.objective);
        if (analysis) {
            setAiAnalysis({
                hint: analysis.hint,
                encouragement: analysis.encouragement
            });
        }
        setIsAnalyzing(false);
    };

    const handleConsoleError = async (errorMsg: string) => {
        setIsAnalyzing(true);
        const explanation = await explainError(errorMsg, currentCode);
        if (explanation) {
            setAiAnalysis({
                hint: explanation,
                encouragement: "Debugging is like solving a mystery!"
            });
        }
        setIsAnalyzing(false);
    };

    const handleSubmit = () => {
        if (activeLesson) {
            onSubmitLesson(activeLesson.id, currentCode, reflectionAnswer);
            setActiveLesson(null);
        }
    };

    const handleNextStep = async () => {
        if (!activeLesson) return;

        const existingSub = submissions.find(s => s.lessonId === activeLesson.id);
        const currentStepIndex = existingSub?.currentStep || 0;

        if (currentStepIndex >= activeLesson.steps.length) {
            if (activeLesson.reflectionQuestion && !reflectionAnswer) {
                return;
            }
            handleSubmit();
            return;
        }

        const currentInstruction = activeLesson.steps[currentStepIndex];
        const isTextStep = currentInstruction.startsWith('[TEXT]');
        const isNextStep = currentInstruction.startsWith('[NEXT]');

        // Handle Non-Guided Mode (Manual Next)
        if (!activeLesson.isAiGuided) {
            if (isTextStep && !stepTextAnswer.trim()) {
                setStepFeedback({ passed: false, message: "Type your answer first!" });
                return;
            }

            // Save progress without validation
            const historyItem: StepHistory = {
                stepIndex: currentStepIndex,
                studentInput: isTextStep ? stepTextAnswer : 'Manual Step',
                feedback: 'Completed.',
                passed: true
            };
            onUpdateProgress(activeLesson.id, currentCode, currentStepIndex + 1, historyItem);
            setStepTextAnswer('');
            return;
        }

        // 1. Pure Observation Step (Guided)
        if (isNextStep) {
            const historyItem: StepHistory = {
                stepIndex: currentStepIndex,
                studentInput: 'Skipped (Observation)',
                feedback: 'Observation completed.',
                passed: true
            };
            onUpdateProgress(activeLesson.id, currentCode, currentStepIndex + 1, historyItem);
            return;
        }

        // 2. Text Question Step (Guided)
        if (isTextStep && !stepTextAnswer.trim()) {
            setStepFeedback({ passed: false, message: "Type your answer first!" });
            return;
        }

        // 3. Validation (Guided)
        setIsValidating(true);
        setStepFeedback(null);

        const inputToValidate = isTextStep ? stepTextAnswer : currentCode;
        const result = await validateStep(inputToValidate, currentInstruction);

        if (result) {
            if (result.passed) {
                setStepFeedback({ passed: true, message: result.feedback });
                const historyItem: StepHistory = {
                    stepIndex: currentStepIndex,
                    studentInput: inputToValidate,
                    feedback: result.feedback,
                    passed: true
                };
                setTimeout(() => {
                    onUpdateProgress(activeLesson.id, currentCode, currentStepIndex + 1, historyItem);
                    setStepFeedback(null);
                    setStepTextAnswer('');
                }, 2000);
            } else {
                setStepFeedback({ passed: false, message: result.feedback });
            }
        }
        setIsValidating(false);
    };

    const handleReviewStep = (index: number) => {
        const existingSub = submissions.find(s => s.lessonId === activeLesson?.id);
        const currentStep = existingSub?.currentStep || 0;
        if (index < currentStep) {
            setReviewStepIndex(index);
        }
    };

    const closeReview = () => {
        setReviewStepIndex(null);
    };

    // Resize handlers - use refs to avoid stale closures
    const isResizingRef = React.useRef(false);
    
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizingRef.current = true;
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current) return;
            e.preventDefault();
            const newWidth = window.innerWidth - e.clientX;
            setSidebarWidth(Math.max(280, Math.min(600, newWidth)));
        };

        const handleMouseUp = () => {
            if (isResizingRef.current) {
                isResizingRef.current = false;
                setIsResizing(false);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, []);

    const getStatus = (lessonId: string) => {
        const sub = submissions.find(s => s.lessonId === lessonId);
        return sub ? sub.status : null;
    };

    const isLessonLocked = (unit: Unit, indexInUnit: number, unitLessons: LessonPlan[]) => {
        // 1. Check Manual Lock
        if (unit.isLocked) return true;

        // 2. Check Scheduled Lock
        if (unit.availableAt && Date.now() < unit.availableAt) return true;

        // 3. Check Sequential Order
        if (!unit.isSequential) return false;
        if (indexInUnit === 0) return false;
        const prevLessonId = unitLessons[indexInUnit - 1].id;
        const prevSub = submissions.find(s => s.lessonId === prevLessonId);
        return !prevSub || (prevSub.status !== 'Submitted' && prevSub.status !== 'Graded');
    };

    // --- UNIT SELECTOR VIEW ---
    if (!activeLesson) {
        return (
            <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto pb-12 pt-8 px-4">
                <div className="text-center py-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Coding Map</h2>
                    {className && classCode && (
                        <div className="flex items-center justify-center gap-2 mt-3 mb-2">
                            <span className="text-lg text-slate-600 dark:text-slate-400">{className}</span>
                            <span className="text-slate-400 dark:text-slate-600">•</span>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-lg">{classCode}</span>
                        </div>
                    )}
                    <p className="text-slate-500 dark:text-slate-400">Select an unlocked unit to continue your adventure.</p>
                </div>

                <div id="unit-list" className="space-y-8">
                    {units.map((unit) => {
                        const unitLessons = lessons.filter(l => l.unitId === unit.id);
                        // Show Scheduled Time Logic
                        const isTimeLocked = unit.availableAt && Date.now() < unit.availableAt;
                        const availableDateString = unit.availableAt ? new Date(unit.availableAt).toLocaleDateString() : '';

                        if (unitLessons.length === 0 && unit.isLocked) return null;

                        return (
                            <div key={unit.id} className={`relative rounded-2xl border-2 transition-all ${unit.isLocked || isTimeLocked ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-75 grayscale' : 'border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-800 shadow-sm'}`}>
                                <div className={`px-8 pt-10 pb-6 border-b ${unit.isLocked || isTimeLocked ? 'border-slate-200 dark:border-slate-800' : 'border-indigo-50 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/20'} flex justify-between items-center`}>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            {unit.isLocked && <FaLock className="text-slate-400" />}
                                            {isTimeLocked && <FaClock className="text-amber-500" />}
                                            {unit.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{unit.description}</p>
                                    </div>
                                    {isTimeLocked && (
                                        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                            <FaClock /> Unlocks {availableDateString}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    {unit.isLocked ? (
                                        <div className="text-center py-8 text-slate-400 italic">
                                            This unit is currently locked by your teacher.
                                        </div>
                                    ) : isTimeLocked ? (
                                        <div className="text-center py-8 text-slate-400 italic">
                                            This unit will unlock on {availableDateString}.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {unitLessons.map((lesson, idx) => {
                                                const status = getStatus(lesson.id);
                                                const sub = submissions.find(s => s.lessonId === lesson.id);
                                                const totalSteps = lesson.steps.length || 1;
                                                const current = sub?.currentStep || 0;
                                                const progress = sub?.currentStep && totalSteps > 0
                                                    ? Math.round((current / totalSteps) * 100)
                                                    : 0;
                                                const lockedBySequence = isLessonLocked(unit, idx, unitLessons);

                                                return (
                                                    <Card
                                                        key={lesson.id}
                                                        className={`group transition-all border-slate-200 dark:border-slate-700 h-full flex flex-col ${lockedBySequence ? 'opacity-60 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : 'hover:shadow-md hover:border-indigo-300 cursor-pointer dark:bg-slate-800'
                                                            }`}
                                                    >
                                                        <CardContent className="px-6 pt-8 pb-6 flex-1 flex flex-col">
                                                            <div className="flex gap-4 mb-2">
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${lesson.type === 'Assignment' ? 'bg-pink-100 text-pink-500 dark:bg-pink-900 dark:text-pink-300' : 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900 dark:text-indigo-300'}`}>
                                                                    {lesson.type === 'Assignment' ? <FaClipboardCheck size={18} /> : <FaBookOpen size={18} />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight mb-1 flex items-start justify-between">
                                                                        <span className="truncate pr-2">{lesson.title}</span>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            {status === 'Graded' && sub?.feedback && (
                                                                                <div className={`
                                                                                    px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm border flex items-center gap-1
                                                                                    ${sub.feedback.grade >= 90
                                                                                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                                                        : sub.feedback.grade >= 70
                                                                                            ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                                                                                            : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                                                                    }
                                                                                `}>
                                                                                    <FaStar className="text-[9px]" />
                                                                                    {sub.feedback.grade}%
                                                                                </div>
                                                                            )}
                                                                            {status === 'Submitted' && <FaCheck className="text-green-500 text-xs" />}
                                                                            {lockedBySequence && <FaLock className="text-slate-300 dark:text-slate-600 text-xs" />}
                                                                        </div>
                                                                    </h4>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{lesson.description}</p>
                                                                    {status === 'Graded' && sub?.feedback?.comment && (
                                                                        <div className="mt-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800 relative group-hover:border-indigo-100 dark:group-hover:border-indigo-900/50 transition-colors">
                                                                            <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-50 dark:bg-slate-900/50 border-t border-l border-slate-100 dark:border-slate-800 transform rotate-45 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/50 transition-colors"></div>
                                                                            <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 relative z-10 leading-relaxed">
                                                                                <span className="text-slate-400 dark:text-slate-500 mr-1">"</span>
                                                                                {sub.feedback.comment}
                                                                                <span className="text-slate-400 dark:text-slate-500 ml-1">"</span>
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-auto w-full pt-4">
                                                                {status !== 'Submitted' && status !== 'Graded' && !lockedBySequence && (
                                                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mb-3 overflow-hidden">
                                                                        <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                                                    </div>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    disabled={lockedBySequence}
                                                                    className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-colors text-xs disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400"
                                                                    onClick={() => !lockedBySequence && handleStartLesson(lesson)}
                                                                >
                                                                    {lockedBySequence ? 'Locked' : status === 'Submitted' || status === 'Graded' ? 'Review' : 'Start'} <FaChevronRight className="ml-1" />
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- ACTIVE LESSON VIEW ---
    const existingSubmission = submissions.find(s => s.lessonId === activeLesson.id);
    const isReadOnly = existingSubmission?.status === 'Submitted' || existingSubmission?.status === 'Graded';
    const currentStepIndex = existingSubmission?.currentStep || 0;
    const isComplete = currentStepIndex >= activeLesson.steps.length;
    const needsReflection = isComplete && activeLesson.reflectionQuestion && !isReadOnly;

    const stepToShowIndex = reviewStepIndex !== null ? reviewStepIndex : currentStepIndex;
    const isReviewing = reviewStepIndex !== null;
    const stepHistory = existingSubmission?.history?.find(h => h.stepIndex === stepToShowIndex);

    const currentInstructionRaw = activeLesson.steps[stepToShowIndex] || "";
    const isTextStep = currentInstructionRaw.startsWith('[TEXT]');
    const isNextStep = currentInstructionRaw.startsWith('[NEXT]');

    let displayInstruction = currentInstructionRaw;
    if (isTextStep) displayInstruction = currentInstructionRaw.replace('[TEXT]', '').trim();
    if (isNextStep) displayInstruction = currentInstructionRaw.replace('[NEXT]', '').trim();

    return (
        <div className="flex flex-col animate-in slide-in-from-right-4 h-full w-full absolute inset-0 bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div className="px-6 py-3 flex items-center justify-between min-h-[4.5rem]">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setActiveLesson(null)} className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <FaArrowLeft className="mr-2" /> Map
                        </Button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold text-slate-800 dark:text-white">{activeLesson.title}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                <span className="uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-bold">{activeLesson.type === 'Assignment' ? 'TEST' : 'Lesson'}</span>
                                <span>•</span>
                                <span>{activeLesson.objective}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        {isReadOnly ? (
                            <div className="px-4 py-1 bg-green-50 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-400 text-xs font-bold flex items-center gap-2 border border-green-100 dark:border-green-900/50">
                                <FaCircleCheck /> Completed
                            </div>
                        ) : (
                            <Button id="submit-btn" size="sm" onClick={handleSubmit}>
                                Submit <FaPaperPlane className="ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Teacher Feedback Banner */}
                {existingSubmission?.status === 'Graded' && existingSubmission.feedback && (
                    <div className={`
                        border-t px-6 py-5 transition-colors
                        ${existingSubmission.feedback.grade >= 90
                            ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30'
                            : existingSubmission.feedback.grade >= 70
                                ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30'
                                : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'
                        }
                    `}>
                        <div className="flex items-start gap-5">
                            <div className={`
                                w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-sm border shrink-0
                                ${existingSubmission.feedback.grade >= 90
                                    ? 'bg-white text-green-600 border-green-200 dark:bg-slate-800 dark:text-green-400 dark:border-green-800'
                                    : existingSubmission.feedback.grade >= 70
                                        ? 'bg-white text-amber-600 border-amber-200 dark:bg-slate-800 dark:text-amber-400 dark:border-amber-800'
                                        : 'bg-white text-red-600 border-red-200 dark:bg-slate-800 dark:text-red-400 dark:border-red-800'
                                }
                            `}>
                                <div className="text-2xl font-black tracking-tight">{existingSubmission.feedback.grade}</div>
                                <div className="text-[9px] font-bold uppercase tracking-wider opacity-60">Score</div>
                            </div>

                            <div className="flex-1 pt-0.5">
                                <h3 className={`text-xs font-bold uppercase tracking-wide mb-1.5 flex items-center gap-2
                                    ${existingSubmission.feedback.grade >= 90
                                        ? 'text-green-700 dark:text-green-400'
                                        : existingSubmission.feedback.grade >= 70
                                            ? 'text-amber-700 dark:text-amber-400'
                                            : 'text-red-700 dark:text-red-400'
                                    }
                                `}>
                                    <FaStar className="mb-0.5" /> Teacher Feedback
                                </h3>

                                <div className="relative">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        "{existingSubmission.feedback.comment}"
                                    </p>
                                </div>

                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center gap-1">
                                    <FaClock className="text-[9px]" />
                                    Graded on {new Date(existingSubmission.feedback.gradedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden">

                {/* Left: Editor */}
                <div className="flex-1 h-full flex flex-col min-h-0 relative overflow-hidden">
                    {activeLesson.editorType === 'scratch' ? (
                        <ScratchEditor
                            initialCode={currentCode}
                            onChange={setCurrentCode}
                            readOnly={isReadOnly || isReviewing}
                            onExplainError={handleConsoleError}
                        />
                    ) : (
                        <P5Editor
                            initialCode={currentCode}
                            onChange={setCurrentCode}
                            readOnly={isReadOnly || isReviewing}
                            onExplainSelection={handleExplainSelection}
                            onExplainError={handleConsoleError}
                            lessonTitle={activeLesson.title}
                        />
                    )}

                    {/* Hint/Error Overlay (Moved Inside Editor Area) */}
                    {aiAnalysis && !isAnalyzing && (
                        <div className="absolute bottom-4 left-4 right-4 z-20 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-purple-100 dark:border-slate-700 rounded-xl p-4 shadow-xl animate-in slide-in-from-bottom-2 max-w-lg">
                            <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-purple-800 dark:text-purple-400 mb-1 flex items-center gap-2">
                                    <FaLightbulb className="text-purple-500" /> AI Hint
                                </h4>
                                <button onClick={() => setAiAnalysis(null)} className="text-purple-300 hover:text-purple-500"><FaXmark /></button>
                            </div>
                            <p className="text-sm text-slate-800 dark:text-slate-200 mb-2 font-medium">{aiAnalysis.hint}</p>
                            <p className="text-xs text-purple-500 dark:text-purple-400 font-bold uppercase tracking-wide">{aiAnalysis.encouragement}</p>
                        </div>
                    )}

                    {/* Mission Brief Overlay - top left to avoid blocking Scratch backpack */}
                    {activeLesson.type === 'Lesson' && activeLesson.theory && showTheory && (
                        <div className="absolute top-2 left-2 w-[320px] z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-xl border border-indigo-100 dark:border-indigo-900/50 rounded-lg overflow-hidden animate-in slide-in-from-left-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 flex justify-between items-center border-b border-indigo-100 dark:border-indigo-900/30">
                                <h4 className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase flex items-center gap-1.5">
                                    <FaRobot /> Mission Brief
                                </h4>
                                <button onClick={() => setShowTheory(false)} className="text-[10px] text-indigo-400 dark:text-indigo-300 hover:text-indigo-700 font-bold">
                                    ✕
                                </button>
                            </div>
                            <div className="p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-32 overflow-y-auto no-scrollbar">
                                <SimpleMarkdown text={activeLesson.theory} />
                            </div>
                        </div>
                    )}
                    {!showTheory && activeLesson.type === 'Lesson' && (
                        <button
                            onClick={() => setShowTheory(true)}
                            className="absolute top-2 left-2 z-10 bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg hover:scale-105 transition-transform text-sm"
                            title="Show Mission Brief"
                        >
                            <FaBookOpen />
                        </button>
                    )}
                </div>

                {/* Resize Handle */}
                <div
                    className={`hidden lg:flex w-2 bg-slate-200 dark:bg-slate-700 hover:bg-indigo-400 dark:hover:bg-indigo-600 cursor-col-resize items-center justify-center group transition-colors flex-shrink-0 ${isResizing ? 'bg-indigo-500' : ''}`}
                    onMouseDown={handleMouseDown}
                >
                    <div className="w-0.5 h-12 bg-slate-400 dark:bg-slate-500 group-hover:bg-white rounded-full transition-colors"></div>
                </div>
                
                {/* Overlay to capture mouse events during resize (prevents iframe from stealing events) */}
                {isResizing && (
                    <div className="fixed inset-0 z-50 cursor-col-resize" />
                )}

                {/* Right: Sidebar */}
                <div 
                    id="student-sidebar" 
                    className="w-full bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden shadow-xl z-20 flex-shrink-0"
                    style={{ width: window.innerWidth >= 1024 ? sidebarWidth : '100%' }}
                >
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">

                        {/* Feedback Box */}
                        {stepFeedback && !isReviewing && (
                            <div className={`p-4 rounded-xl border-2 ${stepFeedback.passed ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/50' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50'} animate-in zoom-in-95 shadow-sm`}>
                                <h4 className={`text-sm font-bold mb-1 flex items-center gap-2 ${stepFeedback.passed ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                    {stepFeedback.passed ? <FaCircleCheck /> : <FaRobot />}
                                    {stepFeedback.passed ? 'Success!' : 'Oops!'}
                                </h4>
                                <p className={`text-xs font-medium ${stepFeedback.passed ? 'text-green-600 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                    {stepFeedback.message}
                                </p>
                            </div>
                        )}

                        {/* Active Step Card (Unified View) */}
                        {!isComplete && !isReadOnly && (
                            <div className={`bg-white dark:bg-slate-800 border-2 rounded-xl p-5 shadow-lg relative overflow-hidden transition-colors ${isReviewing ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900' : activeLesson.isAiGuided ? 'border-indigo-500 shadow-indigo-100 dark:shadow-none' : 'border-pink-300 dark:border-pink-800 shadow-sm'}`}>
                                <div className={`absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl ${isReviewing ? 'bg-slate-400' : activeLesson.isAiGuided ? 'bg-indigo-500' : 'bg-pink-500'}`}>
                                    {isReviewing ? 'REVIEWING' : activeLesson.isAiGuided ? `STEP ${stepToShowIndex + 1}` : `REQUIREMENT ${stepToShowIndex + 1}`}
                                </div>

                                <div className="mt-4 mb-6">
                                    {isTextStep && (
                                        <div className="mb-2 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1">
                                            <FaCommentDots /> Thought Question
                                        </div>
                                    )}
                                    {isNextStep && (
                                        <div className="mb-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
                                            <FaEye /> Observation
                                        </div>
                                    )}

                                    <div className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                                        {displayInstruction}
                                    </div>

                                    {isReviewing && stepHistory ? (
                                        <div className="mt-4 bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600 text-xs">
                                            <p className="font-bold text-slate-500 dark:text-slate-400 mb-1">Your Answer/Action:</p>
                                            <p className="text-slate-700 dark:text-slate-200 italic mb-2">"{stepHistory.studentInput}"</p>
                                            <p className="font-bold text-green-600 dark:text-green-400 mb-1">Feedback:</p>
                                            <p className="text-green-700 dark:text-green-300">{stepHistory.feedback}</p>
                                        </div>
                                    ) : (
                                        isTextStep && (
                                            <textarea
                                                className="w-full mt-3 p-2 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                rows={2}
                                                placeholder="Type your answer..."
                                                value={stepTextAnswer}
                                                onChange={(e) => setStepTextAnswer(e.target.value)}
                                            />
                                        )
                                    )}
                                </div>

                                {isReviewing ? (
                                    <Button onClick={closeReview} className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white">
                                        Back to Current Step
                                    </Button>
                                ) : (
                                    <Button
                                        id="next-step-btn"
                                        onClick={handleNextStep}
                                        disabled={isValidating}
                                        className={`w-full justify-center py-4 text-sm font-bold ${isValidating ? 'opacity-80' : 'hover:scale-[1.02] active:scale-[0.98] transition-transform'} ${!activeLesson.isAiGuided ? 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600' : ''}`}
                                    >
                                        {isValidating ? (
                                            <><FaSpinner className="animate-spin mr-2" /> Checking...</>
                                        ) : isNextStep ? (
                                            <>Next Step <FaChevronRight className="ml-2" /></>
                                        ) : !activeLesson.isAiGuided ? (
                                            <>Next Step <FaChevronRight className="ml-2" /></>
                                        ) : isTextStep ? (
                                            <>Check Answer <FaChevronRight className="ml-2" /></>
                                        ) : (
                                            <>Check My Code <FaChevronRight className="ml-2" /></>
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Reflection Step */}
                        {needsReflection && !isReviewing && (
                            <div className="mb-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-xl animate-in zoom-in shadow-sm">
                                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                                    <FaPen /> Reflection
                                </h3>
                                <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-3 font-medium">{activeLesson.reflectionQuestion}</p>
                                <textarea
                                    className="w-full p-3 rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500 mb-3"
                                    rows={3}
                                    placeholder="Type your answer here..."
                                    value={reflectionAnswer}
                                    onChange={(e) => setReflectionAnswer(e.target.value)}
                                />
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!reflectionAnswer.trim()}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                                >
                                    Submit Answer
                                </Button>
                            </div>
                        )}

                        {/* Finished State */}
                        {isComplete && !isReadOnly && !needsReflection && !isReviewing && (
                            <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-900/50 rounded-xl text-center animate-in zoom-in shadow-sm">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
                                    <FaStar className="animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Mission Accomplished!</h3>
                                <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md">
                                    Submit Work <FaPaperPlane className="ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* Progress List (Clickable History) */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                                {activeLesson.isAiGuided ? 'Mission Progress' : 'Requirements Checklist'}
                            </h4>
                            <div className="space-y-4 relative pl-4">
                                <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>

                                {activeLesson.steps.map((step, i) => {
                                    const isCurrent = i === currentStepIndex;
                                    const isDone = i < currentStepIndex;
                                    const isText = step.startsWith('[TEXT]');
                                    const isNext = step.startsWith('[NEXT]');

                                    let stepIcon = null;
                                    if (isDone) stepIcon = <FaCheck />;
                                    else if (isText) stepIcon = <FaCommentDots size={10} />;
                                    else if (isNext) stepIcon = <FaEye size={10} />;
                                    else stepIcon = <span className="text-[10px] font-bold">{i + 1}</span>;

                                    let stepLabel = step;
                                    if (isText) stepLabel = step.replace('[TEXT]', 'Question:');
                                    if (isNext) stepLabel = step.replace('[NEXT]', 'Observe:');

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => isDone && handleReviewStep(i)}
                                            className={`flex gap-4 py-1 group ${isCurrent ? 'opacity-100' : 'opacity-50 hover:opacity-80'} ${isDone ? 'cursor-pointer' : ''}`}
                                        >
                                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border z-10 bg-white dark:bg-slate-800 transition-colors
                                        ${isDone ? 'text-white bg-green-500 border-green-500 group-hover:bg-green-600' :
                                                    isCurrent ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-900' : 'text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700'}
                                    `}>
                                                {stepIcon}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`leading-tight ${isCurrent ? 'font-bold text-indigo-900 dark:text-indigo-300 text-xs' : 'text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                                                    {isCurrent ? "Current Step" : stepLabel}
                                                </p>
                                                {isDone && <p className="text-[9px] text-green-600 dark:text-green-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Click to review</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentView;
