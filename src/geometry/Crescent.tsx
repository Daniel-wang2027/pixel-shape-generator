import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [outerRadius, setOuterRadius] = createSignal(50);
const [innerRadius, setInnerRadius] = createSignal(40);
const [offset, setOffset] = createSignal(15);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const pts: { x: number; y: number }[] = [];
    const rad = (rotation() * Math.PI) / 180;
    const or = outerRadius();
    const ir = innerRadius();
    const off = offset();

    // Outer arc
    for (let t = -Math.PI / 1.5; t <= Math.PI / 1.5; t += 0.1) {
      pts.push({ x: or * Math.cos(t), y: or * Math.sin(t) });
    }
    // Inner arc
    for (let t = Math.PI / 1.5; t >= -Math.PI / 1.5; t -= 0.1) {
      pts.push({ x: ir * Math.cos(t) + off, y: ir * Math.sin(t) });
    }

    return pts.map(p => ({
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

const SettingsComponent = (): JSX.Element => (
  <>
    <Slider label="Outer Radius" min={10} max={250} currentVal={outerRadius} updateVal={setOuterRadius} />
    <Slider label="Inner Radius" min={10} max={250} currentVal={innerRadius} updateVal={setInnerRadius} />
    <Slider label="Crescent Offset" min={0} max={100} currentVal={offset} updateVal={setOffset} />
    <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
  </>
);

const Crescent: Shape = { shapeComponent: ShapeComponent, settingsComponent: SettingsComponent, name: 'Crescent' };
export default Crescent;
