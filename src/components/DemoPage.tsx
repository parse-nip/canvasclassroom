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
  unitId: 'demo-unit-p5',
  type: 'Lesson',
  topic: 'Creating Colorful Art with Shapes',
  title: 'Rainbow Robot: Drawing with p5.js',
  difficulty: 'Beginner',
  objective: 'Learn to draw shapes and use RGB colors to create colorful digital art',
  description: 'Create a friendly robot character using basic shapes and learn how computers mix colors using Red, Green, and Blue values.',
  theory: `# Creating Art with Shapes and Colors

Think of your canvas like a digital piece of paper. You can draw shapes anywhere on it!

## The Coordinate System

Your canvas is like a graph:
- **X** goes left-to-right (horizontal)
- **Y** goes top-to-bottom (vertical)
- The top-left corner is **(0, 0)**
- The center of a 400x400 canvas is **(200, 200)**

## Drawing Shapes

- **circle(x, y, diameter)** - Draws a perfect circle
  - Example: \`circle(200, 200, 100)\` draws a circle at center with diameter 100
- **rect(x, y, width, height)** - Draws a rectangle
  - Example: \`rect(150, 250, 100, 50)\` draws a rectangle starting at (150, 250) that's 100 wide and 50 tall
- **ellipse(x, y, width, height)** - Draws an ellipse (oval)
- **triangle(x1, y1, x2, y2, x3, y3)** - Draws a triangle using three points

## RGB Color System

Computers mix colors using three values:
- **R**ed (0-255) - How much red light
- **G**reen (0-255) - How much green light  
- **B**lue (0-255) - How much blue light

**Common Colors:**
- \`fill(255, 0, 0)\` = Pure Red 🔴
- \`fill(0, 255, 0)\` = Pure Green 🟢
- \`fill(0, 0, 255)\` = Pure Blue 🔵
- \`fill(255, 255, 0)\` = Yellow (Red + Green) 🟡
- \`fill(255, 165, 0)\` = Orange 🟠
- \`fill(255, 192, 203)\` = Pink 💗

**Important:** \`fill()\` sets the color for ALL shapes drawn after it, until you change it again!

## Drawing Order Matters!

Shapes are drawn in order - later shapes appear on top of earlier ones. Think of it like stacking paper cutouts!`,
  steps: [
    '[NEXT] Run the code and look at the robot. What shapes do you see?',
    '[TEXT] What color is the robot\'s head? What RGB values create that color?',
    'Change the head color to blue by modifying the fill() before the circle',
    '[TEXT] If you wanted to make the robot\'s body yellow, what RGB values would you use?',
    'Add a second circle for the robot\'s other eye at position (250, 150)',
    'Draw a rectangle for the robot\'s mouth below the eyes',
    '[TEXT] Why does the mouth appear on top of the head? (Hint: think about drawing order)',
    'Change the background color to a sky blue: background(135, 206, 235)',
    'Add two rectangles for robot arms on the sides of the body'
  ],
  starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  // Sky blue background
  background(135, 206, 235);
  
  // Robot head (circle)
  fill(200, 200, 200); // Light gray
  circle(200, 150, 120);
  
  // Robot body (rectangle)
  fill(100, 150, 255); // Blue
  rect(150, 200, 100, 120);
  
  // Robot eye (circle)
  fill(255, 255, 255); // White
  circle(180, 150, 30);
  
  // Eye pupil (small black circle)
  fill(0, 0, 0); // Black
  circle(180, 150, 15);
  
  // Add more robot parts here!
}`,
  challenge: 'Create your own unique robot character! Add: 2 eyes, a mouth, 2 arms, 2 legs, and antennas. Use at least 5 different colors. Make it creative - maybe a robot superhero or robot pet!',
  isAiGuided: true,
  tags: ['shapes', 'drawing', 'colors', 'rgb', 'creative'],
  reflectionQuestion: 'What was the trickiest part about positioning shapes? How did you figure out where to place each part? If you could add one more feature to your robot, what would it be and why?',
  editorType: 'p5'
};

const DEMO_LESSON_SCRATCH: LessonPlan = {
  id: 'demo-lesson-scratch',
  classId: 'demo-class',
  unitId: 'demo-unit-scratch',
  type: 'Lesson',
  topic: 'Interactive Sprite Control',
  title: 'Create Your Own Game Controller',
  difficulty: 'Beginner',
  objective: 'Learn to control sprites with keyboard input and create smooth, responsive movement',
  description: 'Build an interactive sprite that responds to your keyboard commands, learning how events, loops, and conditionals work together to create game-like controls.',
  theory: `# Controlling Sprites with Keyboard Input

In Scratch, sprites are characters that can move, change, and interact! Today you'll learn to control them like a video game character.

## Understanding the Stage

The Scratch stage is like a coordinate grid:
- **X-axis**: Left (-240) to Right (+240)
- **Y-axis**: Bottom (-180) to Top (+180)
- **Center**: (0, 0)

## Key Concepts

### 1. Events - Starting Your Code
- **when [flag] clicked** - Runs code when you click the green flag
- This is how you START your program!

### 2. Control Blocks - Making Things Repeat
- **forever** - Repeats blocks inside continuously (like a game loop)
- This keeps checking for input over and over
- **if then** - Only runs code when a condition is true

### 3. Motion Blocks - Moving Your Sprite
- **move (10) steps** - Moves forward in the direction the sprite is facing
- **turn right (15) degrees** - Rotates clockwise
- **turn left (15) degrees** - Rotates counter-clockwise
- **point in direction (90)** - Points sprite in a specific direction (0=up, 90=right, 180=down, -90=left)

### 4. Sensing Blocks - Detecting Input
- **key [space] pressed?** - Checks if a key is currently being pressed
- Returns true (pressed) or false (not pressed)
- Use this inside an **if** block to check for input

## The Pattern for Keyboard Control

Here's the secret pattern for smooth keyboard control:

1. **Start with "when flag clicked"** - Begin your program
2. **Add "forever" loop** - Keep checking for input continuously
3. **Inside forever, add "if key [arrow] pressed?"** - Check each key
4. **Inside if, add motion blocks** - Move when key is pressed

## Why Use "forever"?

Without "forever", your code would only check for keys ONCE. With "forever", it checks 30 times per second, making movement feel smooth and responsive - just like a real game!

## Direction Tips

- **Right Arrow**: Use "point in direction (90)" then "move (10) steps"
- **Left Arrow**: Use "point in direction (-90)" then "move (10) steps"  
- **Up Arrow**: Use "point in direction (0)" then "move (10) steps"
- **Down Arrow**: Use "point in direction (180)" then "move (10) steps"

Or use "change x by" and "change y by" for direct movement!

## Edge Detection

- **touching [edge]?** - Checks if sprite hit the edge
- Use this to make sprites bounce or stop at boundaries

**Pro Tip:** You can combine multiple "if" blocks inside "forever" to check all arrow keys at once!`,
  steps: [
    '[NEXT] Click the green flag. What happens? Why does the sprite only move once?',
    '[TEXT] What block do you need to make the sprite keep checking for keyboard input?',
    'Add a "forever" loop around your motion blocks',
    'Click the green flag again. What\'s different now?',
    '[TEXT] Why does "forever" make the movement feel smoother?',
    'Add an "if key [right arrow] pressed?" block inside the forever loop',
    'Put "change x by (10)" inside the if block',
    '[TEXT] What happens when you hold down the right arrow key?',
    'Add three more "if" blocks for left arrow (change x by -10), up arrow (change y by 10), and down arrow (change y by -10)',
    'Test all four arrow keys. Does your sprite move smoothly in all directions?',
    '[TEXT] What would happen if you removed the "forever" loop? Why?',
    'Add "if touching [edge]?" then "turn around (180 degrees)" to make your sprite bounce off walls'
  ],
  starterCode: '{}', // Empty Scratch project - students start from scratch!
  challenge: 'Create a complete game controller! Make your sprite: 1) Move smoothly with arrow keys, 2) Bounce off all four edges, 3) Change color when you press the spacebar, 4) Make a sound when it hits an edge. Bonus: Add a second sprite that follows your first sprite!',
  isAiGuided: true,
  tags: ['motion', 'control', 'sensing', 'events', 'interactive', 'game-development'],
  reflectionQuestion: 'What was the most important concept you learned about how games work? How does the "forever" loop make your sprite feel more responsive? If you were making a real game, what other controls or features would you add?',
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
  const [demoSubmissions, setDemoSubmissions] = useState<Submission[]>([]);

  // Mock handlers for demo mode
  const noop = () => {};

  // Handle progress updates locally for demo mode
  const handleDemoUpdateProgress = (lessonId: string, code: string, step: number, historyItem?: { stepIndex: number; studentInput: string; feedback: string; passed: boolean }) => {
    setDemoSubmissions(prev => {
      const existing = prev.find(s => s.lessonId === lessonId);
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
        return prev.map(s => s.lessonId === lessonId ? { ...s, code, currentStep: step, history: updatedHistory } : s);
      } else {
        return [...prev, {
          id: `demo-sub-${Date.now()}`,
          lessonId,
          studentId: 'demo-student',
          classId: 'demo-class',
          code,
          status: 'Draft' as const,
          currentStep: step,
          history: updatedHistory
        }];
      }
    });
  };

  const handleDemoSubmitLesson = (lessonId: string, code: string, textAnswer?: string) => {
    setDemoSubmissions(prev => {
      const existing = prev.find(s => s.lessonId === lessonId);
      if (existing) {
        return prev.map(s => s.lessonId === lessonId ? { ...s, code, status: 'Submitted' as const, textAnswer, submittedAt: Date.now() } : s);
      }
      return [...prev, {
        id: `demo-sub-${Date.now()}`,
        lessonId,
        studentId: 'demo-student',
        classId: 'demo-class',
        code,
        status: 'Submitted' as const,
        currentStep: 0,
        textAnswer,
        submittedAt: Date.now(),
        history: []
      }];
    });
  };

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
            onSubmitLesson={handleDemoSubmitLesson}
            onUpdateProgress={handleDemoUpdateProgress}
            submissions={demoSubmissions}
            className={DEMO_CLASS.name}
            classCode={DEMO_CLASS.classCode}
          />
        )}
      </main>
    </div>
  );
};

export default DemoPage;

