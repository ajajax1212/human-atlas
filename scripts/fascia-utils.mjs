import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const atlasHash = atlas => sha256(JSON.stringify(atlas));
export function entries(allowlist) {
  assert.equal(allowlist.version, 1);
  return [
    ...allowlist.parts.map(p => ({...p, system: 'fascia'})),
    ...allowlist.fascialSystemParts.map(p => ({...p, system: 'fascial-system'})),
  ];
}
export function validateEntries(atlas, allowlist) {
  const list = entries(allowlist), seen = new Set();
  const parts = new Map(atlas.parts.map(p => [p.id, p]));
  const concepts = new Map(atlas.concepts.map(c => [c.id, c]));
  for (const item of list) {
    assert.ok(!seen.has(item.id), `Duplicate allowlist ID: ${item.id}`);
    seen.add(item.id);
    const part = parts.get(item.id);
    assert.ok(part, `Unknown source part: ${item.id}`);
    assert.equal(part.conceptId, item.conceptId, `Concept identity: ${item.id}`);
    assert.equal(part.name, item.name, `Source name: ${item.id}`);
    assert.ok(concepts.get(item.conceptId)?.elements.includes(item.id), `Concept membership: ${item.id}`);
    assert.ok(part.system === item.originalSystem || part.system === item.system, `Unexpected system: ${item.id}`);
    assert.equal(item.evidence, 'source-named');
    assert.equal(item.sourceDataset, 'BodyParts3D-4.0');
    assert.ok(['superficial','deep','visceral','neural','other','uncertain'].includes(item.classification));
    assert.ok(item.structureType && item.notes?.trim());
    assert.equal(new URL(item.sourceReference).hostname, 'dbarchive.biosciencedbc.jp');
  }
  return list;
}
export function classify(atlas, allowlist) {
  const list = validateEntries(atlas, allowlist);
  const byId = new Map(list.map(p => [p.id, p]));
  return {...atlas, parts: atlas.parts.map(p => byId.has(p.id) ? {...p, system: byId.get(p.id).system} : p)};
}
export function metadataFor(allowlist) {
  return {version: 1, sourceCommit: allowlist.sourceCommit, namedFasciaStatus: allowlist.namedFasciaStatus,
    parts: entries(allowlist).map(({originalSystem, ...p}) => ({...p, partId: p.id}))};
}
