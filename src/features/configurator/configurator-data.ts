import { components, findComponentById } from "@/lib/data/components";
import type { BikeBuild, SelectedComponentIds } from "@/lib/builds/builds";
import type { BikeComponent, CompatibilityStatus, ComponentCategory, PriceRange } from "@/lib/data/types";
import { checkBuildCompatibility, type CompatibilityResult } from "@/lib/compatibility/engine";
import type { BikeDiagramPart, BikeDiagramPartId } from "@/components/bike-diagram/BikeDiagram";
import { bikeDiagramParts } from "@/components/bike-diagram/BikeDiagram";

export const defaultSelectedComponentIds: SelectedComponentIds = {
  frame: "alloy-road-rim-qr-bsa-frame",
  shifter: "shimano-105-r7000-rim-shifters",
  "rear-derailleur": "shimano-105-r7000-rear-derailleur",
  cassette: "shimano-105-r7000-11-30-cassette",
  chain: "shimano-hg601-11-speed-chain",
  crankset: "shimano-105-r7000-crankset",
  "bottom-bracket": "shimano-bbr60-bsa-bottom-bracket",
  wheelset: "shimano-rs100-hg-qr-wheelset",
  "brake-caliper": "shimano-105-r7000-rim-brakes",
};

export const statusTone: Record<CompatibilityStatus, { label: string; className: string; dotClassName: string }> = {
  compatible: {
    label: "Compatible",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-500",
  },
  warning: {
    label: "Warning",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500",
  },
  incompatible: {
    label: "Incompatible",
    className: "border-red-200 bg-red-50 text-red-800",
    dotClassName: "bg-red-500",
  },
  unknown: {
    label: "Unknown",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    dotClassName: "bg-slate-400",
  },
};

export function getComponentOptions(category: ComponentCategory | undefined): BikeComponent[] {
  if (!category) return [];
  return components.filter((component) => component.category === category);
}

export function getSelectedComponent(part: BikeDiagramPart, selectedComponentIds: SelectedComponentIds): BikeComponent | undefined {
  if (!part.category) return undefined;
  const componentId = selectedComponentIds[part.category];
  return componentId ? findComponentById(componentId) : undefined;
}

export function createCurrentBuild(selectedComponentIds: SelectedComponentIds): BikeBuild {
  return {
    id: "current-configurator-build",
    selectedComponentIds,
  };
}

export function getRelatedPartIds(selectedPart: BikeDiagramPart): BikeDiagramPartId[] {
  if (selectedPart.group === "drivetrain") {
    return bikeDiagramParts
      .filter((part) => part.group === "drivetrain" && part.id !== selectedPart.id)
      .map((part) => part.id);
  }

  if (selectedPart.group === "braking") {
    return bikeDiagramParts
      .filter((part) => part.group === "braking" || part.id === "shifters")
      .filter((part) => part.id !== selectedPart.id)
      .map((part) => part.id);
  }

  if (selectedPart.group === "rolling") {
    return bikeDiagramParts
      .filter((part) => part.group === "rolling" || part.id === "cassette")
      .filter((part) => part.id !== selectedPart.id)
      .map((part) => part.id);
  }

  return bikeDiagramParts
    .filter((part) => part.group === selectedPart.group && part.id !== selectedPart.id)
    .map((part) => part.id);
}

export function getUnavailablePartIds(selectedComponentIds: SelectedComponentIds): BikeDiagramPartId[] {
  return bikeDiagramParts
    .filter((part) => !part.category || !selectedComponentIds[part.category])
    .map((part) => part.id);
}

export function getComponentStatus(component: BikeComponent | undefined, compatibility: CompatibilityResult): CompatibilityStatus {
  if (!component) return "unknown";

  const issue = compatibility.issues.find((item) => item.componentIds.includes(component.id));
  return issue?.status ?? "compatible";
}

export function getComponentStatusForSelection(
  category: ComponentCategory,
  component: BikeComponent,
  selectedComponentIds: SelectedComponentIds,
  currentCompatibility: CompatibilityResult,
): CompatibilityStatus {
  if (selectedComponentIds[category] === component.id) {
    return getComponentStatus(component, currentCompatibility);
  }

  const compatibility = checkBuildCompatibility(
    createCurrentBuild({
      ...selectedComponentIds,
      [category]: component.id,
    }),
  );

  return getComponentStatus(component, compatibility);
}

export function getPartNotes(part: BikeDiagramPart, component: BikeComponent | undefined, compatibility: CompatibilityResult) {
  if (!component) {
    return [
      part.category
        ? `No ${formatCategory(part.category)} component is selected yet. This part can still be explored, but compatibility is unknown.`
        : `${part.label} is selectable in the diagram, but the current verified data set does not include a matching component category yet.`,
    ];
  }

  const issueMessages = compatibility.issues
    .filter((issue) => issue.componentIds.includes(component.id))
    .map((issue) => issue.message);

  return issueMessages.length ? issueMessages : [component.description];
}

export function formatCategory(category: ComponentCategory) {
  return category
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatBrakeType(brakeType: BikeComponent["brakeType"]) {
  if (!brakeType || brakeType === "none") return "Not applicable";
  if (brakeType === "unknown") return "Unknown";
  return brakeType
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatShiftingType(shiftingType: BikeComponent["shiftingType"]) {
  if (!shiftingType || shiftingType === "none") return "Not applicable";
  if (shiftingType === "unknown") return "Unknown";
  return shiftingType[0].toUpperCase() + shiftingType.slice(1);
}

export function formatPrice(price: PriceRange | undefined) {
  if (!price) return "Price data not available";
  return `${price.currency} $${price.min.toLocaleString()} - $${price.max.toLocaleString()}`;
}

export function formatStandards(component: BikeComponent | undefined) {
  if (!component) return [];

  const standards = component.compatibleStandards;
  return [
    standards.speeds?.length ? `${standards.speeds.join("/")} speed` : undefined,
    standards.brakeType ? `Brake: ${formatBrakeType(standards.brakeType)}` : undefined,
    standards.frameBrakeMount ? `Frame brake mount: ${formatBrakeType(standards.frameBrakeMount)}` : undefined,
    standards.freehub ? `Freehub: ${standards.freehub}` : undefined,
    standards.axleType ? `Axle: ${standards.axleType === "quick-release" ? "Quick release" : "Thru axle"}` : undefined,
    standards.bottomBracketShell ? `BB shell: ${standards.bottomBracketShell}` : undefined,
    standards.crankSpindle ? `Crank spindle: ${standards.crankSpindle}` : undefined,
    standards.rearDerailleurMaxCog ? `Rear derailleur max: ${standards.rearDerailleurMaxCog}T` : undefined,
    standards.cassetteLargestCog ? `Largest cassette cog: ${standards.cassetteLargestCog}T` : undefined,
  ].filter((item): item is string => Boolean(item));
}
