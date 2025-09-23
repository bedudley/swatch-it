import { Pack } from './schema';

/**
 * Centralized utility functions for pack data access
 * This ensures consistent data parsing across all components
 */

/**
 * Get the total number of categories in a pack
 */
export function getPackCategoryCount(pack: Pack | null): number {
  if (!pack?.board?.categories) return 0;
  return pack.board.categories.length;
}

/**
 * Get the total number of questions in a pack
 */
export function getPackQuestionCount(pack: Pack | null): number {
  if (!pack?.board?.categories) return 0;
  return pack.board.categories.reduce((total, category) => {
    return total + (category.questions?.length || 0);
  }, 0);
}

/**
 * Get a formatted summary of pack statistics
 */
export function getPackSummary(pack: Pack | null): string {
  if (!pack) return "No pack loaded";

  const categoryCount = getPackCategoryCount(pack);
  const questionCount = getPackQuestionCount(pack);

  return `${categoryCount} categories, ${questionCount} questions total`;
}

/**
 * Validate that a pack has the expected structure
 */
export function validatePackStructure(pack: Pack | null): boolean {
  if (!pack) return false;
  if (!pack.board) return false;
  if (!Array.isArray(pack.board.categories)) return false;

  // Check that all categories have questions
  return pack.board.categories.every(category =>
    Array.isArray(category.questions) && category.questions.length > 0
  );
}

/**
 * Get a specific question from a pack
 */
export function getQuestion(pack: Pack | null, categoryId: string, value: number) {
  if (!pack?.board?.categories) return null;

  const category = pack.board.categories.find(cat => cat.id === categoryId);
  if (!category?.questions) return null;

  return category.questions.find(question => question.value === value) || null;
}