import { newE2EPage } from "@stencil/core/testing";
import { hidden, renders, focusable, slots, disabled } from "../../tests/commonTests";
import { defaults } from "../../tests/commonTests";
import { CSS, SLOTS } from "./resources";

describe("calcite-list-item", () => {
  it("renders", async () => renders("calcite-list-item", { display: "flex" }));

  it("is focusable", () =>
    focusable("<calcite-list-item active></calcite-list-item>", {
      shadowFocusTargetSelector: `.${CSS.container}`
    }));

  it("honors hidden attribute", async () => hidden("calcite-list-item"));

  it("has property defaults", async () =>
    defaults("calcite-list-item", [
      {
        propertyName: "description",
        defaultValue: undefined
      },
      {
        propertyName: "disabled",
        defaultValue: false
      },
      {
        propertyName: "label",
        defaultValue: undefined
      },
      {
        propertyName: "selected",
        defaultValue: false
      },
      {
        propertyName: "value",
        defaultValue: undefined
      },
      {
        propertyName: "open",
        defaultValue: false
      }
    ]));

  it("has slots", () => slots("calcite-list-item", SLOTS));

  it("can be disabled", () => disabled(`<calcite-list-item label="test" active></calcite-list-item>`));

  it("renders content node when label is provided", async () => {
    const page = await newE2EPage({ html: `<calcite-list-item label="test"></calcite-list-item>` });

    const contentNode = await page.find(`calcite-list-item >>> .${CSS.content}`);

    expect(contentNode).not.toBeNull();
  });

  it("renders content node when description is provided", async () => {
    const page = await newE2EPage({ html: `<calcite-list-item description="test"></calcite-list-item>` });

    const contentNode = await page.find(`calcite-list-item >>> .${CSS.content}`);

    expect(contentNode).not.toBeNull();
  });

  it("does not render content node when description and label is not provided", async () => {
    const page = await newE2EPage({ html: `<calcite-list-item></calcite-list-item>` });

    const contentNode = await page.find(`calcite-list-item >>> .${CSS.content}`);

    expect(contentNode).toBeNull();
  });

  it("emits calciteListItemSelect on click", async () => {
    const page = await newE2EPage({
      html: `<calcite-list-item label="hello" description="world"></calcite-list-item>`
    });

    await page.waitForChanges();

    const contentContainer = await page.find(`calcite-list-item >>> .${CSS.contentContainer}`);

    const eventSpy = await page.spyOnEvent("calciteListItemSelect");

    await contentContainer.click();

    expect(eventSpy).toHaveReceivedEventTimes(1);
  });
});
