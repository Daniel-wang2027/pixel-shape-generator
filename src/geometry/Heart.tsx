import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [size, setSize] = createSignal(25);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const pts: { x: number; y: number }[] = [];
    const s = size() / 2;
    for (let t = 0; t <= 2 * Math.PI; t += 0.1) {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      );
      const scale = s / 17;
      pts.push({ x: x * scale, y: y * scale });
    }
    return pts;
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
