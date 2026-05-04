/** Build URL for files under `public/` with correct encoding (spaces, commas). */
export function publicAsset(...segments: string[]): string {
  return `/${segments.map((s) => encodeURIComponent(s)).join('/')}`
}

/** Shorthand for assets in `public/images 2/`. */
export function images2(...pathWithinImages2: string[]): string {
  return publicAsset('images 2', ...pathWithinImages2)
}
