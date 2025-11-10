# AI-Powered Features Guide

## Overview

GPTeach.AI now includes elegant Grammarly-style AI suggestions powered by OpenRouter API. These features help teachers create comprehensive lesson plans with intelligent autocomplete suggestions based on curriculum data.

## Features Implemented

### 1. 🎯 AI Suggestion Popup (Grammarly-style)

**What it does:**
- Provides intelligent autocomplete suggestions when you click on any lesson plan field
- Beautiful, animated popup with elegant design
- Multiple suggestion types: AI-generated, curriculum-based, and template suggestions
- Shows confidence scores for AI suggestions

**How to use:**
1. Click or focus on any field in the lesson planner
2. Look for the emerald "AI Suggest" button in the top-right corner of the field
3. Click the button or press it from the bubble menu when text is selected
4. Browse through suggestions and click one to insert it
5. Press ESC to close the popup

**Features:**
- ✨ Smooth fade-in animations
- 🎨 Color-coded suggestion categories
- 📚 Direct integration with Alberta curriculum outcomes
- 🚀 Real-time AI generation using OpenRouter

### 2. 💬 AI Chat Interface

**What it does:**
- Contextual AI assistant that understands your current lesson plan
- Provides helpful advice, suggestions, and answers
- Clean ChatGPT-style interface

**How to use:**
1. Open the lesson planner (right panel is the chat interface)
2. Type your question or request
3. AI will respond with context-aware suggestions based on your lesson plan
4. Use quick prompts for common requests

**Features:**
- 🤖 Powered by Meta's Llama 3.2 model (free tier)
- 📝 Reads your current lesson plan for context
- 💡 Quick prompt buttons for common tasks
- 🔄 Loading indicators and smooth scrolling

### 3. 📊 Curriculum Data Integration

**What it does:**
- Loads and searches through mathematics outcomes (K-9)
- Provides curriculum-aligned suggestions for outcome fields
- Quotes directly from program of studies

**Data source:**
- `mathematics_outcomes_k9_complete.xlsx` in the public folder
- Automatically loaded on app start
- Searchable by grade, strand, or keyword

### 4. 🎨 Design Language

All features follow a modern, elegant design inspired by Grammarly and ChatGPT:
- Clean, minimal interfaces
- Smooth animations and transitions
- Emerald green accent color
- Glass morphism effects
- Dark mode support

## Technical Implementation

### Files Created/Modified

#### New Service Files:
1. **`src/services/openRouterService.ts`**
   - Handles all OpenRouter API calls
   - Generates contextual suggestions
   - Chat functionality with AI
   - Uses free Meta Llama 3.2 model

2. **`src/services/curriculumDataService.ts`**
   - Loads and parses Excel curriculum data
   - Provides search and filtering
   - Caches data for performance

#### New Components:
3. **`src/components/AISuggestionPopup.tsx`**
   - Beautiful popup component
   - Animated suggestion cards
   - Category badges and icons
   - Keyboard navigation (ESC to close)

#### Modified Components:
4. **`src/components/InlineToolbarEditor.tsx`**
   - Added AI suggestion trigger button
   - Integrated popup positioning
   - New props: `enableAISuggestions`, `context`

5. **`src/components/LessonPlanTemplate.tsx`**
   - Enabled AI suggestions for all cells
   - Loads curriculum data on mount
   - Builds context for AI

6. **`src/components/AIChatInterface.tsx`**
   - Real OpenRouter API integration
   - Context-aware conversations
   - Loading states and error handling

7. **`src/lib/types.ts`**
   - Fixed duplicate Plan type definition
   - Proper TypeScript types throughout

### API Configuration

The OpenRouter API key is configured in `src/services/openRouterService.ts`:
```typescript
const OPENROUTER_API_KEY = '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';
```

**Model used:** `meta-llama/llama-3.2-3b-instruct:free`
- Free tier model (no cost)
- Fast response times
- Good quality for education use cases

### Data Flow

```
User clicks field
    ↓
AI Suggest button appears
    ↓
User clicks button
    ↓
Popup shows with loading spinner
    ↓
Service calls OpenRouter API
    ↓
- Builds context from lesson plan
- Searches curriculum data (if outcome field)
- Generates 3-5 suggestions
    ↓
Popup displays suggestions with animations
    ↓
User clicks suggestion
    ↓
Content inserted into field
```

## Customization

### Adding More Curriculum Data

To add more curriculum files:
1. Place Excel files in the `public/` folder
2. Update `curriculumDataService.ts` to load multiple files
3. Add search/filter logic for different subjects

### Changing AI Model

To use a different model:
1. Edit `openRouterService.ts`
2. Change the `model` parameter in API calls
3. See OpenRouter docs for available models: https://openrouter.ai/docs

### Styling

All components use Tailwind CSS classes. Key color classes:
- `emerald-500/600` - Primary accent color
- `slate-50/100/...` - Neutral colors
- Animations: `animate-in fade-in slide-in-from-*`

## Performance

- **Curriculum data:** Loaded once on app start, cached in memory
- **API calls:** Throttled to avoid rate limits
- **Animations:** GPU-accelerated with CSS transforms
- **Loading states:** Prevent duplicate requests

## Future Enhancements

Potential improvements:
- [ ] Add more curriculum subjects (Science, ELA, Social Studies)
- [ ] Implement suggestion history/favorites
- [ ] Add keyboard shortcuts (Ctrl+Space to trigger suggestions)
- [ ] Voice input for chat interface
- [ ] Export lesson plans with AI-generated content tracking
- [ ] Collaborative editing with shared AI suggestions
- [ ] Custom AI prompts and templates

## Troubleshooting

### Suggestions not loading
- Check browser console for API errors
- Verify OpenRouter API key is valid
- Check network tab for failed requests

### Excel file not found
- Ensure file is in `public/` folder
- Check file name matches in `curriculumDataService.ts`
- Verify build process copies public files

### Slow AI responses
- Free model has rate limits
- Consider upgrading to paid OpenRouter tier
- Add request caching for common queries

## Credits

- **OpenRouter API:** AI model access
- **Alberta Education:** Curriculum outcomes data
- **Design inspiration:** Grammarly, ChatGPT
- **UI Framework:** React + TypeScript + Tailwind CSS

---

Built with ❤️ for teachers by teachers

