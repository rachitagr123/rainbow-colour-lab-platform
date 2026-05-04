import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  sectionSearchBlob,
  serviceCategories,
  serviceSections,
  type ServiceCategoryFilter,
} from '../data/servicesCatalog'

function MediaGrid({
  images,
  videos,
  videoPosters,
}: {
  images?: string[]
  videos?: string[]
  videoPosters?: string[]
}) {
  const has = (images?.length ?? 0) + (videos?.length ?? 0) > 0
  if (!has) return null
  const fallbackPoster = images?.[0]
  return (
    <div className="media-grid">
      {images?.map((src) => (
        <img key={src} src={src} alt="" loading="lazy" />
      ))}
      {videos?.map((src, i) => {
        const poster = videoPosters?.[i] ?? videoPosters?.[0] ?? fallbackPoster
        return (
          <video key={src} controls playsInline preload="metadata" muted poster={poster}>
            <source src={`${src}#t=0.001`} />
          </video>
        )
      })}
    </div>
  )
}

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryFilter>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return serviceSections.filter((section) => {
      const categoryMatch = selectedCategory === 'All' || section.category === selectedCategory
      const q = query.trim().toLowerCase()
      const queryMatch = !q || sectionSearchBlob(section).includes(q)
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
          placeholder="Search — e.g. mug, album, lamination, restoration…"
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
              {section.id === 'machine-sales' ? (
                <p className="machine-sales-cta">
                  <Link className="btn solid" to="/industrial">
                    View models, Imetto video &amp; quotes
                  </Link>
                </p>
              ) : null}
            </header>

            <MediaGrid images={section.images} videos={section.videos} videoPosters={section.videoPosters} />

            {section.subsections?.map((sub) => (
              <div key={sub.title} className="service-subsection">
                <h4>{sub.title}</h4>
                <p>{sub.description}</p>
                <MediaGrid images={sub.images} videos={sub.videos} videoPosters={sub.videoPosters} />
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
