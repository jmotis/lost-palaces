# Lost Palaces Project website

A Hugo site that presents the 3D palace models. It lives in `Hugo-site/`. The models are not copied into it: each has its own folder one level up (`../Whitehall/`, `../Greenwich/` and so on), holding its page file and an `assets/` folder of images, and Hugo reads them from there when the site is built.

## Pages

- **Home** (`/`): introduction, the Whitehall image, and a card for each palace with a model (A–Z or By date).
- **Map** (`/map/`): every palace on an OpenStreetMap map, with a year slider and lists under the map.
- **Timelines** (`/timelines/`): three timelines, for palaces with a model, palaces without one yet, and palaces still standing.
- **About** (`/about/`), a page per palace (`/palaces/<id>/`), and a not-found page ("No Buildings Here").

The map and the timelines share one colour code: **green** for palaces with a model, **white** (hollow) for unmodeled palaces, and **brown** for extant palaces.

## Layout

- `hugo.toml`: site settings. Each model folder (`../<Palace>/`) is mounted twice:
  - into the built site at `/models/<id>/`, page and `assets/` together (any stray PDFs, HEIC photos or backups in the folder are left out);
  - its main page only, under `assets/models/<id>/`, so the palace page can read the model's introduction (`.lede`) and bibliography (`ul.bib`) when the site is built. They always match the model.
- `content/palaces/<id>.md`: one file per palace, holding its dates, place and the model's address in the site (`model`).
- `content/map.md`, `content/timelines.md`, `content/about.md`: the Map, Timelines and About pages. Their text (the intro under each heading, and all of About) is written in Markdown in these files; `heading` sets the large heading if it differs from the menu name.
- `content/palaces/_index.md`: groups the palace pages. It is not built as a page of its own; the palace cards live on the home page.
- `data/coordinates.yaml`: every map coordinate in one place: the point the map opens on (Whitehall) and one entry per palace, keyed by its id. Positions come from each palace's Wikipedia article; the matching figures from `henry_viii_residences.csv` (kept with the research files, outside this repository) are kept beside them for reference only.
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
- `public/` and `resources/`: made by Hugo when it builds (the finished site, and its cache of resized images). Both are left out of the repository and can be deleted at any time.

## What a model page must contain

Each palace page copies two things out of its model's page file when the site is built, so they always match the model. It finds them by their exact markup:

- **Introduction:** `<p class="lede">…</p>`. The first one in the file is used.
- **Bibliography:** `<ul class="bib">…</ul>`, followed directly by the `</div>` that closes its group. Matching up to that `</div>` keeps nested lists (as in Whitehall's) whole.

If a model's markup changes so that either one no longer matches, the build still succeeds, but the palace page silently loses its introduction, and its Sources list falls back to "Listed in the model’s panel, under Bibliography." After editing a model's page, check its palace page.

## Palace fields

Each `content/palaces/<id>.md` holds:

- the file name (`<id>`): the palace's id. It must match the palace's entry in `data/coordinates.yaml`.
- `title`: the full name ("Greenwich Palace"), used as the palace page heading, in its browser title and in "Cite this model".
- `name`: the short name ("Greenwich"), used on the home page cards, the map and the timelines. The A–Z sort ignores a leading "The".
- `slug`: the palace page's address, `/palaces/<slug>/`.
- `start`, `end`: the years the model covers, shown on cards and used by the map's year filter and the timelines.
- `place`: where it stood ("Greenwich, on the Thames").
- `model`: the model's address in the built site (`/models/<id>/<page file>`), shown in the palace page's frame.
- `weight`: sets the date order everywhere on the site. It is the start year × 10 plus a tie-break digit (Greenwich, 1500, is `15003`), so palaces starting in the same year keep a fixed order.

## Requirements and outside services

- Built and tested with **Hugo v0.161.1 (extended)**. Hugo makes the WebP and resized copies of the home page image and the footer logos.
- In the browser, the site loads three things from other servers, so it needs an internet connection, and those services see visitors' requests:
  - **Google Fonts**: IM Fell English SC and Source Sans 3 (every page).
  - **Leaflet 1.9.4** from unpkg.com (Map page only), checked with an integrity hash.
  - **OpenStreetMap map tiles** from tile.openstreetmap.org (Map page only), credited in the map's corner as OpenStreetMap's terms require.

## The palace icon

The palace icon appears in three places, all drawn from the same shape: `static/favicon.svg`, `static/favicon.ico`, and the header wordmark in `layouts/_partials/header.html`. If the icon changes, update all three.

## Adding a palace

1. Put the model in its own folder at the project root (`../<Palace>/`), with its page file and an `assets/` folder for its images. Its page needs the introduction and bibliography markup described above.
2. Add the two mounts for its folder in `hugo.toml`, following the existing ones.
3. Add the folder and its page file to the root `.gitignore`, following the existing ones (the images stay out until their copyright is cleared).
4. Add `content/palaces/<id>.md`, copying an existing one.
5. Make sure `data/coordinates.yaml` has an entry with the same id (the build warns if it doesn't).
6. If it was listed in `data/unmodeled.yaml`, remove it from there.

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
