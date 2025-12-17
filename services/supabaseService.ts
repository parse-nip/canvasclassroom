// Supabase service for database operations
import { supabase } from '../lib/supabase';
import { Class, Student, Enrollment, Unit, LessonPlan, Submission, Rubric, Announcement, HelpRequest, Accommodation, FeedbackTemplate, RubricCriterion } from '../types';

// Helper function to convert database row to Class
const dbToClass = (row: any): Class => ({
  id: row.id,
  name: row.name,
  period: row.period,
  academicYear: row.academic_year,
  teacherId: row.teacher_id,
  classCode: row.class_code,
  createdAt: row.created_at,
  defaultEditorType: row.default_editor_type
});

// Helper function to convert Class to database row
const classToDb = (classData: Partial<Class>): any => ({
  name: classData.name,
  period: classData.period,
  academic_year: classData.academicYear,
  teacher_id: classData.teacherId,
  class_code: classData.classCode,
  default_editor_type: classData.defaultEditorType
});

// Helper function to convert database row to Student
const dbToStudent = (row: any): Student => ({
  id: row.id,
  name: row.name,
  avatar: row.avatar || '',
  email: row.email,
  studentId: row.student_id,
  enrolledAt: row.enrolled_at,
  notes: row.notes,
  isActive: row.is_active
});

// Helper function to convert Student to database row
const studentToDb = (studentData: Partial<Student>): any => ({
  name: studentData.name,
  avatar: studentData.avatar,
  email: studentData.email,
  student_id: studentData.studentId,
  enrolled_at: studentData.enrolledAt,
  notes: studentData.notes,
  is_active: studentData.isActive
});

// Helper function to convert database row to Enrollment
const dbToEnrollment = (row: any): Enrollment => ({
  id: row.id,
  studentId: row.student_id,
  classId: row.class_id,
  status: row.status as 'pending' | 'approved' | 'rejected',
  enrolledAt: row.enrolled_at,
  requestedAt: row.requested_at
});

// Helper function to convert database row to Unit
const dbToUnit = (row: any): Unit => ({
  id: row.id,
  classId: row.class_id,
  title: row.title,
  description: row.description,
  order: row.order,
  isLocked: row.is_locked,
  isSequential: row.is_sequential,
  availableAt: row.available_at
});

// Helper function to convert database row to LessonPlan
const dbToLessonPlan = (row: any): LessonPlan => ({
  id: row.id,
  classId: row.class_id,
  unitId: row.unit_id,
  type: row.type as 'Lesson' | 'Assignment',
  topic: row.topic,
  title: row.title,
  difficulty: row.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
  objective: row.objective,
  description: row.description,
  theory: row.theory,
  steps: row.steps || [],
  starterCode: row.starter_code || '',
  challenge: row.challenge || '',
  isAiGuided: row.is_ai_guided,
  tags: row.tags || [],
  reflectionQuestion: row.reflection_question,
  rubricId: row.rubric_id,
  isTemplate: row.is_template,
  variant: row.variant,
  editorType: row.editor_type
});

// Helper function to convert database row to Submission
const dbToSubmission = (row: any): Submission => ({
  id: row.id,
  lessonId: row.lesson_id,
  studentId: row.student_id,
  classId: row.class_id,
  code: row.code || '',
  status: row.status as 'Draft' | 'Submitted' | 'Graded',
  submittedAt: row.submitted_at,
  feedback: row.feedback ? {
    grade: row.feedback.grade,
    comment: row.feedback.comment,
    gradedAt: row.feedback.graded_at
  } : undefined,
  currentStep: row.current_step,
  textAnswer: row.text_answer,
  history: row.history || [],
  timeSpent: row.time_spent
});

// Helper function to convert database row to Rubric
const dbToRubric = (row: any): Rubric => ({
  id: row.id,
  name: row.name,
  description: row.description,
  criteria: row.criteria || [],
  lessonId: row.lesson_id,
  createdAt: row.created_at
});

// Helper function to convert database row to Announcement
const dbToAnnouncement = (row: any): Announcement => ({
  id: row.id,
  classId: row.class_id,
  title: row.title,
  content: row.content,
  scheduledAt: row.scheduled_at,
  createdAt: row.created_at,
  createdBy: row.created_by,
  targetStudentIds: row.target_student_ids || []
});

// Helper function to convert database row to HelpRequest
const dbToHelpRequest = (row: any): HelpRequest => ({
  id: row.id,
  studentId: row.student_id,
  classId: row.class_id,
  lessonId: row.lesson_id,
  message: row.message,
  status: row.status as 'pending' | 'in-progress' | 'resolved',
  createdAt: row.created_at,
  resolvedAt: row.resolved_at
});

// Helper function to convert database row to FeedbackTemplate
const dbToFeedbackTemplate = (row: any): FeedbackTemplate => ({
  id: row.id,
  name: row.name,
  comment: row.comment,
  category: row.category,
  createdBy: row.created_by,
  createdAt: row.created_at
});

class SupabaseService {
  // Class Management
  async getClasses(teacherId: string): Promise<Class[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching classes:', error);
      return [];
    }

    return (data || []).map(dbToClass);
  }

  async createClass(classData: Omit<Class, 'id' | 'createdAt' | 'classCode'>): Promise<Class> {
    // Generate 6-digit class code
    let classCode: string;
    let isUnique = false;
    
    // Ensure unique class code
    while (!isUnique) {
      classCode = Math.floor(100000 + Math.random() * 900000).toString();
      const { data } = await supabase
        .from('classes')
        .select('id')
        .eq('class_code', classCode)
        .single();
      
      if (!data) {
        isUnique = true;
      }
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({
        ...classToDb(classData),
        class_code: classCode,
        created_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating class:', error);
      throw error;
    }

    return dbToClass(data);
  }

  async updateClass(classId: string, updates: Partial<Class>): Promise<Class> {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.period !== undefined) dbUpdates.period = updates.period;
    if (updates.academicYear !== undefined) dbUpdates.academic_year = updates.academicYear;
    if (updates.defaultEditorType !== undefined) dbUpdates.default_editor_type = updates.defaultEditorType;

    const { data, error } = await supabase
      .from('classes')
      .update(dbUpdates)
      .eq('id', classId)
      .select()
      .single();

    if (error) {
      console.error('Error updating class:', error);
      throw error;
    }

    return dbToClass(data);
  }

  async deleteClass(classId: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // Student Management
  async getStudents(classId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        students (*)
      `)
      .eq('class_id', classId)
      .eq('status', 'approved');

    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }

    return (data || [])
      .map((row: any) => dbToStudent(row.students))
      .filter((s: Student) => s.isActive);
  }

  async createStudent(studentData: Omit<Student, 'id' | 'avatar'>): Promise<Student> {
    // Generate avatar initials
    const initials = studentData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const { data, error } = await supabase
      .from('students')
      .insert({
        ...studentToDb({ ...studentData, avatar: initials }),
        created_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      throw error;
    }

    return dbToStudent(data);
  }

  async updateStudent(studentId: string, updates: Partial<Student>): Promise<Student> {
    const dbUpdates = studentToDb(updates);

    const { data, error } = await supabase
      .from('students')
      .update(dbUpdates)
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }

    return dbToStudent(data);
  }

  async importStudentsFromCSV(classId: string, csvData: string): Promise<Student[]> {
    // Parse CSV and create students
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const students: Student[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const studentData: any = {};
      
      headers.forEach((header, idx) => {
        if (header.includes('name')) studentData.name = values[idx];
        if (header.includes('email')) studentData.email = values[idx];
        if (header.includes('id') || header.includes('student')) studentData.studentId = values[idx];
      });

      if (studentData.name) {
        const student = await this.createStudent({
          name: studentData.name,
          email: studentData.email,
          studentId: studentData.studentId,
          isActive: true
        });
        
        // Create enrollment
        await this.createEnrollment({
          studentId: student.id,
          classId: classId,
          status: 'approved',
          enrolledAt: Date.now()
        });
        
        students.push(student);
      }
    }

    return students;
  }

  async joinClassByCode(studentId: string, classCode: string): Promise<string> {
    // 1. Find the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('class_code', classCode)
      .single();

    if (classError || !classData) {
      throw new Error('Class not found with this code');
    }

    // 2. Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('class_id', classData.id)
      .single();

    if (existingEnrollment) {
      return classData.id;
    }

    // 3. Create enrollment
    await this.createEnrollment({
      studentId: studentId,
      classId: classData.id,
      status: 'approved', // Auto-approve when joining by code
      enrolledAt: Date.now()
    });

    return classData.id;
  }

  // Enrollment Management
  async getEnrollments(classId: string, status?: string): Promise<Enrollment[]> {
    let query = supabase
      .from('enrollments')
      .select('*')
      .eq('class_id', classId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }

    return (data || []).map(dbToEnrollment);
  }

  async createEnrollment(enrollmentData: Omit<Enrollment, 'id' | 'requestedAt'>): Promise<Enrollment> {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: enrollmentData.studentId,
        class_id: enrollmentData.classId,
        status: enrollmentData.status,
        enrolled_at: enrollmentData.enrolledAt,
        requested_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }

    return dbToEnrollment(data);
  }

  async updateEnrollmentStatus(enrollmentId: string, status: 'approved' | 'rejected'): Promise<Enrollment> {
    const updates: any = { status };
    
    if (status === 'approved') {
      updates.enrolled_at = Date.now();
    }

    const { data, error } = await supabase
      .from('enrollments')
      .update(updates)
      .eq('id', enrollmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating enrollment:', error);
      throw error;
    }

    return dbToEnrollment(data);
  }

  // Units
  async getUnits(classId: string): Promise<Unit[]> {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('class_id', classId)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching units:', error);
      return [];
    }

    return (data || []).map(dbToUnit);
  }

  async createUnit(unitData: Omit<Unit, 'id'>): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .insert({
        class_id: unitData.classId,
        title: unitData.title,
        description: unitData.description,
        order: unitData.order,
        is_locked: unitData.isLocked,
        is_sequential: unitData.isSequential,
        available_at: unitData.availableAt,
        created_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating unit:', error);
      throw error;
    }

    return dbToUnit(data);
  }

  async updateUnit(unitId: string, updates: Partial<Unit>): Promise<Unit> {
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.order !== undefined) dbUpdates.order = updates.order;
    if (updates.isLocked !== undefined) dbUpdates.is_locked = updates.isLocked;
    if (updates.isSequential !== undefined) dbUpdates.is_sequential = updates.isSequential;
    if (updates.availableAt !== undefined) dbUpdates.available_at = updates.availableAt;

    const { data, error } = await supabase
      .from('units')
      .update(dbUpdates)
      .eq('id', unitId)
      .select()
      .single();

    if (error) {
      console.error('Error updating unit:', error);
      throw error;
    }

    return dbToUnit(data);
  }

  async deleteUnit(unitId: string): Promise<void> {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', unitId);

    if (error) {
      console.error('Error deleting unit:', error);
      throw error;
    }
  }

  // Lessons
  async getLessons(classId: string): Promise<LessonPlan[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }

    return (data || []).map(dbToLessonPlan);
  }

  async createLesson(lessonData: Omit<LessonPlan, 'id'>): Promise<LessonPlan> {
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        class_id: lessonData.classId,
        unit_id: lessonData.unitId,
        type: lessonData.type,
        topic: lessonData.topic,
        title: lessonData.title,
        difficulty: lessonData.difficulty,
        objective: lessonData.objective,
        description: lessonData.description,
        theory: lessonData.theory,
        steps: lessonData.steps || [],
        starter_code: lessonData.starterCode || '',
        challenge: lessonData.challenge || '',
        is_ai_guided: lessonData.isAiGuided,
        tags: lessonData.tags || [],
        reflection_question: lessonData.reflectionQuestion,
        rubric_id: lessonData.rubricId,
        is_template: lessonData.isTemplate,
        variant: lessonData.variant,
        editor_type: lessonData.editorType,
        created_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }

    return dbToLessonPlan(data);
  }

  async updateLesson(lessonId: string, updates: Partial<LessonPlan>): Promise<LessonPlan> {
    const dbUpdates: any = {};
    
    if (updates.classId !== undefined) dbUpdates.class_id = updates.classId;
    if (updates.unitId !== undefined) dbUpdates.unit_id = updates.unitId;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.topic !== undefined) dbUpdates.topic = updates.topic;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
    if (updates.objective !== undefined) dbUpdates.objective = updates.objective;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.theory !== undefined) dbUpdates.theory = updates.theory;
    if (updates.steps !== undefined) dbUpdates.steps = updates.steps;
    if (updates.starterCode !== undefined) dbUpdates.starter_code = updates.starterCode;
    if (updates.challenge !== undefined) dbUpdates.challenge = updates.challenge;
    if (updates.isAiGuided !== undefined) dbUpdates.is_ai_guided = updates.isAiGuided;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.reflectionQuestion !== undefined) dbUpdates.reflection_question = updates.reflectionQuestion;
    if (updates.rubricId !== undefined) dbUpdates.rubric_id = updates.rubricId;
    if (updates.isTemplate !== undefined) dbUpdates.is_template = updates.isTemplate;
    if (updates.variant !== undefined) dbUpdates.variant = updates.variant;
    if (updates.editorType !== undefined) dbUpdates.editor_type = updates.editorType;

    const { data, error } = await supabase
      .from('lessons')
      .update(dbUpdates)
      .eq('id', lessonId)
      .select()
      .single();

    if (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }

    return dbToLessonPlan(data);
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  }

  async duplicateLesson(lessonId: string, targetClassId?: string): Promise<LessonPlan> {
    // Get the original lesson
    const { data: originalLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (fetchError || !originalLesson) {
      throw new Error('Lesson not found');
    }

    // Create a copy
    const lessonData = dbToLessonPlan(originalLesson);
    if (targetClassId) {
      lessonData.classId = targetClassId;
    }

    return await this.createLesson(lessonData);
  }

  // Submissions
  async getSubmissions(classId: string, lessonId?: string, studentId?: string): Promise<Submission[]> {
    let query = supabase
      .from('submissions')
      .select('*')
      .eq('class_id', classId);

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }

    return (data || []).map(dbToSubmission);
  }

  async createSubmission(submissionData: Omit<Submission, 'id'>): Promise<Submission> {
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        lesson_id: submissionData.lessonId,
        student_id: submissionData.studentId,
        class_id: submissionData.classId,
        code: submissionData.code || '',
        status: submissionData.status || 'Draft',
        submitted_at: submissionData.submittedAt,
        current_step: submissionData.currentStep,
        text_answer: submissionData.textAnswer,
        time_spent: submissionData.timeSpent,
        feedback: submissionData.feedback,
        history: submissionData.history || [],
        created_at: Date.now(),
        updated_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      throw error;
    }

    return dbToSubmission(data);
  }

  async updateSubmission(submissionId: string, updates: Partial<Submission>): Promise<Submission> {
    const dbUpdates: any = {
      updated_at: Date.now()
    };
    
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.submittedAt !== undefined) dbUpdates.submitted_at = updates.submittedAt;
    if (updates.currentStep !== undefined) dbUpdates.current_step = updates.currentStep;
    if (updates.textAnswer !== undefined) dbUpdates.text_answer = updates.textAnswer;
    if (updates.timeSpent !== undefined) dbUpdates.time_spent = updates.timeSpent;
    if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
    if (updates.history !== undefined) dbUpdates.history = updates.history;

    const { data, error } = await supabase
      .from('submissions')
      .update(dbUpdates)
      .eq('id', submissionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating submission:', error);
      throw error;
    }

    return dbToSubmission(data);
  }

  // Rubrics
  async getRubrics(lessonId?: string): Promise<Rubric[]> {
    let query = supabase
      .from('rubrics')
      .select('*');

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rubrics:', error);
      return [];
    }

    return (data || []).map(dbToRubric);
  }

  async createRubric(rubricData: Omit<Rubric, 'id' | 'createdAt'>): Promise<Rubric> {
    const { data, error } = await supabase
      .from('rubrics')
      .insert({
        name: rubricData.name,
        description: rubricData.description,
        lesson_id: rubricData.lessonId,
        criteria: rubricData.criteria || [],
        created_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating rubric:', error);
      throw error;
    }

    return dbToRubric(data);
  }

  // Announcements
  async getAnnouncements(classId: string): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }

    return (data || []).map(dbToAnnouncement);
  }

  async createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        class_id: announcementData.classId,
        title: announcementData.title,
        content: announcementData.content,
        scheduled_at: announcementData.scheduledAt,
        created_by: announcementData.createdBy,
        target_student_ids: announcementData.targetStudentIds || [],
        created_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }

    return dbToAnnouncement(data);
  }

  async updateAnnouncement(announcementId: string, updates: Partial<Announcement>): Promise<Announcement> {
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.scheduledAt !== undefined) dbUpdates.scheduled_at = updates.scheduledAt;
    if (updates.targetStudentIds !== undefined) dbUpdates.target_student_ids = updates.targetStudentIds;

    const { data, error } = await supabase
      .from('announcements')
      .update(dbUpdates)
      .eq('id', announcementId)
      .select()
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }

    return dbToAnnouncement(data);
  }

  async deleteAnnouncement(announcementId: string): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId);

    if (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  // Help Requests
  async getHelpRequests(classId: string, status?: string): Promise<HelpRequest[]> {
    let query = supabase
      .from('help_requests')
      .select('*')
      .eq('class_id', classId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching help requests:', error);
      return [];
    }

    return (data || []).map(dbToHelpRequest);
  }

  async createHelpRequest(requestData: Omit<HelpRequest, 'id' | 'createdAt'>): Promise<HelpRequest> {
    const { data, error } = await supabase
      .from('help_requests')
      .insert({
        student_id: requestData.studentId,
        class_id: requestData.classId,
        lesson_id: requestData.lessonId,
        message: requestData.message,
        status: requestData.status || 'pending',
        created_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating help request:', error);
      throw error;
    }

    return dbToHelpRequest(data);
  }

  async updateHelpRequest(requestId: string, updates: Partial<HelpRequest>): Promise<HelpRequest> {
    const dbUpdates: any = {};
    
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.message !== undefined) dbUpdates.message = updates.message;
    if (updates.status === 'resolved' && !updates.resolvedAt) {
      dbUpdates.resolved_at = Date.now();
    } else if (updates.resolvedAt !== undefined) {
      dbUpdates.resolved_at = updates.resolvedAt;
    }

    const { data, error } = await supabase
      .from('help_requests')
      .update(dbUpdates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating help request:', error);
      throw error;
    }

    return dbToHelpRequest(data);
  }

  // Feedback Templates
  async getFeedbackTemplates(teacherId: string): Promise<FeedbackTemplate[]> {
    const { data, error } = await supabase
      .from('feedback_templates')
      .select('*')
      .eq('created_by', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback templates:', error);
      return [];
    }

    return (data || []).map(dbToFeedbackTemplate);
  }

  async createFeedbackTemplate(templateData: Omit<FeedbackTemplate, 'id' | 'createdAt'>): Promise<FeedbackTemplate> {
    const { data, error } = await supabase
      .from('feedback_templates')
      .insert({
        name: templateData.name,
        comment: templateData.comment,
        category: templateData.category,
        created_by: templateData.createdBy,
        created_at: Date.now()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback template:', error);
      throw error;
    }

    return dbToFeedbackTemplate(data);
  }
}

export const supabaseService = new SupabaseService();
