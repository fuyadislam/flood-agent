# Bonnasaathi — Flood Companion

A bilingual website for the Bonnasaathi flood-preparedness agent. The experience includes a Three.js Bangladesh relief model, an interactive map with all 64 district markers, household checklists, volunteer announcement copy and the agent's safety and backtest story.

## Run locally

```sh
pnpm install
pnpm dev
```

For a production build, run `pnpm build` and serve the generated `dist/` folder.

## Forecast data

The site reads `src/data/districts.json` and `src/data/status.json`, derived from the user-supplied flood-agent project. This is a snapshot, not a live connection. To refresh the district outlook, run the agent project's `export_site.py` after its forecast thresholds and data are ready, then replace `src/data/status.json` with the updated `docs/status.json` and rebuild.

The map draws country-level outline geography and places each district marker at the approximate coordinates supplied by the agent. It does not include district boundary polygons or river-discharge numbers. The Warning/Danger rehearsal controls are simulations only and never update the saved forecast snapshot.

## Safety

This site is preparedness support, not an official warning. For Bangladesh emergencies call 999 and follow the Flood Forecasting and Warning Centre, local authorities, and—on coastal cyclone/storm-surge threats—the Bangladesh Meteorological Department.
