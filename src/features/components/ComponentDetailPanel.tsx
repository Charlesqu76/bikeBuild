import { AlertTriangle, CheckCircle2, CircleHelp, XCircle } from "lucide-react";

import type { BikeComponent, CompatibilityStatus } from "@/lib/data/types";
import type { BikeDiagramPart } from "@/components/bike-diagram/BikeDiagram";
import {
  formatBrakeType,
  formatCategory,
  formatPrice,
  formatShiftingType,
  formatStandards,
  statusTone,
} from "@/features/configurator/configurator-data";

interface ComponentDetailPanelProps {
  part: BikeDiagramPart;
  component: BikeComponent | undefined;
  status: CompatibilityStatus;
  notes: string[];
}

const statusIcon = {
  compatible: CheckCircle2,
  warning: AlertTriangle,
  incompatible: XCircle,
  unknown: CircleHelp,
};

export function ComponentDetailPanel({ part, component, status, notes }: ComponentDetailPanelProps) {
  const tone = statusTone[status];
  const StatusIcon = statusIcon[status];
  const standards = formatStandards(component);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="component-detail-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{part.label}</p>
          <h2 id="component-detail-heading" className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            {component ? `${component.brand} ${component.model}` : "No verified component selected"}
          </h2>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium ${tone.className}`}>
          <StatusIcon aria-hidden="true" className="h-4 w-4" />
          {tone.label}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <DetailItem label="Brand" value={component?.brand ?? "Unknown"} />
        <DetailItem label="Model" value={component?.model ?? "Unknown"} />
        <DetailItem label="Category" value={component ? formatCategory(component.category) : part.category ? formatCategory(part.category) : "Not in data yet"} />
        <DetailItem label="Speed" value={component?.speed ? `${component.speed}-speed` : "Not applicable"} />
        <DetailItem label="Brake type" value={formatBrakeType(component?.brakeType)} />
        <DetailItem label="Shifting" value={formatShiftingType(component?.shiftingType)} />
        <DetailItem label="Weight" value={component?.weightGrams ? `${component.weightGrams} g` : "Not listed"} />
        <DetailItem label="Material" value={component?.material ?? "Not listed"} />
        <DetailItem label="Estimated price" value={formatPrice(component?.estimatedPrice)} />
        <DetailItem label="Price checked" value={component?.estimatedPrice.lastUpdated ?? "Not available"} />
      </dl>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-950">Compatible standards</h3>
        {standards.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {standards.map((standard) => (
              <span key={standard} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                {standard}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-600">No verified standard data is available for this part yet.</p>
        )}
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-950">Notes and warnings</h3>
        <ul className="mt-2 space-y-2">
          {notes.map((note) => (
            <li key={note} className="rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-normal text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
