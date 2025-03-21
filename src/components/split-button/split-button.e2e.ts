import { newE2EPage } from "@stencil/core/testing";
import { accessible, renders, defaults, disabled, hidden } from "../../tests/commonTests";
import { html } from "../../../support/formatting";
import { CSS } from "./resources";

describe("calcite-split-button", () => {
  it("has defaults", async () =>
    defaults("calcite-split-button", [
      {
        propertyName: "overlayPositioning",
        defaultValue: "absolute"
      }
    ]));

  const content = `
  <calcite-dropdown-group>
    <calcite-dropdown-item id="item-1">Item</calcite-dropdown-item>
    <calcite-dropdown-item id="item-2" active>Item2</calcite-dropdown-item>
  </calcite-dropdown-group>`;

  it("renders", () => renders("calcite-split-button", { display: "inline-block" }));

  it("honors hidden attribute", async () => hidden("calcite-split-button"));

  it("is accessible", async () =>
    accessible(`<calcite-split-button
    primary-text="Button Text"
    dropdown-label="Show options">
      ${content}
    </calcite-split-button>`));

  it("is accessible when disabled", async () =>
    accessible(`<calcite-split-button
    disabled
    primary-text="Button Text"
    dropdown-label="Show options">
      ${content}
    </calcite-split-button>`));

  it("is accessible when loading", async () =>
    accessible(`<calcite-split-button
    loading
    primary-text="Button Text"
    dropdown-label="Show options">
      ${content}
    </calcite-split-button>`));

  it("is accessible with icons and no text", async () =>
    accessible(`<calcite-split-button
    icon-end="plus"
    icon-start="plus"
    primary-label="Button label"
    dropdown-label="Show options">
      ${content}
    </calcite-split-button>`));

  it("can be disabled", () => disabled("calcite-split-button"));

  it("renders default props when none are provided", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-split-button>
      </calcite-split-button>`);
    const element = await page.find("calcite-split-button");
    expect(element).toEqualAttribute("scale", "m");
    expect(element).toEqualAttribute("color", "blue");
    expect(element).toEqualAttribute("dropdown-icon-type", "chevron");
    expect(element).toEqualAttribute("width", "auto");
  });

  it(`should set all internal calcite-button types to 'button'`, async () => {
    const page = await newE2EPage({
      html: html`<calcite-split-button primary-text="primary action"></calcite-split-button>`
    });

    const buttons = await page.findAll("calcite-split-button >>> calcite-button");

    expect(buttons).toHaveLength(2);

    for (const button of buttons) {
      expect(await button.getProperty("type")).toBe("button");
    }
  });

  it("renders requested props when valid props are provided", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-split-button
          scale="s"
          color="red"
          dropdown-icon-type="caret"
          loading
          disabled
          width="half"
          dropdown-label="more actions"
          primary-label="primary action">
      </calcite-split-button>`);
    const element = await page.find("calcite-split-button");
    const primaryButton = await page.find("calcite-split-button >>> calcite-button");
    const dropdownButton = await page.find("calcite-split-button >>> calcite-dropdown calcite-button");
    expect(element).toEqualAttribute("scale", "s");
    expect(element).toEqualAttribute("color", "red");
    expect(element).toEqualAttribute("dropdown-icon-type", "caret");
    expect(element).toHaveAttribute("loading");
    expect(element).toHaveAttribute("disabled");
    expect(await primaryButton.getProperty("label")).toBe("primary action");
    expect(await dropdownButton.getProperty("label")).toBe("more actions");
    expect(element).toEqualAttribute("width", "half");
  });

  it("renders primaryText without icons as inner content of primary button", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-split-button primary-text="primary action">
      </calcite-split-button>`);
    const primaryButton = await page.find("calcite-split-button >>> calcite-button");

    expect(primaryButton).toEqualText("primary action");
    expect(primaryButton).not.toHaveAttribute("icon-start");
    expect(primaryButton).not.toHaveAttribute("icon-end");
  });

  it("renders primaryText + primary-icon-start as inner content of primary button", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-split-button primary-text="primary action" primary-icon-start="save">
      </calcite-split-button>`);
    const primaryButton = await page.find("calcite-split-button >>> calcite-button");

    expect(primaryButton).toEqualText("primary action");
    expect(primaryButton).toEqualAttribute("icon-start", "save");
    expect(primaryButton).not.toHaveAttribute("icon-end");
  });

  it("renders primaryText + primary-icon-end as inner content of primary button", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-split-button primary-text="primary action" primary-icon-end="save">
      </calcite-split-button>`);
    const primaryButton = await page.find("calcite-split-button >>> calcite-button");
    expect(primaryButton).toEqualText("primary action");
    expect(primaryButton).not.toHaveAttribute("icon-start");
    expect(primaryButton).toEqualAttribute("icon-end", "save");
  });
  it("renders primaryText + primary-icon-end and primary-icon-start as inner content of primary button", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-split-button primary-text="primary action" primary-icon-start="save" primary-icon-end="save">
      </calcite-split-button>`);
    const primaryButton = await page.find("calcite-split-button >>> calcite-button");
    expect(primaryButton).toEqualText("primary action");
    expect(primaryButton).toEqualAttribute("icon-start", "save");
    expect(primaryButton).toEqualAttribute("icon-end", "save");
  });

  it("changes the size and width of the dropdown + primary button based on scale", async () => {
    const elementScaleToDropdownScale = {
      s: "s",
      m: "m",
      l: "l"
    };
    const elementScaleToButtonScale = {
      s: "s",
      m: "m",
      l: "l"
    };
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-split-button>
      </calcite-split-button>`);
    const element = await page.find("calcite-split-button");
    const primaryButton = await page.find("calcite-split-button >>> calcite-button");
    const dropdown = await page.find("calcite-split-button >>> calcite-dropdown");
    for (const elementScale of Object.keys(elementScaleToDropdownScale)) {
      element.setProperty("scale", elementScale);
      await page.waitForChanges();
      const dropdownScale = elementScaleToDropdownScale[elementScale];
      expect(dropdown).toEqualAttribute("width", dropdownScale);
      expect(dropdown).toEqualAttribute("scale", dropdownScale);
      expect(primaryButton).toEqualAttribute("scale", elementScaleToButtonScale[elementScale]);
    }
  });

  it("adds split-child attributes to child button components", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <calcite-split-button>
      </calcite-split-button>`);
    const primaryButton = await page.find("calcite-split-button >>> calcite-button");
    const dropdownButton = await page.find("calcite-split-button >>> calcite-dropdown calcite-button");
    expect(primaryButton).toEqualAttribute("split-child", "primary");
    expect(dropdownButton).toEqualAttribute("split-child", "secondary");
  });

  it("adds the relevant CSS class based on the width attribute", async () => {
    const page = await newE2EPage();
    await page.setContent(`<calcite-split-button width="auto"></calcite-split-button>`);

    const element = await page.find(`calcite-split-button`);
    const container = await page.find(`calcite-split-button >>> .${CSS.widthAuto}`);
    expect(container).not.toBeNull();
    expect(container).toHaveClass(CSS.widthAuto);

    element.setAttribute("width", "half");
    await page.waitForChanges();
    expect(container).toHaveClass(CSS.widthHalf);

    element.setAttribute("width", "full");
    await page.waitForChanges();
    expect(container).toHaveClass(CSS.widthFull);
  });

  it("should support dropdown item keyboard navigation", async () => {
    const page = await newE2EPage();
    await page.setContent(`<calcite-split-button scale="s" primary-text="Button">
    <calcite-dropdown-group selection-mode="none">
      <calcite-dropdown-item id="item-1">Option 2</calcite-dropdown-item>
      <calcite-dropdown-item id="item-2">Option 3</calcite-dropdown-item>
      <calcite-dropdown-item id="item-3">Option 4</calcite-dropdown-item>
    </calcite-dropdown-group>
  </calcite-split-button>`);
    const group = await page.find("calcite-dropdown-group");
    const secondary = await page.find(`calcite-split-button >>> calcite-button[split-child="secondary"]`);
    const dropdownOpenEvent = page.waitForEvent("calciteDropdownOpen");
    await secondary.click();
    await dropdownOpenEvent;
    expect(await group.isVisible()).toBe(true);
    expect(await page.evaluate(() => document.activeElement.id)).toEqual("item-1");
    await page.keyboard.press("ArrowDown");
    expect(await page.evaluate(() => document.activeElement.id)).toEqual("item-2");
    await page.keyboard.press("ArrowDown");
    expect(await page.evaluate(() => document.activeElement.id)).toEqual("item-3");
    const dropdownCloseEvent = page.waitForEvent("calciteDropdownClose");
    await page.keyboard.press("Enter");
    await dropdownCloseEvent;
    expect(await group.isVisible()).toBe(false);
  });
});
