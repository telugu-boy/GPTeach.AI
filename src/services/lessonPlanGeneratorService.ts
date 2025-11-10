// Lesson Plan Generator Service - Generates complete lesson plans using AI
import { chatWithAI } from './openRouterService';
import type { Row } from '../lib/types';

export interface LessonPlanRequest {
  grade?: string;
  subject?: string;
  topic?: string;
  additionalInfo?: string;
}

// The service will now return a simple map of placeholder text to the new content.
export interface GeneratedLessonPlan {
  title: string;
  updates: Map<string, string>; 
}

export async function generateCompleteLessonPlan(
  request: LessonPlanRequest,
  currentRows: Row[]
): Promise<GeneratedLessonPlan> {
  try {
    const prompt = buildLessonPlanPrompt(request, currentRows);
    const aiResponse = await chatWithAI(prompt, '');
    const parsedPlan = parseLessonPlanResponse(aiResponse);
    return parsedPlan;
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw error;
  }
}

function buildLessonPlanPrompt(
  request: LessonPlanRequest,
  currentRows: Row[]
): string {
  const { grade, subject, topic, additionalInfo } = request;
  
  let prompt = `You are an expert teacher creating a lesson plan.
  
---
**REQUEST**
- Grade: ${grade || 'Not specified'}
- Subject: ${subject || 'Not specified'}
- Topic: ${topic || 'Not specified'}
- Details: ${additionalInfo || 'None'}
---
**INSTRUCTIONS**
1.  First, write "TITLE:" followed by a creative and appropriate title for the lesson.
2.  Next, for EACH field listed below, write "FIELD:" followed by the exact placeholder text in quotes, then "CONTENT:" followed by your generated content for that field.
3.  Ensure the content is relevant to the request and formatted with simple HTML like <p>, <ul>, <li>, <strong>.
---
**FIELDS TO COMPLETE**
`;
  
  // Use a Set to ensure we only ask for each unique placeholder once
  const placeholders = new Set<string>();
  currentRows.forEach(row => {
    row.cells.forEach(cell => {
      if (cell.placeholder) {
        placeholders.add(cell.placeholder);
      }
    });
  });

  placeholders.forEach(p => {
      prompt += `- "${p}"\n`;
  });

  prompt += `
---
**EXAMPLE RESPONSE**
TITLE: An Introduction to Photosynthesis
FIELD: "What will students know, understand, and be able to do?"
CONTENT: <p>Students will be able to define photosynthesis and identify its key reactants and products.</p>
FIELD: "Enter essential vocabulary..."
CONTENT: <ul><li>Chlorophyll</li><li>Stomata</li><li>Glucose</li></ul>
---
  
Generate the response now.`;

  return prompt;
}

/**
 * Parses the AI's simple text response into a structured map.
 * This is resilient and does NOT use JSON.parse, avoiding the previous error.
 */
function parseLessonPlanResponse(aiResponse: string): GeneratedLessonPlan {
    const updates = new Map<string, string>();
    let title = 'Generated Lesson Plan';

    const lines = aiResponse.split('\n');
    
    // Extract Title
    const titleLine = lines.find(line => line.startsWith('TITLE:'));
    if (titleLine) {
        title = titleLine.substring('TITLE:'.length).trim();
    }

    // Use a regex to capture FIELD and CONTENT blocks
    const fieldRegex = /FIELD: "([^"]+)"[\s\S]*?CONTENT: ([\s\S]*?)(?=(?:FIELD: |$))/g;
    let match;
    while ((match = fieldRegex.exec(aiResponse)) !== null) {
        const placeholder = match[1].trim();
        const content = match[2].trim();
        if (placeholder && content) {
            updates.set(placeholder, content);
        }
    }
    
    if (updates.size === 0) {
        // Fallback for when the AI fails to follow the format perfectly
        console.warn("AI did not follow the expected format. No updates were parsed.");
    }
    
    return { title, updates };
}