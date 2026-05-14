import { useState } from 'react'
import { ZoomableImage } from '../components/ImageLightbox'
import { images2 } from '../lib/mediaPath'
import { machineCatalog } from '../data/siteData'

const imettoVideo = images2('Enlargement machine', 'VID-20260502-WA0004.mp4')
const imettoPoster = images2('5 in 1 combo', 'IMG-20260428-WA0056.jpg')

export default function IndustrialPage() {
  const [selectedModel, setSelectedModel] = useState(machineCatalog[0].model)
  const selected = machineCatalog.find((machine) => machine.model === selectedModel) ?? machineCatalog[0]

  return (
    <main>
      <section className="section-headline">
        <h2>Machine sales</h2>
        <p>
          HP Indigo presses, genuine spares, consumables, and enlargement workflow hardware including Imetto, backed by guidance from a
          lab
          that runs production every day.
        </p>
      </section>

      <section className="imetto-panel">
        <div>
          <p className="tag">Enlargement workflow</p>
          <h3>Imetto machine</h3>
          <p>
            Imetto systems are widely used for professional photo enlargement and mounting workflows, including large sizes such as
            30 x 90 inch
            when paired with the right media and finishing. Contact us for availability, installation context, and compatible supplies.
          </p>
          <ul>
            <li>Large-format photo production support</li>
            <li>Ask us to align Imetto options with your existing press or lab line</li>
          </ul>
          <a
            className="btn solid"
            href="mailto:rachitagr123@gmail.com?subject=Imetto%20%2F%20enlargement%20machine%20inquiry"
          >
            Ask about Imetto
          </a>
        </div>
        <video className="imetto-video" controls playsInline preload="metadata" muted poster={imettoPoster}>
          <source src={`${imettoVideo}#t=0.001`} />
        </video>
      </section>

      <section className="section-headline machine-catalog-head">
        <h3>HP Indigo lineup</h3>
        <p>Reference imagery below; share your own machine photos when ready and we will swap them in without changing layout.</p>
      </section>

      <section className="machine-panel">
        <div>
          <label htmlFor="machine-select">Choose HP Indigo model</label>
          <select id="machine-select" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}>
            {machineCatalog.map((machine) => (
              <option key={machine.model} value={machine.model}>
                {machine.model}
              </option>
            ))}
          </select>
          <h3>{selected.model}</h3>
          <p>{selected.useCase}</p>
          <ul>
            <li>Machine sales and setup guidance</li>
            <li>Spare parts, consumables, ink, blankets, PIP</li>
            <li>Service support for industrial buyers</li>
          </ul>
          <a
            className="btn solid"
            href="mailto:rachitagr123@gmail.com?subject=HP%20Indigo%20machine%20sales%20inquiry"
          >
            Request machine quote
          </a>
        </div>
        <ZoomableImage src={selected.image} alt={selected.model} />
      </section>
    </main>
  )
}
