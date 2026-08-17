import { createUniqueId } from 'solid-js';
import type { JSX, Accessor } from 'solid-js';
import './Slider.css';

const Slider = ({
  label,
  min,
  max,
  step = 1,
  currentVal,
  updateVal,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  currentVal: Accessor<number>;
  updateVal: (value: number) => void;
}) => {
  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (
    event
  ) => {
    const {
      valueAsNumber,
      validity: { valid },
    } = event.currentTarget;
    if (!valid) return;

    updateVal(valueAsNumber);
  };

  const handleBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = (
    event
  ) => {
    const { rangeOverflow, rangeUnderflow } = event.currentTarget.validity;
    if (rangeUnderflow) updateVal(min);
    if (rangeOverflow) updateVal(max);
    event.currentTarget.value = String(currentVal());
  };

  const uid = createUniqueId();
  const id = `${label.replace(/\s+/, '-')}-${uid}`;
  const percent = () => ((currentVal() - min) / (max - min)) * 100;
  return (
    <div class="slider-container">
      <div>
        <label for={`${id}-number`} id={`${id}-label`}>
          {label}
        </label>
        <input
          type="number"
          id={`${id}-number`}
          inputmode={step % 1 === 0 ? 'numeric' : 'decimal'}
          step={step}
          min={min}
          max={max}
          value={currentVal()}
          onInput={handleInput}
          onBlur={handleBlur}
          aria-labelledby={`${id}-label`}
          required
        />
      </div>
      <div>
        <input
          style={{
            background: `linear-gradient(to right, var(--cell-color) ${percent()}%, var(--ui-void-color) ${percent()}%)`,
          }}
          type="range"
          id={`${id}-range`}
          aria-labelledby={`${id}-label`}
          class="slider"
          min={min}
          max={max}
          step={step}
          value={currentVal()}
          onInput={handleInput}
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

export default Slider;
