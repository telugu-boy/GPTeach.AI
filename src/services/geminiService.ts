// Google Gemini AI Service
import { GoogleGenerativeAI } from '@google/generative-ai';

// In Vite, environment variables are accessed via import.meta.env
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.error('Gemini API key is missing. Please check:');
  console.error('1. .env file exists in the project root');
  console.error('2. VITE_GEMINI_API_KEY is set in .env');
  console.error('3. Dev server was restarted after creating/modifying .env');
  throw new Error(
    'Gemini API key is missing. Set VITE_GEMINI_API_KEY in your .env file and restart the dev server.'
  );
}

const MODEL_NAME = 'gemini-2.5-flash';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface ConversationMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface SuggestionRequest {
  placeholder: string;
  currentContent: string;
  context: string;
  outcomesData?: string[];
}

export interface Suggestion {
  id: string;
  text: string;
  category: 'ai' | 'template' | 'outcome';
  confidence?: number;
}

export async function generateSuggestions(request: SuggestionRequest): Promise<Suggestion[]> {
  try {
    const systemPrompt = buildSystemPrompt(request);
    const userPrompt = buildUserPrompt(request);

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = result.response;
    const aiResponse = response.text();
    
    return parseSuggestions(aiResponse, request);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return getFallbackSuggestions(request);
  }
}

function buildSystemPrompt(request: SuggestionRequest): string {
  let prompt = `You are an AI assistant helping teachers create lesson plans. Generate 3-5 specific, helpful suggestions for the "${request.placeholder}" field.`;
  
  if (request.outcomesData && request.outcomesData.length > 0) {
    prompt += `\n\nAvailable curriculum outcomes:\n${request.outcomesData.slice(0, 10).join('\n')}`;
  }
  
  prompt += `\n\nRules:
- Each suggestion should be on a new line
- Start each suggestion with a dash (-)
- Keep suggestions concise (1-2 sentences)
- Make them specific and actionable
- For outcome fields, quote exactly from the curriculum
- For other fields, provide practical examples`;
  
  return prompt;
}

function buildUserPrompt(request: SuggestionRequest): string {
  let prompt = `Field: ${request.placeholder}\n`;
  
  if (request.currentContent) {
    prompt += `Current content: ${request.currentContent}\n`;
  }
  
  if (request.context) {
    prompt += `Context: ${request.context}\n`;
  }
  
  prompt += `\nGenerate helpful suggestions:`;
  
  return prompt;
}

function parseSuggestions(aiResponse: string, request: SuggestionRequest): Suggestion[] {
  const lines = aiResponse.split('\n').filter(line => line.trim().startsWith('-'));
  
  return lines.slice(0, 5).map((line, index) => ({
    id: `ai-${Date.now()}-${index}`,
    text: line.replace(/^-\s*/, '').trim(),
    category: request.placeholder.toLowerCase().includes('outcome') ? 'outcome' : 'ai',
    confidence: 0.9 - (index * 0.1),
  }));
}

function getFallbackSuggestions(request: SuggestionRequest): Suggestion[] {
  const fallbacks: Record<string, string[]> = {
    date: ['Today\'s date', 'MM/DD/YYYY', new Date().toLocaleDateString()],
    grade: ['Grade 5', 'Grade 6-7', 'Grade 9'],
    name: ['Your Name', 'Teacher Name'],
    'course/level': ['Mathematics', 'Science', 'English Language Arts'],
    school: ['Your School Name'],
    'lesson time': ['45 minutes', '60 minutes', '90 minutes'],
    outcome: [
      'Students will understand...',
      'Students will be able to...',
      'Students will demonstrate...',
    ],
    goal: [
      'Students will understand the concept of...',
      'Students will be able to apply...',
      'Students will demonstrate mastery of...',
    ],
    resources: ['Textbooks', 'Worksheets', 'Digital tools', 'Manipulatives'],
  };
  
  const key = Object.keys(fallbacks).find(k => 
    request.placeholder.toLowerCase().includes(k.toLowerCase())
  );
  
  const suggestions = key ? fallbacks[key] : ['Add your content here...'];
  
  return suggestions.map((text, index) => ({
    id: `fallback-${Date.now()}-${index}`,
    text,
    category: 'template' as const,
  }));
}

/**
 * Chat with Gemini AI with conversation history support
 * This maintains context across multiple exchanges
 */
export async function chatWithAI(
  message: string,
  context: string,
  conversationHistory?: ConversationMessage[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    // Build the conversation history for Gemini's chat format
    const history: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];
    
    if (conversationHistory && conversationHistory.length > 0) {
      // Convert our conversation history to Gemini format
      for (const msg of conversationHistory) {
        history.push({
          role: msg.role,
          parts: [{ text: typeof msg.parts === 'string' ? msg.parts : JSON.stringify(msg.parts) }]
        });
      }
    }

    // Start a chat session with history
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    // Build the prompt with context
    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${message}`
      : message;

    // Send the message
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text() || 'Sorry, I could not generate a response.';
    
  } catch (error) {
    console.error('Error chatting with Gemini AI:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return 'We are being rate limited. Please wait a few seconds and try again.';
    }
    if (errorMessage.includes('SAFETY')) {
      return 'The response was blocked by safety filters. Please try rephrasing your request.';
    }
    
    return 'Sorry, there was an error processing your request: ' + errorMessage;
  }
}

