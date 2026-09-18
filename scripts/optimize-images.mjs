/**
 * Compresses photos under public/ for faster Hostinger loads.
 * - Max width 1600px (still sharp on retina cards / lightbox)
 * - JPEG/WebP quality tuned for web
 * - Overwrites in place only when the new file is smaller
 *
 * Usage: node scripts/optimize-images.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const targets = [path.join(root, 'public', 'images 2'), path.join(root, 'public', 'images')]

const IMAGE_RE = /\.(jpe?g|png|webp)$/i
const MAX_WIDTH = 1600
const JPEG_QUALITY = 78
const WEBP_QUALITY = 78
const PNG_QUALITY = 80

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.name === '.DS_Store') continue
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else if (IMAGE_RE.test(entry.name)) files.push(full)
  }
  return files
}

async function optimizeFile(file) {
  const original = await fs.readFile(file)
  const before = original.byteLength
  const ext = path.extname(file).toLowerCase()

  let pipeline = sharp(original, { failOn: 'none' }).rotate()
  const meta = await pipeline.metadata()
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true })
  }

  let output
  if (ext === '.png') {
    // Keep PNG when alpha is needed; otherwise convert to JPEG for size.
    if (meta.hasAlpha) {
      output = await pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toBuffer()
    } else {
      output = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
      // Keep .png path only if JPEG isn't smaller enough — always write same path as PNG-looking bytes is wrong.
      // Prefer rewriting as JPEG only when we can change extension; for simplicity stay PNG compressed.
      output = await sharp(original, { failOn: 'none' })
        .rotate()
        .resize(meta.width && meta.width > MAX_WIDTH ? { width: MAX_WIDTH, withoutEnlargement: true } : undefined)
        .png({ quality: PNG_QUALITY, compressionLevel: 9 })
        .toBuffer()
    }
  } else if (ext === '.webp') {
    output = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer()
  } else {
    output = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
  }

  if (output.byteLength >= before * 0.98) {
    return { file, before, after: before, skipped: true }
  }

  await fs.writeFile(file, output)
  return { file, before, after: output.byteLength, skipped: false }
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function main() {
  let saved = 0
  let beforeTotal = 0
  let afterTotal = 0
  let processed = 0
  let skipped = 0

  for (const target of targets) {
    try {
      await fs.access(target)
    } catch {
      console.warn(`Skip missing folder: ${target}`)
      continue
    }

    const files = await walk(target)
    console.log(`Optimizing ${files.length} images in ${path.relative(root, target)}…`)

    for (const file of files) {
      try {
        const result = await optimizeFile(file)
        processed += 1
        beforeTotal += result.before
        afterTotal += result.after
        if (result.skipped) {
          skipped += 1
        } else {
          saved += result.before - result.after
          const rel = path.relative(root, file)
          console.log(
            `  ✓ ${rel}: ${formatMb(result.before)} → ${formatMb(result.after)} (−${Math.round(
              (1 - result.after / result.before) * 100,
            )}%)`,
          )
        }
      } catch (err) {
        console.error(`  ✗ ${path.relative(root, file)}: ${err.message}`)
      }
    }
  }

  console.log('\nDone.')
  console.log(`Processed: ${processed} (skipped already-small: ${skipped})`)
  console.log(`Total: ${formatMb(beforeTotal)} → ${formatMb(afterTotal)}`)
  console.log(`Saved: ${formatMb(saved)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
