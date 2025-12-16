import { CurriculumUnitRequest } from '../types';

export interface FullLessonContent {
    unitIndex: number;
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

export interface CurriculumTemplate {
    id: string;
    name: string;
    level: string;
    theme: string;
    duration: string;
    description: string;
    goals: string[];
    units: CurriculumUnitRequest[];
    lessons: FullLessonContent[];
}

export const CURRICULUM_TEMPLATES: CurriculumTemplate[] = [
    {
        id: 'beginner-creative',
        name: 'Creative Coding Foundations',
        level: 'Beginner (Grades 5-6)',
        theme: 'Art and Animation',
        duration: 'Semester',
        description: 'Perfect first course: shapes, colors, animation basics through creative projects',
        goals: ['Basic shapes & coordinates', 'Color theory', 'Simple animations', 'Mouse interaction'],
        units: [
            { title: 'Drawing Basics', description: 'Learn to draw shapes and use the coordinate system', order: 0 },
            { title: 'Colors & Patterns', description: 'Explore color theory and create beautiful patterns', order: 1 },
            { title: 'Movement & Animation', description: 'Make things move and animate on screen', order: 2 },
            { title: 'Interactive Art', description: 'Create art that responds to mouse and keyboard', order: 3 }
        ],
        lessons: [
            // Unit 0: Drawing Basics
            {
                unitIndex: 0,
                title: 'Your First Canvas',
                topic: 'Setup & Canvas',
                objective: 'Create a canvas and understand coordinates',
                difficulty: 'Beginner',
                description: 'Learn how to create your first p5.js canvas and understand the coordinate system',
                theory: `**Welcome to p5.js!**

Think of the canvas like a piece of graph paper:
- **X** goes left-to-right (horizontal)
- **Y** goes up-and-down (vertical)
- The top-left corner is (0, 0)

The \`createCanvas()\` function creates your drawing space. The two numbers are width and height in pixels.`,
                steps: [
                    '[NEXT] Look at the code. What do you see in setup()?',
                    '[TEXT] What do the two numbers in createCanvas() mean?',
                    'Change the canvas size to 600 by 600',
                    'Try making it really wide: 800 by 200'
                ],
                starterCode: `function setup() {
  // This creates our drawing space
  createCanvas(400, 400);
}

function draw() {
  // Light gray background
  background(220);
}`,
                challenge: 'Make a canvas that is 500 pixels wide and 300 pixels tall',
                tags: ['canvas', 'setup', 'coordinates']
            },
            {
                unitIndex: 0,
                title: 'Drawing Shapes',
                topic: 'Basic Shapes',
                objective: 'Use rect(), ellipse(), and triangle()',
                difficulty: 'Beginner',
                description: 'Draw rectangles, circles, and triangles on your canvas',
                theory: `**Basic Shapes in p5.js**

p5.js has functions for drawing shapes:
- \`rect(x, y, width, height)\` - draws a rectangle
- \`ellipse(x, y, width, height)\` - draws a circle/oval
- \`triangle(x1, y1, x2, y2, x3, y3)\` - draws a triangle

The x and y tell the shape WHERE to be drawn. The width and height tell it HOW BIG to be.`,
                steps: [
                    '[NEXT] Run the code and see the square',
                    'Add an ellipse at position (300, 200) with size 100, 100',
                    'Draw a triangle using three points',
                    '[TEXT] What happens if you change the rect() numbers?'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Draw a rectangle
  // rect(x, y, width, height)
  rect(150, 150, 100, 100);
}`,
                challenge: 'Draw a house using rectangles for the walls and a triangle for the roof!',
                tags: ['shapes', 'rect', 'ellipse', 'triangle']
            },
            {
                unitIndex: 0,
                title: 'Lines and Points',
                topic: 'Lines',
                objective: 'Draw lines and points to create designs',
                difficulty: 'Beginner',
                description: 'Use lines and points to create more complex drawings',
                theory: `**Lines and Points**

- \`line(x1, y1, x2, y2)\` - draws a line from point 1 to point 2
- \`point(x, y)\` - draws a single pixel point
- \`strokeWeight()\` - makes lines thicker or thinner

Lines connect two points. You can make cool designs by drawing many lines!`,
                steps: [
                    '[NEXT] See the line drawn across the canvas',
                    'Draw a line from (100, 100) to (300, 300)',
                    'Use strokeWeight(5) before your line to make it thicker',
                    'Draw 5 lines to make a star pattern'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Draw a line from top-left to bottom-right
  line(0, 0, 400, 400);
}`,
                challenge: 'Create a tic-tac-toe grid using only lines!',
                tags: ['lines', 'point', 'strokeWeight']
            },
            {
                unitIndex: 0,
                title: 'Shape Challenge',
                topic: 'Composition',
                objective: 'Combine shapes to create a robot face',
                difficulty: 'Beginner',
                description: 'Put together everything you learned to create a robot face',
                theory: `**Combining Shapes**

You can layer shapes on top of each other to create complex drawings. Shapes are drawn in order - later shapes appear on top of earlier ones.

Think about what shapes you need:
- Rectangles for the head and body
- Circles for eyes
- Lines for a mouth
- Rectangles for antennas`,
                steps: [
                    '[NEXT] Look at the starter robot',
                    'Add two circles for eyes',
                    'Draw a line for the mouth',
                    'Add rectangles for antennas on top',
                    '[TEXT] What other features can you add?'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(200, 220, 255);
  
  // Robot head (square)
  rect(150, 100, 100, 100);
  
  // Add your robot features here!
}`,
                challenge: 'Make your robot unique! Add arms, legs, or special features',
                tags: ['composition', 'creative', 'shapes']
            },

            // Unit 1: Colors & Patterns
            {
                unitIndex: 1,
                title: 'RGB Colors',
                topic: 'Color Basics',
                objective: 'Understand RGB color mixing',
                difficulty: 'Beginner',
                description: 'Learn how computers mix colors using Red, Green, and Blue',
                theory: `**RGB Color System**

Computers mix colors using three values:
- **R**ed (0-255)
- **G**reen (0-255)
- **B**lue (0-255)

Examples:
- \`fill(255, 0, 0)\` = Pure Red
- \`fill(0, 255, 0)\` = Pure Green
- \`fill(0, 0, 255)\` = Pure Blue
- \`fill(255, 255, 0)\` = Yellow (Red + Green)
- \`fill(255, 0, 255)\` = Magenta (Red + Blue)`,
                steps: [
                    '[NEXT] See the red circle',
                    '[TEXT] What color is (0, 255, 0)?',
                    'Change the circle to blue',
                    'Try mixing red and green to make yellow',
                    'Experiment with different combinations'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Red circle
  fill(255, 0, 0);
  ellipse(200, 200, 150, 150);
}`,
                challenge: 'Create a traffic light with red, yellow, and green circles!',
                tags: ['color', 'rgb', 'fill']
            },
            {
                unitIndex: 1,
                title: 'Fill and Stroke',
                topic: 'Styling',
                objective: 'Use fill() and stroke() to style shapes',
                difficulty: 'Beginner',
                description: 'Control the inside color and outline of shapes',
                theory: `**Fill and Stroke**

- \`fill(r, g, b)\` - sets the INSIDE color of shapes
- \`stroke(r, g, b)\` - sets the OUTLINE color
- \`strokeWeight(number)\` - sets outline thickness
- \`noFill()\` - makes shapes transparent inside
- \`noStroke()\` - removes the outline

These settings affect ALL shapes drawn after them, until you change them again.`,
                steps: [
                    '[NEXT] See the styled rectangle',
                    'Add a blue fill before drawing a circle',
                    'Use strokeWeight(8) to make a thick outline',
                    'Try noFill() to make a shape with just an outline',
                    '[TEXT] What does noStroke() do?'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Yellow fill, red outline
  fill(255, 255, 0);
  stroke(255, 0, 0);
  strokeWeight(4);
  rect(150, 150, 100, 100);
}`,
                challenge: 'Draw a target with 3 circles: red, white, and blue rings!',
                tags: ['fill', 'stroke', 'styling']
            },
            {
                unitIndex: 1,
                title: 'Repeating Patterns',
                topic: 'Loops',
                objective: 'Create patterns using for loops',
                difficulty: 'Beginner',
                description: 'Use loops to draw many shapes quickly',
                theory: `**For Loops**

Instead of writing the same code many times, use a loop!

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  // This code runs 5 times
  // i changes: 0, 1, 2, 3, 4
}
\`\`\`

You can use \`i\` to change positions:
- \`ellipse(i * 50, 200, 40, 40)\` draws circles across the screen`,
                steps: [
                    '[NEXT] See the row of circles',
                    '[TEXT] How many circles are drawn?',
                    'Change the loop to draw 10 circles',
                    'Make the circles go down instead of across (change the y value)',
                    'Draw a grid using TWO loops (one inside the other)'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Draw 5 circles in a row
  for (let i = 0; i < 5; i++) {
    ellipse(50 + i * 70, 200, 50, 50);
  }
}`,
                challenge: 'Create a checkerboard pattern using nested loops!',
                tags: ['loops', 'for', 'patterns']
            },
            {
                unitIndex: 1,
                title: 'Gradient Effects',
                topic: 'Advanced Color',
                objective: 'Create color gradients',
                difficulty: 'Intermediate',
                description: 'Make smooth color transitions',
                theory: `**Creating Gradients**

A gradient is a smooth transition between colors. You can create one by:
1. Drawing many thin rectangles or lines
2. Changing the color slightly for each one
3. Using the loop variable to calculate the color

Example: \`fill(i * 5, 0, 255 - i * 5)\` creates a red-to-blue gradient`,
                steps: [
                    '[NEXT] See the gradient from black to white',
                    'Change it to go from red to blue',
                    'Make a vertical gradient instead of horizontal',
                    'Try a rainbow gradient using all three color values',
                    '[TEXT] How does the color change in each loop?'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Gradient from black to white
  for (let i = 0; i < 400; i++) {
    stroke(i * 0.6);
    line(i, 0, i, 400);
  }
}`,
                challenge: 'Create a sunset gradient: orange at top, purple at bottom!',
                tags: ['gradient', 'color', 'loops']
            },

            // Unit 2: Movement & Animation
            {
                unitIndex: 2,
                title: 'Variables for Position',
                topic: 'Variables',
                objective: 'Use variables to control position',
                difficulty: 'Beginner',
                description: 'Store and change values using variables',
                theory: `**Variables**

Variables are like boxes that store values. You can change what's in the box!

\`\`\`javascript
let x = 100;  // Create a variable named x
x = x + 5;    // Change x (add 5 to it)
\`\`\`

Use variables for positions so you can change them easily:
\`ellipse(x, y, 50, 50)\``,
                steps: [
                    '[NEXT] See the circle at position circleX',
                    '[TEXT] What is the starting value of circleX?',
                    'Change circleX to 300',
                    'Create a circleY variable and use it for the y position',
                    'Change both variables to move the circle'
                ],
                starterCode: `let circleX = 200;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Draw circle at circleX position
  ellipse(circleX, 200, 50, 50);
}`,
                challenge: 'Use variables to draw a face where you can easily change the position!',
                tags: ['variables', 'position']
            },
            {
                unitIndex: 2,
                title: 'Making Things Move',
                topic: 'Animation',
                objective: 'Animate shapes across the screen',
                difficulty: 'Beginner',
                description: 'Create movement by changing variables over time',
                theory: `**Animation Basics**

Animation = changing something over time!

The \`draw()\` function runs 60 times per second. If you change a variable each time, things move!

\`\`\`javascript
function draw() {
  x = x + 1;  // Move right by 1 pixel each frame
  ellipse(x, 200, 50, 50);
}
\`\`\`

Remember: put \`background()\` in draw() to clear the old frames!`,
                steps: [
                    '[NEXT] Watch the circle move across the screen',
                    '[TEXT] Why does the circle move?',
                    'Make it move faster (change the +2 to +5)',
                    'Make it move down instead of right',
                    'Make it move diagonally (change both x and y)'
                ],
                starterCode: `let x = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Move the circle
  x = x + 2;
  
  ellipse(x, 200, 50, 50);
}`,
                challenge: 'Make a car (rectangle + circles) drive across the screen!',
                tags: ['animation', 'movement', 'variables']
            },
            {
                unitIndex: 2,
                title: 'Bouncing Ball',
                topic: 'Conditionals',
                objective: 'Make a ball bounce off edges',
                difficulty: 'Intermediate',
                description: 'Use if statements to detect edges and reverse direction',
                theory: `**Bouncing with Conditionals**

To make something bounce:
1. Check if it hit an edge using \`if\`
2. Reverse the direction (multiply speed by -1)

\`\`\`javascript
if (x > width || x < 0) {
  speedX = speedX * -1;  // Reverse direction
}
\`\`\`

\`width\` and \`height\` are built-in variables for canvas size.`,
                steps: [
                    '[NEXT] Watch the ball bounce left and right',
                    '[TEXT] What happens when x reaches the edge?',
                    'Add bouncing for the top and bottom edges',
                    'Change the speed to make it bounce faster',
                    'Add a second ball with different speed'
                ],
                starterCode: `let x = 200;
let y = 200;
let speedX = 3;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Move the ball
  x = x + speedX;
  
  // Bounce off left and right edges
  if (x > width || x < 0) {
    speedX = speedX * -1;
  }
  
  ellipse(x, y, 30, 30);
}`,
                challenge: 'Make the ball bounce off all four walls!',
                tags: ['bouncing', 'conditionals', 'if']
            },
            {
                unitIndex: 2,
                title: 'Random Motion',
                topic: 'Randomness',
                objective: 'Use random() for unpredictable movement',
                difficulty: 'Intermediate',
                description: 'Add randomness to create organic, unpredictable motion',
                theory: `**Random Numbers**

\`random()\` gives you unpredictable numbers:
- \`random(10)\` - random number from 0 to 10
- \`random(50, 100)\` - random number from 50 to 100

Use it for:
- Random positions: \`x = random(width)\`
- Random colors: \`fill(random(255), random(255), random(255))\`
- Random sizes: \`ellipse(x, y, random(20, 80), random(20, 80))\``,
                steps: [
                    '[NEXT] Watch the circle move randomly',
                    '[TEXT] Why does the circle move unpredictably?',
                    'Make it move in bigger jumps (increase random range)',
                    'Add random colors that change each frame',
                    'Draw multiple circles with random positions'
                ],
                starterCode: `let x = 200;
let y = 200;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Move randomly
  x = x + random(-2, 2);
  y = y + random(-2, 2);
  
  // Keep on screen
  x = constrain(x, 0, width);
  y = constrain(y, 0, height);
  
  ellipse(x, y, 30, 30);
}`,
                challenge: 'Create a "firefly" that leaves a trail by not clearing the background!',
                tags: ['random', 'motion', 'unpredictable']
            },

            // Unit 3: Interactive Art
            {
                unitIndex: 3,
                title: 'Mouse Position',
                topic: 'Mouse Input',
                objective: 'Use mouseX and mouseY',
                difficulty: 'Beginner',
                description: 'Make shapes follow your mouse cursor',
                theory: `**Mouse Variables**

p5.js gives you the mouse position automatically:
- \`mouseX\` - horizontal position of mouse
- \`mouseY\` - vertical position of mouse

These update automatically as you move the mouse!

Use them anywhere you'd use a number:
\`ellipse(mouseX, mouseY, 50, 50)\``,
                steps: [
                    '[NEXT] Move your mouse and watch the circle follow',
                    '[TEXT] What are mouseX and mouseY?',
                    'Change the circle size based on mouseX',
                    'Draw a line from center to mouse position',
                    'Make the circle change color based on mouse position'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Circle follows mouse
  ellipse(mouseX, mouseY, 50, 50);
}`,
                challenge: 'Create "eyes" that follow your mouse cursor!',
                tags: ['mouse', 'mouseX', 'mouseY', 'interactive']
            },
            {
                unitIndex: 3,
                title: 'Click Events',
                topic: 'Mouse Events',
                objective: 'Respond to mouse clicks',
                difficulty: 'Intermediate',
                description: 'Detect when the user clicks the mouse',
                theory: `**Mouse Click Detection**

p5.js has a special function that runs when you click:

\`\`\`javascript
function mousePressed() {
  // This code runs when you click!
}
\`\`\`

You can also check if mouse is pressed in draw():
\`if (mouseIsPressed) { ... }\``,
                steps: [
                    '[NEXT] Click anywhere to see circles appear',
                    '[TEXT] When does mousePressed() run?',
                    'Change the circle color when clicked',
                    'Make circles appear only when mouse is in top half',
                    'Add random sizes to the clicked circles'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
  background(220);
}

function draw() {
  // Nothing in draw - we use mousePressed instead!
}

function mousePressed() {
  // Draw a circle where clicked
  fill(random(255), random(255), random(255));
  ellipse(mouseX, mouseY, 40, 40);
}`,
                challenge: 'Create a "pop the bubbles" game - click to make them disappear!',
                tags: ['click', 'mousePressed', 'events']
            },
            {
                unitIndex: 3,
                title: 'Drawing Tool',
                topic: 'Interactive Drawing',
                objective: 'Create a simple paint program',
                difficulty: 'Intermediate',
                description: 'Build a drawing app where you can paint with your mouse',
                theory: `**Creating a Drawing Tool**

Combine mouse position with mouse pressed:
1. Check if mouse is pressed
2. Draw at the mouse position
3. DON'T clear background (so drawing stays)

\`\`\`javascript
if (mouseIsPressed) {
  ellipse(mouseX, mouseY, 10, 10);
}
\`\`\``,
                steps: [
                    '[NEXT] Click and drag to draw',
                    '[TEXT] Why don\'t we use background() in draw()?',
                    'Change the brush size',
                    'Make the color change based on mouse position',
                    'Add a "clear" button (press key to clear)'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
  background(255);
}

function draw() {
  // Draw when mouse is pressed
  if (mouseIsPressed) {
    fill(0);
    noStroke();
    ellipse(mouseX, mouseY, 20, 20);
  }
}

function keyPressed() {
  if (key === 'c') {
    background(255);  // Clear when 'c' is pressed
  }
}`,
                challenge: 'Add different brush sizes or colors using keyboard keys!',
                tags: ['drawing', 'paint', 'interactive', 'creative']
            },
            {
                unitIndex: 3,
                title: 'Keyboard Control',
                topic: 'Keyboard Input',
                objective: 'Control shapes with arrow keys',
                difficulty: 'Intermediate',
                description: 'Move objects using keyboard arrow keys',
                theory: `**Keyboard Input**

Check which key is pressed:
- \`keyIsDown(LEFT_ARROW)\` - is left arrow pressed?
- \`keyIsDown(RIGHT_ARROW)\` - is right arrow pressed?
- \`keyIsDown(UP_ARROW)\` - is up arrow pressed?
- \`keyIsDown(DOWN_ARROW)\` - is down arrow pressed?

Use these in \`if\` statements to control movement!`,
                steps: [
                    '[NEXT] Use arrow keys to move the square',
                    '[TEXT] What happens when you press the right arrow?',
                    'Make it move faster',
                    'Add boundaries so it can\'t go off screen',
                    'Change the square to a spaceship shape'
                ],
                starterCode: `let x = 200;
let y = 200;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Check arrow keys
  if (keyIsDown(LEFT_ARROW)) {
    x = x - 3;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    x = x + 3;
  }
  if (keyIsDown(UP_ARROW)) {
    y = y - 3;
  }
  if (keyIsDown(DOWN_ARROW)) {
    y = y + 3;
  }
  
  // Draw player
  fill(100, 150, 255);
  rect(x, y, 40, 40);
}`,
                challenge: 'Create a maze game where you navigate through obstacles!',
                tags: ['keyboard', 'arrow keys', 'control', 'game']
            }
        ]
    },

    // For brevity, I'll add just the Workshop template with full content
    // The other templates would follow the same pattern
    {
        id: 'workshop-intro',
        name: 'Coding Workshop: First Steps',
        level: 'Beginner (All Ages)',
        theme: 'Drawing and Patterns',
        duration: 'Workshop',
        description: 'Perfect for a single-day workshop or after-school session',
        goals: ['Basic shapes', 'Colors', 'Simple patterns', 'Fun first project'],
        units: [
            { title: 'Getting Started', description: 'Your first p5.js sketches', order: 0 },
            { title: 'Creative Coding', description: 'Make colorful art with code', order: 1 }
        ],
        lessons: [
            {
                unitIndex: 0,
                title: 'Hello p5.js!',
                topic: 'First Sketch',
                objective: 'Create your first canvas',
                difficulty: 'Beginner',
                description: 'Welcome to coding! Create your very first program',
                theory: `**Your First Program!**

Every p5.js program has two main parts:
- \`setup()\` - runs ONCE at the start
- \`draw()\` - runs OVER and OVER (60 times per second!)

\`createCanvas()\` makes your drawing space
\`background()\` fills it with a color`,
                steps: [
                    '[NEXT] Run the code and see your canvas!',
                    '[TEXT] What color is the background?',
                    'Change 220 to 100 to make it darker',
                    'Change it to 255 for white, or 0 for black'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}`,
                challenge: 'Try different background colors!',
                tags: ['setup', 'canvas', 'background']
            },
            {
                unitIndex: 0,
                title: 'Drawing Shapes',
                topic: 'Basic Shapes',
                objective: 'Draw circles, squares, and triangles',
                difficulty: 'Beginner',
                description: 'Learn to draw basic shapes',
                theory: `**Drawing Shapes**

- \`ellipse(x, y, size, size)\` - draws a circle
- \`rect(x, y, width, height)\` - draws a rectangle
- \`triangle(x1, y1, x2, y2, x3, y3)\` - draws a triangle

The numbers tell the shape WHERE to go and HOW BIG to be!`,
                steps: [
                    '[NEXT] See the circle in the middle',
                    'Add a rectangle at (100, 100) with size 50, 50',
                    'Draw a triangle using three corner points',
                    '[TEXT] What do the numbers in ellipse() mean?'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Draw a circle in the center
  ellipse(200, 200, 100, 100);
}`,
                challenge: 'Draw a smiley face using circles!',
                tags: ['shapes', 'ellipse', 'rect']
            },
            {
                unitIndex: 0,
                title: 'Adding Colors',
                topic: 'Color Basics',
                objective: 'Use fill() to add colors',
                difficulty: 'Beginner',
                description: 'Make your shapes colorful!',
                theory: `**Colors!**

Use \`fill()\` before drawing a shape to color it:
- \`fill(255, 0, 0)\` = Red
- \`fill(0, 255, 0)\` = Green  
- \`fill(0, 0, 255)\` = Blue

The three numbers are Red, Green, Blue (0-255 each)`,
                steps: [
                    '[NEXT] See the red circle',
                    'Change it to blue: fill(0, 0, 255)',
                    'Add a green square',
                    'Try mixing colors: fill(255, 255, 0) for yellow!'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Red circle
  fill(255, 0, 0);
  ellipse(200, 200, 100, 100);
}`,
                challenge: 'Make a rainbow using different colored circles!',
                tags: ['color', 'fill', 'rgb']
            },
            {
                unitIndex: 1,
                title: 'Pattern Magic',
                topic: 'Loops',
                objective: 'Create repeating patterns',
                difficulty: 'Beginner',
                description: 'Use loops to draw many shapes at once',
                theory: `**Loops = Repeating Code**

Instead of writing the same thing many times, use a loop!

\`for (let i = 0; i < 5; i++)\` means "do this 5 times"

\`i\` changes each time: 0, 1, 2, 3, 4`,
                steps: [
                    '[NEXT] See the row of circles',
                    '[TEXT] How many circles are there?',
                    'Change 5 to 10 to draw more circles',
                    'Change i * 60 to i * 40 to move them closer'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Draw 5 circles in a row
  for (let i = 0; i < 5; i++) {
    ellipse(50 + i * 60, 200, 40, 40);
  }
}`,
                challenge: 'Make a grid of circles using TWO loops!',
                tags: ['loops', 'for', 'patterns']
            },
            {
                unitIndex: 1,
                title: 'Rainbow Art',
                topic: 'Color Gradients',
                objective: 'Make rainbow effects',
                difficulty: 'Beginner',
                description: 'Create beautiful color transitions',
                theory: `**Rainbow Colors**

You can change colors in a loop to make a rainbow!

Use the loop variable \`i\` to change the color:
- \`fill(i * 10, 100, 255)\` changes red each time`,
                steps: [
                    '[NEXT] See the rainbow circles',
                    'Change the colors to make different rainbows',
                    'Make the circles bigger or smaller',
                    '[TEXT] How does the color change?'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Rainbow circles
  for (let i = 0; i < 7; i++) {
    fill(i * 35, 200, 255 - i * 35);
    ellipse(50 + i * 50, 200, 60, 60);
  }
}`,
                challenge: 'Create a sunset with orange, pink, and purple!',
                tags: ['rainbow', 'color', 'gradient']
            },
            {
                unitIndex: 1,
                title: 'Interactive Drawing',
                topic: 'Mouse Input',
                objective: 'Draw with your mouse',
                difficulty: 'Beginner',
                description: 'Make art by moving your mouse!',
                theory: `**Mouse Drawing**

\`mouseX\` and \`mouseY\` tell you where the mouse is!

If you DON'T clear the background, your drawing stays on screen.

\`mouseIsPressed\` is true when you're clicking.`,
                steps: [
                    '[NEXT] Click and drag to draw',
                    'Change the circle size',
                    'Change the color',
                    '[TEXT] What happens if you add background() to draw()?'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
  background(255);
}

function draw() {
  // Draw when mouse is pressed
  if (mouseIsPressed) {
    fill(100, 150, 255);
    noStroke();
    ellipse(mouseX, mouseY, 30, 30);
  }
}`,
                challenge: 'Make a rainbow brush that changes colors!',
                tags: ['mouse', 'drawing', 'interactive']
            },
            {
                unitIndex: 1,
                title: 'Your Masterpiece',
                topic: 'Creative Project',
                objective: 'Create your own artwork',
                difficulty: 'Beginner',
                description: 'Use everything you learned to make something amazing!',
                theory: `**Time to Create!**

You now know:
- How to draw shapes
- How to use colors
- How to make patterns with loops
- How to use the mouse

Combine these to make YOUR own unique creation!`,
                steps: [
                    '[NEXT] Look at the example',
                    'Change the colors to your favorites',
                    'Add more shapes',
                    'Make it interactive with the mouse',
                    '[TEXT] What will you create?'
                ],
                starterCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(200, 220, 255);
  
  // Your masterpiece goes here!
  // Try combining shapes, colors, and loops
  
  // Example: Colorful sun
  fill(255, 200, 0);
  ellipse(200, 200, 100, 100);
  
  // Add your own ideas!
}`,
                challenge: 'Create something that represents YOU! A favorite animal, hobby, or dream!',
                tags: ['creative', 'project', 'masterpiece']
            }
        ]
    },
    {
        id: 'robotics-foundations',
        name: 'Robotics with Scratch',
        level: 'Beginner to Intermediate (Grades 5-7)',
        theme: 'Robotics & Physical Computing',
        duration: 'Semester',
        description: 'Complete robotics course: program LEGO robots, micro:bit, and other hardware using Scratch extensions',
        goals: ['Connect hardware to Scratch', 'Control motors and servos', 'Read sensors', 'Build autonomous robots', 'Create interactive projects'],
        units: [
            { title: 'Getting Started with Robotics', description: 'Learn to connect hardware and use basic movement blocks', order: 0 },
            { title: 'Sensors & Input', description: 'Read sensors and make robots respond to their environment', order: 1 },
            { title: 'Advanced Control', description: 'Program complex behaviors and decision-making', order: 2 },
            { title: 'Creative Robotics Projects', description: 'Build your own robot projects and challenges', order: 3 }
        ],
        lessons: [
            // Unit 0: Getting Started with Robotics
            {
                unitIndex: 0,
                title: 'Connecting Your Robot',
                topic: 'Hardware Setup',
                objective: 'Connect a robot (EV3, BOOST, or micro:bit) to Scratch and test basic connection',
                difficulty: 'Beginner',
                description: 'Learn how to add robotics extensions and connect your hardware to Scratch',
                theory: `**Welcome to Robotics with Scratch!**

Robots are machines that can follow instructions. In Scratch, we use **extensions** to talk to robots.

**Adding an Extension:**
1. Click the "Add Extension" button (bottom-left of Scratch)
2. Choose your robot type:
   - **LEGO MINDSTORMS EV3** - For EV3 robots
   - **LEGO BOOST** - For BOOST robots  
   - **micro:bit** - For micro:bit boards
   - **Makey Makey** - For interactive projects

**Connecting Your Robot:**
- Make sure your robot is powered on
- Click the "Connect" button in the extension
- Follow the on-screen instructions
- When connected, you'll see a green checkmark!

**Safety First:** Always make sure your robot has space to move before running code!`,
                steps: [
                    '[NEXT] Look at the Scratch interface. Find the "Add Extension" button at the bottom-left.',
                    '[TEXT] What types of robots can you connect to Scratch?',
                    'Click "Add Extension" and select your robot type (EV3, BOOST, or micro:bit)',
                    'Follow the connection instructions to connect your robot',
                    '[TEXT] How do you know when your robot is connected?'
                ],
                starterCode: '{}',
                challenge: 'Try connecting a different type of robot or hardware if available!',
                tags: ['robotics', 'extensions', 'hardware', 'connection']
            },
            {
                unitIndex: 0,
                title: 'Making Robots Move',
                topic: 'Motor Control',
                objective: 'Use motor blocks to make a robot move forward, backward, and turn',
                difficulty: 'Beginner',
                description: 'Control robot motors to create basic movement patterns',
                theory: `**Controlling Robot Motors**

Robots move using **motors**. In Scratch, you control motors with special blocks.

**Motor Blocks:**
- \`motor [A/B/C] on\` - Turns a motor on
- \`motor [A/B/C] off\` - Stops a motor
- \`set motor [A/B/C] power to [value]\` - Sets motor speed (0-100)
- \`motor [A/B/C] on for [seconds] secs\` - Runs motor for a specific time

**Movement Patterns:**
- **Forward:** Turn both motors on
- **Backward:** Turn motors on in reverse
- **Turn:** Turn one motor on, keep other off
- **Stop:** Turn all motors off

**Power Values:**
- 0 = stopped
- 50 = medium speed
- 100 = full speed
- Negative = reverse direction`,
                steps: [
                    '[NEXT] Look at the motor blocks in your extension. What letters do you see?',
                    'Add a "when flag clicked" event block',
                    'Connect a "motor A on" block below it',
                    'Click the green flag and watch your robot move!',
                    '[TEXT] What happens if you use "motor A off" instead?',
                    'Try setting motor power to 50. How does the speed change?'
                ],
                starterCode: '{}',
                challenge: 'Make your robot move forward for 3 seconds, then stop!',
                tags: ['robotics', 'motors', 'movement', 'ev3', 'boost']
            },
            {
                unitIndex: 0,
                title: 'Precise Movement',
                topic: 'Distance & Timing',
                objective: 'Control how far and how long robots move using time and distance blocks',
                difficulty: 'Beginner',
                description: 'Make robots move specific distances and times',
                theory: `**Precise Robot Control**

To make robots do exactly what you want, you need to control:
1. **How long** they move (time)
2. **How far** they move (distance/rotations)

**Time Control:**
- \`motor [A] on for [2] secs\` - Runs for 2 seconds
- Use \`wait [1] secs\` between actions

**Distance Control (EV3/BOOST):**
- \`motor [A] on for [2] rotations\` - Moves wheel 2 full turns
- \`motor [A] on for [360] degrees\` - Moves wheel 360 degrees (1 rotation)

**Planning Movement:**
Think about what you want:
- "Move forward 1 meter" → Use rotations or time
- "Turn 90 degrees" → Use one motor for specific time
- "Move in a square" → Forward, turn, repeat 4 times`,
                steps: [
                    '[NEXT] Find the "motor on for" blocks. What units can you use?',
                    'Make your robot move forward for 2 seconds',
                    'Add a "wait 1 secs" block',
                    'Make the robot move backward for 2 seconds',
                    '[TEXT] How could you make the robot move exactly 1 meter?',
                    'Try using rotations instead of seconds'
                ],
                starterCode: '{}',
                challenge: 'Program your robot to move in a perfect square! (Forward, turn 90°, repeat 4 times)',
                tags: ['robotics', 'motors', 'timing', 'distance', 'control']
            },
            {
                unitIndex: 0,
                title: 'Robot Challenge: Obstacle Course',
                topic: 'Movement Patterns',
                objective: 'Combine movement commands to navigate a simple obstacle course',
                difficulty: 'Beginner',
                description: 'Apply movement skills to complete a physical challenge',
                theory: `**Planning Robot Paths**

Real robots need to follow paths! Think like a robot:
1. **Break down the path** into simple steps
2. **Test each step** one at a time
3. **Adjust** if something doesn't work
4. **Combine** steps into a complete program

**Common Patterns:**
- Forward → Turn → Forward → Turn (square)
- Forward → Wait → Backward (shuttle)
- Turn → Forward → Turn → Forward (zigzag)

**Debugging Tips:**
- Start with slow speeds (power = 30-50)
- Test each movement separately
- Use wait blocks between actions
- Mark the floor with tape to see where robot goes`,
                steps: [
                    '[NEXT] Look at your workspace. Plan a simple path (forward, turn, forward)',
                    'Write code to move forward for 3 seconds',
                    'Add a turn (one motor on, other off)',
                    'Add another forward movement',
                    'Test and adjust the timing/power until it works!',
                    '[TEXT] What was the hardest part of making your robot follow the path?'
                ],
                starterCode: '{}',
                challenge: 'Create an obstacle course with 3 turns and have your robot complete it!',
                tags: ['robotics', 'challenge', 'movement', 'problem-solving']
            },
            // Unit 1: Sensors & Input
            {
                unitIndex: 1,
                title: 'Touch Sensors',
                topic: 'Touch Detection',
                objective: 'Use touch sensors to detect when robot hits something',
                difficulty: 'Beginner',
                description: 'Read touch sensor input and make robot respond to contact',
                theory: `**Touch Sensors**

Robots need to "feel" their environment! **Touch sensors** detect when something is pressed or bumped.

**Touch Sensor Blocks:**
- \`when [touch sensor] pressed\` - Runs when sensor is pressed
- \`[touch sensor] pressed?\` - Reports true/false (use in if statements)

**Common Uses:**
- Stop when hitting a wall
- Detect when button is pressed
- Trigger actions on contact

**Sensor Values:**
- **Pressed** = true (1) - Something is touching
- **Not Pressed** = false (0) - Nothing touching

**Programming Pattern:**
\`if [touch sensor] pressed then\`
  \`motor A off\`
  \`motor B off\`
\`end\`

This makes the robot stop when it hits something!`,
                steps: [
                    '[NEXT] Find the touch sensor blocks in your extension. What do they look like?',
                    'Add a "when flag clicked" block',
                    'Add an "if [touch sensor] pressed" block',
                    'Inside the if, add "motor A off" and "motor B off"',
                    'Test: gently press the sensor. Does the robot stop?',
                    '[TEXT] How could you use this to make a robot that stops at walls?'
                ],
                starterCode: '{}',
                challenge: 'Make a robot that moves forward until it hits something, then backs up and turns!',
                tags: ['robotics', 'sensors', 'touch', 'input', 'ev3']
            },
            {
                unitIndex: 1,
                title: 'Distance Sensors',
                topic: 'Ultrasonic Detection',
                objective: 'Use ultrasonic/distance sensors to detect objects before touching them',
                difficulty: 'Intermediate',
                description: 'Read distance sensor values and program obstacle avoidance',
                theory: `**Distance Sensors (Ultrasonic)**

Distance sensors use sound waves to "see" how far away objects are - like a bat's echolocation!

**Distance Sensor Blocks:**
- \`[distance sensor] distance\` - Reports distance in cm or inches
- Use in comparisons: \`if [distance sensor] distance < [20] then\`

**Distance Values:**
- Small number (5-10 cm) = Very close
- Medium number (20-50 cm) = Close
- Large number (100+ cm) = Far away
- 255 or -1 = Nothing detected

**Obstacle Avoidance Pattern:**
\`forever\`
  \`if [distance sensor] distance < [15] then\`
    \`motor A off\`
    \`motor B off\`
    \`turn [90] degrees\`
  \`end\`
\`end\`

This makes the robot stop and turn when it sees something close!`,
                steps: [
                    '[NEXT] Find the distance sensor blocks. What unit does it measure in?',
                    'Add a "forever" loop',
                    'Inside, add "if [distance sensor] distance < [20] then"',
                    'Inside the if, make the robot stop',
                    'Add "else" and make the robot move forward',
                    'Test: move your hand in front of the sensor!',
                    '[TEXT] How is a distance sensor different from a touch sensor?'
                ],
                starterCode: '{}',
                challenge: 'Create a robot that follows you! (Moves forward when you\'re far, stops when you\'re close)',
                tags: ['robotics', 'sensors', 'ultrasonic', 'distance', 'avoidance']
            },
            {
                unitIndex: 1,
                title: 'Color & Light Sensors',
                topic: 'Color Detection',
                objective: 'Use color/light sensors to detect colors and follow lines',
                difficulty: 'Intermediate',
                description: 'Read color sensor values and program line-following behavior',
                theory: `**Color & Light Sensors**

Color sensors can "see" colors and brightness! This lets robots:
- Follow colored lines
- Sort objects by color
- Detect light levels

**Color Sensor Blocks:**
- \`[color sensor] color\` - Reports detected color
- \`[color sensor] [red] value\` - Reports brightness of red (0-100)
- \`[color sensor] [reflected light]\` - Reports how much light bounces back

**Line Following:**
Robots follow lines by:
1. Moving forward
2. Checking if sensor sees dark (line) or light (not line)
3. Turning toward the line if it goes off course

**Pattern:**
\`forever\`
  \`if [color sensor] [reflected light] < [30] then\`
    \`turn right\` (line is dark, turn toward it)
  \`else\`
    \`turn left\` (no line, turn to find it)
  \`end\`
\`end\``,
                steps: [
                    '[NEXT] Find the color sensor blocks. What can they detect?',
                    'Add a "forever" loop',
                    'Add "if [color sensor] [reflected light] < [30] then"',
                    'Inside if, make robot turn slightly right',
                    'Add "else" and make robot turn slightly left',
                    'Test with a dark line on light surface!',
                    '[TEXT] Why does the robot need to turn left and right to follow a line?'
                ],
                starterCode: '{}',
                challenge: 'Make your robot follow a curved line! Try adjusting the turn amounts.',
                tags: ['robotics', 'sensors', 'color', 'line-following', 'ev3']
            },
            {
                unitIndex: 1,
                title: 'micro:bit Sensors',
                topic: 'Accelerometer & Buttons',
                objective: 'Use micro:bit sensors (accelerometer, buttons) to control robots',
                difficulty: 'Intermediate',
                description: 'Read micro:bit sensor data and create tilt-controlled robots',
                theory: `**micro:bit Sensors**

The micro:bit has built-in sensors:
- **Accelerometer** - Detects tilting and shaking
- **Buttons A & B** - Physical buttons on the board
- **Compass** - Detects direction
- **Temperature** - Measures temperature

**Accelerometer Blocks:**
- \`[micro:bit] [tilt angle]\` - Reports tilt angle (-180 to 180)
- \`[micro:bit] [acceleration]\` - Reports how fast it's moving
- Use in comparisons: \`if [micro:bit] [tilt angle] > [30] then\`

**Tilt Control Pattern:**
\`forever\`
  \`if [micro:bit] [tilt angle] > [20] then\`
    \`motor A on\` (tilted forward, move forward)
  \`else if [micro:bit] [tilt angle] < [-20] then\`
    \`motor A off\` (tilted back, stop)
  \`end\`
\`end\`

This makes the robot move when you tilt the micro:bit forward!`,
                steps: [
                    '[NEXT] Connect your micro:bit. What sensors does it have?',
                    'Add a "forever" loop',
                    'Add "if [micro:bit] [tilt angle] > [20] then"',
                    'Inside if, make robot move forward',
                    'Add "else if [tilt angle] < [-20]" to make it stop',
                    'Test: tilt your micro:bit forward and backward!',
                    '[TEXT] How could you use the micro:bit buttons to control your robot?'
                ],
                starterCode: '{}',
                challenge: 'Create a robot controlled by micro:bit buttons - Button A = forward, Button B = backward!',
                tags: ['robotics', 'microbit', 'sensors', 'accelerometer', 'control']
            },
            // Unit 2: Advanced Control
            {
                unitIndex: 2,
                title: 'Decision Making',
                topic: 'If-Then Logic',
                objective: 'Use if-then statements to make robots make decisions',
                difficulty: 'Intermediate',
                description: 'Program robots to choose actions based on sensor input',
                theory: `**Robot Decision Making**

Smart robots make decisions! They use **if-then** logic:
- **IF** something is true → **THEN** do this
- **ELSE** → do something different

**Decision Patterns:**
1. **Simple Choice:**
   \`if [condition] then\`
     \`[action]\`
   \`end\`

2. **Two Choices:**
   \`if [condition] then\`
     \`[action A]\`
   \`else\`
     \`[action B]\`
   \`end\`

3. **Multiple Choices:**
   \`if [condition 1] then\`
     \`[action 1]\`
   \`else if [condition 2] then\`
     \`[action 2]\`
   \`else\`
     \`[default action]\`
   \`end\`

**Example:**
\`if [distance sensor] distance < [10] then\`
  \`motor A off\`
  \`motor B off\`
\`else\`
  \`motor A on\`
  \`motor B on\`
\`end\`

This makes the robot stop if close to something, otherwise keep moving!`,
                steps: [
                    '[NEXT] Look at the "if-then" blocks. How do they work?',
                    'Add a "forever" loop',
                    'Inside, add "if [distance sensor] distance < [15] then"',
                    'In the if, make robot stop and turn',
                    'Add "else" and make robot move forward',
                    'Test: does your robot avoid obstacles?',
                    '[TEXT] What other decisions could a robot make?'
                ],
                starterCode: '{}',
                challenge: 'Create a robot that: stops at walls, turns at corners, and speeds up in open spaces!',
                tags: ['robotics', 'logic', 'if-then', 'decision-making', 'control']
            },
            {
                unitIndex: 2,
                title: 'Loops & Repetition',
                topic: 'Repeat Blocks',
                objective: 'Use repeat loops to make robots do actions multiple times',
                difficulty: 'Intermediate',
                description: 'Program repetitive behaviors using loops',
                theory: `**Loops in Robotics**

Loops make robots repeat actions! Instead of writing the same code many times, use a loop.

**Loop Types:**
1. **Repeat [N] times:**
   \`repeat [10]\`
     \`motor A on for [1] secs\`
   \`end\`
   (Does the action exactly 10 times)

2. **Forever:**
   \`forever\`
     \`[action]\`
   \`end\`
   (Does the action until you stop it)

3. **Repeat until:**
   \`repeat until [condition]\`
     \`[action]\`
   \`end\`
   (Does action until condition is true)

**Common Uses:**
- Make robot move in a square (repeat 4 times: forward, turn)
- Keep checking sensors (forever loop)
- Keep trying until sensor detects something (repeat until)

**Example:**
\`repeat [4]\`
  \`motor A on for [2] secs\`
  \`turn [90] degrees\`
\`end\`

This makes the robot move in a square!`,
                steps: [
                    '[NEXT] Find the "repeat" blocks. How many times can you repeat?',
                    'Add a "repeat [4]" block',
                    'Inside, add "motor A on for [1] secs"',
                    'Add "wait [0.5] secs"',
                    'Add "motor A off"',
                    'Test: does your robot move in 4 steps?',
                    '[TEXT] How is "repeat 4" different from "forever"?'
                ],
                starterCode: '{}',
                challenge: 'Make your robot move in a perfect square using a repeat loop!',
                tags: ['robotics', 'loops', 'repeat', 'patterns', 'control']
            },
            {
                unitIndex: 2,
                title: 'Variables in Robotics',
                topic: 'Storing Values',
                objective: 'Use variables to store sensor readings and control robot behavior',
                difficulty: 'Intermediate',
                description: 'Store and use sensor data with variables',
                theory: `**Variables for Robots**

Variables let robots "remember" information! Like a robot's memory.

**Creating Variables:**
1. Click "Variables" category
2. Click "Make a Variable"
3. Name it (e.g., "speed", "distance", "count")

**Using Variables:**
- \`set [speed] to [50]\` - Store a value
- \`change [speed] by [10]\` - Add to value
- \`[speed]\` - Use the value (in other blocks)

**Common Uses:**
- Store sensor readings: \`set [distance] to [distance sensor] distance\`
- Control speed: \`set motor A power to [speed]\`
- Count actions: \`change [count] by [1]\`

**Example:**
\`set [robot speed] to [30]\`
\`set motor A power to [robot speed]\`
\`set motor B power to [robot speed]\`
\`motor A on\`
\`motor B on\`

Now you can easily change speed by changing the variable!`,
                steps: [
                    '[NEXT] Find the "Variables" category. How do you make a variable?',
                    'Create a variable called "speed"',
                    'Add "set [speed] to [50]"',
                    'Add "set motor A power to [speed]"',
                    'Add "motor A on"',
                    'Try changing the speed variable value. What happens?',
                    '[TEXT] Why is it useful to use variables instead of typing numbers?'
                ],
                starterCode: '{}',
                challenge: 'Create a robot that starts slow, speeds up over time, then slows down! Use variables!',
                tags: ['robotics', 'variables', 'data', 'control', 'programming']
            },
            {
                unitIndex: 2,
                title: 'Advanced Challenge: Maze Navigator',
                topic: 'Complex Behaviors',
                objective: 'Combine sensors, loops, and logic to navigate a simple maze',
                difficulty: 'Advanced',
                description: 'Program a robot to autonomously navigate through a maze',
                theory: `**Maze Navigation Strategy**

To navigate a maze, robots need:
1. **Wall detection** (distance/touch sensors)
2. **Decision making** (if-then logic)
3. **Repetition** (loops to keep trying)
4. **Turning** (to change direction)

**Simple Maze Algorithm:**
1. Move forward
2. Check if wall ahead
3. If wall → turn right, check again
4. If still wall → turn left twice (180°), check
5. Move forward in open direction
6. Repeat forever

**Pattern:**
\`forever\`
  \`if [distance sensor] distance > [20] then\`
    \`motor A on\`
    \`motor B on\`
  \`else\`
    \`motor A off\`
    \`motor B off\`
    \`turn [90] degrees\`
    \`wait [0.5] secs\`
  \`end\`
\`end\`

This makes the robot follow walls and turn at corners!`,
                steps: [
                    '[NEXT] Plan your maze strategy. What should the robot do at walls?',
                    'Add a "forever" loop',
                    'Add "if [distance sensor] distance > [20] then"',
                    'In if: make robot move forward',
                    'In else: make robot stop, turn, and wait',
                    'Test in a simple maze (use boxes or books as walls)',
                    '[TEXT] What improvements could make your robot better at mazes?'
                ],
                starterCode: '{}',
                challenge: 'Build a maze and program your robot to find the exit! Try different strategies.',
                tags: ['robotics', 'challenge', 'maze', 'navigation', 'advanced']
            },
            // Unit 3: Creative Robotics Projects
            {
                unitIndex: 3,
                title: 'Robot Dance Party',
                topic: 'Creative Movement',
                objective: 'Program a robot to perform a dance routine with music',
                difficulty: 'Intermediate',
                description: 'Create synchronized robot movements to create a dance performance',
                theory: `**Robot Choreography**

Robots can dance! Combine:
- **Movement patterns** (forward, turn, spin)
- **Timing** (wait blocks for rhythm)
- **Repetition** (loops for dance moves)
- **Variables** (to change speed/pattern)

**Dance Elements:**
- **Basic moves:** Forward, backward, turn, spin
- **Combinations:** Forward-turn-backward-turn (box step)
- **Timing:** Match movements to music beats
- **Patterns:** Repeat moves in sequences

**Planning a Dance:**
1. Choose 3-4 basic moves
2. Combine them in a sequence
3. Add timing (wait blocks)
4. Put in a repeat loop
5. Test and adjust!

**Example Dance Routine:**
\`repeat [4]\`
  \`motor A on for [1] secs\` (forward)
  \`turn [90] degrees\` (turn)
  \`motor A on for [1] secs\` (forward)
  \`turn [90] degrees\` (turn)
\`end\`

This creates a square dance pattern!`,
                steps: [
                    '[NEXT] Plan your dance. What 3 moves will your robot do?',
                    'Create your first move (e.g., forward for 1 second)',
                    'Add a turn or spin',
                    'Add your second move',
                    'Put moves in a "repeat [4]" loop',
                    'Test and adjust timing to make it smooth!',
                    '[TEXT] How could you make your dance more interesting?'
                ],
                starterCode: '{}',
                challenge: 'Create a 30-second robot dance routine! Add music if possible!',
                tags: ['robotics', 'creative', 'dance', 'movement', 'art']
            },
            {
                unitIndex: 3,
                title: 'Smart Home Robot',
                topic: 'Interactive Systems',
                objective: 'Create a robot that responds to environment and performs useful tasks',
                difficulty: 'Advanced',
                description: 'Build a robot that acts as a smart home assistant',
                theory: `**Smart Home Robotics**

Smart robots help around the house! They can:
- **Detect** things (sensors)
- **Decide** what to do (if-then logic)
- **Act** on decisions (motors, lights, sounds)

**Smart Home Features:**
- **Light sensor:** Turn on lights when dark
- **Distance sensor:** Alert when someone approaches
- **Touch sensor:** Start/stop on button press
- **Temperature sensor:** Report room temperature

**Example: Security Robot**
\`forever\`
  \`if [distance sensor] distance < [30] then\`
    \`play sound [alert]\`
    \`motor A on for [0.5] secs\` (shake)
  \`end\`
\`end\`

This makes a robot that alerts when something is close!

**Planning Your Robot:**
1. Choose a task (security, cleaning, entertainment)
2. List sensors needed
3. Plan behaviors (what should it do?)
4. Program and test!`,
                steps: [
                    '[NEXT] What task should your smart home robot do?',
                    'Choose sensors you\'ll need',
                    'Plan the robot\'s behavior (when should it act?)',
                    'Add sensor checks in a "forever" loop',
                    'Add actions based on sensor readings',
                    'Test your robot in different situations!',
                    '[TEXT] What other smart home features could a robot have?'
                ],
                starterCode: '{}',
                challenge: 'Create a robot that performs a useful home task! Document what it does.',
                tags: ['robotics', 'smart-home', 'sensors', 'automation', 'project']
            },
            {
                unitIndex: 3,
                title: 'Robot Sumo Challenge',
                topic: 'Competition Robotics',
                objective: 'Program a robot to compete in a sumo-style pushing competition',
                difficulty: 'Advanced',
                description: 'Build and program a robot for competitive sumo wrestling',
                theory: `**Robot Sumo Competition**

Robot sumo is a fun competition! Goal: Push opponent out of ring.

**Sumo Robot Strategy:**
1. **Find opponent** (distance sensor)
2. **Move toward opponent** (forward movement)
3. **Push when close** (high power, forward)
4. **Stay in ring** (edge detection with sensors)
5. **Recover if stuck** (back up and turn)

**Key Behaviors:**
- **Search:** Turn slowly to find opponent
- **Attack:** Move forward at high speed when opponent detected
- **Defense:** Back up if too close to edge
- **Recovery:** Turn and try again if stuck

**Programming Pattern:**
\`forever\`
  \`if [distance sensor] distance < [50] then\`
    \`set motor A power to [100]\`
    \`set motor B power to [100]\`
    \`motor A on\`
    \`motor B on\`
  \`else\`
    \`turn [10] degrees\` (search)
  \`end\`
\`end\`

This makes the robot attack when it sees something, otherwise search!`,
                steps: [
                    '[NEXT] Plan your sumo strategy. How will your robot find and push opponents?',
                    'Add distance sensor check in "forever" loop',
                    'If opponent close: set motors to high power and move forward',
                    'If no opponent: turn slowly to search',
                    'Add edge detection (if too close to edge, back up)',
                    'Test against another robot or object!',
                    '[TEXT] What strategies work best in robot sumo?'
                ],
                starterCode: '{}',
                challenge: 'Build a sumo ring and compete! Try different strategies to see what works best!',
                tags: ['robotics', 'competition', 'sumo', 'strategy', 'advanced']
            },
            {
                unitIndex: 3,
                title: 'Final Project: Your Robot Creation',
                topic: 'Independent Project',
                objective: 'Design and program your own unique robot project',
                difficulty: 'Advanced',
                description: 'Create an original robot project combining all learned skills',
                theory: `**Your Robot Project**

Now it's time to create YOUR robot! Use everything you've learned:
- Motor control
- Sensors
- Decision making
- Loops and variables
- Creative thinking!

**Project Ideas:**
- **Art robot:** Draws patterns or pictures
- **Pet robot:** Follows you, responds to touch
- **Game robot:** Plays tag, hide and seek
- **Helper robot:** Carries things, organizes
- **Entertainment robot:** Dances, tells jokes, plays music
- **Your own idea!**

**Project Planning:**
1. **Choose your idea** - What will your robot do?
2. **List requirements** - What sensors/motors needed?
3. **Design behavior** - How will it work?
4. **Program** - Write the code
5. **Test** - Try it out, fix problems
6. **Improve** - Make it better!

**Documentation:**
- What does your robot do?
- How does it work?
- What was hardest?
- What would you improve?

**Remember:** Every great robot started as an idea. Have fun and be creative!`,
                steps: [
                    '[NEXT] Brainstorm: What unique robot do you want to create?',
                    'List what your robot needs (sensors, motors, behaviors)',
                    'Write pseudocode (plan in words)',
                    'Start programming your robot',
                    'Test each part as you build it',
                    'Fix any problems you find',
                    '[TEXT] What makes your robot project special?'
                ],
                starterCode: '{}',
                challenge: 'Create, test, and demonstrate your robot project! Share what you built with others!',
                tags: ['robotics', 'project', 'creative', 'independent', 'masterpiece']
            }
        ]
    }
];
