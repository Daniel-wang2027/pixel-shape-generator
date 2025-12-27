import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [topWidth, setTopWidth] = createSignal(60);
const [bottomWidth, setBottomWidth] = createSignal(100);
const [height, setHeight] = createSignal(60);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const tw = topWidth() / 2;
    const bw = bottomWidth() / 2;
    const h = height() / 2;
    const rad = (rotation() * Math.PI) / 180;

    const pts = [
      { x: -tw, y: -h }, { x: tw, y: -h },
      { x: bw, y: h }, { x: -bw, y: h }
    ];

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
    <Slider label="Top Width" min={10} max={400} currentVal={topWidth} updateVal={setTopWidth} />
    <Slider label="Bottom Width" min={10} max={400} currentVal={bottomWidth} updateVal={setBottomWidth} />
    <Slider label="Height" min={10} max={400} currentVal={height} updateVal={setHeight} />
    <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
  </>
);

const Trapezoid: Shape = { shapeComponent: ShapeComponent, settingsComponent: SettingsComponent, name: 'Trapezoid' };
export default Trapezoid;
