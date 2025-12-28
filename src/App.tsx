import {
  createSignal,
  createMemo,
  onCleanup,
  onMount,
  For,
  Show,
} from 'solid-js';

import type { Shape } from './types';

import Rectangle from './geometry/Rectangle.tsx';
import RegularPolygon from './geometry/RegularPolygon.tsx';
import ReuleauxPolygon from './geometry/ReuleauxPolygon.tsx';
import Superellipse from './geometry/Superellipse.tsx';
import ArchimedianSpiral from './geometry/ArchimedianSpiral.tsx';
import Star from './geometry/Star.tsx';
import Spirangle from './geometry/Spirangle.tsx';
import Circle from './geometry/Circle.tsx';
import Heart from './geometry/Heart.tsx';
import Gear from './geometry/Gear.tsx';
import Diamond from './geometry/Diamond.tsx';
import Capsule from './geometry/Capsule.tsx';
import Cross from './geometry/Cross.tsx';
import Arrow from './geometry/Arrow.tsx';
import Crescent from './geometry/Crescent.tsx';
import Trapezoid from './geometry/Trapezoid.tsx';
import LShape from './geometry/LShape.tsx';
import Hexagram from './geometry/Hexagram.tsx';
import Triangle from './geometry/Triangle.tsx';
import Oval from './geometry/Oval.tsx';
import Ring from './geometry/Ring.tsx';

import { downloadSVG, downloadPNG, downloadPBM } from './download.ts';
import {
  camera,
  panCamera,
  centerCamera,
  changeZoom,
  MIN_ZOOM,
  MAX_ZOOM,
  MIN_CELL_SIZE,
} from './camera.ts';
import {
  pointer,
  handleMouseDown,
  handleMouseLeave,
  handleMouseMove,
  handleMouseUp,
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
  handleWheel,
} from './pointer.ts';
import Select from './ui-components/Select.tsx';
import Switch from './ui-components/Switch.tsx';
import './App.css';

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

let outputContainer: HTMLDivElement | undefined;
const [outputSize, setOutputSize] = createSignal({ width: 0, height: 0 });

function App() {
  const shapes: Shape[] = [
    RegularPolygon,
    ReuleauxPolygon,
    Superellipse,
    ArchimedianSpiral,
    Star,
    Spirangle,
    Rectangle,
    Circle,
    Heart,
    Gear,
    Diamond,
    Capsule,
    Cross,
    Arrow,
    Crescent,
    Trapezoid,
    LShape,
    Hexagram,
    Triangle,
    Oval,
    Ring,
  ];

  const [selectedShape, setSelectedShape] = createSignal<Shape>(shapes[0]);

  const [cellCount, setCellCount] = createSignal(0);
  const [isCountingCells, setIsCountingCells] = createSignal(false);
  const [showGrid, setShowGrid] = createSignal(true);
  const [symmetry, setSymmetry] = createSignal('none');
  const [layers, setLayers] = createSignal([{ id: 0, shape: shapes[0] }]);
  const [syncRotation, setSyncRotation] = createSignal(true);
  const [globalRotation, setGlobalRotation] = createSignal(0);

  // debounced cell counting on shape renders
  onMount(() => {
    const getNumberUniqueCells = (): number => {
      const cells = document.getElementsByClassName('cell');
      const uniqueCells = new Set<string>();
      for (const cell of cells) {
        const x = cell.getAttribute('x');
        const y = cell.getAttribute('y');
        uniqueCells.add(`${x},${y}`);
      }
      return uniqueCells.size;
    };

    const updateCellCount = debounce(() => {
      setCellCount(getNumberUniqueCells());
      setIsCountingCells(false);
    }, 500);

    const observer = new MutationObserver((mutations) => {
      const includesCellNode = (nodes: NodeList): boolean => {
        for (const node of nodes) {
          if (node instanceof SVGRectElement) return true;
        }
        return false;
      };

      for (const mutation of mutations) {
        if (
          mutation.type === 'childList' &&
          (includesCellNode(mutation.addedNodes) ||
            includesCellNode(mutation.removedNodes))
        ) {
          setIsCountingCells(true);
          updateCellCount();
          break;
        }
      }
    });

    const cellsContainer = document.querySelector(
      'svg[data-layer-name="cells"]'
    );
    if (cellsContainer) {
      observer.observe(cellsContainer, {
        childList: true,
        subtree: false,
        attributes: false,
      });
    }

    setCellCount(getNumberUniqueCells());
    onCleanup(() => observer.disconnect());
  });

  onMount(() => {
    const mountStartTime = performance.now();
    const updateOutputSize = (): void => {
      if (!outputContainer) return;

      // preserve camera center on resize
      panCamera(
        (outputSize().width - outputContainer.offsetWidth) / 2,
        (outputSize().height - outputContainer.offsetHeight) / 2
      );

      setOutputSize({
        width: outputContainer.offsetWidth,
        height: outputContainer.offsetHeight,
      });

      const delta = performance.now() - mountStartTime;
      if (delta < 500) centerCamera();
    };
    updateOutputSize();
    const resizeObserver = new ResizeObserver(updateOutputSize);
    resizeObserver.observe(outputContainer!);
    onCleanup(() => {
      resizeObserver.disconnect();
    });
  });

  const scale = createMemo(
    () => 2 ** Math.ceil(Math.log2(Math.max(camera().zoom * MIN_CELL_SIZE, 1)))
  ); // number of cells per grid line
  const numVerticalGridLines = () =>
    Math.ceil((outputSize().width * camera().zoom) / scale()) + 1;
  const numHorizontalGridLines = () =>
    Math.ceil((outputSize().height * camera().zoom) / scale()) + 1;

  onMount(() => {
    const preventDefault = (event: TouchEvent): void => {
      if (event.cancelable) event.preventDefault();
    };
    outputContainer!.addEventListener('touchmove', preventDefault);
    onCleanup(() => {
      outputContainer!.removeEventListener('touchmove', preventDefault);
    });
  });

  return (
    <>
      <div
        id="output-container"
        ref={outputContainer}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onScroll={() => {}} // prevent scroll event propagation
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
          <svg
            data-layer-name="cells"
            width={outputSize().width}
            height={outputSize().height}
            viewBox={`${camera().position.x * camera().zoom} ${camera().position.y * camera().zoom} ${camera().zoom * outputSize().width} ${camera().zoom * outputSize().height}`}
          >
            <For each={layers()}>
              {(layer) => (
                <g transform={`rotate(${syncRotation() ? globalRotation() : 0})`}>
                  <g>
                    {layer.shape.shapeComponent({})}
                  </g>
                  <Show when={symmetry() !== 'none'}>
                    <g transform={symmetry() === 'horizontal' || symmetry() === 'both' ? 'scale(1, -1)' : ''}>
                      <Show when={symmetry() === 'horizontal' || symmetry() === 'both'}>
                        {layer.shape.shapeComponent({})}
                      </Show>
                    </g>
                    <g transform={symmetry() === 'vertical' || symmetry() === 'both' ? 'scale(-1, 1)' : ''}>
                      <Show when={symmetry() === 'vertical' || symmetry() === 'both'}>
                        {layer.shape.shapeComponent({})}
                      </Show>
                    </g>
                    <g transform={symmetry() === 'both' ? 'scale(-1, -1)' : ''}>
                      <Show when={symmetry() === 'both'}>
                        {layer.shape.shapeComponent({})}
                      </Show>
                    </g>
                    <Show when={symmetry() === 'radial-4'}>
                      <g transform="rotate(90)">{layer.shape.shapeComponent({})}</g>
                      <g transform="rotate(180)">{layer.shape.shapeComponent({})}</g>
                      <g transform="rotate(270)">{layer.shape.shapeComponent({})}</g>
                    </Show>
                  </Show>
                </g>
              )}
            </For>
          </svg>
        <svg
          data-layer-name="grid"
          width={outputSize().width}
          height={outputSize().height}
          style={{ display: showGrid() ? 'block' : 'none' }}
          viewBox={`${camera().position.x % (outputSize().width / ((outputSize().width * camera().zoom) / scale()))} ${camera().position.y % (outputSize().height / ((outputSize().height * camera().zoom) / scale()))} ${outputSize().width} ${outputSize().height}`}
        >
          <For each={Array.from({ length: numVerticalGridLines() })}>
            {(_, i) => (
              <line
                class="grid-line"
                x1={(i() / camera().zoom) * scale()}
                y1={-scale() / camera().zoom}
                x2={(i() / camera().zoom) * scale()}
                y2={outputSize().height + scale() / camera().zoom}
              />
            )}
          </For>
          <For each={Array.from({ length: numHorizontalGridLines() })}>
            {(_, i) => (
              <line
                class="grid-line"
                x1={-scale() / camera().zoom}
                y1={(i() / camera().zoom) * scale()}
                x2={outputSize().width + scale() / camera().zoom}
                y2={(i() / camera().zoom) * scale()}
              />
            )}
          </For>
        </svg>
        <div id="zoom-controls">
          <button
            aria-label="Zoom in"
            disabled={camera().zoom === MAX_ZOOM}
            onClick={() => changeZoom(0.8)}
          >
            +
          </button>
          <button
            aria-label="Zoom out"
            disabled={camera().zoom === MIN_ZOOM}
            onClick={() => changeZoom(1.2)}
          >
            −
          </button>
        </div>
        <Show when={pointer().cell !== null}>
          <span id="pointer-coords">
            ({pointer().cell!.x}, {pointer().cell!.y})
          </span>
        </Show>
        <span id="cell-count" style={{ opacity: isCountingCells() ? 0.2 : 1 }}>
          {cellCount()} cell{cellCount() === 1 ? '' : 's'}
        </span>
        <span id="scale" style={{ opacity: scale() > 1 ? 1 : 0 }}>
          1∶{scale()}
        </span>
      </div>
      <div id="settings-container" aria-label="Shape Settings">
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'margin-bottom': '1rem', padding: '1rem', border: '1px solid #ccc', 'border-radius': '8px' }}>
          <h3 style={{ margin: 0 }}>Global Settings</h3>
          <Switch label="Show Grid" currentVal={showGrid} updateVal={setShowGrid} />
          <Select
            label="Symmetry"
            selectedOption={symmetry}
            updateSelectedOption={setSymmetry}
            options={['none', 'horizontal', 'vertical', 'both', 'radial-4']}
            extractOptionValue={(s) => s}
            extractOptionLabel={(s) => s.charAt(0).toUpperCase() + s.slice(1)}
          />
          <Switch label="Sync Rotation" currentVal={syncRotation} updateVal={setSyncRotation} />
          <Show when={syncRotation()}>
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
              <label>Global Rotation: {globalRotation()}°</label>
              <input 
                type="range" min="0" max="360" 
                value={globalRotation()} 
                onInput={(e) => setGlobalRotation(parseInt(e.currentTarget.value))} 
              />
            </div>
          </Show>
        </div>

        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'margin-bottom': '1rem' }}>
          <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }}>
            <h3 style={{ margin: 0 }}>Layers</h3>
            <button onClick={() => setLayers([...layers(), { id: Date.now(), shape: shapes[0] }])}>+ Add Layer</button>
          </div>
          <For each={layers()}>
            {(layer, index) => (
              <div style={{ padding: '0.5rem', border: '1px solid #eee', 'border-radius': '4px' }}>
                <div style={{ display: 'flex', 'justify-content': 'space-between', 'margin-bottom': '0.5rem' }}>
                  <span>Layer {index() + 1}</span>
                  <Show when={layers().length > 1}>
                    <button style={{ color: 'red' }} onClick={() => setLayers(layers().filter(l => l.id !== layer.id))}>Remove</button>
                  </Show>
                </div>
                <Select
                  label="Shape"
                  selectedOption={() => layer.shape}
                  updateSelectedOption={(newShape) => {
                    const newLayers = [...layers()];
                    newLayers[index()] = { ...layer, shape: newShape };
                    setLayers(newLayers);
                    if (index() === 0) setSelectedShape(newShape); // Backward compat for some logic
                  }}
                  options={shapes.sort((a, b) => a.name.localeCompare(b.name))}
                  extractOptionValue={(shape) => shape.name}
                  extractOptionLabel={(shape) => shape.name}
                />
                {layer.shape.settingsComponent({})}
              </div>
            )}
          </For>
        </div>
        <div class="button-group">
          <span aria-hidden="true">Download</span>
          <button onClick={downloadSVG} aria-label="Download as SVG">
            SVG
          </button>
          <button onClick={downloadPNG} aria-label="Download as PNG">
            PNG
          </button>
          <button onClick={downloadPBM} aria-label="Download as PBM">
            PBM
          </button>
        </div>
        <a
          aria-label="View GitHub repository"
          id="repo-link"
          href="https://github.com/noquinn/pixel-shape-generator"
          target="_blank"
        >
          Repository
        </a>
      </div>
    </>
  );
}

export { outputContainer, outputSize, setOutputSize };

export default App;
