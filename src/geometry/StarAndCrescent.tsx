import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [size, setSize] = createSignal(100);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const s = size();
    const or = s / 2;
    const ir = s / 2.5;
    const off = s / 6;
    const starS = s / 5;
    const starOff = s / 2;
    const rad = (rotation() * Math.PI) / 180;

    const rotate = (p: { x: number; y: number }) => ({
      x: p.x * Math.cos(rad) - p.y * Math.sin(rad),
      y: p.x * Math.sin(rad) + p.y * Math.cos(rad),
    });

    const crescentPts: { x: number; y: number }[] = [];
    for (let t = -Math.PI / 1.3; t <= Math.PI / 1.3; t += 0.1) {
      crescentPts.push(rotate({ x: or * Math.cos(t), y: or * Math.sin(t) }));
    }
    for (let t = Math.PI / 1.3; t >= -Math.PI / 1.3; t -= 0.1) {
      crescentPts.push(rotate({ x: ir * Math.cos(t) + off, y: ir * Math.sin(t) }));
    }

    const starPts: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const r = i % 2 === 0 ? starS : starS / 2.5;
      starPts.push(rotate({
        x: r * Math.cos(angle) + starOff,
        y: r * Math.sin(angle),
      }));
    }

    return { crescent: crescentPts, star: starPts };
  };

  return (
    <>
      <For each={points().crescent}>
        {(p, i) => {
          const next = points().crescent[(i() + 1) % points().crescent.length];
          return <CellLine x1={p.x} y1={p.y} x2={next.x} y2={next.y} />;
        }}
      </For>
      <For each={points().star}>
        {(p, i) => {
          const next = points().star[(i() + 1) % points().star.length];
          return <CellLine x1={p.x} y1={p.y} x2={next.x} y2={next.y} />;
        }}
      </For>
    </>
  );
};

const SettingsComponent = (): JSX.Element => (
  <>
    <Slider label="Size" min={40} max={400} currentVal={size} updateVal={setSize} />
    <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
  </>
);

const StarAndCrescent: Shape = { shapeComponent: ShapeComponent, settingsComponent: SettingsComponent, name: 'Star and Crescent' };
export default StarAndCrescent;
