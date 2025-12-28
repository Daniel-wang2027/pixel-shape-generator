import { For } from 'solid-js';
import Cell from './Cell.tsx';
import { Point } from '../../types';

const CellCircle = (props: {
  x: number;
  y: number;
  diameter: number;
  thickness?: number;
  debug?: boolean;
}) => {
  const thickness = () => props.thickness ?? 1;

  const points: Point[] = [];
  const t = thickness();
  const half = (t - 1) / 2;

  for (let thick = -Math.floor(half); thick <= Math.ceil(half); thick++) {
    let r = (props.diameter - 1) / 2 + thick;
    r += 0.1 * (r > 2 ? -1 : 1);

    const isEven = props.diameter % 2 === 0;
    const offset = isEven ? 0.5 : 0;
    const cx = props.x + offset;
    const cy = props.y + offset;

    for (let x = offset; x < r; x++) {
      const py = r * r - x * x;
      const y = Math.sqrt(py);

      points.push({ x: Math.round(cx + x), y: Math.round(cy - y) });
      points.push({ x: Math.round(cx + y), y: Math.round(cy - x) });
      points.push({ x: Math.round(cx + x), y: Math.round(cy + y) });
      points.push({ x: Math.round(cx + y), y: Math.round(cy + x) });
      points.push({ x: Math.round(cx - x), y: Math.round(cy - y) });
      points.push({ x: Math.round(cx - y), y: Math.round(cy - x) });
      points.push({ x: Math.round(cx - x), y: Math.round(cy + y) });
      points.push({ x: Math.round(cx - y), y: Math.round(cy + x) });
    }
  }

  return (
    <For each={points}>
      {(c) => <Cell x={c.x} y={c.y} debug={props.debug} />}
    </For>
  );
};

export default CellCircle;
