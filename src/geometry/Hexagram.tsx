import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [outerRadius, setOuterRadius] = createSignal(50);
const [innerRadius, setInnerRadius] = createSignal(25);
const [pointsCount, setPointsCount] = createSignal(6);
const [rotation, setRotation] = createSignal(0);
const [thickness, setThickness] = createSignal(1);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const or = outerRadius();
    const ir = innerRadius();
    const rad = (rotation() * Math.PI) / 180;
    const n = pointsCount();

    const rotate = (p: { x: number; y: number }) => ({
      x: p.x * Math.cos(rad) - p.y * Math.sin(rad),
      y: p.x * Math.sin(rad) + p.y * Math.cos(rad),
    });

    const poly1: { x: number; y: number }[] = [];
    const poly2: { x: number; y: number }[] = [];
    
    for (let i = 0; i < n; i++) {
      const angle1 = (i * 2 * Math.PI) / n;
      const angle2 = angle1 + Math.PI / n;
      
      poly1.push(rotate({ x: or * Math.cos(angle1), y: or * Math.sin(angle1) }));
      poly2.push(rotate({ x: ir * Math.cos(angle2), y: ir * Math.sin(angle2) }));
    }

    return [poly1, poly2];
  };

  return (
    <>
      <For each={points()}>
        {(poly) => (
          <For each={poly}>
            {(p, i) => {
              const next = poly[(i() + 1) % poly.length];
              return <CellLine x1={p.x} y1={p.y} x2={next.x} y2={next.y} thickness={thickness()} />;
            }}
          </For>
        )}
      </For>
    </>
  );
};

const SettingsComponent = (): JSX.Element => (
  <>
    <Slider label="Points" min={3} max={32} currentVal={pointsCount} updateVal={setPointsCount} />
    <Slider label="Outer Radius" min={10} max={250} currentVal={outerRadius} updateVal={setOuterRadius} />
    <Slider label="Inner Radius" min={10} max={250} currentVal={innerRadius} updateVal={setInnerRadius} />
    <Slider label="Thickness" min={1} max={10} currentVal={thickness} updateVal={setThickness} />
    <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
  </>
);

const Hexagram: Shape = { 
  shapeComponent: ShapeComponent, 
  settingsComponent: SettingsComponent, 
  name: 'Hexagram' 
};
export default Hexagram;
