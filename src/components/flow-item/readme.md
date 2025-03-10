# calcite-flow-item

<!-- Auto Generated Below -->

## Properties

| Property         | Attribute          | Description                                                                                                        | Type                         | Default     |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------- | ----------- |
| `beforeBack`     | --                 | When provided, this method will be called before it is removed from the parent flow.                               | `() => Promise<void>`        | `undefined` |
| `closable`       | `closable`         | When true, displays a close button in the trailing side of the header                                              | `boolean`                    | `false`     |
| `closed`         | `closed`           | When true, flow-item will be hidden                                                                                | `boolean`                    | `false`     |
| `description`    | `description`      | A description for the component.                                                                                   | `string`                     | `undefined` |
| `disabled`       | `disabled`         | When true, interaction is prevented and the component is displayed with lower opacity.                             | `boolean`                    | `false`     |
| `heading`        | `heading`          | The component header text.                                                                                         | `string`                     | `undefined` |
| `headingLevel`   | `heading-level`    | Specifies the number at which section headings should start.                                                       | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `undefined` |
| `heightScale`    | `height-scale`     | Specifies the maximum height of the component.                                                                     | `"l" \| "m" \| "s"`          | `undefined` |
| `intlBack`       | `intl-back`        | Accessible name for the component's back button. The back button will only be shown when 'showBackButton' is true. | `string`                     | `undefined` |
| `intlClose`      | `intl-close`       | Accessible name for the component's close button. The close button will only be shown when 'dismissible' is true.  | `string`                     | `undefined` |
| `intlOptions`    | `intl-options`     | Accessible name for the component's actions menu.                                                                  | `string`                     | `undefined` |
| `loading`        | `loading`          | When true, a busy indicator is displayed.                                                                          | `boolean`                    | `false`     |
| `menuOpen`       | `menu-open`        | When true, the action menu items in the `header-menu-actions` slot are open.                                       | `boolean`                    | `false`     |
| `showBackButton` | `show-back-button` | When true, displays a back button in the header.                                                                   | `boolean`                    | `false`     |
| `widthScale`     | `width-scale`      | Specifies the width of the component.                                                                              | `"l" \| "m" \| "s"`          | `undefined` |

## Events

| Event                      | Description                                                                                                                      | Type                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `calciteFlowItemBack`      | Fires when the back button is clicked.                                                                                           | `CustomEvent<void>` |
| `calciteFlowItemBackClick` | <span style="color:red">**[DEPRECATED]**</span> use calciteFlowItemBack instead.<br/><br/>Fires when the back button is clicked. | `CustomEvent<void>` |
| `calciteFlowItemClose`     | Fires when the close button is clicked.                                                                                          | `CustomEvent<void>` |
| `calciteFlowItemScroll`    | Fires when the content is scrolled.                                                                                              | `CustomEvent<void>` |

## Methods

### `scrollContentTo(options?: ScrollToOptions) => Promise<void>`

Scrolls the component's content to a specified set of coordinates.

#### Returns

Type: `Promise<void>`

### `setFocus() => Promise<void>`

Sets focus on the component.

#### Returns

Type: `Promise<void>`

## Slots

| Slot                     | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
|                          | A slot for adding custom content.                                                |
| `"fab"`                  | A slot for adding a `calcite-fab` (floating action button) to perform an action. |
| `"footer"`               | A slot for adding custom content to the footer.                                  |
| `"footer-actions"`       | A slot for adding buttons to the footer.                                         |
| `"header-actions-end"`   | A slot for adding actions or content to the end side of the header.              |
| `"header-actions-start"` | A slot for adding actions or content to the start side of the header.            |
| `"header-content"`       | A slot for adding custom content to the header.                                  |
| `"header-menu-actions"`  | A slot for adding an overflow menu with actions inside a `calcite-dropdown`.     |

## Dependencies

### Depends on

- [calcite-action](../action)
- [calcite-panel](../panel)
- [calcite-tooltip](../tooltip)

### Graph

```mermaid
graph TD;
  calcite-flow-item --> calcite-action
  calcite-flow-item --> calcite-panel
  calcite-flow-item --> calcite-tooltip
  calcite-action --> calcite-loader
  calcite-action --> calcite-icon
  calcite-panel --> calcite-action
  calcite-panel --> calcite-action-menu
  calcite-panel --> calcite-scrim
  calcite-action-menu --> calcite-action
  calcite-action-menu --> calcite-popover
  calcite-popover --> calcite-action
  calcite-popover --> calcite-icon
  calcite-scrim --> calcite-loader
  style calcite-flow-item fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
