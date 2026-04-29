import { useMemo, useState } from 'react'
import { categories, serviceItems, type ServiceCategory } from '../data/siteData'

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All')
  const [query, setQuery] = useState('')
  const [activeCard, setActiveCard] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return serviceItems.filter((item) => {
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory
      const queryMatch = `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())
      return categoryMatch && queryMatch
    })
  }, [query, selectedCategory])

  return (
    <main>
      <section className="section-headline">
        <h2>Interactive Service Explorer</h2>
        <p>Filter by category, search by requirement, and open any card for details.</p>
      </section>

      <section className="controls">
        <input
          type="search"
          value={query}
          placeholder="Search services, products, machines..."
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

      <section className="service-grid">
        {filtered.map((item) => {
          const open = activeCard === item.name
          return (
            <article key={item.name} className={open ? 'service-item open' : 'service-item'}>
              <img src={item.image} alt={item.name} loading="lazy" />
              <div className="service-body">
                <p className="tag">{item.category}</p>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <button type="button" onClick={() => setActiveCard(open ? null : item.name)}>
                  {open ? 'Hide details' : 'View details'}
                </button>
                {open ? <div className="detail">Best for premium finishing, fast turnaround, and professional presentation quality.</div> : null}
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
