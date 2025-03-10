/**
 * This helper adds support for knowing when a component has been loaded.
 *
 * Related issue: https://github.com/Esri/calcite-components/issues/5369
 * Could be related to Stencil.js issue: https://github.com/ionic-team/stencil/issues/3580
 *
 * Implementing
 *
 * ```
 * export class MyComponent implements LoadableComponent { }
 * ```
 *
 * ```
 *  //--------------------------------------------------------------------------
 *  //
 *  //  Lifecycle
 *  //
 *  //--------------------------------------------------------------------------
 *
 *  componentWillLoad(): void {
 *    setUpLoadableComponent(this);
 *  }
 *
 *  componentDidLoad(): void {
 *    setComponentLoaded(this);
 *  }
 *
 *  // --------------------------------------------------------------------------
 *  //
 *  //  Methods
 *  //
 *  // --------------------------------------------------------------------------
 *
 *  async setFocus(): Promise<void> {
 *    await componentLoaded(this);
 *  }
 * ```
 */
export interface LoadableComponent {
  /**
   * Stencil lifecycle method.
   * https://stenciljs.com/docs/component-lifecycle#componentwillload
   *
   * Called once just after the component is first connected to the DOM. Since this method is only called once, it's a good place to load data asynchronously and to setup the state without triggering extra re-renders.
   */
  componentWillLoad: () => Promise<void> | void;

  /**
   * Stencil lifecycle method.
   * https://stenciljs.com/docs/component-lifecycle#componentdidload
   *
   * Called once just after the component is fully loaded and the first render() occurs.
   */
  componentDidLoad: () => Promise<void> | void;
}

const resolveMap = new WeakMap<LoadableComponent, (value: void | PromiseLike<void>) => void>();

const promiseMap = new WeakMap<LoadableComponent, Promise<void>>();

/**
 * This helper util sets up the component for the ability to know when the component has been loaded.
 *
 * This should be used in the `componentWillLoad` lifecycle hook.
 *
 * ```
 * componentWillLoad(): void {
 *   setUpLoadableComponent(this);
 * }
 * ```
 *
 * @param component
 */
export function setUpLoadableComponent(component: LoadableComponent): void {
  promiseMap.set(component, new Promise((resolve) => resolveMap.set(component, resolve)));
}

/**
 * This helper util lets the loadable component know that it is now loaded.
 *
 * This should be used in the `componentDidLoad` lifecycle hook.
 *
 * ```
 * componentDidLoad(): void {
 *   setComponentLoaded(this);
 * }
 * ```
 *
 * @param component
 */
export function setComponentLoaded(component: LoadableComponent): void {
  resolveMap.get(component)();
}

/**
 * This helper util can be used to ensure a component has been loaded (The "componentDidLoad" stencil lifecycle method has been called).
 *
 * Requires "setUpLoadableComponent" and "setComponentLoaded" to be called first.
 *
 * A component developer can await this method before proceeding with any logic that requires a component to be loaded first.
 *
 * ```
 * async setFocus(): Promise<void> {
 *   await componentLoaded(this);
 * }
 * ```
 *
 * @param component
 * @returns Promise<void>
 */
export function componentLoaded(component: LoadableComponent): Promise<void> {
  return promiseMap.get(component);
}
