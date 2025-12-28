import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [base, setBase] = createSignal(40);
const [height, setHeight] = createSignal(40);
const [thickness, setThickness] = createSignal(1);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const b = base();
    const h = height();
    const th = thickness();
    
    // Centered triangle
    const v1 = { x: 0, y: -h / 2 };
    const v2 = { x: -b / 2, y: h / 2 };
    const v3 = { x: b / 2, y: h / 2 };

    return [
      { p1: v1, p2: v2 },
      { p1: v2, p2: v3 },
      { p1: v3, p2: v1 }
    ];
  };

  return (
    <>
      <For each={points()}>
        {(edge) => (
          <CellLine 
            x1={edge.p1.x} 
            y1={edge.p1.y} 
            x2={edge.p2.x} 
            y2={edge.p2.y} 
            thickness={thickness()} 
          />
        )}
      </For>
    </>
  );
};

const SettingsComponent = (): JSX.Element => (
  <>
    <Slider label="Base" min={2} max={500} currentVal={base} updateVal={setBase} />
    <Slider label="Height" min={2} max={500} currentVal={height} updateVal={setHeight} />
    <Slider label="Thickness" min={1} max={50} currentVal={thickness} updateVal={setThickness} />
  </>
);

const Triangle: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Triangle',
};

export default Triangle;
