import React, { useState, useRef, useEffect } from 'react';
import { generateLessonPlan, suggestCurriculum, generateFullCurriculum } from '../services/openRouterService';
import { supabaseService } from '../services/supabaseService';
import { LessonPlan, AILessonResponse, Submission, Student, Unit, LessonType, CurriculumSuggestion, FeedbackTemplate, HelpRequest, Class, Announcement, FullCurriculumResponse } from '../types';
import { FaWandMagicSparkles, FaBookOpen, FaClipboardCheck, FaPlus, FaRobot, FaLayerGroup, FaChartPie, FaLock, FaLockOpen, FaPen, FaXmark, FaGripLines, FaGripVertical, FaArrowDownShortWide, FaCheck, FaCode, FaLightbulb, FaArrowRight, FaCircleExclamation, FaCalendarDays, FaUsers, FaBullhorn, FaToolbox, FaHandsHolding, FaDownload, FaComments, FaDatabase, FaBookmark, FaUserGraduate, FaChevronDown, FaCopy, FaIdCard, FaTrash, FaCircleCheck, FaLink } from 'react-icons/fa6';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import P5Editor from './P5Editor';
import ScratchEditor from './ScratchEditor';
import StudentRoster from './StudentRoster';
import EnrollmentManager from './EnrollmentManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import AnnouncementsManager from './AnnouncementsManager';
import GradebookExport from './GradebookExport';
import FeedbackTemplates from './FeedbackTemplates';
import HelpQueue from './HelpQueue';
import LessonLibrary from './LessonLibrary';
import BackupRestore from './BackupRestore';
import StudentAnalytics from './StudentAnalytics';
import BulkActions from './BulkActions';
import RubricsManager from './RubricsManager';
import ClassManager from './ClassManager';
import ScratchProjectImport from './ScratchProjectImport';
import { Enrollment, Rubric } from '../types';
import { CURRICULUM_TEMPLATES } from '../data/curriculumTemplates';

interface TeacherDashboardProps {
  onAddLesson: (lesson: LessonPlan) => void;
  onUpdateLesson: (lesson: LessonPlan) => void;
  onDeleteLesson: (lessonId: string) => void;
  onAddUnit: (unit: Unit) => void;
  onUpdateUnit: (unit: Unit) => void;
  onDeleteUnit: (unitId: string) => void;
  onMoveLesson: (lessonId: string, unitId: string) => void;
  onReorderUnits: (draggedId: string, targetId: string) => void;
  onReorderLesson: (lessonId: string, targetUnitId: string, insertBeforeLessonId?: string) => void;
  onToggleLock: (unitId: string) => void;
  onToggleSequential: (unitId: string) => void;
  submissions: Submission[];
  students: Student[];
  lessons: LessonPlan[];
  units: Unit[];
  onGradeSubmission: (submissionId: string, grade: number, comment: string) => void;
  classId: string;
  classCode: string;
  currentClass: Class | null;
  onManageRoster?: () => void;
  teacherId: string;
  // Class Management Props
  classes: Class[];
  onSelectClass: (classId: string) => void;
  onCreateClass: (classData: Omit<Class, 'id' | 'createdAt' | 'classCode'>) => void;
  onUpdateClass: (classId: string, updates: Partial<Class>) => void;
  onDeleteClass: (classId: string) => void;
  onCopyClassCode: (classCode: string) => void;
  // Tutorial Props
  forceAdvancedMode?: boolean;
  // Controlled tab props (optional - for tutorial control)
  activeTab?: 'planner' | 'curriculum' | 'grading' | 'analytics' | 'roster' | 'communication' | 'tools' | 'help';
  onTabChange?: (tab: 'planner' | 'curriculum' | 'grading' | 'analytics' | 'roster' | 'communication' | 'tools' | 'help') => void;
  // Import Status Props
  importStatus?: {
    active: boolean;
    progress: number;
    total: number;
    message: string;
  };
  onImportCurriculum?: (newUnits: Omit<Unit, 'id'>[], newLessons: LessonPlan[]) => Promise<void>;
  scratchGenerationStatus?: {
    active: boolean;
    complete: boolean;
    error: string | null;
    projectTitle?: string;
    generatedData?: { units: any[], lessons: any[] };
  };
  onStartScratchGeneration?: (analysis: any, data: any, lessonCount: number) => void;
  onClearScratchStatus?: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
  onMoveLesson,
  onReorderUnits,
  onReorderLesson,
  onToggleLock,
  onToggleSequential,
  submissions,
  students,
  lessons,
  units,
  onGradeSubmission,
  classId,
  classCode,
  currentClass,
  onManageRoster,
  teacherId,
  classes,
  onSelectClass,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  onCopyClassCode,
  forceAdvancedMode,
  activeTab: controlledActiveTab,
  onTabChange,
  importStatus,
  onImportCurriculum,
  scratchGenerationStatus,
  onStartScratchGeneration,
  onClearScratchStatus
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'planner' | 'curriculum' | 'grading' | 'analytics' | 'roster' | 'communication' | 'tools' | 'help'>('planner');

  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = (tab: typeof activeTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const [showClassManager, setShowClassManager] = useState(false);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [rosterStudents, setRosterStudents] = useState<Student[]>(students);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [rosterSubTab, setRosterSubTab] = useState<'students' | 'enrollment'>('students');

  // Bulk unit selection
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Track units created during Scratch import
  const [scratchCreatedUnits, setScratchCreatedUnits] = useState<Unit[]>([]);

  // Debug: Track units prop changes
  useEffect(() => {
    console.log('🔍 [DEBUG] Units prop changed:', {
      totalUnits: units.length,
      unitsForClass: units.filter(u => u.classId === classId).length,
      unitIds: units.map(u => u.id),
      classId
    });
  }, [units, classId]);

  // Handle auto-switching to curriculum tab when generation is done
  useEffect(() => {
    if (scratchGenerationStatus?.complete && activeTab !== 'curriculum') {
      // We could auto-switch, but user might be in the middle of something.
      // The red dot handles the notification.
    }
  }, [scratchGenerationStatus?.complete, activeTab]);

  // New feature states
  const [toolsSubTab, setToolsSubTab] = useState<'export' | 'templates' | 'library' | 'backup' | 'bulk' | 'rubrics'>('export');
  const [feedbackTemplates, setFeedbackTemplates] = useState<FeedbackTemplate[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState<Student | null>(null);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [lessonType, setLessonType] = useState<LessonType>('Lesson');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<AILessonResponse | null>(null);
  const [aiGuidedMode, setAiGuidedMode] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // Assignment Generation: Prerequisite Selection
  const [selectedPrereqIds, setSelectedPrereqIds] = useState<string[]>([]);

  // Curriculum State
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitDate, setNewUnitDate] = useState('');
  const [draggedUnitId, setDraggedUnitId] = useState<string | null>(null);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);

  // Edit Mode State
  const [editingLesson, setEditingLesson] = useState<LessonPlan | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Suggestions State
  const [suggestions, setSuggestions] = useState<CurriculumSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  // Grading State
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [commentInput, setCommentInput] = useState<string>('');
  const [showGradeSuccess, setShowGradeSuccess] = useState(false);

  const [showFeedbackTemplates, setShowFeedbackTemplates] = useState(false);

  // Progressive Disclosure State
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Curriculum Generator State
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [curriculumTheme, setCurriculumTheme] = useState('');
  const [curriculumDuration, setCurriculumDuration] = useState('Semester');
  const [isScratchImportOpen, setIsScratchImportOpen] = useState(false);
  const [isGeneratingCurriculum, setIsGeneratingCurriculum] = useState(false);
  const [useTemplate, setUseTemplate] = useState(true); // Start with templates
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setGeneratedLesson(null);
    setAiGuidedMode(lessonType === 'Lesson');

    // Build context string from selected prerequisites
    let contextStr = "";
    if (lessonType === 'Assignment' && selectedPrereqIds.length > 0) {
      const prereqs = lessons.filter(l => selectedPrereqIds.includes(l.id) && l.classId === classId);
      contextStr = prereqs.map(l => `Lesson: ${l.title} (Objective: ${l.objective}, Tags: ${l.tags?.join(', ')})`).join('\n');
    }

    const editorType = currentClass?.defaultEditorType || 'p5';
    const lesson = await generateLessonPlan(topic, level, lessonType, contextStr, editorType);
    if (lesson) {
      setGeneratedLesson(lesson);
    }
    setIsGenerating(false);
  };

  const applySuggestion = (s: CurriculumSuggestion) => {
    setTopic(s.topic);
    setLevel(s.difficulty);
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    setSuggestions([]);

    const result = await suggestCurriculum(lessons);
    if (result && result.length > 0) {
      setSuggestions(result);
    } else {
      setSuggestionError("Could not generate suggestions. Please try again.");
    }
    setIsLoadingSuggestions(false);
  };

  // Handle importing curriculum from Scratch project
  const handleScratchImportCurriculum = async (newUnits: Omit<Unit, 'id'>[], newLessons: LessonPlan[]) => {
    if (onImportCurriculum) {
      onImportCurriculum(newUnits, newLessons);
    }
  };

  const handleGenerateCurriculum = async () => {
    // Use template data if template is selected, otherwise use custom input
    const template = useTemplate && selectedTemplate
      ? CURRICULUM_TEMPLATES.find(t => t.id === selectedTemplate)
      : null;

    if (template) {
      // Use pre-generated template data (instant, no AI call needed!)
      setIsGeneratingCurriculum(true);

      const existingUnits = units.filter(u => u.classId === classId);

      // Check if we can use existing units (same count as template)
      const canUseExistingUnits = existingUnits.length === template.units.length;

      let targetUnits: Unit[];

      if (canUseExistingUnits) {
        // Use existing units
        targetUnits = existingUnits.sort((a, b) => a.order - b.order);
      } else {
        // Create new units from template
        const newUnits: Unit[] = template.units.map((u, index) => ({
          id: `u-${Date.now()}-${index}`,
          classId,
          title: u.title,
          description: u.description,
          order: units.length + u.order,
          isLocked: true,
          isSequential: true
        }));

        newUnits.forEach(u => onAddUnit(u));
        targetUnits = newUnits;
      }

      // Small delay to ensure units are added to state
      setTimeout(() => {
        // Reverse lessons to get top-to-bottom order (newest lessons appear at bottom)
        const reversedLessons = [...template.lessons].reverse();

        // Create Lessons from template, matching by unitIndex
        reversedLessons.forEach((l, idx) => {
          const targetUnit = targetUnits[l.unitIndex];
          if (targetUnit) {
            const newLesson: LessonPlan = {
              id: `l-${Date.now()}-${idx}-${Math.random()}`,
              classId,
              unitId: targetUnit.id,
              type: 'Lesson',
              topic: l.topic,
              title: l.title,
              difficulty: l.difficulty,
              objective: l.objective,
              description: l.description,
              theory: l.theory,
              steps: l.steps,
              starterCode: l.starterCode,
              challenge: l.challenge,
              isAiGuided: true,
              tags: l.tags
            };
            onAddLesson(newLesson);
          }
        });

        setIsCurriculumModalOpen(false);
        setSelectedTemplate('');
        setActiveTab('curriculum');
        setIsGeneratingCurriculum(false);
      }, 100);
    } else {
      // Custom theme - use AI generation
      const themeToUse = curriculumTheme;
      const durationToUse = curriculumDuration;

      if (!themeToUse) return;
      setIsGeneratingCurriculum(true);

      const response = await generateFullCurriculum(themeToUse, durationToUse);

      if (response) {
        const existingUnits = units.filter(u => u.classId === classId);

        // If we have existing units, add lessons to them instead of creating new units
        if (existingUnits.length > 0) {
          // Distribute lessons across existing units
          response.lessons.forEach((l, idx) => {
            // Cycle through existing units
            const targetUnit = existingUnits[idx % existingUnits.length];

            const newLesson: LessonPlan = {
              id: `l-${Date.now()}-${idx}`,
              classId,
              unitId: targetUnit.id,
              type: 'Lesson',
              topic: l.topic,
              title: l.title,
              difficulty: l.difficulty,
              objective: l.objective,
              description: `Learn about ${l.topic}`,
              theory: `**${l.topic}**\n\n(AI Generated Placeholder)\nThis lesson covers ${l.objective}.`,
              steps: ['[NEXT] Observe the starter code.', '[TEXT] What do you see?'],
              starterCode: '// Starter code placeholder\nfunction setup() {\n  createCanvas(400, 400);\n}',
              challenge: 'Try to change the values!',
              isAiGuided: true,
              tags: [l.topic.toLowerCase()]
            };
            onAddLesson(newLesson);
          });
        } else {
          // No existing units, create new ones
          const newUnits: Unit[] = response.units.map(u => ({
            id: `u-${Date.now()}-${u.order}`,
            classId,
            title: u.title,
            description: u.description,
            order: units.length + u.order,
            isLocked: true,
            isSequential: true
          }));

          newUnits.forEach(u => onAddUnit(u));

          // Create Lessons
          response.lessons.forEach((l, idx) => {
            const targetUnit = newUnits[l.unitIndex];
            if (targetUnit) {
              const newLesson: LessonPlan = {
                id: `l-${Date.now()}-${idx}`,
                classId,
                unitId: targetUnit.id,
                type: 'Lesson',
                topic: l.topic,
                title: l.title,
                difficulty: l.difficulty,
                objective: l.objective,
                description: `Learn about ${l.topic}`,
                theory: `**${l.topic}**\n\n(AI Generated Placeholder)\nThis lesson covers ${l.objective}.`,
                steps: ['[NEXT] Observe the starter code.', '[TEXT] What do you see?'],
                starterCode: '// Starter code placeholder\nfunction setup() {\n  createCanvas(400, 400);\n}',
                challenge: 'Try to change the values!',
                isAiGuided: true,
                tags: [l.topic.toLowerCase()]
              };
              onAddLesson(newLesson);
            }
          });
        }

        setIsCurriculumModalOpen(false);
        setCurriculumTheme('');
        setSelectedTemplate('');
        setActiveTab('curriculum');
      }

      setIsGeneratingCurriculum(false);
    }
  };

  const handleSaveLesson = () => {
    if (!generatedLesson) return;

    const editorType = currentClass?.defaultEditorType || 'p5';
    const newLesson: LessonPlan = {
      id: Date.now().toString(),
      classId: classId,
      topic: topic,
      type: lessonType,
      ...generatedLesson,
      isAiGuided: lessonType === 'Lesson' ? aiGuidedMode : false, // Assignments are independent work (no AI validation)
      unitId: selectedUnitId || undefined,
      editorType: editorType
    };

    onAddLesson(newLesson);
    setGeneratedLesson(null);
    setTopic('');
    setAiGuidedMode(false);
    setSelectedPrereqIds([]);
    setActiveTab('curriculum');
  };

  const togglePrereq = (id: string) => {
    setSelectedPrereqIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleCreateCustomLesson = () => {
    const emptyLesson: LessonPlan = {
      id: Date.now().toString(),
      classId: classId,
      topic: 'Custom Topic',
      type: 'Lesson',
      title: 'New Custom Lesson',
      difficulty: 'Beginner',
      objective: 'Learning Objective',
      description: 'Short description',
      theory: '**Welcome!**\nWrite your mission brief here.',
      steps: ['[NEXT] First step (Observation)', 'Write code step here'],
      starterCode: '// Write your starter code here\nfunction setup() {\n  createCanvas(400, 400);\n}',
      challenge: 'Bonus challenge',
      isAiGuided: true,
      tags: []
    };
    setEditingLesson(emptyLesson);
    setIsCreatingCustom(true);
  };

  const handleCreateUnit = () => {
    if (!newUnitTitle) return;
    const newUnit: Unit = {
      id: `u-${Date.now()}`,
      classId: classId,
      title: newUnitTitle,
      description: 'New Unit',
      order: units.filter(u => u.classId === classId).length,
      isLocked: true, // Default locked
      isSequential: true, // Default sequential
      availableAt: newUnitDate ? new Date(newUnitDate).getTime() : undefined
    };
    onAddUnit(newUnit);
    setNewUnitTitle('');
    setNewUnitDate('');
  };

  // Unit Dragging
  const handleUnitDragStart = (e: React.DragEvent, unitId: string) => {
    setDraggedUnitId(unitId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('type', 'UNIT');
    e.dataTransfer.setData('id', unitId);
  };

  // Lesson Dragging
  const handleLessonDragStart = (e: React.DragEvent, lessonId: string) => {
    e.stopPropagation(); // Prevent unit drag start
    setDraggedLessonId(lessonId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('type', 'LESSON');
    e.dataTransfer.setData('id', lessonId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleUnitDrop = (e: React.DragEvent, targetUnitId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const type = e.dataTransfer.getData('type');
    const id = e.dataTransfer.getData('id');

    if (type === 'UNIT') {
      if (draggedUnitId && draggedUnitId !== targetUnitId) {
        onReorderUnits(draggedUnitId, targetUnitId);
      }
    } else if (type === 'LESSON') {
      if (id) {
        // Dropping on the unit directly just moves it to the unit (appends to end)
        onReorderLesson(id, targetUnitId);
      }
    }

    setDraggedUnitId(null);
    setDraggedLessonId(null);
  };

  const handleLessonDrop = (e: React.DragEvent, targetUnitId: string, targetLessonId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const type = e.dataTransfer.getData('type');
    const id = e.dataTransfer.getData('id');

    if (type === 'LESSON' && id && id !== targetLessonId) {
      onReorderLesson(id, targetUnitId, targetLessonId);
    }

    setDraggedLessonId(null);
  };

  const handleEditLesson = (lesson: LessonPlan) => {
    setEditingLesson({ ...lesson });
    setIsCreatingCustom(false);
  };

  const handleSaveEdit = () => {
    if (editingLesson) {
      if (isCreatingCustom) {
        onAddLesson(editingLesson);
      } else {
        onUpdateLesson(editingLesson);
      }
      setEditingLesson(null);
      setIsCreatingCustom(false);
    }
  };

  const handleSaveUnitEdit = () => {
    if (editingUnit) {
      onUpdateUnit(editingUnit);
      setEditingUnit(null);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (confirm('Are you sure you want to delete this unit? This will orphan any lessons in this unit.')) {
      try {
        // Find the unit to delete for display purposes
        const unitToDelete = units.find(u => u.id === unitId);
        if (unitToDelete) {
          // Call the parent's delete handler which handles database and state
          await onDeleteUnit(unitId);
        }
      } catch (error) {
        console.error('Failed to delete unit:', error);
        alert('Failed to delete unit. Please try again.');
      }
    }
  };

  const handleBulkDeleteUnits = async () => {
    const unitIds = Array.from(selectedUnits);
    if (unitIds.length === 0) return;

    const unitTitles = units
      .filter(u => selectedUnits.has(u.id))
      .map(u => u.title)
      .join(', ');

    if (confirm(`Are you sure you want to delete ${unitIds.length} unit(s): ${unitTitles}? This will orphan any lessons in these units.`)) {
      try {
        // Delete each unit using the parent's delete handler
        for (const unitId of unitIds) {
          await onDeleteUnit(unitId);
        }
        setSelectedUnits(new Set());
        setBulkMode(false);
      } catch (error) {
        console.error('Failed to delete units:', error);
        alert('Failed to delete units. Please try again.');
      }
    }
  };

  const handleToggleUnitSelection = (unitId: string) => {
    const newSelected = new Set(selectedUnits);
    if (newSelected.has(unitId)) {
      newSelected.delete(unitId);
    } else {
      newSelected.add(unitId);
    }
    setSelectedUnits(newSelected);
  };

  const handleSelectAllUnits = () => {
    const classUnits = units.filter(u => u.classId === classId);
    if (selectedUnits.size === classUnits.length) {
      setSelectedUnits(new Set());
    } else {
      setSelectedUnits(new Set(classUnits.map(u => u.id)));
    }
  };

  const handleSubmitGrade = () => {
    if (selectedSubmissionId && gradeInput) {
      // Submit the grade
      onGradeSubmission(selectedSubmissionId, parseInt(gradeInput), commentInput);

      // Show success notification
      setShowGradeSuccess(true);
      setTimeout(() => setShowGradeSuccess(false), 2000);

      // Find the next ungraded submission
      const currentIndex = gradingSubmissions.findIndex(s => s.id === selectedSubmissionId);
      const nextSubmission = gradingSubmissions[currentIndex + 1];

      // Auto-select next submission or clear selection if none left
      if (nextSubmission) {
        setSelectedSubmissionId(nextSubmission.id);
      } else {
        setSelectedSubmissionId(null);
      }

      // Clear inputs
      setGradeInput('');
      setCommentInput('');
    }
  };

  // Grading Submissions Filter
  const gradingSubmissions = submissions.filter(s => s.status === 'Submitted');

  // Student Roster Handlers
  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'avatar'>) => {
    const newStudent = await supabaseService.createStudent(studentData);

    try {
      // Create enrollment for the student
      await supabaseService.createEnrollment({
        studentId: newStudent.id,
        classId: classId,
        status: 'approved',
        enrolledAt: Date.now()
      });
      setRosterStudents(prev => [...prev, newStudent]);
    } catch (err) {
      console.error('Failed to create enrollment:', err);
      // Rollback: deactivate the orphaned student record
      try {
        await supabaseService.updateStudent(newStudent.id, { isActive: false });
      } catch (rollbackErr) {
        console.error('Failed to rollback student creation:', rollbackErr);
      }
      throw err;
    }
  };

  const handleUpdateStudent = async (studentId: string, updates: Partial<Student>) => {
    const updatedStudent = await supabaseService.updateStudent(studentId, updates);
    setRosterStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
  };

  const handleRemoveStudent = async (studentId: string) => {
    await handleUpdateStudent(studentId, { isActive: false });
  };

  const handleImportCSV = async (csvData: string) => {
    const importedStudents = await supabaseService.importStudentsFromCSV(classId, csvData);
    setRosterStudents(prev => [...prev, ...importedStudents]);
  };

  // Sync roster students with prop changes
  React.useEffect(() => {
    setRosterStudents(students);
  }, [students]);

  // Load enrollments for current class
  React.useEffect(() => {
    const loadEnrollments = async () => {
      const classEnrollments = await supabaseService.getEnrollments(classId);
      setEnrollments(classEnrollments);
    };
    if (classId) {
      loadEnrollments();
    }
  }, [classId]);

  // Load announcements for current class
  React.useEffect(() => {
    const loadAnnouncements = async () => {
      const classAnnouncements = await supabaseService.getAnnouncements(classId);
      setAnnouncements(classAnnouncements);
    };
    if (classId) {
      loadAnnouncements();
    }
  }, [classId]);

  // Load help requests for current class
  React.useEffect(() => {
    const loadHelpRequests = async () => {
      const classHelpRequests = await supabaseService.getHelpRequests(classId);
      setHelpRequests(classHelpRequests);
    };
    if (classId) {
      loadHelpRequests();
    }
  }, [classId]);

  // Load feedback templates
  React.useEffect(() => {
    const loadFeedbackTemplates = async () => {
      const templates = await supabaseService.getFeedbackTemplates(teacherId);
      setFeedbackTemplates(templates);
    };
    if (teacherId) {
      loadFeedbackTemplates();
    }
  }, [teacherId]);

  const handleEnrollmentUpdate = async (enrollment: Enrollment) => {
    try {
      // Persist enrollment update to Supabase if status changed
      if (enrollment.status === 'approved' || enrollment.status === 'rejected') {
        await supabaseService.updateEnrollmentStatus(enrollment.id, enrollment.status);
      }
      setEnrollments(prev => prev.map(e => e.id === enrollment.id ? enrollment : e));
    } catch (err) {
      console.error('Failed to update enrollment:', err);
      throw err;
    }
  };

  const handleStudentAdded = (student: Student) => {
    setRosterStudents(prev => [...prev, student]);
  };

  const handleAnnouncementUpdate = async (announcement: Announcement) => {
    try {
      const existing = announcements.find(a => a.id === announcement.id);
      if (existing) {
        // Update existing announcement
        const updated = await supabaseService.updateAnnouncement(announcement.id, announcement);
        setAnnouncements(prev => prev.map(a => a.id === announcement.id ? updated : a));
      } else {
        // Create new announcement (already persisted by AnnouncementsManager)
        setAnnouncements(prev => [...prev, announcement]);
      }
    } catch (err) {
      console.error('Failed to update announcement:', err);
      throw err;
    }
  };

  const handleAnnouncementDelete = async (announcementId: string) => {
    try {
      await supabaseService.deleteAnnouncement(announcementId);
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      throw err;
    }
  };

  // Feedback Template Handlers
  const handleAddFeedbackTemplate = async (template: Omit<FeedbackTemplate, 'id' | 'createdAt'>) => {
    const newTemplate = await supabaseService.createFeedbackTemplate({
      ...template,
      createdBy: teacherId
    });
    setFeedbackTemplates(prev => [...prev, newTemplate]);
  };

  const handleUpdateFeedbackTemplate = (templateId: string, updates: Partial<FeedbackTemplate>) => {
    setFeedbackTemplates(prev => prev.map(t => t.id === templateId ? { ...t, ...updates } : t));
  };

  const handleDeleteFeedbackTemplate = (templateId: string) => {
    setFeedbackTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  // Help Queue Handlers
  const handleResolveHelpRequest = async (requestId: string) => {
    const updated = await supabaseService.updateHelpRequest(requestId, {
      status: 'resolved',
      resolvedAt: Date.now()
    });
    setHelpRequests(prev => prev.map(r => r.id === requestId ? updated : r));
  };

  const handleStartHelpingRequest = async (requestId: string) => {
    const updated = await supabaseService.updateHelpRequest(requestId, {
      status: 'in-progress'
    });
    setHelpRequests(prev => prev.map(r => r.id === requestId ? updated : r));
  };

  // Lesson Library Handlers
  const handleDuplicateLesson = (lesson: LessonPlan) => {
    const duplicated: LessonPlan = {
      ...lesson,
      id: Date.now().toString(),
      title: `${lesson.title} (Copy)`,
      classId: classId,
      unitId: undefined // Reset unit
    };
    onAddLesson(duplicated);
  };

  const handleImportLesson = (lesson: LessonPlan) => {
    onAddLesson({
      ...lesson,
      classId: classId
    });
  };

  const handleSaveAsTemplate = (lesson: LessonPlan) => {
    onUpdateLesson({
      ...lesson,
      isTemplate: true
    });
  };

  // Backup/Restore Handler
  const handleRestore = (data: any) => {
    // This would need more comprehensive implementation
    // For now, just show an alert
    alert('Restore functionality would restore: ' + data.lessons?.length + ' lessons');
  };

  // Rubrics Handlers
  const handleAddRubric = (rubricData: Omit<Rubric, 'id' | 'createdAt'>) => {
    const newRubric: Rubric = {
      ...rubricData,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    setRubrics(prev => [...prev, newRubric]);
  };

  const handleUpdateRubric = (rubricId: string, updates: Partial<Rubric>) => {
    setRubrics(prev => prev.map(r => r.id === rubricId ? { ...r, ...updates } : r));
  };

  const handleDeleteRubric = (rubricId: string) => {
    setRubrics(prev => prev.filter(r => r.id !== rubricId));
  };

  const handleAttachRubricToLesson = (rubricId: string, lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      onUpdateLesson({ ...lesson, rubricId });
    }
  };

  // Bulk Actions Handlers
  const handleBulkUnlockUnits = (unitIds: string[]) => {
    unitIds.forEach(unitId => onToggleLock(unitId));
  };

  const handleBulkLockUnits = (unitIds: string[]) => {
    unitIds.forEach(unitId => onToggleLock(unitId));
  };

  const handleBulkAssignLesson = (lessonId: string, classIds: string[]) => {
    // This would duplicate the lesson to other classes
    // For now, just log it
    console.log('Bulk assign lesson', lessonId, 'to classes', classIds);
  };

  const handleBulkGrade = (submissionIds: string[], grade: number, comment: string) => {
    submissionIds.forEach(subId => {
      onGradeSubmission(subId, grade, comment);
    });
  };

  // Pending help requests count
  const pendingHelpCount = helpRequests.filter(r => r.status === 'pending').length;

  // Set initial advanced mode based on forceAdvancedMode prop
  React.useEffect(() => {
    if (forceAdvancedMode !== undefined) {
      setIsAdvancedMode(forceAdvancedMode);
    }
  }, [forceAdvancedMode]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Import Progress Notification */}
      {importStatus?.active && (
        <div className="fixed bottom-8 right-8 z-[110] animate-in slide-in-from-bottom-5 fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 w-80 md:w-96 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FaDatabase className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Importing Curriculum</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Background Process</p>
                </div>
              </div>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                {Math.round((importStatus.progress / importStatus.total) * 100)}%
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-1 italic">
              {importStatus.message}
            </p>

            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                style={{ width: `${(importStatus.progress / importStatus.total) * 100}%` }}
              />
            </div>

            <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <span>Progress</span>
              <span>{importStatus.progress} / {importStatus.total} Items</span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                You can continue working. The curriculum will appear in the tab below as it's created.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{isCreatingCustom ? 'Create Custom Lesson' : 'Edit Lesson'}</h3>
              <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FaXmark /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Syntax Guide Panel */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-4 text-xs text-indigo-800 dark:text-indigo-300 mb-4">
                <h4 className="font-bold flex items-center gap-2 mb-2"><FaCode /> Syntax Guide</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Code Task:</strong> Just write the instruction (e.g. "Draw a circle"). AI will check code.</li>
                  <li><strong>Observation:</strong> Start with <code>[NEXT]</code> (e.g. "[NEXT] Run the code"). No AI check.</li>
                  <li><strong>Question:</strong> Start with <code>[TEXT]</code> (e.g. "[TEXT] Why is it blue?"). AI checks text.</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Title</label>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm"
                    value={editingLesson.title}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Type</label>
                  <select
                    className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm"
                    value={editingLesson.type}
                    onChange={(e) => setEditingLesson({ ...editingLesson, type: e.target.value as LessonType })}
                  >
                    <option value="Lesson">Interactive Lesson</option>
                    <option value="Assignment">Assignment (Test)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Objective</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm"
                  value={editingLesson.objective}
                  onChange={(e) => setEditingLesson({ ...editingLesson, objective: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Steps (One per line)</label>
                <textarea
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm font-mono bg-slate-50"
                  rows={6}
                  value={editingLesson.steps.join('\n')}
                  onChange={(e) => setEditingLesson({ ...editingLesson, steps: e.target.value.split('\n') })}
                  placeholder="[NEXT] Look at the code...&#10;Change rect to circle...&#10;[TEXT] Why did it change?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Starter Code</label>
                <textarea
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm font-mono bg-slate-50"
                  rows={8}
                  value={editingLesson.starterCode}
                  onChange={(e) => setEditingLesson({ ...editingLesson, starterCode: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Mission Brief (Theory)</label>
                <textarea
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm font-mono"
                  rows={4}
                  value={editingLesson.theory || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, theory: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Reflection Question (Optional)</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm"
                  value={editingLesson.reflectionQuestion || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, reflectionQuestion: e.target.value })}
                  placeholder="Ask a question for students to answer in text..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingLesson(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit Unit</h3>
              <button onClick={() => setEditingUnit(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FaXmark /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Unit Title</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm"
                  value={editingUnit.title}
                  onChange={(e) => setEditingUnit({ ...editingUnit, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Unlock Date (Optional)</label>
                <div className="relative">
                  <FaCalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded pl-9 pr-3 py-2 text-sm text-slate-600 dark:text-slate-300"
                    value={editingUnit.availableAt ? new Date(editingUnit.availableAt).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
                      setEditingUnit({ ...editingUnit, availableAt: date });
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Leave empty to unlock immediately (unless manually locked).</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingUnit(null)}>Cancel</Button>
              <Button onClick={handleSaveUnitEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 pt-4">
          {/* Top Row: Class Info & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3 relative">
              {/* Class Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowClassSelector(!showClassSelector)}
                  className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {currentClass?.name || "Select Class"}
                  <FaChevronDown className="text-sm text-slate-400" />
                </button>
                {/* Dropdown */}
                {showClassSelector && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                    {classes.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { onSelectClass(c.id); setShowClassSelector(false); }}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${c.id === classId ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs opacity-70">{c.period}</div>
                      </button>
                    ))}
                    <div className="border-t border-slate-200 dark:border-slate-700 p-2">
                      <button
                        onClick={() => { setShowClassManager(true); setShowClassSelector(false); }}
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      >
                        <FaPlus size={12} /> Manage Classes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Class Code Badge */}
              {currentClass && (
                <div
                  className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-full px-3 py-1 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors group"
                  onClick={() => { navigator.clipboard.writeText(currentClass.classCode); onCopyClassCode(currentClass.classCode); }}
                  title="Click to Copy Class Code"
                >
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Code:</span>
                  <span className="font-mono font-bold text-indigo-900 dark:text-indigo-100">{currentClass.classCode}</span>
                  <FaCopy className="text-indigo-400 group-hover:text-indigo-600 text-xs" />
                </div>
              )}
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsAdvancedMode(false)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${!isAdvancedMode ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                SIMPLE
              </button>
              <button
                onClick={() => setIsAdvancedMode(true)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${isAdvancedMode ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                ADVANCED
              </button>
            </div>
          </div>

          <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
            {/* Primary Tabs */}
            <button
              id="tab-planner"
              onClick={() => setActiveTab('planner')}
              className={`${activeTab === 'planner'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors`}
            >
              <FaWandMagicSparkles /> Lesson Planner
            </button>
            <button
              id="tab-curriculum"
              onClick={() => setActiveTab('curriculum')}
              className={`${activeTab === 'curriculum'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors relative`}
            >
              <FaLayerGroup /> Curriculum
              {scratchGenerationStatus?.complete && (
                <span className="absolute top-3 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className={`${activeTab === 'grading'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors`}
            >
              <FaClipboardCheck /> Grading
              {gradingSubmissions.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                  {gradingSubmissions.length}
                </span>
              )}
            </button>

            {/* Advanced Tabs - Always render but conditionally show */}
            <button
              id="tab-analytics"
              onClick={() => { setIsAdvancedMode(true); setActiveTab('analytics'); }}
              className={`${activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors ${!isAdvancedMode ? 'hidden' : ''}`}
            >
              <FaChartPie /> Analytics
            </button>
            <button
              id="tab-roster"
              onClick={() => { setIsAdvancedMode(true); setActiveTab('roster'); }}
              className={`${activeTab === 'roster'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors ${!isAdvancedMode ? 'hidden' : ''}`}
            >
              <FaUsers /> Roster
            </button>
            <button
              id="tab-communication"
              onClick={() => { setIsAdvancedMode(true); setActiveTab('communication'); }}
              className={`${activeTab === 'communication'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors ${!isAdvancedMode ? 'hidden' : ''}`}
            >
              <FaBullhorn /> Communication
            </button>
            <button
              id="tab-help"
              onClick={() => { setIsAdvancedMode(true); setActiveTab('help'); }}
              className={`${activeTab === 'help'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors ${!isAdvancedMode ? 'hidden' : ''}`}
            >
              <FaHandsHolding /> Help Queue
              {pendingHelpCount > 0 && (
                <span className="ml-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 py-0.5 px-2 rounded-full text-xs animate-pulse">
                  {pendingHelpCount}
                </span>
              )}
            </button>
            <button
              id="tab-tools"
              onClick={() => { setIsAdvancedMode(true); setActiveTab('tools'); }}
              className={`${activeTab === 'tools'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors ${!isAdvancedMode ? 'hidden' : ''}`}
            >
              <FaToolbox /> Tools
            </button>
          </nav>
        </div>
      </div>

      {
        activeTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card id="planner-card" className="border-indigo-100 dark:border-indigo-900 shadow-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FaWandMagicSparkles className="text-indigo-600 dark:text-indigo-400" />
                        AI Lesson Planner
                      </CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Design a new learning module with AI power.
                      </p>
                    </div>
                    <Button id="planner-custom-btn" variant="outline" size="sm" onClick={handleCreateCustomLesson}>
                      <FaPen className="mr-2" /> Create Custom
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div id="planner-type-selector" className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                      <div className="flex gap-4">
                        <div
                          onClick={() => setLessonType('Lesson')}
                          className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${lessonType === 'Lesson' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-200">
                            <FaBookOpen className="text-indigo-500" /> Interactive Lesson
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Guided steps with theory. Best for teaching new concepts.</p>
                        </div>
                        <div
                          onClick={() => setLessonType('Assignment')}
                          className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${lessonType === 'Assignment' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-200">
                            <FaClipboardCheck className="text-pink-500" /> Coding Assignment
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Challenges and projects. Best for practice.</p>
                        </div>
                      </div>
                    </div>

                    {/* Prerequisite Selector for Assignments */}
                    {lessonType === 'Assignment' && (
                      <div className="md:col-span-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-900/50 rounded-lg p-3 animate-in fade-in">
                        <label className="block text-xs font-bold text-pink-800 dark:text-pink-300 uppercase mb-2">
                          Select Prerequisites (What have they learned?)
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {lessons.filter(l => l.type === 'Lesson' && l.classId === classId).map(lesson => (
                            <button
                              key={lesson.id}
                              onClick={() => togglePrereq(lesson.id)}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${selectedPrereqIds.includes(lesson.id) ? 'bg-pink-500 text-white border-pink-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-pink-300'}`}
                            >
                              {lesson.title}
                            </button>
                          ))}
                          {lessons.filter(l => l.type === 'Lesson' && l.classId === classId).length === 0 && (
                            <span className="text-xs text-slate-500 italic">No lessons created yet.</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div id="planner-topic-input" className="md:col-span-2">
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Topic</label>
                        <button
                          id="btn-suggestions"
                          onClick={handleGetSuggestions}
                          disabled={isLoadingSuggestions}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 border border-indigo-100 dark:border-indigo-800"
                        >
                          <FaLightbulb /> {isLoadingSuggestions ? 'Thinking...' : 'Need Ideas?'}
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Bouncing Balls, Mouse Input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                      <select
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Suggestions Panel */}
                  {(suggestions.length > 0 || isLoadingSuggestions || suggestionError) && (
                    <div className="grid grid-cols-1 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 animate-in fade-in mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Recommended Next Steps</span>
                        {suggestions.length > 0 && (
                          <button onClick={() => setSuggestions([])} className="text-xs text-slate-400 hover:text-slate-600"><FaXmark /></button>
                        )}
                      </div>

                      {isLoadingSuggestions && (
                        <div className="py-4 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                          Analyzing curriculum...
                        </div>
                      )}

                      {suggestionError && (
                        <div className="py-2 text-center text-red-500 text-sm flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/50">
                          <FaCircleExclamation /> {suggestionError}
                        </div>
                      )}

                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          onClick={() => applySuggestion(s)}
                          className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-2 rounded cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              {s.topic} <span className="text-[10px] px-1.5 rounded bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 font-normal">{s.difficulty}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.reason}</p>
                          </div>
                          <FaArrowRight className="text-slate-300 group-hover:text-indigo-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    id="btn-generate"
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0"
                  >
                    {isGenerating ? 'Dreaming up content...' : `Generate ${lessonType}`}
                  </Button>
                </CardContent>
              </Card>

              {generatedLesson && (
                <Card className="animate-in slide-in-from-bottom-4 fade-in">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{generatedLesson.title}</h4>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${lessonType === 'Lesson' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'}`}>
                            {lessonType}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-full">
                            {generatedLesson.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-3">
                          <label htmlFor="aiMode" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer">
                            <FaRobot /> Step-by-Step
                          </label>
                          <input
                            id="aiMode"
                            type="checkbox"
                            checked={aiGuidedMode}
                            onChange={(e) => setAiGuidedMode(e.target.checked)}
                            disabled={lessonType === 'Assignment'}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-1.5 max-w-[150px]"
                            value={selectedUnitId}
                            onChange={(e) => setSelectedUnitId(e.target.value)}
                          >
                            <option value="">No Unit</option>
                            {units.filter(u => u.classId === classId).map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                          </select>
                          <Button size="sm" onClick={handleSaveLesson}>
                            <FaPlus className="mr-2" /> Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide mb-2">Steps</h5>
                      <ul className="list-disc list-inside text-xs text-slate-500 dark:text-slate-400">
                        {generatedLesson.steps.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                        {generatedLesson.steps.length > 3 && <li>...</li>}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><FaLayerGroup /> Organize with Units</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-indigo-100 text-sm mb-4">Group your AI-generated lessons into coherent Units.</p>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('curriculum')}>Go to Curriculum</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      }

      {
        activeTab === 'curriculum' && (
          <div className="space-y-6">
            {scratchGenerationStatus?.complete && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl flex justify-between items-center animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FaCircleCheck className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 dark:text-green-200">Scratch Curriculum Ready!</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      AI has finished generating lessons for "{scratchGenerationStatus.projectTitle}".
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={onClearScratchStatus}>Dismiss</Button>
                  <Button size="sm" onClick={() => {
                    if (scratchGenerationStatus.generatedData && onImportCurriculum) {
                      onImportCurriculum(scratchGenerationStatus.generatedData.units, scratchGenerationStatus.generatedData.lessons);
                      onClearScratchStatus?.();
                    }
                  }}>
                    <FaPlus className="mr-2" /> Import Lessons
                  </Button>
                </div>
              </div>
            )}

            {scratchGenerationStatus?.active && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl flex justify-between items-center animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <FaRobot className="text-indigo-600 dark:text-indigo-400 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-800 dark:text-indigo-200">Generating Scratch Lessons...</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      This will only take a moment. You can safely switch tabs!
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Course Curriculum</h2>
              <div id="create-unit-area" className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={() => setIsCurriculumModalOpen(true)}
                  className="mr-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                >
                  <FaWandMagicSparkles className="mr-2" /> AI Curriculum
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsScratchImportOpen(true)}
                  className="mr-2 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/30"
                >
                  <FaLink className="mr-2" /> Import from Scratch
                </Button>
                <input
                  type="text"
                  placeholder="New Unit Title"
                  className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                />
                {/* Date Picker for Scheduled Unlock */}
                <div className="relative">
                  <FaCalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    title="Unlock Date"
                    className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                    value={newUnitDate}
                    onChange={(e) => setNewUnitDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateUnit} disabled={!newUnitTitle}>
                  <FaPlus className="mr-2" /> Create Unit
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={bulkMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setBulkMode(!bulkMode);
                    setSelectedUnits(new Set());
                  }}
                >
                  {bulkMode ? 'Exit Bulk Mode' : 'Bulk Select'}
                </Button>

                {bulkMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllUnits}
                    >
                      {selectedUnits.size === units.filter(u => u.classId === classId).length ? 'Deselect All' : 'Select All'}
                    </Button>

                    {selectedUnits.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDeleteUnits}
                      >
                        <FaTrash className="mr-2" />
                        Delete {selectedUnits.size} Unit{selectedUnits.size !== 1 ? 's' : ''}
                      </Button>
                    )}
                  </>
                )}
              </div>

              {bulkMode && selectedUnits.size > 0 && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedUnits.size} unit{selectedUnits.size !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>

            <div id="curriculum-units" className="flex gap-6 overflow-x-auto pb-8 snap-x">
              {units.filter(u => u.classId === classId).map((unit) => {
                const unitLessons = lessons.filter(l => l.unitId === unit.id && l.classId === classId);
                const isScheduled = unit.availableAt && unit.availableAt > Date.now();

                return (
                  <div
                    key={unit.id}
                    className="min-w-[350px] snap-center transition-transform"
                    draggable={!bulkMode}
                    onDragStart={bulkMode ? undefined : (e) => handleUnitDragStart(e, unit.id)}
                    onDragOver={bulkMode ? undefined : handleDragOver}
                    onDrop={bulkMode ? undefined : (e) => handleUnitDrop(e, unit.id)}
                  >
                    <div className={`bg-slate-100 dark:bg-slate-800 rounded-t-xl p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center ${bulkMode ? '' : 'cursor-grab active:cursor-grabbing'}`}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {bulkMode && (
                            <input
                              type="checkbox"
                              checked={selectedUnits.has(unit.id)}
                              onChange={() => handleToggleUnitSelection(unit.id)}
                              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                          )}
                          {!bulkMode && <FaGripLines className="text-slate-400" />}
                          <span className="font-bold text-slate-700 dark:text-slate-200">{unit.title}</span>
                          <button
                            onClick={() => setEditingUnit(unit)}
                            className="ml-2 text-slate-300 hover:text-indigo-500 transition-colors"
                            title="Edit Unit Details"
                          >
                            <FaPen size={10} />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="ml-1 text-slate-300 hover:text-red-500 transition-colors"
                            title="Delete Unit"
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
                        {unit.availableAt && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-6 flex items-center gap-1">
                            <FaCalendarDays /> {new Date(unit.availableAt).toLocaleDateString()}
                            {isScheduled && <span className="text-amber-500 font-bold">(Scheduled)</span>}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleSequential(unit.id)}
                          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${unit.isSequential ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                          title={unit.isSequential ? "Lessons must be done in order" : "Lessons can be done in any order"}
                        >
                          <FaArrowDownShortWide size={14} />
                        </button>
                        <button
                          onClick={() => onToggleLock(unit.id)}
                          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full transition-colors ${unit.isLocked ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'}`}
                          title={unit.isLocked ? "Students cannot access this" : "Students can access this"}
                        >
                          {unit.isLocked ? <FaLock className="text-[10px]" /> : <FaLockOpen className="text-[10px]" />}
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-b-xl p-3 min-h-[200px] space-y-3 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50 relative">
                      {unitLessons.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                          Drop lessons here
                        </div>
                      )}
                      {unitLessons.map(lesson => (
                        <div
                          key={lesson.id}
                          className={`bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing ${lesson.type === 'Assignment' ? 'border-l-4 border-l-pink-400' : 'border-l-4 border-l-indigo-400'}`}
                          draggable
                          onDragStart={(e) => handleLessonDragStart(e, lesson.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleLessonDrop(e, unit.id, lesson.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <FaGripVertical className="text-slate-300 text-xs" />
                              {lesson.type === 'Lesson' ?
                                <FaBookOpen className="text-indigo-400 text-xs" title="Lesson" /> :
                                <FaClipboardCheck className="text-pink-400 text-xs" title="Assignment" />
                              }
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                {lesson.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditLesson(lesson)} className="text-slate-300 hover:text-indigo-600" title="Edit Lesson">
                                <FaPen />
                              </button>
                              <button onClick={() => { if (confirm('Delete this lesson?')) onDeleteLesson(lesson.id); }} className="text-slate-300 hover:text-red-600" title="Delete Lesson">
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm pl-6">{lesson.title}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Unassigned Lessons Column */}
              <div className="min-w-[350px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleUnitDrop(e, '')}
              >
                <div className="bg-slate-200/50 dark:bg-slate-800/50 rounded-t-xl p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-slate-500 dark:text-slate-400 italic">Unassigned Lessons</h3>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-b-xl p-3 min-h-[200px] space-y-3">
                  {lessons.filter(l => !l.unitId && l.classId === classId).map(lesson => (
                    <div
                      key={lesson.id}
                      className={`bg-white dark:bg-slate-800 opacity-75 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm group cursor-grab active:cursor-grabbing ${lesson.type === 'Assignment' ? 'border-l-4 border-l-pink-400' : 'border-l-4 border-l-indigo-400'}`}
                      draggable
                      onDragStart={(e) => handleLessonDragStart(e, lesson.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleLessonDrop(e, '', lesson.id)}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <FaGripVertical className="text-slate-300 text-xs" />
                          {lesson.type === 'Lesson' ?
                            <FaBookOpen className="text-indigo-400 text-xs" title="Lesson" /> :
                            <FaClipboardCheck className="text-pink-400 text-xs" title="Assignment" />
                          }
                          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{lesson.title}</h4>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditLesson(lesson)} className="text-slate-400 hover:text-indigo-600">
                            <FaPen />
                          </button>
                          <button onClick={() => { if (confirm('Delete this lesson?')) onDeleteLesson(lesson.id); }} className="text-slate-400 hover:text-red-600" title="Delete Lesson">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        activeTab === 'grading' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* List of Submissions */}
            <Card id="grading-submissions-list" className="flex flex-col h-full border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-indigo-500"><FaClipboardCheck /></span>
                    To Grade
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {gradingSubmissions.length}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
                {gradingSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                      <span className="text-green-500 text-xl"><FaCircleCheck /></span>
                    </div>
                    <p className="font-medium text-slate-600 dark:text-slate-300">All caught up!</p>
                    <p className="text-xs mt-1">No pending submissions to grade.</p>
                  </div>
                ) : (
                  gradingSubmissions.map(sub => {
                    const lesson = lessons.find(l => l.id === sub.lessonId);
                    const student = students.find(s => s.id === sub.studentId);
                    return (
                      <div
                        key={sub.id}
                        onClick={() => { setSelectedSubmissionId(sub.id); setGradeInput(''); setCommentInput(''); }}
                        className={`p-3 rounded-lg cursor-pointer border transition-all group ${selectedSubmissionId === sub.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500 shadow-sm'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {student?.name.charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{student?.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(sub.submittedAt || 0).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="pl-8">
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">{lesson?.title}</div>
                          <div className="flex gap-2 mt-2">
                            {lesson?.type === 'Assignment' && (
                              <span className="text-[10px] bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 px-1.5 py-0.5 rounded font-bold border border-pink-200 dark:border-pink-800">
                                TEST
                              </span>
                            )}
                            {sub.textAnswer && (
                              <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                                <FaPen size={8} /> Written
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Grading Interface */}
            <Card id="grading-interface" className="lg:col-span-2 flex flex-col h-full border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
              {selectedSubmissionId ? (
                (() => {
                  const sub = submissions.find(s => s.id === selectedSubmissionId);
                  const lesson = lessons.find(l => l.id === sub?.lessonId);
                  const student = students.find(s => s.id === sub?.studentId);

                  if (!sub) return null;

                  return (
                    <div className="flex flex-col h-full">
                      <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="text-slate-500 font-normal">Grading:</span> {student?.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{lesson?.title}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedSubmissionId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>

                      {/* For assignments, show code. For lessons, only show reflection */}
                      {lesson?.type === 'Assignment' ? (
                        <div className="flex-1 flex flex-col min-h-0 max-h-[400px] relative bg-slate-100 dark:bg-black overflow-auto">
                          {lesson.editorType === 'scratch' ? (
                            <div className="w-full h-full relative">
                              <ScratchEditor initialCode={sub.code} readOnly={true} />
                            </div>
                          ) : (
                            <P5Editor initialCode={sub.code} readOnly={true} lessonTitle={`Submission: ${lesson?.title}`} />
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 p-6 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                          <div className="text-center text-slate-400 dark:text-slate-500">
                            <FaBookOpen className="text-4xl mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Lesson Project</p>
                            <p className="text-xs mt-1">Only reflection is graded for lessons</p>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
                        {sub.textAnswer && (
                          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1 flex items-center gap-1">
                              <FaPen size={10} /> {lesson?.type === 'Assignment' ? 'Student Response' : 'Student Reflection'}
                            </h4>
                            <p className="text-sm text-slate-800 dark:text-slate-200 italic">"{sub.textAnswer}"</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Grade (0-100)</label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md pl-3 pr-8 py-2 font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={gradeInput}
                                onChange={(e) => setGradeInput(e.target.value)}
                                placeholder="-"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                          <div className="md:col-span-3 flex gap-2">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Feedback</label>
                              <div className="flex gap-2">
                                <input
                                  className="flex-1 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                  placeholder="Great work! Next time try..."
                                  value={commentInput}
                                  onChange={(e) => setCommentInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && gradeInput && handleSubmitGrade()}
                                />
                                <Button
                                  variant="outline"
                                  onClick={() => setShowFeedbackTemplates(true)}
                                  title="Use Feedback Template"
                                  className="px-3"
                                >
                                  <FaComments />
                                </Button>
                              </div>
                            </div>
                            <Button
                              onClick={handleSubmitGrade}
                              disabled={!gradeInput}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"
                            >
                              Submit Grade
                            </Button>
                          </div>
                        </div>

                        {/* Success Notification */}
                        {showGradeSuccess && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                            <FaCircleCheck />
                            <span className="font-medium">Grade submitted successfully!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <FaClipboardCheck size={32} className="text-indigo-200 dark:text-indigo-800" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Ready to Grade</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 max-w-xs text-center">
                    Select a student submission from the list on the left to view their code, run it, and provide feedback.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )
      }

      {/* Feedback Template Selector Modal */}
      {
        showFeedbackTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Select Feedback Template</h3>
                <button onClick={() => setShowFeedbackTemplates(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FaXmark /></button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <FeedbackTemplates
                  templates={feedbackTemplates}
                  teacherId={teacherId}
                  onAddTemplate={handleAddFeedbackTemplate}
                  onUpdateTemplate={handleUpdateFeedbackTemplate}
                  onDeleteTemplate={handleDeleteFeedbackTemplate}
                  onSelectTemplate={(template) => {
                    setCommentInput(template.comment);
                    setShowFeedbackTemplates(false);
                  }}
                  selectionMode={true}
                />
              </div>
            </div>
          </div>
        )
      }

      {
        activeTab === 'analytics' && (
          selectedStudentForAnalytics ? (
            <StudentAnalytics
              student={selectedStudentForAnalytics}
              lessons={lessons.filter(l => l.classId === classId)}
              submissions={submissions.filter(s => s.classId === classId)}
              onBack={() => setSelectedStudentForAnalytics(null)}
            />
          ) : (
            <div className="space-y-6">
              <AnalyticsDashboard
                lessons={lessons}
                units={units}
                submissions={submissions}
                students={students}
                classId={classId}
              />

              {/* Student Quick Access */}
              <Card className="overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaUserGraduate /> Individual Student Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Click on a student to see their detailed progress, concept mastery, and areas for improvement.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {rosterStudents.filter(s => s.isActive).map(student => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudentForAnalytics(student)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {student.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">{student.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {submissions.filter(s => s.studentId === student.id && s.classId === classId && s.status !== 'Draft').length} submissions
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )
      }

      {
        activeTab === 'roster' && (
          <div className="space-y-6">

            <div className="flex justify-between items-center px-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaUsers className="text-indigo-500" /> Class Roster
              </h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setRosterSubTab('students')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${rosterSubTab === 'students'
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                >
                  <span className="flex items-center gap-2"><FaUserGraduate /> Students</span>
                </button>
                <button
                  onClick={() => setRosterSubTab('enrollment')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${rosterSubTab === 'enrollment'
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <FaIdCard /> Enrollment
                    {enrollments.filter(e => e.status === 'pending').length > 0 && (
                      <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full text-xs font-bold">
                        {enrollments.filter(e => e.status === 'pending').length}
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {rosterSubTab === 'students' ? (
              <StudentRoster
                students={rosterStudents}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onRemoveStudent={handleRemoveStudent}
                onImportCSV={handleImportCSV}
              />
            ) : (
              <EnrollmentManager
                classId={classId}
                classCode={classCode}
                enrollments={enrollments}
                students={rosterStudents}
                onEnrollmentUpdate={handleEnrollmentUpdate}
                onStudentAdded={handleStudentAdded}
              />
            )}
          </div>
        )
      }

      {
        activeTab === 'communication' && (
          <AnnouncementsManager
            classId={classId}
            teacherId={teacherId}
            announcements={announcements}
            students={rosterStudents.map(s => ({ id: s.id, name: s.name }))}
            onAnnouncementUpdate={handleAnnouncementUpdate}
            onAnnouncementDelete={handleAnnouncementDelete}
          />
        )
      }

      {
        activeTab === 'help' && (
          <HelpQueue
            helpRequests={helpRequests.filter(r => r.classId === classId)}
            students={rosterStudents}
            lessons={lessons}
            onResolveRequest={handleResolveHelpRequest}
            onStartHelping={handleStartHelpingRequest}
          />
        )
      }

      {
        activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 px-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaToolbox className="text-indigo-500" /> Teacher Tools
              </h2>
              <div className="flex overflow-x-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-lg max-w-full">
                <button
                  onClick={() => setToolsSubTab('export')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${toolsSubTab === 'export' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  <FaDownload className="inline mr-1" /> Export
                </button>
                <button
                  onClick={() => setToolsSubTab('templates')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${toolsSubTab === 'templates' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  <FaComments className="inline mr-1" /> Templates
                </button>
                <button
                  onClick={() => setToolsSubTab('library')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${toolsSubTab === 'library' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  <FaBookmark className="inline mr-1" /> Library
                </button>
                <button
                  onClick={() => setToolsSubTab('backup')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${toolsSubTab === 'backup' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  <FaDatabase className="inline mr-1" /> Backup
                </button>
                <button
                  onClick={() => setToolsSubTab('bulk')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${toolsSubTab === 'bulk' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  <FaTrash className="inline mr-1" /> Bulk
                </button>
                <button
                  onClick={() => setToolsSubTab('rubrics')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${toolsSubTab === 'rubrics' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  <FaClipboardCheck className="inline mr-1" /> Rubrics
                </button>
              </div>
            </div>

            {toolsSubTab === 'export' && (
              <GradebookExport
                lessons={lessons.filter(l => l.classId === classId)}
                submissions={submissions.filter(s => s.classId === classId)}
                students={rosterStudents}
                className={currentClass?.name || 'Class'}
              />
            )}

            {toolsSubTab === 'templates' && (
              <FeedbackTemplates
                templates={feedbackTemplates}
                teacherId={teacherId}
                onAddTemplate={handleAddFeedbackTemplate}
                onUpdateTemplate={handleUpdateFeedbackTemplate}
                onDeleteTemplate={handleDeleteFeedbackTemplate}
                onSelectTemplate={() => { }}
                selectionMode={false}
              />
            )}

            {toolsSubTab === 'library' && (
              <LessonLibrary
                lessons={lessons}
                onDuplicateLesson={handleDuplicateLesson}
                onImportLesson={handleImportLesson}
                onSaveAsTemplate={handleSaveAsTemplate}
                classId={classId}
              />
            )}

            {toolsSubTab === 'backup' && (
              <BackupRestore
                currentClass={currentClass}
                lessons={lessons}
                units={units}
                students={rosterStudents}
                submissions={submissions}
                announcements={announcements}
                onRestore={handleRestore}
              />
            )}

            {toolsSubTab === 'bulk' && (
              <BulkActions
                lessons={lessons.filter(l => l.classId === classId)}
                units={units.filter(u => u.classId === classId)}
                submissions={submissions.filter(s => s.classId === classId)}
                students={rosterStudents}
                onBulkUnlockUnits={handleBulkUnlockUnits}
                onBulkLockUnits={handleBulkLockUnits}
                onBulkAssignLesson={handleBulkAssignLesson}
                onBulkGrade={handleBulkGrade}
              />
            )}

            {toolsSubTab === 'rubrics' && (
              <RubricsManager
                rubrics={rubrics}
                lessons={lessons.filter(l => l.classId === classId)}
                onAddRubric={handleAddRubric}
                onUpdateRubric={handleUpdateRubric}
                onDeleteRubric={handleDeleteRubric}
                onAttachRubricToLesson={handleAttachRubricToLesson}
              />
            )}
          </div>
        )
      }
      {/* Curriculum Generator Modal */}
      {
        isCurriculumModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FaWandMagicSparkles className="text-indigo-600" /> AI Curriculum Generator
                </h3>
                <button onClick={() => setIsCurriculumModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FaXmark /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Toggle between Templates and Custom */}
                <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
                  <button
                    onClick={() => setUseTemplate(true)}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${useTemplate ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    📚 Recommended Templates
                  </button>
                  <button
                    onClick={() => setUseTemplate(false)}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${!useTemplate ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    ✨ Custom Theme
                  </button>
                </div>

                {useTemplate ? (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-4 text-sm text-indigo-800 dark:text-indigo-300">
                      <p><strong>Choose a classroom-tested curriculum:</strong> These templates are designed by educators for different grade levels and learning goals.</p>
                      <p className="mt-2 text-xs">
                        {units.filter(u => u.classId === classId).length > 0
                          ? `✓ Lessons will be added to your ${units.filter(u => u.classId === classId).length} existing unit(s)`
                          : '⚠ New units will be created since you have none yet'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CURRICULUM_TEMPLATES.map(template => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`text-left p-4 rounded-lg border-2 transition-all ${selectedTemplate === template.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">{template.name}</h4>
                            {selectedTemplate === template.id && (
                              <FaCheck className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2">{template.level}</div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{template.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {template.goals.slice(0, 3).map((goal, i) => (
                              <span key={i} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                                {goal}
                              </span>
                            ))}
                            {template.goals.length > 3 && (
                              <span className="text-xs text-slate-400">+{template.goals.length - 3} more</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-4 text-sm text-indigo-800 dark:text-indigo-300">
                      <p><strong>Create your own:</strong> Enter any theme and the AI will generate a custom curriculum.</p>
                      <p className="mt-2 text-xs">
                        {units.filter(u => u.classId === classId).length > 0
                          ? `✓ Lessons will be added to your ${units.filter(u => u.classId === classId).length} existing unit(s)`
                          : '⚠ New units will be created since you have none yet'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Course Theme</label>
                      <input
                        className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={curriculumTheme}
                        onChange={(e) => setCurriculumTheme(e.target.value)}
                        placeholder="e.g. Ocean Adventure, Music Visualizer, Retro Arcade..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Duration / Scope</label>
                      <select
                        className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={curriculumDuration}
                        onChange={(e) => setCurriculumDuration(e.target.value)}
                      >
                        <option value="Workshop">One-Day Workshop (6-8 Lessons)</option>
                        <option value="Month">Month Long (12-16 Lessons)</option>
                        <option value="Semester">Full Semester (30-40 Lessons)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsCurriculumModalOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleGenerateCurriculum}
                  disabled={(useTemplate ? !selectedTemplate : !curriculumTheme) || isGeneratingCurriculum}
                >
                  {isGeneratingCurriculum ? 'Generating...' : 'Generate Curriculum'}
                </Button>
              </div>
            </div>
          </div>
        )
      }
      {/* Scratch Project Import Modal */}
      <ScratchProjectImport
        isOpen={isScratchImportOpen}
        onClose={() => setIsScratchImportOpen(false)}
        onImportCurriculum={handleScratchImportCurriculum}
        classId={classId}
        existingUnitsCount={units.filter(u => u.classId === classId).length}
        onStartBackgroundGeneration={onStartScratchGeneration}
        backgroundGenerationActive={scratchGenerationStatus?.active}
      />

      {/* Class Manager Modal */}
      {
        showClassManager && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FaUsers className="text-indigo-600" /> Manage Classes
                </h3>
                <button onClick={() => setShowClassManager(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FaXmark /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <ClassManager
                  classes={classes}
                  currentClassId={classId}
                  teacherId={teacherId}
                  onSelectClass={(id) => { onSelectClass(id); setShowClassManager(false); }}
                  onCreateClass={onCreateClass}
                  onUpdateClass={onUpdateClass}
                  onDeleteClass={onDeleteClass}
                  onCopyClassCode={onCopyClassCode}
                />
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default TeacherDashboard;