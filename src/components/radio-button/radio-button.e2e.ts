import { newE2EPage } from "@stencil/core/testing";
import {
  accessible,
  defaults,
  disabled,
  focusable,
  formAssociated,
  hidden,
  labelable,
  reflects,
  renders
} from "../../tests/commonTests";

describe("calcite-radio-button", () => {
  it("renders", async () => renders("calcite-radio-button", { display: "block" }));

  it("is accessible", async () =>
    accessible(
      `<calcite-label><calcite-radio-button id="example" name="example" value="one"></calcite-radio-button>label</calcite-label>`
    ));

  it("is accessible without calcite-label", async () =>
    accessible(`<calcite-radio-button label="label" id="example" name="example" value="one"></calcite-radio-button>`));

  it("has defaults", async () => defaults("calcite-radio-button", [{ propertyName: "scale", defaultValue: "m" }]));

  it("honors hidden attribute", async () => hidden("calcite-radio-button"));

  it("is labelable", async () =>
    labelable("<calcite-radio-button name='group-name'></calcite-radio-button>", {
      shadowFocusTargetSelector: ".container",
      propertyToToggle: "checked"
    }));

  it("can be disabled", () => disabled("calcite-radio-button"));

  it("focusing skips over hidden radio-buttons", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-radio-button name="hidden" value="first"></calcite-radio-button>
      <calcite-radio-button name="hidden" value="second" hidden></calcite-radio-button>
      <calcite-radio-button name="hidden" value="third"></calcite-radio-button>
    `);

    const firstElement = await page.find("calcite-radio-button");
    await firstElement.click();
    await firstElement.press("ArrowDown");
    await page.waitForChanges();

    const selected = await page.find("calcite-radio-button[focused]");
    const value = await selected.getProperty("value");
    expect(value).toBe("third");
  });

  it("is focusable", () =>
    focusable("calcite-radio-button", {
      shadowFocusTargetSelector: ".container"
    }));

  it("reflects", async () =>
    reflects("calcite-radio-button", [
      { propertyName: "checked", value: true },
      { propertyName: "disabled", value: true },
      { propertyName: "focused", value: true },
      { propertyName: "guid", value: "reflects-guid" },
      { propertyName: "hidden", value: true },
      { propertyName: "name", value: "reflects-name" },
      { propertyName: "required", value: true },
      { propertyName: "scale", value: "m" }
    ]));

  it("does not require an item to be checked", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-radio-button name="none-checked" value="1"></calcite-radio-button>
      <calcite-radio-button name="none-checked" value="2"></calcite-radio-button>
      <calcite-radio-button name="none-checked" value="3"></calcite-radio-button>
    `);
    const radioButtons = await page.findAll("calcite-radio-button");
    for (let i = 0; i < radioButtons.length; i++) {
      expect(await radioButtons[i].getProperty("checked")).toBe(false);
      expect(radioButtons[i].getAttribute("checked")).toBe(null);
    }
  });

  it("when multiple items are checked, last one wins", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-radio-button name="multiple-checked" value="1" checked></calcite-radio-button>
      <calcite-radio-button name="multiple-checked" value="2" checked></calcite-radio-button>
      <calcite-radio-button name="multiple-checked" value="3" checked></calcite-radio-button>
    `);
    const checkedItems = await page.findAll("calcite-radio-button[checked]");
    expect(checkedItems).toHaveLength(1);

    const selectedValue = await checkedItems[0].getProperty("value");
    expect(selectedValue).toBe("3");
  });

  it("selects item with left and arrow keys", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-radio-button name="keyboard" value="1" checked></calcite-radio-button>
      <calcite-radio-button name="keyboard" value="2"></calcite-radio-button>
      <calcite-radio-button name="keyboard" value="3"></calcite-radio-button>
    `);
    const element = await page.find("calcite-radio-button");

    const firstElement = await page.find("calcite-radio-button[checked]");
    await firstElement.click();
    await element.press("ArrowRight");
    await page.waitForChanges();

    let selected = await page.find("calcite-radio-button[checked]");
    let value = await selected.getProperty("value");
    expect(value).toBe("2");
    await element.press("ArrowRight");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("3");
    await element.press("ArrowRight");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("1");
    await element.press("ArrowLeft");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("3");
    await element.press("ArrowLeft");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("2");
    await element.press("ArrowLeft");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("1");
  });

  it("selects item with up and down keys", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-radio-button name="up-down-keys" value="1" checked></calcite-radio-button>
      <calcite-radio-button name="up-down-keys" value="2"></calcite-radio-button>
      <calcite-radio-button name="up-down-keys" value="3"></calcite-radio-button>
    `);
    const element = await page.find("calcite-radio-button");

    const firstElement = await page.find("calcite-radio-button[checked]");
    await firstElement.click();
    await element.press("ArrowDown");
    let selected = await page.find("calcite-radio-button[checked]");
    let value = await selected.getProperty("value");
    expect(value).toBe("2");
    await element.press("ArrowDown");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("3");
    await element.press("ArrowDown");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("1");
    await element.press("ArrowUp");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("3");
    await element.press("ArrowUp");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("2");
    await element.press("ArrowUp");
    selected = await page.find("calcite-radio-button[checked]");
    value = await selected.getProperty("value");
    expect(value).toBe("1");
  });

  it("clicking a radio updates its checked status", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-radio-button name="radio" value="one" checked></calcite-radio-button>
      <calcite-radio-button name="radio" value="two"></calcite-radio-button>
    `);

    const first = await page.find("calcite-radio-button[value=one]");
    const second = await page.find("calcite-radio-button[value=two]");

    await second.click();
    await page.waitForChanges();

    expect(await first.getProperty("checked")).toBe(false);
    expect(await second.getProperty("checked")).toBe(true);

    await first.click();
    await page.waitForChanges();

    expect(await first.getProperty("checked")).toBe(true);
    expect(await second.getProperty("checked")).toBe(false);

    // helps test click behavior via HTMLElement.click()
    await second.callMethod("click");
    await page.waitForChanges();

    expect(await first.getProperty("checked")).toBe(false);
    expect(await second.getProperty("checked")).toBe(true);

    await first.callMethod("click");
    await page.waitForChanges();

    expect(await first.getProperty("checked")).toBe(true);
    expect(await second.getProperty("checked")).toBe(false);
  });

  it("programmatically checking a radio button updates the group's state correctly", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-radio-button name="radio" value="one" checked></calcite-radio-button>
      <calcite-radio-button name="radio" value="two"></calcite-radio-button>
      <calcite-radio-button name="radio" value="three"></calcite-radio-button>
    `);
    await page.evaluate(() => {
      const second = document.querySelector("calcite-radio-button[value=two]");
      (second as HTMLCalciteRadioButtonElement).checked = true;
    });
    await page.waitForChanges();

    const checkedItems = await page.findAll("calcite-radio-button[checked]");
    expect(checkedItems.length).toEqual(1);

    const selectedValue = await checkedItems[0].getProperty("value");
    expect(selectedValue).toBe("two");
  });

  it("programmatically un-checking a radio button updates the group's state correctly", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-radio-button name="radio" value="one" checked></calcite-radio-button>
      <calcite-radio-button name="radio" value="two"></calcite-radio-button>
      <calcite-radio-button name="radio" value="three"></calcite-radio-button>
    `);
    await page.evaluate(() => {
      const second = document.querySelector("calcite-radio-button[value=one]");
      (second as HTMLCalciteRadioButtonElement).checked = false;
    });
    await page.waitForChanges();

    const checkedItems = await page.findAll("calcite-radio-button[checked]");
    expect(checkedItems).toHaveLength(0);
  });

  it("appropriately triggers the custom change event", async () => {
    const page = await newE2EPage();
    await page.setContent(`<calcite-radio-button></calcite-radio-button>`);

    const radio = await page.find("calcite-radio-button");

    const changeEvent = await radio.spyOnEvent("calciteRadioButtonChange");

    expect(changeEvent).toHaveReceivedEventTimes(0);

    await radio.click();

    expect(changeEvent).toHaveReceivedEventTimes(1);
  });

  it("appropriately triggers the custom internal focus and blur events on click", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<calcite-radio-button></calcite-radio-button><calcite-radio-button id="two"></calcite-radio-button>`
    );

    const radio = await page.find("calcite-radio-button");
    const radio2 = await page.find("calcite-radio-button#two");

    const focusEvent = await radio.spyOnEvent("calciteInternalRadioButtonFocus");
    const blurEvent = await radio.spyOnEvent("calciteInternalRadioButtonBlur");

    expect(focusEvent).toHaveReceivedEventTimes(0);
    expect(blurEvent).toHaveReceivedEventTimes(0);

    await radio.click();

    expect(focusEvent).toHaveReceivedEventTimes(1);
    expect(blurEvent).toHaveReceivedEventTimes(0);

    await radio2.click();

    expect(focusEvent).toHaveReceivedEventTimes(1);
    expect(blurEvent).toHaveReceivedEventTimes(1);
  });

  it.skip("appropriately triggers the custom internal focus and blur events with keyboard", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<calcite-radio-button name="example"></calcite-radio-button><calcite-radio-button name="example"></calcite-radio-button>`
    );

    const radio = await page.find("calcite-radio-button");

    const focusEvent = await radio.spyOnEvent("calciteInternalRadioButtonFocus");
    const blurEvent = await radio.spyOnEvent("calciteInternalRadioButtonBlur");

    expect(focusEvent).toHaveReceivedEventTimes(0);
    expect(blurEvent).toHaveReceivedEventTimes(0);

    await page.keyboard.press("Tab");

    expect(focusEvent).toHaveReceivedEventTimes(1);
    expect(blurEvent).toHaveReceivedEventTimes(0);

    await page.keyboard.press("ArrowRight");

    expect(focusEvent).toHaveReceivedEventTimes(1);
    expect(blurEvent).toHaveReceivedEventTimes(1);
  });

  it("round robins to the first or last radio when pressing right arrow on the last radio or left arrow on the first radio", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<calcite-radio-button name="example"></calcite-radio-button><calcite-radio-button id="two" name="example"></calcite-radio-button>`
    );

    const radio = await page.find("calcite-radio-button");
    const radio2 = await page.find("calcite-radio-button#two");

    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowRight");

    expect(await radio.getProperty("checked")).toBe(false);
    expect(await radio2.getProperty("checked")).toBe(true);

    await page.keyboard.press("ArrowRight");

    expect(await radio.getProperty("checked")).toBe(true);
    expect(await radio2.getProperty("checked")).toBe(false);

    await page.keyboard.press("ArrowLeft");

    expect(await radio.getProperty("checked")).toBe(false);
    expect(await radio2.getProperty("checked")).toBe(true);
  });

  it("doesn't emit when controlling checked attribute", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-radio-button value='test-value'></calcite-radio-button>");
    const element = await page.find("calcite-radio-button");
    const spy = await element.spyOnEvent("calciteRadioButtonChange");

    await element.setProperty("checked", true);
    await page.waitForChanges();
    await element.setProperty("checked", false);
    await page.waitForChanges();
    expect(spy).toHaveReceivedEventTimes(0);
  });

  it("is un-checked by default", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-radio-button value='test-value'></calcite-radio-button>");
    const element = await page.find("calcite-radio-button");

    const checked = await element.getProperty("checked");
    expect(checked).toBe(false);
  });

  it("supports value and checked", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-radio-button value='test-value' checked></calcite-radio-button>");
    const element = await page.find("calcite-radio-button");

    const checked = await element.getProperty("checked");
    expect(checked).toBe(true);

    const value = await element.getProperty("value");
    expect(value).toBe("test-value");
  });

  it("resets to initial value when form reset event is triggered", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <form id="form">
        <calcite-radio-button id="unchecked" name="reset" value="unchecked"></calcite-radio-button>
        <calcite-radio-button id="checked" name="reset" value="checked" checked></calcite-radio-button>
        <button type="reset">Reset</button>
      </form>
    `);

    const unchecked = await page.find("#unchecked");
    expect(await unchecked.getProperty("checked")).toBe(false);

    const checked = await page.find("#checked");
    expect(await checked.getProperty("checked")).toBe(true);

    await unchecked.click();
    await page.waitForChanges();
    expect(await unchecked.getProperty("checked")).toBe(true);
    expect(await checked.getProperty("checked")).toBe(false);

    const resetButton = await page.find("button");
    await resetButton.click();

    await page.waitForChanges();

    expect(await unchecked.getProperty("checked")).toBe(false);
    expect(await checked.getProperty("checked")).toBe(true);
  });

  it("works correctly inside a shadowRoot", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <div></div>
      <template>
        <calcite-radio-button name="in-shadow" value="one"></calcite-radio-button>
        <calcite-radio-button name="in-shadow" value="two"></calcite-radio-button>
      </template>
      <script>
        const shadowRootDiv = document.querySelector("div");
        const shadowRoot = shadowRootDiv.attachShadow({ mode: "open" });
        shadowRoot.append(document.querySelector("template").content.cloneNode(true));
      </script>
    `);

    await page.waitForChanges();
    const radios = await page.findAll("div >>> calcite-radio-button");
    const inputs = await page.findAll("div >>> calcite-radio-button >>> input");

    await radios[0].click();

    expect(await radios[0].getProperty("checked")).toBe(true);
    expect(radios[0].getAttribute("checked")).toBe("");
    expect(await inputs[0].getProperty("checked")).toBe(true);

    await radios[1].click();

    expect(await radios[0].getProperty("checked")).toBe(false);
    expect(radios[0].getAttribute("checked")).toBe(null);
    expect(await inputs[0].getProperty("checked")).toBe(false);

    expect(await radios[1].getProperty("checked")).toBe(true);
    expect(radios[1].getAttribute("checked")).toBe("");
    expect(await inputs[1].getProperty("checked")).toBe(true);
  });

  it("is form-associated", () => formAssociated("calcite-radio-button", { testValue: true }));
});
