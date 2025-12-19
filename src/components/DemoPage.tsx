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

const DEMO_LESSON_P5_BEGINNER: LessonPlan = {
  id: 'demo-lesson-p5-beginner',
  classId: 'demo-class',
  unitId: 'demo-unit-p5',
  type: 'Lesson',
  topic: 'Your First p5.js Program',
  title: 'Hello, p5.js!',
  difficulty: 'Beginner',
  objective: 'Understand the basics of p5.js and create your first interactive program',
  description: 'Welcome to p5.js! In this lesson, you\'ll learn what p5.js is, how it works, and create your very first program. We\'ll start with the fundamentals: understanding the canvas, coordinates, and the two essential functions every p5.js program needs.',
  theory: `# Welcome to p5.js!

p5.js is a JavaScript library that makes it easy to create interactive graphics, animations, and visualizations. Think of it as a digital canvas where you can draw, animate, and create!

## What is p5.js?

p5.js is like having a digital art studio in your browser. You write code to tell the computer what to draw, and it appears on your screen instantly.

## The Canvas

The **canvas** is your drawing area - like a piece of paper. When you create a canvas, you specify its width and height in pixels.

## The Coordinate System

In p5.js, the coordinate system works like this:
- **(0, 0)** is at the **top-left corner**
- **x** increases as you move **right**
- **y** increases as you move **down**

This is different from math class! In math, (0,0) is usually at the bottom-left, but in computer graphics, it's at the top-left.

## Two Essential Functions

Every p5.js program needs at least two functions:

### 1. setup()
This function runs **once** when your program starts. It's perfect for:
- Creating the canvas
- Setting initial values
- Things that only need to happen once

\`\`\`javascript
function setup() {
  createCanvas(400, 400); // Creates a 400x400 pixel canvas
}
\`\`\`

### 2. draw()
This function runs **continuously** (about 60 times per second!). It's perfect for:
- Drawing shapes
- Creating animations
- Things that need to update constantly

\`\`\`javascript
function draw() {
  background(220); // Light gray background
  // Your drawing code goes here
}
\`\`\`

## Your First Shape: The Circle

To draw a circle, use: \`circle(x, y, diameter)\`

- **x, y**: The center point of the circle
- **diameter**: How wide the circle is

## Colors in p5.js

Colors are specified using RGB (Red, Green, Blue) values from 0-255:
- \`fill(255, 0, 0)\` = Red (full red, no green, no blue)
- \`fill(0, 255, 0)\` = Green
- \`fill(0, 0, 255)\` = Blue
- \`fill(255, 255, 255)\` = White
- \`fill(0, 0, 0)\` = Black

## Example: Your First Program

\`\`\`javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(135, 206, 235); // Sky blue background
  fill(255, 200, 0); // Yellow fill
  circle(200, 200, 100); // Circle at center, 100 pixels wide
}
\`\`\`

## Questions to Think About

1. **Why do we need both setup() and draw()?** What would happen if we put everything in setup()?
2. **What happens if you draw multiple shapes?** Try drawing a circle, then a rectangle - which one appears on top?
3. **How does the coordinate system work?** If you want to draw something in the bottom-right corner of a 400x400 canvas, what coordinates would you use?`,
  steps: [
    'Create your canvas in the setup() function using createCanvas(400, 400). This creates a 400 pixel by 400 pixel drawing area. Think about it: Why do we create the canvas in setup() instead of draw()?',
    'In the draw() function, set a background color using background(220). This gives you a light gray canvas. Experiment: What happens if you don\'t call background() in draw()? Try removing it and see what happens!',
    'Draw your first circle at the center of the canvas using circle(200, 200, 50). The center of a 400x400 canvas is at (200, 200). Question: What do the three numbers in circle(200, 200, 50) represent?',
    'Add color to your circle! Before drawing the circle, use fill(255, 0, 0) to make it red. Challenge: What color would fill(128, 128, 128) create? Why?',
    'Draw a second shape - a rectangle using rect(150, 250, 100, 50). This draws a rectangle at x=150, y=250, with width=100 and height=50. Think: Why does the rectangle appear below the circle even though we drew the circle first?'
  ],
  starterCode: `function setup() {
  // Create your canvas here
  // Hint: use createCanvas(400, 400)
}

function draw() {
  // Set your background here
  // Hint: use background(220)
  
  // Draw your first shape here!
  // Hint: try circle(200, 200, 50)
}`,
  challenge: 'Create a simple scene with at least 3 different shapes (circle, rectangle, and one other shape) with different colors. Can you make it look like something recognizable - like a house, a face, or a landscape?',
  isAiGuided: true,
  tags: ['beginner', 'basics', 'introduction', 'shapes'],
  reflectionQuestion: 'What surprised you about how p5.js works? Did you expect programming to be different? What would you like to learn how to animate or make interactive next?',
  editorType: 'p5'
};

const DEMO_LESSON: LessonPlan = {
  id: 'demo-lesson',
  classId: 'demo-class',
  unitId: 'demo-unit-p5',
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
  objective: 'Learn how to make sprites move and interact in Scratch using visual programming blocks',
  description: 'Welcome to Scratch! In this lesson, you\'ll learn how to bring your sprite to life by making it move around the stage. You\'ll discover how Scratch uses visual blocks instead of text code, and learn the fundamental concepts of events, loops, and conditional statements.',
  theory: `# Making Sprites Move in Scratch

Scratch is a visual programming language where you snap together colorful blocks instead of typing code. This makes programming more intuitive and fun!

## What is a Sprite?

A **sprite** is any character or object on the stage (the white area where your project runs). The cat you see when you start Scratch is a sprite. You can add more sprites, change their appearance, and make them do things!

## Understanding the Stage

The **stage** is like a coordinate system:
- The center is at **(0, 0)**
- **x** ranges from **-240 to 240** (left to right)
- **y** ranges from **-180 to 180** (bottom to top)

This is different from p5.js! In Scratch, (0,0) is in the center, and y increases upward.

## Motion Blocks - Making Things Move

Motion blocks control where your sprite is and how it moves:

- **move (10) steps** - Moves the sprite forward in the direction it's facing. Think of it like walking forward!
- **turn right (15) degrees** - Rotates the sprite clockwise (to the right)
- **turn left (15) degrees** - Rotates the sprite counter-clockwise (to the left)
- **go to x: (0) y: (0)** - Instantly teleports the sprite to specific coordinates
- **glide (1) secs to x: (0) y: (0)** - Smoothly moves the sprite to a position over time

**Important**: The "steps" in "move (10) steps" refers to pixels. 10 steps = 10 pixels forward.

## Control Blocks - The Logic of Your Program

Control blocks determine when and how often your code runs:

- **when [flag] clicked** - This is an **event** block. It starts your script when you click the green flag (the play button). Every script needs a starting point!
- **forever** - This is a **loop** block. It repeats the blocks inside it continuously, over and over again. This is essential for checking for keyboard input!
- **if then** - This is a **conditional** block. It only runs the blocks inside if a condition is true. Like: "If the right arrow is pressed, then move right."

## Sensing Blocks - Detecting Input

Sensing blocks check what's happening:

- **key [space] pressed?** - Returns true if a specific key is currently being pressed. You can choose any key from a dropdown menu.
- **touching [edge]?** - Checks if the sprite is touching the edge of the stage (or another sprite).

## How It All Works Together

To make a sprite move with arrow keys, you need to:

1. **Start the script** with "when flag clicked" - This tells Scratch: "When the user clicks play, start running this code."
2. **Create a loop** with "forever" - This tells Scratch: "Keep checking for key presses over and over again."
3. **Check for input** with "if key [right arrow] pressed?" - This asks: "Is the right arrow key being pressed right now?"
4. **Move the sprite** with "move (10) steps" - If the key IS pressed, move the sprite forward.

## Why Do We Need "forever"?

Without the "forever" loop, Scratch would check for key presses only once when the green flag is clicked. The sprite would move once and then stop. The "forever" loop makes Scratch continuously check: "Is the key pressed? Is the key pressed? Is the key pressed?" - 60 times per second!

## Example: Moving Right

Here's how to make your sprite move right when you press the right arrow:

1. Start with "when flag clicked"
2. Add a "forever" loop
3. Inside the loop, add "if key [right arrow] pressed?"
4. Inside the "if" block, add "point in direction (90)" (90 degrees = right)
5. Then add "move (10) steps"

**Question to think about**: Why do we need to point in direction (90) before moving? What happens if you skip this step?

## Moving in All Directions

To move in all four directions, you'll need four separate "if" blocks inside your "forever" loop:
- One for right arrow → point in direction (90), move
- One for left arrow → point in direction (-90), move
- One for up arrow → point in direction (0), move
- One for down arrow → point in direction (180), move

## Questions to Think About

1. **Why do we use "forever" instead of just checking once?** What would happen if you removed the "forever" block?
2. **What's the difference between "move (10) steps" and "glide (1) secs to x: (0) y: (0)"?** When would you use each one?
3. **How does Scratch know which direction is "forward" for your sprite?** Try rotating your sprite and then moving it - what happens?
4. **What happens if you press two arrow keys at the same time?** Try it and observe the behavior!`,
  steps: [
    'Click the green flag to start your project. Notice how nothing happens yet - that\'s because we haven\'t added any code blocks! Question: Why do you think Scratch needs a "start" button instead of running automatically?',
    'Add a "when flag clicked" block to start your script. This is an event block - it tells Scratch "when this event happens, run the code below." Think about it: What other events could start a script? (Hint: look for other blocks that start with "when...")',
    'Add a "forever" loop block below "when flag clicked". This creates a loop that runs continuously. Important: Why do we need this loop? What would happen if we tried to check for key presses without it?',
    'Inside the "forever" loop, add an "if then" block. This is a conditional statement - it only runs code if a condition is true. Question: Can you think of real-life examples of "if-then" logic? (Example: "If it\'s raining, then bring an umbrella.")',
    'Inside the "if then" block, add a sensing block: "key [right arrow] pressed?". This checks if the right arrow key is being pressed. Experiment: What happens if you change this to check for a different key?',
    'Now add a motion block inside the "if" block: "point in direction (90)". The number 90 means 90 degrees, which is to the right. Challenge: What direction would 0 degrees be? What about 180 degrees?',
    'Add "move (10) steps" after the "point in direction" block. This moves the sprite 10 pixels forward in the direction it\'s facing. Try changing the number - what happens if you use 5? What about 50?',
    'Test your code! Click the green flag and press the right arrow key. Does your sprite move? If not, check that all blocks are connected properly.',
    'Now add three more "if then" blocks inside your "forever" loop for the left, up, and down arrow keys. For each: use "point in direction" with the correct angle, then "move (10) steps". Hint: left = -90, up = 0, down = 180.',
    'Test all four directions! Click the green flag and try pressing each arrow key. Does your sprite move smoothly in all directions?',
    'Bonus challenge: Add edge detection! Inside each "if" block, add another "if" block that checks "touching [edge]?" and makes the sprite bounce or turn around when it hits the edge.'
  ],
  starterCode: '{}', // Empty Scratch project
  challenge: 'Create a sprite that moves smoothly in all four directions using arrow keys. Then, make it bounce off the edges of the stage when it reaches them. Can you also add a visual effect, like making the sprite change color or size when it moves?',
  isAiGuided: true,
  tags: ['motion', 'control', 'sensing', 'animation', 'events', 'loops', 'conditionals'],
  reflectionQuestion: 'What was the most interesting thing you learned about making sprites move? How does the "forever" loop make your program interactive? Can you think of a game or animation you could create using these concepts? What would you like to learn next - maybe making sprites interact with each other, or creating sounds and visual effects?',
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
              lessons={[DEMO_LESSON_P5_BEGINNER, DEMO_LESSON, DEMO_LESSON_SCRATCH]}
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
            lessons={[DEMO_LESSON_P5_BEGINNER, DEMO_LESSON, DEMO_LESSON_SCRATCH]}
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

