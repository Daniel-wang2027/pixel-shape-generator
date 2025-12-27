import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [thickness, setThickness] = createSignal(20);
const [horizontalLength, setHorizontalLength] = createSignal(80);
const [verticalLength, setVerticalLength] = createSignal(80);
const [horizontalOffset, setHorizontalOffset] = createSignal(0);
const [verticalOffset, setVerticalOffset] = createSignal(0);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const t = thickness() / 2;
    const hl = horizontalLength() / 2;
    const vl = verticalLength() / 2;
    const xOff = horizontalOffset();
    const yOff = verticalOffset();

    const pts = [
      { x: -t + xOff, y: -vl + yOff }, { x: t + xOff, y: -vl + yOff }, { x: t + xOff, y: -t + yOff },
      { x: hl + xOff, y: -t + yOff }, { x: hl + xOff, y: t + yOff }, { x: t + xOff, y: t + yOff },
      { x: t + xOff, y: vl + yOff }, { x: -t + xOff, y: vl + yOff }, { x: -t + xOff, y: t + yOff },
      { x: -hl + xOff, y: t + yOff }, { x: -hl + xOff, y: -t + yOff }, { x: -t + xOff, y: -t + yOff },
    ];
    const rad = (rotation() * Math.PI) / 180;

    return pts.map((p) => ({
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

const SettingsComponent = (): JSX.Element => {
  return (
    <>
      <Slider label="Thickness" min={5} max={100} currentVal={thickness} updateVal={setThickness} />
      <Slider label="Horizontal Length" min={10} max={400} currentVal={horizontalLength} updateVal={setHorizontalLength} />
      <Slider label="Vertical Length" min={10} max={400} currentVal={verticalLength} updateVal={setVerticalLength} />
      <Slider label="Horizontal Offset" min={-200} max={200} currentVal={horizontalOffset} updateVal={setHorizontalOffset} />
      <Slider label="Vertical Offset" min={-200} max={200} currentVal={verticalOffset} updateVal={setVerticalOffset} />
      <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
    </>
  );
};

const Cross: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Cross',
};

export default Cross;
