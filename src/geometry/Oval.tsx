import { createSignal, JSX, For } from 'solid-js';
import type { Shape, Point } from '../types.d.ts';
import Cell from './helpers/Cell.tsx';
import Slider from '../ui-components/Slider.tsx';

const [width, setWidth] = createSignal(50);
const [height, setHeight] = createSignal(30);
const [thickness, setThickness] = createSignal(1);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const w = width();
    const h = height();
    const th = thickness();
    const pts: Point[] = [];
    const halfTh = (th - 1) / 2;

    for (let t = -Math.floor(halfTh); t <= Math.ceil(halfTh); t++) {
      const a = (w / 2) + t;
      const b = (h / 2) + t;
      
      // Basic ellipse rasterization (midpoint-ish)
      for (let x = -a; x <= a; x++) {
        const y = b * Math.sqrt(Math.max(0, 1 - (x * x) / (a * a)));
        pts.push({ x: Math.round(x), y: Math.round(y) });
        pts.push({ x: Math.round(x), y: Math.round(-y) });
      }
      for (let y = -b; y <= b; y++) {
        const x = a * Math.sqrt(Math.max(0, 1 - (y * y) / (b * b)));
        pts.push({ x: Math.round(x), y: Math.round(y) });
        pts.push({ x: Math.round(-x), y: Math.round(y) });
      }
    }
    return pts;
  };

  return (
    <For each={points()}>
      {(p) => <Cell x={p.x} y={p.y} />}
    </For>
  );
};

const SettingsComponent = (): JSX.Element => (
  <>
    <Slider label="Width" min={4} max={500} currentVal={width} updateVal={setWidth} />
    <Slider label="Height" min={4} max={500} currentVal={height} updateVal={setHeight} />
    <Slider label="Thickness" min={1} max={50} currentVal={thickness} updateVal={setThickness} />
  </>
);

const Oval: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Oval',
};

export default Oval;
