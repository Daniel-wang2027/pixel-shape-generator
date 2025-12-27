import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [width, setWidth] = createSignal(60);
const [radius, setRadius] = createSignal(20);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const pts: { x: number; y: number }[] = [];
    const w = width() / 2;
    const r = radius();
    const rad = (rotation() * Math.PI) / 180;

    // Top semi-circle
    for (let t = Math.PI; t <= 2 * Math.PI; t += 0.2) {
      pts.push({ x: w + r * Math.cos(t), y: r * Math.sin(t) });
    }
    // Bottom semi-circle
    for (let t = 0; t <= Math.PI; t += 0.2) {
      pts.push({ x: -w + r * Math.cos(t), y: r * Math.sin(t) });
    }

    return pts.map((p) => ({
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

const SettingsComponent = (): JSX.Element => {
  return (
    <>
      <Slider label="Width" min={10} max={400} currentVal={width} updateVal={setWidth} />
      <Slider label="Radius" min={5} max={200} currentVal={radius} updateVal={setRadius} />
      <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
    </>
  );
};

const Capsule: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Capsule',
};

export default Capsule;
