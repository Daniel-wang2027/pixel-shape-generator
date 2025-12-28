# Pixel Shape Generator

## Overview

A SolidJS-based pixel art shape generator that allows users to create pixelated geometric shapes. Users can configure shape properties (sides, diameter, rotation) and download the results as SVG, PNG, or PBM files. The application is designed for creating pixel-perfect shapes useful for Minecraft builds or other pixel art projects.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **SolidJS** - Reactive UI framework chosen for its fine-grained reactivity and performance. Components use signals (`createSignal`) for state management without a centralized store.
- **TypeScript** - Provides type safety across the codebase with strict mode enabled.
- **Vite** - Build tool and development server with hot module replacement.

### Component Architecture
The application follows a modular component structure:

1. **Shape Components** (`src/geometry/`) - Each shape is a self-contained module exporting a `Shape` type object containing:
   - `shapeComponent`: Renders the pixelated shape using SVG
   - `settingsComponent`: Renders the UI controls for that shape
   - `name`: Display name for the shape selector

2. **Helper Components** (`src/geometry/helpers/`) - Reusable primitives for drawing:
   - `Cell.tsx` - Single pixel/cell with click-to-highlight functionality
   - `CellLine.tsx` - Bresenham-style line drawing between two points
   - `CellCircle.tsx` - Circle rasterization algorithm
   - `CellArc.tsx` - Arc drawing for curved shapes

3. **UI Components** (`src/ui-components/`) - Reusable form controls:
   - `Slider` - Numeric input with range slider
   - `Select` - Dropdown selector
   - `Switch` - Toggle boolean values

### State Management
- Uses SolidJS signals at the module level (not within components) for shape parameters
- Each shape file defines its own signals for settings (e.g., `diameter`, `rotation`)
- Camera and pointer state managed in separate modules (`camera.ts`, `pointer.ts`)

### Rendering Pipeline
1. Shapes are rendered as SVG elements on a virtual grid
2. Camera system allows pan/zoom with mouse and touch support
3. Download utilities extract SVG data and convert to PNG/PBM formats

### Adding New Shapes
New shapes follow a consistent pattern:
1. Create a file in `src/geometry/`
2. Define signals for configurable properties
3. Implement `ShapeComponent` that renders cells/lines
4. Implement `SettingsComponent` with sliders/switches
5. Export a `Shape` object and register in `App.tsx`

## External Dependencies

### Runtime Dependencies
- **solid-js** (^1.8.7) - Core UI framework

### Development Dependencies
- **vite** (^5.0.8) - Build tool and dev server
- **vite-plugin-solid** (^2.8.0) - SolidJS plugin for Vite
- **typescript** (^5.2.2) - Type checking
- **prettier** (3.2.4) - Code formatting

### External Services
- None - This is a fully client-side application with no backend or external API dependencies

### Static Assets
- Favicon files (`spiral.ico`, `spiral.svg`)
- GitHub mark icons for the repository link