# Claude Code Instructions

## After making changes

- Always `git push` after committing changes
- Run `npm run build` to verify no TypeScript errors before pushing

## Project structure

- Vue 3 + TypeScript + Vite
- Tailwind CSS + DaisyUI for styling
- Supabase for database
- PWA enabled

## Terminology

- "Cycle" (not "Phase") for training periods
- French UI language

## Key files

- `src/App.vue` - Main app component
- `src/components/WeekCalendar.vue` - Calendar view
- `src/components/FileImport.vue` - Planning modal with coach prompt
- `src/components/TrainingPhasesManager.vue` - Cycles management
- `src/composables/useSupabase.ts` - Database operations
- `supabase/schema.sql` - Database schema
