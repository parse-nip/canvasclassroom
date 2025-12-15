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
    }
];
