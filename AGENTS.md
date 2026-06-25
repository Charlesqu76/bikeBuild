# AGENTS.md

Guidance for AI agents working in this repository. Keep this file short and update it only when durable project rules change.

## Product Direction

- Build a road bike component configurator for understanding, comparing, and saving road bike builds.
- MVP priority is a fast, beginner-friendly 2D interactive configurator, not a marketplace or fitting tool.
- Treat `road-bike-configurator-prd.md` as the product source of truth when requirements are unclear.
- Do not add 3D features, checkout flows, marketplace features, bike photo recognition, or AI bike fitting unless explicitly requested.

## Recommended Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query.
- Bike diagram: SVG with separate interactive shapes for clickable bike parts.
- Backend: Hono preferred for a lightweight TypeScript API; NestJS is acceptable for a modular backend if the codebase moves that way.
- Database: PostgreSQL with Drizzle ORM.
- Search: PostgreSQL full-text search for MVP; consider Meilisearch or Typesense only after the component dataset grows.
- Auth: Better Auth or Auth.js if authentication is needed.
- Price worker: separate Node.js or Python worker with scheduled jobs; BullMQ and Redis are acceptable later.

## Expected Project Structure

Use this structure unless the repository already establishes a stronger convention:

```text
app/ or src/app/             Next.js routes and layouts
components/                  Shared UI components
components/bike-diagram/     SVG bike diagram and clickable part components
features/configurator/       Build configuration UI and state
features/components/         Component search, filters, and detail panel
lib/compatibility/           Rule-based compatibility engine
lib/pricing/                 Price range helpers and source metadata
lib/data/                    MVP seed data before database migration
server/                      Hono or NestJS API when backend is added
db/                          Drizzle schema, migrations, and seed scripts
workers/price-sync/          Scheduled price collection, separate from main API
```

## Domain Model

- Keep bike component data structured. Avoid large untyped blobs for core entities.
- Preserve these core entities: `components`, `compatibility_rules`, `price_records`, and `bike_builds`.
- Components should support fields such as brand, model, category, speed, brake type, shifting type, freehub, axle type, bottom bracket standard, weight, and description.
- Bike builds should store selected component IDs by category plus estimated total price and overall compatibility status.
- Use stable IDs for components and builds; do not rely on display names as identifiers.

## UI Rules

- First screen should be the usable configurator, not a marketing landing page.
- Desktop layout: main 2D bike diagram with a right-side component detail panel and compatibility summary.
- Mobile layout: bike diagram first, then component tabs/details and compatibility summary below.
- Clickable bike parts must have touch-friendly targets and visible selected/highlight states.
- The detail panel should show brand, model, category, speed, brake type, optional weight/material, compatible standards, estimated price range, status, notes, and warnings.
- Related components may be highlighted together, for example groupset parts.
- Prioritize clear beginner-friendly wording over mechanic jargon.

## Compatibility Rules

- Keep compatibility checks outside UI components.
- Implement compatibility as traceable rule-based logic or data-backed rules.
- Status values must be exactly: `compatible`, `warning`, `incompatible`, `unknown`.
- Show `unknown` honestly when data is insufficient; do not guess.
- Important dimensions include drivetrain speed, shifter/derailleur pairing, cassette capacity, chain speed, 1x/2x support, brake type, frame brake mount, axle type, freehub body, bottom bracket, crank spindle, rotor mount, and tire clearance.
- Compatibility messages should explain the specific mismatch in plain language.

## Pricing Rules

- MVP prices are estimated ranges, not exact live prices.
- Start with manually collected price data or seed data.
- Always store or display currency and last updated/check time when price data is sourced.
- Do not claim real-time retailer coverage unless implemented.
- Price collection must be separate from the main UI and main API.
- Use retailer APIs or permitted sources only; do not add scraping against site terms.

## MVP Scope

- Include clickable 2D road bike parts, component selection, basic compatibility warnings, estimated price range, and save/load builds.
- Support at least these component groups early: groupset, wheelset, cassette, crankset, and brake type.
- Initial brands should include Shimano, SRAM, Campagnolo, Microshift, Sensah, and LTWOO where data exists.
- MVP should include at least three brands and detect drivetrain, brake, and wheel compatibility issues.

## Engineering Rules

- Prefer TypeScript for app, API, compatibility, and data code.
- Keep frontend state for the current build isolated from persistent data fetching.
- Do not hardcode compatibility rules directly inside React components.
- Keep price fetching, normalization, and matching logic out of UI code.
- Add tests around compatibility rules whenever changing rule behavior.
- Keep generated data, migrations, and seed data reviewable and deterministic.
- Avoid broad refactors unless they directly support the requested change.

## Documentation

- Update the PRD only for product requirement changes.
- Update this file only for rules future AI agents must follow.
- Keep this file below 200 lines.
