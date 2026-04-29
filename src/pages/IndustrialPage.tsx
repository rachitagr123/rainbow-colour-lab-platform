import { useState } from 'react'
import { machineCatalog } from '../data/siteData'

export default function IndustrialPage() {
  const [selectedModel, setSelectedModel] = useState(machineCatalog[0].model)
  const selected = machineCatalog.find((machine) => machine.model === selectedModel) ?? machineCatalog[0]

  return (
    <main>
      <section className="section-headline">
        <h2>Machine Sales</h2>
        <p>Simple machine-sales flow for print businesses. Select a model to view its image and sales use-case.</p>
      </section>

      <section className="machine-panel">
        <div>
          <label htmlFor="machine-select">Choose HP Indigo model</label>
          <select id="machine-select" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}>
            {machineCatalog.map((machine) => (
              <option key={machine.model} value={machine.model}>{machine.model}</option>
            ))}
          </select>
          <h3>{selected.model}</h3>
          <p>{selected.useCase}</p>
          <ul>
            <li>Machine sales and setup guidance</li>
            <li>Spare parts, consumables, ink, blankets, PIP</li>
            <li>Service support for industrial buyers</li>
          </ul>
          <a className="btn solid" href="mailto:rcolourlab123@gmail.com?subject=Machine%20Sales%20Inquiry">Request Machine Quote</a>
        </div>
        <img src={selected.image} alt={selected.model} />
      </section>
    </main>
  )
}
