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
- Optimized assets are generated into `public/gallery` and `public/projects/<projectId>/collage`
- Run `npm run assets:build` (runs automatically on `npm run build`)
- Add new gallery entries in `galleryData.ts` with matching `id`s
