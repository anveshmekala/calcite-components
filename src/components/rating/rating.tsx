import {
  Component,
  Element,
  Event,
  EventEmitter,
  Fragment,
  h,
  Listen,
  Method,
  Prop,
  State,
  VNode
} from "@stencil/core";
import { guid } from "../../utils/guid";
import { Scale } from "../interfaces";
import { LabelableComponent, connectLabel, disconnectLabel } from "../../utils/label";
import { connectForm, disconnectForm, FormComponent, HiddenFormInputSlot } from "../../utils/form";
import { TEXT } from "./resources";
import { InteractiveComponent, updateHostInteraction } from "../../utils/interactive";
import { isActivationKey } from "../../utils/key";
import {
  setUpLoadableComponent,
  setComponentLoaded,
  LoadableComponent,
  componentLoaded
} from "../../utils/loadable";

@Component({
  tag: "calcite-rating",
  styleUrl: "rating.scss",
  shadow: true
})
export class Rating
  implements LabelableComponent, FormComponent, InteractiveComponent, LoadableComponent
{
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLCalciteRatingElement;

  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  /** Specifies the size of the component. */
  @Prop({ reflect: true }) scale: Scale = "m";

  /** The component's value. */
  @Prop({ reflect: true, mutable: true }) value = 0;

  /** When `true`, the component's value can be read, but cannot be modified. */
  @Prop({ reflect: true }) readOnly = false;

  /** When `true`, interaction is prevented and the component is displayed with lower opacity. */
  @Prop({ reflect: true }) disabled = false;

  /** When `true`, and if available, displays the `average` and/or `count` data summary in a `calcite-chip`. */
  @Prop({ reflect: true }) showChip = false;

  /** Specifies the number of previous ratings to display. */
  @Prop({ reflect: true }) count?: number;

  /** Specifies a cumulative average from previous ratings to display. */
  @Prop({ reflect: true }) average?: number;

  /** Specifies the name of the component on form submission. */
  @Prop({ reflect: true }) name: string;

  /**
   * Accessible name for the component.
   *
   * @default "Rating"
   */
  @Prop() intlRating?: string = TEXT.rating;

  /**
   * Accessible name for each star. The `${num}` in the string will be replaced by the number.
   *
   * @default "Stars: ${num}"
   */
  @Prop() intlStars?: string = TEXT.stars;

  /**
   * When `true`, the component must have a value in order for the form to submit.
   *
   * @internal
   */
  @Prop({ reflect: true }) required = false;

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  connectedCallback(): void {
    connectLabel(this);
    connectForm(this);
  }

  componentWillLoad(): void {
    setUpLoadableComponent(this);
  }

  componentDidLoad(): void {
    setComponentLoaded(this);
  }

  disconnectedCallback(): void {
    disconnectLabel(this);
    disconnectForm(this);
  }

  componentDidRender(): void {
    updateHostInteraction(this);
  }

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  /**
   * Fires when the component's value changes.
   */
  @Event({ cancelable: false }) calciteRatingChange: EventEmitter<{ value: number }>;

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  @Listen("blur")
  blurHandler(): void {
    this.hasFocus = false;
  }

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  renderStars(): VNode[] {
    return [1, 2, 3, 4, 5].map((i) => {
      const selected = this.value >= i;
      const average = this.average && !this.value && i <= this.average;
      const hovered = i <= this.hoverValue;
      const fraction = this.average && this.average + 1 - i;
      const partial = !this.value && !hovered && fraction > 0 && fraction < 1;
      const focused = this.hasFocus && this.focusValue === i;
      return (
        <span class={{ wrapper: true }}>
          <label
            class={{ star: true, focused, selected, average, hovered, partial }}
            htmlFor={`${this.guid}-${i}`}
            onPointerOver={() => {
              this.hoverValue = i;
            }}
          >
            <calcite-icon
              aria-hidden="true"
              class="icon"
              icon={selected || average || this.readOnly ? "star-f" : "star"}
              scale={this.scale}
            />
            {partial && (
              <div class="fraction" style={{ width: `${fraction * 100}%` }}>
                <calcite-icon icon="star-f" scale={this.scale} />
              </div>
            )}
            <span class="visually-hidden">{this.intlStars.replace("${num}", `${i}`)}</span>
          </label>
          <input
            checked={i === this.value}
            class="visually-hidden"
            disabled={this.disabled || this.readOnly}
            id={`${this.guid}-${i}`}
            name={this.guid}
            onChange={() => this.updateValue(i)}
            onClick={(event) =>
              // click is fired from the component's label, so we treat this as an internal event
              event.stopPropagation()
            }
            onFocus={() => this.onFocusChange(i)}
            onKeyDown={this.onKeyboardPressed}
            ref={(el) =>
              (i === 1 || i === this.value) && (this.inputFocusRef = el as HTMLInputElement)
            }
            type="radio"
            value={i}
          />
        </span>
      );
    });
  }

  render() {
    const { disabled, intlRating, showChip, scale, count, average } = this;

    return (
      <Fragment>
        <fieldset
          class="fieldset"
          disabled={disabled}
          onBlur={() => (this.hoverValue = null)}
          onPointerLeave={() => (this.hoverValue = null)}
          onTouchEnd={() => (this.hoverValue = null)}
        >
          <legend class="visually-hidden">{intlRating}</legend>
          {this.renderStars()}
        </fieldset>
        {(count || average) && showChip ? (
          <calcite-chip scale={scale} value={count?.toString()}>
            {!!average && <span class="number--average">{average.toString()}</span>}
            {!!count && <span class="number--count">({count?.toString()})</span>}
          </calcite-chip>
        ) : null}
        <HiddenFormInputSlot component={this} />
      </Fragment>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  onLabelClick(): void {
    this.setFocus();
  }

  private updateValue(value: number) {
    this.value = value;
    this.calciteRatingChange.emit({ value });
  }

  private onKeyboardPressed = (event: KeyboardEvent): void => {
    if (!this.required && isActivationKey(event.key)) {
      event.preventDefault();
      this.updateValue(0);
    }
  };

  private onFocusChange = (selectedRatingValue: number): void => {
    this.hasFocus = true;
    if (!this.required && this.focusValue === selectedRatingValue) {
      this.updateValue(0);
    } else {
      this.focusValue = selectedRatingValue;
    }
  };

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  /** Sets focus on the component. */
  @Method()
  async setFocus(): Promise<void> {
    await componentLoaded(this);

    this.inputFocusRef?.focus();
  }

  // --------------------------------------------------------------------------
  //
  //  Private State / Properties
  //
  // --------------------------------------------------------------------------

  labelEl: HTMLCalciteLabelElement;

  formEl: HTMLFormElement;

  defaultValue: Rating["value"];

  @State() hoverValue: number;

  @State() focusValue: number;

  @State() hasFocus: boolean;

  private guid = `calcite-ratings-${guid()}`;

  private inputFocusRef: HTMLInputElement;
}
