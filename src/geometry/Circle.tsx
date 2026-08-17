import { createSignal, JSX, Show } from 'solid-js';
import type { ShapeFactory, ShapeInstance } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import CellCircle from './helpers/CellCircle.tsx';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';

function createCircle(): ShapeInstance {
  const [diameter, setDiameter] = createSignal(25);
  const [thickness, setThickness] = createSignal(1);

  const [showGuide, setShowGuide] = createSignal(false);
  const [showBounds, setShowBounds] = createSignal(false);
  const [showCenter, setShowCenter] = createSignal(false);

  const ShapeComponent = (props: { masterRotation?: number }): JSX.Element => {
    const d = diameter();
    const rotationRadians = () => ((props.masterRotation || 0) * Math.PI) / 180;
    
    const rotate = (x: number, y: number): { x: number; y: number } => {
      const rad = rotationRadians();
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return {
        x: x * cos - y * sin,
        y: x * sin + y * cos,
      };
    };

    let r = (d - 1) / 2;
    r += 0.1 * (r > 2 ? -1 : 1);

    const isEven = d % 2 === 0;
    const offset = isEven ? 0.5 : 0;

    const left = offset - r;
    const right = offset + r;
    const top = offset - r;
    const bottom = offset + r;

    const c1 = rotate(left, top);
    const c2 = rotate(right, top);
    const c3 = rotate(right, bottom);
    const c4 = rotate(left, bottom);

    return (
      <>
        <Show when={showBounds()}>
          <CellLine debug x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y} />
          <CellLine debug x1={c2.x} y1={c2.y} x2={c3.x} y2={c3.y} />
          <CellLine debug x1={c3.x} y1={c3.y} x2={c4.x} y2={c4.y} />
          <CellLine debug x1={c4.x} y1={c4.y} x2={c1.x} y2={c1.y} />
        </Show>
        <Show when={showCenter()}>
          {(() => {
            const vTop = rotate(0, top);
            const vBottom = rotate(0, bottom);
            const hLeft = rotate(left, 0);
            const hRight = rotate(right, 0);
            return (
              <>
                <CellLine debug x1={vTop.x} y1={vTop.y} x2={vBottom.x} y2={vBottom.y} />
                <CellLine debug x1={hLeft.x} y1={hLeft.y} x2={hRight.x} y2={hRight.y} />
              </>
            );
          })()}
        </Show>
        <CellCircle x={0} y={0} diameter={d} thickness={thickness()} transform={props.masterRotation ? `rotate(${props.masterRotation})` : undefined} />
      </>
    );
  };

  const SettingsComponent = (): JSX.Element => {
    return (
      <>
        <Slider
          label="Diameter"
          min={1}
          max={500}
          currentVal={diameter}
          updateVal={setDiameter}
        />
        <Slider
          label="Thickness"
          min={1}
          max={50}
          currentVal={thickness}
          updateVal={setThickness}
        />
        <Switch
          label="Show Bounds"
          currentVal={showBounds}
          updateVal={setShowBounds}
        />
        <Switch
          label="Show Center"
          currentVal={showCenter}
          updateVal={setShowCenter}
        />
        <Switch
          label="Show Draw Guide"
          currentVal={showGuide}
          updateVal={setShowGuide}
        />
      </>
    );
  };

  return {
    shapeComponent: ShapeComponent,
    settingsComponent: SettingsComponent,
  };
}

const Circle: ShapeFactory = {
  name: 'Circle',
  createInstance: createCircle,
};

export default Circle;
