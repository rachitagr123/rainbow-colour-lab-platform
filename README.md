# Rainbow Color Lab Website

Production-ready static business website for **Rainbow Color Lab (RAINBOW COLOUR LAB)** built with React + Vite.

## Run locally

```bash
npm install
npm run dev
```

Open the localhost URL shown in terminal.

## Production build

```bash
npm run build
npm run preview
```

## Architecture notes

- Component-driven React app for future upgrades
- Data-first service catalog supports easy integration with APIs/databases later
- Placeholder sections for login, ordering, uploads, CRM, dealer network
- Designed for both customer website + in-store digital catalog

## Future upgrade path

- Add backend API (Node/Nest/Express)
- Add authentication and role-based dashboards
- Connect to database (PostgreSQL/MySQL)
- Add payment gateway and order workflow
- Add cloud storage for customer uploads

## Deploy recommendations

- **Best for static now:** Vercel or Netlify
- **Business hosting alternative:** Hostinger + Cloudflare CDN
- Add domain such as:
  - rainbowcolorlab.in
  - rainbowcolourlab.com
  - rainbowcolorlabjabalpur.in

## SEO recommendations

- Register and optimize Google Business Profile
- Add real project images with geotagged alt text
- Collect and publish customer reviews weekly
- Add dedicated city landing pages if expanding to nearby areas
- Submit sitemap to Google Search Console after deployment

## Maintenance

- Monthly content refresh (offers, new products, gallery)
- Quarterly performance + SEO audit
- Keep dependencies updated every 6-8 weeks
- Keep backup before any major upgrade

## Important image note

Current gallery uses premium stock placeholders.
Replace with your real business photos by adding files in `public/images/` and updating image paths in `src/App.tsx`.
