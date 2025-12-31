import { createSignal, For, Show, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';
import CellLine from './helpers/CellLine.tsx';
import Cell from './helpers/Cell.tsx';

const [width, setWidth] = createSignal(31);
const [height, setHeight] = createSignal(31);
const [exponent, setExponent] = createSignal(4);
const [showBounds, setShowBounds] = createSignal(false);
const [showCenter, setShowCenter] = createSignal(false);

const ShapeComponent = (props: { masterRotation?: number }): JSX.Element => {
  const n = exponent();
  const a = width() / 2;
  const b = height() / 2;
  const rad = ((props.masterRotation || 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  let cx = width() % 2 === 0 ? 0.5 : 0;
  let cy = height() % 2 === 0 ? 0.5 : 0;

  const left = Math.trunc(cx - a);
  const right = Math.trunc(cx + a);
  const top = Math.trunc(cy - b);
  const bottom = Math.trunc(cy + b);

  let points = [];

  for (let x = cx + 1; x < right; x++) {
    let y = Math.round(b * (1 - (Math.abs(x) / a) ** n) ** (1 / n)) - cy;
    y = Math.max(cy, Math.min(y, bottom));
    points.push({ x, y });
  }
  points.push({ x: cx, y: bottom - cy });

  for (let y = cy + 1; y < bottom; y++) {
    let x = Math.round(a * (1 - (Math.abs(y) / b) ** n) ** (1 / n)) - cx;
    x = Math.max(cx, Math.min(x, right));
    points.push({ x, y });
  }
  points.push({ x: right - cx, y: cy });

  //if (showCenter()) points.push({ x: cx, y: cy });

  return (
    <>
      <Show when={showBounds()}>
        {(() => {
          const c1 = { x: left * cos - top * sin, y: left * sin + top * cos };
          const c2 = { x: right * cos - top * sin, y: right * sin + top * cos };
          const c3 = { x: right * cos - bottom * sin, y: right * sin + bottom * cos };
          const c4 = { x: left * cos - bottom * sin, y: left * sin + bottom * cos };
          return (
            <>
              <CellLine x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y} debug />
              <CellLine x1={c2.x} y1={c2.y} x2={c3.x} y2={c3.y} debug />
              <CellLine x1={c3.x} y1={c3.y} x2={c4.x} y2={c4.y} debug />
              <CellLine x1={c4.x} y1={c4.y} x2={c1.x} y2={c1.y} debug />
            </>
          );
        })()}
      </Show>
      <Show when={showCenter()}>
        {(() => {
          const vTop = { x: 0 * cos - top * sin, y: 0 * sin + top * cos };
          const vBottom = { x: 0 * cos - bottom * sin, y: 0 * sin + bottom * cos };
          const hLeft = { x: left * cos - 0 * sin, y: left * sin + 0 * cos };
          const hRight = { x: right * cos - 0 * sin, y: right * sin + 0 * cos };
          return (
            <>
              <CellLine x1={vTop.x} y1={vTop.y} x2={vBottom.x} y2={vBottom.y} debug />
              <CellLine x1={hLeft.x} y1={hLeft.y} x2={hRight.x} y2={hRight.y} debug />
            </>
          );
        })()}
      </Show>
      <For each={points}>
        {(p) => {
          const pts = [
            { x: cx + p.x, y: cy + p.y },
            { x: cx - p.x, y: cy + p.y },
            { x: cx + p.x, y: cy - p.y },
            { x: cx - p.x, y: cy - p.y }
          ];
          return (
            <For each={pts}>
              {(pt) => <Cell x={pt.x * cos - pt.y * sin} y={pt.x * sin + pt.y * cos} />}
            </For>
          );
        }}
      </For>
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
        label="Exponent"
        min={0.1}
        max={10}
        step={0.01}
        currentVal={exponent}
        updateVal={setExponent}
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
    </>
  );
};

const Superellipse: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Superellipse',
};

export default Superellipse;
