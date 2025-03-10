import { GlobalAttrComponent, unwatchGlobalAttributes, watchGlobalAttributes } from "./globalAttributes";
import { JSDOM } from "jsdom";
import { Build } from "@stencil/core";
import { waitForAnimationFrame } from "../tests/utils";

describe("globalAttributes", () => {
  const originalIsBrowser = Build.isBrowser;

  beforeAll(() => (Build.isBrowser = true));
  afterAll(() => (Build.isBrowser = originalIsBrowser));

  it("sets component's global attributes when watching", async () => {
    // we clobber Stencil's custom Mock document implementation
    const { window: win } = new JSDOM();

    window = win; // make window references use JSDOM
    const fakeComponent = win.document.createElement("fake-component");
    win.document.body.append(fakeComponent);

    const globalComponent: GlobalAttrComponent = {
      el: fakeComponent,
      globalAttributes: {}
    };

    watchGlobalAttributes(globalComponent, ["lang"]);
    await waitForAnimationFrame();

    expect(globalComponent.globalAttributes).toEqual({});

    fakeComponent.setAttribute("lang", "en");
    await waitForAnimationFrame();

    expect(globalComponent.globalAttributes).toEqual({ lang: "en" });

    fakeComponent.setAttribute("title", "untracked global attr should not be set");
    await waitForAnimationFrame();

    expect(globalComponent.globalAttributes).toEqual({ lang: "en" });

    fakeComponent.setAttribute("lang", "es");
    await waitForAnimationFrame();

    expect(globalComponent.globalAttributes).toEqual({ lang: "es" });

    unwatchGlobalAttributes(globalComponent);

    fakeComponent.setAttribute("lang", "fr");
    await waitForAnimationFrame();

    expect(globalComponent.globalAttributes).toEqual({ lang: "es" });
  });
});
