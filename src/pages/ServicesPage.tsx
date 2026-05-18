import { useMemo, useState } from 'react'
import MachineCatalogPanel from '../components/MachineCatalogPanel'
import { ZoomableImage } from '../components/ImageLightbox'
import {
  normalizeSearchText,
  sectionSearchBlob,
  serviceCategories,
  serviceSections,
  type ServiceCategoryFilter,
} from '../data/servicesCatalog'

const MEDIA_PAGE_SIZE = 12

type MediaItem =
  | { type: 'image'; src: string }
  | { type: 'video'; src: string; poster?: string }

function chunkMedia(items: MediaItem[]): MediaItem[][] {
  const pages: MediaItem[][] = []
  for (let index = 0; index < items.length; index += MEDIA_PAGE_SIZE) {
    pages.push(items.slice(index, index + MEDIA_PAGE_SIZE))
  }
  return pages
}

function MediaGrid({
  images,
  videos,
  videoPosters,
  imageFit = 'cover',
}: {
  images?: string[]
  videos?: string[]
  videoPosters?: string[]
  imageFit?: 'cover' | 'contain'
}) {
  const items: MediaItem[] = [
    ...(images?.map((src) => ({ type: 'image' as const, src })) ?? []),
    ...(videos?.map((src, index) => ({
      type: 'video' as const,
      src,
      poster: videoPosters?.[index] ?? videoPosters?.[0] ?? images?.[0],
    })) ?? []),
  ]
  const [page, setPage] = useState(0)
  const has = items.length > 0
  if (!has) return null
  const pages = chunkMedia(items)
  const safePage = Math.min(page, pages.length - 1)
  const currentPage = pages[safePage] ?? []

  return (
    <div className="media-gallery">
      <div className={imageFit === 'contain' ? 'media-grid media-grid--contain' : 'media-grid'}>
        {currentPage.map((item) =>
          item.type === 'image' ? (
            <ZoomableImage key={item.src} src={item.src} alt="" loading="lazy" />
          ) : (
            <video key={item.src} controls playsInline preload="metadata" muted poster={item.poster}>
              <source src={`${item.src}#t=0.001`} />
            </video>
          ),
        )}
      </div>
      {pages.length > 1 ? (
        <div className="media-slider-controls" aria-label="Media slider controls">
          <button type="button" className="chip" onClick={() => setPage((current) => Math.max(current - 1, 0))} disabled={safePage === 0}>
            Previous
          </button>
          <span className="media-slider-status">
            {safePage + 1} / {pages.length}
          </span>
          <button
            type="button"
            className="chip"
            onClick={() => setPage((current) => Math.min(current + 1, pages.length - 1))}
            disabled={safePage === pages.length - 1}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryFilter>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query)
    return serviceSections.filter((section) => {
      const categoryMatch = selectedCategory === 'All' || section.category === selectedCategory
      const queryMatch = !normalizedQuery || sectionSearchBlob(section).includes(normalizedQuery)
      return categoryMatch && queryMatch
    })
  }, [query, selectedCategory])

  return (
    <main>
      <section className="section-headline">
        <h2>Services at Rainbow Colour Lab</h2>
        <p>
          Browse our full catalogue: photo printing, gifts, albums, acrylic, corporate work, enlargements, and more.
          Each section uses our own photography and video where available.
        </p>
      </section>

      <section className="controls">
        <input
          type="search"
          value={query}
          placeholder="Search services, e.g. mug, album, lamination, restoration"
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chip-row">
          {serviceCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? 'chip active' : 'chip'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <div className="service-sections">
        {filtered.map((section) => (
          <article key={section.id} id={section.id} className="service-section">
            <header className="service-section-head">
              <p className="tag">{section.category}</p>
              <h3>{section.title}</h3>
              <p className="service-intro">{section.intro}</p>
              {section.specs?.length ? (
                <ul className="service-specs">
                  {section.specs.map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
              ) : null}
              {section.idealFor ? (
                <p className="ideal">
                  <strong>Ideal for:</strong> {section.idealFor}
                </p>
              ) : null}
            </header>

            {section.id === 'machine-sales' ? (
              <MachineCatalogPanel compact />
            ) : (
              <MediaGrid
                images={section.images}
                videos={section.videos}
                videoPosters={section.videoPosters}
                imageFit={section.id === 'photo-printing' ? 'contain' : 'cover'}
              />
            )}

            {section.subsections?.map((sub) => (
              <div key={sub.title} className="service-subsection">
                <h4>{sub.title}</h4>
                <p>{sub.description}</p>
                <MediaGrid
                  images={sub.images}
                  videos={sub.videos}
                  videoPosters={sub.videoPosters}
                  imageFit={section.id === 'photo-printing' ? 'contain' : 'cover'}
                />
              </div>
            ))}
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-services">No services match your filters. Try another category or clear the search.</p>
      ) : null}
    </main>
  )
}
