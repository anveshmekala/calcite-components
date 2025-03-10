import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { renders, defaults, hidden } from "../../tests/commonTests";
import { TEXT } from "./resources";
import { html } from "../../../support/formatting";
import { skipAnimations } from "../../tests/utils";

describe("calcite-date-picker", () => {
  it("renders", async () => renders("calcite-date-picker", { display: "inline-block" }));

  it("honors hidden attribute", async () => hidden("calcite-date-picker"));

  it("has property defaults", async () =>
    defaults("calcite-date-picker", [
      {
        propertyName: "intlPrevMonth",
        defaultValue: TEXT.prevMonth
      },
      {
        propertyName: "headingLevel",
        defaultValue: undefined
      },
      {
        propertyName: "intlNextMonth",
        defaultValue: TEXT.nextMonth
      },
      {
        propertyName: "scale",
        defaultValue: "m"
      }
    ]));

  const animationDurationInMs = 200;

  it("fires a calciteDatePickerChange event when changing year in header", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-date-picker value='2000-11-27' active></calcite-date-picker>");
    const date = await page.find("calcite-date-picker");
    const changedEvent = await page.spyOnEvent("calciteDatePickerChange");

    await page.waitForTimeout(animationDurationInMs);
    // can't find this input as it's deeply nested in shadow dom, so just tab to it
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowUp");
    await page.waitForChanges();
    expect(changedEvent).toHaveReceivedEventTimes(0);
    const value = await date.getProperty("value");
    expect(value).toEqual("2000-11-27");
    await page.keyboard.press("ArrowDown");
    const value2 = await date.getProperty("value");
    expect(value2).toEqual("2000-11-27");
    expect(changedEvent).toHaveReceivedEventTimes(0);
  });

  it("updates the calendar immediately as a new year is typed but doesn't change the year", async () => {
    const page = await newE2EPage();
    await page.setContent(`<calcite-date-picker value="2015-02-28" active></calcite-date-picker>`);
    const datePicker = await page.find("calcite-date-picker");
    await page.waitForTimeout(animationDurationInMs);

    async function getActiveMonthDate(): Promise<string> {
      return page.$eval("calcite-date-picker", (datePicker: HTMLCalciteDatePickerElement) =>
        datePicker.shadowRoot.querySelector("calcite-date-picker-month").activeDate.toISOString()
      );
    }

    async function getActiveMonthHeaderInputValue(): Promise<string> {
      return page.$eval(
        "calcite-date-picker",
        (datePicker: HTMLCalciteDatePickerElement) =>
          (
            datePicker.shadowRoot
              .querySelector("calcite-date-picker-month-header")
              .shadowRoot.querySelector(".year") as HTMLInputElement
          ).value
      );
    }

    const activeDateBefore = await getActiveMonthDate();

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.down("Meta");
    await page.keyboard.press("a");
    expect(await getActiveMonthHeaderInputValue()).toBe("2015");
    await page.keyboard.press("Backspace");
    await page.keyboard.up("Meta");
    await page.keyboard.type("2016");
    expect(await getActiveMonthHeaderInputValue()).toBe("2016");
    await page.waitForChanges();

    const activeDateAfter = await getActiveMonthDate();

    expect(activeDateBefore).not.toEqual(activeDateAfter);
    expect(await datePicker.getProperty("value")).toBe("2015-02-28");
  });

  it("fires a calciteDatePickerChange event when day is selected", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-date-picker value='2000-11-27' active></calcite-date-picker>");
    const changedEvent = await page.spyOnEvent("calciteDatePickerChange");

    await page.waitForTimeout(animationDurationInMs);

    await selectFirstAvailableDay(page, "mouse");
    expect(changedEvent).toHaveReceivedEventTimes(1);

    await selectFirstAvailableDay(page, "keyboard");
    expect(changedEvent).toHaveReceivedEventTimes(2);
  });

  it("doesn't fire calciteDatePickerChange when the selected day is selected", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-date-picker value='2000-11-27' open></calcite-date-picker>");
    const changedEvent = await page.spyOnEvent("calciteDatePickerChange");

    await skipAnimations(page);

    await selectSelectedDay(page, "mouse");
    expect(changedEvent).toHaveReceivedEventTimes(0);
    await selectSelectedDay(page, "mouse");
    expect(changedEvent).toHaveReceivedEventTimes(0);
    await selectSelectedDay(page, "mouse");
    expect(changedEvent).toHaveReceivedEventTimes(0);

    await selectSelectedDay(page, "keyboard");
    expect(changedEvent).toHaveReceivedEventTimes(0);
    await selectSelectedDay(page, "keyboard");
    expect(changedEvent).toHaveReceivedEventTimes(0);
    await selectSelectedDay(page, "keyboard");
    expect(changedEvent).toHaveReceivedEventTimes(0);
  });

  async function selectFirstAvailableDay(page: E2EPage, method: "mouse" | "keyboard"): Promise<void> {
    await page.$eval(
      "calcite-date-picker",
      (datePicker: HTMLCalciteDatePickerElement, method: "mouse" | "keyboard") => {
        const day = datePicker.shadowRoot
          .querySelector<HTMLCalciteDatePickerMonthElement>("calcite-date-picker-month")
          .shadowRoot.querySelector<HTMLCalciteDatePickerDayElement>("calcite-date-picker-day:not([selected])");

        if (method === "mouse") {
          day.click();
        } else {
          day.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        }
      },
      method
    );
    await page.waitForChanges();
  }

  async function selectSelectedDay(page: E2EPage, method: "mouse" | "keyboard"): Promise<void> {
    await page.$eval(
      "calcite-date-picker",
      (datePicker: HTMLCalciteDatePickerElement, method: "mouse" | "keyboard") => {
        const day = datePicker.shadowRoot
          .querySelector<HTMLCalciteDatePickerMonthElement>("calcite-date-picker-month")
          .shadowRoot.querySelector<HTMLCalciteDatePickerDayElement>("calcite-date-picker-day[selected]");

        if (method === "mouse") {
          day.click();
        } else {
          day.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        }
      },
      method
    );
    await page.waitForChanges();
  }

  it("doesn't fire calciteDatePickerChange on outside changes to value", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-date-picker value='2000-11-27'></calcite-date-picker>");
    const date = await page.find("calcite-date-picker");
    const changedEvent = await page.spyOnEvent("calciteDatePickerChange");
    await date.setProperty("value", "2001-10-28");
    expect(changedEvent).toHaveReceivedEventTimes(0);
  });

  it("doesn't fire calciteDatePickerRangeChange on outside changes to start/end", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-date-picker range start='2000-11-27' start='2000-11-29'></calcite-date-picker>");
    const date = await page.find("calcite-date-picker");
    const changedEvent = await page.spyOnEvent("calciteDatePickerRangeChange");
    expect(changedEvent).toHaveReceivedEventTimes(0);
    await date.setProperty("start", "2001-10-28");
    expect(changedEvent).toHaveReceivedEventTimes(0);
  });

  it.skip("correctly changes date on next/prev", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-date-picker value='2000-11-27'></calcite-date-picker>");
    const getMonth = () => {
      return document
        .querySelector("calcite-date-picker")
        .shadowRoot.querySelector("calcite-date-picker-month-header")
        .shadowRoot.querySelector(".month").textContent;
    };
    expect(await page.evaluate(getMonth)).toEqualText("November");
    // tab to prev arrow
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.waitForChanges();
    expect(await page.evaluate(getMonth)).toEqualText("October");
    // tab to next arrow
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.waitForChanges();
    expect(await page.evaluate(getMonth)).toEqualText("November");
  });

  it("fires calciteDatePickerRangeChange event on change", async () => {
    const page = await newE2EPage();
    await page.setContent(`<calcite-date-picker range start="2020-09-08" end="2020-09-23"></calcite-date-picker>`);
    await page.waitForChanges();
    const date = await page.find("calcite-date-picker");
    // have to wait for transition
    const changedEvent = await page.spyOnEvent("calciteDatePickerRangeChange");
    await new Promise((res) => global.setTimeout(() => res(true), 200));
    expect(changedEvent).toHaveReceivedEventTimes(0);
    const start1 = await date.getProperty("start");
    const end1 = await date.getProperty("end");
    expect(start1).toEqual("2020-09-08");
    expect(end1).toEqual("2020-09-23");
    await page.keyboard.press("Tab");
    await page.waitForChanges();
    await page.keyboard.press("Tab");
    await page.waitForChanges();
    await page.keyboard.press("Tab");
    await page.waitForChanges();
    await page.keyboard.press("Tab");
    await page.waitForChanges();
    await page.keyboard.press("ArrowRight");
    await page.waitForChanges();
    await page.keyboard.press("Space");
    await page.waitForChanges();
    expect(changedEvent).toHaveReceivedEventTimes(1);
  });

  describe("when the locale is set to Slovak calendar", () => {
    it("should start the week on Monday", async () => {
      const page = await newE2EPage({
        html: `<calcite-date-picker scale="m" lang="sk" value="2000-11-27"></calcite-date-picker>`
      });
      await page.waitForChanges();
      const text: string = await page.evaluate(
        () =>
          document
            .querySelector("calcite-date-picker")
            .shadowRoot.querySelector("calcite-date-picker-month")
            .shadowRoot.querySelector(".week-header").textContent
      );

      expect(text).toEqual("po");
    });
  });

  it("updates internally when min attribute is updated after initialization", async () => {
    const page = await newE2EPage();
    await page.emulateTimezone("America/Los_Angeles");
    await page.setContent(
      html`<calcite-date-picker value="2022-11-27" min="2022-11-15" max="2024-11-15"></calcite-date-picker>`
    );

    const element = await page.find("calcite-date-picker");
    element.setProperty("min", "2021-11-15");
    element.setProperty("max", "2023-11-15");
    await page.waitForChanges();
    const minDateString = "Mon Nov 15 2021 00:00:00 GMT-0800 (Pacific Standard Time)";
    const minDateAsTime = await page.$eval("calcite-date-picker", (picker: HTMLCalciteDatePickerElement) =>
      picker.minAsDate.getTime()
    );
    expect(minDateAsTime).toEqual(new Date(minDateString).getTime());
  });

  it("passes down the default intlYear prop to child date-picker-month-header", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-date-picker value="2000-11-27" active></calcite-date-picker>`);
    const date = await page.find(`calcite-date-picker >>> calcite-date-picker-month-header`);

    expect(await date.getProperty("intlYear")).toEqual("Year");
  });
});
