# Native fascial display: scope decision

Source commit: `1c38bf35c254a891200d3cedecfd57abebe83d8d` in `ashemag/human-atlas`.

The original Phase 1 assumes existing independent named-fascia meshes. Inspection of all 2,234 packaged parts found none that can be conservatively accepted under that rule. **Original named-fascia Phase 1 is not complete.** This is a data limitation, not a reason to fabricate anatomy.

The owner explicitly selected a revised scope on 2026-09-08: show the existing iliotibial tracts and wrist flexor retinacula in a separate **Fascial system** category. The narrower **Fascia** category remains visible as **not represented**, with unavailable controls disabled. Four approved broader-system parts are independent selectable source meshes. No replacement geometry, synthetic fascia, resegmentation, remeshing, or binary regeneration is permitted.

## Decisions

| Part | Source concept | Source name | Previous system | Decision |
| --- | --- | --- | --- | --- |
| FJ1423 | FMA58776 | Right iliotibial tract | skeletal | Broader Fascial system |
| FJ1423M | FMA58777 | Left iliotibial tract | skeletal | Broader Fascial system |
| FJ1471 | FMA40120 | Flexor retinaculum of right wrist | sensory | Broader Fascial system |
| FJ1471M | FMA40121 | Flexor retinaculum of left wrist | sensory | Broader Fascial system |
| FJ1438 | FMA22425 | Right tensor fasciae latae | connective | Excluded: muscle |
| FJ1438M | FMA22426 | Left tensor fasciae latae | connective | Excluded: muscle |

The original groupings are display categories and contain questionable assignments, including tensor fasciae latae in connective tissue. Unrelated original groupings remain unchanged. Their retention is not medical endorsement.

Searching fascia also finds parent concepts such as fascia lata and investing fascia. These reuse the same tract/retinaculum meshes. A parent name does not establish full geometry for that parent. Original concept memberships stay unchanged, including the asymmetric `deep fascial system` group. The inspector identifies the actual underlying source piece(s) and explains this coverage limit.

The full catalogue and candidates are in `fascia-candidates.json`. `source-verification.json` contains official source URLs, exact matched rows, and file hashes. `atlas-baseline.json` pins the unmodified manifest hash and all 30 binary/gzip hashes.

## Validation policy

`node scripts/validate-fascia.mjs` validates the owner-approved broader-system scope, identity, provenance, unchanged geometry, and explicitly empty named-fascia allowlist. It does **not** claim the original named-fascia requirement is met. The optional `--require-named-fascia` acceptance gate intentionally rejects this data-limited state.

Phase 2 is deferred. No VHP data have been imported, no threshold or registration method has been selected, and no registration accuracy is claimed. It must remain an independent image-derived connective tissue research overlay after a deliberate scope decision; it cannot fill the named-fascia gap by relabeling connective tissue.
