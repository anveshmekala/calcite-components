import { text, select } from "@storybook/addon-knobs";
import { boolean, storyFilters } from "../../../.storybook/helpers";
import { themesDarkDefault } from "../../../.storybook/utils";
import * as icons from "../../../node_modules/@esri/calcite-ui-icons";
import readme from "./readme.md";
import { html } from "../../../support/formatting";

// we can get all unique icon names from all size 16 non-filled icons.
const iconNames = Object.keys(icons)
  .filter((iconName) => iconName.endsWith("16"))
  .map((iconName) => iconName.replace("16", ""));

export default {
  title: "Components/Link",
  parameters: {
    notes: readme
  },
  ...storyFilters()
};

export const simple = (): string => html`
  <div
    style="font-size: ${select(
      "containing font size",
      ["12", "14", "16", "18", "20", "24", "32"],
      "16"
    )}px; font-weight: ${select("containing font weight", ["300", "400", "500", "700"], "400")};"
  >
    Some wrapping text
    <calcite-link href="${text("href", "")}" ${boolean("disabled", false)}>
      ${text("text", "link text here")}</calcite-link
    >
    around the link
  </div>
`;

export const iconStart = (): string => html`
  <div
    style="font-size: ${select(
      "containing font size",
      ["12", "14", "16", "18", "20", "24", "32"],
      "16"
    )}px; font-weight: ${select("containing font weight", ["300", "400", "500", "700"], "400")};"
  >
    Some wrapping text
    <calcite-link
      href="${text("href", "")}"
      ${boolean("disabled", false)}
      icon-start="${select("icon-start", iconNames, iconNames[0])}"
    >
      ${text("text", "link text here")}</calcite-link
    >
    around the link
  </div>
`;

export const iconEnd = (): string => html`
  <div
    style="font-size: ${select(
      "containing font size",
      ["12", "14", "16", "18", "20", "24", "32"],
      "16"
    )}px; font-weight: ${select("containing font weight", ["300", "400", "500", "700"], "400")};"
  >
    Some wrapping text
    <calcite-link
      href="${text("href", "")}"
      ${boolean("disabled", false)}
      icon-end="${select("icon-end", iconNames, iconNames[0])}"
    >
      ${text("text", "link text here")}</calcite-link
    >
    around the link
  </div>
`;

export const iconStartAndIconEnd = (): string => html`
  <div
    style="font-size: ${select(
      "containing font size",
      ["12", "14", "16", "18", "20", "24", "32"],
      "16"
    )}px; font-weight: ${select("containing font weight", ["300", "400", "500", "700"], "400")};"
  >
    Some wrapping text
    <calcite-link
      href="${text("href", "")}"
      ${boolean("disabled", false)}
      icon-start="${select("icon-start", iconNames, iconNames[0])}"
      icon-end="${select("icon-end", iconNames, iconNames[0])}"
    >
      ${text("text", "link text here")}</calcite-link
    >
    around the link
  </div>
`;

export const darkThemeRTL_TestOnly = (): string => html`
  <div
    class="calcite-theme-dark"
    dir="rtl"
    style="color: white; font-size: ${select(
      "containing font size",
      ["12", "14", "16", "18", "20", "24", "32"],
      "16"
    )}px; font-weight: ${select("containing font weight", ["300", "400", "500", "700"], "400")};"
  >
    Some wrapping text
    <calcite-link class="calcite-theme-dark" href="${text("href", "")}" ${boolean("disabled", false)}
      >${text("text", "link text here")}</calcite-link
    >
    around the link
  </div>
`;

darkThemeRTL_TestOnly.parameters = { themes: themesDarkDefault };

export const disabled_TestOnly = (): string => html`<calcite-link disabled>disabled</calcite-link`;
