import { createSignal } from 'solid-js';

export const [globalRotation, setGlobalRotation] = createSignal(0);
export const [syncRotation, setSyncRotation] = createSignal(true);