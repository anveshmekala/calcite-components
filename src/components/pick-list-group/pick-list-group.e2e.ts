import { newE2EPage } from "@stencil/core/testing";
import { CSS, SLOTS } from "./resources";
import { accessible, defaults, renders, slots, hidden } from "../../tests/commonTests";
import { html } from "../../../support/formatting";

describe("calcite-pick-list-group", () => {
  it("renders", async () => renders("calcite-pick-list-group", { display: "block" }));

  it("honors hidden attribute", async () => hidden("calcite-pick-list-group"));

  it("is accessible", async () => {
    await accessible("<calcite-pick-list-group></calcite-pick-list-group>");
    await accessible(`<calcite-pick-list-group group-title="awesome title, bruh"></calcite-pick-list-group>`);
    await accessible(html`
      <calcite-pick-list>
        <calcite-pick-list-group>
          <calcite-pick-list-item label="Sample" value="one"></calcite-pick-list-item>
        </calcite-pick-list-group>
      </calcite-pick-list>
    `);
  });

  it("has property defaults", async () =>
    defaults("calcite-pick-list-group", [
      {
        propertyName: "headingLevel",
        defaultValue: undefined
      }
    ]));

  it("has slots", () => slots("calcite-pick-list-group", SLOTS));

  it("should render", async () => {
    const page = await newE2EPage();

    await page.setContent(`<calcite-pick-list-group></calcite-pick-list-group>`);
    const pickList = await page.find("calcite-pick-list-group");
    expect(pickList).not.toBeNull();
    const isVisible = await pickList.isVisible();
    expect(isVisible).toBe(true);
  });

  it("should render a header if one is provided", async () => {
    const page = await newE2EPage();
    const headingText = "testing";

    await page.setContent(`<calcite-pick-list-group group-title=${headingText}></calcite-pick-list-group>`);
    const heading = await page.find(`calcite-pick-list-group >>> .${CSS.heading}`);
    const isVisible = await heading.isVisible();
    expect(isVisible).toBe(true);
    expect(heading.innerText).toBe(headingText);
  });

  it("should indent children if a parent slot is passed", async () => {
    const page = await newE2EPage();
    await page.setContent(`<calcite-pick-list filter-enabled>
      <calcite-pick-list-group>
        <calcite-pick-list-item slot="parent-item" value="nums" label="Numbers"></calcite-pick-list-item>
        <calcite-pick-list-item value="1" label="One" description="uno"></calcite-pick-list-item>
      </calcite-pick-list-group>
    </calcite-pick-list>`);
    const indentedContainer = await page.find(`calcite-pick-list-group >>> ${CSS.indented}`);
    expect(indentedContainer).toBeDefined();
  });
});
