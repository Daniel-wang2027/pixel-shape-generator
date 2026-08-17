import { createSignal, For, JSX } from 'solid-js';
import type { ShapeFactory, ShapeInstance } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

function createHeart(): ShapeInstance {
  const [size, setSize] = createSignal(25);
  const [rotation, setRotation] = createSignal(0);

  const ShapeComponent = (props: { masterRotation?: number }): JSX.Element => {
    const points = () => {
      const pts: { x: number; y: number }[] = [];
      const s = size() / 2;
      const rad = ((rotation() + (props.masterRotation || 0)) * Math.PI) / 180;
      
      // Heart curve parametric equation with rotation
      for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
        const xRaw = 16 * Math.pow(Math.sin(t), 3);
        const yRaw = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        );
        const scale = s / 17;
        const xScaled = xRaw * scale;
        const yScaled = yRaw * scale;
        
        // Apply rotation
        const x = xScaled * Math.cos(rad) - yScaled * Math.sin(rad);
        const y = xScaled * Math.sin(rad) + yScaled * Math.cos(rad);
        
        pts.push({ x, y });
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

  const SettingsComponent = (): JSX.Element => {
    return (
      <>
        <Slider
          label="Size"
          min={10}
          max={500}
          currentVal={size}
          updateVal={setSize}
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

  return {
    shapeComponent: ShapeComponent,
    settingsComponent: SettingsComponent,
  };
}

const Heart: ShapeFactory = {
  name: 'Heart',
  createInstance: createHeart,
};

export default Heart;
