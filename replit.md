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

## Guide: Adding a New Shape

To add a new shape to the generator, follow these steps:

1. **Create a Shape Component**:
   Create a new file in `src/geometry/` (e.g., `MyNewShape.tsx`).

   ```tsx
   import { createSignal, For, JSX } from 'solid-js';
   import type { Shape } from '../types.d.ts';
   import CellLine from './helpers/CellLine.tsx';
   import Slider from '../ui-components/Slider.tsx';

   // 1. Define reactive signals for settings
   const [size, setSize] = createSignal(100);
   const [rotation, setRotation] = createSignal(0);

   // 2. Define the shape rendering component
   const ShapeComponent = (): JSX.Element => {
     const points = () => {
       const s = size() / 2;
       const rad = (rotation() * Math.PI) / 180;
       
       // Calculate your points here...
       const pts = [
         { x: -s, y: -s }, { x: s, y: -s }, { x: s, y: s }, { x: -s, y: s }
       ];

       // Apply rotation if needed
       return pts.map(p => ({
         x: p.x * Math.cos(rad) - p.y * Math.sin(rad),
         y: p.x * Math.sin(rad) + p.y * Math.cos(rad),
       }));
     };

     return (
       <For each={points()}>
         {(p, i) => {
           const next = points()[(i() + 1) % points().length];
           return <CellLine x1={p.x} y1={p.y} x2={next.x} y2={next.y} />;
         }}
       </For>
     );
   };

   // 3. Define the settings UI component
   const SettingsComponent = (): JSX.Element => (
     <>
       <Slider label="Size" min={10} max={400} currentVal={size} updateVal={setSize} />
       <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
     </>
   );

   // 4. Export the Shape object
   const MyNewShape: Shape = {
     shapeComponent: ShapeComponent,
     settingsComponent: SettingsComponent,
     name: 'My New Shape',
   };

   export default MyNewShape;
   ```

2. **Register the Shape in App.tsx**:
   - Import your new shape: `import MyNewShape from './geometry/MyNewShape.tsx';`
   - Add it to the `shapes` array inside the `App` component.

3. **Verify**:
   The new shape will automatically appear in the "Shape" dropdown and display its custom sliders.
