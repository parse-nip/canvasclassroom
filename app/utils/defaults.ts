import { Class, Unit, LessonPlan } from '../../types';

// Helper to create default class
export const createDefaultClass = (): Class => ({
  id: 'default-class',
  name: 'My First Class',
  period: 'Period 1',
  academicYear: new Date().getFullYear().toString(),
  teacherId: 'teacher1',
  classCode: '123456',
  createdAt: Date.now()
});

// Default Units with lock status and timestamps (will be scoped to class)
export const createDefaultUnits = (classId: string): Unit[] => [
  { id: 'u1', classId, title: 'Unit 1: Foundations', description: 'Core concepts of p5.js and drawing.', order: 0, isLocked: false, isSequential: true },
  { id: 'u2', classId, title: 'Unit 2: Interaction', description: 'Mouse and keyboard events.', order: 1, isLocked: true, isSequential: true },
  { id: 'u3', classId, title: 'Unit 3: Animation', description: 'Movement, velocity, and physics.', order: 2, isLocked: true, isSequential: true },
  { id: 'u4', classId, title: 'Unit 4: Future Tech', description: 'Advanced synthesis.', order: 3, isLocked: false, isSequential: true, availableAt: Date.now() + 86400000 * 7 }
];

// Default lessons (will be scoped to class)
export const createDefaultLessons = (classId: string, unitId: string): LessonPlan[] => [
  {
    id: '3',
    classId,
    unitId,
    type: 'Lesson',
    topic: 'Scratch Introduction',
    title: 'My First Scratch Project',
    difficulty: 'Beginner',
    objective: 'Learn to use Scratch blocks',
    description: 'Create your first animated sprite in Scratch.',
    theory: "**Welcome to Scratch!** \n\nScratch uses visual blocks instead of text code. \n- Drag blocks from the palette to the coding area\n- Connect blocks together to create scripts\n- Click the green flag to run your project",
    steps: [
      '[NEXT] Look at the Scratch editor. Notice the sprite in the center?',
      '[TEXT] What do you think the "when flag clicked" block does?',
      'Add a "move 10 steps" block to make the sprite move.',
      'Add a "say Hello!" block to make the sprite talk.',
      'Click the green flag to see your project run!'
    ],
    starterCode: '{}', // Empty Scratch project JSON
    challenge: 'Can you make the sprite move in a square pattern?',
    isAiGuided: true,
    tags: ['scratch', 'motion', 'events'],
    reflectionQuestion: 'How is Scratch different from text-based coding?',
    editorType: 'scratch'
  },
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
    reflectionQuestion: 'Why do we put the background() command inside the draw() function?',
    editorType: 'p5'
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
    tags: ['color', 'shapes'],
    editorType: 'p5'
  }
];

