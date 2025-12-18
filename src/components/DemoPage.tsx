import React, { useState } from 'react';
import TeacherDashboard from './TeacherDashboard';
import StudentView from './StudentView';
import { LessonPlan, Unit, Student, Submission, Class } from '../types';
import { FaChalkboardUser, FaUserAstronaut, FaMoon, FaSun } from 'react-icons/fa6';

// Demo data
const DEMO_CLASS: Class = {
  id: 'demo-class',
  name: 'Introduction to Programming',
  period: 'Period 1',
  academicYear: '2024-2025',
  teacherId: 'demo-teacher',
  classCode: 'DEMO01',
  createdAt: Date.now(),
  defaultEditorType: 'p5'
};

const DEMO_UNIT_P5: Unit = {
  id: 'demo-unit-p5',
  classId: 'demo-class',
  title: 'Getting Started with p5.js',
  description: 'Learn the basics of creative coding with p5.js',
  order: 0,
  isLocked: false,
  isSequential: false
};

const DEMO_UNIT_SCRATCH: Unit = {
  id: 'demo-unit-scratch',
  classId: 'demo-class',
  title: 'Introduction to Scratch',
  description: 'Learn visual programming with Scratch blocks',
  order: 1,
  isLocked: false,
  isSequential: false
};

const DEMO_LESSON: LessonPlan = {
  id: 'demo-lesson',
  classId: 'demo-class',
  unitId: 'demo-unit',
  type: 'Lesson',
  topic: 'Drawing Shapes',
  title: 'Drawing Your First Shapes',
  difficulty: 'Beginner',
  objective: 'Learn how to draw basic shapes in p5.js',
  description: 'In this lesson, you\'ll learn how to use p5.js to draw circles, rectangles, and other basic shapes on the canvas.',
  theory: `# Drawing Shapes in p5.js

p5.js provides several functions to draw shapes on the canvas:

## Basic Shapes

- **circle(x, y, diameter)** - Draws a circle
- **rect(x, y, width, height)** - Draws a rectangle
- **ellipse(x, y, width, height)** - Draws an ellipse
- **line(x1, y1, x2, y2)** - Draws a line

## Color Functions

- **fill(r, g, b)** - Sets the fill color
- **stroke(r, g, b)** - Sets the stroke (outline) color
- **noFill()** - Removes fill
- **noStroke()** - Removes stroke

## Example

\`\`\`javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  fill(255, 0, 0); // Red
  circle(200, 200, 100); // Circle at center
}
\`\`\``,
  steps: [
    'Create a canvas using createCanvas(400, 400) in the setup() function',
    'Set the background color using background(220) in draw()',
    'Draw a circle at the center using circle(200, 200, 50)',
    'Add a fill color using fill(255, 0, 0) before drawing',
    'Draw a rectangle below the circle using rect(150, 250, 100, 50)'
  ],
  starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  // Your code here
}`,
  challenge: 'Create a simple scene with at least 3 different shapes (circle, rectangle, and one other shape) with different colors.',
  isAiGuided: true,
  tags: ['shapes', 'drawing', 'basics'],
  reflectionQuestion: 'What did you find most interesting about drawing shapes? What would you like to learn next?',
  editorType: 'p5'
};

const DEMO_LESSON_SCRATCH: LessonPlan = {
  id: 'demo-lesson-scratch',
  classId: 'demo-class',
  unitId: 'demo-unit-scratch',
  type: 'Lesson',
  topic: 'Making Sprites Move',
  title: 'Animate Your Sprite',
  difficulty: 'Beginner',
  objective: 'Learn how to make sprites move and interact in Scratch',
  description: 'In this lesson, you\'ll learn how to use motion blocks to make your sprite move around the stage and respond to keyboard input.',
  theory: `# Making Sprites Move in Scratch

Scratch uses visual blocks to control sprites (characters) on the stage. Here are the key concepts:

## Motion Blocks

- **move (10) steps** - Moves the sprite forward
- **turn right (15) degrees** - Rotates the sprite clockwise
- **turn left (15) degrees** - Rotates the sprite counter-clockwise
- **go to x: (0) y: (0)** - Moves sprite to specific coordinates
- **glide (1) secs to x: (0) y: (0)** - Smoothly moves sprite to position

## Control Blocks

- **when [flag] clicked** - Starts the script when green flag is clicked
- **forever** - Repeats blocks inside continuously
- **if then** - Runs blocks only if condition is true

## Sensing Blocks

- **key [space] pressed?** - Checks if a key is being pressed
- **touching [edge]?** - Checks if sprite is touching something

## Example

To make a sprite move with arrow keys:

1. Use "when flag clicked" to start
2. Use "forever" loop to continuously check for key presses
3. Use "if key [right arrow] pressed?" to detect input
4. Use "move (10) steps" to move the sprite

Try creating a sprite that moves in all four directions!`,
  steps: [
    'Click the green flag to start your project',
    'Add a "when flag clicked" block to start your script',
    'Add a "forever" loop to continuously check for input',
    'Inside the loop, add an "if key [right arrow] pressed?" block',
    'Add "move (10) steps" inside the if block to move right',
    'Repeat for left, up, and down arrow keys',
    'Test your sprite by pressing the arrow keys!'
  ],
  starterCode: '{}', // Empty Scratch project
  challenge: 'Create a sprite that moves in all four directions using arrow keys, and make it bounce off the edges of the stage.',
  isAiGuided: true,
  tags: ['motion', 'control', 'sensing', 'animation'],
  reflectionQuestion: 'What was the most interesting thing you learned about making sprites move? How could you use this in a game?',
  editorType: 'scratch'
};

const DEMO_STUDENTS: Student[] = [
  {
    id: 'demo-student-1',
    name: 'Alex Johnson',
    avatar: '👤',
    email: 'alex@demo.com',
    isActive: true
  },
  {
    id: 'demo-student-2',
    name: 'Sam Chen',
    avatar: '👤',
    email: 'sam@demo.com',
    isActive: true
  },
  {
    id: 'demo-student-3',
    name: 'Jordan Taylor',
    avatar: '👤',
    email: 'jordan@demo.com',
    isActive: true
  }
];

const DEMO_SUBMISSIONS: Submission[] = [
  {
    id: 'demo-submission-1',
    lessonId: 'demo-lesson',
    studentId: 'demo-student-1',
    classId: 'demo-class',
    code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(135, 206, 235); // Sky blue
  fill(255, 200, 0); // Yellow
  circle(200, 200, 100); // Sun
  fill(34, 139, 34); // Green
  rect(100, 300, 200, 100); // Ground
  fill(255, 0, 0); // Red
  rect(150, 250, 100, 50); // House
}`,
    status: 'Submitted',
    submittedAt: Date.now() - 86400000, // 1 day ago
    currentStep: 5,
    history: []
  }
];

interface DemoPageProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const DemoPage: React.FC<DemoPageProps> = ({ isDarkMode, onToggleTheme }) => {
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>('teacher');

  // Mock handlers that don't do anything (demo mode)
  const noop = () => {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 text-center text-sm font-medium">
        🎭 Demo Mode - This is a preview of CanvasClassroom. No login required.
      </div>

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
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
              DEMO
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('teacher')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'teacher'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FaChalkboardUser />
                Teacher
              </button>
              <button
                onClick={() => setViewMode('student')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'student'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FaUserAstronaut />
                Student
              </button>
            </div>

            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {viewMode === 'teacher' ? (
          <div className="container mx-auto px-4 py-8">
            <TeacherDashboard
              onAddLesson={noop}
              onUpdateLesson={noop}
              onDeleteLesson={noop}
              onAddUnit={noop}
              onUpdateUnit={noop}
              onMoveLesson={noop}
              onReorderUnits={noop}
              onReorderLesson={noop}
              onToggleLock={noop}
              onToggleSequential={noop}
              teacherId="demo-teacher"
              students={DEMO_STUDENTS}
              submissions={DEMO_SUBMISSIONS}
              lessons={[DEMO_LESSON, DEMO_LESSON_SCRATCH]}
              units={[DEMO_UNIT_P5, DEMO_UNIT_SCRATCH]}
              onGradeSubmission={noop}
              classId="demo-class"
              classCode="DEMO01"
              currentClass={DEMO_CLASS}
              classes={[DEMO_CLASS]}
              onSelectClass={noop}
              onCreateClass={noop}
              onUpdateClass={noop}
              onDeleteClass={noop}
              onCopyClassCode={noop}
            />
          </div>
        ) : (
          <StudentView
            lessons={[DEMO_LESSON, DEMO_LESSON_SCRATCH]}
            units={[DEMO_UNIT_P5, DEMO_UNIT_SCRATCH]}
            onSubmitLesson={noop}
            onUpdateProgress={noop}
            submissions={[]}
            className={DEMO_CLASS.name}
            classCode={DEMO_CLASS.classCode}
          />
        )}
      </main>
    </div>
  );
};

export default DemoPage;

