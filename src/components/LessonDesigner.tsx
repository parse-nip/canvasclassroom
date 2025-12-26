import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LessonPlan, Unit } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { FaArrowLeft, FaFloppyDisk, FaRocket, FaPlus, FaTrash, FaGripLines, FaPlay, FaEye, FaCode, FaGear, FaLightbulb, FaCircleInfo, FaListCheck } from 'react-icons/fa6';
import P5Editor from './P5Editor';
import ScratchEditor from './ScratchEditor';

interface LessonDesignerProps {
    onAddLesson: (lesson: LessonPlan) => Promise<LessonPlan | undefined>;
    onUpdateLesson: (lesson: LessonPlan) => Promise<void>;
    lessons: LessonPlan[];
    units: Unit[];
}

const LessonDesigner: React.FC<LessonDesignerProps> = ({
    onAddLesson,
    onUpdateLesson,
    lessons,
    units
}) => {
    const { classId, lessonId } = useParams<{ classId: string; lessonId?: string }>();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState<LessonPlan>({
        id: '',
        classId: classId || '',
        type: 'Lesson',
        topic: '',
        title: '',
        difficulty: 'Beginner',
        objective: '',
        description: '',
        theory: '',
        steps: [],
        starterCode: '// Write your starter code here\n\nfunction setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(220);\n}',
        challenge: '',
        isAiGuided: true,
        editorType: 'p5'
    });

    const [activeTab, setActiveTab] = useState<'details' | 'steps' | 'code'>('details');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPreview, setShowPreview] = useState(true);

    // Load lesson if editing
    useEffect(() => {
        if (lessonId) {
            const existing = lessons.find(l => l.id === lessonId);
            if (existing) {
                setLesson(existing);
            }
        } else {
            // Check localStorage for draft
            const draft = localStorage.getItem(`lesson_draft_${classId}`);
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    setLesson(prev => ({ ...prev, ...parsed, id: '' })); // Keep it as a new lesson
                } catch (e) {
                    console.error('Failed to parse draft', e);
                }
            }
        }
    }, [lessonId, lessons, classId]);

    // Auto-save to localStorage
    useEffect(() => {
        if (!lessonId) {
            const timer = setTimeout(() => {
                localStorage.setItem(`lesson_draft_${classId}`, JSON.stringify(lesson));
                setLastSaved(new Date());
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [lesson, lessonId, classId]);

    const handleUpdateField = (field: keyof LessonPlan, value: any) => {
        setLesson(prev => ({ ...prev, [field]: value }));
    };

    const parseStep = (step: string) => {
        const match = step.match(/^\[(CODE|TEXT|NEXT|CHOICE)\]\s*(.*)$/s);
        if (match) {
            return { type: match[1], text: match[2] };
        }
        return { type: 'NEXT', text: step }; // Default to NEXT for instruction
    };

    const serializeStep = (type: string, text: string) => {
        return `[${type}] ${text}`;
    };

    const handleUpdateStep = (index: number, text: string, type?: string) => {
        const currentStep = parseStep(lesson.steps[index]);
        const newText = text !== undefined ? text : currentStep.text;
        const newType = type !== undefined ? type : currentStep.type;

        const newSteps = [...lesson.steps];
        newSteps[index] = serializeStep(newType, newText);
        handleUpdateField('steps', newSteps);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = lesson.steps.filter((_, i) => i !== index);
        handleUpdateField('steps', newSteps);
    };

    const handleAddStep = () => {
        setLesson(prev => ({
            ...prev,
            steps: [...prev.steps, serializeStep('NEXT', '')]
        }));
    };

    const handleSave = async (publish = false) => {
        if (!lesson.title || !lesson.topic) {
            alert('Please provide a title and topic.');
            return;
        }

        setIsSaving(true);
        try {
            if (lessonId) {
                await onUpdateLesson(lesson);
            } else {
                const created = await onAddLesson(lesson);
                if (created) {
                    localStorage.removeItem(`lesson_draft_${classId}`);
                    navigate(`/teacher/${classId}/designer/${created.id}`, { replace: true });
                }
            }
            setLastSaved(new Date());
        } catch (e) {
            console.error('Save failed', e);
            alert('Save failed. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit? Unsaved changes might be lost.')) {
            navigate(`/teacher/${classId}`);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
            {/* Designer Header */}
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleExit} className="text-slate-500 hover:text-slate-700">
                        <span className="mr-2"><FaArrowLeft /></span> Exit
                    </Button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {lessonId ? 'Edit Lesson' : 'New Lesson'}
                            <span className="text-xs font-normal text-slate-400">
                                {lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        className="hidden md:flex"
                    >
                        <span className="mr-2"><FaFloppyDisk /></span> {isSaving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <span className="mr-2"><FaRocket /></span> {lessonId ? 'Update & Exit' : 'Publish & Exit'}
                    </Button>
                </div>
            </header>

            {/* Main Content Areas */}
            <main className="flex-1 flex min-h-0 overflow-hidden">
                {/* Sidebar Tabs */}
                <nav className="w-16 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-6 shrink-0">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`p-3 rounded-xl transition-all ${activeTab === 'details' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Lesson Details"
                    >
                        <FaGear size={20} />
                    </button>
                    <button
                        onClick={() => setActiveTab('steps')}
                        className={`p-3 rounded-xl transition-all ${activeTab === 'steps' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Learning Steps"
                    >
                        <FaPlay size={20} />
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`p-3 rounded-xl transition-all ${activeTab === 'code' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Starter Code"
                    >
                        <FaCode size={20} />
                    </button>
                </nav>

                {/* Editor Form Panel */}
                <div className="w-[450px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-8 flex-shrink-0">
                    {activeTab === 'details' && (
                        <div className="space-y-6 animate-in fade-in transition-all">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Lesson Basics</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lesson Title</label>
                                    <input
                                        type="text"
                                        value={lesson.title}
                                        onChange={(e) => handleUpdateField('title', e.target.value)}
                                        placeholder="e.g., Intro to Loops"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topic</label>
                                        <input
                                            type="text"
                                            value={lesson.topic}
                                            onChange={(e) => handleUpdateField('topic', e.target.value)}
                                            placeholder="e.g., Programming"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                                        <select
                                            value={lesson.difficulty}
                                            onChange={(e) => handleUpdateField('difficulty', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all dark:text-white"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Editor Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleUpdateField('editorType', 'p5')}
                                            className={`py-2 rounded-lg border-2 font-bold text-sm transition-all ${lesson.editorType === 'p5' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}
                                        >
                                            p5.js
                                        </button>
                                        <button
                                            onClick={() => handleUpdateField('editorType', 'scratch')}
                                            className={`py-2 rounded-lg border-2 font-bold text-sm transition-all ${lesson.editorType === 'scratch' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}
                                        >
                                            Scratch
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Learning Objective</label>
                                    <textarea
                                        value={lesson.objective}
                                        onChange={(e) => handleUpdateField('objective', e.target.value)}
                                        placeholder="What will the student learn?"
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all dark:text-white resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={lesson.description}
                                        onChange={(e) => handleUpdateField('description', e.target.value)}
                                        placeholder="Short summary for the dashboard..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all dark:text-white resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Theory (Markdown)</label>
                                    <textarea
                                        value={lesson.theory}
                                        onChange={(e) => handleUpdateField('theory', e.target.value)}
                                        placeholder="Explain the concepts in detail..."
                                        rows={5}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all font-mono text-sm dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'steps' && (
                        <div className="space-y-6 animate-in slide-in-from-left-1 transition-all pt-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Guided Steps</h3>
                                <Button variant="secondary" size="sm" onClick={handleAddStep} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <span className="mr-2"><FaPlus /></span> Add Step
                                </Button>
                            </div>

                            <div className="space-y-4 pb-10">
                                {lesson.steps.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                                        <p className="text-sm">No steps added yet.</p>
                                        <p className="text-xs mt-1">Break down the lesson into small achievements.</p>
                                    </div>
                                )}

                                {lesson.steps.map((stepStr, idx) => {
                                    const { type, text } = parseStep(stepStr);
                                    return (
                                        <div key={idx} className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 relative hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700 shrink-0">
                                                        {idx + 1}
                                                    </span>

                                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1 border border-slate-200 dark:border-slate-700">
                                                        <button
                                                            onClick={() => handleUpdateStep(idx, text, 'NEXT')}
                                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${type === 'NEXT' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                        >
                                                            <FaCircleInfo size={12} /> Instruction
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStep(idx, text, 'CODE')}
                                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${type === 'CODE' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                        >
                                                            <FaCode size={12} /> Code Task
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStep(idx, text, 'TEXT')}
                                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${type === 'TEXT' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                        >
                                                            <FaLightbulb size={12} /> Theory
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStep(idx, text, 'CHOICE')}
                                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${type === 'CHOICE' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                        >
                                                            <FaListCheck size={12} /> Quiz
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveStep(idx)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>

                                            <div className="relative group/field">
                                                <textarea
                                                    value={text}
                                                    onChange={(e) => handleUpdateStep(idx, e.target.value)}
                                                    placeholder={
                                                        type === 'CODE' ? "Describe what the student should code..." :
                                                            type === 'TEXT' ? "Explain a concept or ask a written question..." :
                                                                type === 'CHOICE' ? "Question | Option A | Option B | Option C | Option D | CorrectOption" :
                                                                    "What should the student do next?"
                                                    }
                                                    rows={3}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm dark:text-white transition-all"
                                                />
                                                <div className="absolute bottom-4 right-4 opacity-10 group-hover/field:opacity-20 transition-opacity pointer-events-none">
                                                    {type === 'CODE' ? <FaCode size={32} /> :
                                                        type === 'TEXT' ? <FaLightbulb size={32} /> :
                                                            type === 'CHOICE' ? <FaListCheck size={32} /> :
                                                                <FaCircleInfo size={32} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'code' && (
                        <div className="h-full flex flex-col animate-in slide-in-from-left-4 transition-all">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Starter Code</h3>
                                <p className="text-xs text-slate-500 mt-1">This is what the student will see when they first open the lesson.</p>
                            </div>

                            <div className="flex-1 min-h-[400px]">
                                <textarea
                                    value={lesson.starterCode}
                                    onChange={(e) => handleUpdateField('starterCode', e.target.value)}
                                    className="w-full h-full p-6 bg-slate-900 text-indigo-300 font-mono text-sm rounded-2xl outline-none border-2 border-slate-800 focus:border-indigo-500 transition-all resize-none shadow-inner"
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Live Preview Panel */}
                <div className="flex-1 bg-slate-200 dark:bg-black relative overflow-hidden flex flex-col">
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        <div className="px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Preview
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur"
                        >
                            {showPreview ? <span className="mr-2"><FaEye /></span> : <span className="mr-2"><FaEye /></span>} {showPreview ? 'Hide Player' : 'Show Player'}
                        </Button>
                    </div>

                    {!showPreview ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 italic">
                            Preview is hidden. Enable to see how your lesson runs.
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            {lesson.editorType === 'p5' ? (
                                <P5Editor
                                    key={lesson.starterCode} // Reload editor when starter code changes for fresh preview
                                    initialCode={lesson.starterCode || ''}
                                    lessonTitle={lesson.title}
                                    readOnly={true}
                                />
                            ) : (
                                <ScratchEditor
                                    key={lesson.starterCode}
                                    initialCode={lesson.starterCode || ''}
                                    readOnly={true}
                                />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LessonDesigner;
