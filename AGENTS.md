# AGENTS.md

## Cursor Cloud specific instructions

### Product

Single-package static marketing site for **Rainbow Colour Lab** (React 19 + Vite 5 + TypeScript). No backend, database, or Docker services in-repo. All catalog data lives under `src/data/`.

### Standard commands

See `README.md` and `package.json` scripts:

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (default http://127.0.0.1:5173) |
| Lint | `npm run lint` |
| Tests | `npm test` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |

### Services to run

Only the **Vite dev server** is required for local development. Start it in a persistent tmux session if you need long-running access:

```bash
SESSION_NAME="vite-dev-server"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null \
  || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "/workspace" -- "${SHELL:-bash}" -l
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" 'npm run dev -- --host 127.0.0.1 --port 5173' C-m
```

### Optional environment

- **Contact form email:** copy `.env.example` to `.env` and set `VITE_WEB3FORMS_ACCESS_KEY`. Without it, the form falls back to `mailto:`.
- **External embeds:** Contact page loads a Google Maps iframe; some catalog images use Unsplash URLs. Tests may log happy-dom fetch abort noise for the map iframe — this is expected in Vitest.

### Known repo health notes (as of setup)

- `npm run lint` may fail on `src/pages/ServicesPage.tsx` (`react-hooks/set-state-in-effect`) — pre-existing, not environment-related.
- `npm test` may fail on `searches services by keyword` because the Services page no longer exposes a search input (category chips only). Build (`npm run build`) still succeeds.

### Hello-world smoke check

1. Open `/` → navigate to **Services** → click a category chip (e.g. **Digital Restoration**) and confirm sections filter.
2. Open **Contact** and confirm the inquiry form renders.
