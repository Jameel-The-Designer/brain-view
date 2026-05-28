# BrainView — Project Instructions

## Deploy After Every Push

After every `git push`, **always** verify the Vercel deployment:

1. Use `mcp__593858fc-84ed-48f7-bdb8-7d7ae927a164__list_deployments` with:
   - `projectId`: `prj_Yp69OCpxqcGvdvQyB9qCXvV1eVhT`
   - `teamId`: `team_DIlQbLMkj8sBAVVz1XJ0bnQY`
2. Confirm the latest deployment state is `READY`.
3. Report the deployment URL to the user.

Do not consider a task complete until Vercel shows READY.

## Git Branch

Develop on branch: `claude/redesign-brainview-ui-qx9xl`
Push target: `origin main` (triggers Vercel webhook)

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 (`@theme` directive, `oklch()` colors)
- Framer Motion
- Supabase (real-time hooks)

## Key IDs

- Vercel project: `prj_Yp69OCpxqcGvdvQyB9qCXvV1eVhT`
- Vercel team: `team_DIlQbLMkj8sBAVVz1XJ0bnQY`
