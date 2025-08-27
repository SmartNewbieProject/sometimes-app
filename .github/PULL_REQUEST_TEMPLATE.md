# Pull Request Template

## Summary
- Briefly explain the change and motivation.

## Linked Issues
- Closes #123

## Changes
- High-level bullet list of key changes.

## Screenshots / Recordings (if UI)
- Before/After images or a short clip.

## Testing Plan
- Commands run: `npm test`, `npm run lint`, `npx biome check --apply .`
- Manual checks (platforms, routes, edge cases):

## Checklist
- [ ] PR title follows Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`)
- [ ] Tests added/updated and pass locally (`npm test`)
- [ ] Lint passes (`npm run lint`) and imports organized
- [ ] Formatting matches Biome rules (tabs, width 100, single quotes)
- [ ] TypeScript strict: no new `any`/ts-ignore without justification
- [ ] Uses path aliases where applicable (e.g., `@ui/*`, `@features/*`)
- [ ] App runs locally (`npm start`) on the target platform(s)
- [ ] No secrets/keys committed; configuration documented (use `.env`, EAS/GitHub Secrets)
- [ ] Docs updated if needed (README, AGENTS.md)
- [ ] CI target branch correct for releases (`deploy/ios`, `deploy/android`, or `deploy`)

## Breaking Changes
- Describe impact and migration steps, if any.

## Release Notes (optional)
- User-facing summary for changelog.
