import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [width, setWidth] = createSignal(40);
const [height, setHeight] = createSignal(60);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = (): JSX.Element => {
  const points = () => {
    const pts = [
      { x: 0, y: -height() / 2 },
      { x: width() / 2, y: 0 },
      { x: 0, y: height() / 2 },
      { x: -width() / 2, y: 0 },
    ];
    const rad = (rotation() * Math.PI) / 180;
    
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

const SettingsComponent = (): JSX.Element => {
  return (
    <>
      <Slider
        label="Width"
        min={10}
        max={500}
        currentVal={width}
        updateVal={setWidth}
      />
      <Slider
        label="Height"
        min={10}
        max={500}
        currentVal={height}
        updateVal={setHeight}
      />
      <Slider
        label="Rotation"
        min={0}
        max={360}
        currentVal={rotation}
        updateVal={setRotation}
      />
    </>
  );
};

const Diamond: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Diamond',
};

export default Diamond;
