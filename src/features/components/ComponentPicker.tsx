import { Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type { SelectedComponentIds } from "@/lib/builds/builds";
import type { CompatibilityResult } from "@/lib/compatibility/engine";
import type { BikeComponent, CompatibilityStatus, ComponentCategory } from "@/lib/data/types";
import {
  formatBrakeType,
  formatCategory,
  formatPrice,
  formatShiftingType,
  getComponentStatusForSelection,
  statusTone,
} from "@/features/configurator/configurator-data";

interface ComponentPickerProps {
  category: ComponentCategory | undefined;
  options: BikeComponent[];
  selectedComponentIds: SelectedComponentIds;
  compatibility: CompatibilityResult;
  onSelectComponent: (category: ComponentCategory, componentId: string) => void;
}

const priceFilters = [
  { value: "under-100", label: "Under $100", min: 0, max: 100 },
  { value: "100-249", label: "$100-$249", min: 100, max: 249 },
  { value: "250-499", label: "$250-$499", min: 250, max: 499 },
  { value: "500-plus", label: "$500+", min: 500, max: Number.POSITIVE_INFINITY },
] as const;

type PriceFilterValue = (typeof priceFilters)[number]["value"];

const allOption = "all";

export function ComponentPicker({ category, options, selectedComponentIds, compatibility, onSelectComponent }: ComponentPickerProps) {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState(allOption);
  const [speedFilter, setSpeedFilter] = useState(allOption);
  const [brakeFilter, setBrakeFilter] = useState(allOption);
  const [priceFilter, setPriceFilter] = useState<typeof allOption | PriceFilterValue>(allOption);
  const [statusFilter, setStatusFilter] = useState<typeof allOption | CompatibilityStatus>(allOption);
  const [shiftingFilter, setShiftingFilter] = useState(allOption);

  const optionRows = useMemo(() => {
    if (!category) return [];

    return options.map((component) => ({
      component,
      status: getComponentStatusForSelection(category, component, selectedComponentIds, compatibility),
    }));
  }, [category, compatibility, options, selectedComponentIds]);

  const brands = useMemo(() => uniqueSorted(options.map((component) => component.brand)), [options]);
  const speeds = useMemo(() => uniqueSorted(options.map((component) => component.speed).filter((speed): speed is number => speed !== undefined)), [options]);
  const brakeTypes = useMemo(
    () => uniqueSorted(options.map((component) => component.brakeType).filter((brakeType): brakeType is NonNullable<BikeComponent["brakeType"]> => Boolean(brakeType))),
    [options],
  );
  const shiftingTypes = useMemo(
    () =>
      uniqueSorted(
        options
          .map((component) => component.shiftingType)
          .filter((shiftingType): shiftingType is NonNullable<BikeComponent["shiftingType"]> => Boolean(shiftingType) && shiftingType !== "none"),
      ),
    [options],
  );
  const statuses = useMemo(() => uniqueSorted(optionRows.map((row) => row.status)), [optionRows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return optionRows.filter(({ component, status }) => {
      const matchesSearch =
        !normalizedSearch ||
        [component.brand, component.model, formatCategory(component.category)].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesBrand = brandFilter === allOption || component.brand === brandFilter;
      const matchesSpeed = speedFilter === allOption || component.speed === Number(speedFilter);
      const matchesBrake = brakeFilter === allOption || component.brakeType === brakeFilter;
      const matchesStatus = statusFilter === allOption || status === statusFilter;
      const matchesShifting = shiftingFilter === allOption || component.shiftingType === shiftingFilter;
      const selectedPriceFilter = priceFilters.find((filter) => filter.value === priceFilter);
      const matchesPrice =
        !selectedPriceFilter ||
        (component.estimatedPrice.min <= selectedPriceFilter.max && component.estimatedPrice.max >= selectedPriceFilter.min);

      return matchesSearch && matchesBrand && matchesSpeed && matchesBrake && matchesPrice && matchesStatus && matchesShifting;
    });
  }, [brandFilter, brakeFilter, optionRows, priceFilter, search, shiftingFilter, speedFilter, statusFilter]);

  if (!category) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          Component selection
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This diagram part is useful for orientation, but it does not have a selectable component category in the verified MVP data yet.
        </p>
      </section>
    );
  }

  if (!options.length) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          {formatCategory(category)} options
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          No verified options are available for this category yet, so compatibility is shown as unknown for now.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="component-picker-heading">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          <h2 id="component-picker-heading">{formatCategory(category)} options</h2>
        </div>
        <span className="text-xs font-medium text-slate-500">{options.length} verified</span>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="sr-only">Search components</span>
          <span className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search brand, model, or category"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
            />
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <CompactSelect label="Brand" value={brandFilter} onChange={setBrandFilter}>
            <option value={allOption}>All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </CompactSelect>
          <CompactSelect label="Speed" value={speedFilter} onChange={setSpeedFilter}>
            <option value={allOption}>Any speed</option>
            {speeds.map((speed) => (
              <option key={speed} value={speed}>
                {speed}-speed
              </option>
            ))}
          </CompactSelect>
          <CompactSelect label="Brake" value={brakeFilter} onChange={setBrakeFilter}>
            <option value={allOption}>Any brake</option>
            {brakeTypes.map((brakeType) => (
              <option key={brakeType} value={brakeType}>
                {formatBrakeType(brakeType)}
              </option>
            ))}
          </CompactSelect>
          <CompactSelect label="Price" value={priceFilter} onChange={(value) => setPriceFilter(value as typeof allOption | PriceFilterValue)}>
            <option value={allOption}>Any price</option>
            {priceFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </CompactSelect>
          <CompactSelect label="Fit" value={statusFilter} onChange={(value) => setStatusFilter(value as typeof allOption | CompatibilityStatus)}>
            <option value={allOption}>Any fit</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusTone[status].label}
              </option>
            ))}
          </CompactSelect>
          <CompactSelect label="Shifting" value={shiftingFilter} onChange={setShiftingFilter} disabled={!shiftingTypes.length}>
            <option value={allOption}>{shiftingTypes.length ? "Any shifting" : "No shifting data"}</option>
            {shiftingTypes.map((shiftingType) => (
              <option key={shiftingType} value={shiftingType}>
                {formatShiftingType(shiftingType)}
              </option>
            ))}
          </CompactSelect>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {filteredRows.length ? (
          filteredRows.map(({ component, status }) => {
            const selected = selectedComponentIds[category] === component.id;
            const tone = statusTone[status];

            return (
              <button
                key={component.id}
                type="button"
                onClick={() => onSelectComponent(category, component.id)}
                className={`w-full rounded-md border px-3 py-3 text-left transition ${
                  selected
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">
                      {component.brand} {component.model}
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">
                      {component.speed ? `${component.speed}-speed` : "Speed not listed"} · {formatBrakeType(component.brakeType)} ·{" "}
                      {formatShiftingType(component.shiftingType)}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-2">
                    <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${tone.className}`}>{tone.label}</span>
                    <span className="text-xs font-semibold text-slate-700">{formatPrice(component.estimatedPrice)}</span>
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm leading-6 text-slate-600">
            No components match those filters yet. Try a broader search, clear one filter, or pick a different bike part.
          </div>
        )}
      </div>
    </section>
  );
}

function CompactSelect({
  label,
  value,
  onChange,
  disabled = false,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
      >
        {children}
      </select>
    </label>
  );
}

function uniqueSorted<T extends string | number>(values: T[]) {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}
