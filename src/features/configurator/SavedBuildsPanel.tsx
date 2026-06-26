"use client";

import { FolderOpen, Save, Trash2 } from "lucide-react";

import type { SavedBikeBuild, SelectedComponentIds } from "@/lib/builds/builds";
import { deleteSavedBikeBuild, loadSavedBikeBuilds, saveBikeBuildToStorage } from "@/lib/builds/builds";
import { formatPrice, statusTone } from "@/features/configurator/configurator-data";

interface SavedBuildsPanelProps {
  buildName: string;
  selectedBuildId: string | undefined;
  savedBuilds: SavedBikeBuild[];
  selectedComponentIds: SelectedComponentIds;
  onBuildNameChange: (name: string) => void;
  onSavedBuildsChange: (builds: SavedBikeBuild[]) => void;
  onSelectedBuildIdChange: (buildId: string | undefined) => void;
  onLoadBuild: (build: SavedBikeBuild) => void;
}

export function SavedBuildsPanel({
  buildName,
  selectedBuildId,
  savedBuilds,
  selectedComponentIds,
  onBuildNameChange,
  onSavedBuildsChange,
  onSelectedBuildIdChange,
  onLoadBuild,
}: SavedBuildsPanelProps) {
  const selectedSavedBuild = selectedBuildId ? savedBuilds.find((build) => build.id === selectedBuildId) : undefined;
  const saveLabel = selectedSavedBuild ? "Update saved build" : "Save current build";

  const handleSave = () => {
    const storage = getClientStorage();
    const savedBuild = saveBikeBuildToStorage(storage, {
      name: buildName,
      selectedComponentIds,
      existingBuildId: selectedBuildId,
    });

    onSavedBuildsChange(loadSavedBikeBuilds(storage));
    onSelectedBuildIdChange(savedBuild.id);
    onBuildNameChange(savedBuild.name);
  };

  const handleDelete = (buildId: string) => {
    const nextBuilds = deleteSavedBikeBuild(getClientStorage(), buildId);
    onSavedBuildsChange(nextBuilds);

    if (selectedBuildId === buildId) {
      onSelectedBuildIdChange(undefined);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="saved-builds-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="saved-builds-heading" className="text-base font-semibold text-slate-950">
            Saved builds
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">Keep local copies of builds you want to revisit.</p>
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
          Local only
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Build name</span>
          <input
            type="text"
            value={buildName}
            onChange={(event) => onBuildNameChange(event.target.value)}
            placeholder="Build name"
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {saveLabel}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {savedBuilds.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-5 text-slate-600">
            No saved builds yet. Save the current setup to make it appear here.
          </p>
        ) : (
          savedBuilds.map((build) => {
            const tone = statusTone[build.compatibilityStatus];
            const isSelected = build.id === selectedBuildId;

            return (
              <article
                key={build.id}
                className={`rounded-md border p-3 ${
                  isSelected ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-950">{build.name}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {formatPrice(build.estimatedTotalPrice)} · Updated {formatSavedTime(build.updatedAt)}
                    </p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-1 text-xs font-medium ${tone.className}`}>
                    {tone.label}
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onLoadBuild(build)}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    <FolderOpen aria-hidden="true" className="h-4 w-4" />
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(build.id)}
                    aria-label={`Delete ${build.name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-100"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export function getClientStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

function formatSavedTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
