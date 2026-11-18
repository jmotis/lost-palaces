# Lost Palaces Project website

A Hugo site that presents the 3D palace models. It lives in `Hugo-site/`; the models stay in their own folders one level up (`../Other Royal Palaces/…`, `../ReconstructingWhitehall Fablecopy/whitehall`).

## Pages

- **Home** (`/`): introduction, the Whitehall image, and a card for each palace with a model (A–Z or By date).
- **Map** (`/map/`): every palace on an OpenStreetMap map, with a year slider and lists under the map.
- **Timelines** (`/timelines/`): three timelines, for palaces with a model, palaces without one yet, and palaces still standing.
- **About** (`/about/`), a page per palace (`/palaces/<id>/`), and a not-found page ("No Buildings Here").

The map and the timelines share one colour code: **green** for palaces with a model, **white** (hollow) for unmodeled palaces, and **brown** for extant palaces.

## Layout

- `hugo.toml`: site settings. Each model folder is mounted twice:
  - into the built site at `/models/<id>/`, leaving out backups, `index.before*.html` snapshots, PDFs and HEIC photos;
  - its main page only, under `assets/models/<id>/`, so the palace page can read the model's introduction (`.lede`) and bibliography (`ul.bib`) when the site is built. They always match the model.
- `content/palaces/<id>.md`: one file per palace, holding its dates, place and the model's address in the site (`model`).
- `content/map.md`, `content/timelines.md`, `content/about.md`: the Map, Timelines and About pages. Their text (the intro under each heading, and all of About) is written in Markdown in these files; `heading` sets the large heading if it differs from the menu name.
- `content/palaces/_index.md`: groups the palace pages. It is not built as a page of its own; the palace cards live on the home page.
- `data/coordinates.yaml`: every map coordinate in one place: the point the map opens on (Whitehall) and one entry per palace, keyed by its id. Positions come from each palace's Wikipedia article; the matching figures from `../henry_viii_residences.csv` are kept beside them for reference only.
- `data/unmodeled.yaml`: palaces without a model yet, shown as white "Unmodeled" pins and hollow timeline bars. `start`/`end` are the years the map's year filter uses (no `end` = still standing).
- `data/extant.yaml`: palaces that still stand (Hampton Court, the Tower, Eltham, Windsor, St James's, Holyroodhouse, Audley End, Kensington, Westminster, Edinburgh Castle, Kew, Buckingham, the Royal Pavilion, Dover, Leeds and Tickenhill), shown as brown "Extant" pins and brown timeline bars. Each links to its official visitor page (`visit`), except Tickenhill, a private house. `start` is the year building began; `far: true` marks sites outside the opening map view.
- `layouts/`: page templates: `home.html`, `map.html`, `timeline.html` (used by the Timelines page), `page.html` (plain Markdown pages such as About), `palaces/page.html`, `404.html`, `baseof.html` (the frame around every page) and `_partials/` (header and footer).
- `assets/css/site.css`: all styles. The colours, fonts and the five text sizes are set once at the top.
- `assets/js/`:
  - `map.js`: the map (Leaflet 1.9.4 with OpenStreetMap tiles), year slider and lists. Map page only.
  - `timeline.js`: opens a timeline section when a link points to it (for example from the Timelines intro).
  - `sort.js`: the A–Z / By date buttons on the home page.
  - `cite.js`: fills in each palace page's "Cite this model" with the page's full address and the reader's own access date.
- `assets/images/`: the home page image (`whitehall-1547-static.png`) and the two footer logos (`logo.png` for RRCHNM, `gmu-logo-light.png` for GMU History and Art History). Hugo makes the smaller copies the pages use.
- `static/`: files copied as they are: `favicon.svg` and `favicon.ico`.
- `archive/static-site-2026-11-17/`: the earlier hand-written version of the site, kept on the project computer for reference. It is not part of the build or of the repository.

## The palace icon

The palace icon appears in three places, all drawn from the same shape: `static/favicon.svg`, `static/favicon.ico`, and the header wordmark in `layouts/_partials/header.html`. If the icon changes, update all three.

## Adding a palace

1. Add the two mounts for its folder in `hugo.toml`, following the existing ones.
2. Add `content/palaces/<id>.md`, copying an existing one.
3. Make sure `data/coordinates.yaml` has an entry with the same id (the build warns if it doesn't).
4. If it was listed in `data/unmodeled.yaml`, remove it from there.

## Building

Run Hugo from inside `Hugo-site`:

```bash
cd Hugo-site
```

```bash
hugo --gc --minify
```

The finished site is written to `Hugo-site/public/`, which can be uploaded to any static host. `public/` is rebuilt each time, so it is safe to delete.

Before publishing, set `baseURL` in `hugo.toml` to the site's real address. Palace pages fill in their full address in "Cite this model" in the browser anyway; with `baseURL` set, the address is also right for readers without JavaScript.

To preview while editing:

```bash
hugo server
```

To move a map pin, change its `lat` and `lon` in `data/coordinates.yaml` and rebuild.
