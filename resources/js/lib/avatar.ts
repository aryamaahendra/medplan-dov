/**
 * Returns default DiceBear Clay avatar URL for a given seed (email, name, or id).
 * Docs: https://www.dicebear.com/styles/clay/index.md
 */
export function getDicebearClayAvatar(seed?: string | number | null): string {
  const seedString = seed ? String(seed).trim() : 'default';

  return `https://api.dicebear.com/10.x/clay/svg?seed=${encodeURIComponent(seedString)}`;
}
