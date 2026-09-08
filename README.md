# Human Atlas — Fascia study

This project is derived from **Human Atlas by ashemag**.
Original project: https://github.com/ashemag/human-atlas

This fork adds experimental fascia visualization infrastructure. Connective tissue research overlays are planned, **not included**. Anatomical data attribution and licensing are documented separately in [ATTRIBUTION.md](public/ATTRIBUTION.md). Development stays on `feature/fascia-layer`; no upstream PR or main merge is part of this work.

## Native fascial display and evidence

- **Fascia (named): not represented.** No independent named-fascia mesh was verified in the packaged atlas. This is not a claim about all BodyParts3D data. The original named-fascia Phase 1 acceptance condition remains unmet.
- **Fascial system:** the owner-approved broader category, containing only the existing right/left iliotibial tracts and right/left wrist flexor retinacula. These are not complete fascia lata or upper-limb fascia models.
- Toggle or show only the category, search `fascial system`, `iliotibial tract`, `retinaculum`, or the source names/IDs, select, isolate, and explode. Open **Opacity & comparison** for opacity (10–100%, default 65%) and muscle/skeleton comparison presets. Reset restores 65%.
- The inspector shows exact source pieces, concept IDs, uncertain subclassification, official references and **Source anatomy** evidence. Source anatomy means the source provides the name and geometry, not direct segmentation of a specific donor. Parent-concept search results may represent only the listed constituent meshes.
- **Evidence system:** source-named, image-derived, literature-derived, and inferred are separate metadata categories. Only source-named geometry is shipped here. No inferred geometry fills missing anatomy.
- **VHP overlay:** deferred; no NIfTI, new mesh, registration, or research overlay is loaded. VHP connective tissue must be a separate image-derived research layer, never relabeled named fascia.
- **Disclaimer:** education, exploration, and anatomical understanding only. Not for diagnosis, surgical planning, patient-specific medical decisions, or treatment decisions.

Curated decisions are in [data/fascia-native.json](data/fascia-native.json); all six candidates, exclusions, source verification and the baseline are in [research](research/phase-1-status.md). The allowlist is explicit; the regex candidate generator never makes classification decisions. All source geometry is reused unchanged.

```sh
npm run analyze:fascia
npm run classify:fascia
npm run validate
npm run build
```

`analyze:fascia` requires Git history containing the pinned source commit. Classification and validation work offline from the packaged files. The optional `node scripts/validate-fascia.mjs --require-named-fascia` deliberately fails until independent named-fascia data meet the original acceptance condition. That failure is a documented data limitation, not a passing named-fascia implementation.

## Original Human Atlas

An interactive 3D anatomy explorer built with React, Three.js, and shadcn/ui. Take the BodyParts3D adult male reference apart into **2,234 individually selectable meshes**, explore **15 anatomical systems**, and search **3,432 named concepts**.

**[Explore the original author's live demo](https://human-atlas-seven.vercel.app)** — this is the unmodified upstream site, not the fascia fork.

## Explore

- Orbit, zoom, and select structures directly on the body.
- Toggle individual systems or use skeleton and organ presets.
- Move from assembled anatomy to a spaced inventory of every visible piece.
- Search anatomical names and source identifiers.
- Isolate a selected structure and read its details.
- Use compact controls and detail panels on mobile.

## Run locally

Requires Node.js 22.13 or newer. No API keys or accounts are needed.

```sh
npm ci
npm run dev
```

Open http://localhost:3016. To build the static site, run `npm run build`; the output is in `dist/`.

## Validate

```sh
npm run check
node scripts/validate-atlas.mjs
node scripts/validate-interactions.mjs
npm run build
```

Validation covers mesh buffers, names and concept membership, nonoverlapping exploded layouts at desktop and mobile aspect ratios, search and inspection contracts, and tap-versus-drag handling. Browser interaction checks have exercised selection, system controls, search, isolation, rotation, and 390×844, 320×568, and 844×390 layouts. Phone controls stay clear of the exploded inventory, and isolated structures fit the space above or beside the detail panel. Physical-device performance and real multitouch hardware have not been tested.

## Anatomy data

The current viewer uses **BodyParts3D 4.0**, an adult male reference anatomy, licensed **CC BY 4.0**. It does not represent every human structure or variation. Individual source meshes are distinct from named concepts, which may group multiple meshes. Descriptions distinguish general system context from individual organ explanations.

Geometry is simplified for browser performance while retaining every source mesh. The packaged model contains 2,288,268 triangles and downloads approximately 33 MB of compressed geometry. Full credits, source links, and adaptation details are in [ATTRIBUTION.md](public/ATTRIBUTION.md).

This is an educational explorer, not a diagnostic or surgical tool.

## How it works

Geometry is merged into batches. Per-structure GPU textures control translation, visibility, and selection, while component geometry supports accurate picking. Exploded layouts pack only the visible pieces. Rendering updates when the scene changes; orbit controls remain responsive without thousands of separate draw calls.

The optional WebMCP tools expose anatomy search and inspection in compatible browsers. The visible interface works without them.

## Rebuilding geometry

The repository includes browser-ready geometry. Rebuilding it is optional: obtain the official BodyParts3D OBJ archive and English metadata tables, prepare the joined concepts and display-system mappings, run `scripts/convert-anatomy.py`, then `node scripts/optimize-anatomy.mjs` and `node scripts/compress-models.mjs`. Simplification uses a 0.2% relative error limit per structure.

## Deploy

Import this repository into Vercel as a Vite project. The included `vercel.json` configures `npm ci`, `npm run build`, and the `dist` output directory. It can also be served by a static host.

## License

Original application code is released under the [MIT License](LICENSE). **The anatomy data has its own CC BY 4.0 license**; preserve the attribution when redistributing it. Third-party dependencies retain their respective licenses.

Issues and pull requests are welcome. Please include reproduction steps and browser/device details for interaction problems.
