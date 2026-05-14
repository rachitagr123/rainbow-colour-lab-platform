import { ZoomableImage } from '../components/ImageLightbox'
import { galleryAssets } from '../data/galleryAssets'
import { visitingCardImage } from '../data/siteData'

export default function GalleryPage() {
  const allImages = [visitingCardImage, ...galleryAssets]

  return (
    <main>
      <section className="section-headline">
        <h2>Gallery</h2>
        <p>Real samples from our lab, prints, albums, gifts, frames, and packaging from the Rainbow Colour Lab floor.</p>
      </section>
      <section className="gallery-grid">
        {allImages.map((image) => (
          <ZoomableImage key={image} src={image} alt="Rainbow Colour Lab work sample" loading="lazy" />
        ))}
      </section>
    </main>
  )
}
