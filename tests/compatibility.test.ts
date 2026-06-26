import { describe, expect, it } from "vitest";

import { createBikeBuild } from "../src/lib/builds/builds";
import { checkBuildCompatibility } from "../src/lib/compatibility/engine";

describe("rule-based compatibility engine", () => {
  it("returns compatible when a complete Shimano 105 R7000 rim build matches", () => {
    const result = checkBuildCompatibility(
      createBikeBuild("matched-r7000", {
        frame: "alloy-road-rim-qr-bsa-frame",
        shifter: "shimano-105-r7000-rim-shifters",
        "rear-derailleur": "shimano-105-r7000-rear-derailleur",
        cassette: "shimano-105-r7000-11-30-cassette",
        chain: "shimano-hg601-11-speed-chain",
        crankset: "shimano-105-r7000-crankset",
        "bottom-bracket": "shimano-bbr60-bsa-bottom-bracket",
        wheelset: "shimano-rs100-hg-qr-wheelset",
        "brake-caliper": "shimano-105-r7000-rim-brakes",
      }),
    );

    expect(result.status).toBe("compatible");
    expect(result.messages).toContain("All selected components pass the MVP compatibility checks.");
  });

  it("detects drivetrain speed and chain speed mismatches in plain language", () => {
    const result = checkBuildCompatibility(
      createBikeBuild("speed-mismatch", {
        shifter: "shimano-105-r7000-rim-shifters",
        "rear-derailleur": "shimano-105-r7100-rear-derailleur",
        cassette: "shimano-105-r7100-11-34-cassette",
        chain: "shimano-m7100-12-speed-chain",
      }),
    );

    expect(result.status).toBe("incompatible");
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: "incompatible",
          ruleId: "drivetrain-speed",
          message: "The selected shifter is 11-speed, but the rear derailleur is 12-speed.",
        }),
        expect.objectContaining({
          status: "incompatible",
          ruleId: "chain-speed",
          message: "The selected chain is 12-speed, but the cassette is 12-speed and shifter is 11-speed.",
        }),
      ]),
    );
  });

  it("detects shifter and rear derailleur shifting-system mismatch", () => {
    const result = checkBuildCompatibility(
      createBikeBuild("shift-mismatch", {
        shifter: "shimano-105-r7150-di2-shifters",
        "rear-derailleur": "shimano-105-r7000-rear-derailleur",
      }),
    );

    expect(result.status).toBe("incompatible");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        ruleId: "shifter-rear-derailleur-pairing",
        message:
          "The selected shifter uses electronic shifting, but the rear derailleur uses mechanical shifting.",
      }),
    );
  });

  it("warns when cassette size is near rear derailleur capacity and fails above capacity", () => {
    const warning = checkBuildCompatibility(
      createBikeBuild("capacity-warning", {
        "rear-derailleur": "shimano-105-r7000-rear-derailleur",
        cassette: "shimano-105-r7000-11-34-cassette",
      }),
    );
    const incompatible = checkBuildCompatibility(
      createBikeBuild("capacity-fail", {
        "rear-derailleur": "shimano-105-r7000-rear-derailleur",
        cassette: "sram-rival-xg-1250-10-36-cassette",
      }),
    );

    expect(warning.status).toBe("warning");
    expect(warning.issues).toContainEqual(
      expect.objectContaining({
        ruleId: "cassette-capacity",
        message: "The cassette's 34T largest cog is at the rear derailleur's stated 34T limit.",
      }),
    );
    expect(incompatible.status).toBe("incompatible");
    expect(incompatible.issues).toContainEqual(
      expect.objectContaining({
        ruleId: "cassette-capacity",
        message: "The cassette's 36T largest cog is larger than the rear derailleur's 34T maximum.",
      }),
    );
  });

  it("detects brake type, freehub, and axle mismatches", () => {
    const result = checkBuildCompatibility(
      createBikeBuild("frame-wheel-brake-mismatch", {
        frame: "alloy-road-rim-qr-bsa-frame",
        "brake-caliper": "sram-rival-axs-hrd-calipers",
        cassette: "sram-rival-xg-1250-10-36-cassette",
        wheelset: "shimano-rs171-hg-thru-wheelset",
      }),
    );

    expect(result.status).toBe("incompatible");
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "brake-type-frame",
          message: "The frame is built for rim brakes, but the selected brake calipers are hydraulic disc.",
        }),
        expect.objectContaining({
          ruleId: "wheel-freehub",
          message: "The cassette needs an XDR freehub, but the selected wheelset uses an HG freehub.",
        }),
        expect.objectContaining({
          ruleId: "wheel-axle",
          message: "The frame uses quick release axles, but the selected wheelset uses thru axle.",
        }),
      ]),
    );
  });

  it("returns unknown for bottom bracket and crank spindle fit when data is insufficient", () => {
    const result = checkBuildCompatibility(
      createBikeBuild("bb-unknown", {
        frame: "carbon-disc-thru-unknown-bb-frame",
        crankset: "campagnolo-centaur-11-crankset",
        "bottom-bracket": "generic-unknown-bottom-bracket",
      }),
    );

    expect(result.status).toBe("unknown");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        status: "unknown",
        ruleId: "bottom-bracket-crank",
        message:
          "The bottom bracket or crank spindle standard is missing, so crank fit cannot be confirmed.",
      }),
    );
  });
});
