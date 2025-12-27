import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [outerRadius, setOuterRadius] = createSignal(50);
const [innerRadius, setInnerRadius] = createSignal(25);
const [pointsCount, setPointsCount] = createSignal(6);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const pts: { x: number; y: number }[] = [];
    const rad = (rotation() * Math.PI) / 180;
    const or = outerRadius();
    const ir = innerRadius();
    const n = pointsCount();

    for (let i = 0; i < n * 2; i++) {
      const angle = (i * Math.PI) / n + rad;
      const r = i % 2 === 0 ? or : ir;
      pts.push({
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
      });
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

const SettingsComponent = (): JSX.Element => (
  <>
    <Slider label="Points" min={3} max={32} currentVal={pointsCount} updateVal={setPointsCount} />
    <Slider label="Outer Radius" min={10} max={250} currentVal={outerRadius} updateVal={setOuterRadius} />
    <Slider label="Inner Radius" min={5} max={200} currentVal={innerRadius} updateVal={setInnerRadius} />
    <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
  </>
);

const Hexagram: Shape = { 
  shapeComponent: ShapeComponent, 
  settingsComponent: SettingsComponent, 
  name: 'Hexagram' 
};
export default Hexagram;
