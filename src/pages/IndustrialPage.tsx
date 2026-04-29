const machineModels = ['HP Indigo 5500', 'HP Indigo 5600', 'HP Indigo 7500', 'HP Indigo 7600', 'HP Indigo 10000', 'HP Indigo 12000']

export default function IndustrialPage() {
  return (
    <main>
      <section className="section-headline">
        <h2>Industrial B2B Solutions</h2>
        <p>Dedicated section for machine sales, consumables, and spare parts for printing businesses.</p>
      </section>
      <section className="industrial-grid">
        <article>
          <img src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80" alt="Industrial print machine" />
          <h3>HP Indigo Machine Sales</h3>
          <ul>
            {machineModels.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </article>
        <article>
          <img src="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80" alt="Spare parts" />
          <h3>Parts and Consumables</h3>
          <p>Ink, blankets, PIP, machine parts and Imetto enlargement machine solutions.</p>
          <a className="btn solid" href="mailto:rcolourlab123@gmail.com?subject=Industrial%20B2B%20Inquiry">Request B2B Quote</a>
        </article>
      </section>
    </main>
  )
}
