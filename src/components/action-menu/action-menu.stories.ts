import { html } from "../../../support/formatting";
import readme from "./readme.md";
import { storyFilters } from "../../../.storybook/helpers";

export default {
  title: "Components/Action Menu",
  parameters: {
    notes: readme
  },
  ...storyFilters()
};

export const simple = (): string =>
  html`
    <calcite-action-menu>
      <calcite-action slot="trigger" text="Add" icon="banana"></calcite-action>
      <calcite-action text="Plus" icon="plus" text-enabled></calcite-action>
      <calcite-action text="Minus" icon="minus" text-enabled></calcite-action>
      <calcite-action text="Table" icon="table" text-enabled></calcite-action>
    </calcite-action-menu>
  `;

export const open = (): string =>
  html`
    <calcite-action-menu open>
      <calcite-action slot="trigger" text="Add" icon="banana"></calcite-action>
      <calcite-action text="Plus" icon="plus" text-enabled></calcite-action>
      <calcite-action text="Minus" icon="minus" text-enabled></calcite-action>
      <calcite-action text="Table" icon="table" text-enabled></calcite-action>
    </calcite-action-menu>
  `;
