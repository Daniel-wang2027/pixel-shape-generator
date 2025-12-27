import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [vLength, setVLength] = createSignal(80);
const [hLength, setHLength] = createSignal(60);
const [thickness, setThickness] = createSignal(20);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const t = thickness();
    const vl = vLength();
    const hl = hLength();
    const rad = (rotation() * Math.PI) / 180;

    const pts = [
      { x: 0, y: 0 }, { x: hl, y: 0 }, { x: hl, y: t },
      { x: t, y: t }, { x: t, y: vl }, { x: 0, y: vl }
    ].map(p => ({ x: p.x - t/2, y: p.y - vl/2 })); // Center it roughly

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
    <Slider label="Vertical Length" min={10} max={400} currentVal={vLength} updateVal={setVLength} />
    <Slider label="Horizontal Length" min={10} max={400} currentVal={hLength} updateVal={setHLength} />
    <Slider label="Thickness" min={5} max={100} currentVal={thickness} updateVal={setThickness} />
    <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
  </>
);

const LShape: Shape = { shapeComponent: ShapeComponent, settingsComponent: SettingsComponent, name: 'L-Shape' };
export default LShape;
