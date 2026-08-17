import type { JSX, Accessor } from 'solid-js';
import './Switch.css';

const Switch = (props: {
  label: string;
  currentVal: Accessor<boolean>;
  updateVal: (val: boolean) => void;
}) => {
  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (
    event
  ) => {
    props.updateVal(event.currentTarget.checked);
  };
  const id = `${props.label.replace(/\s+/, '-')}-toggle`;
  return (
    <div class="switch-container">
      <input
        id={id}
        class="switch"
        type="checkbox"
        checked={props.currentVal()}
        value={Number(props.currentVal())}
        onInput={handleInput}
      />
      <label for={id}>{props.label}</label>
    </div>
  );
};

export default Switch;
