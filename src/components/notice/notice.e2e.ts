import { newE2EPage } from "@stencil/core/testing";
import { accessible, focusable, renders, slots, hidden } from "../../tests/commonTests";
import { CSS, SLOTS } from "./resources";
import { html } from "../../../support/formatting";

describe("calcite-notice", () => {
  const noticeContent = `
  <div slot="title">Title Text</div>
  <div slot="message">Message Text</div>
  <calcite-link slot="link" href="">Action</calcite-link>
`;
  it("renders", async () => renders(`<calcite-notice open>${noticeContent}</calcite-notice>`, { display: "flex" }));

  it("honors hidden attribute", async () => hidden("calcite-notice"));

  it("is accessible", async () => accessible(`<calcite-notice open>${noticeContent}</calcite-notice>`));
  it("is accessible with icon", async () => accessible(`<calcite-notice icon open>${noticeContent}</calcite-notice>`));
  it("is accessible with close button", async () =>
    accessible(`<calcite-notice closable open>${noticeContent}</calcite-notice>`));
  it("is accessible with icon and close button (deprecated)", async () =>
    accessible(`<calcite-notice icon dismissible open>${noticeContent}</calcite-notice>`));
  it("is accessible with icon and close button", async () =>
    accessible(`<calcite-notice icon closable open>${noticeContent}</calcite-notice>`));

  it("has slots", () => slots("calcite-notice", SLOTS));

  it("renders default props when none are provided", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <calcite-notice>
    <div slot="title">Title Text</div>
    <div slot="message">Message Text</div>
    <calcite-link slot="link" href="">Action</calcite-link>
    </calcite-notice>`);
    const element = await page.find("calcite-notice");
    const close = await page.find(`calcite-notice >>> .${CSS.close}`);
    const icon = await page.find(`calcite-notice >>> .${CSS.icon}`);
    expect(element).toEqualAttribute("color", "blue");
    expect(close).toBeNull();
    expect(icon).toBeNull();
  });

  it("renders requested props when valid props are provided", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <calcite-notice color="yellow" closable>
    ${noticeContent}
    </calcite-notice>`);

    const element = await page.find("calcite-notice");
    const close = await page.find(`calcite-notice >>> .${CSS.close}`);
    const icon = await page.find(`calcite-notice >>> .${CSS.icon}`);

    expect(element).toEqualAttribute("color", "yellow");
    expect(close).not.toBeNull();
    expect(icon).toBeNull();
  });

  it("renders an icon and close button when requested (deprecated)", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <calcite-notice icon closable>
    ${noticeContent}
    </calcite-notice>`);

    const close = await page.find(`calcite-notice >>> .${CSS.close}`);
    const icon = await page.find(`calcite-notice >>> .${CSS.icon}`);
    expect(close).not.toBeNull();
    expect(icon).not.toBeNull();
  });

  it("renders an icon and close button when requested", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <calcite-notice icon closable>
    ${noticeContent}
    </calcite-notice>`);

    const close = await page.find(`calcite-notice >>> .${CSS.close}`);
    const icon = await page.find(`calcite-notice >>> .${CSS.icon}`);
    expect(close).not.toBeNull();
    expect(icon).not.toBeNull();
  });

  it("successfully closes a dismissible notice (deprecated)", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <calcite-notice id="notice-1" active dismissible>
    ${noticeContent}
    </calcite-notice>
    `);

    const notice1 = await page.find("#notice-1 >>> .container");
    const noticeclose1 = await page.find(`#notice-1 >>> .${CSS.close}`);
    const animationDurationInMs = 400;

    expect(await notice1.isVisible()).toBe(true);

    await noticeclose1.click();
    await page.waitForTimeout(animationDurationInMs);
    expect(await notice1.isVisible()).not.toBe(true);
  });

  it("successfully closes a closable notice", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <calcite-notice id="notice-1" open closable>
    ${noticeContent}
    </calcite-notice>
    `);

    const notice1 = await page.find("#notice-1 >>> .container");
    const noticeclose1 = await page.find(`#notice-1 >>> .${CSS.close}`);
    const animationDurationInMs = 400;

    expect(await notice1.isVisible()).toBe(true);

    await noticeclose1.click();
    await page.waitForTimeout(animationDurationInMs);
    expect(await notice1.isVisible()).not.toBe(true);
  });

  describe("focusable (deprecated)", () => {
    it("with link and dismissible  => focuses on link", () =>
      focusable(html` <calcite-notice id="notice-1" active dismissible> ${noticeContent}</calcite-notice>`, {
        focusTargetSelector: `calcite-link`
      }));

    it("when dismissible => focuses on close button", () =>
      focusable(
        html` <calcite-notice id="notice-1" active dismissible>
          <div slot="title">Title Text</div>
          <div slot="message">Message Text</div>
        </calcite-notice>`,
        {
          shadowFocusTargetSelector: `.${CSS.close}`
        }
      ));

    it("without link nor dismissible => does not focus", () =>
      focusable(
        html` <calcite-notice id="notice-1" active>
          <div slot="title">Title Text</div>
          <div slot="message">Message Text</div>
        </calcite-notice>`,
        {
          focusTargetSelector: "body"
        }
      ));
  });

  describe("focusable", () => {
    it("with link and closable => focuses on link", () =>
      focusable(html` <calcite-notice id="notice-1" open closable> ${noticeContent}</calcite-notice>`, {
        focusTargetSelector: `calcite-link`
      }));

    it("when closable => focuses on close button", () =>
      focusable(
        html` <calcite-notice id="notice-1" open closable>
          <div slot="title">Title Text</div>
          <div slot="message">Message Text</div>
        </calcite-notice>`,
        {
          shadowFocusTargetSelector: `.${CSS.close}`
        }
      ));
  });
});
