import {
  Component,
  Element,
  Prop,
  Host,
  Event,
  EventEmitter,
  h,
  Listen,
  VNode
} from "@stencil/core";
import { inRange, sameDate, dateFromRange, HoverRange } from "../../utils/date";
import { DateLocaleData } from "../date-picker/utils";
import { Scale } from "../interfaces";

@Component({
  tag: "calcite-date-picker-month",
  styleUrl: "date-picker-month.scss",
  shadow: true
})
export class DatePickerMonth {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLCalciteDatePickerMonthElement;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /** Already selected date.*/
  @Prop() selectedDate: Date;

  /** Date currently active.*/
  @Prop() activeDate: Date = new Date();

  /** Start date currently active. */
  @Prop() startDate?: Date;

  /** End date currently active  */
  @Prop() endDate?: Date;

  /** Minimum date of the calendar below which is disabled.*/
  @Prop() min: Date;

  /** Maximum date of the calendar above which is disabled.*/
  @Prop() max: Date;

  /** specify the scale of the date picker */
  @Prop({ reflect: true }) scale: Scale;

  /**
   * CLDR locale data for current locale
   *
   * @internal
   */
  @Prop() localeData: DateLocaleData;

  /** The range of dates currently being hovered */
  @Prop() hoverRange: HoverRange;

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  /**
   * Event emitted when user selects the date.
   */
  @Event({ cancelable: false }) calciteDatePickerSelect: EventEmitter<Date>;

  /**
   * Event emitted when user hovers the date.
   *
   * @internal
   */
  @Event({ cancelable: false }) calciteInternalDatePickerHover: EventEmitter<Date>;

  /**
   * Active date for the user keyboard access.
   */
  @Event({ cancelable: false }) calciteDatePickerActiveDateChange: EventEmitter<Date>;

  /**
   * @internal
   */
  @Event({ cancelable: false }) calciteInternalDatePickerMouseOut: EventEmitter<void>;

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) {
      return;
    }

    const isRTL = this.el.dir === "rtl";

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        this.addDays(-7);
        break;
      case "ArrowRight":
        event.preventDefault();
        this.addDays(isRTL ? -1 : 1);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.addDays(7);
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.addDays(isRTL ? 1 : -1);
        break;
      case "PageUp":
        event.preventDefault();
        this.addMonths(-1);
        break;
      case "PageDown":
        event.preventDefault();
        this.addMonths(1);
        break;
      case "Home":
        event.preventDefault();
        this.activeDate.setDate(1);
        this.addDays();
        break;
      case "End":
        event.preventDefault();
        this.activeDate.setDate(
          new Date(this.activeDate.getFullYear(), this.activeDate.getMonth() + 1, 0).getDate()
        );
        this.addDays();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        break;
      case "Tab":
        this.activeFocus = false;
    }
  };

  /**
   * Once user is not interacting via keyboard,
   * disable auto focusing of active date
   */
  disableActiveFocus = (): void => {
    this.activeFocus = false;
  };

  @Listen("pointerout")
  mouseoutHandler(): void {
    this.calciteInternalDatePickerMouseOut.emit();
  }

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------
  render(): VNode {
    const month = this.activeDate.getMonth();
    const year = this.activeDate.getFullYear();
    const startOfWeek = this.localeData.weekStart % 7;
    const { abbreviated, short, narrow } = this.localeData.days;
    const weekDays =
      this.scale === "s" ? narrow || short || abbreviated : short || abbreviated || narrow;
    const adjustedWeekDays = [...weekDays.slice(startOfWeek, 7), ...weekDays.slice(0, startOfWeek)];
    const curMonDays = this.getCurrentMonthDays(month, year);
    const prevMonDays = this.getPrevMonthdays(month, year, startOfWeek);
    const nextMonDays = this.getNextMonthDays(month, year, startOfWeek);
    const days = [
      ...prevMonDays.map((day) => {
        const date = new Date(year, month - 1, day);
        return this.renderDateDay(false, day, date);
      }),
      ...curMonDays.map((day) => {
        const date = new Date(year, month, day);
        const active = sameDate(date, this.activeDate);
        return this.renderDateDay(active, day, date, true, true);
      }),
      ...nextMonDays.map((day) => {
        const date = new Date(year, month + 1, day);
        return this.renderDateDay(false, day, date);
      })
    ];

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <Host onFocusOut={this.disableActiveFocus} onKeyDown={this.keyDownHandler}>
        <div class="calender" role="grid">
          <div class="week-headers" role="row">
            {adjustedWeekDays.map((weekday) => (
              <span class="week-header" role="columnheader">
                {weekday}
              </span>
            ))}
          </div>
          {weeks.map((days) => (
            <div class="week-days" role="row">
              {days}
            </div>
          ))}
        </div>
      </Host>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Private State/Props
  //
  //--------------------------------------------------------------------------
  private activeFocus: boolean;

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------
  /**
   * Add n months to the current month
   *
   * @param step
   */
  private addMonths(step: number) {
    const nextDate = new Date(this.activeDate);
    nextDate.setMonth(this.activeDate.getMonth() + step);
    this.calciteDatePickerActiveDateChange.emit(dateFromRange(nextDate, this.min, this.max));
    this.activeFocus = true;
  }

  /**
   * Add n days to the current date
   *
   * @param step
   */
  private addDays(step = 0) {
    const nextDate = new Date(this.activeDate);
    nextDate.setDate(this.activeDate.getDate() + step);
    this.calciteDatePickerActiveDateChange.emit(dateFromRange(nextDate, this.min, this.max));
    this.activeFocus = true;
  }

  /**
   * Get dates for last days of the previous month
   *
   * @param month
   * @param year
   * @param startOfWeek
   */
  private getPrevMonthdays(month: number, year: number, startOfWeek: number): number[] {
    const lastDate = new Date(year, month, 0);
    const date = lastDate.getDate();
    const day = lastDate.getDay();
    const days = [];
    if (day - 6 === startOfWeek) {
      return days;
    }
    for (let i = lastDate.getDay() - startOfWeek; i >= 0; i--) {
      days.push(date - i);
    }
    return days;
  }

  /**
   * Get dates for the current month
   *
   * @param month
   * @param year
   */
  private getCurrentMonthDays(month: number, year: number): number[] {
    const num = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < num; i++) {
      days.push(i + 1);
    }
    return days;
  }

  /**
   * Get dates for first days of the next month
   *
   * @param month
   * @param year
   * @param startOfWeek
   */
  private getNextMonthDays(month: number, year: number, startOfWeek: number): number[] {
    const endDay = new Date(year, month + 1, 0).getDay();
    const days = [];
    if (endDay === (startOfWeek + 6) % 7) {
      return days;
    }
    for (let i = 0; i < (6 - (endDay - startOfWeek)) % 7; i++) {
      days.push(i + 1);
    }
    return days;
  }

  /**
   * Determine if the date is in between the start and end dates
   *
   * @param date
   */
  private betweenSelectedRange(date: Date): boolean {
    return !!(
      this.startDate &&
      this.endDate &&
      date > this.startDate &&
      date < this.endDate &&
      !this.isRangeHover(date)
    );
  }

  /**
   * Determine if the date should be in selected state
   *
   * @param date
   */
  private isSelected(date: Date): boolean {
    return !!(
      sameDate(date, this.selectedDate) ||
      (this.startDate && sameDate(date, this.startDate)) ||
      (this.endDate && sameDate(date, this.endDate))
    );
  }

  /**
   * Determine if the date is the start of the date range
   *
   * @param date
   */
  private isStartOfRange(date: Date): boolean {
    return !!(
      this.startDate &&
      !sameDate(this.startDate, this.endDate) &&
      sameDate(this.startDate, date) &&
      !this.isEndOfRange(date)
    );
  }

  private isEndOfRange(date: Date): boolean {
    return !!(
      (this.endDate && !sameDate(this.startDate, this.endDate) && sameDate(this.endDate, date)) ||
      (!this.endDate &&
        this.hoverRange &&
        sameDate(this.startDate, this.hoverRange.end) &&
        sameDate(date, this.hoverRange.end))
    );
  }

  dayHover = (event: CustomEvent): void => {
    const target = event.target as HTMLCalciteDatePickerDayElement;
    if (target.disabled) {
      this.calciteInternalDatePickerMouseOut.emit();
    } else {
      this.calciteInternalDatePickerHover.emit(target.value);
    }
    event.stopPropagation();
  };

  daySelect = (event: CustomEvent): void => {
    const target = event.target as HTMLCalciteDatePickerDayElement;
    this.calciteDatePickerSelect.emit(target.value);
  };

  /**
   * Render calcite-date-picker-day
   *
   * @param active
   * @param day
   * @param date
   * @param currentMonth
   * @param ref
   */
  private renderDateDay(
    active: boolean,
    day: number,
    date: Date,
    currentMonth?: boolean,
    ref?: boolean
  ) {
    const isFocusedOnStart = this.isFocusedOnStart();
    const isHoverInRange =
      this.isHoverInRange() ||
      (!this.endDate && this.hoverRange && sameDate(this.hoverRange?.end, this.startDate));

    return (
      <calcite-date-picker-day
        active={active}
        class={{
          "hover--inside-range": this.startDate && isHoverInRange,
          "hover--outside-range": this.startDate && !isHoverInRange,
          "focused--start": isFocusedOnStart,
          "focused--end": !isFocusedOnStart
        }}
        currentMonth={currentMonth}
        day={day}
        disabled={!inRange(date, this.min, this.max)}
        endOfRange={this.isEndOfRange(date)}
        highlighted={this.betweenSelectedRange(date)}
        key={date.toDateString()}
        onCalciteDaySelect={this.daySelect}
        onCalciteInternalDayHover={this.dayHover}
        range={!!this.startDate && !!this.endDate && !sameDate(this.startDate, this.endDate)}
        rangeHover={this.isRangeHover(date)}
        ref={(el: HTMLCalciteDatePickerDayElement) => {
          // when moving via keyboard, focus must be updated on active date
          if (ref && active && this.activeFocus) {
            el?.focus();
          }
        }}
        scale={this.scale}
        selected={this.isSelected(date)}
        startOfRange={this.isStartOfRange(date)}
        value={date}
      />
    );
  }

  private isFocusedOnStart(): boolean {
    return this.hoverRange?.focused === "start";
  }

  private isHoverInRange(): boolean {
    if (!this.hoverRange) {
      return false;
    }
    const { start, end } = this.hoverRange;
    return !!(
      (!this.isFocusedOnStart() && this.startDate && (!this.endDate || end < this.endDate)) ||
      (this.isFocusedOnStart() && this.startDate && start > this.startDate)
    );
  }

  private isRangeHover(date): boolean {
    if (!this.hoverRange) {
      return false;
    }
    const { start, end } = this.hoverRange;
    const isStart = this.isFocusedOnStart();
    const insideRange = this.isHoverInRange();
    const cond1 =
      insideRange &&
      ((!isStart && date > this.startDate && (date < end || sameDate(date, end))) ||
        (isStart && date < this.endDate && (date > start || sameDate(date, start))));
    const cond2 =
      !insideRange &&
      ((!isStart && date >= this.endDate && (date < end || sameDate(date, end))) ||
        (isStart &&
          (date < this.startDate || (this.endDate && sameDate(date, this.startDate))) &&
          (date > start || sameDate(date, start))));
    return cond1 || cond2;
  }
}
