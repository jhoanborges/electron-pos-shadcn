# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a POS (Point of Sale) Electron desktop application built with React, TypeScript, and shadcn/ui components. The app uses SQLite for local data storage and Redux for state management, providing an offline-first retail experience.

## Development Commands

```bash
npm run start              # Start app in development mode
npm run lint              # Run ESLint
npm run format            # Check formatting with Prettier
npm run format:write      # Format code with Prettier
npm run test              # Run Vitest unit tests
npm run test:watch        # Run Vitest in watch mode
npm run test:e2e          # Run Playwright E2E tests (requires build first)
npm run test:all          # Run all tests
npm run package           # Package app into executable
npm run make              # Create platform-specific distributables
```

**Important**: Playwright tests require the app to be built first (`npm run package` or `npm run make`).

## Architecture

### Electron Process Architecture

The app follows Electron's multi-process architecture with strict context isolation:

- **Main Process** (`src/main.ts`): Node.js process handling SQLite database, IPC, and native OS features
- **Renderer Process** (`src/renderer.ts`): Chromium browser running React UI
- **Preload Script** (`src/preload.ts`): Secure bridge between main and renderer via `contextBridge`

### IPC Communication Pattern

All main-renderer communication follows a consistent pattern in `src/helpers/ipc/`:

```
src/helpers/ipc/
├── {feature}/
│   ├── {feature}-channels.ts    # Channel name constants
│   ├── {feature}-listeners.ts   # Main process ipcMain handlers
│   └── {feature}-context.ts     # Renderer contextBridge exposure
├── context-exposer.ts           # Registers all contexts
└── listeners-register.ts        # Registers all IPC handlers
```

**Adding new IPC functionality:**
1. Create feature folder in `src/helpers/ipc/`
2. Define channel constants in `*-channels.ts`
3. Implement `ipcMain.handle()` in `*-listeners.ts`
4. Expose via `contextBridge.exposeInMainWorld()` in `*-context.ts`
5. Register in `context-exposer.ts` and `listeners-register.ts`
6. Add TypeScript types to `src/types.d.ts` for `window.*` API

**Example**: See `src/helpers/ipc/database/` for full implementation.

### Database Layer

SQLite database managed via better-sqlite3 (synchronous API):

- **Location**: `{userData}/pos-database.db`
- **Initialization**: `src/helpers/database/db.ts` - called on app startup
- **Operations**: `src/helpers/database/operations.ts` - CRUD functions
- **Schema**: Products and Categories tables with foreign keys
- **IPC Layer**: `src/helpers/ipc/database/` - exposes DB operations to renderer

**Important**: Database is initialized synchronously in `main.ts` before window creation. All native modules (like better-sqlite3) must be marked as `external` in `vite.main.config.mts`.

### State Management

- **Redux Toolkit**: Global state in `src/redux/`
  - `store.ts`: Configure store with redux-persist
  - `slices/cartSlice.ts`: POS cart state and actions
- **Redux Persist**: Cart data persisted to localStorage (survives app restarts)
- **SWR**: Data fetching/caching for products (`src/lib/swr/`)
  - Uses IPC instead of HTTP requests
  - Provides automatic revalidation and caching

### Routing

TanStack Router with file-based routing:
- Route files in `src/routes/`
- `src/routes/__root.tsx`: Root layout with `BaseLayout`
- `src/routeTree.gen.ts`: Auto-generated, don't edit manually
- Routes: `/` (POS), `/products` (management), `/second` (template example)

### UI Structure

- **Layouts**: `src/layouts/BaseLayout.tsx` - Main flex layout preventing OS taskbar overlap
- **Components**:
  - `src/components/ui/`: shadcn/ui primitives
  - `src/components/pos/`: POS-specific components
  - `src/components/template/`: Navigation, theme toggle, etc.

**Critical Layout Rules**:
- Use `h-full` instead of `h-screen` inside BaseLayout (which uses flex)
- Product grid should be responsive: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- Cart should be sticky on desktop: `md:sticky md:top-0 md:h-screen`

## Key Technical Decisions

### Native Modules
When adding native Node.js modules (like better-sqlite3):
1. Install the module
2. Run `npx @electron/rebuild -f -w {module-name}`
3. Add to `vite.main.config.mts` `rollupOptions.external` array

### Context Isolation
- Always use `contextBridge.exposeInMainWorld()` - never disable context isolation
- Never use `@electron/remote` - use IPC instead
- All window.* APIs must be typed in `src/types.d.ts`

### Custom Title Bar
App uses hidden title bar with custom implementation:
- `src/components/DragWindowRegion.tsx`: Draggable title bar region
- Window controls handled via IPC in `src/helpers/ipc/window/`

### Theme System
- Dark/light mode via `nativeTheme` API
- Theme state synced between main/renderer processes
- Toggle component in navigation with reactive icon updates

## File Structure Conventions

```
src/
├── main.ts                    # Main process entry - initializes DB, creates window
├── preload.ts                 # Exposes IPC contexts to renderer
├── renderer.ts                # Renderer entry point
├── App.tsx                    # Root component with Redux/Router providers
├── components/
│   ├── pos/                   # POS feature components
│   ├── ui/                    # shadcn/ui components (auto-generated)
│   └── template/              # App-wide components (nav, theme, etc.)
├── helpers/
│   ├── database/              # SQLite logic (main process only)
│   └── ipc/                   # IPC communication modules
├── layouts/                   # Layout components
├── lib/
│   ├── hooks/                 # Custom React hooks
│   └── swr/                   # SWR data fetching hooks
├── redux/
│   ├── store.ts               # Redux store config
│   └── slices/                # Redux slices
├── routes/                    # TanStack Router file-based routes
└── types.d.ts                 # Global TypeScript definitions
```

## Testing Notes

- **Unit tests**: Vitest with React Testing Library in `src/tests/unit/`
- **E2E tests**: Playwright in `src/tests/e2e/`
- Tests run in separate environment from main app
- Use `electron-playwright-helpers` for E2E Electron testing

## Common Gotchas

1. **Database errors**: Ensure `initializeDatabase()` completes before IPC handlers are called
2. **Layout overflow**: Never use `h-screen` on components inside flex containers - use `h-full`
3. **IPC types**: Always update `src/types.d.ts` when adding new window.* APIs
4. **Select components**: Radix UI Select doesn't allow empty string values - use placeholder like "none"
5. **Redux persist**: Wrap app in `<PersistGate>` to wait for rehydration
6. **Product grid**: Use responsive grid columns, not fixed `grid-cols-12`
