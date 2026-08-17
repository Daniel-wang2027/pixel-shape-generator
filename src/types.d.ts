import type { Component } from 'solid-js';

type Position = { x: number; y: number };

type Point = { x: number; y: number };

/**
 * A shape instance with its own isolated state.
 * Created by calling ShapeFactory.createInstance().
 */
type ShapeInstance = {
  shapeComponent: Component<{ masterRotation?: number }>;
  settingsComponent: Component;
};

/**
 * A shape factory that can create independent instances,
 * each with their own signal state. This fixes the module-level
 * singleton state sharing bug where multiple layers of the same
 * shape type would share the same signals.
 */
type ShapeFactory = {
  name: string;
  createInstance: () => ShapeInstance;
};

/**
 * @deprecated Use ShapeFactory + ShapeInstance instead.
 * Kept temporarily for backwards compatibility during migration.
 */
type Shape = {
  name: string;
  shapeComponent: Component<{ masterRotation?: number }>;
  settingsComponent: Component;
};
