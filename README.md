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
- Project collage originals live in `public/projects/<projectId>/collage-src`
- Approach originals live in `public/projects/<projectId>/approach-src`
- Prototype originals live in `public/projects/<projectId>/prototypes-src`
- Optimized assets are generated into `public/gallery`, `public/projects/<projectId>/collage`, `public/projects/<projectId>/approach`, and `public/projects/<projectId>/prototypes`
- Run `npm run assets:build` (runs automatically on `npm run build`)
- Add new gallery entries in `galleryData.ts` with matching `id`s

### Quality & Size Settings
Edit `scripts/build-assets.mjs` (or set env vars) to tune output:
- `GALLERY_WEBP_QUALITY` (default `80`)
- `GALLERY_MAX_WIDTH` (default `2000`)
- `GALLERY_AVIF_QUALITY` + `GALLERY_AVIF` (optional AVIF)
- `COLLAGE_WEBP_QUALITY` (default `92`)
- `COLLAGE_MAX_HEIGHT` (default `300`)
- `APPROACH_WEBP_QUALITY` (default `90`)
- `APPROACH_MAX_WIDTH` (default `1600`)
- `PROTOTYPE_WEBP_QUALITY` (default `90`)
- `PROTOTYPE_MAX_WIDTH` (default `1200`)

GIFs are copied as-is (not re-encoded). Videos are copied as-is. To improve GIF quality, replace the source files in `public/projects/<projectId>/collage-src`, `public/projects/<projectId>/approach-src`, or `public/projects/<projectId>/prototypes-src`.
