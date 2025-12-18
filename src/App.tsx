import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import TeacherDashboard from './components/TeacherDashboard';
import StudentView from './components/StudentView';
import TutorialOverlay, { TutorialStep, SubStep } from './components/TutorialOverlay';
import ClassManager from './components/ClassManager';
import StudentRoster from './components/StudentRoster';
import AuthPage from './components/AuthPage';
import JoinClass from './components/JoinClass';
import HomePage from './components/HomePage';
import DemoPage from './components/DemoPage';
import ProtectedRoute from './components/ProtectedRoute';
import { LessonPlan, Student, Submission, Unit, StepHistory, Class } from './types';
import { supabaseService } from './services/supabaseService';
import { supabase } from './lib/supabase';
import { FaChalkboardUser, FaUserAstronaut, FaMoon, FaSun, FaQuestion, FaRightFromBracket } from 'react-icons/fa6';
import { Session } from '@supabase/supabase-js';

type EnrollmentRow = {
  class_id: string;
  classes: {
    id: string;
    name: string;
    period?: string;
    academic_year?: string;
    teacher_id?: string;
    class_code?: string;
    created_at?: string;
    default_editor_type?: string;
  } | null;
};


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

// Layout component for authenticated routes
const AuthenticatedLayout: React.FC<{
  session: Session;
  userRole: 'teacher' | 'student';
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  onSignOut: () => void;
  tutorialActive: boolean;
  onTutorialClose: () => void;
  startTutorial: () => void;
  tutorialStepIndex: number;
  handleTutorialNext: () => void;
  handleTutorialTabClick: (tabId: string) => void;
  activeTab: 'planner' | 'curriculum' | 'grading' | 'analytics' | 'roster' | 'communication' | 'tools' | 'help';
  children: React.ReactNode;
}> = ({
  session,
  userRole,
  isDarkMode,
  setIsDarkMode,
  onSignOut,
  tutorialActive,
  onTutorialClose,
  startTutorial,
  tutorialStepIndex,
  handleTutorialNext,
  handleTutorialTabClick,
  activeTab,
  children
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Tutorial Overlay - Only for teacher view */}
      {userRole === 'teacher' && (
        <TutorialOverlay
          isOpen={tutorialActive}
          onClose={onTutorialClose}
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
            {userRole === 'teacher' && (
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

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {session.user.user_metadata.name || session.user.email || 'User'} <span className="opacity-50">({userRole === 'teacher' ? 'Teacher' : 'Student'})</span>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <FaRightFromBracket />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect which subdomain we're on
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDemoSubdomain = hostname === 'demo.canvasclassroom.com' || hostname.startsWith('demo.');
  
  // Detect if we're on the app subdomain
  // In production: app.canvasclassroom.com = app, canvasclassroom.com = homepage
  // In development: use VITE_APP_SUBDOMAIN env var or default to app subdomain
  const isAppSubdomain = typeof window !== 'undefined' && (() => {
    // Production: check actual subdomain
    if (hostname === 'app.canvasclassroom.com' || hostname.startsWith('app.')) {
      return true;
    }
    
    // Root domain in production
    if (hostname === 'canvasclassroom.com' || hostname === 'www.canvasclassroom.com') {
      return false;
    }
    
    // Development: check environment variable or default to app subdomain
    // This allows testing both homepage and app locally
    const envSubdomain = import.meta.env.VITE_APP_SUBDOMAIN;
    if (envSubdomain !== undefined) {
      return envSubdomain === 'true' || envSubdomain === '1';
    }
    
    // Default: assume app subdomain for localhost (most common use case)
    return true;
  })();
  
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tutorial State
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  
  // Tab state (lifted for tutorial control)
  const [activeTab, setActiveTab] = useState<'planner' | 'curriculum' | 'grading' | 'analytics' | 'roster' | 'communication' | 'tools' | 'help'>('planner');

  // Auth Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
        setErrorMessage('Unable to connect to authentication service. Please check your internet connection.');
        setLoading(false);
        return;
      }
      setSession(session);
      if (session) {
        const role = session.user.user_metadata.role;
        setUserRole(role === 'teacher' || role === 'student' ? role : null);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('❌ Fatal error initializing auth:', err);
      setErrorMessage('Failed to initialize authentication. Please refresh the page.');
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const role = session.user.user_metadata.role;
        const newRole = role === 'teacher' || role === 'student' ? role : null;
        setUserRole(newRole);
        
        // Navigate to appropriate route after authentication
        if (newRole && location.pathname === '/auth') {
          if (newRole === 'teacher') {
            navigate('/teacher', { replace: true });
          } else {
            navigate('/student', { replace: true });
          }
        }
      } else {
        setUserRole(null);
        setClasses([]);
        setCurrentClassId(null);
        if (location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student')) {
          navigate('/', { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Load Classes Effect
  useEffect(() => {
    if (!session || !userRole) return;

    const loadData = async () => {
      if (userRole === 'teacher') {
        try {
          const loadedClasses = await supabaseService.getClasses(session.user.id);
          setClasses(loadedClasses);
        } catch (error) {
          console.error('Error loading teacher classes:', error);
          setErrorMessage('Unable to load your classes.');
        }
      } else if (userRole === 'student') {
        try {
          setErrorMessage(null);
          let studentData = await supabaseService.getStudentByAuthId(session.user.id);

          if (!studentData) {
            // Create student profile if not exists
            try {
              console.log('Creating student profile for:', session.user.id);
              const newStudent = await supabaseService.createStudent({
                authUserId: session.user.id, // Link to Auth user ID
                name: session.user.user_metadata.name || 'Student',
                email: session.user.email,
                isActive: true
              });
              console.log('Created student profile:', newStudent);
              studentData = newStudent;
            } catch (createStudentError) {
              console.error('Error creating student profile:', createStudentError);
              setErrorMessage('Unable to create student profile.');
              return;
            }
          }

          if (studentData) {
            setStudentProfile(studentData);

            // Fetch enrolled classes
            const { data: enrollments, error: enrollmentsError } = await supabase
              .from('enrollments')
              .select('class_id, classes(*)')
              .eq('student_id', studentData.id)
              .eq('status', 'approved');

            if (enrollmentsError) {
              console.error('Error fetching enrollments:', enrollmentsError);
              setErrorMessage('Unable to load enrollments.');
              return;
            }

            if (enrollments && enrollments.length > 0) {
              const enrollmentRows = (enrollments ?? []) as unknown as EnrollmentRow[];
              const studentClasses = enrollmentRows
                .map((enrollment) => enrollment.classes)
                .filter((cls): cls is NonNullable<EnrollmentRow['classes']> => cls !== null)
                .map((row) => ({
                  id: row.id,
                  name: row.name,
                  period: row.period,
                  academicYear: row.academic_year,
                  teacherId: row.teacher_id,
                  classCode: row.class_code,
                  createdAt: row.created_at,
                  defaultEditorType: row.default_editor_type
                }));

              setClasses(studentClasses);
              // currentClassId will be set by the separate effect watching classes
            }
          }
        } catch (loadError) {
          console.error('Error loading student data:', loadError);
          setErrorMessage('Unexpected error while loading student data.');
          return;
        }
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, userRole]);

  // Set initial class when classes load
  useEffect(() => {
    if (classes.length > 0 && !currentClassId) {
      setCurrentClassId(classes[0].id);
    }
  }, [classes, currentClassId]);

  // Load class data when class changes
  useEffect(() => {
    if (!currentClassId) return;

    const loadClassData = async () => {
      try {
        // Load units, lessons, students, and submissions for the current class
        const [loadedUnits, loadedLessons, loadedStudents, loadedSubmissions] = await Promise.all([
          supabaseService.getUnits(currentClassId),
          supabaseService.getLessons(currentClassId),
          supabaseService.getStudents(currentClassId),
          supabaseService.getSubmissions(currentClassId)
        ]);

        setUnits(loadedUnits);
        setLessons(loadedLessons);
        setStudents(loadedStudents);
        setSubmissions(loadedSubmissions);
      } catch (error) {
        console.error('Error loading class data:', error);
        setErrorMessage('Unable to load class data.');
      }
    };

    loadClassData();
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
    if (!session) return;
    // Inject teacherId from session
    const newClass = await supabaseService.createClass({
      ...classData,
      teacherId: session.user.id
    });
    setClasses(prev => [...prev, newClass]);
    setCurrentClassId(newClass.id);
    // Units and lessons will be loaded automatically via useEffect
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
    
    try {
      // Create enrollment for the student
      await supabaseService.createEnrollment({
        studentId: newStudent.id,
        classId: currentClassId,
        status: 'approved',
        enrolledAt: Date.now()
      });
      setStudents(prev => [...prev, newStudent]);
    } catch (enrollError) {
      console.error('Error creating enrollment:', enrollError);
      setErrorMessage('Student created but enrollment failed.');
      // Rollback: deactivate the orphaned student
      try {
        await supabaseService.updateStudent(newStudent.id, { isActive: false });
      } catch (rollbackErr) {
        console.error('Failed to rollback student creation:', rollbackErr);
      }
    }
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
  const handleAddLesson = async (lesson: LessonPlan) => {
    if (!currentClassId) return;
    const lessonWithClass = { ...lesson, classId: currentClassId };
    const createdLesson = await supabaseService.createLesson(lessonWithClass);
    setLessons(prev => [createdLesson, ...prev]);
  };

  const handleUpdateLesson = async (updatedLesson: LessonPlan) => {
    const updated = await supabaseService.updateLesson(updatedLesson.id, updatedLesson);
    setLessons(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await supabaseService.deleteLesson(lessonId);
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  };

  const handleAddUnit = async (unit: Unit) => {
    if (!currentClassId) return;
    const unitWithClass = { ...unit, classId: currentClassId };
    const createdUnit = await supabaseService.createUnit(unitWithClass);
    setUnits(prev => [...prev, createdUnit]);
  };

  const handleUpdateUnit = async (updatedUnit: Unit) => {
    const updated = await supabaseService.updateUnit(updatedUnit.id, updatedUnit);
    setUnits(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const handleReorderUnits = async (draggedUnitId: string, targetUnitId: string) => {
    const draggedIdx = units.findIndex(u => u.id === draggedUnitId);
    const targetIdx = units.findIndex(u => u.id === targetUnitId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newUnits = [...units];
    const [removed] = newUnits.splice(draggedIdx, 1);
    newUnits.splice(targetIdx, 0, removed);

    // Update order field and persist to Supabase
    const reordered = newUnits.map((u, idx) => ({ ...u, order: idx }));
    setUnits(reordered);
    
    // Persist order changes to Supabase
    await Promise.all(reordered.map((u, idx) => 
      supabaseService.updateUnit(u.id, { order: idx })
    ));
  };

  const handleReorderLesson = async (lessonId: string, targetUnitId: string, insertBeforeLessonId?: string) => {
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return;

    const lesson = { ...lessons[lessonIndex], unitId: targetUnitId || undefined };
    
    // Update in Supabase
    await supabaseService.updateLesson(lessonId, { unitId: targetUnitId || undefined });
    
    // Update local state
    setLessons(prev => {
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

  const handleMoveLesson = async (lessonId: string, unitId: string) => {
    await supabaseService.updateLesson(lessonId, { unitId });
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, unitId } : l));
  };

  const handleToggleLock = async (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    
    const updated = await supabaseService.updateUnit(unitId, { isLocked: !unit.isLocked });
    setUnits(prev => prev.map(u => u.id === unitId ? updated : u));
  };

  const handleToggleSequential = async (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    
    const updated = await supabaseService.updateUnit(unitId, { isSequential: !unit.isSequential });
    setUnits(prev => prev.map(u => u.id === unitId ? updated : u));
  };

  const handleSubmitLesson = async (lessonId: string, code: string, textAnswer?: string) => {
    if (!currentClassId || !session || !studentProfile) return;

    // Check if submission already exists
    const existingSubmissions = await supabaseService.getSubmissions(currentClassId, lessonId, studentProfile.id);
    const existing = existingSubmissions.find(s => s.lessonId === lessonId && s.studentId === studentProfile.id);

    if (existing) {
      // Update existing submission
      const updated = await supabaseService.updateSubmission(existing.id, {
        code,
        status: 'Submitted',
        submittedAt: Date.now(),
        textAnswer
      });
      setSubmissions(prev => prev.map(s => s.id === existing.id ? updated : s));
    } else {
      // Create new submission
      const newSubmission = await supabaseService.createSubmission({
        lessonId,
        studentId: studentProfile.id,
        classId: currentClassId,
        code,
        status: 'Submitted',
        submittedAt: Date.now(),
        currentStep: 999,
        textAnswer
      });
      setSubmissions(prev => [...prev.filter(s => s.lessonId !== lessonId || s.studentId !== studentProfile.id), newSubmission]);
    }
  };

  const handleUpdateProgress = async (lessonId: string, code: string, step: number, historyItem?: StepHistory) => {
    if (!currentClassId || !session || !studentProfile) return;

    const existing = submissions.find(s => s.lessonId === lessonId && s.studentId === studentProfile.id);
    const updatedHistory = existing?.history ? [...existing.history] : [];

    if (historyItem) {
      const historyIndex = updatedHistory.findIndex(h => h.stepIndex === historyItem.stepIndex);
      if (historyIndex > -1) {
        updatedHistory[historyIndex] = historyItem;
      } else {
        updatedHistory.push(historyItem);
      }
    }

    if (existing) {
      // Update existing submission
      const updated = await supabaseService.updateSubmission(existing.id, {
        code,
        currentStep: step,
        history: updatedHistory
      });
      setSubmissions(prev => prev.map(s => s.id === existing.id ? updated : s));
    } else {
      // Create new draft submission
      const newSubmission = await supabaseService.createSubmission({
        lessonId,
        studentId: studentProfile.id,
        classId: currentClassId,
        code,
        status: 'Draft',
        currentStep: step,
        history: updatedHistory
      });
      setSubmissions(prev => [...prev, newSubmission]);
    }
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, comment: string) => {
    const updated = await supabaseService.updateSubmission(submissionId, {
      status: 'Graded',
      feedback: {
        grade,
        comment,
        gradedAt: Date.now()
      }
    });
    setSubmissions(prev => prev.map(sub => sub.id === submissionId ? updated : sub));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    setClasses([]);
    setCurrentClassId(null);
    navigate('/');
  };

  const handleClassJoined = async (classId: string) => {
    setCurrentClassId(classId);
    // Fetch the joined class and add to state
    try {
      const joinedClass = await supabaseService.getClass(classId);
      if (joinedClass) {
        setClasses(prev => {
          // Only add if not already present
          if (prev.some(c => c.id === classId)) return prev;
          return [...prev, joinedClass];
        });
      }
      navigate(`/student/${classId}`);
    } catch (error) {
      console.error('Error fetching joined class:', error);
      // Still set currentClassId, class list will refresh on next load
      navigate(`/student/${classId}`);
    }
  };

  // Teacher Dashboard Component
  const TeacherDashboardRoute: React.FC = () => {
    if (!session || userRole !== 'teacher') return null;
    
    return (
      <AuthenticatedLayout
        session={session}
        userRole="teacher"
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onSignOut={handleSignOut}
        tutorialActive={tutorialActive}
        onTutorialClose={() => setTutorialActive(false)}
        startTutorial={startTutorial}
        tutorialStepIndex={tutorialStepIndex}
        handleTutorialNext={handleTutorialNext}
        handleTutorialTabClick={handleTutorialTabClick}
        activeTab={activeTab}
      >
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
              teacherId={session.user.id}
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
              onSelectClass={(classId) => {
                handleSelectClass(classId);
                navigate(`/teacher/${classId}`);
              }}
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
                teacherId={session.user.id}
                onSelectClass={(classId) => {
                  handleSelectClass(classId);
                  navigate(`/teacher/${classId}`);
                }}
                onCreateClass={handleCreateClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onCopyClassCode={handleCopyClassCode}
              />
            </div>
          )}
        </div>
      </AuthenticatedLayout>
    );
  };

  // Teacher Class Route Component
  const TeacherClassRoute: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    
    useEffect(() => {
      if (classId && classId !== currentClassId) {
        handleSelectClass(classId);
      }
    }, [classId]);

    if (!session || userRole !== 'teacher') return null;
    if (!classId || !currentClassId) return <Navigate to="/teacher" replace />;

    return (
      <AuthenticatedLayout
        session={session}
        userRole="teacher"
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onSignOut={handleSignOut}
        tutorialActive={tutorialActive}
        onTutorialClose={() => setTutorialActive(false)}
        startTutorial={startTutorial}
        tutorialStepIndex={tutorialStepIndex}
        handleTutorialNext={handleTutorialNext}
        handleTutorialTabClick={handleTutorialTabClick}
        activeTab={activeTab}
      >
        <div className="container mx-auto px-4 py-8">
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
            teacherId={session.user.id}
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
            onSelectClass={(id) => {
              handleSelectClass(id);
              navigate(`/teacher/${id}`);
            }}
            onCreateClass={handleCreateClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
            onCopyClassCode={handleCopyClassCode}
            forceAdvancedMode={tutorialActive ? true : undefined}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </AuthenticatedLayout>
    );
  };

  // Student View Route Component
  const StudentViewRoute: React.FC = () => {
    const { classId } = useParams<{ classId?: string }>();

    useEffect(() => {
      if (classId && classId !== currentClassId) {
        handleSelectClass(classId);
      }
    }, [classId]);

    // Memoize filtered submissions to prevent unnecessary re-renders
    const studentSubmissions = React.useMemo(() => 
      submissions.filter(s => studentProfile && s.studentId === studentProfile.id),
      [submissions, studentProfile]
    );

    const currentClassName = React.useMemo(() => 
      classes.find(c => c.id === currentClassId)?.name,
      [classes, currentClassId]
    );

    const currentClassCode = React.useMemo(() => 
      classes.find(c => c.id === currentClassId)?.classCode,
      [classes, currentClassId]
    );

    if (!session || userRole !== 'student') return null;
    if (!studentProfile) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Loading profile...</div>;
    }

    if (!currentClassId) {
      return (
        <AuthenticatedLayout
          session={session}
          userRole="student"
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onSignOut={handleSignOut}
          tutorialActive={false}
          onTutorialClose={() => {}}
          startTutorial={() => {}}
          tutorialStepIndex={0}
          handleTutorialNext={() => {}}
          handleTutorialTabClick={() => {}}
          activeTab="planner"
        >
          <div className="container mx-auto px-4 py-8">
            <JoinClass student={studentProfile} onClassJoined={handleClassJoined} />
          </div>
        </AuthenticatedLayout>
      );
    }

    return (
      <AuthenticatedLayout
        session={session}
        userRole="student"
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onSignOut={handleSignOut}
        tutorialActive={false}
        startTutorial={() => {}}
        tutorialStepIndex={0}
        handleTutorialNext={() => {}}
        handleTutorialTabClick={() => {}}
        activeTab="planner"
      >
        <StudentView
          key={`student-view-${currentClassId}`}
          lessons={lessons}
          units={units}
          onSubmitLesson={handleSubmitLesson}
          onUpdateProgress={handleUpdateProgress}
          submissions={studentSubmissions}
          className={currentClassName}
          classCode={currentClassCode}
        />
      </AuthenticatedLayout>
    );
  };

  // Demo subdomain - show demo page (no auth required)
  if (isDemoSubdomain) {
    return (
      <Routes>
        <Route 
          path="*" 
          element={
            <DemoPage 
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
          } 
        />
      </Routes>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Loading...</div>;
  }

  // Display error message if present
  if (errorMessage && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If on root domain, only show HomePage and redirect app routes
  if (!isAppSubdomain) {
    return (
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              onLogin={() => {
                // Redirect to app subdomain for login
                if (typeof window !== 'undefined') {
                  window.location.href = `https://app.canvasclassroom.com/auth`;
                }
              }} 
              onLaunch={() => {
                // Redirect to app subdomain
                if (typeof window !== 'undefined') {
                  if (session) {
                    const route = userRole === 'teacher' ? '/teacher' : '/student';
                    window.location.href = `https://app.canvasclassroom.com${route}`;
                  } else {
                    window.location.href = 'https://app.canvasclassroom.com/auth';
                  }
                }
              }}
              isLoggedIn={!!session}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // On app subdomain, show the full app
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          session ? (
            <Navigate 
              to={userRole === 'teacher' ? '/teacher' : '/student'} 
              replace 
            />
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/auth" 
        element={
          session ? (
            <Navigate 
              to={userRole === 'teacher' ? '/teacher' : '/student'} 
              replace 
            />
          ) : (
            <AuthPage 
              onAuthSuccess={() => {
                // Navigation will happen automatically via auth state change listener
              }} 
            />
          )
        } 
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute session={session} requiredRole="teacher" loading={loading}>
            <TeacherDashboardRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/:classId"
        element={
          <ProtectedRoute session={session} requiredRole="teacher" loading={loading}>
            <TeacherClassRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute session={session} requiredRole="student" loading={loading}>
            <StudentViewRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/:classId"
        element={
          <ProtectedRoute session={session} requiredRole="student" loading={loading}>
            <StudentViewRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/join-class"
        element={
          <ProtectedRoute session={session} requiredRole="student" loading={loading}>
            {studentProfile ? (
              <AuthenticatedLayout
                session={session!}
                userRole="student"
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                onSignOut={handleSignOut}
                tutorialActive={false}
                startTutorial={() => {}}
                tutorialStepIndex={0}
                handleTutorialNext={() => {}}
                handleTutorialTabClick={() => {}}
                activeTab="planner"
              >
                <div className="container mx-auto px-4 py-8">
                  <JoinClass student={studentProfile} onClassJoined={handleClassJoined} />
                </div>
              </AuthenticatedLayout>
            ) : (
              <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Loading profile...</div>
            )}
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;