import { describe, expect, it } from "vitest";

import { componentCategories, components, findComponentById } from "../src/lib/data/components";

describe("component seed data", () => {
  it("includes stable structured seed components across the required MVP brands and groups", () => {
    const brands = new Set(components.map((component) => component.brand));
    const groups = new Set(components.map((component) => component.group));

    expect([...brands]).toEqual(
      expect.arrayContaining(["Shimano", "SRAM", "Campagnolo", "Microshift", "Sensah", "LTWOO"]),
    );
    expect([...groups]).toEqual(
      expect.arrayContaining([
        "Shimano 105 R7000",
        "Shimano 105 R7100",
        "Shimano 105 R7150 Di2",
        "Shimano Ultegra R8000",
        "Shimano Ultegra R8100",
        "SRAM Rival AXS",
        "SRAM Force AXS",
      ]),
    );

    expect(components.every((component) => component.id.trim().length > 0)).toBe(true);
    expect(new Set(components.map((component) => component.id)).size).toBe(components.length);
    expect(components.every((component) => component.description.length > 0)).toBe(true);
    expect(components.every((component) => component.estimatedPrice.currency === "AUD")).toBe(true);
    expect(components.every((component) => component.estimatedPrice.lastUpdated.length > 0)).toBe(true);
  });

  it("uses the MVP component categories needed for builds", () => {
    expect(componentCategories).toEqual(
      expect.arrayContaining([
        "frame",
        "shifter",
        "rear-derailleur",
        "cassette",
        "chain",
        "crankset",
        "bottom-bracket",
        "wheelset",
        "brake-caliper",
      ]),
    );
  });

  it("finds components by stable ID rather than display name", () => {
    expect(findComponentById("shimano-105-r7000-rear-derailleur")?.model).toBe("105 R7000 Rear Derailleur");
  });
});
