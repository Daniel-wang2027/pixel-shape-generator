import {
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
  onMount,
  For,
  Index,
  Show,
} from 'solid-js';

import type { ShapeFactory, ShapeInstance } from './types';

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

import { downloadSVG, downloadPNG, downloadPBM, copySVG, copyPNG } from './download.ts';
import { CellTransformProvider } from './geometry/helpers/Cell.tsx';
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
import Slider from './ui-components/Slider.tsx';
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

type Layer = {
  id: number;
  factory: ShapeFactory;
  instance: ShapeInstance;
  offset: { x: number; y: number };
  visible: boolean;
  horizontalSymmetry: boolean;
  verticalSymmetry: boolean;
  radialSymmetryCount: number;
};

type ThemeOption = {
  id: string;
  name: string;
};

const THEMES: ThemeOption[] = [
  { id: 'ember', name: 'Ember Gold (Dark)' },
  { id: 'ink', name: 'Ink (Light Parchment)' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon' },
  { id: 'space', name: 'Space Void' },
  { id: 'terminal', name: 'Terminal Matrix' },
  { id: 'blueprint', name: 'Blueprint Navy' },
  { id: 'frutiger', name: 'Frutiger Aero' },
  { id: 'legacy', name: 'Legacy Classic' },
];

let outputContainer: HTMLDivElement | undefined;
const [outputSize, setOutputSize] = createSignal({ width: 0, height: 0 });

function App() {
  const shapes: ShapeFactory[] = [
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

  const sortedShapes = shapes.sort((a, b) => a.name.localeCompare(b.name));

  // State
  const [activeTab, setActiveTab] = createSignal<'layers' | 'symmetry'>('layers');
  const [currentTheme, setCurrentTheme] = createSignal<string>(
    localStorage.getItem('psg_theme') || 'ember'
  );
  const [toastMessage, setToastMessage] = createSignal<string | null>(null);

  const [cellCount, setCellCount] = createSignal(0);
  const [isCountingCells, setIsCountingCells] = createSignal(false);
  const [showGrid, setShowGrid] = createSignal(true);
  const [layers, setLayers] = createSignal<Layer[]>([
    { 
      id: 0, 
      factory: sortedShapes[0], 
      instance: sortedShapes[0].createInstance(), 
      offset: { x: 0, y: 0 }, 
      visible: true,
      horizontalSymmetry: false,
      verticalSymmetry: false,
      radialSymmetryCount: 1,
    },
  ]);
  const [syncRotation, setSyncRotation] = createSignal(true);
  const [globalRotation, setGlobalRotation] = createSignal(0);

  // Sync theme to root dataset & storage
  createEffect(() => {
    const theme = currentTheme();
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('psg_theme', theme);
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopySVG = async () => {
    await copySVG();
    showToast('SVG copied to clipboard');
  };

  const handleCopyPNG = async () => {
    await copyPNG();
    showToast('PNG copied to clipboard');
  };

  type CopyTransform = {
    angle: number;
    mirrorX?: boolean;
    mirrorY?: boolean;
  };

  const symmetryCopies = (layer: Layer) => {
    const copies: CopyTransform[] = [{ angle: 0 }];
    if (layer.horizontalSymmetry) copies.push({ angle: 0, mirrorY: true });
    if (layer.verticalSymmetry) copies.push({ angle: 0, mirrorX: true });
    if (layer.horizontalSymmetry && layer.verticalSymmetry) {
      copies.push({ angle: 0, mirrorX: true, mirrorY: true });
    }
    return copies;
  };

  const radialCopies = (layer: Layer) =>
    Array.from({ length: layer.radialSymmetryCount }, (_, index) => index);

  const cellTransform = (
    offset: { x: number; y: number },
    copy: CopyTransform
  ) => {
    const angleRad = (copy.angle * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    const rotatedOffsetX = offset.x * cosA - offset.y * sinA;
    const rotatedOffsetY = offset.x * sinA + offset.y * cosA;

    return ({ x, y }: { x: number; y: number }) => {
      let nextX = x + rotatedOffsetX;
      let nextY = y + rotatedOffsetY;

      if (copy.mirrorX) nextX = -nextX;
      if (copy.mirrorY) nextY = -nextY;

      return {
        x: Math.round(nextX + Number.EPSILON),
        y: Math.round(nextY + Number.EPSILON),
      };
    };
  };

  // Debounced cell counting on shape renders
  onMount(() => {
    const getNumberUniqueCells = (): number => {
      const cells = document.getElementsByClassName('cell');
      const uniqueCells = new Set<string>();
      for (const cell of cells) {
        const x = Math.round(parseFloat(cell.getAttribute('x') || '0'));
        const y = Math.round(parseFloat(cell.getAttribute('y') || '0'));
        uniqueCells.add(`${x},${y}`);
      }
      return uniqueCells.size;
    };

    const updateCellCount = debounce(() => {
      setCellCount(getNumberUniqueCells());
      setIsCountingCells(false);
    }, 150);

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
        subtree: true,
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
  );
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

  // Keyboard shortcuts
  onMount(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      )
        return;

      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          changeZoom(0.8);
          break;
        case '-':
        case '_':
          event.preventDefault();
          changeZoom(1.2);
          break;
        case '0':
          event.preventDefault();
          centerCamera();
          break;
        case 'g':
        case 'G':
          event.preventDefault();
          setShowGrid(!showGrid());
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
  });

  return (
    <>
      {/* ── Studio Header ── */}
      <header class="studio-header">
        <div class="header-brand">
          <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <span class="brand-title">Pixel Shape Generator</span>
          <div class="cell-badge" style={{ opacity: isCountingCells() ? 0.4 : 1 }}>
            <span class="cell-badge-dot" />
            {cellCount()} Cells
          </div>
        </div>

        <div class="header-actions">
          {/* Theme Switcher */}
          <div style={{ width: '160px' }}>
            <Select
              label="Theme"
              selectedOption={() =>
                THEMES.find((t) => t.id === currentTheme()) || THEMES[0]
              }
              updateSelectedOption={(opt: ThemeOption) => setCurrentTheme(opt.id)}
              options={THEMES}
              extractOptionValue={(opt: ThemeOption) => opt.id}
              extractOptionLabel={(opt: ThemeOption) => opt.name}
            />
          </div>
        </div>
      </header>

      {/* ── Studio Workspace ── */}
      <div class="studio-workspace">
        {/* Canvas Area */}
        <div
          id="output-container"
          ref={outputContainer}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onScroll={() => {}}
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
            <Index each={layers()}>
              {(layer) => (
                <Show when={layer().visible}>
                  <g>
                    {radialCopies(layer()).map((radialIndex) => {
                      const radialAngle =
                        radialIndex * (360 / layer().radialSymmetryCount);
                      return (
                        <For each={symmetryCopies(layer())}>
                          {(symmetryCopy) => (
                            <CellTransformProvider
                              transform={cellTransform(layer().offset, {
                                ...symmetryCopy,
                                angle: radialAngle,
                              })}
                            >
                              {layer().instance.shapeComponent({
                                masterRotation:
                                  (syncRotation() ? globalRotation() : 0) +
                                  radialAngle,
                              })}
                            </CellTransformProvider>
                          )}
                        </For>
                      );
                    })}
                  </g>
                </Show>
              )}
            </Index>
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

          {/* Viewport Floating HUD */}
          <Show when={pointer().cell !== null}>
            <div class="viewport-hud-coords">
              X: {pointer().cell!.x} &nbsp; Y: {pointer().cell!.y}
            </div>
          </Show>
          <div class="viewport-hud-scale" style={{ opacity: scale() > 1 ? 1 : 0.4 }}>
            Zoom Scale: 1∶{scale()}
          </div>

          {/* Floating Camera Controls Dock */}
          <div id="zoom-controls">
            <button
              aria-label="Zoom in"
              title="Zoom In (+)"
              disabled={camera().zoom === MAX_ZOOM}
              onClick={() => changeZoom(0.8)}
            >
              +
            </button>
            <button
              aria-label="Zoom out"
              title="Zoom Out (-)"
              disabled={camera().zoom === MIN_ZOOM}
              onClick={() => changeZoom(1.2)}
            >
              −
            </button>
            <button
              aria-label="Reset camera"
              title="Center & Reset View (0)"
              onClick={() => centerCamera()}
            >
              ⌂
            </button>
            <button
              aria-label="Toggle grid"
              title="Toggle Grid (G)"
              style={{ color: showGrid() ? 'var(--gold)' : 'var(--text-muted)' }}
              onClick={() => setShowGrid(!showGrid())}
            >
              #
            </button>
          </div>
        </div>

        {/* ── Right Settings Deck ── */}
        <aside id="settings-container" aria-label="Studio Controls">
          {/* Deck Tabs */}
          <div class="deck-tabs">
            <button
              class={`deck-tab-btn ${activeTab() === 'layers' ? 'active' : ''}`}
              onClick={() => setActiveTab('layers')}
            >
              Layers ({layers().length})
            </button>
            <button
              class={`deck-tab-btn ${activeTab() === 'symmetry' ? 'active' : ''}`}
              onClick={() => setActiveTab('symmetry')}
            >
              Symmetry & Global
            </button>
          </div>

          {/* Tab 1: Layers */}
          <Show when={activeTab() === 'layers'}>
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.85rem' }}>
              <Index each={layers()}>
                {(layer, index) => (
                  <div class={`layer-card ${!layer().visible ? 'hidden-layer' : ''}`}>
                    <div class="layer-header">
                      <span class="layer-num">
                        Layer {index + 1}: {layer().factory.name}
                      </span>
                      <div class="layer-actions">
                        <button
                          class="btn-icon-sm"
                          title={layer().visible ? 'Hide Layer' : 'Show Layer'}
                          onClick={() => {
                            const newLayers = [...layers()];
                            newLayers[index] = { ...layer(), visible: !layer().visible };
                            setLayers(newLayers);
                          }}
                        >
                          {layer().visible ? '👁' : '👁‍🗨'}
                        </button>
                        <button
                          class="btn-icon-sm"
                          title="Duplicate Layer"
                          onClick={() => {
                            const newInstance = layer().factory.createInstance();
                            const newLayer: Layer = {
                              id: Date.now(),
                              factory: layer().factory,
                              instance: newInstance,
                              offset: { ...layer().offset },
                              visible: true,
                              horizontalSymmetry: layer().horizontalSymmetry,
                              verticalSymmetry: layer().verticalSymmetry,
                              radialSymmetryCount: layer().radialSymmetryCount,
                            };
                            const newLayers = [...layers()];
                            newLayers.splice(index + 1, 0, newLayer);
                            setLayers(newLayers);
                          }}
                        >
                          ⧉
                        </button>
                        <Show when={layers().length > 1}>
                          <button
                            class="btn-icon-sm danger"
                            title="Delete Layer"
                            onClick={() =>
                              setLayers(layers().filter((l) => l.id !== layer().id))
                            }
                          >
                            ✕
                          </button>
                        </Show>
                      </div>
                    </div>

                    <Select
                      label="Shape Type"
                      selectedOption={() => layer().factory}
                      updateSelectedOption={(newFactory: ShapeFactory) => {
                        const newLayers = [...layers()];
                        newLayers[index] = {
                          ...layer(),
                          factory: newFactory,
                          instance: newFactory.createInstance(),
                        };
                        setLayers(newLayers);
                      }}
                      options={sortedShapes}
                      extractOptionValue={(factory: ShapeFactory) => factory.name}
                      extractOptionLabel={(factory: ShapeFactory) => factory.name}
                    />

                    {layer().instance.settingsComponent({})}

                    <Slider
                      label="Offset X"
                      min={-250}
                      max={250}
                      currentVal={() => layer().offset.x}
                      updateVal={(val: number) => {
                        const newLayers = [...layers()];
                        newLayers[index] = {
                          ...layer(),
                          offset: { ...layer().offset, x: val },
                        };
                        setLayers(newLayers);
                      }}
                    />
                    <Slider
                      label="Offset Y"
                      min={-250}
                      max={250}
                      currentVal={() => layer().offset.y}
                      updateVal={(val: number) => {
                        const newLayers = [...layers()];
                        newLayers[index] = {
                          ...layer(),
                          offset: { ...layer().offset, y: val },
                        };
                        setLayers(newLayers);
                      }}
                    />

                    <div style={{ padding: '0.5rem 0', 'border-top': '1px solid var(--border-subtle)', 'margin-top': '0.25rem' }}>
                      <span class="card-title" style={{ display: 'block', 'margin-bottom': '0.75rem' }}>Layer Symmetry</span>
                      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
                        <Switch
                          label="Horizontal Symmetry"
                          currentVal={() => layer().horizontalSymmetry}
                          updateVal={(val: boolean) => {
                            const newLayers = [...layers()];
                            newLayers[index] = { ...layer(), horizontalSymmetry: val };
                            setLayers(newLayers);
                          }}
                        />
                        <Switch
                          label="Vertical Symmetry"
                          currentVal={() => layer().verticalSymmetry}
                          updateVal={(val: boolean) => {
                            const newLayers = [...layers()];
                            newLayers[index] = { ...layer(), verticalSymmetry: val };
                            setLayers(newLayers);
                          }}
                        />
                        <Slider
                          label="Radial Count"
                          min={1}
                          max={32}
                          currentVal={() => layer().radialSymmetryCount}
                          updateVal={(val: number) => {
                            const newLayers = [...layers()];
                            newLayers[index] = { ...layer(), radialSymmetryCount: val };
                            setLayers(newLayers);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Index>

              <button
                class="btn-primary"
                onClick={() =>
                  setLayers([
                    ...layers(),
                    {
                      id: Date.now(),
                      factory: sortedShapes[0],
                      instance: sortedShapes[0].createInstance(),
                      offset: { x: 0, y: 0 },
                      visible: true,
                      horizontalSymmetry: false,
                      verticalSymmetry: false,
                      radialSymmetryCount: 1,
                    },
                  ])
                }
              >
                + Add New Layer
              </button>
            </div>
          </Show>

          {/* Tab 2: Global & Export */}
          <Show when={activeTab() === 'symmetry'}>
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.85rem' }}>
              <div class="studio-card">
                <div class="card-header">
                  <span class="card-title">Viewport & Guides</span>
                </div>
                <Switch
                  label="Show Grid Lines"
                  currentVal={showGrid}
                  updateVal={setShowGrid}
                />
              </div>

              <div class="studio-card">
                <div class="card-header">
                  <span class="card-title">Global Rotation</span>
                </div>
                <Switch
                  label="Sync Layer Rotation"
                  currentVal={syncRotation}
                  updateVal={setSyncRotation}
                />
                <Slider
                  label="Master Rotation"
                  min={0}
                  max={360}
                  step={1}
                  currentVal={globalRotation}
                  updateVal={(val: number) => setGlobalRotation(val % 360)}
                />
              </div>
            </div>
          </Show>

          {/* Export & Clipboard Hub */}
          <div class="studio-card" style={{ 'margin-top': 'auto' }}>
            <div class="card-header">
              <span class="card-title">Export Studio</span>
            </div>

            <div class="hub-group">
              <span class="hub-label">Download File</span>
              <div class="button-group">
                <span aria-hidden="true">Save</span>
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
            </div>

            <div class="hub-group">
              <span class="hub-label">Quick Clipboard</span>
              <div class="button-group">
                <span aria-hidden="true">Copy</span>
                <button onClick={handleCopySVG} aria-label="Copy SVG to clipboard">
                  SVG
                </button>
                <button onClick={handleCopyPNG} aria-label="Copy PNG to clipboard">
                  PNG
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Toast Feedback */}
      <Show when={toastMessage() !== null}>
        <div class="toast-notice">
          <span>✓</span> {toastMessage()}
        </div>
      </Show>
    </>
  );
}

export { outputContainer, outputSize, setOutputSize };
export default App;
