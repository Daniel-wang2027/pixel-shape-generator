import { createSignal, For, JSX } from 'solid-js';
import type { ShapeFactory, ShapeInstance } from '../types.d.ts';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';
import Cell from './helpers/Cell.tsx';

function createArchimedianSpiral(): ShapeInstance {
  const [loops, setLoops] = createSignal(3);
  const [diameter, setDiameter] = createSignal(25);
  const [rotation, setRotation] = createSignal(0);
  const [invert, setInvert] = createSignal(false);

  const ShapeComponent = (props: { masterRotation?: number }): JSX.Element => {
    const a = diameter() / 4 / loops() / Math.PI;
    const r = ((rotation() + (props.masterRotation || 0)) * Math.PI) / 180;
    let lastX = Infinity;
    let lastY = Infinity;
    let theta = loops() * 2 * Math.PI;
    let coords: { x: number; y: number }[] = [];
    while (theta > 0) {
      const radius = a * theta;
      const x = (invert() ? -1 : 1) * Math.round(radius * Math.cos(theta + r));
      const y = Math.round(radius * Math.sin(theta + r));
      theta -= 1 / radius;
      if (x === lastX && y === lastY) continue;
      coords.push({ x, y });
      lastX = x;
      lastY = y;
    }
    return <For each={coords}>{(c) => <Cell x={c.x} y={c.y} />}</For>;
  };

  const SettingsComponent = (): JSX.Element => {
    return (
      <>
        <Slider
          label="Loops"
          min={0.5}
          max={10}
          step={0.1}
          currentVal={loops}
          updateVal={setLoops}
        />
        <Slider
          label="Diameter"
          min={4}
          max={500}
          currentVal={diameter}
          updateVal={setDiameter}
        />
        <Slider
          label="Rotation"
          min={0}
          max={360}
          currentVal={rotation}
          updateVal={setRotation}
        />
        <Switch label="Invert" currentVal={invert} updateVal={setInvert} />
      </>
    );
  };

  return {
    shapeComponent: ShapeComponent,
    settingsComponent: SettingsComponent,
  };
}

const ArchimedianSpiral: ShapeFactory = {
  name: 'Archimedian Spiral',
  createInstance: createArchimedianSpiral,
};

export default ArchimedianSpiral;