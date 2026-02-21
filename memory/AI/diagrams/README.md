# Sometimes App - AI Context Diagrams

Architecture diagrams for AI assistants to quickly understand the codebase.

## Diagram Index

| File | Description | When to Reference |
|------|-------------|-------------------|
| `01-system-architecture.md` | FSD architecture, tech stack, data flow | Architecture questions, new features |
| `02-feature-modules.md` | 47 feature modules map, dependencies | Feature implementation, module structure |
| `03-navigation-flow.md` | Expo Router routes, navigation tree | Routing, deep links, new screens |
| `04-state-management.md` | Zustand stores, TanStack Query patterns | State handling, caching, persistence |
| `05-shared-layer.md` | UI components, hooks, utilities | Reusable components, common patterns |

## Quick Reference

### Tech Stack
- **Framework**: Expo 54, React Native 0.81, TypeScript 5.9
- **State**: Zustand 5.x + TanStack Query 5.x
- **Navigation**: Expo Router 6.x + React Navigation 7.x
- **Forms**: React Hook Form + Zod
- **Styling**: StyleSheet (NativeWind discouraged)

### Architecture Pattern
```
app/           → Expo Router (file-based routing)
src/features/  → 47 business logic modules (FSD)
src/widgets/   → 20 composite components
src/shared/    → 52 UI, 32 hooks, 35+ libs
```

### Key Import Aliases
```typescript
@/         → src/
@features/ → src/features/
@shared/   → src/shared/
@hooks/    → src/shared/hooks/
@ui/       → src/shared/ui/
@widgets/  → src/widgets/
```

## Usage Guide

### Architecture Questions
→ Start with `01-system-architecture.md`

### Adding New Feature
1. Check `02-feature-modules.md` for similar features
2. Follow FSD structure: `apis/`, `hooks/`, `queries/`, `ui/`
3. Check `05-shared-layer.md` for existing components

### Navigation/Routing
→ Reference `03-navigation-flow.md`

### State Management
→ Reference `04-state-management.md`
- Server state → TanStack Query
- Global state → Zustand stores
- Form state → react-hook-form + Zustand

### UI Components
→ Reference `05-shared-layer.md`
- Always check `src/shared/ui/` first
- Use `colors.ts` for color constants
- Follow StyleSheet patterns
