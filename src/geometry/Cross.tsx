import { createSignal, For, JSX } from 'solid-js';
import type { ShapeFactory, ShapeInstance } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

function createCross(): ShapeInstance {
  const [thickness, setThickness] = createSignal(20);
  const [horizontalLength, setHorizontalLength] = createSignal(80);
  const [verticalLength, setVerticalLength] = createSignal(80);
  const [horizontalBarOffset, setHorizontalBarOffset] = createSignal(0);
  const [verticalBarOffset, setVerticalBarOffset] = createSignal(0);
  const [rotation, setRotation] = createSignal(0);

  const ShapeComponent = (props: { masterRotation?: number }): JSX.Element => {
    const points = () => {
      const t = thickness() / 2;
      const hl = horizontalLength() / 2;
      const vl = verticalLength() / 2;
      const hOff = horizontalBarOffset();
      const vOff = verticalBarOffset();
      const rad = ((rotation() + (props.masterRotation || 0)) * Math.PI) / 180;
      
      const pts = [
        { x: -t + hOff, y: -vl }, { x: t + hOff, y: -vl }, { x: t + hOff, y: -t + vOff },
        { x: hl, y: -t + vOff }, { x: hl, y: t + vOff }, { x: t + hOff, y: t + vOff },
        { x: t + hOff, y: vl }, { x: -t + hOff, y: vl }, { x: -t + hOff, y: t + vOff },
        { x: -hl, y: t + vOff }, { x: -hl, y: -t + vOff }, { x: -t + hOff, y: -t + vOff },
      ];

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
        <Slider label="Horiz. Length" min={10} max={400} currentVal={horizontalLength} updateVal={setHorizontalLength} />
        <Slider label="Vert. Length" min={10} max={400} currentVal={verticalLength} updateVal={setVerticalLength} />
        <Slider label="Horiz. Bar Offset" min={-200} max={200} currentVal={horizontalBarOffset} updateVal={setHorizontalBarOffset} />
        <Slider label="Vert. Bar Offset" min={-200} max={200} currentVal={verticalBarOffset} updateVal={setVerticalBarOffset} />
        <Slider label="Rotation" min={0} max={360} currentVal={rotation} updateVal={setRotation} />
      </>
    );
  };

  return {
    shapeComponent: ShapeComponent,
    settingsComponent: SettingsComponent,
  };
}

const Cross: ShapeFactory = {
  name: 'Cross',
  createInstance: createCross,
};

export default Cross;
