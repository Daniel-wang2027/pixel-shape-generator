import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [size, setSize] = createSignal(100);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const s = size() / 2;
    const r = s / Math.sqrt(3);
    const rad = (rotation() * Math.PI) / 180;

    const triangle1 = [
      { x: 0, y: -s },
      { x: s * Math.cos(Math.PI / 6), y: s * Math.sin(Math.PI / 6) },
      { x: -s * Math.cos(Math.PI / 6), y: s * Math.sin(Math.PI / 6) },
    ];

    const triangle2 = [
      { x: 0, y: s },
      { x: s * Math.cos(Math.PI / 6), y: -s * Math.sin(Math.PI / 6) },
      { x: -s * Math.cos(Math.PI / 6), y: -s * Math.sin(Math.PI / 6) },
    ];

    const rotate = (p: { x: number; y: number }) => ({
      x: p.x * Math.cos(rad) - p.y * Math.sin(rad),
      y: p.x * Math.sin(rad) + p.y * Math.cos(rad),
    });

    return [triangle1.map(rotate), triangle2.map(rotate)];
  };

  return (
    <>
      <For each={points()[0]}>
        {(p, i) => {
          const next = points()[0][(i() + 1) % 3];
          return <CellLine x1={p.x} y1={p.y} x2={next.x} y2={next.y} />;
        }}
      </For>
      <For each={points()[1]}>
        {(p, i) => {
          const next = points()[1][(i() + 1) % 3];
          return <CellLine x1={p.x} y1={p.y} x2={next.x} y2={next.y} />;
        }}
      </For>
    </>
  );
};

const SettingsComponent = (): JSX.Element => (
  <>
    <Slider label="Size" min={20} max={400} currentVal={size} updateVal={setSize} />
    <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
  </>
);

const StarOfDavid: Shape = { shapeComponent: ShapeComponent, settingsComponent: SettingsComponent, name: 'Star of David' };
export default StarOfDavid;
