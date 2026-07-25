# Active Theory WebGL Replica - Memory & State

## Overview
This project is a React-based localized replica of an Active Theory WebGL site. The goal was to fully decouple it from the original live servers and build a **Local CMS Editor** so that all text, images, and 3D portfolio works can be edited locally.

## What Has Been Accomplished
1. **Local CMS Editor UI (`src/Admin.tsx`)**:
   - Built an admin overlay interface injected into `App.tsx`.
   - Reads text and media configurations from `public/assets/data/uil.1746999829739.json`.
   - Added a **"Works"** tab specifically to edit the 3D portfolio cards (Titles, Clients, Descriptions, Videos, Thumbnails).

2. **Network Interception for Portfolio Works (`src/App.tsx`)**:
   - The original WebGL bundle (`app.js`) forcefully fetched dynamic portfolio data from `https://storage.googleapis.com/activetheory-v6.appspot.com/cms/`.
   - We downloaded `projects-dev.json`, `metadata-dev.json`, and `contact-dev.json` to `public/assets/data/` (prefixed with `cms_`).
   - We injected a `window.fetch` interceptor at startup to seamlessly serve these local JSON files to the engine, completely isolating the app from the live backend.

3. **Vite Save API (`vite.config.ts`)**:
   - Created a local backend endpoint `/api/save-uil`.
   - This endpoint takes the JSON payload from the Admin UI and permanently writes the modifications to `uil.1746999829739.json` and `cms_projects.json` on the disk.

4. **Performance & GPU**:
   - We initially implemented a `devicePixelRatio` cap to fix scrolling lag caused by the heavy WebGL shader simulations.
   - Per the user's request, the DPR cap was **removed** to ensure uncompromised 1-to-1 visual quality and native resolution, trusting the user's dedicated GPU to handle the load.

## Current State
- The site is fully functional offline via `npm run dev`.
- Any text, image, or portfolio video can be edited from the bottom-right Admin panel.
- Edits persist to disk and immediately reflect in the 3D scene on refresh.

## Next Steps (If Any)
- Adding additional tabs for metadata or contact info.
- Upgrading or tweaking specific custom WebGL textures.
- Optimizing further for deployment.
