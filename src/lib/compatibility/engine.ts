import { findComponentById } from "../data/components";
import type { BikeBuild } from "../builds/builds";
import type { BikeComponent, CompatibilityStatus, ComponentCategory } from "../data/types";

export interface CompatibilityIssue {
  ruleId: string;
  status: Exclude<CompatibilityStatus, "compatible">;
  componentIds: string[];
  message: string;
}

export interface CompatibilityResult {
  status: CompatibilityStatus;
  issues: CompatibilityIssue[];
  messages: string[];
}

const priority: Record<CompatibilityStatus, number> = {
  compatible: 0,
  unknown: 1,
  warning: 2,
  incompatible: 3,
};

export function checkBuildCompatibility(build: BikeBuild): CompatibilityResult {
  const selected = selectedComponentsByCategory(build);
  const issues: CompatibilityIssue[] = [];

  checkDrivetrainSpeed(selected, issues);
  checkShifterRearDerailleurPairing(selected, issues);
  checkChainSpeed(selected, issues);
  checkCassetteCapacity(selected, issues);
  checkBrakeTypeFrame(selected, issues);
  checkWheelFreehub(selected, issues);
  checkWheelAxle(selected, issues);
  checkBottomBracketCrank(selected, issues);

  const status = issues.reduce<CompatibilityStatus>(
    (current, issue) => (priority[issue.status] > priority[current] ? issue.status : current),
    "compatible",
  );

  return {
    status,
    issues,
    messages: issues.length
      ? issues.map((issue) => issue.message)
      : ["All selected components pass the MVP compatibility checks."],
  };
}

function selectedComponentsByCategory(build: BikeBuild): Partial<Record<ComponentCategory, BikeComponent>> {
  const selected: Partial<Record<ComponentCategory, BikeComponent>> = {};

  for (const [category, componentId] of Object.entries(build.selectedComponentIds) as [
    ComponentCategory,
    string,
  ][]) {
    const component = findComponentById(componentId);
    if (component) {
      selected[category] = component;
    }
  }

  return selected;
}

function checkDrivetrainSpeed(
  selected: Partial<Record<ComponentCategory, BikeComponent>>,
  issues: CompatibilityIssue[],
) {
  const shifter = selected.shifter;
  const rearDerailleur = selected["rear-derailleur"];
  if (!shifter?.speed || !rearDerailleur?.speed || shifter.speed === rearDerailleur.speed) return;

  issues.push({
    ruleId: "drivetrain-speed",
    status: "incompatible",
    componentIds: [shifter.id, rearDerailleur.id],
    message: `The selected shifter is ${shifter.speed}-speed, but the rear derailleur is ${rearDerailleur.speed}-speed.`,
  });
}

function checkShifterRearDerailleurPairing(
  selected: Partial<Record<ComponentCategory, BikeComponent>>,
  issues: CompatibilityIssue[],
) {
  const shifter = selected.shifter;
  const rearDerailleur = selected["rear-derailleur"];
  if (
    !shifter?.shiftingType ||
    !rearDerailleur?.shiftingType ||
    shifter.shiftingType === rearDerailleur.shiftingType
  ) {
    return;
  }

  issues.push({
    ruleId: "shifter-rear-derailleur-pairing",
    status: "incompatible",
    componentIds: [shifter.id, rearDerailleur.id],
    message: `The selected shifter uses ${shifter.shiftingType} shifting, but the rear derailleur uses ${rearDerailleur.shiftingType} shifting.`,
  });
}

function checkChainSpeed(
  selected: Partial<Record<ComponentCategory, BikeComponent>>,
  issues: CompatibilityIssue[],
) {
  const chain = selected.chain;
  if (!chain?.speed) return;

  const speedParts = [
    selected.cassette ? { label: "cassette", speed: selected.cassette.speed } : undefined,
    selected.shifter ? { label: "shifter", speed: selected.shifter.speed } : undefined,
  ].filter((part): part is { label: string; speed: number } => part?.speed !== undefined);

  if (speedParts.length === 0 || speedParts.every((part) => part.speed === chain.speed)) return;

  const comparedSpeeds = speedParts.map((part) => `${part.label} is ${part.speed}-speed`).join(" and ");
  issues.push({
    ruleId: "chain-speed",
    status: "incompatible",
    componentIds: [
      chain.id,
      selected.cassette?.id,
      selected.shifter?.id,
      selected["rear-derailleur"]?.id,
    ].filter(Boolean) as string[],
    message: `The selected chain is ${chain.speed}-speed, but the ${comparedSpeeds}.`,
  });
}

function checkCassetteCapacity(
  selected: Partial<Record<ComponentCategory, BikeComponent>>,
  issues: CompatibilityIssue[],
) {
  const cassette = selected.cassette;
  const rearDerailleur = selected["rear-derailleur"];
  const largestCog = cassette?.compatibleStandards.cassetteLargestCog;
  const maxCog = rearDerailleur?.compatibleStandards.rearDerailleurMaxCog;

  if (!cassette || !rearDerailleur || !largestCog || !maxCog) return;

  if (largestCog > maxCog) {
    issues.push({
      ruleId: "cassette-capacity",
      status: "incompatible",
      componentIds: [cassette.id, rearDerailleur.id],
      message: `The cassette's ${largestCog}T largest cog is larger than the rear derailleur's ${maxCog}T maximum.`,
    });
    return;
  }

  if (largestCog === maxCog) {
    issues.push({
      ruleId: "cassette-capacity",
      status: "warning",
      componentIds: [cassette.id, rearDerailleur.id],
      message: `The cassette's ${largestCog}T largest cog is at the rear derailleur's stated ${maxCog}T limit.`,
    });
  }
}

function checkBrakeTypeFrame(
  selected: Partial<Record<ComponentCategory, BikeComponent>>,
  issues: CompatibilityIssue[],
) {
  const frame = selected.frame;
  const brake = selected["brake-caliper"];
  if (!frame?.brakeType || !brake?.brakeType || frame.brakeType === brake.brakeType) return;

  issues.push({
    ruleId: "brake-type-frame",
    status: "incompatible",
    componentIds: [frame.id, brake.id],
    message: `The frame is built for ${formatBrakeType(frame.brakeType)} brakes, but the selected brake calipers are ${formatBrakeType(brake.brakeType)}.`,
  });
}

function checkWheelFreehub(
  selected: Partial<Record<ComponentCategory, BikeComponent>>,
  issues: CompatibilityIssue[],
) {
  const cassette = selected.cassette;
  const wheelset = selected.wheelset;
  if (!cassette?.freehub || !wheelset?.freehub || cassette.freehub === wheelset.freehub) return;

  issues.push({
    ruleId: "wheel-freehub",
    status: "incompatible",
    componentIds: [cassette.id, wheelset.id],
    message: `The cassette needs an ${cassette.freehub} freehub, but the selected wheelset uses an ${wheelset.freehub} freehub.`,
  });
}

function checkWheelAxle(
  selected: Partial<Record<ComponentCategory, BikeComponent>>,
  issues: CompatibilityIssue[],
) {
  const frame = selected.frame;
  const wheelset = selected.wheelset;
  if (!frame?.axleType || !wheelset?.axleType || frame.axleType === wheelset.axleType) return;

  issues.push({
    ruleId: "wheel-axle",
    status: "incompatible",
    componentIds: [frame.id, wheelset.id],
    message: `The frame uses ${formatAxleType(frame.axleType)} axles, but the selected wheelset uses ${formatAxleType(wheelset.axleType)}.`,
  });
}

function checkBottomBracketCrank(
  selected: Partial<Record<ComponentCategory, BikeComponent>>,
  issues: CompatibilityIssue[],
) {
  const frame = selected.frame;
  const crankset = selected.crankset;
  const bottomBracket = selected["bottom-bracket"];

  if (!crankset && !bottomBracket) return;

  const frameShell = frame?.compatibleStandards.bottomBracketShell;
  const bottomBracketShell = bottomBracket?.compatibleStandards.bottomBracketShell;
  const crankSpindle = crankset?.crankSpindle;
  const supportedSpindle = bottomBracket?.compatibleStandards.crankSpindle;

  if (
    !frameShell ||
    frameShell === "unknown" ||
    !bottomBracketShell ||
    bottomBracketShell === "unknown" ||
    !crankSpindle ||
    !supportedSpindle
  ) {
    issues.push({
      ruleId: "bottom-bracket-crank",
      status: "unknown",
      componentIds: [frame?.id, crankset?.id, bottomBracket?.id].filter(Boolean) as string[],
      message: "The bottom bracket or crank spindle standard is missing, so crank fit cannot be confirmed.",
    });
    return;
  }

  if (frameShell !== bottomBracketShell || crankSpindle !== supportedSpindle) {
    issues.push({
      ruleId: "bottom-bracket-crank",
      status: "warning",
      componentIds: [frame?.id, crankset.id, bottomBracket.id].filter(Boolean) as string[],
      message: `The frame, bottom bracket, and crank standards do not clearly match: frame shell is ${frameShell}, bottom bracket shell is ${bottomBracketShell}, and crank spindle is ${crankSpindle}.`,
    });
  }
}

function formatBrakeType(brakeType: string) {
  return brakeType.replace("-", " ");
}

function formatAxleType(axleType: string) {
  return axleType === "quick-release" ? "quick release" : axleType.replace("-", " ");
}
