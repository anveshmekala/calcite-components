import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Listen,
  Method,
  Prop,
  State,
  VNode,
  Watch
} from "@stencil/core";
import { Scale } from "../interfaces";
import { isActivationKey, numberKeys } from "../../utils/key";
import { isValidNumber } from "../../utils/number";

import {
  formatTimePart,
  getLocaleHourCycle,
  getMeridiem,
  getTimeParts,
  HourCycle,
  isValidTime,
  localizeTimePart,
  localizeTimeStringToParts,
  maxTenthForMinuteAndSecond,
  Meridiem,
  MinuteOrSecond,
  parseTimeString,
  TimePart
} from "../../utils/time";
import { CSS, TEXT } from "./resources";
import {
  connectLocalized,
  disconnectLocalized,
  LocalizedComponent,
  NumberingSystem,
  updateEffectiveLocale
} from "../../utils/locale";

import {
  setUpLoadableComponent,
  setComponentLoaded,
  LoadableComponent,
  componentLoaded
} from "../../utils/loadable";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

@Component({
  tag: "calcite-time-picker",
  styleUrl: "time-picker.scss",
  shadow: true
})
export class TimePicker implements LocalizedComponent, LoadableComponent {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLCalciteTimePickerElement;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /**
   * Accessible name for the component's hour input.
   *
   * @default "Hour"
   */
  @Prop() intlHour = TEXT.hour;

  /**
   * Accessible name for the component's hour down button.
   *
   * @default "Decrease hour"
   */
  @Prop() intlHourDown = TEXT.hourDown;

  /**
   * Accessible name for the component's hour up button.
   *
   * @default "Increase hour"
   */
  @Prop() intlHourUp = TEXT.hourUp;

  /**
   * Accessible name for the component's meridiem (AM/PM) input.
   *
   * @default "AM/PM"
   */
  @Prop() intlMeridiem = TEXT.meridiem;

  /**
   * Accessible name for the component's meridiem (AM/PM) down button.
   *
   * @default "Decrease AM/PM"
   */
  @Prop() intlMeridiemDown = TEXT.meridiemDown;

  /**
   * Accessible name for the component's meridiem (AM/PM) up button.
   *
   * @default "Increase AM/PM"
   */
  @Prop() intlMeridiemUp = TEXT.meridiemUp;

  /**
   * Accessible name for the component's minute input.
   *
   * @default "Minute"
   */
  @Prop() intlMinute = TEXT.minute;

  /**
   * Accessible name for the component's minute down button.
   *
   * @default "Decrease minute"
   */
  @Prop() intlMinuteDown = TEXT.minuteDown;

  /**
   * Accessible name for the component's minute up button.
   *
   * @default "Increase minute"
   */
  @Prop() intlMinuteUp = TEXT.minuteUp;

  /**
   * Accessible name for the component's second input.
   *
   * @default "Second"
   */
  @Prop() intlSecond = TEXT.second;

  /**
   * Accessible name for the component's second down button.
   *
   * @default "Decrease second"
   */
  @Prop() intlSecondDown = TEXT.secondDown;

  /**
   * Accessible name for the component's second up button.
   *
   * @default "Increase second"
   */
  @Prop() intlSecondUp = TEXT.secondUp;

  /**
   * BCP 47 language tag for desired language and country format.
   *
   * @internal
   * @deprecated set the global `lang` attribute on the element instead.
   * @mdn [lang](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang)
   */
  @Prop({ mutable: true }) locale: string;

  @Watch("locale")
  localeChanged(): void {
    updateEffectiveLocale(this);
  }

  /** Specifies the size of the component. */
  @Prop({ reflect: true }) scale: Scale = "m";

  /** Specifies the granularity the `value` must adhere to (in seconds). */
  @Prop({ reflect: true }) step = 60;

  /**
   * Specifies the Unicode numeral system used by the component for localization.
   *
   */
  @Prop() numberingSystem?: NumberingSystem;

  /** The component's value in UTC (always 24-hour format). */
  @Prop({ mutable: true }) value: string = null;

  @Watch("value")
  valueWatcher(newValue: string): void {
    this.setValue(newValue, false);
  }

  // --------------------------------------------------------------------------
  //
  //  Private Properties
  //
  // --------------------------------------------------------------------------

  private activeEl: HTMLSpanElement;

  private hourEl: HTMLSpanElement;

  private meridiemEl: HTMLSpanElement;

  private minuteEl: HTMLSpanElement;

  private secondEl: HTMLSpanElement;

  private meridiemOrder: number;

  // --------------------------------------------------------------------------
  //
  //  State
  //
  // --------------------------------------------------------------------------

  @State() effectiveLocale = "";

  @Watch("effectiveLocale")
  effectiveLocaleWatcher(): void {
    this.updateLocale();
  }

  @State() hour: string;

  @State() hourCycle: HourCycle;

  @State() localizedHour: string;

  @State() localizedHourSuffix: string;

  @State() localizedMeridiem: string;

  @State() localizedMinute: string;

  @State() localizedMinuteSuffix: string;

  @State() localizedSecond: string;

  @State() localizedSecondSuffix: string;

  @State() meridiem: Meridiem;

  @State() minute: string;

  @State() second: string;

  @State() showSecond: boolean = this.step < 60;

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  /**
   * @internal
   */
  @Event({ cancelable: false }) calciteInternalTimePickerBlur: EventEmitter<void>;

  /**
   * @internal
   */
  @Event({ cancelable: false }) calciteInternalTimePickerChange: EventEmitter<string>;

  /**
   * @internal
   */
  @Event({ cancelable: false }) calciteInternalTimePickerFocus: EventEmitter<void>;

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  @Listen("blur")
  hostBlurHandler(): void {
    this.calciteInternalTimePickerBlur.emit();
  }

  @Listen("focus")
  hostFocusHandler(): void {
    this.calciteInternalTimePickerFocus.emit();
  }

  @Listen("keydown")
  keyDownHandler(event: KeyboardEvent): void {
    const { defaultPrevented, key } = event;

    if (defaultPrevented) {
      return;
    }

    switch (this.activeEl) {
      case this.hourEl:
        if (key === "ArrowRight") {
          this.setFocus("minute");
          event.preventDefault();
        }
        break;
      case this.minuteEl:
        switch (key) {
          case "ArrowLeft":
            this.setFocus("hour");
            event.preventDefault();
            break;
          case "ArrowRight":
            if (this.step !== 60) {
              this.setFocus("second");
              event.preventDefault();
            } else if (this.hourCycle === "12") {
              this.setFocus("meridiem");
              event.preventDefault();
            }
            break;
        }
        break;
      case this.secondEl:
        switch (key) {
          case "ArrowLeft":
            this.setFocus("minute");
            event.preventDefault();
            break;
          case "ArrowRight":
            if (this.hourCycle === "12") {
              this.setFocus("meridiem");
              event.preventDefault();
            }
            break;
        }
        break;
      case this.meridiemEl:
        switch (key) {
          case "ArrowLeft":
            if (this.step !== 60) {
              this.setFocus("second");
              event.preventDefault();
            } else {
              this.setFocus("minute");
              event.preventDefault();
            }
            break;
        }
        break;
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  /**
   * Sets focus on the component.
   *
   * @param target
   */
  @Method()
  async setFocus(target: TimePart): Promise<void> {
    await componentLoaded(this);

    this[`${target || "hour"}El`]?.focus();
  }

  // --------------------------------------------------------------------------
  //
  //  Private Methods
  //
  // --------------------------------------------------------------------------

  private buttonActivated(event: KeyboardEvent): boolean {
    const { key } = event;

    if (key === " ") {
      event.preventDefault();
    }

    return isActivationKey(key);
  }

  private decrementHour = (): void => {
    const newHour = !this.hour ? 0 : this.hour === "00" ? 23 : parseInt(this.hour) - 1;
    this.setValuePart("hour", newHour);
  };

  private decrementMeridiem = (): void => {
    const newMeridiem = this.meridiem === "PM" ? "AM" : "PM";
    this.setValuePart("meridiem", newMeridiem);
  };

  private decrementMinuteOrSecond = (key: MinuteOrSecond): void => {
    let newValue;
    if (isValidNumber(this[key])) {
      const valueAsNumber = parseInt(this[key]);
      newValue = valueAsNumber === 0 ? 59 : valueAsNumber - 1;
    } else {
      newValue = 59;
    }
    this.setValuePart(key, newValue);
  };

  private decrementMinute = (): void => {
    this.decrementMinuteOrSecond("minute");
  };

  private decrementSecond = (): void => {
    this.decrementMinuteOrSecond("second");
  };

  private focusHandler = (event: FocusEvent): void => {
    this.activeEl = event.currentTarget as HTMLSpanElement;
  };

  private hourDownButtonKeyDownHandler = (event: KeyboardEvent): void => {
    if (this.buttonActivated(event)) {
      this.decrementHour();
    }
  };

  private hourKeyDownHandler = (event: KeyboardEvent): void => {
    const { key } = event;
    if (numberKeys.includes(key)) {
      const keyAsNumber = parseInt(key);
      let newHour;
      if (isValidNumber(this.hour)) {
        switch (this.hourCycle) {
          case "12":
            newHour =
              this.hour === "01" && keyAsNumber >= 0 && keyAsNumber <= 2
                ? `1${keyAsNumber}`
                : keyAsNumber;
            break;
          case "24":
            if (this.hour === "01") {
              newHour = `1${keyAsNumber}`;
            } else if (this.hour === "02" && keyAsNumber >= 0 && keyAsNumber <= 3) {
              newHour = `2${keyAsNumber}`;
            } else {
              newHour = keyAsNumber;
            }
            break;
        }
      } else {
        newHour = keyAsNumber;
      }
      this.setValuePart("hour", newHour);
    } else {
      switch (key) {
        case "Backspace":
        case "Delete":
          this.setValuePart("hour", null);
          break;
        case "ArrowDown":
          event.preventDefault();
          this.decrementHour();
          break;
        case "ArrowUp":
          event.preventDefault();
          this.incrementHour();
          break;
        case " ":
          event.preventDefault();
          break;
      }
    }
  };

  private hourUpButtonKeyDownHandler = (event: KeyboardEvent): void => {
    if (this.buttonActivated(event)) {
      this.incrementHour();
    }
  };

  private incrementMeridiem = (): void => {
    const newMeridiem = this.meridiem === "AM" ? "PM" : "AM";
    this.setValuePart("meridiem", newMeridiem);
  };

  private incrementHour = (): void => {
    const newHour = isValidNumber(this.hour)
      ? this.hour === "23"
        ? 0
        : parseInt(this.hour) + 1
      : 1;
    this.setValuePart("hour", newHour);
  };

  private incrementMinuteOrSecond = (key: MinuteOrSecond): void => {
    const newValue = isValidNumber(this[key])
      ? this[key] === "59"
        ? 0
        : parseInt(this[key]) + 1
      : 0;
    this.setValuePart(key, newValue);
  };

  private incrementMinute = (): void => {
    this.incrementMinuteOrSecond("minute");
  };

  private incrementSecond = (): void => {
    this.incrementMinuteOrSecond("second");
  };

  private meridiemDownButtonKeyDownHandler = (event: KeyboardEvent): void => {
    if (this.buttonActivated(event)) {
      this.decrementMeridiem();
    }
  };

  private meridiemKeyDownHandler = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "a":
        this.setValuePart("meridiem", "AM");
        break;
      case "p":
        this.setValuePart("meridiem", "PM");
        break;
      case "Backspace":
      case "Delete":
        this.setValuePart("meridiem", null);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.incrementMeridiem();
        break;
      case "ArrowDown":
        event.preventDefault();
        this.decrementMeridiem();
        break;
      case " ":
        event.preventDefault();
        break;
    }
  };

  private meridiemUpButtonKeyDownHandler = (event: KeyboardEvent): void => {
    if (this.buttonActivated(event)) {
      this.incrementMeridiem();
    }
  };

  private minuteDownButtonKeyDownHandler = (event: KeyboardEvent): void => {
    if (this.buttonActivated(event)) {
      this.decrementMinute();
    }
  };

  private minuteKeyDownHandler = (event: KeyboardEvent): void => {
    const { key } = event;
    if (numberKeys.includes(key)) {
      const keyAsNumber = parseInt(key);
      let newMinute;
      if (isValidNumber(this.minute) && this.minute.startsWith("0")) {
        const minuteAsNumber = parseInt(this.minute);
        newMinute =
          minuteAsNumber > maxTenthForMinuteAndSecond
            ? keyAsNumber
            : `${minuteAsNumber}${keyAsNumber}`;
      } else {
        newMinute = keyAsNumber;
      }
      this.setValuePart("minute", newMinute);
    } else {
      switch (key) {
        case "Backspace":
        case "Delete":
          this.setValuePart("minute", null);
          break;
        case "ArrowDown":
          event.preventDefault();
          this.decrementMinute();
          break;
        case "ArrowUp":
          event.preventDefault();
          this.incrementMinute();
          break;
        case " ":
          event.preventDefault();
          break;
      }
    }
  };

  private minuteUpButtonKeyDownHandler = (event: KeyboardEvent): void => {
    if (this.buttonActivated(event)) {
      this.incrementMinute();
    }
  };

  private secondDownButtonKeyDownHandler = (event: KeyboardEvent): void => {
    if (this.buttonActivated(event)) {
      this.decrementSecond();
    }
  };

  private secondKeyDownHandler = (event: KeyboardEvent): void => {
    const { key } = event;
    if (numberKeys.includes(key)) {
      const keyAsNumber = parseInt(key);
      let newSecond;
      if (isValidNumber(this.second) && this.second.startsWith("0")) {
        const secondAsNumber = parseInt(this.second);
        newSecond =
          secondAsNumber > maxTenthForMinuteAndSecond
            ? keyAsNumber
            : `${secondAsNumber}${keyAsNumber}`;
      } else {
        newSecond = keyAsNumber;
      }
      this.setValuePart("second", newSecond);
    } else {
      switch (key) {
        case "Backspace":
        case "Delete":
          this.setValuePart("second", null);
          break;
        case "ArrowDown":
          event.preventDefault();
          this.decrementSecond();
          break;
        case "ArrowUp":
          event.preventDefault();
          this.incrementSecond();
          break;
        case " ":
          event.preventDefault();
          break;
      }
    }
  };

  private secondUpButtonKeyDownHandler = (event: KeyboardEvent): void => {
    if (this.buttonActivated(event)) {
      this.incrementSecond();
    }
  };

  private setHourEl = (el: HTMLSpanElement) => (this.hourEl = el);

  private setMeridiemEl = (el: HTMLSpanElement) => (this.meridiemEl = el);

  private setMinuteEl = (el: HTMLSpanElement) => (this.minuteEl = el);

  private setSecondEl = (el: HTMLSpanElement) => (this.secondEl = el);

  private setValue = (value: string, emit = true): void => {
    if (isValidTime(value)) {
      const { hour, minute, second } = parseTimeString(value);
      const { effectiveLocale: locale, numberingSystem } = this;
      const {
        localizedHour,
        localizedHourSuffix,
        localizedMinute,
        localizedMinuteSuffix,
        localizedSecond,
        localizedSecondSuffix,
        localizedMeridiem
      } = localizeTimeStringToParts({ value, locale, numberingSystem });
      this.localizedHour = localizedHour;
      this.localizedHourSuffix = localizedHourSuffix;
      this.localizedMinute = localizedMinute;
      this.localizedMinuteSuffix = localizedMinuteSuffix;
      this.localizedSecond = localizedSecond;
      this.localizedSecondSuffix = localizedSecondSuffix;
      this.hour = hour;
      this.minute = minute;
      this.second = second;
      if (localizedMeridiem) {
        this.localizedMeridiem = localizedMeridiem;
        this.meridiem = getMeridiem(this.hour);
        const formatParts = getTimeParts({ value, locale, numberingSystem });
        this.meridiemOrder = this.getMeridiemOrder(formatParts);
      }
    } else {
      this.hour = null;
      this.localizedHour = null;
      this.localizedHourSuffix = null;
      this.localizedMeridiem = null;
      this.localizedMinute = null;
      this.localizedMinuteSuffix = null;
      this.localizedSecond = null;
      this.localizedSecondSuffix = null;
      this.meridiem = null;
      this.minute = null;
      this.second = null;
      this.value = null;
    }
    if (emit) {
      this.calciteInternalTimePickerChange.emit();
    }
  };

  private setValuePart = (
    key: "hour" | "minute" | "second" | "meridiem",
    value: number | string | Meridiem,
    emit = true
  ): void => {
    const { effectiveLocale: locale, numberingSystem } = this;
    if (key === "meridiem") {
      this.meridiem = value as Meridiem;
      if (isValidNumber(this.hour)) {
        const hourAsNumber = parseInt(this.hour);
        switch (value) {
          case "AM":
            if (hourAsNumber >= 12) {
              this.hour = formatTimePart(hourAsNumber - 12);
            }
            break;
          case "PM":
            if (hourAsNumber < 12) {
              this.hour = formatTimePart(hourAsNumber + 12);
            }
            break;
        }
        this.localizedHour = localizeTimePart({
          value: this.hour,
          part: "hour",
          locale,
          numberingSystem
        });
      }
    } else {
      this[key] = typeof value === "number" ? formatTimePart(value) : value;
      this[`localized${capitalize(key)}`] = localizeTimePart({
        value: this[key],
        part: key,
        locale,
        numberingSystem
      });
    }
    if (this.hour && this.minute) {
      const showSeconds = this.second && this.showSecond;
      this.value = `${this.hour}:${this.minute}:${showSeconds ? this.second : "00"}`;
    } else {
      this.value = null;
    }
    this.localizedMeridiem = this.value
      ? localizeTimeStringToParts({ value: this.value, locale, numberingSystem })
          ?.localizedMeridiem || null
      : localizeTimePart({ value: this.meridiem, part: "meridiem", locale, numberingSystem });
    if (emit) {
      this.calciteInternalTimePickerChange.emit();
    }
  };

  private getMeridiemOrder(formatParts: Intl.DateTimeFormatPart[]): number {
    const locale = this.effectiveLocale;
    const isRTLKind = locale === "ar" || locale === "he";
    if (formatParts && !isRTLKind) {
      const index = formatParts.findIndex((parts: { type: string; value: string }) => {
        return parts.value === this.localizedMeridiem;
      });
      return index;
    }
    return 0;
  }

  private updateLocale() {
    this.hourCycle = getLocaleHourCycle(this.effectiveLocale, this.numberingSystem);
    this.setValue(this.value, false);
  }

  // --------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  // --------------------------------------------------------------------------

  connectedCallback() {
    connectLocalized(this);
    this.updateLocale();
    this.meridiemOrder = this.getMeridiemOrder(
      getTimeParts({
        value: "0:00:00",
        locale: this.effectiveLocale,
        numberingSystem: this.numberingSystem
      })
    );
  }

  componentWillLoad(): void {
    setUpLoadableComponent(this);
  }

  componentDidLoad(): void {
    setComponentLoaded(this);
  }

  disconnectedCallback(): void {
    disconnectLocalized(this);
  }

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  render(): VNode {
    const hourIsNumber = isValidNumber(this.hour);
    const iconScale = this.scale === "s" || this.scale === "m" ? "s" : "m";
    const minuteIsNumber = isValidNumber(this.minute);
    const secondIsNumber = isValidNumber(this.second);
    const showMeridiem = this.hourCycle === "12";
    return (
      <div
        class={{
          [CSS.timePicker]: true,
          [CSS.showMeridiem]: showMeridiem,
          [CSS.showSecond]: this.showSecond,
          [CSS[`scale-${this.scale}`]]: true
        }}
        dir="ltr"
      >
        <div class={CSS.column} role="group">
          <span
            aria-label={this.intlHourUp}
            class={{
              [CSS.button]: true,
              [CSS.buttonHourUp]: true,
              [CSS.buttonTopLeft]: true
            }}
            onClick={this.incrementHour}
            onKeyDown={this.hourUpButtonKeyDownHandler}
            role="button"
            tabIndex={-1}
          >
            <calcite-icon icon="chevron-up" scale={iconScale} />
          </span>
          <span
            aria-label={this.intlHour}
            aria-valuemax="23"
            aria-valuemin="1"
            aria-valuenow={(hourIsNumber && parseInt(this.hour)) || "0"}
            aria-valuetext={this.hour}
            class={{
              [CSS.input]: true,
              [CSS.hour]: true
            }}
            onFocus={this.focusHandler}
            onKeyDown={this.hourKeyDownHandler}
            ref={this.setHourEl}
            role="spinbutton"
            tabIndex={0}
          >
            {this.localizedHour || "--"}
          </span>
          <span
            aria-label={this.intlHourDown}
            class={{
              [CSS.button]: true,
              [CSS.buttonHourDown]: true,
              [CSS.buttonBottomLeft]: true
            }}
            onClick={this.decrementHour}
            onKeyDown={this.hourDownButtonKeyDownHandler}
            role="button"
            tabIndex={-1}
          >
            <calcite-icon icon="chevron-down" scale={iconScale} />
          </span>
        </div>
        <span class={CSS.delimiter}>{this.localizedHourSuffix}</span>
        <div class={CSS.column} role="group">
          <span
            aria-label={this.intlMinuteUp}
            class={{
              [CSS.button]: true,
              [CSS.buttonMinuteUp]: true
            }}
            onClick={this.incrementMinute}
            onKeyDown={this.minuteUpButtonKeyDownHandler}
            role="button"
            tabIndex={-1}
          >
            <calcite-icon icon="chevron-up" scale={iconScale} />
          </span>
          <span
            aria-label={this.intlMinute}
            aria-valuemax="12"
            aria-valuemin="1"
            aria-valuenow={(minuteIsNumber && parseInt(this.minute)) || "0"}
            aria-valuetext={this.minute}
            class={{
              [CSS.input]: true,
              [CSS.minute]: true
            }}
            onFocus={this.focusHandler}
            onKeyDown={this.minuteKeyDownHandler}
            ref={this.setMinuteEl}
            role="spinbutton"
            tabIndex={0}
          >
            {this.localizedMinute || "--"}
          </span>
          <span
            aria-label={this.intlMinuteDown}
            class={{
              [CSS.button]: true,
              [CSS.buttonMinuteDown]: true
            }}
            onClick={this.decrementMinute}
            onKeyDown={this.minuteDownButtonKeyDownHandler}
            role="button"
            tabIndex={-1}
          >
            <calcite-icon icon="chevron-down" scale={iconScale} />
          </span>
        </div>
        {this.showSecond && <span class={CSS.delimiter}>{this.localizedMinuteSuffix}</span>}
        {this.showSecond && (
          <div class={CSS.column} role="group">
            <span
              aria-label={this.intlSecondUp}
              class={{
                [CSS.button]: true,
                [CSS.buttonSecondUp]: true
              }}
              onClick={this.incrementSecond}
              onKeyDown={this.secondUpButtonKeyDownHandler}
              role="button"
              tabIndex={-1}
            >
              <calcite-icon icon="chevron-up" scale={iconScale} />
            </span>
            <span
              aria-label={this.intlSecond}
              aria-valuemax="59"
              aria-valuemin="0"
              aria-valuenow={(secondIsNumber && parseInt(this.second)) || "0"}
              aria-valuetext={this.second}
              class={{
                [CSS.input]: true,
                [CSS.second]: true
              }}
              onFocus={this.focusHandler}
              onKeyDown={this.secondKeyDownHandler}
              ref={this.setSecondEl}
              role="spinbutton"
              tabIndex={0}
            >
              {this.localizedSecond || "--"}
            </span>
            <span
              aria-label={this.intlSecondDown}
              class={{
                [CSS.button]: true,
                [CSS.buttonSecondDown]: true
              }}
              onClick={this.decrementSecond}
              onKeyDown={this.secondDownButtonKeyDownHandler}
              role="button"
              tabIndex={-1}
            >
              <calcite-icon icon="chevron-down" scale={iconScale} />
            </span>
          </div>
        )}
        {this.localizedSecondSuffix && (
          <span class={CSS.delimiter}>{this.localizedSecondSuffix}</span>
        )}
        {showMeridiem && (
          <div
            class={{
              [CSS.column]: true,
              [CSS.meridiemStart]: this.meridiemOrder === 0
            }}
            role="group"
          >
            <span
              aria-label={this.intlMeridiemUp}
              class={{
                [CSS.button]: true,
                [CSS.buttonMeridiemUp]: true,
                [CSS.buttonTopRight]: true
              }}
              onClick={this.incrementMeridiem}
              onKeyDown={this.meridiemUpButtonKeyDownHandler}
              role="button"
              tabIndex={-1}
            >
              <calcite-icon icon="chevron-up" scale={iconScale} />
            </span>
            <span
              aria-label={this.intlMeridiem}
              aria-valuemax="2"
              aria-valuemin="1"
              aria-valuenow={(this.meridiem === "PM" && "2") || "1"}
              aria-valuetext={this.meridiem}
              class={{
                [CSS.input]: true,
                [CSS.meridiem]: true
              }}
              onFocus={this.focusHandler}
              onKeyDown={this.meridiemKeyDownHandler}
              ref={this.setMeridiemEl}
              role="spinbutton"
              tabIndex={0}
            >
              {this.localizedMeridiem || "--"}
            </span>
            <span
              aria-label={this.intlMeridiemDown}
              class={{
                [CSS.button]: true,
                [CSS.buttonMeridiemDown]: true,
                [CSS.buttonBottomRight]: true
              }}
              onClick={this.decrementMeridiem}
              onKeyDown={this.meridiemDownButtonKeyDownHandler}
              role="button"
              tabIndex={-1}
            >
              <calcite-icon icon="chevron-down" scale={iconScale} />
            </span>
          </div>
        )}
      </div>
    );
  }
}
