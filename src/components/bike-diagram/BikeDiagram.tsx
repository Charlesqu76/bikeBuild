"use client";

import type { ComponentCategory } from "@/lib/data/types";

export type BikeDiagramPartId =
  | "frame"
  | "fork"
  | "handlebar"
  | "shifters"
  | "stem"
  | "saddle"
  | "seatpost"
  | "crankset"
  | "bottom-bracket"
  | "front-derailleur"
  | "rear-derailleur"
  | "cassette"
  | "chain"
  | "front-wheel"
  | "rear-wheel"
  | "tires"
  | "brake-calipers"
  | "brake-rotors";

export interface BikeDiagramPart {
  id: BikeDiagramPartId;
  label: string;
  category?: ComponentCategory;
  group: "frameset" | "cockpit" | "drivetrain" | "rolling" | "braking" | "contact";
}

export const bikeDiagramParts: BikeDiagramPart[] = [
  { id: "frame", label: "Frame", category: "frame", group: "frameset" },
  { id: "fork", label: "Fork", category: "fork", group: "frameset" },
  { id: "handlebar", label: "Handlebar", category: "handlebar", group: "cockpit" },
  { id: "shifters", label: "Shifters", category: "shifter", group: "drivetrain" },
  { id: "stem", label: "Stem", group: "cockpit" },
  { id: "saddle", label: "Saddle", group: "contact" },
  { id: "seatpost", label: "Seatpost", group: "contact" },
  { id: "crankset", label: "Crankset", category: "crankset", group: "drivetrain" },
  { id: "bottom-bracket", label: "Bottom bracket", category: "bottom-bracket", group: "drivetrain" },
  { id: "front-derailleur", label: "Front derailleur", category: "front-derailleur", group: "drivetrain" },
  { id: "rear-derailleur", label: "Rear derailleur", category: "rear-derailleur", group: "drivetrain" },
  { id: "cassette", label: "Cassette", category: "cassette", group: "drivetrain" },
  { id: "chain", label: "Chain", category: "chain", group: "drivetrain" },
  { id: "front-wheel", label: "Front wheel", category: "wheelset", group: "rolling" },
  { id: "rear-wheel", label: "Rear wheel", category: "wheelset", group: "rolling" },
  { id: "tires", label: "Tires", category: "tire", group: "rolling" },
  { id: "brake-calipers", label: "Brake calipers", category: "brake-caliper", group: "braking" },
  { id: "brake-rotors", label: "Brake rotors", category: "brake-rotor", group: "braking" },
];

interface BikeDiagramProps {
  selectedPartId: BikeDiagramPartId;
  relatedPartIds: BikeDiagramPartId[];
  unavailablePartIds: BikeDiagramPartId[];
  onSelectPart: (partId: BikeDiagramPartId) => void;
}

const baseStroke = "stroke-slate-500";
const selectedStroke = "stroke-emerald-500";
const relatedStroke = "stroke-sky-500";
const unavailableStroke = "stroke-slate-300";

function partClass(partId: BikeDiagramPartId, selectedPartId: BikeDiagramPartId, relatedPartIds: BikeDiagramPartId[], unavailablePartIds: BikeDiagramPartId[]) {
  const stroke = partId === selectedPartId ? selectedStroke : relatedPartIds.includes(partId) ? relatedStroke : unavailablePartIds.includes(partId) ? unavailableStroke : baseStroke;
  const width = partId === selectedPartId ? "stroke-[8]" : relatedPartIds.includes(partId) ? "stroke-[6]" : "stroke-[4]";
  return `${stroke} ${width} fill-none transition-colors`;
}

function hitClass(partId: BikeDiagramPartId, selectedPartId: BikeDiagramPartId) {
  return `cursor-pointer fill-transparent stroke-transparent outline-none focus-visible:stroke-emerald-700 focus-visible:stroke-[5] ${
    partId === selectedPartId ? "hover:stroke-emerald-200" : "hover:stroke-slate-200"
  }`;
}

function WheelSpokes({ cx, cy, radius }: { cx: number; cy: number; radius: number }) {
  return (
    <g className="stroke-slate-300 stroke-[1.5]">
      {Array.from({ length: 20 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 20;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        return <line key={index} x1={cx} y1={cy} x2={x} y2={y} />;
      })}
    </g>
  );
}

export function BikeDiagram({ selectedPartId, relatedPartIds, unavailablePartIds, onSelectPart }: BikeDiagramProps) {
  const selectWithKeyboard = (event: React.KeyboardEvent<SVGGElement>, partId: BikeDiagramPartId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectPart(partId);
    }
  };

  const interactiveProps = (partId: BikeDiagramPartId) => ({
    role: "button",
    tabIndex: 0,
    "aria-pressed": selectedPartId === partId,
    "aria-label": bikeDiagramParts.find((part) => part.id === partId)?.label,
    onClick: () => onSelectPart(partId),
    onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => selectWithKeyboard(event, partId),
  });

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <svg viewBox="0 0 960 560" className="aspect-[16/9] w-full" aria-label="Interactive side-view road bike diagram">
        <defs>
          <linearGradient id="bike-diagram-bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#eef2f7" />
          </linearGradient>
        </defs>

        <rect width="960" height="560" fill="url(#bike-diagram-bg)" />
        <path d="M104 465c170 22 570 22 748 0" className="fill-none stroke-slate-200 stroke-[5]" strokeLinecap="round" />
        <ellipse cx="240" cy="442" rx="138" ry="16" className="fill-slate-200/70" />
        <ellipse cx="735" cy="442" rx="138" ry="16" className="fill-slate-200/70" />

        <g {...interactiveProps("front-wheel")}>
          <WheelSpokes cx={735} cy={376} radius={104} />
          <circle cx="735" cy="376" r="112" className="fill-white/70 stroke-slate-300 stroke-[2]" />
          <circle cx="735" cy="376" r="104" className={partClass("front-wheel", selectedPartId, relatedPartIds, unavailablePartIds)} />
          <circle cx="735" cy="376" r="16" className="fill-white stroke-slate-500 stroke-[4]" />
          <circle cx="735" cy="376" r="128" className={hitClass("front-wheel", selectedPartId)} />
        </g>

        <g {...interactiveProps("rear-wheel")}>
          <WheelSpokes cx={240} cy={376} radius={104} />
          <circle cx="240" cy="376" r="112" className="fill-white/70 stroke-slate-300 stroke-[2]" />
          <circle cx="240" cy="376" r="104" className={partClass("rear-wheel", selectedPartId, relatedPartIds, unavailablePartIds)} />
          <circle cx="240" cy="376" r="16" className="fill-white stroke-slate-500 stroke-[4]" />
          <circle cx="240" cy="376" r="128" className={hitClass("rear-wheel", selectedPartId)} />
        </g>

        <g {...interactiveProps("tires")}>
          <circle cx="735" cy="376" r="123" className={`${partClass("tires", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[16]`} />
          <circle cx="240" cy="376" r="123" className={`${partClass("tires", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[16]`} />
          <circle cx="735" cy="376" r="134" className={hitClass("tires", selectedPartId)} />
          <circle cx="240" cy="376" r="134" className={hitClass("tires", selectedPartId)} />
        </g>

        <g {...interactiveProps("frame")}>
          <path
            d="M242 376 410 204 535 376 242 376 410 376 600 206 535 376M410 204 600 206"
            className={`${partClass("frame", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[12]`}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M382 270l66 64M472 270l-52 68" className="fill-none stroke-slate-300 stroke-[3]" strokeLinecap="round" />
          <path d="M242 376 410 204 535 376 242 376 410 376 600 206 535 376M410 204 600 206" className={`${hitClass("frame", selectedPartId)} stroke-[32]`} />
        </g>

        <g {...interactiveProps("fork")}>
          <path d="M600 206c62 66 90 111 135 170M622 221c49 61 64 107 82 155" className={`${partClass("fork", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[9]`} strokeLinecap="round" />
          <path d="M600 206c62 66 90 111 135 170M622 221c49 61 64 107 82 155" className={`${hitClass("fork", selectedPartId)} stroke-[30]`} />
        </g>

        <g {...interactiveProps("seatpost")}>
          <path d="M410 204 383 139" className={`${partClass("seatpost", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[8]`} strokeLinecap="round" />
          <path d="M410 204 383 139" className={`${hitClass("seatpost", selectedPartId)} stroke-[28]`} />
        </g>

        <g {...interactiveProps("saddle")}>
          <path d="M315 130c38-17 102-18 145-3 13 5 11 16-5 20-48 13-101 9-143-9-7-3-6-6 3-8Z" className={`${partClass("saddle", selectedPartId, relatedPartIds, unavailablePartIds)} fill-white`} strokeLinejoin="round" />
          <path d="M315 130c38-17 102-18 145-3 13 5 11 16-5 20-48 13-101 9-143-9-7-3-6-6 3-8Z" className={`${hitClass("saddle", selectedPartId)} stroke-[20]`} />
        </g>

        <g {...interactiveProps("stem")}>
          <path d="M600 206 664 163" className={`${partClass("stem", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[8]`} strokeLinecap="round" />
          <path d="M600 206 664 163" className={`${hitClass("stem", selectedPartId)} stroke-[28]`} />
        </g>

        <g {...interactiveProps("handlebar")}>
          <path d="M662 163c37-16 86-4 101 23 14 27-5 59-42 61-23 1-42-10-47-28" className={`${partClass("handlebar", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[9]`} strokeLinecap="round" />
          <path d="M704 168c23 21 20 50-3 67" className="fill-none stroke-slate-300 stroke-[3]" strokeLinecap="round" />
          <path d="M662 163c37-16 86-4 101 23 14 27-5 59-42 61-23 1-42-10-47-28" className={`${hitClass("handlebar", selectedPartId)} stroke-[34]`} />
        </g>

        <g {...interactiveProps("shifters")}>
          <path d="M709 202c22 16 28 50 12 79M737 201c14 21 11 44-8 56" className={`${partClass("shifters", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[7]`} strokeLinecap="round" />
          <path d="M709 202c22 16 28 50 12 79M737 201c14 21 11 44-8 56" className={`${hitClass("shifters", selectedPartId)} stroke-[34]`} />
        </g>

        <g {...interactiveProps("crankset")}>
          <circle cx="410" cy="376" r="45" className={`${partClass("crankset", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[5]`} />
          <circle cx="410" cy="376" r="30" className="fill-none stroke-slate-300 stroke-[2]" />
          <path d="M410 376 461 423M410 376 361 329" className={`${partClass("crankset", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[7]`} strokeLinecap="round" />
          <circle cx="410" cy="376" r="58" className={hitClass("crankset", selectedPartId)} />
        </g>

        <g {...interactiveProps("bottom-bracket")}>
          <circle cx="410" cy="376" r="18" className={`${partClass("bottom-bracket", selectedPartId, relatedPartIds, unavailablePartIds)} fill-white`} />
          <circle cx="410" cy="376" r="38" className={hitClass("bottom-bracket", selectedPartId)} />
        </g>

        <g {...interactiveProps("front-derailleur")}>
          <path d="M449 320c-24 18-32 42-22 67" className={`${partClass("front-derailleur", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[7]`} strokeLinecap="round" />
          <path d="M445 324c-26 14-36 36-27 64" className={`${hitClass("front-derailleur", selectedPartId)} stroke-[28]`} />
        </g>

        <g {...interactiveProps("rear-derailleur")}>
          <path d="M264 383c27 21 35 51 18 76M279 458l42 20" className={`${partClass("rear-derailleur", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[7]`} strokeLinecap="round" />
          <circle cx="279" cy="458" r="11" className="fill-white stroke-slate-400 stroke-[3]" />
          <circle cx="321" cy="478" r="11" className="fill-white stroke-slate-400 stroke-[3]" />
          <path d="M264 382c34 30 42 64 11 91M279 458l42 20" className={`${hitClass("rear-derailleur", selectedPartId)} stroke-[30]`} />
        </g>

        <g {...interactiveProps("cassette")}>
          {[40, 34, 28, 22, 16].map((radius) => (
            <circle key={radius} cx="240" cy="376" r={radius} className={`${partClass("cassette", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[3]`} />
          ))}
          <circle cx="240" cy="376" r="50" className={hitClass("cassette", selectedPartId)} />
        </g>

        <g {...interactiveProps("chain")}>
          <path d="M240 376 410 376 279 459 461 423" className={`${partClass("chain", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[6]`} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M240 376 410 376 278 444 455 422" className={`${hitClass("chain", selectedPartId)} stroke-[24]`} />
        </g>

        <g {...interactiveProps("brake-calipers")}>
          <path d="M211 267c28-16 64-12 83 13M705 267c28-16 64-12 83 13" className={`${partClass("brake-calipers", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[8]`} strokeLinecap="round" />
          <path d="M237 276v28M731 276v28" className="stroke-slate-300 stroke-[3]" strokeLinecap="round" />
          <path d="M210 268c30-14 62-10 82 13M704 268c30-14 62-10 82 13" className={`${hitClass("brake-calipers", selectedPartId)} stroke-[32]`} />
        </g>

        <g {...interactiveProps("brake-rotors")}>
          <circle cx="735" cy="376" r="48" className={`${partClass("brake-rotors", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[4]`} />
          <circle cx="240" cy="376" r="48" className={`${partClass("brake-rotors", selectedPartId, relatedPartIds, unavailablePartIds)} stroke-[4]`} />
          <path d="M735 328v96M687 376h96M701 342l68 68M769 342l-68 68M240 328v96M192 376h96M206 342l68 68M274 342l-68 68" className="stroke-slate-300 stroke-[1.5]" />
          <path d="M194 376a46 46 0 0 1 92 0M689 376a46 46 0 0 1 92 0" className={`${hitClass("brake-rotors", selectedPartId)} stroke-[22]`} />
        </g>
      </svg>
    </div>
  );
}
