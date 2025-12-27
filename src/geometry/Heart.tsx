import { createSignal, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [size, setSize] = createSignal(25);

const ShapeComponent = (): JSX.Element => {
  const points: { x: number, y: number }[] = [];
  const s = size() / 2;
  
  // Heart curve parametric equation:
  // x = 16sin^3(t)
  // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
  // We normalize it to fit within the requested size
  for (let t = 0; t <= 2 * Math.PI; t += 0.1) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    // Scale factor to make it fit within diameter (approx 16 for x, 17 for y)
    const scale = s / 17;
    points.push({ x: x * scale, y: y * scale });
  }

  return (
    <>
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        return <CellLine x1={p.x} y1={p.y} x2={next.x} y2={next.y} />;
      })}
    </>
  );
};

const SettingsComponent = (): JSX.Element => {
  return (
    <Slider
      label="Size"
      min={10}
      max={500}
      currentVal={size}
      updateVal={setSize}
    />
  );
};

const Heart: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Heart',
};

export default Heart;
