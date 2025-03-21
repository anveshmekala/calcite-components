import {
  arrow,
  autoPlacement,
  autoUpdate,
  computePosition,
  flip,
  hide,
  Middleware,
  offset,
  Placement,
  platform,
  shift,
  Strategy,
  VirtualElement
} from "@floating-ui/dom";
import { closestElementCrossShadowBoundary, getElementDir } from "./dom";
import { debounce } from "lodash-es";
import { Build } from "@stencil/core";
import { config } from "./config";

const floatingUIBrowserCheck = patchFloatingUiForNonChromiumBrowsers();

async function patchFloatingUiForNonChromiumBrowsers(): Promise<void> {
  interface NavigatorUAData {
    brands: Array<{ brand: string; version: string }>;
    mobile: boolean;
    platform: string;
  }

  function getUAString(): string {
    const uaData = (navigator as any).userAgentData as NavigatorUAData | undefined;

    if (uaData?.brands) {
      return uaData.brands.map((item) => `${item.brand}/${item.version}`).join(" ");
    }

    return navigator.userAgent;
  }

  if (
    Build.isBrowser &&
    config.floatingUINonChromiumPositioningFix &&
    // ⚠️ browser-sniffing is not a best practice and should be avoided ⚠️
    /firefox|safari/i.test(getUAString())
  ) {
    const { getClippingRect, getElementRects, getOffsetParent } = await import(
      "./floating-ui/nonChromiumPlatformUtils"
    );

    platform.getClippingRect = getClippingRect;
    platform.getOffsetParent = getOffsetParent;
    platform.getElementRects = getElementRects as any;
  }
}

/**
 * Exported for testing purposes only
 */
export const placementDataAttribute = "data-placement";

/**
 * Exported for testing purposes only
 */
export const repositionDebounceTimeout = 100;

export type ReferenceElement = VirtualElement | Element;

type UIType = "menu" | "tooltip" | "popover";
export type OverlayPositioning = Strategy;

/**
 * Placements that change based on element direction.
 *
 * These variation placements will automatically flip "left"/"right" depending on LTR/RTL direction.
 *
 * Floating-ui has no plans to offer this functionality out of the box at this time.
 *
 * see: https://github.com/floating-ui/floating-ui/issues/1563 and https://github.com/floating-ui/floating-ui/discussions/1549
 */
type VariationPlacement = "leading-start" | "leading" | "leading-end" | "trailing-end" | "trailing" | "trailing-start";

type AutoPlacement = "auto" | "auto-start" | "auto-end";

export type LogicalPlacement = AutoPlacement | Placement | VariationPlacement;
export type EffectivePlacement = Placement;

export const placements: LogicalPlacement[] = [
  "auto",
  "auto-start",
  "auto-end",
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "right",
  "right-start",
  "right-end",
  "left",
  "left-start",
  "left-end",
  "leading-start",
  "leading",
  "leading-end",
  "trailing-end",
  "trailing",
  "trailing-start"
];

export const effectivePlacements: EffectivePlacement[] = [
  "top",
  "bottom",
  "right",
  "left",
  "top-start",
  "top-end",
  "bottom-start",
  "bottom-end",
  "right-start",
  "right-end",
  "left-start",
  "left-end"
];

export const menuPlacements: MenuPlacement[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"];

export const menuEffectivePlacements: EffectivePlacement[] = [
  "top-start",
  "top",
  "top-end",
  "bottom-start",
  "bottom",
  "bottom-end"
];

export const flipPlacements: EffectivePlacement[] = [
  "top",
  "bottom",
  "right",
  "left",
  "top-start",
  "top-end",
  "bottom-start",
  "bottom-end",
  "right-start",
  "right-end",
  "left-start",
  "left-end"
];

export type MenuPlacement = Extract<
  LogicalPlacement,
  "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"
>;

export const defaultMenuPlacement: MenuPlacement = "bottom-start";

export interface FloatingUIComponent {
  /**
   * Whether the component is opened.
   */
  open: boolean;

  /**
   * Describes the type of positioning to use for the overlaid content. If your element is in a fixed container, use the 'fixed' value.
   */
  overlayPositioning: OverlayPositioning;

  /**
   * Determines where the component will be positioned relative to the referenceElement.
   *
   * Possible values: "auto", "auto-start", "auto-end", "top", "right", "bottom", "left", "top-start", "top-end", "right-start", "right-end", "bottom-start", "bottom-end", "left-start", "left-end", "leading-start", "leading", "leading-end", "trailing-end", "trailing",  or "trailing-start".
   *
   */
  placement: LogicalPlacement;

  /**
   * Updates the position of the component.
   *
   * @param delayed – (internal) when true, it will reposition the component after a delay. the default is false. This is useful for components that have multiple watched properties that schedule repositioning.
   */
  reposition(delayed?: boolean): Promise<void>;
}

export const FloatingCSS = {
  animation: "calcite-floating-ui-anim",
  animationActive: "calcite-floating-ui-anim--active"
};

function getMiddleware({
  placement,
  disableFlip,
  flipPlacements,
  offsetDistance,
  offsetSkidding,
  arrowEl,
  type
}: {
  placement: LogicalPlacement;
  disableFlip?: boolean;
  flipPlacements?: EffectivePlacement[];
  offsetDistance?: number;
  offsetSkidding?: number;
  arrowEl?: HTMLElement;
  type: UIType;
}): Middleware[] {
  const defaultMiddleware = [shift(), hide()];

  if (type === "menu") {
    return [
      ...defaultMiddleware,
      flip({
        fallbackPlacements: flipPlacements || ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"]
      })
    ];
  }

  if (type === "popover" || type === "tooltip") {
    const middleware: Middleware[] = [
      ...defaultMiddleware,
      offset({
        mainAxis: typeof offsetDistance === "number" ? offsetDistance : 0,
        crossAxis: typeof offsetSkidding === "number" ? offsetSkidding : 0
      })
    ];

    if (placement === "auto" || placement === "auto-start" || placement === "auto-end") {
      middleware.push(
        autoPlacement({ alignment: placement === "auto-start" ? "start" : placement === "auto-end" ? "end" : null })
      );
    } else if (!disableFlip) {
      middleware.push(flip(flipPlacements ? { fallbackPlacements: flipPlacements } : {}));
    }

    if (arrowEl) {
      middleware.push(
        arrow({
          element: arrowEl
        })
      );
    }

    return middleware;
  }

  return [];
}

export function filterComputedPlacements(placements: string[], el: HTMLElement): EffectivePlacement[] {
  const filteredPlacements = placements.filter((placement: EffectivePlacement) =>
    effectivePlacements.includes(placement)
  ) as EffectivePlacement[];

  if (filteredPlacements.length !== placements.length) {
    console.warn(
      `${el.tagName}: Invalid value found in: flipPlacements. Try any of these: ${effectivePlacements
        .map((placement) => `"${placement}"`)
        .join(", ")
        .trim()}`,
      { el }
    );
  }

  return filteredPlacements;
}

export function getEffectivePlacement(floatingEl: HTMLElement, placement: LogicalPlacement): EffectivePlacement {
  const placements = ["left", "right"];

  if (getElementDir(floatingEl) === "rtl") {
    placements.reverse();
  }

  return placement.replace(/leading/gi, placements[0]).replace(/trailing/gi, placements[1]) as EffectivePlacement;
}

/**
 * Convenience function to manage `reposition` calls for FloatingUIComponents that use `positionFloatingUI.
 *
 * Note: this is not needed for components that use `calcite-popover`.
 *
 * @param component
 * @param options
 * @param options.referenceEl
 * @param options.floatingEl
 * @param options.overlayPositioning
 * @param options.placement
 * @param options.disableFlip
 * @param options.flipPlacements
 * @param options.offsetDistance
 * @param options.offsetSkidding
 * @param options.arrowEl
 * @param options.type
 * @param delayed
 */
export async function reposition(
  component: FloatingUIComponent,
  options: Parameters<typeof positionFloatingUI>[0],
  delayed = false
): Promise<void> {
  if (!component.open) {
    return;
  }

  return delayed ? debouncedReposition(options) : positionFloatingUI(options);
}

const debouncedReposition = debounce(positionFloatingUI, repositionDebounceTimeout, {
  leading: true,
  maxWait: repositionDebounceTimeout
});

/**
 * Positions the floating element relative to the reference element.
 *
 * **Note:** exported for testing purposes only
 *
 * @param root0
 * @param root0.referenceEl
 * @param root0.floatingEl
 * @param root0.overlayPositioning
 * @param root0.placement
 * @param root0.disableFlip
 * @param root0.flipPlacements
 * @param root0.offsetDistance
 * @param root0.offsetSkidding
 * @param root0.arrowEl
 * @param root0.type
 * @param root0.includeArrow
 */
export async function positionFloatingUI({
  referenceEl,
  floatingEl,
  overlayPositioning = "absolute",
  placement,
  disableFlip,
  flipPlacements,
  offsetDistance,
  offsetSkidding,
  includeArrow = false,
  arrowEl,
  type
}: {
  referenceEl: ReferenceElement;
  floatingEl: HTMLElement;
  overlayPositioning: Strategy;
  placement: LogicalPlacement;
  disableFlip?: boolean;
  flipPlacements?: EffectivePlacement[];

  offsetDistance?: number;
  offsetSkidding?: number;
  arrowEl?: HTMLElement;
  includeArrow?: boolean;
  type: UIType;
}): Promise<void> {
  if (!referenceEl || !floatingEl || (includeArrow && !arrowEl)) {
    return null;
  }

  await floatingUIBrowserCheck;

  const {
    x,
    y,
    placement: effectivePlacement,
    strategy: position,
    middlewareData
  } = await computePosition(referenceEl, floatingEl, {
    strategy: overlayPositioning,
    placement:
      placement === "auto" || placement === "auto-start" || placement === "auto-end"
        ? undefined
        : getEffectivePlacement(floatingEl, placement),
    middleware: getMiddleware({
      placement,
      disableFlip,
      flipPlacements,
      offsetDistance,
      offsetSkidding,
      arrowEl,
      type
    })
  });

  if (middlewareData?.arrow) {
    const { x: arrowX, y: arrowY } = middlewareData.arrow;

    Object.assign(arrowEl.style, {
      left: arrowX != null ? `${arrowX}px` : "",
      top: arrowY != null ? `${arrowY}px` : ""
    });
  }

  const referenceHidden = middlewareData?.hide?.referenceHidden;
  const visibility = referenceHidden ? "hidden" : null;
  const pointerEvents = visibility ? "none" : null;

  floatingEl.setAttribute(placementDataAttribute, effectivePlacement);

  const transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;

  Object.assign(floatingEl.style, {
    visibility,
    pointerEvents,
    position,
    top: "0",
    left: "0",
    transform
  });
}

/**
 * Exported for testing purposes only
 *
 * @internal
 */
export const cleanupMap = new WeakMap<FloatingUIComponent, () => void>();

/**
 * Helper to set up floating element interactions on connectedCallback.
 *
 * @param component
 * @param referenceEl
 * @param floatingEl
 */
export function connectFloatingUI(
  component: FloatingUIComponent,
  referenceEl: ReferenceElement,
  floatingEl: HTMLElement
): void {
  if (!floatingEl || !referenceEl) {
    return;
  }

  disconnectFloatingUI(component, referenceEl, floatingEl);

  const position = component.overlayPositioning;

  // ensure position matches for initial positioning
  Object.assign(floatingEl.style, {
    visibility: "hidden",
    pointerEvents: "none",
    position
  });

  if (position === "absolute") {
    resetPosition(floatingEl);
  }

  const runAutoUpdate = Build.isBrowser
    ? autoUpdate
    : (_refEl: HTMLElement, _floatingEl: HTMLElement, updateCallback: Function): (() => void) => {
        updateCallback();
        return () => {
          /* noop */
        };
      };

  cleanupMap.set(
    component,
    runAutoUpdate(referenceEl, floatingEl, () => component.reposition())
  );
}

/**
 * Helper to tear down floating element interactions on disconnectedCallback.
 *
 * @param component
 * @param referenceEl
 * @param floatingEl
 */
export function disconnectFloatingUI(
  component: FloatingUIComponent,
  referenceEl: ReferenceElement,
  floatingEl: HTMLElement
): void {
  if (!floatingEl || !referenceEl) {
    return;
  }

  getTransitionTarget(floatingEl).removeEventListener("transitionend", handleTransitionElTransitionEnd);

  const cleanup = cleanupMap.get(component);

  if (cleanup) {
    cleanup();
  }

  cleanupMap.delete(component);
}

const visiblePointerSize = 4;

/**
 * Default offset the position of the floating element away from the reference element.
 *
 * @default 6
 */
export const defaultOffsetDistance = Math.ceil(Math.hypot(visiblePointerSize, visiblePointerSize));

/**
 * This utils applies floating element styles to avoid affecting layout when closed.
 *
 * This should be called when the closing transition will start.
 *
 * @param floatingEl
 */
export function updateAfterClose(floatingEl: HTMLElement): void {
  if (!floatingEl || floatingEl.style.position !== "absolute") {
    return;
  }

  getTransitionTarget(floatingEl).addEventListener("transitionend", handleTransitionElTransitionEnd);
}

function getTransitionTarget(floatingEl: HTMLElement): ShadowRoot | HTMLElement {
  // assumes floatingEl w/ shadowRoot is a FloatingUIComponent
  return floatingEl.shadowRoot || floatingEl;
}

function handleTransitionElTransitionEnd(event: TransitionEvent): void {
  const floatingTransitionEl = event.target as HTMLElement;

  if (
    // using any prop from floating-ui transition
    event.propertyName === "opacity" &&
    floatingTransitionEl.classList.contains(FloatingCSS.animation)
  ) {
    const floatingEl = getFloatingElFromTransitionTarget(floatingTransitionEl);
    resetPosition(floatingEl);
    getTransitionTarget(floatingEl).removeEventListener("transitionend", handleTransitionElTransitionEnd);
  }
}

function resetPosition(floatingEl: HTMLElement): void {
  // resets position to better match https://floating-ui.com/docs/computePosition#initial-layout
  floatingEl.style.transform = "";
  floatingEl.style.top = "0";
  floatingEl.style.left = "0";
}

function getFloatingElFromTransitionTarget(floatingTransitionEl: HTMLElement): HTMLElement {
  return closestElementCrossShadowBoundary(floatingTransitionEl, `[${placementDataAttribute}]`);
}
