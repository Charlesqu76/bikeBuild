"use client";

import { useEffect, useMemo, useState } from "react";

import { BikeDiagram, bikeDiagramParts, type BikeDiagramPartId } from "@/components/bike-diagram/BikeDiagram";
import { checkBuildCompatibility } from "@/lib/compatibility/engine";
import { estimateBuildPrice, loadSavedBikeBuilds, type SavedBikeBuild } from "@/lib/builds/builds";
import type { ComponentCategory } from "@/lib/data/types";
import { ComponentDetailPanel } from "@/features/components/ComponentDetailPanel";
import { ComponentPicker } from "@/features/components/ComponentPicker";
import { CompatibilitySummary } from "@/features/configurator/CompatibilitySummary";
import { getClientStorage, SavedBuildsPanel } from "@/features/configurator/SavedBuildsPanel";
import {
  createCurrentBuild,
  defaultSelectedComponentIds,
  getComponentOptions,
  getComponentStatus,
  getPartNotes,
  getRelatedPartIds,
  getSelectedComponent,
  getUnavailablePartIds,
} from "@/features/configurator/configurator-data";

export function Configurator() {
  const [selectedPartId, setSelectedPartId] = useState<BikeDiagramPartId>("rear-derailleur");
  const [selectedComponentIds, setSelectedComponentIds] = useState(defaultSelectedComponentIds);
  const [buildName, setBuildName] = useState("Shimano 105 rim build");
  const [selectedSavedBuildId, setSelectedSavedBuildId] = useState<string | undefined>();
  const [savedBuilds, setSavedBuilds] = useState<SavedBikeBuild[]>([]);

  useEffect(() => {
    setSavedBuilds(loadSavedBikeBuilds(getClientStorage()));
  }, []);

  const selectedPart = bikeDiagramParts.find((part) => part.id === selectedPartId) ?? bikeDiagramParts[0];
  const build = useMemo(() => createCurrentBuild(selectedComponentIds), [selectedComponentIds]);
  const compatibility = useMemo(() => checkBuildCompatibility(build), [build]);
  const totalPrice = useMemo(() => estimateBuildPrice(build), [build]);
  const selectedComponent = getSelectedComponent(selectedPart, selectedComponentIds);
  const selectedStatus = getComponentStatus(selectedComponent, compatibility);
  const componentOptions = getComponentOptions(selectedPart.category);
  const relatedPartIds = getRelatedPartIds(selectedPart);
  const unavailablePartIds = getUnavailablePartIds(selectedComponentIds);
  const notes = getPartNotes(selectedPart, selectedComponent, compatibility);

  const selectComponent = (category: ComponentCategory, componentId: string) => {
    setSelectedComponentIds((current) => ({
      ...current,
      [category]: componentId,
    }));
  };

  const loadBuild = (savedBuild: SavedBikeBuild) => {
    setSelectedComponentIds(savedBuild.selectedComponentIds);
    setBuildName(savedBuild.name);
    setSelectedSavedBuildId(savedBuild.id);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">Road bike configurator</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Click a bike part, compare verified component options, and see whether the current build still fits together.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5">Seed build: Shimano 105 R7000</span>
            <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5">No live retailer pricing</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <section className="space-y-4" aria-label="Bike diagram and part shortcuts">
            <BikeDiagram
              selectedPartId={selectedPart.id}
              relatedPartIds={relatedPartIds}
              unavailablePartIds={unavailablePartIds}
              onSelectPart={setSelectedPartId}
            />
            <PartShortcuts selectedPartId={selectedPart.id} onSelectPart={setSelectedPartId} />
          </section>

          <aside className="space-y-4 lg:sticky lg:top-5">
            <SavedBuildsPanel
              buildName={buildName}
              selectedBuildId={selectedSavedBuildId}
              savedBuilds={savedBuilds}
              selectedComponentIds={selectedComponentIds}
              onBuildNameChange={setBuildName}
              onSavedBuildsChange={setSavedBuilds}
              onSelectedBuildIdChange={setSelectedSavedBuildId}
              onLoadBuild={loadBuild}
            />
            <ComponentDetailPanel part={selectedPart} component={selectedComponent} status={selectedStatus} notes={notes} />
            <CompatibilitySummary compatibility={compatibility} totalPrice={totalPrice} />
            <ComponentPicker
              category={selectedPart.category}
              options={componentOptions}
              selectedComponentIds={selectedComponentIds}
              compatibility={compatibility}
              onSelectComponent={selectComponent}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

function PartShortcuts({ selectedPartId, onSelectPart }: { selectedPartId: BikeDiagramPartId; onSelectPart: (partId: BikeDiagramPartId) => void }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {bikeDiagramParts.map((part) => {
          const selected = part.id === selectedPartId;
          return (
            <button
              key={part.id}
              type="button"
              onClick={() => onSelectPart(part.id)}
              className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                selected
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {part.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
