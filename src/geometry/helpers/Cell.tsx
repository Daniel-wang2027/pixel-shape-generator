import { createContext, createSignal, JSX, useContext } from 'solid-js';

type Point = { x: number; y: number };

type CellTransform = (point: Point) => Point;

const identityTransform: CellTransform = (point) => point;
const CellTransformContext = createContext<CellTransform>(identityTransform);

const CellTransformProvider = (props: {
  transform: CellTransform;
  children: JSX.Element;
}): JSX.Element => (
  <CellTransformContext.Provider value={props.transform}>
    {props.children}
  </CellTransformContext.Provider>
);

const Cell = (props: {
  x: number;
  y: number;
  debug?: boolean;
  transform?: string;
}): JSX.Element => {
  const [isHighlighted, setIsHighlighted] = createSignal(false);
  const transformPoint = useContext(CellTransformContext);
  const point = () => transformPoint({ x: props.x, y: props.y });

  return (
    <rect
      onClick={() => setIsHighlighted(!isHighlighted())}
      x={point().x}
      y={point().y}
      width="1"
      height="1"
      transform={props.transform}
      classList={{
        cell: true,
        debug: props.debug,
        highlighted: isHighlighted(),
      }}
    />
  );
};

export { CellTransformProvider };
export default Cell;
