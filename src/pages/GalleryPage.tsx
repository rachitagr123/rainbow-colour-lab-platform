import { featuredLocalImages, serviceItems } from '../data/siteData'

export default function GalleryPage() {
  const stock = serviceItems.slice(0, 8).map((s) => s.image)
  const allImages = [...featuredLocalImages, ...stock]

  return (
    <main>
      <section className="section-headline">
        <h2>Gallery</h2>
        <p>Real Rainbow Colour Lab work samples plus curated visual references for each service category.</p>
      </section>
      <section className="gallery-grid">
        {allImages.map((image) => (
          <img key={image} src={image} alt="Rainbow Colour Lab gallery" loading="lazy" />
        ))}
      </section>
    </main>
  )
}
