import {
  Attribute,
  filterComponentAttributes,
  Attributes,
  createComponentHTML as create,
  themesDarkDefault
} from "../../../.storybook/utils";
import { html } from "../../../support/formatting";
import { boolean, text } from "@storybook/addon-knobs";
import selectReadme from "../select/readme.md";
import optionReadme from "../option/readme.md";
import optionGroupReadme from "../option-group/readme.md";
import { storyFilters } from "../../../.storybook/helpers";

const createSelectAttributes: (options?: { exceptions: string[] }) => Attributes = (
  { exceptions } = { exceptions: [] }
) => {
  const group = "select";

  return filterComponentAttributes(
    [
      {
        name: "disabled",
        commit(): Attribute {
          this.value = boolean("disabled", false, group);
          delete this.build;
          return this;
        }
      }
    ],
    exceptions
  );
};

const createOptionAttributes: () => Attributes = () => {
  const group = "option";

  return [
    {
      name: "disabled",
      value: boolean("disabled", false, group)
    },
    {
      name: "label",
      value: text("label", "fancy label", group)
    },
    {
      name: "selected",
      value: boolean("selected", false, group)
    },
    {
      name: "value",
      value: text("value", "value", group)
    }
  ];
};

const createOptionGroupAttributes: () => Attributes = () => {
  const group = "option-group";
  return [
    {
      name: "label",
      value: text("label", "My fancy group label", group)
    }
  ];
};

export default {
  title: "Components/Controls/Select",
  parameters: {
    notes: {
      select: selectReadme,
      option: optionReadme,
      optionGroup: optionGroupReadme
    }
  },
  ...storyFilters()
};

export const simple = (): string =>
  html`<div style="width:260px">
    ${create(
      "calcite-select",
      createSelectAttributes(),
      html`
        ${create("calcite-option", createOptionAttributes())}
        <calcite-option
          selected
          label="some fixed option with a very long label set on it to extend past the end"
          value="some-fixed-value"
        ></calcite-option>
        <calcite-option label="another fixed option" value="another-fixed-value"></calcite-option>
      `
    )}
  </div>`;

export const grouped = (): string =>
  create(
    "calcite-select",
    createSelectAttributes(),
    html`
      ${create(
        "calcite-option-group",
        createOptionGroupAttributes(),
        html`
          ${create("calcite-option", createOptionAttributes())}
          <calcite-option label="some fixed option (A)" value="some-fixed-value-a"></calcite-option>
          <calcite-option label="another fixed option (A)" value="another-fixed-value-a"></calcite-option>
        `
      )}
      <calcite-option-group label="group B (fixed)">
        <calcite-option label="some fixed option (B)" value="some-fixed-value-b"></calcite-option>
        <calcite-option label="another fixed option (B)" value="another-fixed-value-b"></calcite-option>
      </calcite-option-group>
    `
  );

export const darkThemeRTL_TestOnly = (): string =>
  create(
    "calcite-select",
    [
      ...createSelectAttributes({ exceptions: ["dir", "class"] }),
      {
        name: "dir",
        value: "rtl"
      },
      {
        name: "class",
        value: "calcite-theme-dark"
      }
    ],
    html`
      ${create(
        "calcite-option-group",
        createOptionGroupAttributes(),
        html`
          ${create("calcite-option", createOptionAttributes())}
          <calcite-option label="some fixed option (A)" value="some-fixed-value-a"></calcite-option>
          <calcite-option label="another fixed option (A)" value="another-fixed-value-a"></calcite-option>
        `
      )}
      <calcite-option-group label="group B (fixed)">
        <calcite-option label="some fixed option (B)" value="some-fixed-value-b"></calcite-option>
        <calcite-option label="another fixed option (B)" value="another-fixed-value-b"></calcite-option>
      </calcite-option-group>
    `
  );

darkThemeRTL_TestOnly.parameters = { themes: themesDarkDefault };

export const disabled_TestOnly = (): string => html`<calcite-select disabled>
  <calcite-option label="first" value="1"></calcite-option>
  <calcite-option label="second" value="2"></calcite-option>
</calcite-select>`;
