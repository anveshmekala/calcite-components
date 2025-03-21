import { newE2EPage } from "@stencil/core/testing";
import { CSS, SLOTS, TEXT } from "./resources";
import { accessible, defaults, disabled, hidden, renders, slots } from "../../tests/commonTests";
import { html } from "../../../support/formatting";

describe("calcite-block", () => {
  it("renders", async () => renders("calcite-block", { display: "flex" }));

  it("honors hidden attribute", async () => hidden("calcite-block"));

  it("has property defaults", async () =>
    defaults("calcite-block", [
      {
        propertyName: "collapsible",
        defaultValue: false
      },
      {
        propertyName: "headingLevel",
        defaultValue: undefined
      },
      {
        propertyName: "intlLoading",
        defaultValue: TEXT.loading
      },
      {
        propertyName: "intlOptions",
        defaultValue: TEXT.options
      },
      {
        propertyName: "open",
        defaultValue: false
      }
    ]));

  it("has slots", () => slots("calcite-block", SLOTS));

  it("is accessible", async () =>
    accessible(`
      <calcite-block heading="heading" summary="summary" open collapsible>
        <div slot=${SLOTS.icon}>✅</div>
        <div>content</div>
        <label slot=${SLOTS.control}>test <input placeholder="control"/></label>
      </calcite-block>
  `));

  it("can be disabled", () =>
    disabled(html`<calcite-block heading="heading" summary="summary" collapsible></calcite-block>`));

  it("has a loading state", async () => {
    const page = await newE2EPage({
      html: `
        <calcite-block heading="heading" summary="summary" open collapsible>
          <div class="content">content</div>
        </calcite-block>
    `
    });

    await page.waitForChanges();

    expect(await page.find("calcite-block >>> calcite-scrim")).toBeNull();

    const content = await page.find(".content");
    const clickSpy = await content.spyOnEvent("click");
    await content.click();
    expect(clickSpy).toHaveReceivedEventTimes(1);

    const block = await page.find("calcite-block");
    block.setProperty("loading", true);
    await page.waitForChanges();

    await content.click();
    expect(clickSpy).toHaveReceivedEventTimes(1);

    expect(await page.find("calcite-block >>> calcite-scrim")).toBeTruthy();
  });

  it("can display/hide content", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-block><div>some content</div></calcite-block>");
    let element = await page.find("calcite-block");
    let content = await page.find(`calcite-block >>> .${CSS.content}`);

    expect(await content.isVisible()).toBe(false);

    element.setProperty("open", true);
    await page.waitForChanges();
    element = await page.find("calcite-block[open]");
    content = await page.find(`calcite-block >>> .${CSS.content}`);

    expect(element).toBeTruthy();
    expect(await content.isVisible()).toBe(true);

    element.setProperty("open", false);
    await page.waitForChanges();
    element = await page.find("calcite-block[open]");
    content = await page.find(`calcite-block >>> .${CSS.content}`);

    expect(element).toBeNull();
    expect(await content.isVisible()).toBe(false);
  });

  it("allows toggling its content", async () => {
    const page = await newE2EPage({ html: "<calcite-block collapsible></calcite-block>" });

    const element = await page.find("calcite-block");
    const toggleSpy = await element.spyOnEvent("calciteBlockToggle");
    const toggle = await page.find(`calcite-block >>> .${CSS.toggle}`);

    expect(toggle.getAttribute("aria-label")).toBe(TEXT.expand);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("title")).toBe(TEXT.expand);

    await toggle.click();

    expect(toggleSpy).toHaveReceivedEventTimes(1);
    expect(await element.getProperty("open")).toBe(true);
    expect(toggle.getAttribute("aria-label")).toBe(TEXT.collapse);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("title")).toBe(TEXT.collapse);

    await toggle.click();

    expect(toggleSpy).toHaveReceivedEventTimes(2);
    expect(await element.getProperty("open")).toBe(false);
    expect(toggle.getAttribute("aria-label")).toBe(TEXT.expand);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("title")).toBe(TEXT.expand);
  });

  describe("header", () => {
    it("renders a heading", async () => {
      const page = await newE2EPage();

      await page.setContent(`<calcite-block heading="test-heading"></calcite-block>`);

      const heading = await page.find(`calcite-block >>> .${CSS.heading}`);
      expect(heading).toBeTruthy();
      expect(heading.innerText).toBe("test-heading");

      const description = await page.find(`calcite-block >>> .${CSS.description}`);
      expect(description).toBeNull();
    });

    it("renders a heading with optional summary (deprecated)", async () => {
      const page = await newE2EPage();

      await page.setContent(`<calcite-block heading="test-heading" summary="test-summary"></calcite-block>`);

      const heading = await page.find(`calcite-block >>> .${CSS.heading}`);
      expect(heading).toBeTruthy();

      const summary = await page.find(`calcite-block >>> .${CSS.description}`);
      expect(summary.innerText).toBe("test-summary");
    });

    it("renders a heading with optional description", async () => {
      const page = await newE2EPage();

      await page.setContent(`<calcite-block heading="test-heading" description="test-summary"></calcite-block>`);

      const heading = await page.find(`calcite-block >>> .${CSS.heading}`);
      expect(heading).toBeTruthy();

      const description = await page.find(`calcite-block >>> .${CSS.description}`);
      expect(description.innerText).toBe("test-summary");
    });

    it("allows users to add a control in a collapsible block", async () => {
      const page = await newE2EPage();
      await page.setContent(
        `<calcite-block heading="test-heading" collapsible><div class="nested-control" tabindex="0" slot=${SLOTS.control}>fake space/enter-bubbling control</div></calcite-block>`
      );
      const control = await page.find(".nested-control");
      expect(await control.isVisible()).toBe(true);

      const controlSlot = await page.find(`calcite-block >>> slot[name=${SLOTS.control}]`);
      expect(await controlSlot.isVisible()).toBe(true);

      const block = await page.find("calcite-block");
      const blockToggleSpy = await block.spyOnEvent("calciteBlockToggle");

      await control.press("Space");
      await control.press("Enter");
      await control.click();
      expect(blockToggleSpy).toHaveReceivedEventTimes(0);

      await block.click();
      await block.click();
      expect(blockToggleSpy).toHaveReceivedEventTimes(2);
    });

    it("does not render collapsible icon when a control is added to the header", async () => {
      const page = await newE2EPage();
      await page.setContent(
        `<calcite-block heading="test-heading" collapsible>
          <calcite-action text="test" icon="banana" slot="${SLOTS.control}"></calcite-action>
        </calcite-block>`
      );
      const collapsibleIcon = await page.find(`calcite-block >>> .${CSS.toggleIcon}`);
      expect(collapsibleIcon).toBeNull();
    });

    it("displays a status icon instead of a header icon when `status` is an accepted value", async () => {
      const page = await newE2EPage();
      await page.setContent(
        `<calcite-block status="invalid">
          <div class="header-icon" slot=${SLOTS.icon} /></calcite-block>
        </calcite-block>`
      );

      const headerIcon = await page.find("calcite-block >>> .header-icon");
      expect(headerIcon).toBeNull();

      const statusIcon = await page.find(`calcite-block >>> .${CSS.statusIcon}`);
      expect(statusIcon).not.toBeNull();
    });

    it("displays a loading icon  when `loading` is set to true and `open` is set to false", async () => {
      const headerIcon = "header-icon";
      const page = await newE2EPage();
      await page.setContent(
        `<calcite-block status="invalid" loading>
          <div class="${headerIcon}" slot=${SLOTS.icon} /></calcite-block>
        </calcite-block>`
      );

      const headerIconEle = await page.find(`calcite-block >>> .${headerIcon}`);
      expect(headerIconEle).toBeNull();

      const statusIcon = await page.find(`calcite-block >>> .${CSS.statusIcon}`);
      const loadingIcon = await page.find(`calcite-block >>> .${CSS.loading}`);
      expect(statusIcon).not.toBeNull();
      expect(loadingIcon).not.toBeNull();
    });

    it("allows users to slot in actions in a header menu", async () => {
      const page = await newE2EPage({
        html: html` <calcite-block heading="With header actions" summary="has header actions">
          <calcite-action label="Add" icon="plus" slot="header-menu-actions"></calcite-action>
        </calcite-block>`
      });

      const menuSlot = await page.find(`calcite-block >>> calcite-action-menu slot[name=${SLOTS.headerMenuActions}]`);
      expect(menuSlot).toBeDefined();

      const actionAssignedSlot = await page.$eval("calcite-action", (action) => action.assignedSlot.name);
      expect(actionAssignedSlot).toBe(SLOTS.headerMenuActions);
    });

    it("does not render collapsible icon when actions are added to the header menu", async () => {
      const page = await newE2EPage();
      await page.setContent(
        `<calcite-block heading="test-heading" collapsible>
          <calcite-action text="test" icon="banana" slot="${SLOTS.headerMenuActions}"></calcite-action>
        </calcite-block>`
      );
      const collapsibleIcon = await page.find(`calcite-block >>> .${CSS.toggleIcon}`);
      expect(collapsibleIcon).toBeNull();
    });
  });
});
