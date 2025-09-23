# Swatch It! — Claude Code Initialization / Project Spec

> **Purpose**: A Jeopardy‑style classroom game for color & style lessons that your girlfriend can run without coding. Questions/answers/points are editable via JSON files and/or an in‑app Admin screen. Scores and team names are easily managed live.

---

## 1) Product Goals

- **Simple to run**: Presenter controls from one screen; optional audience board view.
- **No rebuilds for content**: Load question packs from a JSON file and/or import at runtime.
- **Fast edits during class**: Admin panel to tweak team names, scores, and fix typos.
- **Offline‑friendly**: Works in a browser; persists state in `localStorage`.
- **Later**: Cloud sync (Supabase/Drive), multiple hosts, buzzers, timers, analytics.

---

## 2) Tech Stack & Rationale

- **Framework**: **Next.js 14 (App Router) + React + TypeScript**
  - Pros: modern routing, server/client components when needed, easy static deploy, great DX.
- **Styling**: Tailwind CSS (+ optional shadcn/ui for polished UI widgets)
- **State**: **Zustand** (tiny, simple store for teams/scores/game state)
- **Persistence**: `localStorage` + JSON **Import/Export** (no redeploy needed)
- **Build**: Vite‑powered Next toolchain (via Next 14), ESLint + Prettier

> **Why not something else?** Electron/Tauri would enable direct file I/O, but adds packaging complexity. Next.js keeps setup simple and deployable; live edits are handled via Admin + JSON import/export.

---

## 3) Runtime Content Model (JSON Packs)

A **Question Pack** (aka **Game Pack**) is a single JSON file. Users can either select from built-in packs in the admin interface or import custom packs via drag-and-drop upload. Built-in packs are stored in `/src/assets/packs` and automatically discovered by the pack library system.

### 3.1 JSON Schema (conceptual)

```json
{
  "title": "Color Theory 101",
  "theme": {
    "primary": "#6B5B95",
    "accent": "#F7CAC9"
  },
  "board": {
    "columns": 5,
    "rows": 5,
    "categories": [
      {
        "id": "cat1",
        "name": "Color Theory",
        "questions": [
          { "value": 100, "type": "text", "prompt": "Primary colors in RGB?", "answer": "Red, Green, Blue" },
          { "value": 200, "type": "text", "prompt": "Complement of blue?", "answer": "Orange" }
        ]
      }
    ]
  },
  "finalRound": {
    "prompt": "This color sits opposite of red on the wheel.",
    "answer": "Green"
  }
}
```

### 3.2 Extended Types (optional now, future‑proof)

- `type`: `"text" | "multipleChoice" | "image" | "audio"`
- `choices`: `["A","B","C","D"]` when `multipleChoice`
- `media`: `{ "src": "/images/…", "alt": "…" }`
- `dailyDouble`: `true/false`
- `notes`: host‑only hint text

### 3.3 Example Pack (Color & Style Sampler)

```json
{
  "title": "Color & Style Sampler",
  "theme": { "primary": "#0ea5e9", "accent": "#f59e0b" },
  "board": {
    "columns": 5,
    "rows": 5,
    "categories": [
      {
        "id": "ct1",
        "name": "Color Theory",
        "questions": [
          { "value": 100, "prompt": "Primary colors in subtractive (CMY) mixing?", "answer": "Cyan, Magenta, Yellow", "type": "text" },
          { "value": 200, "prompt": "Warm vs cool: is red warm or cool?", "answer": "Warm", "type": "text" },
          { "value": 300, "prompt": "Opposite of green on standard color wheel?", "answer": "Red", "type": "text" },
          { "value": 400, "prompt": "Term for colors next to each other on the wheel?", "answer": "Analogous", "type": "text" },
          { "value": 500, "prompt": "Name a triadic set including blue.", "answer": "Red, Yellow, Blue (one example)", "type": "text" }
        ]
      },
      {
        "id": "st1",
        "name": "Style Basics",
        "questions": [
          { "value": 100, "prompt": "Neutral color often used as a base in wardrobes?", "answer": "Black (or navy/gray/tan acceptable)", "type": "text" },
          { "value": 200, "prompt": "Term for an outfit's main attention‑drawing element?", "answer": "Statement piece", "type": "text" },
          { "value": 300, "prompt": "The rule of three applies to what in styling?", "answer": "Color or layers/accessories", "type": "text" },
          { "value": 400, "prompt": "What undertone pairs best with cool complexions?", "answer": "Cool undertones (blue/pink)", "type": "text" },
          { "value": 500, "prompt": "Name a capsule wardrobe benefit.", "answer": "Mix‑and‑match simplicity (or reduced decision fatigue)", "type": "text" }
        ]
      },
      { "id": "mt1", "name": "Materials", "questions": [
        { "value": 100, "prompt": "Plant‑based fiber often used for breathable summer wear?", "answer": "Linen", "type": "text" },
        { "value": 200, "prompt": "Protein fiber from sheep?", "answer": "Wool", "type": "text" },
        { "value": 300, "prompt": "Synthetic known for stretch and recovery?", "answer": "Spandex/Elastane", "type": "text" },
        { "value": 400, "prompt": "Silk's sheen is due to what fiber structure?", "answer": "Triangular prism‑like cross‑section (refracts light)", "type": "text" },
        { "value": 500, "prompt": "Viscose is a form of what?", "answer": "Rayon (regenerated cellulose)", "type": "text" }
      ]},
      { "id": "hx1", "name": "History", "questions": [
        { "value": 100, "prompt": "Decade famous for flapper dresses?", "answer": "1920s", "type": "text" },
        { "value": 200, "prompt": "Dior's post‑war silhouette name?", "answer": "New Look", "type": "text" },
        { "value": 300, "prompt": "Tie‑dye boom decade?", "answer": "1960s", "type": "text" },
        { "value": 400, "prompt": "Minimalist fashion rose in which 1990s city movement?", "answer": "Antwerp Six/German minimalism (acceptable)", "type": "text" },
        { "value": 500, "prompt": "Japanese designer known for deconstruction?", "answer": "Rei Kawakubo (Comme des Garçons)", "type": "text" }
      ]},
      { "id": "fx1", "name": "Finish & Care", "questions": [
        { "value": 100, "prompt": "Icon with a basin of water indicates?", "answer": "Washing (machine/hand)", "type": "text" },
        { "value": 200, "prompt": "Circle with 'P' on care label?", "answer": "Professional dry clean, any solvent except trichloroethylene", "type": "text" },
        { "value": 300, "prompt": "Best practice to preserve sweater shape?", "answer": "Dry flat (reshape while damp)", "type": "text" },
        { "value": 400, "prompt": "Finish that resists wrinkles?", "answer": "Easy‑care/resin finish", "type": "text" },
        { "value": 500, "prompt": "What does 'GSM' measure?", "answer": "Fabric weight (grams per square meter)", "type": "text" }
      ]}
    ]
  },
  "finalRound": {
    "prompt": "In classic seasonal color analysis, which season suits cool, light, and soft tones?",
    "answer": "Summer"
  }
}
```

---

## 4) UX Flows

**Presenter (single device) simplest flow**

1. Open app → **Admin** screen.
2. Choose a built-in pack from the thumbnail gallery or **Import Pack** (JSON).
3. Enter **Team Names** (or toggle Individuals).
4. Click **Start Game** → goes to **Board**.
5. Click a tile → **Question Modal** (prompt visible to audience); host sees **Reveal Answer**.
6. Mark **Correct Team** or **Incorrect** → scores update. Optionally allow second‑chance.
7. **Manual Adjust** available any time (± buttons or edit field).

**Two‑screen (optional)**: `/host` controls; `/play` full‑screen board (projector/TV). Actions sync via BroadcastChannel or simple local WebSocket server (future).

---

## 5) Core Features (v0)

- Board grid with categories and point tiles (5×5 default; read from JSON).
- Question modal: show prompt → reveal answer → set result.
- Built-in pack library: thumbnail gallery of available class packs.
- Teams: add/remove/rename; toggle individuals; reorder.
- Scores: auto scoring + manual overrides; undo last action.
- Admin screen: pack library browser, import/export packs, reset game.
- Persistence: `localStorage` session save/restore.
- Keyboard: arrows/enter/space; number keys to assign correct team; `U`=undo; `M`=open manual score edit.
- Responsive design; projector‑friendly.

---

## 6) Roadmap (v0.1 → v1)

- **v0.1**: Multiple choice, image questions; timers; lockout/buzz‑in.
- **v0.2**: Final round wagering; Daily Double; per‑team wagers.
- **v0.3**: In-app pack editor; duplicate/edit packs in‑app.
- **v0.4**: Real‑time two‑screen sync; host vs player devices.
- **v1.0**: Cloud storage (Supabase) & auth; CSV import; analytics.

---

## 7) App Structure (Next.js App Router)

```
/swatch-it
  /app
    /admin/page.tsx              # Setup & pack manager with library
    /host/page.tsx               # Host controls (full panel)
    /play/page.tsx               # Audience board (read‑only)
    /layout.tsx
    /globals.css
  /components
    BoardGrid.tsx                # Game board with categories and tiles
    Tile.tsx                     # Individual question tiles
    QuestionModal.tsx            # Question display and scoring
    Scoreboard.tsx               # Team scores and controls
    PackLibrary.tsx              # Built-in pack browser
    PackCard.tsx                 # Pack thumbnail component
    Logo.tsx                     # Logo component
    Footer.tsx                   # App footer
  /lib
    schema.ts                    # Zod schemas & TS types
    store.ts                     # Zustand store (teams, scores, game state)
    packLibrary.ts               # Built-in pack loading and discovery
    packUtils.ts                 # Centralized pack data utilities
    sync.ts                      # Real-time sync between screens
    useSyncListener.ts           # Sync hook for components
  /src/assets/packs
    a2-color-and-toning.json     # Built-in pack: A2 Color & Toning
    a3-color-correction.json     # Built-in pack: A3 Color Correction
  /public/assets/logos           # Swatch It! and The Parlour logos
  /styles
    tailwind.css
  package.json
  tsconfig.json
```

---

## 8) TypeScript Types & Validation

Use **Zod** for safe parsing of imported JSON.

```ts
// lib/schema.ts
import { z } from "zod";

export const QuestionSchema = z.object({
  value: z.number().int().positive(),
  type: z.enum(["text","multipleChoice","image","audio"]).default("text"),
  prompt: z.string().min(1),
  answer: z.string().min(1),
  choices: z.string().array().optional(),
  media: z.object({ src: z.string(), alt: z.string().optional() }).optional(),
  dailyDouble: z.boolean().optional(),
  notes: z.string().optional()
});

export type Question = z.infer<typeof QuestionSchema>;
// Backward compatibility alias
export type Clue = Question;

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  questions: z.array(QuestionSchema).min(1)
});

export type Category = z.infer<typeof CategorySchema>;

export const PackSchema = z.object({
  title: z.string(),
  theme: z.object({ primary: z.string(), accent: z.string() }).optional(),
  board: z.object({
    columns: z.number().int().positive().default(5),
    rows: z.number().int().positive().default(5),
    categories: z.array(CategorySchema).min(1)
  }),
  finalRound: z.object({ prompt: z.string(), answer: z.string() }).optional()
});

export type Pack = z.infer<typeof PackSchema>;
```

---

## 9) State Store (Zustand)

```ts
// lib/store.ts
import { create } from "zustand";

type Team = { id: string; name: string; score: number };

type GameState = {
  teams: Team[];
  boardDisabled: boolean;
  opened: Record<string, boolean>; // key = `${catId}:${value}`
  history: Array<{ key: string; teamId?: string; delta?: number }>; // for undo
  pack: Pack | null;
  currentQuestion: { categoryId: string; value: number; question: Question } | null;
  showAnswer: boolean;

  // Actions
  setPack: (pack: Pack | null) => void;
  openQuestion: (categoryId: string, value: number) => void;
  closeQuestion: () => void;
  revealAnswer: () => void;
  markCorrect: (teamId: string) => void;
  markIncorrect: () => void;
  isQuestionOpened: (categoryId: string, value: number) => boolean;
  // ... team and score management actions
};
```