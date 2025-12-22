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
  topic: 'Your First Shapes and Colors',
  title: 'Drawing Shapes and Colors in p5.js',
  difficulty: 'Beginner',
  objective: 'Learn what p5.js is and how to draw your first shapes with colors',
  description: 'Welcome to p5.js! Learn how to draw circles, rectangles, and other shapes, and discover how computers create colors using numbers.',
  theory: `# Welcome to p5.js!

p5.js is a tool that lets you create art and animations using code. Think of it like digital drawing, but instead of using a paintbrush, you write instructions!

## What is a Canvas?

Your **canvas** is like a digital piece of paper. The code \`createCanvas(400, 400)\` creates a drawing space that is 400 pixels wide and 400 pixels tall.

## Understanding Coordinates (Where Things Go)

Your canvas uses a coordinate system to tell shapes WHERE to appear:

- **X** = horizontal position (left to right)
- **Y** = vertical position (top to bottom)
- The **top-left corner** is (0, 0)
- Moving right increases X
- Moving down increases Y

**Example:** In a 400x400 canvas:
- Top-left corner: (0, 0)
- Center: (200, 200)
- Bottom-right corner: (400, 400)

## Drawing Your First Shape: circle()

The \`circle()\` function draws a circle. It needs THREE numbers:

\`circle(x, y, diameter)\`

- **x** = Where horizontally (left/right position)
- **y** = Where vertically (up/down position)  
- **diameter** = How big the circle is (the width across)

**Example:** \`circle(200, 200, 100)\`
- x = 200 (center horizontally)
- y = 200 (center vertically)
- diameter = 100 (100 pixels wide)

## Drawing Rectangles: rect()

The \`rect()\` function draws a rectangle. It needs FOUR numbers:

\`rect(x, y, width, height)\`

- **x** = Where to start (left edge position)
- **y** = Where to start (top edge position)
- **width** = How wide the rectangle is
- **height** = How tall the rectangle is

**Example:** \`rect(100, 150, 200, 100)\`
- x = 100 (starts 100 pixels from left)
- y = 150 (starts 150 pixels from top)
- width = 200 (200 pixels wide)
- height = 100 (100 pixels tall)

## Adding Colors: fill()

Before drawing a shape, you can set its color using \`fill()\`. Colors use THREE numbers called RGB:

\`fill(red, green, blue)\`

Each number goes from 0 to 255:
- **0** = none of that color
- **255** = maximum of that color

**What do the numbers mean?**
- First number = **Red** (how much red light)
- Second number = **Green** (how much green light)
- Third number = **Blue** (how much blue light)

**Color Examples:**
- \`fill(255, 0, 0)\` = Pure Red (all red, no green, no blue)
- \`fill(0, 255, 0)\` = Pure Green (no red, all green, no blue)
- \`fill(0, 0, 255)\` = Pure Blue (no red, no green, all blue)
- \`fill(255, 255, 0)\` = Yellow (red + green = yellow!)
- \`fill(255, 165, 0)\` = Orange (lots of red, some green)
- \`fill(0, 0, 0)\` = Black (no colors = black)
- \`fill(255, 255, 255)\` = White (all colors = white)

**Important:** Once you use \`fill()\`, ALL shapes drawn after it will be that color until you change it!

## Background Color

\`background()\` fills the entire canvas with one color. You can use:
- One number: \`background(220)\` = gray (0-255 scale)
- Three numbers: \`background(135, 206, 235)\` = sky blue (RGB)

## The Two Main Functions

Every p5.js program has two main parts:

1. **setup()** - Runs ONCE when your program starts
   - Use this to create your canvas: \`createCanvas(400, 400)\`

2. **draw()** - Runs OVER and OVER (60 times per second!)
   - Use this to draw shapes: \`circle()\`, \`rect()\`, etc.`,
  steps: [
    '[TEXT] Look at the code. What do you see? There are two functions: setup() and draw()',
    '[CHOICE] What do the two numbers in createCanvas(400, 400) represent? | A: Width and height | B: X and Y position | C: Red and green colors | D: Speed and direction | A',
    '[TEXT] Run the code. What do you see on the screen?',
    '[TEXT] Look at circle(200, 200, 100). What do you think each number means?',
    '[CODE] Write code to draw a circle at position (100, 150) with diameter 80',
    '[CHOICE] In circle(200, 200, 100), what does the third number (100) represent? | A: X position | B: Y position | C: Diameter (size) | D: Color | C',
    'Change the first number in circle() from 200 to 100. What happens?',
    '[TEXT] What did changing that number do? (Hint: it changed the X position)',
    'Change the third number in circle() from 100 to 50. What happens?',
    '[TEXT] What did changing that number do? (Hint: it changed the size)',
    '[CODE] Add a fill() function before the circle to make it red. Use fill(255, 0, 0)',
    '[CHOICE] What color does fill(255, 0, 0) create? | A: Green | B: Blue | C: Red | D: Yellow | C',
    '[TEXT] What color appears? What do you think fill(255, 0, 0) means?',
    '[CODE] Change the fill color to green using fill(0, 255, 0)',
    '[TEXT] What color is this?',
    '[CODE] Add a rectangle using rect(150, 250, 100, 50)',
    '[CHOICE] In rect(150, 250, 100, 50), what do the last two numbers (100, 50) represent? | A: X and Y position | B: Width and height | C: Color values | D: Speed and direction | B',
    '[TEXT] What do you see? What do you think each number in rect(150, 250, 100, 50) means?',
    '[CODE] Change the background color to sky blue using background(135, 206, 235)',
    '[CHOICE] What does background() do? | A: Changes one shape\'s color | B: Fills the entire canvas with a color | C: Moves shapes | D: Creates a new canvas | B',
    '[CODE] Draw another circle in a different position with a different color'
  ],
  starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Draw a circle
  circle(200, 200, 100);
}`,
  challenge: 'Create a simple picture using at least 3 shapes (circles, rectangles, or both) with at least 3 different colors. Try making a house, a face, or something creative!',
  isAiGuided: true,
  tags: ['shapes', 'drawing', 'colors', 'rgb', 'basics', 'beginner'],
  reflectionQuestion: 'What was confusing at first? What do the numbers in circle() and rect() mean now? How did you figure out where to place shapes? What would you like to learn next?',
  editorType: 'p5'
};

const DEMO_LESSON_SCRATCH: LessonPlan = {
  id: 'demo-lesson-scratch',
  classId: 'demo-class',
  unitId: 'demo-unit-scratch',
  type: 'Lesson',
  topic: 'Moving Your First Sprite',
  title: 'Getting Started with Scratch: Making Sprites Move',
  difficulty: 'Beginner',
  objective: 'Learn what Scratch is and how to make your sprite move around the stage',
  description: 'Welcome to Scratch! Learn how to use blocks to make your sprite move, turn, and explore the stage.',
  theory: `# Welcome to Scratch!

Scratch is a visual programming language where you create programs by snapping together colorful blocks - like building with LEGO bricks!

## What is a Sprite?

A **sprite** is a character or object that you can program. When you start Scratch, you'll see a cat sprite on the stage. You can make it move, change, and do all sorts of things!

## What is the Stage?

The **stage** is where your sprites live and move around. It's like a digital playground!

- The stage has coordinates (like a map)
- **X** goes left (-240) to right (+240)
- **Y** goes bottom (-180) to top (+180)
- The **center** is at (0, 0)

## Your First Block: "when flag clicked"

Every Scratch program needs to START somewhere. The **"when flag clicked"** block is how you begin!

- Click the green flag at the top of the screen
- Any blocks connected to "when flag clicked" will run
- This is like pressing "play" on your program

## Making Your Sprite Move

Look for the **Motion** blocks (they're blue). Here are the most important ones:

### move (10) steps
- Moves your sprite forward in whatever direction it's facing
- The number tells it how many steps to move
- Try changing 10 to 20 - it moves twice as far!

### turn right (15) degrees
- Rotates your sprite clockwise (to the right)
- The number tells it how many degrees to turn
- 90 degrees = quarter turn
- 360 degrees = full circle

### turn left (15) degrees
- Rotates your sprite counter-clockwise (to the left)
- Same idea as turn right, but opposite direction

### go to x: (0) y: (0)
- Instantly moves your sprite to a specific position
- The first number is X (left/right)
- The second number is Y (up/down)

### change x by (10)
- Moves your sprite left or right
- Positive number = move right
- Negative number = move left

### change y by (10)
- Moves your sprite up or down
- Positive number = move up
- Negative number = move down

## Making Things Repeat: "forever"

The **"forever"** block (found in the Control section, orange blocks) makes code repeat over and over!

- Put blocks inside "forever"
- They'll keep running until you stop the program
- This is how you make continuous movement

**Example:**
- "when flag clicked" → "forever" → "move (10) steps"
- This makes your sprite keep moving forward forever!

## Understanding Directions

Your sprite has a direction it's facing:
- **0 degrees** = pointing up
- **90 degrees** = pointing right
- **180 degrees** = pointing down
- **-90 degrees** = pointing left

You can change direction with:
- **point in direction (90)** - Points sprite in a specific direction
- **turn right/left** - Rotates from current direction

## Tips for Beginners

1. **Start simple** - Try just one block first, then add more
2. **Click the green flag** - This runs your code
3. **Click the red stop sign** - This stops your code
4. **Experiment** - Change the numbers and see what happens!
5. **Blocks snap together** - Drag blocks near each other and they'll connect

## Common First Steps

1. Click "when flag clicked" block (Events section, yellow)
2. Add "move (10) steps" (Motion section, blue)
3. Click the green flag
4. Watch your sprite move!

Try adding "turn right (90) degrees" after moving to make it turn!`,
  steps: [
    '[TEXT] Look at the Scratch interface. Do you see the cat sprite on the stage?',
    '[CHOICE] What is a sprite in Scratch? | A: A type of block | B: A character or object you can program | C: The background | D: A sound effect | B',
    '[TEXT] What do you think a "sprite" is?',
    'Find the "Motion" blocks (blue blocks)',
    '[TEXT] What blocks do you see there?',
    '[CODE] Drag a "move (10) steps" block to the coding area',
    '[CHOICE] In "move (10) steps", what does the number 10 represent? | A: Direction | B: Speed | C: How many steps to move | D: Color | C',
    '[TEXT] What do you think the number "10" means in "move (10) steps"?',
    'Click the green flag at the top',
    '[TEXT] What happens? Why did the sprite only move once?',
    '[CODE] Add a "when flag clicked" block (yellow, Events section) and connect it above "move (10) steps"',
    'Click the green flag again',
    '[CHOICE] What does "when flag clicked" do? | A: Stops the program | B: Starts the program when you click the green flag | C: Changes the sprite\'s color | D: Moves the sprite | B',
    '[TEXT] What happens now? What did "when flag clicked" do?',
    '[CODE] Change the number in "move (10) steps" to 50. Click the flag',
    '[TEXT] What\'s different?',
    '[CODE] Add a "turn right (90) degrees" block after "move (10) steps"',
    'Click the flag',
    '[CHOICE] How many degrees make a full circle? | A: 90 | B: 180 | C: 270 | D: 360 | D',
    '[TEXT] What does your sprite do now? What happens if you change 90 to 180? What about 360?',
    '[CODE] Add a "forever" block (orange, Control section) around your motion blocks',
    'Click the flag',
    '[CHOICE] What does the "forever" block do? | A: Runs code once | B: Repeats code over and over | C: Stops the program | D: Changes the sprite | B',
    '[TEXT] What happens now? What does "forever" do? Why does the sprite keep moving?',
    '[CODE] Try "change x by (10)" instead of "move (10) steps"',
    '[CHOICE] What does "change x by (10)" do? | A: Moves sprite up | B: Moves sprite down | C: Moves sprite left or right | D: Changes sprite size | C',
    '[TEXT] What\'s different?',
    '[CODE] Experiment! Try different numbers and different blocks',
    '[TEXT] What can you make your sprite do?'
  ],
  starterCode: '{}', // Empty Scratch project - start from scratch!
  challenge: 'Make your sprite move in a square pattern! Use "move" and "turn" blocks to make it go forward, turn, forward, turn, and repeat. Can you make it go around the stage?',
  isAiGuided: true,
  tags: ['motion', 'basics', 'beginner', 'sprites', 'movement', 'scratch-intro'],
  reflectionQuestion: 'What was the hardest part about getting started? What do you think "steps" and "degrees" mean now? What would you like to make your sprite do next?',
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

