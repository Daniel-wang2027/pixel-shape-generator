import { createSignal, For, Show, JSX } from 'solid-js';
import type { ShapeFactory, ShapeInstance } from '../types.d.ts';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';
import CellLine from './helpers/CellLine.tsx';

function createRectangle(): ShapeInstance {
  const [width, setWidth] = createSignal(15);
  const [height, setHeight] = createSignal(25);
  const [rotation, setRotation] = createSignal(30);
  const [showDrawGuide, setShowDrawGuide] = createSignal(false);

  const ShapeComponent = (props: { masterRotation?: number }): JSX.Element => {
    const a = () => width() / 2;
    const b = () => height() / 2;
    const rotationRadians = () => ((rotation() + (props.masterRotation || 0)) * Math.PI) / 180;

    const rotate = (x: number, y: number): { x: number; y: number } => {
      const rad = rotationRadians();
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return {
        x: x * cos - y * sin,
        y: x * sin + y * cos,
      };
    };

    const corners = [
      rotate(-a(), -b()),
      rotate(a(), -b()),
      rotate(a(), b()),
      rotate(-a(), b()),
    ];

    return (
      <>
        <For each={corners}>
          {(corner, i) => {
            const nextCorner = corners[(i() + 1) % corners.length];
            return (
              <CellLine
                x1={corner.x}
                y1={corner.y}
                x2={nextCorner.x}
                y2={nextCorner.y}
              />
            );
          }}
        </For>
        <Show when={showDrawGuide()}>
          <polygon
            points={corners.map(({ x, y }) => `${x + 0.5},${y + 0.5}`).join(' ')}
            class="draw-guide"
          />
        </Show>
      </>
    );
  };

  const SettingsComponent = (): JSX.Element => {
    return (
      <>
        <Slider
          label="Width"
          min={4}
          max={500}
          currentVal={width}
          updateVal={setWidth}
        />
        <Slider
          label="Height"
          min={4}
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
        <Switch
          label="Show Draw Guide"
          currentVal={showDrawGuide}
          updateVal={setShowDrawGuide}
        />
      </>
    );
  };

  return {
    shapeComponent: ShapeComponent,
    settingsComponent: SettingsComponent,
  };
}

const Rectangle: ShapeFactory = {
  name: 'Rectangle',
  createInstance: createRectangle,
};

export default Rectangle;
