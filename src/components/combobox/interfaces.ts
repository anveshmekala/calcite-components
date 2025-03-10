export interface listItem {
  label: string;
  value: string;
}

export type ComboboxSelectionMode = "single" | "multi" | "ancestors" | "multiple";

export type ComboboxChildElement = HTMLCalciteComboboxItemElement | HTMLCalciteComboboxItemGroupElement;
