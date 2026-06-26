import { checkBuildCompatibility } from "../compatibility/engine";
import { findComponentById } from "../data/components";
import { componentCategories, compatibilityStatuses, type ComponentCategory, type CompatibilityStatus, type PriceRange } from "../data/types";

export type SelectedComponentIds = Partial<Record<ComponentCategory, string>>;

export interface BikeBuild {
  id: string;
  selectedComponentIds: SelectedComponentIds;
  estimatedTotalPrice?: PriceRange;
  compatibilityStatus?: CompatibilityStatus;
}

export interface SavedBikeBuild extends BikeBuild {
  name: string;
  estimatedTotalPrice: PriceRange;
  compatibilityStatus: CompatibilityStatus;
  createdAt: string;
  updatedAt: string;
}

export const savedBikeBuildsStorageKey = "bikeBuild.savedBuilds.v1";

interface CreateSavedBikeBuildInput {
  id: string;
  name: string;
  selectedComponentIds: SelectedComponentIds;
  now?: string;
  createdAt?: string;
}

interface SaveBikeBuildInput {
  name: string;
  selectedComponentIds: SelectedComponentIds;
  now?: string;
  id?: string;
  existingBuildId?: string;
}

export function createBikeBuild(id: string, selectedComponentIds: SelectedComponentIds): BikeBuild {
  return {
    id,
    selectedComponentIds,
  };
}

export function createSavedBikeBuild(input: CreateSavedBikeBuildInput): SavedBikeBuild {
  const now = input.now ?? new Date().toISOString();
  const build = createBikeBuild(input.id, input.selectedComponentIds);

  return {
    ...build,
    name: normalizeBuildName(input.name),
    estimatedTotalPrice: estimateBuildPrice(build),
    compatibilityStatus: getBuildCompatibilityStatus(build),
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
}

export function estimateBuildPrice(build: BikeBuild): PriceRange {
  const selectedComponents = Object.values(build.selectedComponentIds)
    .map((componentId) => findComponentById(componentId))
    .filter((component) => component !== undefined);

  const totals = selectedComponents.reduce(
    (total, component) => ({
      min: total.min + component.estimatedPrice.min,
      max: total.max + component.estimatedPrice.max,
      lastUpdated:
        component.estimatedPrice.lastUpdated > total.lastUpdated
          ? component.estimatedPrice.lastUpdated
          : total.lastUpdated,
    }),
    { min: 0, max: 0, lastUpdated: "" },
  );

  return {
    min: totals.min,
    max: totals.max,
    currency: "AUD",
    lastUpdated: totals.lastUpdated,
  };
}

export function getBuildCompatibilityStatus(build: BikeBuild): CompatibilityStatus {
  return checkBuildCompatibility(build).status;
}

export function loadSavedBikeBuilds(storage: Storage | undefined): SavedBikeBuild[] {
  if (!storage) return [];

  try {
    const rawValue = storage.getItem(savedBikeBuildsStorageKey);
    if (!rawValue) return [];

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter(isSavedBikeBuild);
  } catch {
    return [];
  }
}

export function saveBikeBuildToStorage(storage: Storage | undefined, input: SaveBikeBuildInput): SavedBikeBuild {
  const savedBuilds = loadSavedBikeBuilds(storage);
  const existingBuild = input.existingBuildId ? savedBuilds.find((build) => build.id === input.existingBuildId) : undefined;
  const savedBuild = createSavedBikeBuild({
    id: existingBuild?.id ?? input.id ?? createBuildId(),
    name: input.name,
    selectedComponentIds: input.selectedComponentIds,
    now: input.now,
    createdAt: existingBuild?.createdAt,
  });

  const nextBuilds = existingBuild
    ? savedBuilds.map((build) => (build.id === existingBuild.id ? savedBuild : build))
    : [savedBuild, ...savedBuilds];

  persistSavedBikeBuilds(storage, nextBuilds);

  return savedBuild;
}

export function deleteSavedBikeBuild(storage: Storage | undefined, buildId: string): SavedBikeBuild[] {
  const nextBuilds = loadSavedBikeBuilds(storage).filter((build) => build.id !== buildId);
  persistSavedBikeBuilds(storage, nextBuilds);

  return nextBuilds;
}

function persistSavedBikeBuilds(storage: Storage | undefined, savedBuilds: SavedBikeBuild[]) {
  if (!storage) return;
  storage.setItem(savedBikeBuildsStorageKey, JSON.stringify(savedBuilds));
}

function normalizeBuildName(name: string): string {
  const trimmedName = name.trim();
  return trimmedName || "Untitled build";
}

function createBuildId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `build-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isSavedBikeBuild(value: unknown): value is SavedBikeBuild {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isSelectedComponentIds(value.selectedComponentIds) &&
    isPriceRange(value.estimatedTotalPrice) &&
    isCompatibilityStatus(value.compatibilityStatus) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isSelectedComponentIds(value: unknown): value is SelectedComponentIds {
  if (!isRecord(value)) return false;

  return Object.entries(value).every(
    ([category, componentId]) => isComponentCategory(category) && typeof componentId === "string",
  );
}

function isComponentCategory(value: string): value is ComponentCategory {
  return componentCategories.includes(value as ComponentCategory);
}

function isCompatibilityStatus(value: unknown): value is CompatibilityStatus {
  return compatibilityStatuses.includes(value as CompatibilityStatus);
}

function isPriceRange(value: unknown): value is PriceRange {
  if (!isRecord(value)) return false;

  return (
    typeof value.min === "number" &&
    typeof value.max === "number" &&
    typeof value.currency === "string" &&
    typeof value.lastUpdated === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
