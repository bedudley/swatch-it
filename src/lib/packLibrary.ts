import { Pack, PackSchema } from './schema';
import { getPackCategoryCount, getPackQuestionCount } from './packUtils';

export interface PackMetadata {
  id: string;
  title: string;
  categoryCount: number;
  questionCount: number;
  pack: Pack;
}

// Static imports for reliable Next.js compatibility
import pack1Data from '@/assets/packs/a2-bleach-and-tone.json';
import pack2Data from '@/assets/packs/a3-color-correction.json';

/**
 * Load all built-in class packs using static imports
 */
export function loadBuiltInPacks(): PackMetadata[] {
  const packs: PackMetadata[] = [];

  // Built-in packs with their filenames
  const builtInPacks = [
    { data: pack1Data, filename: 'a2-bleach-and-tone.json' },
    { data: pack2Data, filename: 'a3-color-correction.json' }
  ];

  for (const { data: packJson, filename } of builtInPacks) {
    try {
      // Validate with schema
      const validatedPack = PackSchema.parse(packJson);

      // Generate ID from filename
      const id = filename.replace('.json', '');

      // Calculate statistics using centralized utilities
      const categoryCount = getPackCategoryCount(validatedPack);
      const questionCount = getPackQuestionCount(validatedPack);

      packs.push({
        id,
        title: validatedPack.title,
        categoryCount,
        questionCount,
        pack: { ...validatedPack, id } // Add generated id to pack
      });
    } catch (error) {
      console.error(`Failed to load pack ${filename}:`, error);
    }
  }

  return packs;
}

/**
 * Load a specific built-in pack by ID
 */
export function loadPackById(id: string): Pack | null {
  const packs = loadBuiltInPacks();
  const packMetadata = packs.find(p => p.id === id);
  return packMetadata?.pack || null;
}