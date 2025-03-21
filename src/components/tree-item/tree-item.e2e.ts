import { newE2EPage } from "@stencil/core/testing";
import { accessible, defaults, disabled, hidden, renders, slots } from "../../tests/commonTests";
import { html } from "../../../support/formatting";
import { SLOTS } from "./resources";

describe("calcite-tree-item", () => {
  it("renders", async () => renders("calcite-tree-item", { visible: false, display: "block" }));

  it("honors hidden attribute", async () => hidden(`<calcite-tree-item expanded></calcite-tree-item>`));

  it("is accessible", async () => accessible(`<calcite-tree-item></calcite-tree-item>`));

  it("is accessible: nested children", async () =>
    accessible(`
    <calcite-tree lines>
      <calcite-tree-item>
        <a href="#">Child 2</a>
        <calcite-tree slot="children">
          <calcite-tree-item>
            <a href="http://www.google.com">Grandchild 1</a>
          </calcite-tree-item>
        </calcite-tree>
    </calcite-tree-item>
  </calcite-tree>`));

  it("has property defaults", async () =>
    defaults("calcite-tree-item", [
      {
        propertyName: "selected",
        defaultValue: false
      },
      {
        propertyName: "expanded",
        defaultValue: false
      },
      {
        propertyName: "parentExpanded",
        defaultValue: false
      },
      {
        propertyName: "depth",
        defaultValue: 0
      },
      {
        propertyName: "hasChildren",
        defaultValue: false
      },
      { propertyName: "indeterminate", defaultValue: undefined }
    ]));

  it("has slots", () => slots("calcite-tree-item", SLOTS));

  it("can be disabled (within a tree)", async () => {
    const page = await newE2EPage();
    await page.setContent(html` <calcite-tree expanded>
      <calcite-tree-item>😃</calcite-tree-item>
    </calcite-tree>`);

    await disabled({ page, tag: "calcite-tree-item" });
  });

  it("should expand/collapse children when the icon is clicked, but not select/deselect group", async () => {
    const page = await newE2EPage();
    await page.setContent(html`
      <calcite-tree lines id="parentTree" selection-mode="ancestors">
        <calcite-tree-item id="firstItem">
          <a href="#">Child 2</a>

          <calcite-tree slot="children">
            <calcite-tree-item>
              <a href="http://www.google.com">Grandchild 1</a>
            </calcite-tree-item>
          </calcite-tree>
        </calcite-tree-item>
      </calcite-tree>
    `);

    const item = await page.find("calcite-tree-item");
    expect(item).not.toHaveAttribute("checked");

    const icon = await page.find('#firstItem >>> [data-test-id="icon"]');
    await icon.click();

    const childContainer = await page.find('#firstItem >>> [data-test-id="calcite-tree-children"]');
    const isVisible = await childContainer.isVisible();
    expect(isVisible).toBe(true);
    expect(item).not.toHaveAttribute("checked");
  });

  it("should allow starting expanded", async () => {
    const page = await newE2EPage();

    await page.setContent(`<calcite-tree lines id="parentTree">
      <calcite-tree-item id="firstItem" expanded>
        <a href="#">Child 2</a>

        <calcite-tree slot="children">
          <calcite-tree-item>
            <a href="#" id="childLink">Grandchild 1</a>
          </calcite-tree-item>
        </calcite-tree>
      </calcite-tree-item>
    </calcite-tree>`);

    const child = await page.find("#childLink");
    const isVisible = await child.isVisible();
    expect(isVisible).toBe(true);
  });

  it("should navigate when the link inside the tree item is clicked", async () => {
    const page = await newE2EPage();

    await page.setContent(`<calcite-tree lines id="parentTree">
      <calcite-tree-item id="firstItem">
        <a href="#">Child 1</a>
      </calcite-tree-item>
    </calcite-tree>`);

    const anchor = await page.find("#firstItem a");
    await anchor.click();

    await page.waitForChanges();
    expect(page.url()).toContain("#");
  });

  it("should navigate to the link url when the item but not the link is clicked", async () => {
    const page = await newE2EPage();

    await page.setContent(`<calcite-tree lines id="parentTree">
      <calcite-tree-item id="firstItem">
        <a href="#">Child 1</a>
      </calcite-tree-item>
    </calcite-tree>`);

    const item = await page.find("#firstItem");
    await item.click();

    await page.waitForChanges();
    expect(page.url()).toContain("#");
  });

  it("should navigate to the inner link when a child item is clicked and not the outer link", async () => {
    const page = await newE2EPage();

    await page.setContent(`<calcite-tree lines id="parentTree">
      <calcite-tree-item expanded>
        <a href="#outer">Child 2</a>

        <calcite-tree slot="children">
          <calcite-tree-item id="secondItem">
            <a href="#inner">Grandchild 1</a>
          </calcite-tree-item>
        </calcite-tree>
      </calcite-tree-item>
    </calcite-tree>`);

    await page.waitForChanges();

    const hash = await page.evaluate(() => {
      const item = document.getElementById("secondItem");
      item.click();
      return window.location.hash;
    });

    expect(hash).toEqual("#inner");
  });

  describe("when a tree-item has ancestors selection-mode and is selected", () => {
    it("should update its ancestor tree-items' indeterminate properties", async () => {
      const tree = `<calcite-tree selection-mode="ancestors">
        <calcite-tree-item expanded data-id="ancestor">
          <span> Fruits </span>
          <calcite-tree slot="children">
            <calcite-tree-item>
              <calcite-link href="#go" tabindex="-1"> Bananas </calcite-link>
            </calcite-tree-item>
            <calcite-tree-item expanded data-id="ancestor">
              <span> Pears </span>
              <calcite-tree slot="children">
                <calcite-tree-item selected>
                  <calcite-link href="#go" tabindex="-1"> Anjou </calcite-link>
                </calcite-tree-item>
                <calcite-tree-item>
                  <calcite-link href="#go" tabindex="-1"> Bartlett </calcite-link>
                </calcite-tree-item>
              </calcite-tree>
            </calcite-tree-item>
          </calcite-tree>
        </calcite-tree-item>
      </calcite-tree>
      `;
      const page = await newE2EPage({ html: tree });
      const ancestors = await page.findAll(`calcite-tree-item[data-id="ancestor"]`);

      for (let i = 0; i < ancestors.length; i++) {
        const node = ancestors[i];
        expect(await node.getProperty("indeterminate")).toBe(true);
      }
    });
  });

  describe("when a parent tree-item is expanded and a new item is appended into it", () => {
    it("should render the visible, keyboard navigable item", async () => {
      const page = await newE2EPage();
      await page.setContent(`<calcite-panel>
        <calcite-button id='add-item-btn'>Add item to tree</calcite-button>
        <calcite-tree>
          <calcite-tree-item expanded><span>Element 1</span>
            <calcite-tree slot='children' id='target-tree'>
              <calcite-tree-item>Child 1</calcite-tree-item>
            </calcite-tree>
          </calcite-tree-item>
          <calcite-tree-item>Element 2</calcite-tree-item>
        </calcite-tree>
      </calcite-panel>`);
      await page.evaluate(() => {
        const tree = document.querySelector("#target-tree");
        document.querySelector("#add-item-btn").addEventListener("click", () => {
          const newItem = document.createElement("calcite-tree-item");
          newItem.id = "newbie";
          newItem.appendChild(document.createTextNode("Child 2"));
          tree.appendChild(newItem);
        });
      });
      const btn = await page.find("calcite-button");
      await btn.click();

      const item = await page.find("#newbie");
      expect(item).toEqualAttribute("aria-hidden", "false");
      expect(item).not.toHaveAttribute("calcite-hydrated-hidden");
      expect(item.tabIndex).toBe(0);
    });
  });

  it("clicking on node-container, label, or checkbox selects/deselects, but does not expand/collapse children", async () => {
    const page = await newE2EPage();
    await page.setContent(html`
      <calcite-tree selection-mode="ancestors" scale="m">
        <calcite-tree-item>
          <span>Child 1</span>

          <calcite-tree slot="children">
            <calcite-tree-item>
              <span>Grandchild 1</span>
              <calcite-tree slot="children">
                <calcite-tree-item>
                  <span>Great Grandchild 1</span>
                </calcite-tree-item>
                <calcite-tree-item>
                  <span>Great Grandchild 2</span>
                </calcite-tree-item>
                <calcite-tree-item>
                  <span>Great Grandchild 3</span>
                </calcite-tree-item>
              </calcite-tree>
            </calcite-tree-item>
            <calcite-tree-item>
              <span>Grandchild 2</span>
            </calcite-tree-item>
            <calcite-tree-item>
              <span>Grandchild 3</span>
            </calcite-tree-item>
          </calcite-tree>
        </calcite-tree-item>

        <calcite-tree-item>
          <span>Child 2</span>
        </calcite-tree-item>
        <calcite-tree-item>
          <span>Child 3</span>
        </calcite-tree-item>
      </calcite-tree>
    `);
    const container = await page.find("calcite-tree-item >>> .node-container");
    const label = await container.find("label");
    const checkbox = await label.find("calcite-checkbox");

    const icon = await container.find(`[data-test-id="icon"]`);
    await icon.click();

    const childContainer = await page.find(`calcite-tree-item >>> [data-test-id="calcite-tree-children"]`);
    const isVisible = await childContainer.isVisible();
    expect(isVisible).toBe(true);

    await container.click();
    expect(checkbox).toHaveAttribute("checked");
    expect(isVisible).toBe(true);
    await container.click();
    expect(checkbox).not.toHaveAttribute("checked");
    expect(isVisible).toBe(true);

    await label.click();
    expect(checkbox).toHaveAttribute("checked");
    expect(isVisible).toBe(true);
    await label.click();
    expect(checkbox).not.toHaveAttribute("checked");
    expect(isVisible).toBe(true);

    await checkbox.click();
    expect(checkbox).toHaveAttribute("checked");
    expect(isVisible).toBe(true);
    await checkbox.click();
    expect(checkbox).not.toHaveAttribute("checked");
    expect(isVisible).toBe(true);
  });

  it("right arrow key expands subtree and left arrow collapses it", async () => {
    const page = await newE2EPage({
      html: `
        <calcite-tree>
          <calcite-tree-item id="cables">
            Cables
            <calcite-tree slot="children">
              <calcite-tree-item id="xlr">XLR Cable</calcite-tree-item>
              <calcite-tree-item id="instrument">Instrument Cable</calcite-tree-item>
            </calcite-tree>
          </calcite-tree-item>
        </calcite-tree>
    `
    });

    await page.keyboard.press("Tab");

    expect(await page.evaluate(() => document.activeElement.id)).toBe("cables");
    expect(await page.evaluate(() => (document.activeElement as HTMLCalciteTreeItemElement).expanded)).toBe(false);

    await page.keyboard.press("ArrowRight");

    expect(await page.evaluate(() => document.activeElement.id)).toBe("cables");
    expect(await page.evaluate(() => (document.activeElement as HTMLCalciteTreeItemElement).expanded)).toBe(true);

    await page.keyboard.press("ArrowLeft");

    expect(await page.evaluate(() => document.activeElement.id)).toBe("cables");
    expect(await page.evaluate(() => (document.activeElement as HTMLCalciteTreeItemElement).expanded)).toBe(false);
  });

  it("right arrow key focuses first item in expanded subtree", async () => {
    const page = await newE2EPage({
      html: `
        <calcite-tree>
          <calcite-tree-item id="cables" expanded>
            Cables
            <calcite-tree slot="children">
              <calcite-tree-item id="xlr">XLR Cable</calcite-tree-item>
              <calcite-tree-item id="instrument">Instrument Cable</calcite-tree-item>
            </calcite-tree>
          </calcite-tree-item>
        </calcite-tree>
    `
    });

    await page.keyboard.press("Tab");

    expect(await page.evaluate(() => document.activeElement.id)).toBe("cables");

    await page.keyboard.press("ArrowRight");

    expect(await page.evaluate(() => document.activeElement.id)).toBe("xlr");
  });
});
