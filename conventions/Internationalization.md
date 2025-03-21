# Internationalization (i18n)

Typically, components allow users to supply text values via slots and attributes, but there are cases where components need to take additional steps to support internationalization.

### Formatting

Formatting of values, such as numbers and dates, for display should use the [`Intl` APIs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

### Styling/Layout

To add right-to-left (RTL) support to your components you should use [CSS Logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) within CSS. If you need to know direction in JavaScript, use the internal `getElementDir` helper in the dom utility.

Some CSS properties do not have logical equivalents. Such as...

- box-shadow
- text-shadow
- transform
- background-position

For these properties, you should use the internal `getElementDir` helper to apply the `CSS_UTILITY.rtl` class to your component.

## Translation (t9n)

Previously, components provided Intl props (`intl<Prop>`) to allow users to pass string translations. While this is still supported, for backwards compatibility, our components have translations built-in.

The following section covers how to add built-in translation support to components.

### `T9nComponent` pattern

This pattern enables components to support built-in translations. In order to support this, a component must:

1. Add the following translation bundles as component assets under a `t9n` folder (please refer to https://github.com/Esri/calcite-components/blob/master/conventions/README.md#assets for additional info on assets)
   1. `messages.json` – main bundle
   2. `messages_en.json` – locale-specific bundle (kept in sync with main one via scripts)
2. Implement the `T9nComponent` interface
   1. The `onMessagesChange` method must be empty as it is wired up by the support utils.
   2. The `onMessagesChange` method must also be configured with watchers for the messages properties as well as Intl props.
3. Use the `setUpMessages` util in the component's `componentWillLoad` lifecycle methods. This must be awaited on to have an initial set of strings available before rendering.
4. Use the `connectMessages`/`disconnectMessages` utils in the component's `connectedCallback`/`disconnectedCallback` lifecycle methods. This will set up and tear down supporting methods on the component.
5. Add an appropriate E2E test by using the `t9n` common test helper.

#### Notes

- This pattern depends on `LocalizedComponent` being implemented.
- `connectLocalized` (from `LocalizedComponent`) must be called before `connectMessages`.
- Although Intl props are supported, message overrides have the higher precedence.
- If a message string has a matching Intl prop, its translation bundle message keys must match the same prop name without the `intl` prefix (e.g., `intlClose` -> `close`)
- You can also look at the interface and util documentation for additional info.
- The internal `messages` prop should be used as the source of truth for translations in rendering.

## Translated strings

**Note ⚠️**: this pattern is deprecated and should no longer be followed for future components!

In the future it will likely become necessary to provide string translations for components. An example would be the `aria-label` for the `<calcite-modal>` close button. Initial research looks promising and we could likely implement one of these approaches and set a `lang` for each component.

- https://medium.com/stencil-tricks/implementing-internationalisation-i18n-with-stencil-5e6559554117 and https://codesandbox.io/s/43pmx55vo9
- https://github.com/ionic-team/ionic-stencil-conference-app/issues/69

Until we implement a `lang` facility and set up translations for all components, we have been allowing a small number of strings to be passed in as props. Props that represent translated strings should have the syntax: `text-label-x`, where `x` is the name for the string. For example, when providing a string from "Close", use the prop name `text-label-close`. In the component, these props should default to their English equivalent (this is useful for non-localized apps):

```
@Prop() textLabelClose: string = 'Close';
```
