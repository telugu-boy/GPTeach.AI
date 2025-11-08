
# Lesson Planner UI

Glassmorphic React + TypeScript app for generating and editing lesson plans from prompts, templates, or curriculum outcomes (Alberta POS-ready, extensible to others).

## Stack
- React + TypeScript + Vite
- Redux Toolkit + localStorage persistence
- React Router
- TailwindCSS (glassmorphism)
- Tiptap (rich text)
- Lucide icons

## Getting Started
```bash
npm i
npm run dev
```

## Notes
- Exports: Markdown and JSON implemented; PDF/DOCX stubs left for later.
- "Generate" is a placeholder — wire your GPT call in `Builder.tsx`.
- Outcomes seeded with 2 examples; replace with real Alberta POS data JSON.
