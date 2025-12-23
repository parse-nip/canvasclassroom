
import { AILessonResponse, AICodeAnalysis, AIStepValidation, LessonType, CurriculumSuggestion, FullCurriculumResponse, ScratchProjectAnalysis, ScratchCurriculumResponse } from "../types";

// API Key must come from the environment variable
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Use a robust model for JSON generation
const MODEL_NAME = "x-ai/grok-4.1-fast";

// Helper to clean JSON output from models that might wrap it in markdown
const cleanJson = (text: string): string => {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return clean;
};

// Generic OpenRouter Call
async function callOpenRouter(messages: any[], jsonMode: boolean = false): Promise<string | null> {
  if (!apiKey) {
    console.error("OpenRouter API Key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.");
    throw new Error("OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables.");
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://canvasclassroom.app",
        "X-Title": "CanvasClassroom"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter API Error:", err);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("Network Error calling OpenRouter:", error);
    return null;
  }
}

const JSON_EXAMPLE = `
{
  "title": "Project: Bouncing Ball",
  "difficulty": "Beginner",
  "objective": "Apply variables and conditionals",
  "description": "Build a ball that bounces off all four walls.",
  "theory": "In this test, you will use what you learned about **Velocity** and **If Statements**.",
  "steps": [
    "Create variables for x, y, xSpeed, and ySpeed.",
    "Initialize the variables in setup().",
    "In draw(), move the ball by adding speed to position.",
    "Add boundary checks: if x > width, reverse xSpeed."
  ],
  "starterCode": "let x, y;\\n\\nfunction setup() {\\n  createCanvas(400, 400);\\n  // Initialize variables here\\n}\\n\\nfunction draw() {\\n  background(220);\\n  // Write your code here\\n}",
  "challenge": "Make the ball change color every time it hits a wall!",
  "tags": ["animation", "variables", "logic"]
}
`;

export const generateLessonPlan = async (
  topic: string, 
  level: string, 
  type: LessonType, 
  previousLessonsContext: string = "",
  editorType: 'p5' | 'scratch' = 'p5'
): Promise<AILessonResponse | null> => {
  const isScratch = editorType === 'scratch';
  
  // Detect if this is a robotics-related topic
  const roboticsKeywords = ['robot', 'robotics', 'ev3', 'lego', 'boost', 'microbit', 'micro:bit', 'makey makey', 'arduino', 'sensor', 'motor', 'servo', 'actuator', 'hardware', 'physical computing'];
  const isRobotics = roboticsKeywords.some(keyword => topic.toLowerCase().includes(keyword.toLowerCase()));
  
  let typePrompt = "";
  if (type === 'Lesson') {
    if (isScratch) {
      if (isRobotics) {
        typePrompt = `
        This is a SCRATCH ROBOTICS LESSON - PHYSICAL COMPUTING.
        Goal: Teach students to program physical robots/hardware using Scratch extensions.
        
        CRITICAL ROBOTICS REQUIREMENTS:
        - MUST use Scratch extensions (LEGO MINDSTORMS EV3, LEGO BOOST, micro:bit, Makey Makey, etc.)
        - Include connection instructions in theory (e.g. "First, connect your EV3 robot via Bluetooth")
        - Steps should guide students through:
          1. Adding the extension (e.g. "Click the 'Add Extension' button and select 'LEGO MINDSTORMS EV3'")
          2. Connecting hardware (e.g. "Click the 'Connect' button and select your robot")
          3. Using extension blocks (e.g. "Add a 'motor A on' block")
          4. Testing with physical robot
        - Starter Code: Empty project (use "{}" as starter code).
        - Theory should explain both the Scratch blocks AND what the robot will do physically.
        - Include safety reminders if applicable (e.g. "Make sure your robot has space to move!")
        - Tags MUST include: "robotics", "extensions", and the specific hardware name (e.g. "ev3", "microbit")
        `;
      } else {
        typePrompt = `
        This is an INTERACTIVE SCRATCH LESSON.
        Goal: Teach a new concept through discovery using visual blocks.
        Starter Code: Empty project (use "{}" as starter code).
        Steps: 
          - Use [NEXT] for observation steps (e.g. "[NEXT] Look at the sprite. What direction is it facing?").
          - Use [TEXT] for understanding checks (e.g. "[TEXT] What do you think 'move 10 steps' does?").
          - Block tasks should be specific (e.g. "Add a 'move 10 steps' block" or "Change the number to 50").
        `;
      }
    } else {
      typePrompt = `
        This is an INTERACTIVE LESSON.
        Goal: Teach a new concept through discovery.
        Starter Code: Provide working code but leave small parts for the student to change to see effects.
        Steps: 
          - Use [NEXT] for observation steps (e.g. "[NEXT] Run the code. What happens?").
          - Use [TEXT] for understanding checks (e.g. "[TEXT] Why did the circle move?").
          - Code tasks should be "Change X to Y" or "Uncomment this line".
        `;
    }
  } else {
    if (isScratch) {
      // Re-check robotics for assignments (already checked above, but keeping for clarity)
      const isRoboticsAssignment = roboticsKeywords.some(keyword => topic.toLowerCase().includes(keyword.toLowerCase()));
      
      if (isRoboticsAssignment) {
        typePrompt = `
        This is a SCRATCH ROBOTICS ASSIGNMENT (TEST) - INDEPENDENT WORK WITH PHYSICAL HARDWARE.
        Goal: Test the student's ability to program robots/hardware independently.
        
        CONTEXT - The student has already learned:
        ${previousLessonsContext ? previousLessonsContext : "Scratch robotics extensions and hardware connections."}

        Starter Code: Empty project (use "{}" as starter code).
        Steps: 
          - Project requirements as a checklist for physical robot behavior (e.g. "Make the robot move forward 50cm", "Program the robot to turn left when it detects an obstacle", "Use sensors to make the robot stop at a line").
          - 3-5 requirements total.
          - DO NOT list exact blocks or give solutions.
          - Requirements should describe PHYSICAL BEHAVIOR, not just code.
          - They work independently with their hardware and submit when done.
        `;
      } else {
        typePrompt = `
        This is a SCRATCH CODING ASSIGNMENT (TEST) - INDEPENDENT WORK.
        Goal: Test the student's ability to apply Scratch block concepts WITHOUT step-by-step help.
        
        CONTEXT - The student has already learned:
        ${previousLessonsContext ? previousLessonsContext : "Basic Scratch blocks for this level."}

        Starter Code: Empty project (use "{}" as starter code).
        Steps: 
          - Project requirements as a checklist (e.g. "Make the sprite move in a square", "Add a color-changing effect"). 
          - 3-5 requirements total.
          - DO NOT list exact blocks or give solutions.
          - They work independently and submit when done.
        `;
      }
    } else {
      typePrompt = `
        This is a CODING ASSIGNMENT (TEST) - INDEPENDENT WORK.
        Goal: Test the student's ability to apply concepts WITHOUT step-by-step help.
        
        CONTEXT - The student has already learned:
        ${previousLessonsContext ? previousLessonsContext : "General p5.js concepts for this level."}

        Starter Code: MUST BE MINIMAL. Skeleton only. DO NOT PROVIDE THE SOLUTION.
        Steps: 
          - Project requirements as a checklist (e.g. "Draw a blue circle", "Make it move").
          - 3-5 requirements total.
          - DO NOT give exact code or solutions.
          - They work independently and submit when done.
        `;
    }
  }

  const scratchExample = `
{
  "title": "My Moving Cat",
  "difficulty": "Beginner",
  "objective": "Learn to use motion blocks",
  "description": "Make the Scratch cat move across the screen.",
  "theory": "In Scratch, **motion blocks** let sprites move around the stage. The 'move 10 steps' block makes your sprite walk forward!",
  "steps": [
    "[NEXT] Click the green flag. Notice the sprite doesn't move yet.",
    "[TEXT] What color are the motion blocks in Scratch?",
    "Add a 'when flag clicked' event block.",
    "Connect a 'move 10 steps' block below it.",
    "Click the green flag to test your code."
  ],
  "starterCode": "{}",
  "challenge": "Can you make the cat move backwards? Hint: try negative numbers!",
  "tags": ["motion", "events", "sprites"]
}
`;

  const schemaDescription = `
  RETURN ONLY JSON. No markdown.
  Structure Example:
  ${isScratch ? scratchExample : JSON_EXAMPLE}
  `;

  const systemPrompt = `You are a Computer Science teacher creating content for 5th graders. 
  ${schemaDescription}`;

  const platformName = isScratch ? 'Scratch' : 'p5.js';
  
  let roboticsGuidance = '';
  if (isRobotics && isScratch) {
    roboticsGuidance = `
  
  ROBOTICS-SPECIFIC GUIDANCE:
  - Theory MUST include hardware connection instructions
  - Steps MUST guide students through adding extensions and connecting hardware
  - Include safety reminders (e.g. "Make sure robot has space to move!")
  - Explain what will happen PHYSICALLY, not just in code
  - Tags MUST include "robotics" and the hardware type (e.g. "ev3", "microbit")
  - If topic mentions specific hardware (EV3, BOOST, micro:bit), focus on that hardware's blocks
  `;
  }
  
  const userPrompt = `Create a ${platformName} ${type}. Topic: "${topic}". Level: "${level}".
  ${typePrompt}
  ${roboticsGuidance}
  
  CRITICAL INSTRUCTIONS:
  1. Audience: 10-year-olds. Simple, fun language.
  ${isScratch ? 
    '2. Starter Code: Always use "{}" for Scratch lessons.\n  3. Steps: Refer to blocks by name (e.g. "move 10 steps block", "turn right 15 degrees").' : 
    '2. Starter Code: Must use \\n for newlines. Comments included.\n  3. Steps: Use [NEXT] for pure observation steps if needed.'
  }
  4. Tags: 3-5 concepts.
  `;

  const text = await callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], true);

  if (!text) return null;

  try {
    return JSON.parse(cleanJson(text)) as AILessonResponse;
  } catch (e) {
    console.error("Failed to parse Lesson Plan JSON", e, text);
    return null;
  }
};

export const analyzeStudentCode = async (code: string, objective: string): Promise<AICodeAnalysis | null> => {
  const schemaDescription = `
  RETURN ONLY JSON. Structure:
  {
    "isCorrect": boolean,
    "hint": "Specific hint string",
    "encouragement": "High-five style string"
  }`;

  const systemPrompt = `You are a helpful coding buddy for kids. 
  CRITICAL: Never give the student the answer. Never write code in the hint.
  If the code is wrong, describe the logic error or point to the line number.
  Use analogies (e.g. "Did you forget to close the cookie jar? (Missing semicolon)")
  ${schemaDescription}`;

  const userPrompt = `Analyze this p5.js code. Objective: "${objective}".
  
  Code:
  ${code}
  
  If syntax errors, be gentle. Give a specific hint. DO NOT WRITE CODE.`;

  const text = await callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], true);

  if (!text) return null;

  try {
    return JSON.parse(cleanJson(text)) as AICodeAnalysis;
  } catch (e) {
    console.error("Failed to parse Analysis JSON", e);
    return null;
  }
};

export const validateStep = async (input: string, instruction: string): Promise<AIStepValidation | null> => {
  const schemaDescription = `
  RETURN ONLY JSON. Structure:
  {
    "passed": boolean,
    "feedback": "Simple feedback string"
  }`;

  const systemPrompt = `You are a kind but accurate judge for 10-year-olds. ${schemaDescription}`;
  const userPrompt = `Check if input follows instruction: "${instruction}"
  
  Input:
  ${input}
  
  - If instruction starts with [TEXT], check if text answer is reasonable.
  - If instruction is [NEXT], passed=true.
  - If code, check logic.
  
  CRITICAL IF FAILED: 
  - DO NOT provide the correct code string.
  - DO NOT say "You should type X".
  - Instead say "It looks like you missed X" or "Check your spelling of Y".
  `;

  const text = await callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], true);

  if (!text) return null;

  try {
    return JSON.parse(cleanJson(text)) as AIStepValidation;
  } catch (e) {
    console.error("Failed to parse Validation JSON", e);
    return null;
  }
};

export const explainError = async (error: string, code: string): Promise<string | null> => {
  const systemPrompt = `You are a helpful coding tutor for kids. 
  Keep explanations extremely short (1-2 sentences).
  DO NOT fix the code for them. 
  Explain *why* it broke.`;

  const userPrompt = `Explain this p5.js console error to a 10-year-old.
  
  Error: "${error}"
  Code:
  ${code}`;

  const text = await callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ]);

  return text;
};

export const suggestCurriculum = async (existingLessons: any[]): Promise<CurriculumSuggestion[] | null> => {
  const schemaDescription = `
    RETURN ONLY JSON OBJECT. Structure:
    {
      "suggestions": [
        {
          "topic": "Topic Name",
          "reason": "Why this is the logical next step",
          "difficulty": "Beginner" | "Intermediate" | "Advanced"
        }
      ]
    }
    `;

  const systemPrompt = `You are a Curriculum Director for a coding school (p5.js). 
    Analyze the existing lessons and suggest 3 logical next topics to teach.
    Gap analysis: If they know shapes but not variables, suggest variables. If they know variables, suggest animation.
    ${schemaDescription}`;

  // Summarize existing content for the AI
  const summary = existingLessons.map(l => `- ${l.title} (${l.difficulty}): ${l.objective} [Tags: ${l.tags?.join(', ')}]`).join('\n');
  const userPrompt = `Here is the current curriculum:\n${summary || "No lessons yet. Suggest 3 beginner topics."}`;

  const text = await callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], true);

  if (!text) return null;

  try {
    const cleanText = cleanJson(text);
    const parsed = JSON.parse(cleanText);

    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions as CurriculumSuggestion[];
    }

    // Fallback if model ignored structure and sent array directly
    if (Array.isArray(parsed)) {
      return parsed as CurriculumSuggestion[];
    }

    return null;
  } catch (e) {
    console.error("Failed to parse Suggestions JSON", e);
    return null;
  }
};

export const generateFullCurriculum = async (theme: string, duration: string): Promise<FullCurriculumResponse | null> => {
  const schemaDescription = `
    RETURN ONLY VALID JSON. No markdown, no code blocks, just pure JSON.
    Structure:
    {
      "courseTitle": "string (course name based on theme)",
      "description": "string (brief course description)",
      "units": [
        { "title": "string", "description": "string", "order": number }
      ],
      "lessons": [
        { 
          "unitIndex": number, 
          "title": "string", 
          "topic": "string", 
          "objective": "string", 
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "description": "string (1 sentence)",
          "theory": "string (markdown formatted, educational explanation)",
          "steps": ["string array of 4-5 guided steps"],
          "starterCode": "string (working p5.js code)",
          "challenge": "string (extension activity)",
          "tags": ["string array of 2-4 relevant tags"]
        }
      ]
    }
    `;

  const durationGuidance = duration === 'Workshop'
    ? '2-3 units with 2-3 lessons each (total 6-8 lessons)'
    : duration === 'Month'
      ? '4-5 units with 3-4 lessons each (total 12-16 lessons)'
      : '8-10 units with 3-5 lessons each (total 30-40 lessons)';

  const systemPrompt = `You are an expert p5.js curriculum designer for 10-12 year olds.
    Create engaging, pedagogically sound lessons that follow best practices in coding education.
    ${schemaDescription}`;

  const userPrompt = `Create a p5.js coding curriculum with theme: "${theme}"

DURATION: ${duration} (${durationGuidance})

CRITICAL LESSON FORMAT REQUIREMENTS:

1. **Theory** - Write in markdown with:
   - Bold headings using **Title**
   - Clear, simple explanations for kids
   - Code examples in backticks
   - Bullet points for lists
   - Example: "**RGB Color System**\\n\\nComputers mix colors using three values:\\n- **R**ed (0-255)\\n- **G**reen (0-255)"

2. **Steps** - Array of 4-5 guided instructions:
   - Start with observation: "[NEXT] Look at the code. What do you see?"
   - Include questions: "[TEXT] What color is (0, 255, 0)?"
   - Add coding tasks: "Change the circle to blue"
   - Build complexity: "Try mixing red and green to make yellow"
   - Example: ["[NEXT] See the red circle", "[TEXT] What color is (0, 255, 0)?", "Change the circle to blue", "Try mixing colors"]

3. **StarterCode** - Working p5.js code with:
   - setup() and draw() functions
   - Helpful comments explaining what code does
   - Something visible on screen
   - Room for students to experiment
   - Example: "function setup() {\\n  createCanvas(400, 400);\\n}\\n\\nfunction draw() {\\n  background(220);\\n  // Red circle\\n  fill(255, 0, 0);\\n  ellipse(200, 200, 100, 100);\\n}"

4. **Challenge** - Extension activity:
   - Creative and open-ended
   - Builds on lesson concepts
   - Encourages experimentation
   - Example: "Create a traffic light with red, yellow, and green circles!"

5. **Description** - One clear sentence about what students will learn

6. **Tags** - 2-4 relevant keywords (lowercase)

PEDAGOGICAL PROGRESSION:
- Start with fundamentals (canvas, shapes, colors)
- Build to interaction (mouse, keyboard)
- Progress to complexity (loops, variables, animation)
- End with creative projects

THEME INTEGRATION:
- Every lesson must relate to "${theme}"
- Use theme-appropriate examples in theory
- Create starter code that reflects the theme
- Design challenges that explore the theme creatively

EXAMPLE LESSON (for theme "Ocean Adventure"):
{
  "unitIndex": 0,
  "title": "Drawing Fish",
  "topic": "Basic Shapes",
  "objective": "Use ellipse() and triangle() to draw sea creatures",
  "difficulty": "Beginner",
  "description": "Learn to draw fish using basic shapes",
  "theory": "**Drawing Sea Creatures**\\n\\nFish are made of simple shapes!\\n- \`ellipse()\` for the body\\n- \`triangle()\` for the tail\\n- Small circles for eyes\\n\\nCombine shapes to create your ocean friends!",
  "steps": [
    "[NEXT] See the fish body (ellipse)",
    "Add a triangle for the tail",
    "Draw two small circles for eyes",
    "[TEXT] What other shapes could you add?",
    "Try making a different sea creature!"
  ],
  "starterCode": "function setup() {\\n  createCanvas(400, 400);\\n}\\n\\nfunction draw() {\\n  background(100, 150, 255);\\n  \\n  // Fish body\\n  fill(255, 150, 0);\\n  ellipse(200, 200, 80, 50);\\n  \\n  // Add tail and eyes here!\\n}",
  "challenge": "Create a whole school of fish with different colors and sizes!",
  "tags": ["shapes", "ocean", "fish", "creative"]
}

Now create a complete curriculum for theme: "${theme}"`;

  const text = await callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], true);

  if (!text) return null;

  try {
    return JSON.parse(cleanJson(text)) as FullCurriculumResponse;
  } catch (e) {
    console.error("Failed to parse Curriculum JSON", e, text);
    return null;
  }
};

/**
 * Generate a full Scratch curriculum from a project analysis
 * This creates a series of lessons that teach students how to build the analyzed project from scratch
 */
export const generateCurriculumFromScratchProject = async (
  projectSummary: string,
  projectAnalysis: ScratchProjectAnalysis,
  lessonCount: number = 8
): Promise<ScratchCurriculumResponse | null> => {
  const schemaDescription = `
    RETURN ONLY VALID JSON. No markdown, no code blocks, just pure JSON.
    Structure:
    {
      "courseTitle": "string (course name based on project)",
      "description": "string (brief course description)",
      "projectType": "string (type of project: game, animation, story, art)",
      "units": [
        { "title": "string", "description": "string", "order": number }
      ],
      "lessons": [
        {
          "unitIndex": number,
          "title": "string",
          "topic": "string",
          "objective": "string",
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "description": "string (1 sentence)",
          "theory": "string (markdown formatted, educational explanation)",
          "steps": ["string array of 4-6 guided steps"],
          "starterCode": "string - ALWAYS use '{}' (empty JSON object) for all lessons",
          "challenge": "string (extension activity)",
          "tags": ["string array of 2-4 relevant tags"]
        }
      ]
    }
    `;

  // Determine unit structure based on complexity
  const complexityGuidance = projectAnalysis.complexity === 'Advanced'
    ? '3-4 units with 3-4 lessons each (total 10-14 lessons)'
    : projectAnalysis.complexity === 'Intermediate'
      ? '3 units with 2-3 lessons each (total 6-9 lessons)'
      : '2 units with 2-3 lessons each (total 4-6 lessons)';

  const systemPrompt = `You are an expert Scratch curriculum designer for 10-12 year olds.
    You are creating a PROGRESSIVE curriculum where students BUILD a complete Scratch project incrementally.
    Each lesson builds upon the previous lesson's completed code.
    The curriculum should be pedagogically sound, introducing concepts progressively.
    Each lesson teaches ONE new concept while preserving relevant work from previous lessons.

    CRITICAL: unitIndex values MUST be valid indices for the units array.
    If you create N units, valid unitIndex values are 0 through N-1.
    Never use unitIndex values >= number of units created.

    ${schemaDescription}`;

  const userPrompt = `Create a PROGRESSIVE Scratch curriculum that teaches students to build this project incrementally:

${projectSummary}

TARGET: ${lessonCount} lessons (${complexityGuidance})

CRITICAL CONSTRAINTS:
- unitIndex values MUST correspond to valid unit indices (0, 1, 2, etc.)
- If you create 3 units, valid unitIndex values are only: 0, 1, 2
- NEVER use unitIndex values that exceed the number of units you create

CURRICULUM DESIGN REQUIREMENTS:

1. **Progressive Building Approach**
   - Students start with an empty project and BUILD incrementally
   - Each lesson adds ONE new concept/feature while keeping relevant previous work
   - Lesson 1 starts with "{}" (empty project)
   - Lessons 2+ start with the completed code from the previous lesson
   - You decide what to preserve/modify/reset for each lesson's learning goals

2. **Smart Code Progression**
   - Preserve working code that supports new concepts
   - Modify or remove code that would interfere with learning the new concept
   - Reset/restart elements when introducing conflicting mechanics
   - Ensure each lesson focuses on ONE new concept without overwhelming complexity

3. **Unit Structure**
   - Unit 1: Foundation (basic movement, events, looks)
   - Unit 2: Core Mechanics (the main interactions/game logic)
   - Unit 3: Polish & Extensions (scoring, effects, finishing touches)

4. **Lesson Format for Scratch**
   - Theory: Explain the NEW concept with **bold headings**, bullet points
   - Steps: Use [NEXT] for observations, [TEXT] for questions
   - Steps: Reference blocks by exact name (e.g., "add a 'when flag clicked' block")
   - Starter Code: For Lesson 1 = "{}", for Lessons 2+ = completed code from previous lesson
   - Challenge: Creative extension of the lesson concept
   - Tags: Include concept keywords

5. **Progression Example** (for a "Catch the Apple" game):
   - Lesson 1: "Moving the Basket" - keyboard controls (starts empty)
   - Lesson 2: "The Falling Apple" - adds apple with gravity (keeps basket controls)
   - Lesson 3: "Catching Apples" - collision detection (keeps basket + falling apple)
   - Lesson 4: "Keeping Score" - variables (keeps all previous mechanics)
   - Lesson 5: "Game Over" - conditionals (keeps all previous mechanics)
   - Lesson 6: "Adding Polish" - sounds, effects (final complete game)

5. **Key Concepts Detected in This Project:**
   ${projectAnalysis.concepts.join(', ')}

6. **Blocks Used:**
   ${projectAnalysis.uniqueBlockTypes.slice(0, 15).join(', ')}

7. **Sprites:**
   ${projectAnalysis.sprites.filter(s => !s.isStage).map(s => s.name).join(', ')}

CRITICAL REQUIREMENTS:
- Each lesson MUST have starterCode: "{}" (empty JSON object string - do not generate complex JSON)
- DO NOT generate complex JSON in starterCode field
- DO NOT include robotics/hardware concepts unless the project uses them
- Build toward the FINAL PROJECT - the last lesson should help complete it
- Make it FUN and ENGAGING for kids!
- Be SMART about what code to preserve vs. reset for each lesson's learning goals

Create a curriculum where by the end, students can recreate "${projectAnalysis.title}":`;

  const text = await callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], true);

  if (!text) return null;

  try {
    return JSON.parse(cleanJson(text)) as ScratchCurriculumResponse;
  } catch (e) {
    console.error("Failed to parse Scratch Curriculum JSON", e, text);
    return null;
  }
};
