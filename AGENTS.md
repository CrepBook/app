# AGENTS.md — CrepBook Development Guide

Tauri desktop app (Rust backend + React/TypeScript frontend) — a Markdown note editor.

## Build Commands

### Frontend (TypeScript/React)
```bash
# Development server (Vite on port 1420)
npm run dev

# Production build (typecheck + vite build)
npm run build

# Preview production build
npm run preview
```

### Tauri (Rust)
```bash
# Dev mode with hot reload
npm run tauri dev

# Production build
npm run tauri build

# Tauri CLI directly
npm run tauri <command>
```

### Rust (src-tauri/)
```bash
cd src-tauri

# Build only Rust
 cargo build

# Check compilation
cargo check

# Run clippy (linting)
cargo clippy -- -D warnings

# Format code
cargo fmt

# Run tests
cargo test

# Run single test
cargo test <test_name>
```

## Testing

No test framework currently configured for frontend. For Rust:
- Tests live in `src-tauri/src/` inline with `#[cfg(test)]` modules
- Run: `cargo test` or `cargo test <test_name>` for single test

## Code Style Guidelines

### TypeScript/React (Frontend)

**Formatting:**
- 4 spaces indentation
- Double quotes for strings
- Semicolons required
- Max line length: ~100 chars

**Imports:**
- Order: React → external libs → `@/` aliases → relative
- Use `@/` alias for all project imports (configured in vite.config.ts)
- Example: `import { FileEditor } from "@/widgets/file-editor/ui/FileEditor";`

**Naming:**
- Components: PascalCase (e.g., `FileEditor`, `FileNameInput`)
- Functions/variables: camelCase (e.g., `handleOpenFile`, `fileName`)
- Types/interfaces: PascalCase with Props suffix (e.g., `FileEditorProps`)
- CSS classes: BEM-style (e.g., `file-editor__top`, `folder-item--selected`)
- Constants: UPPER_SNAKE_CASE for true constants (e.g., `AUTOSAVE_MS`, `MAX_NAME_LENGTH`)

**Types:**
- Strict TypeScript enabled (`strict: true`)
- No unused locals or parameters allowed
- Explicit types on function props (use type aliases, not interfaces)
- Type aliases over interfaces for component props

**React Patterns:**
- Functional components with explicit return type inference
- Props destructured in function parameters
- Default values in destructuring
- `useCallback`/`useMemo` for performance-critical paths
- Refs for mutable values that don't trigger re-renders
- Event handlers: prefix with `handle` (e.g., `handleOpenFile`)

**Error Handling:**
- Use try/catch for async operations
- Log errors to console with context
- Return boolean success flags from Tauri commands

**CSS:**
- CSS files co-located with components
- BEM naming: `.block__element--modifier`
- CSS variables in `app/styles/tokens.css`

### Rust (Backend)

**Formatting:**
- Standard rustfmt (4 spaces)
- Run `cargo fmt` before committing

**Naming:**
- Functions: snake_case (e.g., `fs_read_file`, `fs_create_dir`)
- Types: PascalCase (e.g., `DirContent`)
- Modules: snake_case
- Constants: SCREAMING_SNAKE_CASE

**Error Handling:**
- Tauri commands return `Result<T, String>` for errors
- Use `.map_err(|e| e.to_string())` to convert errors
- Boolean returns for simple success/failure

**Module Structure:**
- Commands in `fs_wrapper/` submodules
- Re-export with `use fs_wrapper::*;` in lib.rs
- Tauri commands marked with `#[tauri::command]`

## Project Structure

```
src/
├── app/              # App entry, global styles
├── features/         # Feature-specific components
├── pages/            # Page-level components
├── shared/ui/        # Reusable UI components
├── widgets/          # Complex composite components
└── main.tsx          # Entry point

src-tauri/src/
├── fs_wrapper/       # File system commands
│   ├── dirs.rs       # Directory operations
│   └── files.rs      # File operations
├── lib.rs            # Tauri setup
└── main.rs           # Entry point
```

## Git Workflow

- No pre-commit hooks configured
- Commit when explicitly asked by user
- Follow conventional commit style if committing

## Important Notes

- Windows subsystem disabled in release: `windows_subsystem = "windows"`
- Default vault path hardcoded: `/Users/yeezy-na-izi/crep-book/test-vault`
- Autosave interval: 10 seconds
- Max filename length: 127 chars
- Uses React 19 (newest features available)
