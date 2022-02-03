import { Component, h, Listen, Prop, VNode, Element } from "@stencil/core";
import { TOOLTIP_REFERENCE, TOOLTIP_DELAY_MS } from "../tooltip/resources";
import { queryElementRoots } from "../../utils/dom";

/**
 * @slot - A slot for adding elements that reference a 'calcite-tooltip' by the 'selector' property.
 */
@Component({
  tag: "calcite-tooltip-manager",
  styleUrl: "tooltip-manager.scss",
  shadow: true
})
export class TooltipManager {
  // --------------------------------------------------------------------------
  //
  //  Variables
  //
  // --------------------------------------------------------------------------

  @Element() el: HTMLCalciteTooltipManagerElement;

  tooltipEl: HTMLCalciteTooltipElement;

  hoverTimeouts: WeakMap<HTMLCalciteTooltipElement, number> = new WeakMap();

  clickedTooltip: HTMLCalciteTooltipElement;

  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  /**
   * CSS Selector to match reference elements for tooltips. Reference elements will be identified by this selector in order to open their associated tooltip.
   * @default `[data-calcite-tooltip-reference]`
   */
  @Prop() selector = `[${TOOLTIP_REFERENCE}]`;

  // --------------------------------------------------------------------------
  //
  //  Private Methods
  //
  // --------------------------------------------------------------------------

  queryTooltip = (composedPath: EventTarget[]): HTMLCalciteTooltipElement => {
    const { el } = this;

    if (!composedPath.includes(el)) {
      return null;
    }

    const referenceElement = (composedPath as HTMLElement[]).find((pathEl) =>
      pathEl?.hasAttribute?.(TOOLTIP_REFERENCE)
    );

    if (!referenceElement) {
      return null;
    }

    const id = referenceElement.getAttribute(TOOLTIP_REFERENCE);

    return queryElementRoots(el, { id }) as HTMLCalciteTooltipElement;
  };

  clearHoverTimeout = (tooltip: HTMLCalciteTooltipElement): void => {
    const { hoverTimeouts } = this;

    if (hoverTimeouts.has(tooltip)) {
      window.clearTimeout(hoverTimeouts.get(tooltip));
      hoverTimeouts.delete(tooltip);
    }
  };

  closeExistingTooltip = (): void => {
    const { tooltipEl } = this;

    if (tooltipEl) {
      this.toggleTooltip(tooltipEl, false);
    }
  };

  focusTooltip = ({
    tooltip,
    value
  }: {
    tooltip: HTMLCalciteTooltipElement;
    value: boolean;
  }): void => {
    this.closeExistingTooltip();

    if (value) {
      this.clearHoverTimeout(tooltip);
    }

    this.toggleTooltip(tooltip, value);
  };

  toggleTooltip = (tooltip: HTMLCalciteTooltipElement, value: boolean): void => {
    tooltip.open = value;

    if (value) {
      this.tooltipEl = tooltip;
    }
  };

  hoverToggle = ({
    tooltip,
    value
  }: {
    tooltip: HTMLCalciteTooltipElement;
    value: boolean;
  }): void => {
    const { hoverTimeouts } = this;

    hoverTimeouts.delete(tooltip);

    if (value) {
      this.closeExistingTooltip();
    }

    this.toggleTooltip(tooltip, value);
  };

  hoverTooltip = ({
    tooltip,
    value
  }: {
    tooltip: HTMLCalciteTooltipElement;
    value: boolean;
  }): void => {
    this.clearHoverTimeout(tooltip);

    const { hoverTimeouts } = this;

    const timeoutId = window.setTimeout(
      () => this.hoverToggle({ tooltip, value }),
      TOOLTIP_DELAY_MS || 0
    );

    hoverTimeouts.set(tooltip, timeoutId);
  };

  activeTooltipHover = (event: MouseEvent): void => {
    const { tooltipEl, hoverTimeouts } = this;
    const { type } = event;

    if (!tooltipEl) {
      return;
    }

    if (type === "mouseover" && event.composedPath().includes(tooltipEl)) {
      this.clearHoverTimeout(tooltipEl);
    } else if (type === "mouseout" && !hoverTimeouts.has(tooltipEl)) {
      this.hoverTooltip({ tooltip: tooltipEl, value: false });
    }
  };

  hoverEvent = (event: MouseEvent, value: boolean): void => {
    const tooltip = this.queryTooltip(event.composedPath());

    this.activeTooltipHover(event);

    if (!tooltip) {
      return;
    }

    this.hoverTooltip({ tooltip, value });
  };

  focusEvent = (event: FocusEvent, value: boolean): void => {
    const tooltip = this.queryTooltip(event.composedPath());

    if (!tooltip || tooltip === this.clickedTooltip) {
      this.clickedTooltip = null;
      return;
    }

    this.focusTooltip({ tooltip, value });
  };

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  render(): VNode {
    return <slot />;
  }

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  @Listen("keyup", { target: "document" })
  keyUpHandler(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      const { tooltipEl } = this;

      if (tooltipEl) {
        this.clearHoverTimeout(tooltipEl);
        this.toggleTooltip(tooltipEl, false);
      }
    }
  }

  @Listen("mouseover", { capture: true })
  mouseEnterShow(event: MouseEvent): void {
    this.hoverEvent(event, true);
  }

  @Listen("mouseout", { capture: true })
  mouseLeaveHide(event: MouseEvent): void {
    this.hoverEvent(event, false);
  }

  @Listen("click", { capture: true })
  clickHandler(event: MouseEvent): void {
    const clickedTooltip = this.queryTooltip(event.composedPath());

    this.clickedTooltip = clickedTooltip;

    if (clickedTooltip) {
      this.toggleTooltip(clickedTooltip, false);
    }
  }

  @Listen("focus", { capture: true })
  focusShow(event: FocusEvent): void {
    this.focusEvent(event, true);
  }

  @Listen("blur", { capture: true })
  blurHide(event: FocusEvent): void {
    this.focusEvent(event, false);
  }
}
