# Pixel Shape Generator

## Overview
A SolidJS-based pixel art shape generator that allows users to create pixelated geometric shapes. Users can configure shape properties (sides, diameter, rotation) and download the results as SVG, PNG, or PBM files.

## Project Structure
- `src/` - Main application source code
  - `geometry/` - Shape generation components (Circle, Rectangle, Star, etc.)
  - `ui-components/` - Reusable UI components (Select, Slider, Switch)
  - `App.tsx` - Main application component
  - `index.tsx` - Application entry point
- `public/` - Static assets
- `vite.config.ts` - Vite configuration

## Tech Stack
- SolidJS - Reactive UI framework
- TypeScript - Type-safe JavaScript
- Vite - Build tool and dev server

## Development
Run `npm run dev` to start the development server on port 5000.

## Build
Run `npm run build` to create a production build in the `dist/` directory.

## Deployment
Configured for static deployment with the `dist/` directory as the public folder.
