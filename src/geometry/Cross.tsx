import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [thickness, setThickness] = createSignal(20);
const [length, setLength] = createSignal(80);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const t = thickness() / 2;
    const l = length() / 2;
    const pts = [
      { x: -t, y: -l }, { x: t, y: -l }, { x: t, y: -t },
      { x: l, y: -t }, { x: l, y: t }, { x: t, y: t },
      { x: t, y: l }, { x: -t, y: l }, { x: -t, y: t },
      { x: -l, y: t }, { x: -l, y: -t }, { x: -t, y: -t },
    ];
    const rad = (rotation() * Math.PI) / 180;

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
      <Slider label="Thickness" min={5} max={100} currentVal={thickness} updateVal={setThickness} />
      <Slider label="Length" min={10} max={400} currentVal={length} updateVal={setLength} />
      <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
    </>
  );
};

const Cross: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Cross',
};

export default Cross;
