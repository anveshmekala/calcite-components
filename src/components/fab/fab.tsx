import { Component, Element, Method, Prop, h, VNode } from "@stencil/core";
import { Appearance, Scale } from "../interfaces";
import { ButtonColor } from "../button/interfaces";
import { CSS, ICONS } from "./resources";
import { focusElement } from "../../utils/dom";
import { InteractiveComponent, updateHostInteraction } from "../../utils/interactive";
import {
  setUpLoadableComponent,
  setComponentLoaded,
  LoadableComponent,
  componentLoaded
} from "../../utils/loadable";

@Component({
  tag: "calcite-fab",
  styleUrl: "fab.scss",
  shadow: true
})
export class Fab implements InteractiveComponent, LoadableComponent {
  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  /**
   * Used to set the button's appearance. Default is outline.
   */
  @Prop({ reflect: true }) appearance: Extract<"solid" | "outline", Appearance> = "outline";

  /**
   * Used to set the button's color. Default is light.
   */
  @Prop({ reflect: true }) color: ButtonColor = "neutral";

  /**
   * When true, disabled prevents interaction. This state shows items with lower opacity/grayed.
   */
  @Prop({ reflect: true }) disabled = false;

  /**
   * Specifies an icon to display.
   *
   * @default "plus"
   */
  @Prop({ reflect: true }) icon?: string = ICONS.plus;

  /**
   * Label of the FAB, exposed on hover when textEnabled is false. If no label is provided, the label inherits what's provided for the `text` prop.
   */
  @Prop() label?: string;

  /**
   * When true, content is waiting to be loaded. This state shows a busy indicator.
   */
  @Prop({ reflect: true }) loading = false;

  /**
   * Specifies the size of the fab.
   */
  @Prop({ reflect: true }) scale: Scale = "m";

  /**
   * Text that accompanies the FAB icon.
   */
  @Prop() text?: string;

  /**
   * Indicates whether the text is displayed.
   */
  @Prop({ reflect: true }) textEnabled = false;

  // --------------------------------------------------------------------------
  //
  //  Private Properties
  //
  // --------------------------------------------------------------------------

  @Element() el: HTMLCalciteFabElement;

  private buttonEl: HTMLElement;

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  componentWillLoad(): void {
    setUpLoadableComponent(this);
  }

  componentDidLoad(): void {
    setComponentLoaded(this);
  }

  componentDidRender(): void {
    updateHostInteraction(this);
  }

  // --------------------------------------------------------------------------
  //
  //  Methods
  //
  // --------------------------------------------------------------------------

  /** Sets focus on the component. */
  @Method()
  async setFocus(): Promise<void> {
    await componentLoaded(this);

    focusElement(this.buttonEl);
  }

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  render(): VNode {
    const { appearance, color, disabled, loading, scale, textEnabled, icon, label, text } = this;
    const title = !textEnabled ? label || text || null : null;

    return (
      <calcite-button
        appearance={appearance === "solid" ? "solid" : "outline"}
        class={CSS.button}
        color={color}
        disabled={disabled}
        iconStart={icon}
        label={label}
        loading={loading}
        ref={(buttonEl): void => {
          this.buttonEl = buttonEl;
        }}
        round={true}
        scale={scale}
        title={title}
        type="button"
        width="auto"
      >
        {this.textEnabled ? this.text : null}
      </calcite-button>
    );
  }
}
