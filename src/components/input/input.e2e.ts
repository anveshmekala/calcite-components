import { E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  defaults,
  disabled,
  focusable,
  formAssociated,
  labelable,
  reflects,
  renders,
  hidden
} from "../../tests/commonTests";
import { html } from "../../../support/formatting";
import { letterKeys, numberKeys } from "../../utils/key";
import { locales, numberStringFormatter } from "../../utils/locale";
import { getElementXY } from "../../tests/utils";
import { KeyInput } from "puppeteer";
import { TEXT } from "./resources";

describe("calcite-input", () => {
  const delayFor2UpdatesInMs = 200;

  /**
   * This helper wraps number typing to work around test instability
   *
   * @param page
   * @param numberAsText
   */
  async function typeNumberValue(page: E2EPage, numberAsText: string): Promise<void> {
    await page.keyboard.type(numberAsText, numberAsText.length > 1 ? { delay: 100 } : undefined);
  }

  it("is labelable", async () => labelable("calcite-input"));

  it("renders", () => renders("calcite-input", { display: "block" }));

  it("honors hidden attribute", async () => hidden("calcite-input"));

  it("reflects", async () =>
    reflects("calcite-input", [
      {
        propertyName: "status",
        value: "valid"
      },
      {
        propertyName: "alignment",
        value: "center"
      },
      {
        propertyName: "numberButtonType",
        value: "horizontal"
      },
      {
        propertyName: "type",
        value: "color"
      },
      {
        propertyName: "scale",
        value: "s"
      }
    ]));

  it("has defaults", async () =>
    defaults("calcite-input", [
      {
        propertyName: "status",
        defaultValue: "idle"
      },
      {
        propertyName: "alignment",
        defaultValue: "start"
      },
      {
        propertyName: "numberButtonType",
        defaultValue: "vertical"
      },
      {
        propertyName: "type",
        defaultValue: "text"
      },
      {
        propertyName: "scale",
        defaultValue: "m"
      },
      {
        propertyName: "value",
        defaultValue: ""
      }
    ]));

  it("can be disabled", () => disabled("calcite-input"));

  it("spinner buttons on disabled number input should not be interactive/should not nudge the number", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number" disabled></calcite-input>`);

    const numberButtonItem = await page.find("calcite-input >>> .number-button-item");
    const calciteInputInput = await page.spyOnEvent("calciteInputInput");

    await numberButtonItem.click();
    await page.waitForChanges();
    expect(calciteInputInput).not.toHaveReceivedEvent();
  });

  it("inherits requested props when from wrapping calcite-label when props are provided", async () => {
    const page = await newE2EPage();
    await page.setContent(html`
      <calcite-label status="invalid" scale="s">
        Label text
        <calcite-input></calcite-input>
      </calcite-label>
    `);

    const deprecatedLabelStatusElement = await page.find("calcite-input");
    expect(await deprecatedLabelStatusElement.getProperty("status")).toEqual("invalid");
    expect(await deprecatedLabelStatusElement.getProperty("scale")).toEqual("s");
  });

  it("renders an icon when explicit Calcite UI is requested, and is a type without a default icon", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input icon="key" type="number"></calcite-input>`);

    const icon = await page.find("calcite-input >>> .icon");
    expect(icon).not.toBeNull();
  });

  it("renders an icon when explicit Calcite UI is requested, and is a type with a default icon", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input icon="key" type="date"></calcite-input>`);

    const icon = await page.find("calcite-input >>> .icon");
    expect(icon).not.toBeNull();
  });

  it("renders an icon when requested without an explicit Calcite UI, and is a type with a default icon", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input icon type="date"></calcite-input>`);

    const icon = await page.find("calcite-input >>> .icon");
    expect(icon).not.toBeNull();
  });

  it("does not render an icon when requested without an explicit Calcite UI, and is a type without a default icon", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input icon type="number"></calcite-input>`);

    const icon = await page.find("calcite-input >>> .icon");
    expect(icon).toBeNull();
  });

  it("renders number buttons in default vertical alignment when type=number", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number"></calcite-input>`);

    const numberVerticalWrapper = await page.find("calcite-input >>> .number-button-wrapper");
    const numberHorizontalItemDown = await page.find(
      "calcite-input >>> .number-button-item--horizontal[data-adjustment='down']"
    );
    const numberHorizontalItemUp = await page.find(
      "calcite-input >>> .number-button-item--horizontal[data-adjustment='up']"
    );

    expect(numberVerticalWrapper).not.toBeNull();
    expect(numberHorizontalItemDown).toBeNull();
    expect(numberHorizontalItemUp).toBeNull();
  });

  it("renders number buttons in horizontal vertical alignment when type=number and number button type is horizontal", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number" number-button-type="horizontal"></calcite-input>`);

    const numberVerticalWrapper = await page.find("calcite-input >>> .number-button-wrapper");
    const numberHorizontalItemDown = await page.find(
      "calcite-input >>> .number-button-item--horizontal[data-adjustment='down']"
    );
    const numberHorizontalItemUp = await page.find(
      "calcite-input >>> .number-button-item--horizontal[data-adjustment='up']"
    );

    expect(numberVerticalWrapper).toBeNull();
    expect(numberHorizontalItemDown).not.toBeNull();
    expect(numberHorizontalItemUp).not.toBeNull();
  });

  it("does not render number buttons in default vertical alignment when type=number and read-only", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number" read-only></calcite-input>`);

    const numberVerticalWrapper = await page.find("calcite-input >>> .number-button-wrapper");

    expect(numberVerticalWrapper).toBeNull();
  });

  it("does not render number buttons in horizontal alignment when type=number, number button type is horizontal, and read-only", async () => {
    const page = await newE2EPage();
    await page.setContent(
      html`<calcite-input type="number" number-button-type="horizontal" read-only></calcite-input>`
    );

    const numberHorizontalItemDown = await page.find(
      "calcite-input >>> .number-button-item--horizontal[data-adjustment='down']"
    );
    const numberHorizontalItemUp = await page.find(
      "calcite-input >>> .number-button-item--horizontal[data-adjustment='up']"
    );

    expect(numberHorizontalItemDown).toBeNull();
    expect(numberHorizontalItemUp).toBeNull();
  });

  it("renders no buttons in type=number and number button type is none", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number" number-button-type="none"></calcite-input>`);

    const numberVerticalWrapper = await page.find("calcite-input >>> .number-button-wrapper");
    const numberHorizontalItemDown = await page.find(
      "calcite-input >>> .number-button-item--horizontal[data-adjustment='down']"
    );
    const numberHorizontalItemUp = await page.find(
      "calcite-input >>> .number-button-item--horizontal[data-adjustment='up']"
    );

    expect(numberVerticalWrapper).toBeNull();
    expect(numberHorizontalItemDown).toBeNull();
    expect(numberHorizontalItemUp).toBeNull();
  });

  it("is focusable", async () =>
    focusable(`calcite-input`, {
      shadowFocusTargetSelector: "input"
    }));

  describe("input type number increment/decrement functionality", () => {
    let page: E2EPage;
    beforeEach(async () => {
      page = await newE2EPage();
    });

    it("correctly increments and decrements decimal value when number buttons are clicked and the step precision matches the precision of the initial value", async () => {
      await page.setContent(html`<calcite-input type="number" value="3.123" step="0.001"></calcite-input>`);

      const element = await page.find("calcite-input");
      const numberHorizontalItemDown = await page.find("calcite-input >>> .number-button-item[data-adjustment='down']");
      const numberHorizontalItemUp = await page.find("calcite-input >>> .number-button-item[data-adjustment='up']");
      expect(await element.getProperty("value")).toBe("3.123");
      await numberHorizontalItemDown.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("3.122");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("3.123");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("3.124");
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      expect(await element.getProperty("value")).toBe("3.134");
    });

    it("correctly increments and decrements initial decimal value by 1 when number buttons are clicked and step is set to default of 1.", async () => {
      await page.setContent(html`<calcite-input type="number" value="3.123"></calcite-input>`);

      const element = await page.find("calcite-input");
      const numberHorizontalItemDown = await page.find("calcite-input >>> .number-button-item[data-adjustment='down']");
      const numberHorizontalItemUp = await page.find("calcite-input >>> .number-button-item[data-adjustment='up']");
      expect(await element.getProperty("value")).toBe("3.123");
      await numberHorizontalItemDown.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("2.123");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("3.123");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("4.123");
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      await numberHorizontalItemUp.click();
      expect(await element.getProperty("value")).toBe("14.123");
    });

    it("correctly increments and decrements value when number buttons are clicked and step is set to an integer", async () => {
      await page.setContent(html`<calcite-input type="number" step="10" value="15"></calcite-input>`);

      const element = await page.find("calcite-input");

      const numberHorizontalItemDown = await page.find("calcite-input >>> .number-button-item[data-adjustment='down']");
      const numberHorizontalItemUp = await page.find("calcite-input >>> .number-button-item[data-adjustment='up']");

      await numberHorizontalItemDown.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("5");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("15");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("25");
    });

    it.skip("correctly increments and decrements on long hold on mousedown and step is set to a decimal", async () => {
      await page.setContent(html`<calcite-input type="number" value="0" step="0.01"></calcite-input>`);
      const input = await page.find("calcite-input");
      const [buttonUpLocationX, buttonUpLocationY] = await getElementXY(
        page,
        "calcite-input",
        ".number-button-item[data-adjustment='up']"
      );

      const inputEventSpy = await input.spyOnEvent("calciteInputInput");
      await page.mouse.move(buttonUpLocationX, buttonUpLocationY);
      await page.mouse.down();
      await page.waitForTimeout(delayFor2UpdatesInMs);
      await page.mouse.up();
      await page.waitForChanges();
      const totalNudgesUp = inputEventSpy.length;
      expect(await input.getProperty("value")).toBe(`0.0${totalNudgesUp}`);

      const [buttonDownLocationX, buttonDownLocationY] = await getElementXY(
        page,
        "calcite-input",
        ".number-button-item[data-adjustment='down']"
      );

      await page.mouse.move(buttonDownLocationX, buttonDownLocationY);
      await page.mouse.down();
      await page.waitForTimeout(delayFor2UpdatesInMs);
      await page.mouse.up();
      await page.waitForChanges();
      const totalNudgesDown = inputEventSpy.length - totalNudgesUp;
      const finalNudgedValue = totalNudgesUp - totalNudgesDown;
      expect(await input.getProperty("value")).toBe(finalNudgedValue === 0 ? "0" : `0.0${finalNudgedValue}`);
    });

    it("correctly increments and decrements value by one when any is set for step", async () => {
      await page.setContent(html`<calcite-input type="number" step="any" value="5.5"></calcite-input>`);

      const element = await page.find("calcite-input");

      const numberHorizontalItemDown = await page.find("calcite-input >>> .number-button-item[data-adjustment='down']");
      const numberHorizontalItemUp = await page.find("calcite-input >>> .number-button-item[data-adjustment='up']");

      await numberHorizontalItemDown.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("4.5");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("5.5");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("6.5");
    });

    it("correctly increments and decrements value by one when step is undefined", async () => {
      await page.setContent(html`<calcite-input type="number" value="5"></calcite-input>`);

      const element = await page.find("calcite-input");

      const numberHorizontalItemDown = await page.find("calcite-input >>> .number-button-item[data-adjustment='down']");
      const numberHorizontalItemUp = await page.find("calcite-input >>> .number-button-item[data-adjustment='up']");

      await numberHorizontalItemDown.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("4");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("5");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("6");
    });

    it("correctly stops decrementing value when min is set", async () => {
      await page.setContent(html`<calcite-input type="number" min="10" value="11"></calcite-input>`);

      const element = await page.find("calcite-input");
      const numberHorizontalItemDown = await page.find("calcite-input >>> .number-button-item[data-adjustment='down']");

      await numberHorizontalItemDown.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("10");
      await numberHorizontalItemDown.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("10");
    });

    it("correctly stops incrementing value when max is set", async () => {
      await page.setContent(html`<calcite-input type="number" max="10" value="9"></calcite-input>`);

      const element = await page.find("calcite-input");
      const numberHorizontalItemUp = await page.find("calcite-input >>> .number-button-item[data-adjustment='up']");

      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("10");
      await numberHorizontalItemUp.click();
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("10");
    });

    it("should emit event when up or down clicked on input", async () => {
      await page.setContent(html`<calcite-input type="number" max="0" value="-2"></calcite-input>`);

      const calciteInputInput = await page.spyOnEvent("calciteInputInput");

      const numberHorizontalItemUp = await page.find("calcite-input >>> .number-button-item[data-adjustment='up']");
      expect(calciteInputInput).toHaveReceivedEventTimes(0);
      await numberHorizontalItemUp.click();
      await page.waitForChanges();

      expect(calciteInputInput).toHaveReceivedEventTimes(1);

      const numberHorizontalItemDown = await page.find("calcite-input >>> .number-button-item[data-adjustment='down']");
      await numberHorizontalItemDown.click();
      await page.waitForChanges();
      expect(calciteInputInput).toHaveReceivedEventTimes(2);

      await numberHorizontalItemDown.click();
      await page.waitForChanges();
      expect(calciteInputInput).toHaveReceivedEventTimes(3);
    });

    it("on input type number, should emit an event on an interval when ArrowUp/ArrowDown keys are down and stop on key up", async () => {
      await page.setContent(html`<calcite-input type="number" value="0"></calcite-input>`);
      const calciteInputInput = await page.spyOnEvent("calciteInputInput");
      const input = await page.find("calcite-input");
      expect(calciteInputInput).toHaveReceivedEventTimes(0);
      await input.callMethod("setFocus");

      await page.keyboard.down("ArrowUp");
      await page.waitForTimeout(delayFor2UpdatesInMs);
      await page.waitForEvent("calciteInputInput");
      await page.keyboard.up("ArrowUp");
      await page.waitForChanges();

      const totalNudgesUp = calciteInputInput.length;
      expect(await input.getProperty("value")).toBe(`${totalNudgesUp}`);

      await page.keyboard.down("ArrowDown");
      await page.waitForTimeout(delayFor2UpdatesInMs);
      await page.keyboard.up("ArrowDown");
      await page.waitForChanges();

      const totalNudgesDown = calciteInputInput.length - totalNudgesUp;
      const finalNudgedValue = totalNudgesUp - totalNudgesDown;
      expect(await input.getProperty("value")).toBe(`${finalNudgedValue}`);
    });

    it("should emit an event on an interval when up/down buttons are down and stop on mouseup/mouseleave", async () => {
      await page.setContent(html`<calcite-input type="number" value="0"></calcite-input>`);
      const input = await page.find("calcite-input");
      const calciteInputInput = await page.spyOnEvent("calciteInputInput");
      const [buttonUpLocationX, buttonUpLocationY] = await getElementXY(
        page,
        "calcite-input",
        ".number-button-item[data-adjustment='up']"
      );
      expect(calciteInputInput).toHaveReceivedEventTimes(0);
      await page.mouse.move(buttonUpLocationX, buttonUpLocationY);
      await page.mouse.down();
      await page.waitForTimeout(delayFor2UpdatesInMs);
      await page.mouse.up();
      await page.waitForChanges();
      let totalNudgesUp = calciteInputInput.length;
      expect(await input.getProperty("value")).toBe(`${totalNudgesUp}`);

      await page.mouse.down();
      await page.waitForTimeout(delayFor2UpdatesInMs);
      await page.mouse.move(buttonUpLocationX - 1, buttonUpLocationY - 1);

      totalNudgesUp = calciteInputInput.length;
      expect(await input.getProperty("value")).toBe(`${totalNudgesUp}`);

      // assert changes no longer emitted after moving away from stepper
      await page.waitForTimeout(delayFor2UpdatesInMs);
      expect(await input.getProperty("value")).toBe(`${totalNudgesUp}`);
      await page.mouse.up(); // mouseleave assertion done, we release

      const [buttonDownLocationX, buttonDownLocationY] = await getElementXY(
        page,
        "calcite-input",
        ".number-button-item[data-adjustment='down']"
      );

      await page.mouse.move(buttonDownLocationX, buttonDownLocationY);
      await page.mouse.down();
      await page.waitForTimeout(delayFor2UpdatesInMs);
      await page.mouse.up();
      await page.waitForChanges();

      let totalNudgesDown = calciteInputInput.length - totalNudgesUp;
      let finalNudgedValue = totalNudgesUp - totalNudgesDown;
      expect(await input.getProperty("value")).toBe(`${finalNudgedValue}`);

      await page.mouse.down();
      await page.waitForTimeout(delayFor2UpdatesInMs);
      await page.mouse.move(buttonDownLocationX - 1, buttonDownLocationY - 1);

      totalNudgesDown = calciteInputInput.length - totalNudgesUp;
      finalNudgedValue = totalNudgesUp - totalNudgesDown;
      expect(await input.getProperty("value")).toBe(`${finalNudgedValue}`);

      // assert changes no longer emitted after moving away from stepper
      await page.waitForTimeout(delayFor2UpdatesInMs);
      expect(await input.getProperty("value")).toBe(`${finalNudgedValue}`);
    });

    it.skip("on input type number, when both 'ArrowUp' and 'ArrowDown' are pressed at the same time most recently pressed key takes over", async () => {
      await page.setContent(html`<calcite-input type="number" value="0"></calcite-input>`);
      const element = await page.find("calcite-input");
      await element.callMethod("setFocus");

      const arrowUpDown = page.keyboard.down("ArrowUp");
      const arrowDownDown = page.keyboard.down("ArrowDown");
      await Promise.all([arrowUpDown, arrowDownDown]);
      await page.waitForTimeout(delayFor2UpdatesInMs);
      expect(await element.getProperty("value")).toBe("-1");
    });

    it("on input type number, should emit event only twice when toggled fast between up/down arrows", async () => {
      await page.setContent(html`<calcite-input type="number" value="0"></calcite-input>`);
      const calciteInputInput = await page.spyOnEvent("calciteInputInput");
      const element = await page.find("calcite-input");
      await element.callMethod("setFocus");

      const arrowUpDown = page.keyboard.down("ArrowUp");
      const arrowUpUp = page.keyboard.up("ArrowUp");
      const arrowDownDown = page.keyboard.down("ArrowDown");
      const arrowDownUp = page.keyboard.up("ArrowDown");
      await Promise.all([arrowUpDown, arrowUpUp, arrowDownDown, arrowDownUp]);
      await page.waitForChanges();
      expect(calciteInputInput).toHaveReceivedEventTimes(2);
    });

    it("up/down arrow keys increments and decrements correctly when the step is a decimal", async () => {
      await page.setContent(html`<calcite-input step="0.1" type="number"></calcite-input> `);
      const input = await page.find("calcite-input");
      await input.callMethod("setFocus");
      await page.keyboard.press("ArrowUp");
      await page.waitForChanges();

      expect(await input.getProperty("value")).toBe("0.1");

      await page.keyboard.press("ArrowUp");
      await page.waitForChanges();

      expect(await input.getProperty("value")).toBe("0.2");

      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();

      expect(await input.getProperty("value")).toBe("0.1");

      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();

      expect(await input.getProperty("value")).toBe("0");
    });

    it("up/down arrow keys increments and decrements correctly when the step is an integer and the value is a decimal", async () => {
      await page.setContent(html`<calcite-input step="5" type="number" value="1.008"></calcite-input>`);
      const input = await page.find("calcite-input");
      await input.callMethod("setFocus");

      await page.keyboard.press("ArrowUp");
      await page.waitForChanges();
      expect(await input.getProperty("value")).toBe("6.008");

      await page.keyboard.press("ArrowUp");
      await page.waitForChanges();
      expect(await input.getProperty("value")).toBe("11.008");

      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();
      expect(await input.getProperty("value")).toBe("6.008");

      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();
      expect(await input.getProperty("value")).toBe("1.008");
    });
  });

  describe("direct changes to the value", () => {
    let page: E2EPage;
    beforeEach(async () => {
      page = await newE2EPage();
    });

    it("incrementing correctly updates the value after focus and blur events", async () => {
      await page.setContent(html`<calcite-input type="number" value="1"></calcite-input>`);
      const element = await page.find("calcite-input");
      await element.click();
      await page.waitForChanges;
      await element.callMethod("blur");
      await page.waitForChanges;
      element.setProperty("value", "2");
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("2");
      const input = await page.find("calcite-input >>> input");
      expect(await input.getProperty("value")).toBe("2");
    });

    it("does not fire any input or change events when a focused input is blurred after its value is set directly", async () => {
      const page = await newE2EPage({ html: "<calcite-input></calcite-input>" });
      const input = await page.find("calcite-input");
      const inputEventSpy = await input.spyOnEvent("calciteInputInput");
      const changeEventSpy = await input.spyOnEvent("calciteInputChange");

      expect(inputEventSpy).not.toHaveReceivedEvent();
      expect(changeEventSpy).not.toHaveReceivedEvent();

      await input.callMethod("setFocus");
      await input.setProperty("value", "not a random value");
      await page.keyboard.press("Tab");
      await page.waitForChanges();

      expect(inputEventSpy).not.toHaveReceivedEvent();
      expect(changeEventSpy).not.toHaveReceivedEvent();
    });
  });

  describe("emits events when value is modified", () => {
    type CodeBranchingTypes = Extract<HTMLCalciteInputElement["type"], "text" | "number">;

    async function assertChangeEvents(type: CodeBranchingTypes): Promise<void> {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="${type}"></calcite-input>`);

      const element = await page.find("calcite-input");
      const calciteInputInput = await element.spyOnEvent("calciteInputInput");
      const calciteInputChange = await element.spyOnEvent("calciteInputChange");

      const inputFirstPart = "12345";
      await element.callMethod("setFocus");
      await typeNumberValue(page, inputFirstPart);
      expect(await element.getProperty("value")).toBe(inputFirstPart);
      expect(calciteInputInput).toHaveReceivedEventTimes(5);
      expect(calciteInputChange).toHaveReceivedEventTimes(0);

      await element.callMethod("setFocus");
      await page.keyboard.press("Enter");
      expect(calciteInputInput).toHaveReceivedEventTimes(5);
      expect(calciteInputChange).toHaveReceivedEventTimes(1);

      await element.callMethod("setFocus");
      await page.keyboard.press("Enter");
      expect(calciteInputInput).toHaveReceivedEventTimes(5);
      expect(calciteInputChange).toHaveReceivedEventTimes(1);

      const textSecondPart = "67890";
      await element.callMethod("setFocus");
      await typeNumberValue(page, textSecondPart);
      expect(calciteInputInput).toHaveReceivedEventTimes(10);
      expect(calciteInputChange).toHaveReceivedEventTimes(1);

      await element.callMethod("setFocus");
      await page.keyboard.press("Tab");
      expect(calciteInputInput).toHaveReceivedEventTimes(10);
      expect(calciteInputChange).toHaveReceivedEventTimes(2);
      expect(await element.getProperty("value")).toBe(`${inputFirstPart}${textSecondPart}`);

      await element.callMethod("setFocus");
      await page.keyboard.press("Tab");
      expect(calciteInputInput).toHaveReceivedEventTimes(10);
      expect(calciteInputChange).toHaveReceivedEventTimes(2);
      expect(await element.getProperty("value")).toBe(`${inputFirstPart}${textSecondPart}`);

      const programmaticSetValue = "1337";
      element.setProperty("value", programmaticSetValue);
      await page.waitForChanges();

      expect(await element.getProperty("value")).toBe(programmaticSetValue);
      expect(calciteInputInput).toHaveReceivedEventTimes(10);
      expect(calciteInputChange).toHaveReceivedEventTimes(2);
    }

    it("emits when type is text", () => assertChangeEvents("text"));

    it("emits when type is number", () => assertChangeEvents("number"));
  });

  it("renders clear button when clearable is requested and value is populated at load", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input clearable value="John Doe"></calcite-input>`);
    const clearButton = await page.find("calcite-input >>> .clear-button");
    expect(clearButton).not.toBe(null);
    expect(clearButton.getAttribute("aria-label")).toBe(TEXT.clear);
  });

  it("does not render clear button when clearable is requested and value is not populated", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input clearable></calcite-input>`);

    const clearButton = await page.find("calcite-input >>> .clear-button");
    expect(clearButton).toBe(null);
  });

  it("does not render clear button when clearable is not requested", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input></calcite-input>`);

    const clearButton = await page.find("calcite-input >>> .clear-button");
    expect(clearButton).toBe(null);
  });

  it("when clearable is requested, value is cleared on escape key press", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input clearable value="John Doe"></calcite-input>`);

    const element = await page.find("calcite-input");
    await element.callMethod("setFocus");
    await page.keyboard.press("Escape");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("");
  });

  it("when clearable is requested, value is cleared on clear button click", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input clearable value="John Doe"></calcite-input>`);

    const element = await page.find("calcite-input");
    const clearButton = await page.find("calcite-input >>> .clear-button");
    await clearButton.click();
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("");
  });

  it("when clearable is requested and clear button is clicked, event is received", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input clearable value="John Doe"></calcite-input>`);

    const calciteInputInput = await page.spyOnEvent("calciteInputInput");
    const element = await page.find("calcite-input");
    const clearButton = await page.find("calcite-input >>> .clear-button");

    await clearButton.click();
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("");
    expect(calciteInputInput).toHaveReceivedEventTimes(1);
  });

  it("when clearable is requested and input is cleared via escape key, event is received", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input clearable value="John Doe"></calcite-input>`);

    const calciteInputInput = await page.spyOnEvent("calciteInputInput");
    const element = await page.find("calcite-input");

    await element.callMethod("setFocus");
    expect(calciteInputInput).toHaveReceivedEventTimes(0);
    await page.keyboard.press("Escape");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("");
    expect(calciteInputInput).toHaveReceivedEventTimes(1);
  });

  it("when type is search and clear button is clicked, event is received", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="search" value="John Doe"></calcite-input>`);

    const calciteInputInput = await page.spyOnEvent("calciteInputInput");
    const element = await page.find("calcite-input");
    const clearButton = await page.find("calcite-input >>> .clear-button");

    expect(calciteInputInput).toHaveReceivedEventTimes(0);
    await clearButton.click();
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("");
    expect(calciteInputInput).toHaveReceivedEventTimes(1);
  });

  it("when type is search and input is cleared via escape key, event is received", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="search" value="John Doe"></calcite-input>`);

    const calciteInputInput = await page.spyOnEvent("calciteInputInput");
    const element = await page.find("calcite-input");

    await element.callMethod("setFocus");
    expect(calciteInputInput).toHaveReceivedEventTimes(0);
    await page.keyboard.press("Escape");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("");
    expect(calciteInputInput).toHaveReceivedEventTimes(1);
  });

  it("when clearable is not requested and input is cleared via escape key, event is not received", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input value="John Doe"></calcite-input>`);

    const calciteInputInput = await page.spyOnEvent("calciteInputInput");
    const element = await page.find("calcite-input");

    await element.callMethod("setFocus");
    expect(calciteInputInput).not.toHaveReceivedEvent();
    await page.keyboard.press("Escape");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("John Doe");
    expect(calciteInputInput).not.toHaveReceivedEvent();
  });

  it("allows restricting input length", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input min-length="2" max-length="3" value=""></calcite-input>`);

    const getInputValidity = async () =>
      page.$eval("calcite-input", (element: HTMLCalciteInputElement) => {
        const input = element.shadowRoot.querySelector("input");
        return input.validity.valid;
      });

    const input = await page.find("calcite-input");
    await input.callMethod("setFocus");

    await typeNumberValue(page, "1");

    expect(await getInputValidity()).toBe(false);

    await typeNumberValue(page, "2");

    expect(await getInputValidity()).toBe(true);

    await typeNumberValue(page, "3");

    expect(await getInputValidity()).toBe(true);

    await typeNumberValue(page, "4");

    expect(await getInputValidity()).toBe(true);
    expect(await input.getProperty("value")).toBe("123");
  });

  it(`allows clearing value for type=text`, async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input value="hello"></calcite-input>`);
    const input = await page.find("calcite-input");

    input.setProperty("value", null);
    await page.waitForChanges();

    expect(await input.getProperty("value")).toBe("");

    input.setProperty("value", undefined);
    await page.waitForChanges();

    expect(await input.getProperty("value")).toBe("");
  });

  it("number input value stays in sync when value property is controlled with javascript", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number"></calcite-input>`);
    const calciteInput = await page.find("calcite-input");
    const input = await page.find("calcite-input >>> input");

    await page.evaluate(() => {
      document.querySelector("calcite-input").addEventListener("calciteInputInput", (event: InputEvent): void => {
        const target = event.target as HTMLInputElement;
        target.value = "5";
      });
    });

    await calciteInput.click();
    await typeNumberValue(page, "1");
    await page.waitForChanges();

    expect(await calciteInput.getProperty("value")).toBe("5");
    expect(await input.getProperty("value")).toBe("5");

    await typeNumberValue(page, "2");
    await page.waitForChanges();

    expect(await calciteInput.getProperty("value")).toBe("5");
    expect(await input.getProperty("value")).toBe("5");
  });

  describe("number type", () => {
    it("doesn't round numbers larger than double-precision floating-point", async () => {
      const preciseNumber = "4.9999999999999999";
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number" value=${preciseNumber}></calcite-input>`);
      const element = await page.find("calcite-input");
      expect(await element.getProperty("value")).toBe(preciseNumber);
    });

    it("allows typing negative decimal values", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number"></calcite-input>`);

      const element = await page.find("calcite-input");
      await element.callMethod("setFocus");
      await page.waitForChanges();
      await typeNumberValue(page, "-");
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("");
      await typeNumberValue(page, "0.001");
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("-0.001");
    });

    it("allows exponential number format", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number"></calcite-input>`);

      const element = await page.find("calcite-input");
      await element.callMethod("setFocus");
      await page.waitForChanges();
      await typeNumberValue(page, "1.2e5");
      await page.waitForChanges();
      expect(Number(await element.getProperty("value"))).toBe(120000);

      await page.keyboard.press("ArrowLeft");
      await page.waitForChanges();
      await typeNumberValue(page, "-");
      await page.waitForChanges();
      expect(Number(await element.getProperty("value"))).toBe(0.000012);
    });

    it("sanitizes numbers when using exponential format", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number"></calcite-input>`);

      const element = await page.find("calcite-input");
      await element.callMethod("setFocus");
      await page.waitForChanges();
      await typeNumberValue(page, "------000005eeee00005----eee");
      await page.waitForChanges();
      expect(await element.getProperty("value")).toBe("-5e5");
      expect(Number(await element.getProperty("value"))).toBe(-500000);
    });

    it("increments correctly with exponential numbers", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number"></calcite-input>`);

      const element = await page.find("calcite-input");
      await element.callMethod("setFocus");
      await page.waitForChanges();
      await typeNumberValue(page, "2e-2");
      await page.waitForChanges();
      expect(Number(await element.getProperty("value"))).toBe(0.02);
      await page.waitForChanges();
      await page.keyboard.press("ArrowUp");
      await page.waitForChanges();
      expect(Number(await element.getProperty("value"))).toBe(1.02);
    });

    it("decrements correctly with exponential numbers", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number" step="5"></calcite-input>`);

      const element = await page.find("calcite-input");
      await element.callMethod("setFocus");
      await page.waitForChanges();
      await typeNumberValue(page, "2e2");
      await page.waitForChanges();
      expect(Number(await element.getProperty("value"))).toBe(200);
      await page.waitForChanges();
      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();
      expect(Number(await element.getProperty("value"))).toBe(195);
    });

    it("disallows typing any letter or number with shift modifier key down", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number"></calcite-input>`);
      const calciteInput = await page.find("calcite-input");
      const input = await page.find("calcite-input >>> input");
      await calciteInput.callMethod("setFocus");

      for (let i = 0; i < numberKeys.length; i++) {
        await page.keyboard.down("Shift");
        await page.keyboard.press(numberKeys[i] as KeyInput);
        await page.keyboard.up("Shift");
        expect(await calciteInput.getProperty("value")).toBeFalsy();
        expect(await input.getProperty("value")).toBeFalsy();
      }
      const nonELetterKeys = letterKeys.filter((key) => key !== "e");
      for (let i = 0; i < nonELetterKeys.length; i++) {
        await page.keyboard.down("Shift");
        await page.keyboard.press(nonELetterKeys[i] as KeyInput);
        await page.keyboard.up("Shift");
        expect(await calciteInput.getProperty("value")).toBeFalsy();
        expect(await input.getProperty("value")).toBeFalsy();
      }
    });

    it("allows shift tabbing", async () => {
      const page = await newE2EPage();
      await page.setContent(html`
        <calcite-input id="input1" label="one" type="number"></calcite-input>
        <calcite-input id="input2" label="two" type="number"></calcite-input>
      `);
      const calciteInput2 = await page.find("#input2");
      await calciteInput2.callMethod("setFocus");
      expect(await page.evaluate(() => document.activeElement.getAttribute("label"))).toEqual("two");
      await page.keyboard.down("Shift");
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement.getAttribute("label"))).toEqual("one");
    });

    it("typing zero and then a non-zero number sets and emits the non-zero number", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number"></calcite-input>`);
      const calciteInputInput = await page.spyOnEvent("calciteInputInput");
      const calciteInput = await page.find("calcite-input");

      await calciteInput.callMethod("setFocus");

      await page.keyboard.press("0");
      await page.waitForChanges();

      expect(await calciteInput.getProperty("value")).toBe("0");
      expect(calciteInputInput).toHaveReceivedEventTimes(1);

      await page.keyboard.press("1");
      await page.waitForChanges();

      expect(await calciteInput.getProperty("value")).toBe("1");
      expect(calciteInputInput).toHaveReceivedEventTimes(2);
    });

    it("allows any valid number", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number"></calcite-input>`);
      const input = await page.find("calcite-input");
      await input.callMethod("setFocus");
      await typeNumberValue(page, "1.005");
      await page.waitForChanges();

      expect(await input.getProperty("value")).toBe("1.005");
    });

    it("allows clearing value with an empty string", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-input type="number" value="1"></calcite-input>`);
      const input = await page.find("calcite-input");
      input.setProperty("value", "");
      await page.waitForChanges();
      expect(await input.getProperty("value")).toBe("");
    });
  });

  describe("number locale support", () => {
    // "nb" and "es-MX" locales skipped per: https://github.com/Esri/calcite-components/issues/2323
    const localesWithIssues = ["ar", "bs", "mk", "nb", "es-MX"];
    locales
      .filter((locale) => !localesWithIssues.includes(locale))
      .forEach((locale) => {
        it(`displays decimal separator on initial load for ${locale} locale`, async () => {
          const value = "1234.56";
          const page = await newE2EPage();
          await page.setContent(html`<calcite-input lang="${locale}" type="number" value="${value}"></calcite-input>`);
          const calciteInput = await page.find("calcite-input");
          const input = await page.find("calcite-input >>> input");

          numberStringFormatter.numberFormatOptions = {
            locale,
            numberingSystem: "latn",
            useGrouping: false
          };

          const localizedValue = numberStringFormatter.localize(value);

          expect(await calciteInput.getProperty("value")).toBe(value);
          expect(await input.getProperty("value")).toBe(localizedValue);
        });

        it(`displays group and decimal separator on initial load for ${locale} locale using opt-in prop`, async () => {
          const value = "1234.56";
          const page = await newE2EPage();
          await page.setContent(
            html`<calcite-input lang="${locale}" type="number" value="${value}" group-separator></calcite-input>`
          );
          const calciteInput = await page.find("calcite-input");
          const input = await page.find("calcite-input >>> input");

          numberStringFormatter.numberFormatOptions = {
            locale,
            numberingSystem: "latn",
            useGrouping: true
          };

          const localizedValue = numberStringFormatter.localize(value);

          expect(await calciteInput.getProperty("value")).toBe(value);
          expect(await input.getProperty("value")).toBe(localizedValue);
        });

        it(`allows typing valid decimal characters for ${locale} locale`, async () => {
          numberStringFormatter.numberFormatOptions = {
            locale,
            numberingSystem: "latn",
            useGrouping: false
          };

          const page = await newE2EPage();
          await page.setContent(html`<calcite-input lang="${locale}" type="number"></calcite-input>`);
          const calciteInput = await page.find("calcite-input");
          const input = await page.find("calcite-input >>> input");
          const unformattedValue = "1234.56";

          await page.keyboard.press("Tab");
          await typeNumberValue(page, "1234");
          await page.keyboard.sendCharacter(numberStringFormatter.decimal);
          await input.press("5");
          await input.press("6");

          numberStringFormatter.numberFormatOptions = {
            locale,
            numberingSystem: "latn",
            useGrouping: false
          };

          const localizedValue = numberStringFormatter.localize(unformattedValue);

          expect(await calciteInput.getProperty("value")).toBe(`1234.56`);
          expect(await input.getProperty("value")).toBe(localizedValue);
        });

        it(`displays correct formatted value when using exponential numbers for ${locale} locale`, async () => {
          numberStringFormatter.numberFormatOptions = {
            locale,
            numberingSystem: "latn",
            useGrouping: false
          };

          const page = await newE2EPage();
          await page.setContent(html`<calcite-input lang="${locale}" type="number"></calcite-input>`);

          const calciteInput = await page.find("calcite-input");
          const input = await page.find("calcite-input >>> input");

          await page.keyboard.press("Tab");
          await page.waitForChanges();
          await typeNumberValue(page, `1${numberStringFormatter.decimal}5e-6`);
          await page.waitForChanges();

          const localizedValue = numberStringFormatter.localize("1.5e-6");

          expect(await calciteInput.getProperty("value")).toBe(`1.5e-6`);
          expect(await input.getProperty("value")).toBe(localizedValue);
        });

        it(`displays correct formatted value when the value is changed programmatically for ${locale} locale`, async () => {
          const page = await newE2EPage();
          await page.setContent(
            html`<calcite-input lang="${locale}" type="number"></calcite-input><input id="external" />`
          );

          await page.evaluate(() => {
            const input = document.getElementById("external");
            const calciteInput = document.querySelector("calcite-input");
            input.addEventListener("input", (event: InputEvent): void => {
              const value = (event.target as HTMLInputElement).value;
              if (value.endsWith(".")) {
                return;
              }
              calciteInput.value = value;
            });
          });

          const assertedValue = "1234567.891011";
          const externalInput = await page.find("#external");
          const calciteInput = await page.find("calcite-input");
          const internalLocaleInput = await page.find("calcite-input >>> input");

          await externalInput.click();
          await typeNumberValue(page, assertedValue);
          await page.waitForChanges();

          numberStringFormatter.numberFormatOptions = {
            locale,
            numberingSystem: "latn",
            useGrouping: false
          };

          const localizedValue = numberStringFormatter.localize(assertedValue);

          expect(await calciteInput.getProperty("value")).toBe(assertedValue);
          expect(await internalLocaleInput.getProperty("value")).toBe(localizedValue);
        });
      });
  });

  it(`allows negative, decimal numbers for ar locale`, async () => {
    const value = "-0001.0001";
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input lang="ar" type="number"></calcite-input>`);
    const element = await page.find("calcite-input");
    await element.callMethod("setFocus");
    await typeNumberValue(page, value);
    await page.waitForChanges();
    await page.keyboard.press("Tab");
    expect(await element.getProperty("value")).toBe("-1.0001");
  });

  it(`Using the select method selects all text`, async () => {
    const value = "-98.76";
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number" value="123.45"></calcite-input>`);
    const element = await page.find("calcite-input");
    // overwrite initial value by selecting and typing
    await element.callMethod("selectText");
    await element.callMethod("setFocus");
    await typeNumberValue(page, value);
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe(value);
  });

  it(`allows clearing value for type=number`, async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number" value="1"></calcite-input>`);
    const input = await page.find("calcite-input");

    input.setProperty("value", null);
    await page.waitForChanges();

    expect(await input.getProperty("value")).toBe("");

    input.setProperty("value", undefined);
    await page.waitForChanges();

    expect(await input.getProperty("value")).toBe("");
  });

  it(`disallows setting text value when type=number`, async () => {
    const nonNumberValue = "i am a text value";
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number" value=${nonNumberValue}></calcite-input>`);
    const calciteInput = await page.find("calcite-input");
    const input = await page.find("calcite-input >>> input");

    expect(await calciteInput.getProperty("value")).toBe("");
    expect(await input.getProperty("value")).toBe("");

    const numberValue = "1234";
    calciteInput.setProperty("value", numberValue);
    await page.waitForChanges();

    expect(await calciteInput.getProperty("value")).toBe(numberValue);
    expect(await input.getProperty("value")).toBe(numberValue);

    calciteInput.setProperty("value", nonNumberValue);
    await page.waitForChanges();

    expect(await calciteInput.getProperty("value")).toBe(numberValue);
    expect(await input.getProperty("value")).toBe(numberValue);
  });

  it(`disallows pasting just text characters with no initial value`, async () => {
    const page = await newE2EPage();
    await page.setContent(
      html`<calcite-input type="number"></calcite-input><input id="copy" value="invalid number" />`
    );
    const calciteInput = await page.find("calcite-input");
    const input = await page.find("calcite-input >>> input");
    const copyInput = await page.find("#copy");

    expect(await calciteInput.getProperty("value")).toBe("");
    expect(await input.getProperty("value")).toBe("");

    await copyInput.focus();
    await page.keyboard.down("Meta");
    await page.keyboard.press("a");
    await page.keyboard.press("c");
    await page.keyboard.up("Meta");

    await calciteInput.callMethod("setFocus");
    await page.keyboard.down("Meta");
    await page.keyboard.press("v");
    await page.keyboard.up("Meta");

    expect(await calciteInput.getProperty("value")).toBe("");
    expect(await input.getProperty("value")).toBe("");
  });

  it(`disallows pasting just text characters with existing number value`, async () => {
    const initialValue = "1234.56";
    const page = await newE2EPage();
    await page.setContent(
      html`<calcite-input type="number" value="1234.56"></calcite-input><input id="copy" value="invalid number" />`
    );
    const calciteInput = await page.find("calcite-input");
    const input = await page.find("calcite-input >>> input");
    const copyInput = await page.find("#copy");

    expect(await calciteInput.getProperty("value")).toBe(initialValue);
    expect(await input.getProperty("value")).toBe(initialValue);

    await copyInput.focus();
    await page.keyboard.down("Meta");
    await page.keyboard.press("a");
    await page.keyboard.press("c");
    await page.keyboard.up("Meta");

    await calciteInput.callMethod("setFocus");
    await page.keyboard.down("Meta");
    await page.keyboard.press("v");
    await page.keyboard.up("Meta");

    expect(await calciteInput.getProperty("value")).toBe(initialValue);
    expect(await input.getProperty("value")).toBe(initialValue);
  });

  it(`disallows pasting just text characters with no initial value with group separator`, async () => {
    const page = await newE2EPage();
    await page.setContent(
      html`<calcite-input type="number" group-separator></calcite-input><input id="copy" value="invalid number" />`
    );
    const calciteInput = await page.find("calcite-input");
    const input = await page.find("calcite-input >>> input");
    const copyInput = await page.find("#copy");

    expect(await calciteInput.getProperty("value")).toBe("");
    expect(await input.getProperty("value")).toBe("");

    await copyInput.focus();
    await page.keyboard.down("Meta");
    await page.keyboard.press("a");
    await page.keyboard.press("c");
    await page.keyboard.up("Meta");

    await calciteInput.callMethod("setFocus");
    await page.keyboard.down("Meta");
    await page.keyboard.press("v");
    await page.keyboard.up("Meta");

    expect(await calciteInput.getProperty("value")).toBe("");
    expect(await input.getProperty("value")).toBe("");
  });

  it(`disallows pasting just text characters with existing number value with group separator`, async () => {
    const initialValue = "1234.56";
    const page = await newE2EPage();
    await page.setContent(
      html`<calcite-input type="number" value="1234.56" group-separator></calcite-input
        ><input id="copy" value="invalid number" />`
    );
    const calciteInput = await page.find("calcite-input");
    const input = await page.find("calcite-input >>> input");
    const copyInput = await page.find("#copy");

    numberStringFormatter.numberFormatOptions = {
      locale: "en-US",
      numberingSystem: "latn",
      useGrouping: true
    };

    expect(await calciteInput.getProperty("value")).toBe(initialValue);
    expect(await input.getProperty("value")).toBe(numberStringFormatter.localize(initialValue));

    await copyInput.focus();
    await page.keyboard.down("Meta");
    await page.keyboard.press("a");
    await page.keyboard.press("c");
    await page.keyboard.up("Meta");

    await calciteInput.callMethod("setFocus");
    await page.keyboard.down("Meta");
    await page.keyboard.press("v");
    await page.keyboard.up("Meta");

    expect(await calciteInput.getProperty("value")).toBe(initialValue);
    expect(await input.getProperty("value")).toBe(numberStringFormatter.localize(initialValue));
  });

  it("cannot be modified when readOnly is true", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input read-only value="John Doe" clearable></calcite-input>`);

    const calciteInputInput = await page.spyOnEvent("calciteInputInput");
    const element = await page.find("calcite-input");
    expect(await element.getProperty("value")).toBe("John Doe");
    await element.callMethod("setFocus");

    await page.keyboard.press("a");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("John Doe");

    await page.keyboard.press("Escape");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("John Doe");
    expect(calciteInputInput).toHaveReceivedEventTimes(0);
  });

  it("number cannot be modified when readOnly is true", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="number" read-only value="5"></calcite-input>`);

    const calciteInputInput = await page.spyOnEvent("calciteInputInput");
    const element = await page.find("calcite-input");
    expect(await element.getProperty("value")).toBe("5");
    await element.callMethod("setFocus");

    await page.keyboard.press("ArrowUp");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("5");

    await page.keyboard.press("Escape");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("5");
    expect(calciteInputInput).toHaveReceivedEventTimes(0);
  });

  it("sets internals to readOnly or disabled when readOnly is true", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input read-only></calcite-input>`);

    const inputs = await page.findAll("calcite-input >>> input");

    for (const input of inputs) {
      expect(await input.getProperty("readOnly")).toBe(true);
    }

    const buttons = await page.findAll("calcite-input button");

    for (const button of buttons) {
      expect(await button.getProperty("disabled")).toBe(true);
    }
  });

  it("sets internals to multiple when the attribute is used", async () => {
    const page = await newE2EPage();
    await page.setContent(html`<calcite-input type="file" multiple></calcite-input>`);
    const input = await page.find("calcite-input >>> input");
    expect(await input.getProperty("multiple")).toBe(true);
  });

  it("input event fires when number ends with a decimal", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <calcite-input type="number" value="1.2"></calcite-input>
    `);

    const calciteInputInput = await page.spyOnEvent("calciteInputInput");
    const element = await page.find("calcite-input");
    expect(await element.getProperty("value")).toBe("1.2");
    await element.callMethod("setFocus");

    await page.keyboard.press("Backspace");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("1");
    expect(calciteInputInput).toHaveReceivedEventTimes(1);
  });

  it("sanitize leading zeros from number input value", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <calcite-input type="number"></calcite-input>
    `);

    const element = await page.find("calcite-input");
    await element.callMethod("setFocus");
    await typeNumberValue(page, "0000000");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("0");

    await typeNumberValue(page, "1");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("1");

    await typeNumberValue(page, "0000000");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("10000000");
  });

  it("sanitize extra dashes from number input value", async () => {
    const page = await newE2EPage();
    await page.setContent(`<calcite-input type="number"></calcite-input>`);

    const element = await page.find("calcite-input");
    await element.callMethod("setFocus");

    await typeNumberValue(page, "1--2---3");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("123");

    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await typeNumberValue(page, "----");
    await page.waitForChanges();
    expect(await element.getProperty("value")).toBe("-123");
  });

  describe("ArrowUp/ArrowDown function of moving caret to the beginning/end of text within calcite-input", () => {
    let page: E2EPage;

    const determineCaretIndex = (
      nestedInputTypeSelector: "textarea" | "input",
      position?: number
    ): Promise<boolean> => {
      return page.evaluate(
        (nestedInputTypeSelector, position) => {
          const element = document.querySelector("calcite-input") as HTMLCalciteInputElement;
          const el = element.shadowRoot.querySelector(nestedInputTypeSelector);
          return el.selectionStart === (position !== undefined ? position : el.value.length);
        },
        nestedInputTypeSelector,
        position
      );
    };

    beforeEach(async () => {
      page = await newE2EPage();
    });

    it("works for type textarea", async () => {
      await page.setContent(`<calcite-input type="textarea"></calcite-input>`);
      const element = await page.find("calcite-input");

      await element.callMethod("setFocus");
      await page.keyboard.type("test");
      await page.waitForChanges();

      await page.keyboard.press("ArrowUp");
      await page.waitForChanges();

      expect(await determineCaretIndex("textarea", 0)).toBeTruthy();

      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();

      expect(await determineCaretIndex("textarea")).toBeTruthy();
    });

    it("works for type text", async () => {
      await page.setContent(`<calcite-input type="text"></calcite-input>`);
      const element = await page.find("calcite-input");

      await element.callMethod("setFocus");
      await page.keyboard.type("test");
      await page.waitForChanges();

      await page.keyboard.press("ArrowUp");
      await page.waitForChanges();

      expect(await determineCaretIndex("input", 0)).toBeTruthy();

      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();

      expect(await determineCaretIndex("input")).toBeTruthy();
    });

    it("should not work for type number, but increment instead", async () => {
      await page.setContent(`<calcite-input type="number"></calcite-input>`);
      const element = await page.find("calcite-input");

      await element.callMethod("setFocus");
      await page.keyboard.type("12345");
      await page.waitForChanges();

      await page.keyboard.press("ArrowUp");
      await page.waitForChanges();

      expect(await determineCaretIndex("input")).toBeTruthy();
      expect(await element.getProperty("value")).toBe("12346");

      await page.keyboard.press("ArrowDown");
      await page.waitForChanges();

      expect(await determineCaretIndex("input")).toBeTruthy();
      expect(await element.getProperty("value")).toBe("12345");
    });

    it("does not jump to the beginning of input while incrementing on ArrowUp held down on input type number", async () => {
      await page.setContent(html`<calcite-input type="number" value="0"></calcite-input>`);
      let cursorHomeCount = 0;

      await page.keyboard.down("ArrowUp");
      await page.$eval(
        "calcite-input",
        (element: HTMLInputElement) => {
          document.addEventListener("calciteInputInput", async () => {
            const input = element.shadowRoot.querySelector("input");
            if (input.selectionStart === 0) {
              cursorHomeCount++;
            }
          });
        },
        cursorHomeCount
      );
      await page.waitForTimeout(delayFor2UpdatesInMs);

      await page.keyboard.up("ArrowUp");
      await page.waitForChanges();

      expect(cursorHomeCount).toBe(0);
    });
  });

  describe("is form-associated", () => {
    it("supports type=text", () => formAssociated("calcite-input", { testValue: "test", submitsOnEnter: true }));
    it("supports type=number", () =>
      formAssociated("<calcite-input type='number'></calcite-input>", { testValue: 5, submitsOnEnter: true }));
  });
});
