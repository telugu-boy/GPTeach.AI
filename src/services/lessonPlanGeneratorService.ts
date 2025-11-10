// Lesson Plan Generator Service - Generates complete lesson plans using AI
import { chatWithAI, type ConversationMessage } from './geminiService';
import { getOutcomesByGrade, loadCurriculumData, type CurriculumOutcome } from './curriculumDataService';
import type { Row } from '../lib/types';

export interface LessonPlanRequest {
  grade?: string;
  subject?: string;
  topic?: string;
  duration?: string;
  additionalInfo?: string;
}

export interface GeneratedLessonPlan {
  title: string;
  updates: Array<{
    rowId: string;
    cellId: string;
    content: string;
  }>;
}

export async function generateCompleteLessonPlan(
  request: LessonPlanRequest,
  currentRows: Row[]
): Promise<GeneratedLessonPlan> {
  try {
    // Load curriculum data
    await loadCurriculumData();
    
    // Get relevant outcomes if grade is specified
    let outcomesContext = '';
    if (request.grade) {
      const outcomes = getOutcomesByGrade(request.grade);
      outcomesContext = outcomes.slice(0, 5).map(o => 
        `${o.outcome}: ${o.description}`
      ).join('\n');
    }

    // Build a comprehensive prompt
    const prompt = buildLessonPlanPrompt(request, currentRows, outcomesContext);
    
    // Get AI response
    const aiResponse = await chatWithAI(prompt, '');
    
    // Parse the response and match to fields
    const updates = parseLessonPlanResponse(aiResponse, currentRows);
    
    // Generate title
    const title = generateTitle(request);
    
    return {
      title,
      updates,
    };
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw error;
  }
}

function buildLessonPlanPrompt(
  request: LessonPlanRequest,
  currentRows: Row[],
  outcomesContext: string
): string {
  const { grade, subject, topic, duration, additionalInfo } = request;
  
  let prompt = `You are an expert teacher creating a detailed lesson plan. Generate content for each field in the lesson plan based on the following requirements:\n\n`;
  
  if (grade) prompt += `Grade: ${grade}\n`;
  if (subject) prompt += `Subject: ${subject}\n`;
  if (topic) prompt += `Topic: ${topic}\n`;
  if (duration) prompt += `Duration: ${duration}\n`;
  if (additionalInfo) prompt += `Additional Info: ${additionalInfo}\n`;
  
  if (outcomesContext) {
    prompt += `\nRelevant Curriculum Outcomes:\n${outcomesContext}\n`;
  }
  
  prompt += `\n\nLesson Plan Fields:\n`;
  
  // List all the fields from the current rows
  currentRows.forEach((row, rowIndex) => {
    row.cells.forEach((cell, cellIndex) => {
      if (cell.placeholder && !cell.placeholder.includes('Time for activity')) {
        prompt += `${rowIndex + 1}.${cellIndex + 1}. ${cell.placeholder}\n`;
      }
    });
  });
  
  prompt += `\n\nIMPORTANT INSTRUCTIONS:
- Provide specific, detailed, and practical content for each field
- For outcome fields, quote directly from the curriculum provided above
- Make the lesson age-appropriate for the grade level
- Include specific activities, not just generic descriptions
- Format your response as a numbered list matching the fields above
- Each response should be 1-3 sentences
- Use HTML tags like <strong>, <em>, <ul>, <li> where appropriate

Generate the lesson plan content now:`;

  return prompt;
}

function parseLessonPlanResponse(aiResponse: string, currentRows: Row[]): Array<{ rowId: string; cellId: string; content: string }> {
  const updates: Array<{ rowId: string; cellId: string; content: string }> = [];
  
  // Split response into lines
  const lines = aiResponse.split('\n').filter(line => line.trim());
  
  // Try to match numbered items (e.g., "1.1.", "1.2.", etc.)
  const numberedPattern = /^(\d+)\.(\d+)\.\s*(.+)$/;
  
  // Create a flat list of all cells with their indices
  const cellMap: Array<{ rowId: string; cellId: string; rowIndex: number; cellIndex: number }> = [];
  currentRows.forEach((row, rowIndex) => {
    row.cells.forEach((cell, cellIndex) => {
      cellMap.push({
        rowId: row.id,
        cellId: cell.id,
        rowIndex,
        cellIndex,
      });
    });
  });
  
  lines.forEach(line => {
    const match = line.match(numberedPattern);
    if (match) {
      const rowIndex = parseInt(match[1]) - 1;
      const cellIndex = parseInt(match[2]) - 1;
      const content = match[3].trim();
      
      // Find the corresponding cell
      const targetCell = cellMap.find(
        c => c.rowIndex === rowIndex && c.cellIndex === cellIndex
      );
      
      if (targetCell && content) {
        updates.push({
          rowId: targetCell.rowId,
          cellId: targetCell.cellId,
          content,
        });
      }
    }
  });
  
  // If numbered parsing didn't work well, try simple sequential matching
  if (updates.length < cellMap.length * 0.3) {
    // Clear previous attempts
    updates.length = 0;
    
    // Filter out header/label cells and match sequentially
    let contentIndex = 0;
    const contentLines = lines.filter(line => 
      line.length > 10 && !line.match(/^(Grade|Date|School|Name):/i)
    );
    
    currentRows.forEach(row => {
      row.cells.forEach(cell => {
        // Skip cells that are just labels
        if (!cell.content?.includes('<strong>') && contentIndex < contentLines.length) {
          updates.push({
            rowId: row.id,
            cellId: cell.id,
            content: contentLines[contentIndex].replace(/^\d+\.\s*/, '').trim(),
          });
          contentIndex++;
        }
      });
    });
  }
  
  return updates;
}

function generateTitle(request: LessonPlanRequest): string {
  const parts: string[] = [];
  
  if (request.grade) parts.push(`Grade ${request.grade}`);
  if (request.subject) parts.push(request.subject);
  if (request.topic) parts.push(request.topic);
  
  return parts.length > 0 ? parts.join(' - ') : 'Generated Lesson Plan';
}

export async function generateFieldContent(
  placeholder: string,
  request: LessonPlanRequest,
  context: string,
  conversationHistory?: ConversationMessage[]
): Promise<string> {
  try {
    await loadCurriculumData();
    
    // Convert conversation history to Gemini format (assistant -> model)
    const geminiHistory: ConversationMessage[] = conversationHistory?.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts
    })) || [];
    
    let prompt = `IMPORTANT: I need you to fill in ONE SPECIFIC FIELD of a lesson plan.

Field to complete: "${placeholder}"

Lesson plan details:`;
    
    if (request.grade) prompt += `\n- Grade: ${request.grade}`;
    if (request.subject) prompt += `\n- Subject: ${request.subject}`;
    if (request.topic) prompt += `\n- Topic: ${request.topic}`;
    
    if (context) {
      prompt += `\n\nLesson Context:\n${context}\n`;
    }
    
    // Very explicit field guidance to prevent confusion
    const lower = placeholder.toLowerCase();
    if (lower.includes('grade') && lower.includes('class')) {
      prompt += `\n\nFIELD TYPE: Grade and Class Name
REQUIRED OUTPUT: Grade level and class identifier (e.g., "Grade 5 – Class 5B")
DO NOT INCLUDE: Dates, times, school names, or any other information
EXAMPLE: "Grade 5 – Class 5A"`;
    } else if (lower.includes('date')) {
      prompt += `\n\nFIELD TYPE: Date
REQUIRED OUTPUT: A calendar date only (e.g., "March 13, 2025" or "April 15, 2025")
DO NOT INCLUDE: Grade levels, class names, school names, times, or durations
EXAMPLE: "April 12, 2025"`;
    } else if (lower.includes('school')) {
      prompt += `\n\nFIELD TYPE: School Name
REQUIRED OUTPUT: Name of the school only (e.g., "Rossland Elementary School" or "Rossland School")
DO NOT INCLUDE: Curriculum subjects, course levels, dates, or times
KEEP IT: Short and simple (2-4 words max)
EXAMPLE: "Rossland School"`;
    } else if (lower.includes('lesson time') || lower.includes('time') && !lower.includes('activity')) {
      prompt += `\n\nFIELD TYPE: Lesson Duration/Time
REQUIRED OUTPUT: Time duration only (e.g., "60 minutes" or "9:00 AM - 10:00 AM" or "45-60 minutes")
DO NOT INCLUDE: School names, dates, grade levels, or curriculum content
EXAMPLE: "60 minutes" or "9:00 AM - 10:00 AM"`;
    } else if (lower.includes('name')) {
      prompt += `\n\nFIELD TYPE: Lesson Name/Title
REQUIRED OUTPUT: A descriptive title for this specific lesson
EXAMPLE: "Introduction to Fractions: Parts of a Whole"`;
    } else if (lower.includes('course') || lower.includes('level')) {
      prompt += `\n\nFIELD TYPE: Course/Subject Level
REQUIRED OUTPUT: Subject area and level (e.g., "Mathematics – Grade 5" or "Grade 5 Mathematics")
EXAMPLE: "Mathematics – Grade 5"`;
    }

    if (placeholder.toLowerCase().includes('outcome')) {
      const outcomes = request.grade ? getOutcomesByGrade(request.grade) : [];
      if (outcomes.length > 0) {
        prompt += `\n\nRelevant Curriculum Outcomes:\n`;
        outcomes.slice(0, 6).forEach(o => {
          prompt += `- ${o.outcome}: ${o.description}\n`;
        });
        prompt += `\nQuote directly from these outcomes.`;
      }
    }
    
    prompt += `\n\nOutput Requirements:
- Be concise: 1–2 sentences OR a short bullet list (max 3 bullets)
- Return valid minimal HTML only (<p>, <ul>, <li>, <strong>, <em>)
- Do not include headings or restate the field label
- Focus ONLY on the specific field type described above
- DO NOT mix content from different field types`;
    
    const response = await chatWithAI(prompt, '', geminiHistory);
    return response.trim();
  } catch (error) {
    console.error('Error generating field content:', error);
    throw error;
  }
}

