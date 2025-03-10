# calcite-stepper

Calcite stepper can be used to present a stepper workflow to a user. It has configurable display options for layout (horizontal or vertical), and the ability to automatically render status icons, and step numbers.

<!-- Auto Generated Below -->

## Usage

### Basic

```html
<calcite-stepper icon numbered id="my-example-stepper">
  <calcite-stepper-item item-title="Choose method" item-subtitle="Add members without sending invitations" complete>
    Step 1 Content Goes Here
  </calcite-stepper-item>
  <calcite-stepper-item item-title="Compile member list" error> Step 2 Content Goes Here </calcite-stepper-item>
  <calcite-stepper-item item-title="Set member properties" item-subtitle="Some subtext" active>
    Step 3 Content Goes Here
  </calcite-stepper-item>
  <calcite-stepper-item item-title="Confirm and complete" item-subtitle="Disabled example" disabled>
    Step 4 Content Goes Here
  </calcite-stepper-item>
</calcite-stepper>
```

## Properties

| Property          | Attribute          | Description                                                                  | Type                                                                                                                                                                                                                                    | Default        |
| ----------------- | ------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `icon`            | `icon`             | When `true`, displays a status icon in the `calcite-stepper-item` heading.   | `boolean`                                                                                                                                                                                                                               | `false`        |
| `layout`          | `layout`           | Defines the layout of the component.                                         | `"horizontal" \| "vertical"`                                                                                                                                                                                                            | `"horizontal"` |
| `numbered`        | `numbered`         | When `true`, displays the step number in the `calcite-stepper-item` heading. | `boolean`                                                                                                                                                                                                                               | `false`        |
| `numberingSystem` | `numbering-system` | Specifies the Unicode numeral system used by the component for localization. | `"arab" \| "arabext" \| "bali" \| "beng" \| "deva" \| "fullwide" \| "gujr" \| "guru" \| "hanidec" \| "khmr" \| "knda" \| "laoo" \| "latn" \| "limb" \| "mlym" \| "mong" \| "mymr" \| "orya" \| "tamldec" \| "telu" \| "thai" \| "tibt"` | `undefined`    |
| `scale`           | `scale`            | Specifies the size of the component.                                         | `"l" \| "m" \| "s"`                                                                                                                                                                                                                     | `"m"`          |

## Events

| Event                      | Description                                           | Type                                        |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `calciteStepperItemChange` | Fires when the active `calcite-stepper-item` changes. | `CustomEvent<StepperItemChangeEventDetail>` |

## Methods

### `endStep() => Promise<void>`

Set the last `calcite-stepper-item` as active.

#### Returns

Type: `Promise<void>`

### `goToStep(step: number) => Promise<void>`

Set a specified `calcite-stepper-item` as active.

#### Returns

Type: `Promise<void>`

### `nextStep() => Promise<void>`

Set the next `calcite-stepper-item` as active.

#### Returns

Type: `Promise<void>`

### `prevStep() => Promise<void>`

Set the previous `calcite-stepper-item` as active.

#### Returns

Type: `Promise<void>`

### `startStep() => Promise<void>`

Set the first `calcite-stepper-item` as active.

#### Returns

Type: `Promise<void>`

## Slots

| Slot | Description                                |
| ---- | ------------------------------------------ |
|      | A slot for adding `calcite-stepper-item`s. |

---

_Built with [StencilJS](https://stenciljs.com/)_
