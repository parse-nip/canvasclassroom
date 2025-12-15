import React, { useState, useEffect } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentView from './components/StudentView';
import TutorialOverlay, { TutorialStep, SubStep } from './components/TutorialOverlay';
import ClassManager from './components/ClassManager';
import StudentRoster from './components/StudentRoster';
import { LessonPlan, Student, Submission, Unit, StepHistory, Class } from './types';
import { supabaseService } from './services/supabaseService';
import { FaChalkboardUser, FaUserAstronaut, FaMoon, FaSun, FaQuestion } from 'react-icons/fa6';

// Helper to create default class
const createDefaultClass = (): Class => ({
  id: 'default-class',
  name: 'My First Class',
  period: 'Period 1',
  academicYear: new Date().getFullYear().toString(),
  teacherId: 'teacher1',
  classCode: '123456',
  createdAt: Date.now()
});

// Default Units with lock status and timestamps (will be scoped to class)
const createDefaultUnits = (classId: string): Unit[] => [
  { id: 'u1', classId, title: 'Unit 1: Foundations', description: 'Core concepts of p5.js and drawing.', order: 0, isLocked: false, isSequential: true },
  { id: 'u2', classId, title: 'Unit 2: Interaction', description: 'Mouse and keyboard events.', order: 1, isLocked: true, isSequential: true },
  { id: 'u3', classId, title: 'Unit 3: Animation', description: 'Movement, velocity, and physics.', order: 2, isLocked: true, isSequential: true },
  { id: 'u4', classId, title: 'Unit 4: Future Tech', description: 'Advanced synthesis.', order: 3, isLocked: false, isSequential: true, availableAt: Date.now() + 86400000 * 7 }
];

// Default lessons (will be scoped to class)
const createDefaultLessons = (classId: string, unitId: string): LessonPlan[] => [
  {
    id: '1',
    classId,
    unitId,
    type: 'Lesson',
    topic: 'Introduction',
    title: 'Hello Shapes',
    difficulty: 'Beginner',
    objective: 'Learn to draw basic primitives',
    description: 'Draw your first shapes.',
    theory: "**Welcome to p5.js!** \n\nThink of the canvas like a piece of graph paper. \n- **X** is left-to-right.\n- **Y** is up-and-down.",
    steps: [
      '[NEXT] First, look at the code. Notice the numbers inside createCanvas()?',
      '[TEXT] What do you think the numbers 400, 400 mean?',
      'Use `createCanvas(400, 400)` to make space.',
      'Set a `background` color.',
      'Draw a `rect` (rectangle) in the middle.'
    ],
    starterCode: '// setup() runs once at the start\nfunction setup() {\n  // This creates our drawing space (width, height)\n  createCanvas(400, 400);\n}\n\n// draw() runs over and over again\nfunction draw() {\n  // 220 is a light gray color\n  background(220);\n  \n  // Try changing the numbers below!\n  // rect(x, y, width, height)\n  rect(150, 150, 100, 100);\n}',
    challenge: 'Can you change the colors of the shapes using fill()?',
    isAiGuided: true,
    tags: ['shapes', 'coordinates', 'color'],
    reflectionQuestion: 'Why do we put the background() command inside the draw() function?'
  },
  {
    id: '2',
    classId,
    unitId,
    type: 'Lesson',
    topic: 'Colors',
    title: 'Colorful World',
    difficulty: 'Beginner',
    objective: 'Use fill() and stroke()',
    description: 'Add color to your sketches.',
    theory: "Colors in computers are mixed using **Red**, **Green**, and **Blue** (RGB). \n\n`fill(255, 0, 0)` is bright Red!",
    steps: [
      '[NEXT] Run the code and see the white circle.',
      'Draw a circle.',
      'Use `fill(r, g, b)` before the circle to color it.'
    ],
    starterCode: 'function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(220);\n  \n  // CHANGE ME: Add a fill() command here\n  \n  ellipse(200, 200, 100, 100);\n}',
    challenge: 'Make the circle green!',
    isAiGuided: true,
    tags: ['color', 'shapes']
  }
];

// Tutorial Steps
const TEACHER_TUTORIAL: TutorialStep[] = [
  { 
    targetId: 'tab-planner', 
    title: 'Lesson Planner', 
    content: 'Create new lessons with AI assistance. Click this tab to explore its features.', 
    position: 'bottom',
    requireClick: true,
    substeps: [
      {
        targetId: 'planner-type-selector',
        label: 'Lesson Type',
        description: 'Choose between Interactive Lessons for teaching new concepts, or Coding Assignments for practice and tests.'
      },
      {
        targetId: 'planner-topic-input',
        label: 'Topic Input',
        description: 'Enter your lesson topic here. Click "Need Ideas?" for AI-powered suggestions based on your existing curriculum.'
      },
      {
        targetId: 'btn-generate',
        label: 'Generate Button',
        description: 'Click this to have AI create a complete lesson with theory, steps, starter code, and challenges.'
      },
      {
        targetId: 'planner-custom-btn',
        label: 'Custom Lesson',
        description: 'Prefer to write your own? Click here to create a lesson from scratch with full control over all content.'
      }
    ]
  },
  { 
    targetId: 'tab-curriculum', 
    title: 'Curriculum Manager', 
    content: 'Organize your lessons into Units. Click to explore.', 
    position: 'bottom',
    requireClick: true,
    substeps: [
      {
        targetId: 'create-unit-area',
        label: 'Create Units',
        description: 'Add new units to organize your lessons. Set optional unlock dates for scheduled releases.'
      },
      {
        targetId: 'curriculum-units',
        label: 'Unit Columns',
        description: 'Drag and drop lessons between units. Each unit can be locked/unlocked and set to sequential mode.'
      }
    ]
  },
  { 
    targetId: 'tab-grading', 
    title: 'Grading Center', 
    content: 'Review and grade student submissions. Click to explore.', 
    position: 'bottom',
    requireClick: true,
    substeps: [
      {
        targetId: 'grading-submissions-list',
        label: 'Submissions Queue',
        description: 'See all pending submissions here. Click any submission to review the student\'s work.'
      },
      {
        targetId: 'grading-interface',
        label: 'Grading Panel',
        description: 'View student code with live preview, read their reflection responses, and enter grades with feedback.'
      }
    ]
  },
  { 
    targetId: 'tab-analytics', 
    title: 'Analytics Dashboard', 
    content: 'Track class performance with visual charts and identify students who need help.', 
    position: 'bottom',
    requireClick: true
  },
  { 
    targetId: 'tab-roster', 
    title: 'Class Roster', 
    content: 'Manage your student list and enrollment settings.', 
    position: 'bottom',
    requireClick: true
  },
  { 
    targetId: 'tab-communication', 
    title: 'Communication Hub', 
    content: 'Post announcements to keep your class informed about assignments and updates.', 
    position: 'bottom',
    requireClick: true
  },
  { 
    targetId: 'tab-help', 
    title: 'Help Queue', 
    content: 'Students can raise their hand for help while coding. See who needs assistance in real-time.', 
    position: 'bottom',
    requireClick: true
  },
  { 
    targetId: 'tab-tools', 
    title: 'Teacher Tools', 
    content: 'Export grades, manage templates, and perform bulk operations. You\'re all set!', 
    position: 'bottom'
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'teacher' | 'student'>('teacher');

  // Class Management
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);

  // Class-scoped data
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copiedClassCode, setCopiedClassCode] = useState(false);

  // Tutorial State
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  
  // Tab state (lifted for tutorial control)
  const [activeTab, setActiveTab] = useState<'planner' | 'curriculum' | 'grading' | 'analytics' | 'roster' | 'communication' | 'tools' | 'help'>('planner');

  const currentStudentId = 's1';

  // Initialize with default class if none exists
  useEffect(() => {
    if (classes.length === 0) {
      const defaultClass = createDefaultClass();
      setClasses([defaultClass]);
      setCurrentClassId(defaultClass.id);

      // Initialize default data for first class
      const defaultUnits = createDefaultUnits(defaultClass.id);
      const defaultLessons = createDefaultLessons(defaultClass.id, defaultUnits[0].id);
      setUnits(defaultUnits);
      setLessons(defaultLessons);
    }
  }, []);

  // Load class data when class changes
  useEffect(() => {
    if (currentClassId) {
      // Filter data by current class
      // In real implementation, this would fetch from Supabase
      setUnits(prev => prev.filter(u => u.classId === currentClassId));
      setLessons(prev => prev.filter(l => l.classId === currentClassId));
      setSubmissions(prev => prev.filter(s => s.classId === currentClassId));
    }
  }, [currentClassId]);

  // Theme Toggle Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const startTutorial = () => {
    setTutorialStepIndex(0);
    setTutorialActive(true);
  };

  const handleTutorialNext = () => {
    if (tutorialStepIndex < TEACHER_TUTORIAL.length - 1) {
      setTutorialStepIndex(prev => prev + 1);
    } else {
      setTutorialActive(false);
    }
  };

  const handleTutorialTabClick = (tabId: string) => {
    // Extract the tab name from the ID (e.g., "tab-planner" -> "planner")
    const tabName = tabId.replace('tab-', '') as typeof activeTab;
    setActiveTab(tabName);
  };

  // Class Management Handlers
  const handleCreateClass = async (classData: Omit<Class, 'id' | 'createdAt' | 'classCode'>) => {
    const newClass = await supabaseService.createClass(classData);
    setClasses(prev => [...prev, newClass]);
    setCurrentClassId(newClass.id);

    // Initialize with default units for new class
    const defaultUnits = createDefaultUnits(newClass.id);
    setUnits(prev => [...prev, ...defaultUnits]);
  };

  const handleUpdateClass = async (classId: string, updates: Partial<Class>) => {
    const updatedClass = await supabaseService.updateClass(classId, updates);
    setClasses(prev => prev.map(c => c.id === classId ? updatedClass : c));
  };

  const handleDeleteClass = async (classId: string) => {
    await supabaseService.deleteClass(classId);
    setClasses(prev => prev.filter(c => c.id !== classId));
    if (currentClassId === classId && classes.length > 1) {
      setCurrentClassId(classes.find(c => c.id !== classId)?.id || null);
    }
  };

  const handleSelectClass = (classId: string) => {
    setCurrentClassId(classId);
  };

  const handleCopyClassCode = (classCode: string) => {
    navigator.clipboard.writeText(classCode);
    setCopiedClassCode(true);
    setTimeout(() => setCopiedClassCode(false), 2000);
  };

  // Student Management Handlers
  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'avatar'>) => {
    if (!currentClassId) return;
    const newStudent = await supabaseService.createStudent(studentData);
    setStudents(prev => [...prev, newStudent]);
  };

  const handleUpdateStudent = async (studentId: string, updates: Partial<Student>) => {
    const updatedStudent = await supabaseService.updateStudent(studentId, updates);
    setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
  };

  const handleRemoveStudent = async (studentId: string) => {
    await handleUpdateStudent(studentId, { isActive: false });
  };

  const handleImportCSV = async (csvData: string) => {
    if (!currentClassId) return;
    const importedStudents = await supabaseService.importStudentsFromCSV(currentClassId, csvData);
    setStudents(prev => [...prev, ...importedStudents]);
  };

  // Lesson/Unit Handlers (now class-scoped)
  const handleAddLesson = (lesson: LessonPlan) => {
    if (!currentClassId) return;
    const lessonWithClass = { ...lesson, classId: currentClassId };
    setLessons(prev => [lessonWithClass, ...prev]);
  };

  const handleUpdateLesson = (updatedLesson: LessonPlan) => {
    setLessons(prev => prev.map(l => l.id === updatedLesson.id ? { ...updatedLesson, classId: currentClassId || l.classId } : l));
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  };

  const handleAddUnit = (unit: Unit) => {
    if (!currentClassId) return;
    const unitWithClass = { ...unit, classId: currentClassId };
    setUnits(prev => [...prev, unitWithClass]);
  };

  const handleUpdateUnit = (updatedUnit: Unit) => {
    setUnits(prev => prev.map(u => u.id === updatedUnit.id ? { ...updatedUnit, classId: currentClassId || u.classId } : u));
  };

  const handleReorderUnits = (draggedUnitId: string, targetUnitId: string) => {
    const draggedIdx = units.findIndex(u => u.id === draggedUnitId);
    const targetIdx = units.findIndex(u => u.id === targetUnitId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newUnits = [...units];
    const [removed] = newUnits.splice(draggedIdx, 1);
    newUnits.splice(targetIdx, 0, removed);

    // Update order field
    const reordered = newUnits.map((u, idx) => ({ ...u, order: idx }));
    setUnits(reordered);
  };

  const handleReorderLesson = (lessonId: string, targetUnitId: string, insertBeforeLessonId?: string) => {
    setLessons(prev => {
      const lessonIndex = prev.findIndex(l => l.id === lessonId);
      if (lessonIndex === -1) return prev;

      const lesson = { ...prev[lessonIndex], unitId: targetUnitId || undefined };
      const remaining = prev.filter(l => l.id !== lessonId);

      if (insertBeforeLessonId) {
        const insertIndex = remaining.findIndex(l => l.id === insertBeforeLessonId);
        if (insertIndex !== -1) {
          const newArr = [...remaining];
          newArr.splice(insertIndex, 0, lesson);
          return newArr;
        }
      }

      return [...remaining, lesson];
    });
  };

  const handleMoveLesson = (lessonId: string, unitId: string) => {
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, unitId } : l));
  };

  const handleToggleLock = (unitId: string) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, isLocked: !u.isLocked } : u));
  };

  const handleToggleSequential = (unitId: string) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, isSequential: !u.isSequential } : u));
  };

  const handleSubmitLesson = (lessonId: string, code: string, textAnswer?: string) => {
    if (!currentClassId) return;
    const newSubmission: Submission = {
      id: Date.now().toString(),
      lessonId,
      studentId: currentStudentId,
      classId: currentClassId,
      code,
      status: 'Submitted',
      submittedAt: Date.now(),
      currentStep: 999,
      textAnswer: textAnswer
    };

    setSubmissions(prev => [...prev.filter(s => s.lessonId !== lessonId || s.studentId !== currentStudentId), newSubmission]);
  };

  const handleUpdateProgress = (lessonId: string, code: string, step: number, historyItem?: StepHistory) => {
    if (!currentClassId) return;
    setSubmissions(prev => {
      const existing = prev.find(s => s.lessonId === lessonId && s.studentId === currentStudentId);
      let updatedHistory = existing?.history || [];

      if (historyItem) {
        const historyIndex = updatedHistory.findIndex(h => h.stepIndex === historyItem.stepIndex);
        if (historyIndex > -1) {
          updatedHistory[historyIndex] = historyItem;
        } else {
          updatedHistory.push(historyItem);
        }
      }

      if (existing) {
        return prev.map(s => s.id === existing.id ? {
          ...s,
          code,
          currentStep: step,
          history: updatedHistory
        } : s);
      } else {
        const newSubmission: Submission = {
          id: Date.now().toString(),
          lessonId,
          studentId: currentStudentId,
          classId: currentClassId,
          code,
          status: 'Draft',
          currentStep: step,
          history: updatedHistory
        };
        return [...prev, newSubmission];
      }
    });
  };

  const handleGradeSubmission = (submissionId: string, grade: number, comment: string) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          status: 'Graded',
          feedback: {
            grade,
            comment,
            gradedAt: Date.now()
          }
        };
      }
      return sub;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">

      {/* Tutorial Overlay - Only for teacher view */}
      {view === 'teacher' && (
        <TutorialOverlay
          isOpen={tutorialActive}
          onClose={() => setTutorialActive(false)}
          currentStepIndex={tutorialStepIndex}
          onNextStep={handleTutorialNext}
          steps={TEACHER_TUTORIAL}
          onTabClick={handleTutorialTabClick}
        />
      )}

      {/* Navigation Bar */}
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
            {view === 'teacher' && (
              <button
                onClick={startTutorial}
                className="p-2 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                title="Start Tutorial"
              >
                <FaQuestion />
              </button>
            )}

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setView('teacher')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'teacher'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <FaChalkboardUser /> Teacher
              </button>
              <button
                onClick={() => setView('student')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'student'
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {view === 'teacher' ? (
          <div className="container mx-auto px-4 py-8">
            {currentClassId ? (
              <TeacherDashboard
                onAddLesson={handleAddLesson}
                onUpdateLesson={handleUpdateLesson}
                onDeleteLesson={handleDeleteLesson}
                onAddUnit={handleAddUnit}
                onUpdateUnit={handleUpdateUnit}
                onMoveLesson={handleMoveLesson}
                onReorderUnits={handleReorderUnits}
                onReorderLesson={handleReorderLesson}
                onToggleLock={handleToggleLock}
                onToggleSequential={handleToggleSequential}
                students={students.filter(s => s.isActive)}
                submissions={submissions}
                lessons={lessons}
                units={units}
                onGradeSubmission={handleGradeSubmission}
                classId={currentClassId}
                classCode={classes.find(c => c.id === currentClassId)?.classCode || '123456'}
                currentClass={classes.find(c => c.id === currentClassId) || null}
                onManageRoster={() => { }}
                classes={classes}
                onSelectClass={handleSelectClass}
                onCreateClass={handleCreateClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onCopyClassCode={handleCopyClassCode}
                forceAdvancedMode={tutorialActive ? true : undefined}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            ) : (
              <div className="max-w-md mx-auto py-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Welcome to CanvasClassroom</h2>
                  <p className="text-slate-500 dark:text-slate-400">Get started by creating your first class.</p>
                </div>
                <ClassManager
                  classes={classes}
                  currentClassId={currentClassId}
                  onSelectClass={handleSelectClass}
                  onCreateClass={handleCreateClass}
                  onUpdateClass={handleUpdateClass}
                  onDeleteClass={handleDeleteClass}
                  onCopyClassCode={handleCopyClassCode}
                />
              </div>
            )}
          </div>
        ) : (
          <StudentView
            lessons={lessons}
            units={units}
            onSubmitLesson={handleSubmitLesson}
            onUpdateProgress={handleUpdateProgress}
            submissions={submissions.filter(s => s.studentId === currentStudentId)}
          />
        )}
      </main>
    </div>
  );
};

export default App;