export const compatibilityStatuses = ["compatible", "warning", "incompatible", "unknown"] as const;

export type CompatibilityStatus = (typeof compatibilityStatuses)[number];

export const componentCategories = [
  "frame",
  "fork",
  "handlebar",
  "shifter",
  "front-derailleur",
  "rear-derailleur",
  "cassette",
  "chain",
  "crankset",
  "bottom-bracket",
  "wheelset",
  "brake-caliper",
  "brake-rotor",
  "tire",
  "groupset",
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

export type BrakeType = "rim" | "mechanical-disc" | "hydraulic-disc" | "none" | "unknown";
export type ShiftingType = "mechanical" | "electronic" | "none" | "unknown";
export type FreehubBody = "HG" | "XDR" | "N3W" | "unknown" | "none";
export type AxleType = "quick-release" | "thru-axle" | "unknown" | "none";

export interface PriceRange {
  min: number;
  max: number;
  currency: "AUD" | "USD" | "EUR" | "GBP";
  lastUpdated: string;
}

export interface CompatibleStandards {
  freehub?: FreehubBody;
  axleType?: AxleType;
  brakeType?: BrakeType;
  frameBrakeMount?: BrakeType;
  bottomBracketShell?: string;
  crankSpindle?: string;
  rearDerailleurMaxCog?: number;
  cassetteLargestCog?: number;
  speeds?: number[];
}

export interface BikeComponent {
  id: string;
  brand: string;
  model: string;
  group?: string;
  category: ComponentCategory;
  speed?: number;
  brakeType?: BrakeType;
  shiftingType?: ShiftingType;
  freehub?: FreehubBody;
  axleType?: AxleType;
  bottomBracketStandard?: string;
  crankSpindle?: string;
  weightGrams?: number;
  material?: string;
  description: string;
  estimatedPrice: PriceRange;
  compatibleStandards: CompatibleStandards;
}
