# calcite-action-menu

<!-- Auto Generated Below -->

## Properties

| Property             | Attribute             | Description                                                                                                                                                                                                                                                                                                                                                                 | Type                                                                      | Default      |
| -------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------ |
| `expanded`           | `expanded`            | When `true`, the component is expanded.                                                                                                                                                                                                                                                                                                                                     | `boolean`                                                                 | `false`      |
| `flipPlacements`     | --                    | Defines the available placements that can be used when a flip occurs.                                                                                                                                                                                                                                                                                                       | `Placement[]`                                                             | `undefined`  |
| `label` _(required)_ | `label`               | Specifies the text string for the component.                                                                                                                                                                                                                                                                                                                                | `string`                                                                  | `undefined`  |
| `open`               | `open`                | When `true`, the component is open.                                                                                                                                                                                                                                                                                                                                         | `boolean`                                                                 | `false`      |
| `overlayPositioning` | `overlay-positioning` | Determines the type of positioning to use for the overlaid content. Using `"absolute"` will work for most cases. The component will be positioned inside of overflowing parent containers and will affect the container's layout. `"fixed"` should be used to escape an overflowing parent container, or when the reference element's `position` CSS property is `"fixed"`. | `"absolute" \| "fixed"`                                                   | `"absolute"` |
| `placement`          | `placement`           | Determines where the component will be positioned relative to the `referenceElement`.                                                                                                                                                                                                                                                                                       | `Placement \| VariationPlacement \| AutoPlacement \| DeprecatedPlacement` | `"auto"`     |
| `scale`              | `scale`               | Specifies the size of the component's trigger `calcite-action`.                                                                                                                                                                                                                                                                                                             | `"l" \| "m" \| "s"`                                                       | `undefined`  |

## Events

| Event                         | Description                                                                                                                                     | Type               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `calciteActionMenuOpenChange` | Emits when the `open` property has changed. **Note:**: The event payload is deprecated, please use the `open` property on the component instead | `CustomEvent<any>` |

## Methods

### `setFocus() => Promise<void>`

Sets focus on the component.

#### Returns

Type: `Promise<void>`

## Slots

| Slot        | Description                                                       |
| ----------- | ----------------------------------------------------------------- |
|             | A slot for adding `calcite-action`s.                              |
| `"tooltip"` | A slot for adding an tooltip for the menu.                        |
| `"trigger"` | A slot for adding a `calcite-action` to trigger opening the menu. |

## Dependencies

### Used by

- [calcite-action-group](../action-group)
- [calcite-block](../block)
- [calcite-panel](../panel)

### Depends on

- [calcite-action](../action)
- [calcite-popover](../popover)

### Graph

```mermaid
graph TD;
  calcite-action-menu --> calcite-action
  calcite-action-menu --> calcite-popover
  calcite-action --> calcite-loader
  calcite-action --> calcite-icon
  calcite-popover --> calcite-action
  calcite-popover --> calcite-icon
  calcite-action-group --> calcite-action-menu
  calcite-block --> calcite-action-menu
  calcite-panel --> calcite-action-menu
  style calcite-action-menu fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
