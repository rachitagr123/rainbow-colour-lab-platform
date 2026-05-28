import { useState } from 'react'
import { ZoomableImage } from './ImageLightbox'
import { defaultMachineId, machineCatalog } from '../data/machineCatalog'

type MachineCatalogPanelProps = {
  compact?: boolean
}

export default function MachineCatalogPanel({ compact = false }: MachineCatalogPanelProps) {
  const [selectedId, setSelectedId] = useState(defaultMachineId)
  const fallback = machineCatalog.find((machine) => machine.id === defaultMachineId) ?? machineCatalog[0]
  const selected = machineCatalog.find((machine) => machine.id === selectedId) ?? fallback

  return (
    <div className={compact ? 'machine-catalog-panel machine-catalog-panel--compact' : 'machine-catalog-panel'}>
      <label htmlFor="machine-select">Choose model</label>
      <select id="machine-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
        {machineCatalog.map((machine) => (
          <option key={machine.id} value={machine.id}>
            {machine.model}
          </option>
        ))}
      </select>

      <h4>{selected.model}</h4>
      <p>{selected.summary}</p>

      <div className="machine-catalog-images">
        <figure>
          <ZoomableImage src={selected.image} alt={selected.model} loading="lazy" />
          <figcaption>Machine view</figcaption>
        </figure>
        {selected.detailsImage ? (
          <figure>
            <ZoomableImage
              src={selected.detailsImage}
              alt={`${selected.model} specifications`}
              loading="lazy"
            />
            <figcaption>Specification sheet</figcaption>
          </figure>
        ) : null}
      </div>

      {selected.specs?.length ? (
        <div className="machine-spec-block">
          <h5>Technical specifications</h5>
          <ul>
            {selected.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <a
        className="btn solid"
        href={`mailto:rachitagr123@gmail.com?subject=${encodeURIComponent(`${selected.model} inquiry`)}`}
      >
        Request quote for {selected.model.replace('Reconditioned ', '')}
      </a>
    </div>
  )
}
