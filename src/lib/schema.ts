import { z } from "zod";

export const ClueSchema = z.object({
  value: z.number().int().positive(),
  type: z.enum(["text", "multipleChoice", "image", "audio"]).default("text"),
  prompt: z.string().min(1),
  answer: z.string().min(1),
  choices: z.string().array().optional(),
  media: z.object({
    src: z.string(),
    alt: z.string().optional()
  }).optional(),
  dailyDouble: z.boolean().optional(),
  notes: z.string().optional()
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  clues: z.array(ClueSchema).min(1)
});

export const PackSchema = z.object({
  packId: z.string(),
  title: z.string(),
  logo: z.union([
    z.string().startsWith("data:image/"), // base64 data URL
    z.enum(["default", "default-art", "default-fashion", "default-general"]), // built-in logos
    z.string().url() // external URL (fallback)
  ]).optional(),
  theme: z.object({
    primary: z.string(),
    accent: z.string()
  }).optional(),
  board: z.object({
    columns: z.number().int().positive().default(5),
    rows: z.number().int().positive().default(5),
    categories: z.array(CategorySchema).min(1)
  }),
  finalRound: z.object({
    prompt: z.string(),
    answer: z.string()
  }).optional()
});

export type Clue = z.infer<typeof ClueSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Pack = z.infer<typeof PackSchema>;

export type Team = {
  id: string;
  name: string;
  score: number;
};

export type GameAction = {
  key: string;
  teamId?: string;
  delta?: number;
  timestamp: number;
};

export type GameState = {
  teams: Team[];
  boardDisabled: boolean;
  opened: Record<string, boolean>; // key = `${catId}:${value}`
  history: GameAction[];
  pack: Pack | null;
  currentClue: {
    categoryId: string;
    value: number;
    clue: Clue;
  } | null;
  showAnswer: boolean;
};