import { createSignal, For, Show, JSX } from 'solid-js';
import type { ShapeFactory, ShapeInstance } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';

function createSpirangle(): ShapeInstance {
  const [sides, setSides] = createSignal(4);
  const [diameter, setDiameter] = createSignal(50);
  const [loops, setLoops] = createSignal(4);
  const [rotation, setRotation] = createSignal(30);
  const [invert, setInvert] = createSignal(false);
  const [showDrawGuide, setShowDrawGuide] = createSignal(false);

  const ShapeComponent = (props: { masterRotation?: number }): JSX.Element => {
    let k = 0;
    const radius = diameter() / 2;
    const radiusStep = radius / sides() / loops();
    let verts: { x: number; y: number }[] = [];
    const mRot = props.masterRotation || 0;
    for (let i = 0; i < loops(); i++) {
      for (let j = 0; j < sides(); j++) {
        const angle = (j * 2 * Math.PI) / sides() + ((rotation() + mRot) * Math.PI) / 180;
        verts.push({
          x: (invert() ? -1 : 1) * radiusStep * k * Math.cos(angle),
          y: radiusStep * k * Math.sin(angle),
        });
        k++;
      }
    }

    return (
      <>
        <For each={Array.from({ length: verts.length - 1 })}>
          {(_, i) => (
            <CellLine
              x1={verts[i()].x}
              y1={verts[i()].y}
              x2={verts[i() + 1].x}
              y2={verts[i() + 1].y}
            />
          )}
        </For>
        <Show when={showDrawGuide()}>
          <polyline
            points={verts.map(({ x, y }) => `${x + 0.5},${y + 0.5}`).join(' ')}
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
          label="Sides"
          min={3}
          max={10}
          currentVal={sides}
          updateVal={setSides}
        />
        <Slider
          label="Diameter"
          min={10}
          max={500}
          currentVal={diameter}
          updateVal={setDiameter}
        />
        <Slider
          label="Loops"
          min={2}
          max={10}
          currentVal={loops}
          updateVal={setLoops}
        />
        <Slider
          label="Rotation"
          min={0}
          max={360}
          currentVal={rotation}
          updateVal={setRotation}
        />
        <Switch label="Invert" currentVal={invert} updateVal={setInvert} />
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

const Spirangle: ShapeFactory = {
  name: 'Spirangle',
  createInstance: createSpirangle,
};

export default Spirangle;
