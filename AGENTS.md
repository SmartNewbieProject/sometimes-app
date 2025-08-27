# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens and layouts (e.g., `_layout.tsx`, `index.tsx`, folders like `auth/`, `home/`).
- `src/`: Feature-sliced modules — `features/`, `entities/`, `widgets/`, `shared/` (`ui/`, `hooks/`, `utils/`, `constants/`). Path aliases in `tsconfig.json` (e.g., `@features/*`, `@ui/*`).
- `__tests__/`: Jest tests (unit and component).
- `assets/`: Static assets. Native projects in `android/` and `ios/`.
- Config highlights: `app.json` (Expo), `metro.config.js` (SVG/nativewind), `biome.json` (format/lint), `tailwind.config.js`, `jest.config.js`.

## Build, Test, and Development Commands
- Install: `npm install`
- Dev server: `npm start` (Expo on port 3000). Platform run: `npm run android`, `npm run ios`, `npm run web`.
- Tests: `npm test` or `npm run test:watch` (Jest + `jest-expo`).
- Lint: `npm run lint` (ESLint via Expo). Format/lint with Biome: `npx biome check --apply .`
- Release: EAS builds via CI or local: `eas build --platform ios|android --profile production` (see `.github/workflows/` and `eas.json`).

## Coding Style & Naming Conventions
- TypeScript strict mode. Prefer functional React components.
- Biome formatting: tabs, width 100, single quotes. Keep imports organized (Biome `organizeImports`).
- ESLint: `eslint-config-expo` defaults; fix warnings before PR.
- Naming: PascalCase for components, camelCase for variables/functions, kebab-case for route folders. Co-locate component files as `index.tsx` inside feature folders.
- Imports use aliases (example): `import { Button } from '@ui/button'`.

## Testing Guidelines
- Framework: Jest + `jest-expo`; components with `@testing-library/react-native`.
- File names: `*.test.ts(x)` or `*.spec.ts(x)` in `__tests__/` or alongside sources (Jest regex supports both).
- Mocks and setup: `jest.setup.js` (mocks for `expo-router`, AsyncStorage, Reanimated, Haptics).
- Aim to cover business logic (`src/shared/utils`) and critical UI states.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`). Example: `feat(auth): add OTP screen (#123)`.
- Branches: Use topic branches (`feature/<scope>`, `fix/<scope>`). Releases are automated on pushes to `deploy/ios`, `deploy/android`, or `deploy`.
- PRs: Include a clear summary, linked issues, screenshots for UI changes, and test plan. Ensure `npm test` and `npm run lint` pass.
- Versioning: A Husky pre-commit on `main` bumps `expo.version` in `app.json` automatically.

## Security & Configuration Tips
- Do not commit secrets. Use `.env` locally; use EAS/GitHub Secrets for CI (`EAS_ACCESS_TOKEN`, ASC/Android keys). Prefer `EXPO_PUBLIC_*` for public runtime envs.
