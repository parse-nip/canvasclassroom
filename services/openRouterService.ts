
import { AILessonResponse, AICodeAnalysis, AIStepValidation, LessonType, CurriculumSuggestion, FullCurriculumResponse } from "../types";

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

export const generateLessonPlan = async (topic: string, level: string, type: LessonType, previousLessonsContext: string = ""): Promise<AILessonResponse | null> => {
  let typePrompt = "";
  if (type === 'Lesson') {
    typePrompt = `
      This is an INTERACTIVE LESSON.
      Goal: Teach a new concept through discovery.
      Starter Code: Provide working code but leave small parts for the student to change to see effects.
      Steps: 
        - Use [NEXT] for observation steps (e.g. "[NEXT] Run the code. What happens?").
        - Use [TEXT] for understanding checks (e.g. "[TEXT] Why did the circle move?").
        - Code tasks should be "Change X to Y" or "Uncomment this line".
      `;
  } else {
    typePrompt = `
      This is a CODING ASSIGNMENT (TEST).
      Goal: Test the student's ability to apply concepts.
      
      CONTEXT - The student has already learned:
      ${previousLessonsContext ? previousLessonsContext : "General p5.js concepts for this level."}

      Starter Code: MUST BE MINIMAL. Skeleton only. DO NOT PROVIDE THE SOLUTION.
      Steps: 
        - High-level requirements ONLY (e.g. "Draw a blue circle"). 
        - DO NOT say "Type fill(0,0,255)".
        - Make them figure out syntax.
      `;
  }

  const schemaDescription = `
  RETURN ONLY JSON. No markdown.
  Structure Example:
  ${JSON_EXAMPLE}
  `;

  const systemPrompt = `You are a Computer Science teacher creating content for 5th graders. 
  ${schemaDescription}`;

  const userPrompt = `Create a p5.js ${type}. Topic: "${topic}". Level: "${level}".
  ${typePrompt}
  
  CRITICAL INSTRUCTIONS:
  1. Audience: 10-year-olds. Simple, fun language.
  2. Starter Code: Must use \\n for newlines. Comments included.
  3. Steps: Use [NEXT] for pure observation steps if needed.
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
