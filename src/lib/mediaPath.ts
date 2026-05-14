import { mediaManifest, type MediaFolder } from '../data/mediaManifest'

export type MediaCollection = {
  images?: string[]
  videos?: string[]
  videoPosters?: string[]
}

const imagePattern = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i
const videoPattern = /\.(m4v|mov|mp4|webm|ogg)$/i

/** Build URL for files under `public/` with correct encoding (spaces, commas). */
export function publicAsset(...segments: string[]): string {
  return `/${segments.map((s) => encodeURIComponent(s)).join('/')}`
}

/** Shorthand for assets in `public/images 2/`. */
export function images2(...pathWithinImages2: string[]): string {
  return publicAsset('images 2', ...pathWithinImages2)
}

function folderSegments(folder: MediaFolder): string[] {
  return folder.split('/')
}

function orderedFolderFiles(
  folder: MediaFolder,
  options?: {
    exclude?: string[]
    first?: string[]
  },
): string[] {
  const excluded = new Set(options?.exclude ?? [])
  const files = [...mediaManifest[folder]].filter((file) => !excluded.has(file))
  const fileSet = new Set<string>(files)
  const preferred = options?.first ?? []
  const preferredSet = new Set(preferred)
  const orderedPreferred = preferred.filter((file) => fileSet.has(file))
  const remainder = files.filter((file) => !preferredSet.has(file))
  return [...orderedPreferred, ...remainder]
}

export function folderImages(
  folder: MediaFolder,
  options?: {
    exclude?: string[]
    first?: string[]
  },
): string[] {
  return orderedFolderFiles(folder, options)
    .filter((file) => imagePattern.test(file))
    .map((file) => images2(...folderSegments(folder), file))
}

export function folderVideos(
  folder: MediaFolder,
  options?: {
    exclude?: string[]
    first?: string[]
  },
): string[] {
  return orderedFolderFiles(folder, options)
    .filter((file) => videoPattern.test(file))
    .map((file) => images2(...folderSegments(folder), file))
}

export function folderMedia(
  folder: MediaFolder,
  options?: {
    exclude?: string[]
    first?: string[]
  },
): MediaCollection {
  const images = folderImages(folder, options)
  const videos = folderVideos(folder, options)
  const fallbackPoster = images[0]
  const videoPosters = fallbackPoster ? videos.map(() => fallbackPoster) : undefined

  return {
    images: images.length ? images : undefined,
    videos: videos.length ? videos : undefined,
    videoPosters: videoPosters?.length ? videoPosters : undefined,
  }
}

export function mergeMedia(...collections: MediaCollection[]): MediaCollection {
  const seenImages = new Set<string>()
  const seenVideos = new Set<string>()
  const images: string[] = []
  const videos: string[] = []
  const videoPosters: string[] = []

  for (const collection of collections) {
    for (const image of collection.images ?? []) {
      if (!seenImages.has(image)) {
        seenImages.add(image)
        images.push(image)
      }
    }

    for (const [index, video] of (collection.videos ?? []).entries()) {
      if (seenVideos.has(video)) continue
      seenVideos.add(video)
      videos.push(video)
      videoPosters.push(collection.videoPosters?.[index] ?? collection.images?.[0] ?? '')
    }
  }

  const filteredVideoPosters = videoPosters.some(Boolean) ? videoPosters.map((poster) => poster || images[0] || '') : undefined

  return {
    images: images.length ? images : undefined,
    videos: videos.length ? videos : undefined,
    videoPosters: filteredVideoPosters?.length ? filteredVideoPosters : undefined,
  }
}
