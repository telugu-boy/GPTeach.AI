// OpenRouter API Service
const OPENROUTER_API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Model preference order (free tiers first). We'll try each in order on 429/provider errors.
const MODEL_CANDIDATES = [
  'minimax/minimax-m2:free',                   // MiniMax M2 (free)
  'deepseek/deepseek-chat-v3-0324:free',       // DeepSeek V3 (free)
  'meta-llama/llama-3.2-3b-instruct:free',     // Llama 3.2 3B (free)
];
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1200; // initial backoff for 429/503

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

    const data = await callWithModelFallback({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    const aiResponse = data.choices[0]?.message?.content || '';
    
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

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatWithAI(
  message: string, 
  context: string, 
  conversationHistory?: ConversationMessage[]
): Promise<string> {
  try {
    const messages: ConversationMessage[] = [];
    
    // Add system message
    messages.push({ 
      role: 'system', 
      content: 'You are an AI teaching assistant helping teachers create lesson plans. Provide helpful, specific, and practical advice.' 
    });
    
    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }
    
    // Add current message
    if (context) {
      messages.push({ role: 'user', content: `Context: ${context}\n\nQuestion: ${message}` });
    } else {
      messages.push({ role: 'user', content: message });
    }
    
    const data = await callWithModelFallback({
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error chatting with AI:', error);
    const msg = (error as Error)?.message || '';
    if (msg.includes('429')) {
      return 'We are being rate limited by the model provider. Please wait a few seconds and try again.';
    }
    return 'Sorry, there was an error processing your request.';
  }
}

async function callWithModelFallback(baseBody: any): Promise<any> {
  const errors: string[] = [];
  for (const model of MODEL_CANDIDATES) {
    try {
      const body = { model, ...baseBody };
      const data = await callOpenRouterWithRetry(body);
      return data;
    } catch (err) {
      const message = (err as Error)?.message || 'Unknown error';
      errors.push(`[${model}] ${message}`);
      // Only fall through on rate limit / provider errors; otherwise rethrow
      if (!message.includes('429') && !message.toLowerCase().includes('provider')) {
        throw err;
      }
      // continue to next model
    }
  }
  throw new Error(`All models failed:\n${errors.join('\n')}`);
}

async function callOpenRouterWithRetry(body: any): Promise<any> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt++;
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GPTeach.AI',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return await response.json();
    }

    // Parse error for decision
    const status = response.status;
    const errorPayload = await safeParseError(response);
    const message = buildErrorMessage(errorPayload, status);

    // Handle rate limits / transient errors with backoff
    if ((status === 429 || status === 503) && attempt < MAX_RETRIES) {
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterMs = retryAfterHeader ? parseFloat(retryAfterHeader) * 1000 : undefined;
      const backoff = retryAfterMs ?? (BASE_BACKOFF_MS * Math.pow(2, attempt - 1)) + jitter(200);
      await sleep(backoff);
      continue;
    }

    throw new Error(message);
  }
}

async function safeParseError(response: Response): Promise<any | null> {
  try {
    return await response.json();
  } catch {
    try {
      const text = await response.text();
      return text ? { error: { message: text } } : null;
    } catch {
      return null;
    }
  }
}

function buildErrorMessage(payload: any | null, status: number): string {
  if (payload?.error?.message) {
    return `OpenRouter API error (${status}): ${payload.error.message}`;
  }
  return `OpenRouter API error (${status})`;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jitter(maxJitterMs: number): number {
  return Math.floor(Math.random() * maxJitterMs);
}

