
export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export type LessonType = 'Lesson' | 'Assignment';

// Class/Period Management
export interface Class {
  id: string;
  name: string;
  period?: string;
  academicYear: string;
  teacherId: string;
  classCode: string; // 6-digit enrollment code
  createdAt: number;
  defaultEditorType?: 'p5' | 'scratch'; // Default editor for new lessons
}

// Enrollment status
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  status: EnrollmentStatus;
  enrolledAt?: number;
  requestedAt: number;
}

export interface Unit {
  id: string;
  classId: string; // Links unit to a specific class
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
  isSequential?: boolean; // Enforce order of lessons
  availableAt?: number; // Timestamp for auto-unlock
}

export interface LessonPlan {
  id: string;
  classId?: string; // Links lesson to a specific class
  unitId?: string; // Links lesson to a specific unit
  type: LessonType;
  topic: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  objective: string;
  description: string;
  theory?: string; // Detailed markdown explanation for Lessons
  steps: string[];
  starterCode: string;
  challenge: string;
  isAiGuided?: boolean;
  tags?: string[]; // For concept mastery tracking (e.g. ['loops', 'shapes'])
  reflectionQuestion?: string; // Optional written question
  rubricId?: string; // Optional rubric for grading
  isTemplate?: boolean; // If true, can be reused across classes
  variant?: string; // For differentiated assignments (e.g., 'easy', 'hard')
  editorType?: 'p5' | 'scratch'; // Which editor to use (defaults to 'p5')
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  studentId?: string; // School student ID
  enrolledAt?: number;
  notes?: string;
  isActive: boolean;
}

export interface Feedback {
  grade: number; // 0-100
  comment: string;
  gradedAt: number;
}

export interface StepHistory {
  stepIndex: number;
  studentInput: string; // Code or Text answer
  feedback: string;
  passed: boolean;
}

export interface Submission {
  id: string;
  lessonId: string;
  studentId: string;
  classId: string; // Links submission to class
  code: string;
  status: 'Draft' | 'Submitted' | 'Graded';
  submittedAt?: number;
  feedback?: Feedback;
  currentStep?: number;
  textAnswer?: string; // Student's written response
  history?: StepHistory[]; // Track feedback for each step
  timeSpent?: number; // Time in milliseconds spent on lesson
}

// Rubrics System
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
}

export interface Rubric {
  id: string;
  name: string;
  description?: string;
  criteria: RubricCriterion[];
  lessonId?: string; // Optional link to specific lesson
  createdAt: number;
}

export interface RubricGrade {
  criterionId: string;
  points: number;
  comment?: string;
}

// Announcements
export interface Announcement {
  id: string;
  classId: string;
  title: string;
  content: string;
  scheduledAt?: number; // If set, post at this time
  createdAt: number;
  createdBy: string; // Teacher ID
  targetStudentIds?: string[]; // If set, only show to these students
}

// Help Requests
export interface HelpRequest {
  id: string;
  studentId: string;
  classId: string;
  lessonId: string;
  message?: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: number;
  resolvedAt?: number;
}

// Accommodations
export interface Accommodation {
  id: string;
  studentId: string;
  classId: string;
  extendedTime?: number; // Extra time in milliseconds
  modifiedRequirements?: string; // Notes on modified requirements
  notes?: string;
}

// Feedback Templates
export interface FeedbackTemplate {
  id: string;
  name: string;
  comment: string;
  category?: string; // e.g., 'praise', 'syntax-error', 'logic-error'
  createdBy: string;
  createdAt: number;
}

// AI service types for structured output
export interface AILessonResponse {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  objective: string;
  description: string;
  theory?: string;
  steps: string[];
  starterCode: string;
  challenge: string;
  tags: string[];
}

export interface AICodeAnalysis {
  isCorrect: boolean;
  hint: string;
  encouragement: string;
}

export interface AIStepValidation {
  passed: boolean;
  feedback: string;
}

export interface CurriculumSuggestion {
  topic: string;
  reason: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface CurriculumUnitRequest {
  title: string;
  description: string;
  order: number;
}

export interface CurriculumLessonRequest {
  unitIndex: number; // Index in the units array
  title: string;
  topic: string;
  objective: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  theory: string;
  steps: string[];
  starterCode: string;
  challenge: string;
  tags: string[];
}

export interface FullCurriculumResponse {
  courseTitle: string;
  description: string;
  units: CurriculumUnitRequest[];
  lessons: CurriculumLessonRequest[];
}