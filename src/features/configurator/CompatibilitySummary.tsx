import { AlertTriangle, CheckCircle2, CircleHelp, ReceiptText, XCircle } from "lucide-react";

import type { PriceRange } from "@/lib/data/types";
import type { CompatibilityResult } from "@/lib/compatibility/engine";
import { formatPrice, statusTone } from "@/features/configurator/configurator-data";

interface CompatibilitySummaryProps {
  compatibility: CompatibilityResult;
  totalPrice: PriceRange;
}

const statusIcon = {
  compatible: CheckCircle2,
  warning: AlertTriangle,
  incompatible: XCircle,
  unknown: CircleHelp,
};

export function CompatibilitySummary({ compatibility, totalPrice }: CompatibilitySummaryProps) {
  const tone = statusTone[compatibility.status];
  const StatusIcon = statusIcon[compatibility.status];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="compatibility-summary-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="compatibility-summary-heading" className="text-lg font-semibold text-slate-950">
            Build compatibility
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Checks use the verified rule engine for drivetrain, brakes, wheels, and bottom bracket fit.</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium ${tone.className}`}>
          <StatusIcon aria-hidden="true" className="h-4 w-4" />
          {tone.label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <ReceiptText aria-hidden="true" className="h-4 w-4 text-slate-500" />
        <div>
          <p className="text-xs font-medium uppercase tracking-normal text-slate-500">Estimated build range</p>
          <p className="text-sm font-semibold text-slate-950">
            {formatPrice(totalPrice)} <span className="font-normal text-slate-500">checked {totalPrice.lastUpdated || "not available"}</span>
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {compatibility.messages.map((message) => (
          <li key={message} className="flex gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${tone.dotClassName}`} />
            <span>{message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
