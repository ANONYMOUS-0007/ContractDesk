# ContractDesk

<img src="public/logo.png" alt="ContractDesk" width="80" />

A contract lifecycle management application built with React and TypeScript. Create reusable blueprints, generate contracts, and track each contract through its complete lifecycle.

**Developed by:** Shah Faisal

---

## Tech Stack

- **React 18** + **TypeScript**
- **Zustand** - State management with localStorage persistence
- **React Router v6** - Client-side routing
- **date-fns** - Date formatting
- **Vite** - Build tool

## Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/ContractDesk.git
cd ContractDesk

# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── BlueprintBuilder/   # Drag-and-drop field builder
│   ├── ContractForm/       # Contract field renderer
│   ├── StatusTimeline/     # Status history visualization
│   ├── StatusBadge/        # Status indicator component
│   ├── Modal/              # Reusable modal component
│   ├── EmptyState/         # Empty state placeholder
│   └── Layout/             # App shell with navigation
│
├── pages/
│   ├── Dashboard/          # Overview with stats
│   ├── Blueprints/         # Blueprint CRUD pages
│   └── Contracts/          # Contract management pages
│
├── stores/
│   ├── blueprintStore.ts   # Blueprint state management
│   └── contractStore.ts    # Contract state + lifecycle transitions
│
├── types/
│   └── index.ts            # TypeScript definitions + lifecycle rules
│
└── index.css               # Global styles and design tokens
```

## Features

**Blueprints**
- Create reusable contract templates
- Add fields: text, date, checkbox, signature
- Drag-and-drop field positioning
- Edit and delete blueprints

**Contracts**
- Generate contracts from blueprints
- Fill in field values
- Track status through lifecycle
- View complete status history

**Contract Lifecycle**

```
Created → Approved → Sent → Signed → Locked
    ↓         ↓        ↓
 Revoked   Revoked  Revoked
```

| Status | Description |
|--------|-------------|
| Created | Initial state, editable |
| Approved | Ready to send |
| Sent | Awaiting signature |
| Signed | All parties signed |
| Locked | Final state, read-only |
| Revoked | Cancelled (terminal) |

Transitions are enforced in `types/index.ts`.

## State Management

Using Zustand with `persist` middleware:

- `blueprint-storage` - Blueprint data
- `contract-storage` - Contract data with status history

## Deployment Guide

### Step 1: Prepare for Production

```bash
# Run linter to check for issues
npm run lint

# Build for production
npm run build
```

### Step 2: Deploy to Vercel (Recommended)

**Option A: Via CLI**
```bash
npm i -g vercel
vercel
```

**Option B: Via GitHub**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy automatically

### Step 3: Deploy to Netlify

1. Build: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag `dist/` folder to deploy

Or connect your GitHub repo for auto-deploy.

## Git Workflow

Use clear, descriptive commits:

```bash
# Feature commits
git commit -m "feat: add blueprint drag-and-drop functionality"
git commit -m "feat: implement contract status transitions"

# Fix commits
git commit -m "fix: prevent form submission on field add"
git commit -m "fix: correct status validation logic"

# Refactor commits
git commit -m "refactor: simplify contract store actions"
git commit -m "refactor: extract reusable modal component"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring
- `style:` - Formatting changes
- `docs:` - Documentation updates

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Run ESLint |

## Architecture Decisions

**Zustand over Redux** - Simpler API, less boilerplate, built-in persistence.

**CSS Variables over Tailwind** - Better control over design tokens, easier theming.

**Component-based structure** - Each component is self-contained with its own styles.

---

**Author:** Shah Faisal  
**License:** MIT
