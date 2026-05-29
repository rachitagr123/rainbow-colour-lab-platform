import MachineCatalogPanel from '../components/MachineCatalogPanel'
import { images2 } from '../lib/mediaPath'

const imettoVideo = images2('Enlargement machine', 'VID-20260502-WA0004.mp4')
const imettoPoster = images2('Enlargement machine', '000004.jpg')

export default function IndustrialPage() {
  return (
    <main>
      <section className="section-headline">
        <h2>Reconditioned machine sales</h2>
        <p>
          Reconditioned HP Indigo presses, genuine spares, consumables, and reconditioned Imetto enlargement hardware,
          backed by guidance from a lab that runs production every day.
        </p>
      </section>

      <section className="section-headline machine-catalog-head">
        <h3>Reconditioned HP Indigo lineup</h3>
        <p>
          Browse reconditioned models with machine photos and specification sheets. For most models, full technical
          details are shown in the details image.
        </p>
      </section>

      <section className="machine-catalog-section">
        <MachineCatalogPanel />
      </section>

      <section className="imetto-panel">
        <div>
          <p className="tag">Enlargement workflow</p>
          <h3>Reconditioned Imetto machine</h3>
          <p>
            Reconditioned Imetto systems are widely used for professional photo enlargement and mounting workflows,
            including large sizes such as 30 x 90 inch when paired with the right media and finishing. Contact us for
            availability, installation context, and compatible supplies.
          </p>
          <ul>
            <li>Large-format photo production support</li>
            <li>Ask us to align reconditioned Imetto options with your existing press or lab line</li>
          </ul>
          <a
            className="btn solid"
            href="mailto:rachitagr123@gmail.com?subject=Reconditioned%20Imetto%20machine%20inquiry"
          >
            Ask about reconditioned Imetto
          </a>
        </div>
        <video className="imetto-video" controls playsInline preload="metadata" muted poster={imettoPoster}>
          <source src={`${imettoVideo}#t=0.001`} />
        </video>
      </section>
    </main>
  )
}
