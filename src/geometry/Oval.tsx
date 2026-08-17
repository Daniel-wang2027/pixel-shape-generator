import { createSignal, JSX, For } from 'solid-js';
import type { ShapeFactory, ShapeInstance, Point } from '../types.d.ts';
import Cell from './helpers/Cell.tsx';
import Slider from '../ui-components/Slider.tsx';

function createOval(): ShapeInstance {
  const [width, setWidth] = createSignal(50);
  const [height, setHeight] = createSignal(30);
  const [thickness, setThickness] = createSignal(1);

  const ShapeComponent = (props: { masterRotation?: number }): JSX.Element => {
    const points = () => {
      const w = width();
      const h = height();
      const th = thickness();
      const rad = ((props.masterRotation || 0) * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      
      const pts: Point[] = [];
      const halfTh = (th - 1) / 2;

      for (let t = -Math.floor(halfTh); t <= Math.ceil(halfTh); t++) {
        const a = (w / 2) + t;
        const b = (h / 2) + t;
        
        // Basic ellipse rasterization (midpoint-ish)
        for (let x = -a; x <= a; x++) {
          const y = b * Math.sqrt(Math.max(0, 1 - (x * x) / (a * a)));
          pts.push({ x: x * cos - y * sin, y: x * sin + y * cos });
          pts.push({ x: x * cos - (-y) * sin, y: x * sin + (-y) * cos });
        }
        for (let y = -b; y <= b; y++) {
          const x = a * Math.sqrt(Math.max(0, 1 - (y * y) / (b * b)));
          pts.push({ x: x * cos - y * sin, y: x * sin + y * cos });
          pts.push({ x: (-x) * cos - y * sin, y: (-x) * sin + y * cos });
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

  return {
    shapeComponent: ShapeComponent,
    settingsComponent: SettingsComponent,
  };
}

const Oval: ShapeFactory = {
  name: 'Oval',
  createInstance: createOval,
};

export default Oval;
