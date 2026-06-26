import { describe, expect, it } from "vitest";

import {
  createSavedBikeBuild,
  createBikeBuild,
  deleteSavedBikeBuild,
  estimateBuildPrice,
  getBuildCompatibilityStatus,
  loadSavedBikeBuilds,
  saveBikeBuildToStorage,
} from "../src/lib/builds/builds";

describe("bike build helpers", () => {
  it("stores selected component IDs by category", () => {
    const build = createBikeBuild("commuter-upgrade", {
      groupset: "shimano-105-r7000-groupset",
      wheelset: "shimano-rs100-hg-qr-wheelset",
    });

    expect(build.selectedComponentIds.groupset).toBe("shimano-105-r7000-groupset");
    expect(build.selectedComponentIds.wheelset).toBe("shimano-rs100-hg-qr-wheelset");
  });

  it("estimates total build price ranges from selected components", () => {
    const estimate = estimateBuildPrice(
      createBikeBuild("budget-rim-build", {
        frame: "alloy-road-rim-qr-bsa-frame",
        groupset: "shimano-105-r7000-groupset",
        wheelset: "shimano-rs100-hg-qr-wheelset",
      }),
    );

    expect(estimate).toEqual({
      min: 1350,
      max: 2070,
      currency: "AUD",
      lastUpdated: "2026-06-01",
    });
  });

  it("summarizes build compatibility using the exact status values", () => {
    expect(
      getBuildCompatibilityStatus(
        createBikeBuild("unknown-fit", {
          frame: "carbon-disc-thru-unknown-bb-frame",
          crankset: "campagnolo-centaur-11-crankset",
          "bottom-bracket": "generic-unknown-bottom-bracket",
        }),
      ),
    ).toBe("unknown");
  });

  it("creates a saved build with metadata, price estimate, and compatibility status", () => {
    const savedBuild = createSavedBikeBuild({
      id: "build-1",
      name: "Weekend rim build",
      selectedComponentIds: {
        frame: "alloy-road-rim-qr-bsa-frame",
        groupset: "shimano-105-r7000-groupset",
        wheelset: "shimano-rs100-hg-qr-wheelset",
      },
      now: "2026-06-25T10:00:00.000Z",
    });

    expect(savedBuild).toMatchObject({
      id: "build-1",
      name: "Weekend rim build",
      selectedComponentIds: {
        frame: "alloy-road-rim-qr-bsa-frame",
        groupset: "shimano-105-r7000-groupset",
        wheelset: "shimano-rs100-hg-qr-wheelset",
      },
      compatibilityStatus: "compatible",
      createdAt: "2026-06-25T10:00:00.000Z",
      updatedAt: "2026-06-25T10:00:00.000Z",
    });
    expect(savedBuild.estimatedTotalPrice).toEqual({
      min: 1350,
      max: 2070,
      currency: "AUD",
      lastUpdated: "2026-06-01",
    });
  });

  it("saves, replaces, loads, and deletes bike builds from storage", () => {
    const storage = createMemoryStorage();

    const firstSave = saveBikeBuildToStorage(storage, {
      name: "Original name",
      selectedComponentIds: {
        frame: "alloy-road-rim-qr-bsa-frame",
      },
      now: "2026-06-25T10:00:00.000Z",
      id: "stable-build-id",
    });

    const secondSave = saveBikeBuildToStorage(storage, {
      name: "Updated name",
      selectedComponentIds: {
        frame: "carbon-disc-thru-unknown-bb-frame",
        wheelset: "shimano-rs710-c32-hg-thru-wheelset",
      },
      now: "2026-06-25T11:00:00.000Z",
      existingBuildId: firstSave.id,
    });

    expect(loadSavedBikeBuilds(storage)).toHaveLength(1);
    expect(secondSave).toMatchObject({
      id: "stable-build-id",
      name: "Updated name",
      selectedComponentIds: {
        frame: "carbon-disc-thru-unknown-bb-frame",
        wheelset: "shimano-rs710-c32-hg-thru-wheelset",
      },
      createdAt: "2026-06-25T10:00:00.000Z",
      updatedAt: "2026-06-25T11:00:00.000Z",
    });

    expect(deleteSavedBikeBuild(storage, "stable-build-id")).toEqual([]);
    expect(loadSavedBikeBuilds(storage)).toEqual([]);
  });

  it("returns an empty saved build list when storage is unavailable or malformed", () => {
    expect(loadSavedBikeBuilds(undefined)).toEqual([]);

    const storage = createMemoryStorage();
    storage.setItem("bikeBuild.savedBuilds.v1", "{not-json");

    expect(loadSavedBikeBuilds(storage)).toEqual([]);
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
}
