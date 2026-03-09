# Jialu Portfolio — Creative Technologist

Personal portfolio site featuring interactive home, project pages, and an art gallery.

## Tech
- React 18 + TypeScript + Vite
- React Router (hash routing)
- GSAP, ECharts, Lucide

## Development
1. `npm install`
2. `npm run dev`

## Build
1. `npm run build`
2. `npm run preview`

## Image Pipeline
- Gallery originals live in `public/gallery-src`
- Gallery reference originals (for story/reference panels) live in `public/gallery-references-src`
- Project collage originals live in `public/projects/<projectId>/collage-src`
- Approach originals live in `public/projects/<projectId>/approach-src`
- Prototype originals live in `public/projects/<projectId>/prototypes-src`
- Optimized assets are generated into `public/gallery`, `public/gallery-references`, `public/projects/<projectId>/collage`, `public/projects/<projectId>/approach`, and `public/projects/<projectId>/prototypes`
- Run `npm run assets:build` (runs automatically on `npm run build`)
- Add new gallery entries in `galleryData.ts` with matching `id`s
- For gallery story/reference photos, point `story.references[].src` at `/gallery-references-src/...`; production automatically maps to optimized `/gallery-references/...`

### Quality & Size Settings
Edit `scripts/build-assets.mjs` (or set env vars) to tune output:
- `GALLERY_WEBP_QUALITY` (default `80`)
- `GALLERY_MAX_WIDTH` (default `2000`)
- `GALLERY_AVIF_QUALITY` + `GALLERY_AVIF` (optional AVIF)
- `GALLERY_REFERENCE_WEBP_QUALITY` (default `82`)
- `GALLERY_REFERENCE_MAX_WIDTH` (default `1400`)
- `COLLAGE_WEBP_QUALITY` (default `92`)
- `COLLAGE_MAX_HEIGHT` (default `300`)
- `APPROACH_WEBP_QUALITY` (default `90`)
- `APPROACH_MAX_WIDTH` (default `1600`)
- `PROTOTYPE_WEBP_QUALITY` (default `90`)
- `PROTOTYPE_MAX_WIDTH` (default `1200`)

GIFs are copied as-is (not re-encoded). Videos are copied as-is. To improve GIF quality, replace the source files in `public/gallery-references-src` or `public/projects/<projectId>/collage-src`, `public/projects/<projectId>/approach-src`, `public/projects/<projectId>/prototypes-src`.
