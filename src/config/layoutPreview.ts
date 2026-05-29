/**
 * Vibrant layout experiment — NOT the saved production design.
 *
 * Revert options:
 * 1. Set VIBRANT_LAYOUT_PREVIEW_DEFAULT to false
 * 2. Add ?preview=original to the URL
 * 3. git checkout -- src/config/layoutPreview.ts src/vibrant-preview.css src/pages/HomePageVibrant.tsx (and related edits)
 */
export const VIBRANT_LAYOUT_PREVIEW_DEFAULT = true

export function isVibrantLayoutPreview(searchParams: URLSearchParams): boolean {
  const q = searchParams.get('preview')
  if (q === 'original') return false
  if (q === 'vibrant') return true
  return VIBRANT_LAYOUT_PREVIEW_DEFAULT
}
