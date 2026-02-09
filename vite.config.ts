import path from 'path';
import fs from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import sharp from 'sharp';

const COLLAGE_MAX_HEIGHT = 300;
const COLLAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.gif', '.webp']);
const COLLAGE_EXT_PRIORITY = ['.gif', '.webp', '.png', '.jpg', '.jpeg', '.tif', '.tiff'];
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.webp'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];
const APPROACH_EXTS = new Set([...IMAGE_EXTS, '.gif', ...VIDEO_EXTS]);
const PROTOTYPE_EXTS = new Set([...IMAGE_EXTS, '.gif']);
const APPROACH_EXT_PRIORITY = [...VIDEO_EXTS, '.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff'];
const PROTOTYPE_EXT_PRIORITY = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tif', '.tiff'];

const computeTargetSize = (
  width: number,
  height: number,
  options: { maxHeight: number; minHeight?: number }
) => {
  const scale = Math.min(1, options.maxHeight / height);
  let nextWidth = Math.max(1, Math.round(width * scale));
  let nextHeight = Math.max(1, Math.round(height * scale));

  if (options.minHeight && nextHeight < options.minHeight) {
    const upscale = options.minHeight / nextHeight;
    nextWidth = Math.max(1, Math.round(nextWidth * upscale));
    nextHeight = Math.max(1, Math.round(nextHeight * upscale));
  }

  return { width: nextWidth, height: nextHeight };
};

const readGifDimensions = async (filePath: string) => {
  const buffer = await fs.readFile(filePath);
  if (buffer.length < 10) return null;

  const signature = buffer.toString('ascii', 0, 6);
  if (signature !== 'GIF87a' && signature !== 'GIF89a') return null;

  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8)
  };
};

const pickPreferredFiles = (files: string[], priority: string[]) => {
  const grouped = new Map<string, Array<{ file: string; ext: string }>>();

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const id = path.parse(file).name;
    if (!grouped.has(id)) grouped.set(id, []);
    grouped.get(id)?.push({ file, ext });
  }

  const selected: Array<{ id: string; file: string; ext: string }> = [];
  for (const [id, variants] of grouped.entries()) {
    const chosen = priority
      .map((ext) => variants.find((item) => item.ext === ext))
      .find(Boolean);
    if (chosen) selected.push({ id, file: chosen.file, ext: chosen.ext });
  }

  selected.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
  return selected;
};

const listProjectDirs = async (projectsRoot: string) =>
  (await fs.readdir(projectsRoot, { withFileTypes: true }).catch(() => []))
    .filter((dirent) => dirent.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));

const listSortedFiles = async (dir: string) =>
  (await fs.readdir(dir).catch(() => []))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

const buildDevCollageManifest = async (projectsRoot: string) => {
  const manifest: Record<string, Array<{ id: string; width: number; height: number; src: string }>> = {};
  const projectDirs = await listProjectDirs(projectsRoot);

  for (const dirent of projectDirs) {
    const projectId = dirent.name;
    const collageDir = path.join(projectsRoot, projectId, 'collage');
    const files = await listSortedFiles(collageDir);
    const entries = files.filter((file) => COLLAGE_EXTS.has(path.extname(file).toLowerCase()));
    if (entries.length === 0) continue;

    const items: Array<{ id: string; width: number; height: number; src: string }> = [];
    const selected = pickPreferredFiles(entries, COLLAGE_EXT_PRIORITY);

    for (const entry of selected) {
      const sourcePath = path.join(collageDir, entry.file);
      const isGif = entry.ext === '.gif';

      const metadata = isGif
        ? await readGifDimensions(sourcePath)
        : await sharp(sourcePath).metadata().catch(() => null);

      if (!metadata?.width || !metadata?.height) continue;

      const target = isGif
        ? computeTargetSize(metadata.width, metadata.height, {
            maxHeight: COLLAGE_MAX_HEIGHT,
            minHeight: COLLAGE_MAX_HEIGHT
          })
        : computeTargetSize(metadata.width, metadata.height, { maxHeight: COLLAGE_MAX_HEIGHT });

      items.push({
        id: entry.id,
        width: target.width,
        height: target.height,
        src: `/projects/${projectId}/collage/${entry.file}`
      });
    }

    if (items.length > 0) manifest[projectId] = items;
  }

  return manifest;
};

const buildDevApproachManifest = async (projectsRoot: string) => {
  const manifest: Record<string, Array<{ id: string; type: 'image' | 'video'; src: string }>> = {};
  const projectDirs = await listProjectDirs(projectsRoot);

  for (const dirent of projectDirs) {
    const projectId = dirent.name;
    const approachDir = path.join(projectsRoot, projectId, 'approach');
    const files = await listSortedFiles(approachDir);
    const entries = files.filter((file) => APPROACH_EXTS.has(path.extname(file).toLowerCase()));
    if (entries.length === 0) continue;

    const items: Array<{ id: string; type: 'image' | 'video'; src: string }> = [];
    const selected = pickPreferredFiles(entries, APPROACH_EXT_PRIORITY);

    for (const entry of selected) {
      items.push({
        id: entry.id,
        type: VIDEO_EXTS.includes(entry.ext) ? 'video' : 'image',
        src: `/projects/${projectId}/approach/${entry.file}`
      });
    }

    if (items.length > 0) manifest[projectId] = items;
  }

  return manifest;
};

const buildDevPrototypeManifest = async (projectsRoot: string) => {
  const manifest: Record<string, Array<{ id: string; src: string }>> = {};
  const projectDirs = await listProjectDirs(projectsRoot);

  for (const dirent of projectDirs) {
    const projectId = dirent.name;
    const prototypesDir = path.join(projectsRoot, projectId, 'prototypes');
    const files = await listSortedFiles(prototypesDir);
    const entries = files.filter((file) => PROTOTYPE_EXTS.has(path.extname(file).toLowerCase()));
    if (entries.length === 0) continue;

    const items: Array<{ id: string; src: string }> = [];
    const selected = pickPreferredFiles(entries, PROTOTYPE_EXT_PRIORITY);

    for (const entry of selected) {
      items.push({
        id: entry.id,
        src: `/projects/${projectId}/prototypes/${entry.file}`
      });
    }

    if (items.length > 0) manifest[projectId] = items;
  }

  return manifest;
};

const devCollageManifestPlugin = (): Plugin => ({
  name: 'dev-project-media-manifest-plugin',
  apply: 'serve' as const,
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const requestPath = (req.url ?? '').split('?')[0];
      const route = requestPath.endsWith('/__dev-collage-manifest')
        ? { name: 'collage', buildManifest: buildDevCollageManifest }
        : requestPath.endsWith('/__dev-approach-manifest')
          ? { name: 'approach', buildManifest: buildDevApproachManifest }
          : requestPath.endsWith('/__dev-prototype-manifest')
            ? { name: 'prototype', buildManifest: buildDevPrototypeManifest }
            : null;

      if (!route) {
        next();
        return;
      }

      try {
        const projectsRoot = path.join(server.config.root, 'public', 'projects');
        const manifest = await route.buildManifest(projectsRoot);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(manifest));
      } catch (error) {
        server.config.logger.error(`[dev-${route.name}-manifest] ${error}`);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Failed to build dev ${route.name} manifest.` }));
      }
    });
  }
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: mode === 'production' ? '/jialu-sun-portfolio/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), devCollageManifestPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
