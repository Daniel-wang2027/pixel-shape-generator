import { For } from 'solid-js';
import Cell from './Cell.tsx';

const CellLine = (props: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness?: number;
  debug?: boolean;
}) => {
  const dx = props.x2 - props.x1;
  const dy = props.y2 - props.y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const sx = dx / steps;
  const sy = dy / steps;

  const thickness = () => props.thickness ?? 1;

  const points = () => {
    const pts: { x: number; y: number }[] = [];
    const t = thickness();
    const half = (t - 1) / 2;

    for (let i = 0; i <= steps; i++) {
      const baseX = props.x1 + sx * i;
      const baseY = props.y1 + sy * i;

      for (let tx = -Math.floor(half); tx <= Math.ceil(half); tx++) {
        for (let ty = -Math.floor(half); ty <= Math.ceil(half); ty++) {
          pts.push({
            x: Math.round(baseX + tx),
            y: Math.round(baseY + ty),
          });
        }
      }
    }
    return pts;
  };

  return (
    <For each={points()}>
      {(p) => (
        <Cell
          debug={props.debug}
          x={p.x}
          y={p.y}
        />
      )}
    </For>
  );
};

export default CellLine;
