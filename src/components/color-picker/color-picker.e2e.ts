import { accessible, defaults, hidden, reflects, renders, focusable, disabled } from "../../tests/commonTests";

import { CSS, DEFAULT_COLOR, DEFAULT_STORAGE_KEY_PREFIX, DIMENSIONS, TEXT } from "./resources";
import { E2EElement, E2EPage, EventSpy, newE2EPage } from "@stencil/core/testing";
import { ColorValue } from "./interfaces";
import SpyInstance = jest.SpyInstance;
import { GlobalTestProps, selectText, getElementXY } from "../../tests/utils";

describe("calcite-color-picker", () => {
  let consoleSpy: SpyInstance;

  async function clickScope(page: E2EPage, scope: "hue" | "color-field"): Promise<void> {
    // helps workaround puppeteer not being able to click on a 0x0 element
    // https://github.com/puppeteer/puppeteer/issues/4147#issuecomment-473208182
    await page.$eval(
      `calcite-color-picker`,
      (colorPicker: HTMLCalciteColorPickerElement, scopeSelector: string): void => {
        colorPicker.shadowRoot.querySelector<HTMLElement>(scopeSelector).click();
      },
      `.${scope === "hue" ? CSS.hueScope : CSS.colorFieldScope}`
    );
  }

  beforeEach(
    () =>
      (consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {
        // hide warning messages during test
      }))
  );

  afterEach(() => consoleSpy.mockClear());

  describe("is focusable", () => {
    it("should focus scope by default", async () =>
      focusable("<calcite-color-picker></calcite-color-picker>", {
        shadowFocusTargetSelector: `.${CSS.colorFieldScope}`
      }));
  });

  it("is accessible", async () => {
    await accessible("calcite-color-picker");
    await accessible("<calcite-color-picker allow-empty value=''></calcite-color-picker>");
  });

  it("can be hidden", async () => hidden("calcite-color-picker"));

  it("reflects", async () =>
    reflects("calcite-color-picker", [
      {
        propertyName: "appearance",
        value: "minimal"
      },
      {
        propertyName: "scale",
        value: "m"
      }
    ]));

  it("renders", async () => renders("calcite-color-picker", { display: "inline-block" }));

  it("has defaults", async () =>
    defaults("calcite-color-picker", [
      {
        propertyName: "allowEmpty",
        defaultValue: false
      },
      {
        propertyName: "appearance",
        defaultValue: "solid"
      },
      {
        propertyName: "format",
        defaultValue: "auto"
      },
      {
        propertyName: "intlB",
        defaultValue: TEXT.b
      },
      {
        propertyName: "intlBlue",
        defaultValue: TEXT.blue
      },
      {
        propertyName: "intlDeleteColor",
        defaultValue: TEXT["deleteColor"]
      },
      {
        propertyName: "intlG",
        defaultValue: TEXT.g
      },
      {
        propertyName: "intlGreen",
        defaultValue: TEXT.green
      },
      {
        propertyName: "intlH",
        defaultValue: TEXT.h
      },
      {
        propertyName: "intlHsv",
        defaultValue: TEXT["hsv"]
      },
      {
        propertyName: "intlHex",
        defaultValue: TEXT.hex
      },
      {
        propertyName: "intlHue",
        defaultValue: TEXT.hue
      },
      {
        propertyName: "intlNoColor",
        defaultValue: TEXT.noColor
      },
      {
        propertyName: "intlR",
        defaultValue: TEXT.r
      },
      {
        propertyName: "intlRed",
        defaultValue: TEXT.red
      },
      {
        propertyName: "intlRgb",
        defaultValue: TEXT.rgb
      },
      {
        propertyName: "intlS",
        defaultValue: TEXT.s
      },
      {
        propertyName: "intlSaturation",
        defaultValue: TEXT.saturation
      },
      {
        propertyName: "intlSaveColor",
        defaultValue: TEXT.saveColor
      },
      {
        propertyName: "intlSaved",
        defaultValue: TEXT.saved
      },
      {
        propertyName: "intlV",
        defaultValue: TEXT.v
      },
      {
        propertyName: "intlValue",
        defaultValue: TEXT.value
      },
      {
        propertyName: "scale",
        defaultValue: "m"
      },
      {
        propertyName: "value",
        defaultValue: "#007ac2"
      }
    ]));

  // #408047 is a color in the middle of the color field
  it("can be disabled", () => disabled("<calcite-color-picker value='#408047'></calcite-color-picker>"));

  it(`should set all internal calcite-button types to 'button'`, async () => {
    const page = await newE2EPage({
      html: "<calcite-color-picker></calcite-color-picker>"
    });

    const buttons = await page.findAll("calcite-color-picker >>> calcite-button");

    expect(buttons).toHaveLength(2);

    for (const button of buttons) {
      expect(await button.getProperty("type")).toBe("button");
    }
  });

  it.skip("emits event when value changes via user interaction and not programmatically", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-color-picker></calcite-color-picker>");
    const picker = await page.find("calcite-color-picker");
    const changeSpy = await picker.spyOnEvent("calciteColorPickerChange");
    const inputSpy = await picker.spyOnEvent("calciteColorPickerInput");
    const colorFieldCenterValueHex = "#408048";

    picker.setProperty("value", colorFieldCenterValueHex);
    await page.waitForChanges();

    expect(changeSpy).toHaveReceivedEventTimes(0);
    expect(inputSpy).toHaveReceivedEventTimes(0);

    // save for future test/assertion
    await (await page.find(`calcite-color-picker >>> .${CSS.saveColor}`)).click();

    // change by clicking on field
    await (await page.find(`calcite-color-picker >>> .${CSS.colorFieldAndSlider}`)).click();
    expect(changeSpy).toHaveReceivedEventTimes(1);
    expect(inputSpy).toHaveReceivedEventTimes(1);

    // change by clicking on hue
    let [hueScopeX, hueScopeY] = await getElementXY(page, "calcite-color-picker", `.${CSS.hueScope}`);
    await page.mouse.click(hueScopeX + 10, hueScopeY);
    await page.waitForChanges();
    expect(changeSpy).toHaveReceivedEventTimes(2);
    expect(inputSpy).toHaveReceivedEventTimes(2);

    // change by changing hex value
    const hexInput = await page.find(`calcite-color-picker >>> calcite-color-picker-hex-input`);
    await selectText(hexInput);
    await hexInput.type("fff");
    await hexInput.press("Enter");
    expect(changeSpy).toHaveReceivedEventTimes(3);
    expect(inputSpy).toHaveReceivedEventTimes(3);

    // change by changing color channels (we only test R and assume the same holds for G/B & H/S/V channels)
    const channelInput = await page.find(`calcite-color-picker >>> .${CSS.channel}`);
    await selectText(channelInput);
    await channelInput.type("254");
    await channelInput.press("Enter");
    expect(changeSpy).toHaveReceivedEventTimes(4);
    expect(inputSpy).toHaveReceivedEventTimes(4);

    // change by clicking stored color
    await (await page.find(`calcite-color-picker >>> .${CSS.savedColor}`)).click();
    expect(changeSpy).toHaveReceivedEventTimes(5);
    expect(inputSpy).toHaveReceivedEventTimes(5);

    // change by dragging color field thumb
    const mouseDragSteps = 10;
    const [colorFieldScopeX, colorFieldScopeY] = await getElementXY(
      page,
      "calcite-color-picker",
      `.${CSS.colorFieldScope}`
    );

    await page.mouse.move(colorFieldScopeX, colorFieldScopeY);
    await page.mouse.down();
    await page.mouse.move(colorFieldScopeX + 10, colorFieldScopeY, {
      steps: mouseDragSteps
    });
    await page.mouse.up();
    await page.waitForChanges();

    expect(changeSpy).toHaveReceivedEventTimes(6);
    expect(inputSpy.length).toBeGreaterThan(6); // input event fires more than once

    // change by dragging hue slider thumb
    [hueScopeX, hueScopeY] = await getElementXY(page, "calcite-color-picker", `.${CSS.hueScope}`);
    let previousInputEventLength = inputSpy.length;

    await page.mouse.move(hueScopeX, hueScopeY);
    await page.mouse.down();
    await page.mouse.move(hueScopeX + 10, hueScopeY, { steps: mouseDragSteps });
    await page.mouse.up();
    await page.waitForChanges();

    expect(changeSpy).toHaveReceivedEventTimes(7);
    expect(inputSpy.length).toBeGreaterThan(previousInputEventLength + 1); // input event fires more than once

    previousInputEventLength = inputSpy.length;

    // this portion covers an odd scenario where setting twice would cause the component to emit
    picker.setProperty("value", "colorFieldCenterValueHex");
    await page.waitForChanges();
    picker.setProperty("value", "#fff");
    await page.waitForChanges();

    expect(changeSpy).toHaveReceivedEventTimes(7);
    expect(inputSpy.length).toBe(previousInputEventLength);
  });

  it("does not emit on initialization", async () => {
    // initialize page with calcite-color-picker to make it available in the evaluate callback below
    const page = await newE2EPage({ html: "<calcite-color-picker></calcite-color-picker>" });
    await page.setContent("");

    const emitted = await page.evaluate(() => {
      const emitted = [];
      document.addEventListener("calciteColorPickerInput", () => emitted.push("input"));
      document.addEventListener("calciteColorPickerChange", () => emitted.push("change"));

      const picker = document.createElement("calcite-color-picker");
      picker.value = "rgb(255, 255, 255)";

      document.body.append(picker);

      return emitted;
    });

    expect(emitted).toHaveLength(0);
  });

  const supportedFormatToSampleValue = {
    hex: "#ffffff",
    "rgb-css": "rgb(255, 255, 255)",
    "hsl-css": "hsl(0, 0%, 100%)",
    rgb: { r: 255, g: 255, b: 255 },
    hsl: { h: 0, s: 0, l: 100 },
    hsv: { h: 0, s: 0, v: 100 }
  };

  const clearAndEnterHexOrChannelValue = async (
    page: E2EPage,
    channelInputOrHexInput: E2EElement,
    value: string
  ): Promise<void> => {
    await channelInputOrHexInput.callMethod("setFocus");
    await selectText(channelInputOrHexInput);

    const currentValue = await channelInputOrHexInput.getProperty("value");

    for (let i = 0; i < currentValue?.length; i++) {
      await page.keyboard.press("Backspace");
    }

    await channelInputOrHexInput.type(value);
    await page.keyboard.press("Enter");
    await page.waitForChanges();
  };

  function assertUnsupportedValueMessage(value: string | object | null, format: string): void {
    expect(consoleSpy).toBeCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(
          `\\s*ignoring color value \\(${value}\\) as it is not compatible with the current format \\(${format}\\)\\s*`
        )
      )
    );
  }

  describe("color format", () => {
    describe("when set initially", () => {
      let page: E2EPage;
      let spy: EventSpy;

      beforeEach(async () => {
        page = await newE2EPage();
        spy = await page.spyOnEvent("calciteColorPickerChange");
      });

      function assertNoChangeEvents(): void {
        expect(spy).toHaveReceivedEventTimes(0);
      }

      // this suite uses a subset of supported formats as other tests cover the rest

      it("changes the default value to the format", async () => {
        await page.setContent("<calcite-color-picker format='rgb'></calcite-color-picker>");
        const color = await page.find("calcite-color-picker");

        expect(await color.getProperty("value")).toEqual(DEFAULT_COLOR.rgb().round().object());
        assertNoChangeEvents();
      });

      it("initial value and format are both set if compatible", async () => {
        const initialValue = "rgb(255, 128, 255)";
        await page.setContent(`<calcite-color-picker format='rgb-css' value='${initialValue}'></calcite-color-picker>`);
        const color = await page.find("calcite-color-picker");

        const initialValueIsRendered = await page.$eval(
          "calcite-color-picker",
          (picker: HTMLCalciteColorPickerElement, initialValue: string) =>
            // color prop is used to render the active color
            picker.color.string() === initialValue,
          initialValue
        );

        expect(await color.getProperty("value")).toEqual(initialValue);
        expect(initialValueIsRendered).toBe(true);
        assertNoChangeEvents();
      });

      it("falls back to format-compliant default if initial value is not compatible with initial format", async () => {
        await page.setContent("<calcite-color-picker format='hsl-css' value='#f00f00'></calcite-color-picker>");
        const color = await page.find("calcite-color-picker");

        expect(await color.getProperty("value")).toEqual(DEFAULT_COLOR.hsl().round().string());
        assertNoChangeEvents();
      });
    });

    it("allows specifying the color value format", async () => {
      const page = await newE2EPage({
        html: "<calcite-color-picker></calcite-color-picker>"
      });

      const color = await page.find("calcite-color-picker");

      for (const format in supportedFormatToSampleValue) {
        const expectedValue = supportedFormatToSampleValue[format];

        // set base format and value to test setting different format values
        color.setProperty("format", format);
        color.setProperty("value", expectedValue);
        await page.waitForChanges();

        for (const format in supportedFormatToSampleValue) {
          const currentTestValue = supportedFormatToSampleValue[format];
          color.setProperty("value", currentTestValue);
          await page.waitForChanges();

          // non-matching formats are ignored
          expect(await color.getProperty("value")).toEqual(expectedValue);
        }
      }
    });

    it("changing format updates value", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker value=${supportedFormatToSampleValue["hex"]}></calcite-color-picker>`
      });
      const color = await page.find("calcite-color-picker");

      for (const format in supportedFormatToSampleValue) {
        color.setProperty("format", format);
        await page.waitForChanges();

        expect(await color.getProperty("value")).toEqual(supportedFormatToSampleValue[format]);
      }
    });
  });

  it("accepts multiple color value formats", async () => {
    const page = await newE2EPage({
      html: "<calcite-color-picker></calcite-color-picker>"
    });
    const picker = await page.find("calcite-color-picker");

    const supportedStringFormats = [
      supportedFormatToSampleValue.hex,
      supportedFormatToSampleValue["rgb-css"],
      supportedFormatToSampleValue["hsl-css"]
    ];

    for (const value of supportedStringFormats) {
      picker.setProperty("value", value);
      await page.waitForChanges();

      expect(await picker.getProperty("value")).toBe(value);
    }

    const supportedObjectFormats = [
      supportedFormatToSampleValue.rgb,
      supportedFormatToSampleValue.hsl,
      supportedFormatToSampleValue.hsv
    ];

    for (const value of supportedObjectFormats) {
      picker.setProperty("value", value);
      await page.waitForChanges();

      expect(await picker.getProperty("value")).toMatchObject(value);
    }
  });

  it("allows selecting colors via color field/slider", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-color-picker value='#000' scale='m'></calcite-color-picker>");
    const picker = await page.find(`calcite-color-picker`);
    const spy = await picker.spyOnEvent("calciteColorPickerChange");
    let changes = 0;
    const mediumScaleDimensions = DIMENSIONS.m;
    const widthOffset = 0.5;
    const [fieldAndSliderX, fieldAndSliderY] = await getElementXY(page, "calcite-color-picker", "canvas");

    // clicking color field colors to pick a color
    await page.mouse.click(fieldAndSliderX, fieldAndSliderY);
    expect(await picker.getProperty("value")).toBe("#ffffff");
    expect(spy).toHaveReceivedEventTimes(++changes);

    await page.mouse.click(fieldAndSliderX, fieldAndSliderY + mediumScaleDimensions.colorField.height);
    expect(await picker.getProperty("value")).toBe("#000000");
    expect(spy).toHaveReceivedEventTimes(++changes);

    await page.mouse.click(fieldAndSliderX + mediumScaleDimensions.colorField.width - widthOffset, fieldAndSliderY);
    expect(await picker.getProperty("value")).toBe("#ff0000");
    expect(spy).toHaveReceivedEventTimes(++changes);

    await page.mouse.click(
      fieldAndSliderX + mediumScaleDimensions.colorField.width - widthOffset,
      fieldAndSliderY + mediumScaleDimensions.colorField.height
    );
    expect(await picker.getProperty("value")).toBe("#000000");
    expect(spy).toHaveReceivedEventTimes(++changes);

    // set to corner right value that's not red (first value)
    picker.setProperty("value", "#ff0");
    await page.waitForChanges();
    expect(spy).toHaveReceivedEventTimes(changes);

    // clicking on color slider to set hue
    const colorsToSample = 7;
    const offsetX = (mediumScaleDimensions.slider.width - widthOffset) / colorsToSample;
    let x = fieldAndSliderX;

    const sliderHeight =
      fieldAndSliderY + mediumScaleDimensions.colorField.height + mediumScaleDimensions.slider.height;

    const expectedColorSamples = [
      "#ff0000",
      "#ffd900",
      "#48ff00",
      "#00ff91",
      "#0095ff",
      "#4800ff",
      "#ff00dd",
      "#ff0004"
    ];

    for (let i = 0; i < expectedColorSamples.length; i++) {
      const expectedColor = expectedColorSamples[i];

      await page.mouse.click(x, sliderHeight);
      expect(await picker.getProperty("value")).toBe(expectedColor);
      expect(spy).toHaveReceivedEventTimes(++changes);

      x += offsetX;
    }

    // clicking on the slider when the color won't change by hue adjustments

    picker.setProperty("value", "#000");
    await page.waitForChanges();
    expect(spy).toHaveReceivedEventTimes(changes);

    x = 0;

    type TestWindow = GlobalTestProps<{
      internalColor: HTMLCalciteColorPickerElement["color"];
    }>;

    await page.evaluateHandle(() => {
      const color = document.querySelector("calcite-color-picker");
      (window as TestWindow).internalColor = color.color;
    });

    const middleOfSlider = mediumScaleDimensions.slider.width / 2;
    await page.mouse.click(x + middleOfSlider, sliderHeight);

    const internalColorChanged = await page.evaluate(() => {
      const color = document.querySelector("calcite-color-picker");
      return (window as TestWindow).internalColor !== color.color;
    });

    expect(internalColorChanged).toBe(true);
    expect(spy).toHaveReceivedEventTimes(++changes);
  });

  it("keeps tracking mouse movement when a thumb is actively dragged", async () => {
    const page = await newE2EPage({
      html: "<calcite-color-picker></calcite-color-picker>"
    });
    const picker = await page.find(`calcite-color-picker`);
    const colorFieldAndSlider = await page.find(`calcite-color-picker >>> .${CSS.colorFieldAndSlider}`);

    await colorFieldAndSlider.click(); // click middle color

    let lastColor = await picker.getProperty("value");

    await page.mouse.down();
    await page.mouse.move(1000, -1000); // top-right

    // note that we move the mouse in this order to guarantee value changes (bottom row is #000)

    let currentColor = await picker.getProperty("value");
    expect(currentColor).not.toEqual(lastColor);
    lastColor = currentColor;

    await page.mouse.move(-1000, 1000); // bottom-left
    currentColor = await picker.getProperty("value");
    expect(currentColor).not.toEqual(lastColor);
    lastColor = currentColor;

    await page.mouse.move(-1000, -1000); // top-left
    currentColor = await picker.getProperty("value");
    expect(currentColor).not.toEqual(lastColor);
    lastColor = currentColor;

    await page.mouse.move(1000, 1000); // bottom-right
    currentColor = await picker.getProperty("value");
    expect(currentColor).not.toEqual(lastColor);
    lastColor = currentColor;

    // no longer tracks
    await page.mouse.up();

    await page.mouse.move(1000, -1000); // top-right

    currentColor = await picker.getProperty("value");
    expect(currentColor).toEqual(lastColor);
    lastColor = currentColor;

    await page.mouse.move(-1000, 1000); // bottom-left
    currentColor = await picker.getProperty("value");
    expect(currentColor).toEqual(lastColor);
    lastColor = currentColor;

    await page.mouse.move(-1000, -1000); // top-left
    currentColor = await picker.getProperty("value");
    expect(currentColor).toEqual(lastColor);
    lastColor = currentColor;

    await page.mouse.move(1000, 1000); // bottom-right
    currentColor = await picker.getProperty("value");
    expect(currentColor).toEqual(lastColor);
  });

  it(`mouse movement tracking is not offset by the component's padding (mimics issue from #3041 when the component was placed within another component's shadow DOM)`, async () => {
    const colorFieldCenterValueHsv = { h: 127, s: 50, v: 50 };

    const page = await newE2EPage({
      html: `<calcite-color-picker style='padding: 10px;'></calcite-color-picker>`
    });
    const colorPicker = await page.find("calcite-color-picker");

    colorPicker.setProperty("value", colorFieldCenterValueHsv);
    await page.waitForChanges();

    // change by dragging color field thumb
    const [colorFieldScopeX, colorFieldScopeY] = await getElementXY(
      page,
      "calcite-color-picker",
      `.${CSS.colorFieldScope}`
    );

    await page.mouse.move(colorFieldScopeX, colorFieldScopeY);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForChanges();

    const beforeDragHsv = await colorPicker.getProperty("value");

    await page.mouse.down();
    await page.mouse.move(colorFieldScopeX + 10, colorFieldScopeY);
    await page.mouse.up();
    await page.waitForChanges();

    const afterDragHsv = await colorPicker.getProperty("value");

    expect(afterDragHsv.h).toBe(beforeDragHsv.h);
    expect(afterDragHsv.s).toBeGreaterThan(beforeDragHsv.s);
    expect(afterDragHsv.v).toBe(beforeDragHsv.v);
  });

  describe("unsupported value handling", () => {
    let page: E2EPage;

    async function assertUnsupportedValue(page: E2EPage, unsupportedValue: string | null): Promise<void> {
      const picker = await page.find("calcite-color-picker");
      const spy = await picker.spyOnEvent("calciteColorPickerChange");
      const currentValue = await picker.getProperty("value");
      const format = await picker.getProperty("format");
      picker.setProperty("value", unsupportedValue);
      await page.waitForChanges();

      expect(await picker.getProperty("value")).toBe(currentValue);
      expect(spy).toHaveReceivedEventTimes(0);

      assertUnsupportedValueMessage(unsupportedValue, format);
    }

    beforeEach(async () => {
      page = await newE2EPage({
        html: "<calcite-color-picker></calcite-color-picker>"
      });
    });

    it("ignores unsupported value types", () => assertUnsupportedValue(page, "unsupported-color-format"));

    it("ignores null when not allowed", () => assertUnsupportedValue(page, null));
  });

  it("normalizes shorthand CSS hex", async () => {
    const page = await newE2EPage({
      html: "<calcite-color-picker></calcite-color-picker>"
    });
    const picker = await page.find("calcite-color-picker");

    picker.setProperty("value", "#ABC");
    await page.waitForChanges();

    expect(await picker.getProperty("value")).toBe("#aabbcc");
  });

  it("has backdoor color prop for advanced use cases", async () => {
    const page = await newE2EPage({
      html: "<calcite-color-picker></calcite-color-picker>"
    });
    const picker = await page.find("calcite-color-picker");

    expect(await picker.getProperty("color")).toBeTruthy();
  });

  describe("initial value used to initialize internal color", () => {
    const initialColor = supportedFormatToSampleValue.hex;

    async function getInternalColorAsHex(page: E2EPage): Promise<string> {
      return page.$eval("calcite-color-picker", (picker: HTMLCalciteColorPickerElement) =>
        picker.color.hex().toLowerCase()
      );
    }

    it("value as attribute", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker value="${initialColor}"></calcite-color-picker>`
      });

      expect(await getInternalColorAsHex(page)).toBe(initialColor);
    });

    it("value as property", async () => {
      // initialize page with calcite-color-picker to make it available in the evaluate callback below
      const page = await newE2EPage({
        html: "<calcite-color-picker></calcite-color-picker>"
      });
      await page.setContent("");

      await page.evaluate(async (color) => {
        const picker = document.createElement("calcite-color-picker");
        picker.value = color;
        document.body.append(picker);

        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }, initialColor);

      expect(await getInternalColorAsHex(page)).toBe(initialColor);
    });
  });

  describe("color inputs", () => {
    describe("keeps value in same format when applying updates", () => {
      let page: E2EPage;
      let picker: E2EElement;

      beforeEach(async () => {
        page = await newE2EPage({
          html: "<calcite-color-picker></calcite-color-picker>"
        });
        picker = await page.find("calcite-color-picker");
      });

      const updateColorWithAllInputs = async (assertColorUpdate: (value: ColorValue) => void): Promise<void> => {
        const hexInput = await page.find(`calcite-color-picker >>> calcite-color-picker-hex-input`);

        await clearAndEnterHexOrChannelValue(page, hexInput, "abc");

        assertColorUpdate(await picker.getProperty("value"));

        const [rgbModeButton, hsvModeButton] = await page.findAll(`calcite-color-picker >>> .${CSS.colorMode}`);
        const [rInput, gInput, bInput, hInput, sInput, vInput] = await page.findAll(
          `calcite-color-picker >>> calcite-input.${CSS.channel}`
        );

        await rgbModeButton.click();

        await clearAndEnterHexOrChannelValue(page, rInput, "128");
        await clearAndEnterHexOrChannelValue(page, gInput, "64");
        await clearAndEnterHexOrChannelValue(page, bInput, "32");

        assertColorUpdate(await picker.getProperty("value"));

        await hsvModeButton.click();

        await clearAndEnterHexOrChannelValue(page, hInput, "180");
        await clearAndEnterHexOrChannelValue(page, sInput, "90");
        await clearAndEnterHexOrChannelValue(page, vInput, "45");

        assertColorUpdate(await picker.getProperty("value"));
      };

      // see https://jasmine.github.io/tutorials/custom_argument_matchers for more info
      function toBeInteger(): any {
        return {
          asymmetricMatch(abc): boolean {
            return Number.isInteger(abc);
          },

          jasmineToString(): string {
            return `Expected value to be an integer.`;
          }
        };
      }

      it("supports hex", async () => {
        const hex = supportedFormatToSampleValue.hex;
        picker.setProperty("value", hex);
        await page.waitForChanges();

        await updateColorWithAllInputs((value: ColorValue) => {
          expect(value).not.toBe(hex);
          expect(value).toMatch(/^#[a-f0-9]{6}$/);
        });

        expect(() => assertUnsupportedValueMessage(hex, "auto")).toThrow();
      });

      it("supports rgb", async () => {
        const rgbCss = supportedFormatToSampleValue["rgb-css"];
        picker.setProperty("value", rgbCss);
        await page.waitForChanges();

        await updateColorWithAllInputs((value: ColorValue) => {
          expect(value).not.toBe(rgbCss);
          expect(value).toMatch(/^rgb\(\d+, \d+, \d+\)/);
        });

        expect(() => assertUnsupportedValueMessage(rgbCss, "auto")).toThrow();
      });

      it("supports hsl", async () => {
        const hslCss = supportedFormatToSampleValue["hsl-css"];
        picker.setProperty("value", hslCss);
        await page.waitForChanges();

        await updateColorWithAllInputs((value: ColorValue) => {
          expect(value).not.toBe(hslCss);
          expect(value).toMatch(/^hsl\([0-9.]+, [0-9.]+%, [0-9.]+%\)/);
        });

        expect(() => assertUnsupportedValueMessage(hslCss, "auto")).toThrow();
      });

      it("supports rgb (object)", async () => {
        const rgbObject = supportedFormatToSampleValue.rgb;
        picker.setProperty("value", rgbObject);
        await page.waitForChanges();

        await updateColorWithAllInputs((value: ColorValue) => {
          expect(value).not.toMatchObject(rgbObject);
          expect(value).toMatchObject({
            r: toBeInteger(),
            g: toBeInteger(),
            b: toBeInteger()
          });
        });

        expect(() => assertUnsupportedValueMessage(rgbObject, "auto")).toThrow();
      });

      it("supports hsl (object)", async () => {
        const hslObject = supportedFormatToSampleValue.hsl;
        picker.setProperty("value", hslObject);
        await page.waitForChanges();

        await updateColorWithAllInputs((value: ColorValue) => {
          expect(value).not.toMatchObject(hslObject);
          expect(value).toMatchObject({
            h: toBeInteger(),
            s: toBeInteger(),
            l: toBeInteger()
          });
        });

        expect(() => assertUnsupportedValueMessage(hslObject, "auto")).toThrow();
      });

      it("supports hsv (object)", async () => {
        const hsvObject = supportedFormatToSampleValue.hsv;
        picker.setProperty("value", hsvObject);
        await page.waitForChanges();

        await updateColorWithAllInputs((value: ColorValue) => {
          expect(value).not.toMatchObject(hsvObject);
          expect(value).toMatchObject({
            h: toBeInteger(),
            s: toBeInteger(),
            v: toBeInteger()
          });
        });

        expect(() => assertUnsupportedValueMessage(hsvObject, "auto")).toThrow();
      });
    });

    describe("color gets propagated to support inputs", () => {
      describe("valid color", () => {
        it("color gets propagated to hex, RGB & HSV inputs", async () => {
          const page = await newE2EPage({
            html: "<calcite-color-picker value='#fff000'></calcite-color-picker>"
          });

          const hexInput = await page.find(`calcite-color-picker >>> calcite-color-picker-hex-input`);

          expect(await hexInput.getProperty("value")).toBe("#fff000");

          const [rgbModeButton, hsvModeButton] = await page.findAll(`calcite-color-picker >>> .${CSS.colorMode}`);
          const [rInput, gInput, bInput, hInput, sInput, vInput] = await page.findAll(
            `calcite-color-picker >>> calcite-input.${CSS.channel}`
          );

          await rgbModeButton.click();

          expect(await rInput.getProperty("value")).toBe("255");
          expect(await gInput.getProperty("value")).toBe("240");
          expect(await bInput.getProperty("value")).toBe("0");

          await hsvModeButton.click();

          expect(await hInput.getProperty("value")).toBe("56");
          expect(await sInput.getProperty("value")).toBe("100");
          expect(await vInput.getProperty("value")).toBe("100");
        });

        it("allows modifying color via hex, RGB, HSV inputs", async () => {
          const page = await newE2EPage({
            html: "<calcite-color-picker value='#fff'></calcite-color-picker>"
          });
          const picker = await page.find("calcite-color-picker");

          const hexInput = await page.find(`calcite-color-picker >>> calcite-color-picker-hex-input`);
          await clearAndEnterHexOrChannelValue(page, hexInput, "abc");

          expect(await picker.getProperty("value")).toBe("#aabbcc");

          const [rgbModeButton, hsvModeButton] = await page.findAll(`calcite-color-picker >>> .${CSS.colorMode}`);
          const [rInput, gInput, bInput, hInput, sInput, vInput] = await page.findAll(
            `calcite-color-picker >>> calcite-input.${CSS.channel}`
          );

          await rgbModeButton.click();

          await clearAndEnterHexOrChannelValue(page, rInput, "128");
          await clearAndEnterHexOrChannelValue(page, gInput, "64");
          await clearAndEnterHexOrChannelValue(page, bInput, "32");

          expect(await picker.getProperty("value")).toBe("#804020");

          await hsvModeButton.click();

          await clearAndEnterHexOrChannelValue(page, hInput, "180");
          await clearAndEnterHexOrChannelValue(page, sInput, "90");
          await clearAndEnterHexOrChannelValue(page, vInput, "45");

          expect(await picker.getProperty("value")).toBe("#0b7373");
        });

        it.skip("allows nudging values", async () => {
          const assertChannelValueNudge = async (page: E2EPage, calciteInput: E2EElement): Promise<void> => {
            await calciteInput.callMethod("setFocus");
            const currentValue = await calciteInput.getProperty("value");

            await page.keyboard.press("ArrowUp");
            expect(await calciteInput.getProperty("value")).toBe(`${Number(currentValue) + 1}`);

            await page.keyboard.press("ArrowDown");
            expect(await calciteInput.getProperty("value")).toBe(currentValue);

            await page.keyboard.down("Shift");
            await page.keyboard.press("ArrowUp");
            await page.keyboard.up("Shift");
            expect(await calciteInput.getProperty("value")).toBe(`${Number(currentValue) + 10}`);

            await page.keyboard.down("Shift");
            await page.keyboard.press("ArrowDown");
            await page.keyboard.up("Shift");
            expect(await calciteInput.getProperty("value")).toBe(currentValue);
          };

          const page = await newE2EPage({
            html: "<calcite-color-picker value='#408048'></calcite-color-picker>"
          });

          const [rgbModeButton, hsvModeButton] = await page.findAll(`calcite-color-picker >>> .${CSS.colorMode}`);
          const [rInput, gInput, bInput, hInput, sInput, vInput] = await page.findAll(
            `calcite-color-picker >>> calcite-input.${CSS.channel}`
          );

          await rgbModeButton.click();

          await assertChannelValueNudge(page, rInput);
          await assertChannelValueNudge(page, gInput);
          await assertChannelValueNudge(page, bInput);

          await hsvModeButton.click();

          await assertChannelValueNudge(page, hInput);
          await assertChannelValueNudge(page, sInput);
          await assertChannelValueNudge(page, vInput);
        });
      });

      describe("when no-color", () => {
        it("color gets propagated to hex, RGB & HSV inputs", async () => {
          const page = await newE2EPage({
            html: "<calcite-color-picker allow-empty value=''></calcite-color-picker>"
          });

          const hexInput = await page.find(`calcite-color-picker >>> calcite-color-picker-hex-input`);

          expect(await hexInput.getProperty("value")).toBe(null);

          const [rgbModeButton, hsvModeButton] = await page.findAll(`calcite-color-picker >>> .${CSS.colorMode}`);
          const [rInput, gInput, bInput, hInput, sInput, vInput] = await page.findAll(
            `calcite-color-picker >>> calcite-input.${CSS.channel}`
          );

          await rgbModeButton.click();

          expect(await rInput.getProperty("value")).toBe("");
          expect(await gInput.getProperty("value")).toBe("");
          expect(await bInput.getProperty("value")).toBe("");

          await hsvModeButton.click();

          expect(await hInput.getProperty("value")).toBe("");
          expect(await sInput.getProperty("value")).toBe("");
          expect(await vInput.getProperty("value")).toBe("");
        });

        describe("clearing color via supporting inputs", () => {
          it("clears color via hex input", async () => {
            const page = await newE2EPage({
              html: "<calcite-color-picker allow-empty value='#c0ff33'></calcite-color-picker>"
            });
            const picker = await page.find("calcite-color-picker");

            const hexInput = await page.find(`calcite-color-picker >>> calcite-color-picker-hex-input`);
            await clearAndEnterHexOrChannelValue(page, hexInput, "");

            expect(await picker.getProperty("value")).toBe(null);
          });

          it("clears color via RGB channel inputs", async () => {
            const page = await newE2EPage({
              html: "<calcite-color-picker allow-empty value='#c0ff33'></calcite-color-picker>"
            });
            const picker = await page.find("calcite-color-picker");

            const [rgbModeButton] = await page.findAll(`calcite-color-picker >>> .${CSS.colorMode}`);
            const [rInput, gInput, bInput] = await page.findAll(
              `calcite-color-picker >>> calcite-input.${CSS.channel}`
            );

            await rgbModeButton.click();

            await clearAndEnterHexOrChannelValue(page, rInput, "");

            // clearing one clears the rest
            expect(await gInput.getProperty("value")).toBe("");
            expect(await bInput.getProperty("value")).toBe("");

            expect(await picker.getProperty("value")).toBeNull();
          });

          it("clears color via HSV channel inputs", async () => {
            const page = await newE2EPage({
              html: "<calcite-color-picker allow-empty value='#c0ff33'></calcite-color-picker>"
            });
            const picker = await page.find("calcite-color-picker");

            const [, hsvModeButton] = await page.findAll(`calcite-color-picker >>> .${CSS.colorMode}`);

            const [, , , hInput, sInput, vInput] = await page.findAll(
              `calcite-color-picker >>> calcite-input.${CSS.channel}`
            );

            await hsvModeButton.click();

            await clearAndEnterHexOrChannelValue(page, hInput, "");

            // clearing one clears the rest
            expect(await sInput.getProperty("value")).toBe("");
            expect(await vInput.getProperty("value")).toBe("");

            expect(await picker.getProperty("value")).toBeNull();
          });
        });

        it("restores previous color value when a nudge key is pressed", async () => {
          const consistentRgbHsvChannelValue = "0";
          const initialValue = "#".padEnd(7, consistentRgbHsvChannelValue);

          const assertChannelValueNudge = async (page: E2EPage, calciteInput: E2EElement): Promise<void> => {
            await calciteInput.callMethod("setFocus");
            await clearAndEnterHexOrChannelValue(page, calciteInput, "");

            // using page.waitForChanges as keyboard nudges occur in the next frame

            await page.keyboard.press("ArrowUp");
            await page.waitForChanges();
            expect(await calciteInput.getProperty("value")).toBe(consistentRgbHsvChannelValue);

            await clearAndEnterHexOrChannelValue(page, calciteInput, "");

            await page.keyboard.press("ArrowDown");
            await page.waitForChanges();
            expect(await calciteInput.getProperty("value")).toBe(consistentRgbHsvChannelValue);

            await clearAndEnterHexOrChannelValue(page, calciteInput, "");

            await page.keyboard.down("Shift");
            await page.keyboard.press("ArrowUp");
            await page.keyboard.up("Shift");
            await page.waitForChanges();
            expect(await calciteInput.getProperty("value")).toBe(consistentRgbHsvChannelValue);

            await clearAndEnterHexOrChannelValue(page, calciteInput, "");

            await page.keyboard.down("Shift");
            await page.keyboard.press("ArrowDown");
            await page.keyboard.up("Shift");
            await page.waitForChanges();
            expect(await calciteInput.getProperty("value")).toBe(consistentRgbHsvChannelValue);
          };

          const page = await newE2EPage({
            html: `<calcite-color-picker allow-empty value='${initialValue}'></calcite-color-picker>`
          });

          const [rgbModeButton, hsvModeButton] = await page.findAll(`calcite-color-picker >>> .${CSS.colorMode}`);
          const [rInput, gInput, bInput, hInput, sInput, vInput] = await page.findAll(
            `calcite-color-picker >>> calcite-input.${CSS.channel}`
          );

          await rgbModeButton.click();

          await assertChannelValueNudge(page, rInput);
          await assertChannelValueNudge(page, gInput);
          await assertChannelValueNudge(page, bInput);

          await hsvModeButton.click();

          await assertChannelValueNudge(page, hInput);
          await assertChannelValueNudge(page, sInput);
          await assertChannelValueNudge(page, vInput);
        });

        it("changes the value to the specified format after being empty", async () => {
          const page = await newE2EPage({
            html: "<calcite-color-picker allow-empty value='' format='rgb'></calcite-color-picker>"
          });
          const color = await page.find("calcite-color-picker");

          const hexInput = await page.find(`calcite-color-picker >>> calcite-color-picker-hex-input`);
          await clearAndEnterHexOrChannelValue(page, hexInput, supportedFormatToSampleValue.hex);

          expect(await color.getProperty("value")).toEqual(supportedFormatToSampleValue.rgb);
        });
      });
    });
  });

  describe("color storage", () => {
    const storageId = "test-storage-id";
    const color1 = "#ff00ff";
    const color2 = "#beefee";

    async function clearStorage(): Promise<void> {
      const storageKey = `${DEFAULT_STORAGE_KEY_PREFIX}${storageId}`;
      const page = await newE2EPage({
        html: `<calcite-color-picker></calcite-color-picker>`
      });
      await page.evaluate((storageKey) => localStorage.removeItem(storageKey), [storageKey]);
    }

    beforeAll(clearStorage);
    afterAll(clearStorage);

    it("allows saving unique colors", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker storage-id=${storageId}></calcite-color-picker>`
      });

      const picker = await page.find("calcite-color-picker");
      const saveColor = await page.find(`calcite-color-picker >>> .${CSS.saveColor}`);
      await saveColor.click();

      picker.setProperty("value", color1);
      await page.waitForChanges();
      await saveColor.click();

      picker.setProperty("value", color2);
      await page.waitForChanges();
      await saveColor.click();

      picker.setProperty("value", color1);
      await page.waitForChanges();
      await saveColor.click();

      picker.setProperty("value", color2);
      await page.waitForChanges();
      await saveColor.click();

      const savedColors = await page.findAll(
        `calcite-color-picker >>> .${CSS.savedColors} calcite-color-picker-swatch`
      );
      expect(savedColors).toHaveLength(3);
    });

    it("loads saved colors", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker storage-id=${storageId}></calcite-color-picker>`
      });

      const savedColors = await page.findAll(
        `calcite-color-picker >>> .${CSS.savedColors} calcite-color-picker-swatch`
      );
      expect(savedColors).toHaveLength(3);
    });

    it("allows removing stored colors", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker storage-id=${storageId}></calcite-color-picker>`
      });

      const picker = await page.find("calcite-color-picker");
      const saveColor = await page.find(`calcite-color-picker >>> .${CSS.saveColor}`);
      await saveColor.click();

      picker.setProperty("value", color1);
      await page.waitForChanges();
      await saveColor.click();

      picker.setProperty("value", color2);
      await page.waitForChanges();
      await saveColor.click();

      const saved: E2EElement[] = await page.findAll(
        `calcite-color-picker >>> .${CSS.savedColors} calcite-color-picker-swatch`
      );
      let expectedSaved = 3;

      const removeColor = await page.find(`calcite-color-picker >>> .${CSS.deleteColor}`);

      for (const swatch of saved) {
        await swatch.click();
        await removeColor.click();

        expect(
          await page.findAll(`calcite-color-picker >>> .${CSS.savedColors} calcite-color-picker-swatch`)
        ).toHaveLength(--expectedSaved);
      }
    });

    it("does not allow saving/removing when no-color is set", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker allow-empty value=""></calcite-color-picker>`
      });

      const saveColor = await page.find(`calcite-color-picker >>> .${CSS.saveColor}`);
      const removeColor = await page.find(`calcite-color-picker >>> .${CSS.deleteColor}`);

      expect(await saveColor.getProperty("disabled")).toBe(true);
      expect(await removeColor.getProperty("disabled")).toBe(true);
    });
  });

  it("allows setting no-color", async () => {
    const page = await newE2EPage({
      html: `<calcite-color-picker allow-empty></calcite-color-picker>`
    });

    const color = await page.find("calcite-color-picker");

    expect(await color.getProperty("value")).not.toBe(null);
    expect(await color.getProperty("color")).not.toBe(null);

    color.setProperty("value", null);
    await page.waitForChanges();

    expect(await color.getProperty("value")).toBe(null);
    expect(await color.getProperty("color")).toBe(null);

    expect(() => assertUnsupportedValueMessage(null, "auto")).toThrow();
  });

  it("allows hiding sections", async () => {
    const page = await newE2EPage({
      html: `<calcite-color-picker></calcite-color-picker>`
    });

    type HiddenSection = "hex" | "channels" | "saved";

    async function assertHiddenSection(hiddenSections: HiddenSection[]): Promise<void> {
      const sectionVisibility: Record<HiddenSection, boolean> = {
        hex: true,
        channels: true,
        saved: true
      };

      hiddenSections.forEach((section) => (sectionVisibility[section] = false));

      const color = await page.find("calcite-color-picker");
      const sections = Object.keys(sectionVisibility);

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const hideSectionProp = `hide${section.charAt(0).toUpperCase() + section.slice(1)}`;

        color.setProperty(hideSectionProp, !sectionVisibility[section]);
        await page.waitForChanges();
      }

      const [hex, channels, saved] = await Promise.all([
        page.find(`calcite-color-picker >>> .${CSS.hexOptions}`),
        page.find(`calcite-color-picker >>> .${CSS.colorModeContainer}`),
        page.find(`calcite-color-picker >>> .${CSS.savedColors}`)
      ]);

      const sectionNodes: Record<HiddenSection, E2EElement> = {
        hex,
        channels,
        saved
      };

      sections.forEach((section) => {
        const node = sectionNodes[section];
        const visible = sectionVisibility[section];

        expect(node)[visible ? "toBeDefined" : "toBeNull"]();
      });
    }

    await assertHiddenSection(["hex", "channels", "saved"]);
    await assertHiddenSection(["hex", "channels"]);
    await assertHiddenSection(["hex", "saved"]);
    await assertHiddenSection(["hex"]);
    await assertHiddenSection(["channels", "saved"]);
    await assertHiddenSection(["saved"]);
    await assertHiddenSection(["channels"]);
    await assertHiddenSection([]);
  });

  describe("scope keyboard interaction", () => {
    it("allows editing color field via keyboard", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker allow-empty value=""></calcite-color-picker>`
      });

      const picker = await page.find("calcite-color-picker");
      const scope = await page.find(`calcite-color-picker >>> .${CSS.scope}`);

      await scope.press("Tab");
      expect(await picker.getProperty("value")).toBeFalsy();
      await scope.press("ArrowDown");
      expect(await picker.getProperty("value")).toBe("#ffffff");
      await scope.press("ArrowDown");
      expect(await picker.getProperty("value")).toBe("#ededed");
      await scope.press("ArrowDown");
      expect(await picker.getProperty("value")).toBe("#dbdbdb");
      await scope.press("ArrowUp");
      expect(await picker.getProperty("value")).toBe("#ededed");
      await scope.press("ArrowRight");
      expect(await picker.getProperty("value")).toBe("#e4eaed");
      await scope.press("ArrowLeft");
      expect(await picker.getProperty("value")).toBe("#ededed");
    });

    it("allows nudging color's saturation even if it does not change RGB value", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker value="#000"></calcite-color-picker>`
      });
      const scope = await page.find(`calcite-color-picker >>> .${CSS.colorFieldScope}`);

      const initialStyle = await scope.getComputedStyle();
      expect(initialStyle.left).toBe("0px");

      await clickScope(page, "color-field");

      let nudgesToTheEdge = 25;

      while (nudgesToTheEdge--) {
        await scope.press("ArrowRight");
      }

      const finalStyle = await scope.getComputedStyle();
      expect(finalStyle.left).toBe(`${DIMENSIONS.m.colorField.width}px`);
    });

    it("allows nudging color's hue even if it does not change RGB value", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker value="#000"></calcite-color-picker>`
      });
      const scope = await page.find(`calcite-color-picker >>> .${CSS.hueScope}`);

      const nudgeAThirdOfSlider = async () => {
        let stepsToShiftNudgeToAThird = 18;

        while (stepsToShiftNudgeToAThird--) {
          // pressing shift to move faster across slider
          await page.keyboard.down("Shift");
          await scope.press("ArrowRight");
          await page.keyboard.up("Shift");
        }
      };

      const getScopeLeftOffset = async () => parseFloat((await scope.getComputedStyle()).left);

      expect(await getScopeLeftOffset()).toBe(0);

      await clickScope(page, "hue");
      await nudgeAThirdOfSlider();

      expect(await getScopeLeftOffset()).toBeCloseTo(DIMENSIONS.m.colorField.width / 2);

      await nudgeAThirdOfSlider();

      // hue wraps around, so we nudge it back to assert position at the edge
      await scope.press("ArrowLeft");
      expect(await getScopeLeftOffset()).toBeCloseTo(DIMENSIONS.m.colorField.width - 1, 0);

      // nudge it back to wrap around
      await scope.press("ArrowRight");
      expect(await getScopeLeftOffset()).toBeCloseTo(0);
    });

    it("allows editing hue slider via keyboard", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker allow-empty value=""></calcite-color-picker>`
      });

      const picker = await page.find("calcite-color-picker");
      const scopes = await page.findAll(`calcite-color-picker >>> .${CSS.scope}`);

      await scopes[0].press("Tab");
      await scopes[1].press("ArrowDown");
      expect(await picker.getProperty("value")).toBe("#007ec2");
      await scopes[1].press("ArrowRight");
      expect(await picker.getProperty("value")).toBe("#007bc2");
      await scopes[1].press("ArrowLeft");
      expect(await picker.getProperty("value")).toBe("#007ec2");

      await page.keyboard.press("Shift");
      await scopes[1].press("ArrowDown");
      expect(await picker.getProperty("value")).toBe("#0081c2");
      await scopes[1].press("ArrowUp");
      expect(await picker.getProperty("value")).toBe("#007ec2");
    });

    it("positions the scope correctly when the color is 000", async () => {
      const page = await newE2EPage({
        html: `<calcite-color-picker value="#000"></calcite-color-picker>`
      });

      const [, hueSliderScope] = await page.findAll(`calcite-color-picker >>> .${CSS.scope}`);

      expect(await hueSliderScope.getComputedStyle()).toMatchObject({
        top: "157px",
        left: "0px"
      });
    });
  });
});
