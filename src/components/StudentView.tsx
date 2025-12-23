
import React, { useState } from 'react';
import { LessonPlan, Submission, Unit, StepHistory } from '../types';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import P5Editor from './P5Editor';
import ScratchEditor from './ScratchEditor';
import { FaChevronRight, FaCircleCheck, FaLightbulb, FaRobot, FaPaperPlane, FaArrowLeft, FaLock, FaSpinner, FaCheck, FaBookOpen, FaStar, FaPen, FaCommentDots, FaEye, FaClipboardCheck, FaArrowRotateLeft, FaXmark, FaClock, FaCode } from 'react-icons/fa6';
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
    const [currentCode, setCurrentCodeState] = useState<string>('');
    // Separate state for initial code that only changes when lesson changes (not on auto-save)
    const [initialCodeForEditor, setInitialCodeForEditor] = useState<string>('');

    const setCurrentCode = React.useCallback((code: string) => {
        setCurrentCodeState(code);
    }, []);
    const [aiAnalysis, setAiAnalysis] = useState<{ hint: string, encouragement: string } | null>(null);
    const [stepFeedback, setStepFeedback] = useState<{ passed: boolean, message: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [showTheory, setShowTheory] = useState(true);
    const [reflectionAnswer, setReflectionAnswer] = useState('');
    const [stepTextAnswer, setStepTextAnswer] = useState('');
    const [selectedChoice, setSelectedChoice] = useState<string>('');
    const [reviewStepIndex, setReviewStepIndex] = useState<number | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(380);
    const [isResizing, setIsResizing] = useState(false);

    // Ref to track latest submissions to avoid stale closures in setTimeout callbacks
    const submissionsRef = React.useRef(submissions);
    React.useEffect(() => {
        submissionsRef.current = submissions;
    }, [submissions]);

    // Refs for auto-save state
    const currentCodeRef = React.useRef(currentCode);
    const activeLessonRef = React.useRef(activeLesson);

    React.useEffect(() => {
        currentCodeRef.current = currentCode;
        activeLessonRef.current = activeLesson;
    }, [currentCode, activeLesson]);

    // Auto-save Scratch projects to server
    React.useEffect(() => {
        if (!activeLesson || activeLesson.editorType !== 'scratch' || !currentCode) return;

        const existingSub = submissionsRef.current.find(s => s.lessonId === activeLesson.id);
        const isReadOnly = existingSub?.status === 'Submitted' || existingSub?.status === 'Graded';
        if (isReadOnly) return;

        // Skip auto-save if this is the exact same code we just loaded
        const getInitialCode = (lesson: LessonPlan) => {
            const sub = submissionsRef.current.find(s => s.lessonId === lesson.id);
            if (sub) return sub.code;

            // Check continuity
            const unitLessons = lessons.filter(l => l.unitId === lesson.unitId);
            const unitSubmissions = submissionsRef.current.filter(s =>
                unitLessons.some(l => l.id === s.lessonId)
            ).sort((a, b) => {
                const timeA = a.updatedAt || a.submittedAt || 0;
                const timeB = b.updatedAt || b.submittedAt || 0;
                return timeB - timeA;
            });

            if (unitSubmissions.length > 0) return unitSubmissions[0].code;
            return lesson.referenceProject || lesson.starterCode;
        };

        const initialCode = getInitialCode(activeLesson);
        if (currentCode === initialCode) return;

        const timer = setTimeout(() => {
            console.log('💾 [DEBUG StudentView] Auto-saving Scratch project...');
            const latestSub = submissionsRef.current.find(s => s.lessonId === activeLesson.id);
            const currentStep = latestSub?.currentStep || 0;
            onUpdateProgress(activeLesson.id, currentCode, currentStep);
        }, 5000); // 5 second debounce

        return () => {
            clearTimeout(timer);
            // Force save on unmount if there's a pending change
            if (activeLessonRef.current && activeLessonRef.current.editorType === 'scratch') {
                const finalCode = currentCodeRef.current;
                const currentLesson = activeLessonRef.current;
                const sub = submissionsRef.current.find(s => s.lessonId === currentLesson.id);
                const readOnly = sub?.status === 'Submitted' || sub?.status === 'Graded';

                if (!readOnly && finalCode && finalCode !== getInitialCode(currentLesson)) {
                    console.log('💾 [DEBUG StudentView] Forcing final save on unmount...');
                    const currentStep = sub?.currentStep || 0;
                    onUpdateProgress(currentLesson.id, finalCode, currentStep);
                }
            }
        };
    }, [currentCode, activeLesson?.id, onUpdateProgress, lessons]);

    const handleStartLesson = (lesson: LessonPlan) => {
        console.log('🔍 [DEBUG StudentView] Starting lesson:', lesson.title, lesson.id);
        console.log('🔍 [DEBUG StudentView] Lesson type:', lesson.editorType, 'unitId:', lesson.unitId);

        let existingSub = submissions.find(s => s.lessonId === lesson.id);
        console.log('🔍 [DEBUG StudentView] Direct submission found:', !!existingSub);

        // For Scratch lessons, if no submission exists, try to find the most recent submission
        // from other lessons in the same unit for continuity
        if (!existingSub && lesson.editorType === 'scratch' && lesson.unitId) {
            const unitLessons = lessons.filter(l => l.unitId === lesson.unitId);
            console.log('🔍 [DEBUG StudentView] Unit lessons found:', unitLessons.length);

            const unitSubmissions = submissions.filter(s =>
                unitLessons.some(l => l.id === s.lessonId)
            ).sort((a, b) => {
                const timeA = a.updatedAt || a.submittedAt || 0;
                const timeB = b.updatedAt || b.submittedAt || 0;
                return timeB - timeA;
            }); // Most recent first (including drafts)

            console.log('🔍 [DEBUG StudentView] Unit submissions found:', unitSubmissions.length);
            console.log('🔍 [DEBUG StudentView] Unit submissions details:', unitSubmissions.map(s => ({
                lessonId: s.lessonId,
                submittedAt: new Date(s.submittedAt).toLocaleString(),
                codeLength: s.code.length
            })));

            if (unitSubmissions.length > 0) {
                existingSub = unitSubmissions[0]; // Use the most recent submission from the unit
                console.log('🔍 [DEBUG StudentView] Using continuity submission from lesson:', existingSub.lessonId);
            }
        }

        // For Scratch lessons, use referenceProject for continuity if available
        const initialCode = existingSub
            ? existingSub.code
            : (lesson.editorType === 'scratch' && lesson.referenceProject)
                ? lesson.referenceProject
                : lesson.starterCode;

        console.log('🔍 [DEBUG StudentView] Final initialCode source:', {
            hasExistingSub: !!existingSub,
            usedContinuity: existingSub && submissions.find(s => s.lessonId === lesson.id) !== existingSub,
            hasReferenceProject: !!(lesson.editorType === 'scratch' && lesson.referenceProject),
            codeLength: initialCode.length,
            codePreview: initialCode.substring(0, 200) + '...',
            isValidJSON: (() => {
                try {
                    JSON.parse(initialCode);
                    return true;
                } catch (e) {
                    return false;
                }
            })()
        });

        // Try to parse and check the structure
        try {
            if (initialCode.startsWith('data:')) {
                console.log('🔍 [DEBUG StudentView] InitialCode is a Base64 SB3 package (length: ' + initialCode.length + ')');
            } else {
                console.log('🔍 [DEBUG StudentView] About to parse initialCode. First 500 chars:', initialCode.substring(0, 500));
                const parsed = JSON.parse(initialCode);
                console.log('🔍 [DEBUG StudentView] JSON.parse result type:', typeof parsed);

                // Check if it's double-encoded
                if (typeof parsed === 'string') {
                    console.log('🔍 [DEBUG StudentView] Parsed result is a string! Trying to parse again...');
                    try {
                        const doubleParsed = JSON.parse(parsed);
                        console.log('🔍 [DEBUG StudentView] Double-parsed structure:', {
                            hasTargets: !!doubleParsed.targets,
                            targetsCount: doubleParsed.targets?.length
                        });
                    } catch (e2) {
                        console.error('🔍 [DEBUG StudentView] Double parse failed:', e2);
                    }
                }
            }
        } catch (e) {
            console.error('🔍 [DEBUG StudentView] Failed to parse initialCode as JSON:', e);
            console.error('🔍 [DEBUG StudentView] Error details:', e.message);
        }

        setCurrentCode(initialCode);
        setInitialCodeForEditor(initialCode); // Set stable initial code that only changes on lesson switch
        setActiveLesson(lesson);
        setAiAnalysis(null);
        setStepFeedback(null);
        setShowTheory(true);
        setReflectionAnswer(existingSub?.textAnswer || '');
        setStepTextAnswer('');
        setSelectedChoice('');
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
            console.log('🔍 [DEBUG StudentView] Submitting lesson:', activeLesson.title, activeLesson.id);
            console.log('🔍 [DEBUG StudentView] Code being submitted:', {
                length: currentCode.length,
                preview: currentCode.substring(0, 200) + '...',
                isScratch: activeLesson.editorType === 'scratch'
            });

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
        const isCodeStep = currentInstruction.startsWith('[CODE]');
        const isChoiceStep = currentInstruction.startsWith('[CHOICE]');

        // Handle Non-Guided Mode (Manual Next)
        if (!activeLesson.isAiGuided) {
            if (isTextStep && !stepTextAnswer.trim()) {
                setStepFeedback({ passed: false, message: "Type your answer first!" });
                return;
            }
            if (isChoiceStep && !selectedChoice) {
                setStepFeedback({ passed: false, message: "Please select an answer!" });
                return;
            }

            // Save progress without validation
            const historyItem: StepHistory = {
                stepIndex: currentStepIndex,
                studentInput: isTextStep ? stepTextAnswer : isChoiceStep ? selectedChoice : 'Manual Step',
                feedback: 'Completed.',
                passed: true
            };
            onUpdateProgress(activeLesson.id, currentCode, currentStepIndex + 1, historyItem);
            setStepTextAnswer('');
            setSelectedChoice('');
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

        // 3. Multiple Choice Step (Guided) - No AI, instant validation
        if (isChoiceStep) {
            if (!selectedChoice) {
                setStepFeedback({ passed: false, message: "Please select an answer!" });
                return;
            }

            // Parse choice format: [CHOICE] Question | A: Option | B: Option | C: Option | D: Option | CorrectAnswer
            const parts = currentInstruction.replace('[CHOICE]', '').split('|').map(p => p.trim());
            const correctAnswer = parts[parts.length - 1]; // Last part is the correct answer
            const isCorrect = selectedChoice === correctAnswer;

            const historyItem: StepHistory = {
                stepIndex: currentStepIndex,
                studentInput: selectedChoice,
                feedback: isCorrect ? 'Correct! Well done!' : `Not quite. The correct answer is ${correctAnswer}.`,
                passed: isCorrect
            };

            if (isCorrect) {
                setStepFeedback({ passed: true, message: 'Correct! 🎉' });
                setTimeout(() => {
                    onUpdateProgress(activeLesson.id, currentCode, currentStepIndex + 1, historyItem);
                    setStepFeedback(null);
                    setSelectedChoice('');
                }, 1500);
            } else {
                setStepFeedback({ passed: false, message: `Not quite. The correct answer is ${correctAnswer}.` });
            }
            return;
        }

        // 4. Code Step (Guided) - Use AI validation like regular code steps
        if (isCodeStep) {
            // Treat as regular code validation
            setIsValidating(true);
            setStepFeedback(null);

            const result = await validateStep(currentCode, currentInstruction);

            if (result) {
                if (result.passed) {
                    setStepFeedback({ passed: true, message: result.feedback });
                    const historyItem: StepHistory = {
                        stepIndex: currentStepIndex,
                        studentInput: currentCode,
                        feedback: result.feedback,
                        passed: true
                    };
                    setTimeout(() => {
                        onUpdateProgress(activeLesson.id, currentCode, currentStepIndex + 1, historyItem);
                        setStepFeedback(null);
                    }, 2000);
                } else {
                    setStepFeedback({ passed: false, message: result.feedback });
                }
            }
            setIsValidating(false);
            return;
        }

        // 5. Regular Validation (Guided)
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
    const isCodeStep = currentInstructionRaw.startsWith('[CODE]');
    const isChoiceStep = currentInstructionRaw.startsWith('[CHOICE]');

    let displayInstruction = currentInstructionRaw;
    let choiceOptions: string[] = [];
    let choiceCorrectAnswer = '';

    if (isTextStep) displayInstruction = currentInstructionRaw.replace('[TEXT]', '').trim();
    if (isNextStep) displayInstruction = currentInstructionRaw.replace('[NEXT]', '').trim();
    if (isCodeStep) displayInstruction = currentInstructionRaw.replace('[CODE]', '').trim();
    if (isChoiceStep) {
        // Parse: [CHOICE] Question | A: Option | B: Option | C: Option | D: Option | CorrectAnswer
        const parts = currentInstructionRaw.replace('[CHOICE]', '').split('|').map(p => p.trim());
        displayInstruction = parts[0];
        choiceOptions = parts.slice(1, -1); // All except first (question) and last (answer)
        choiceCorrectAnswer = parts[parts.length - 1];
    }

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
                            key={`scratch-${activeLesson.id}`}
                            initialCode={initialCodeForEditor}
                            onChange={setCurrentCode}
                            readOnly={isReadOnly || isReviewing}
                            onExplainError={handleConsoleError}
                        />
                    ) : (
                        <P5Editor
                            key={`p5-${activeLesson.id}`}
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
                                    {isCodeStep && (
                                        <div className="mb-2 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase flex items-center gap-1">
                                            <FaCode /> Coding Challenge
                                        </div>
                                    )}
                                    {isChoiceStep && (
                                        <div className="mb-2 text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase flex items-center gap-1">
                                            <FaCircleCheck /> Multiple Choice
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
                                        <>
                                            {isTextStep && (
                                                <textarea
                                                    className="w-full mt-3 p-2 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    rows={2}
                                                    placeholder="Type your answer..."
                                                    value={stepTextAnswer}
                                                    onChange={(e) => setStepTextAnswer(e.target.value)}
                                                />
                                            )}
                                            {isChoiceStep && (
                                                <div className="mt-4 space-y-2">
                                                    {choiceOptions.map((option, idx) => {
                                                        const optionLetter = option.split(':')[0].trim();
                                                        return (
                                                            <label
                                                                key={idx}
                                                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedChoice === optionLetter
                                                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-800'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="choice"
                                                                    value={optionLetter}
                                                                    checked={selectedChoice === optionLetter}
                                                                    onChange={(e) => setSelectedChoice(e.target.value)}
                                                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                                                />
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{option}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
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
                                        ) : isChoiceStep ? (
                                            <>Submit Answer <FaChevronRight className="ml-2" /></>
                                        ) : isCodeStep ? (
                                            <>Check My Code <FaChevronRight className="ml-2" /></>
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
