import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [headSize, setHeadSize] = createSignal(30);
const [shaftWidth, setShaftWidth] = createSignal(15);
const [totalLength, setTotalLength] = createSignal(100);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const hs = headSize();
    const sw = shaftWidth() / 2;
    const tl = totalLength() / 2;
    const rad = (rotation() * Math.PI) / 180;

    const pts = [
      { x: -tl, y: -sw }, { x: tl - hs, y: -sw }, { x: tl - hs, y: -hs },
      { x: tl, y: 0 }, { x: tl - hs, y: hs }, { x: tl - hs, y: sw },
      { x: -tl, y: sw }
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
    <Slider label="Total Length" min={20} max={400} currentVal={totalLength} updateVal={setTotalLength} />
    <Slider label="Head Size" min={5} max={100} currentVal={headSize} updateVal={setHeadSize} />
    <Slider label="Shaft Width" min={2} max={100} currentVal={shaftWidth} updateVal={setShaftWidth} />
    <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
  </>
);

const Arrow: Shape = { shapeComponent: ShapeComponent, settingsComponent: SettingsComponent, name: 'Arrow' };
export default Arrow;
