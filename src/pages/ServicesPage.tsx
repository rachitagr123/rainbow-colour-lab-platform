import { useMemo, useState } from 'react'
import { categories, serviceItems, type ServiceCategory } from '../data/siteData'

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return serviceItems.filter((item) => {
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory
      const queryMatch = `${item.name} ${item.description} ${item.specs.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())
      return categoryMatch && queryMatch
    })
  }, [query, selectedCategory])

  const featured = filtered[0]

  return (
    <main>
      <section className="section-headline">
        <h2>Complete Services Catalog</h2>
        <p>Explore every service with proper details, sizes, and use-cases. Select a category or search directly.</p>
      </section>

      <section className="controls">
        <input
          type="search"
          value={query}
          placeholder="Search by service, size, machine, gift..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chip-row">
          {categories.map((category) => (
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

      {featured ? (
        <section className="service-feature">
          <img src={featured.image} alt={featured.name} />
          <div>
            <p className="tag">{featured.category}</p>
            <h3>{featured.name}</h3>
            <p>{featured.description}</p>
            <ul>
              {featured.specs.map((spec) => <li key={spec}>{spec}</li>)}
            </ul>
            <p><strong>Best for:</strong> {featured.idealFor}</p>
          </div>
        </section>
      ) : null}

      <section className="service-grid detailed-grid">
        {filtered.map((item) => (
          <article key={item.name} className='service-item'>
            <img src={item.image} alt={item.name} loading="lazy" />
            <div className="service-body">
              <p className="tag">{item.category}</p>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <ul>
                {item.specs.map((spec) => <li key={spec}>{spec}</li>)}
              </ul>
              <p className="ideal"><strong>Ideal for:</strong> {item.idealFor}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
