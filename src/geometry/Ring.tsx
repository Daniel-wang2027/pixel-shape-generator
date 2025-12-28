import { createSignal, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellCircle from './helpers/CellCircle.tsx';
import Slider from '../ui-components/Slider.tsx';

const [outerDiameter, setOuterDiameter] = createSignal(40);
const [innerDiameter, setInnerDiameter] = createSignal(20);
const [thickness, setThickness] = createSignal(1);

const ShapeComponent = (): JSX.Element => {
  return (
    <>
      <CellCircle x={0} y={0} diameter={outerDiameter()} thickness={thickness()} />
      <CellCircle x={0} y={0} diameter={innerDiameter()} thickness={thickness()} />
    </>
  );
};

const SettingsComponent = (): JSX.Element => (
  <>
    <Slider label="Outer Diameter" min={10} max={500} currentVal={outerDiameter} updateVal={setOuterDiameter} />
    <Slider label="Inner Diameter" min={2} max={490} currentVal={innerDiameter} updateVal={setInnerDiameter} />
    <Slider label="Thickness" min={1} max={50} currentVal={thickness} updateVal={setThickness} />
  </>
);

const Ring: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Ring',
};

export default Ring;
