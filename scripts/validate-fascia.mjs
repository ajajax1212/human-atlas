import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {atlasHash,sha256,validateEntries,metadataFor,classify} from './fascia-utils.mjs';

const root=new URL('../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root)));
const atlas=read('public/models/atlas.json'),allowlist=read('data/fascia-native.json');
const baseline=read('research/atlas-baseline.json');
const approved=validateEntries(atlas,allowlist),byId=new Map(approved.map(p=>[p.id,p]));
assert.equal(baseline.sourceCommit,allowlist.sourceCommit);
assert.equal(atlas.parts.length,baseline.parts);
assert.equal(atlas.concepts.length,baseline.concepts);
assert.equal(atlas.triangles,baseline.triangles);
assert.equal(atlas.parts.reduce((n,p)=>n+p.indexCount/3,0),baseline.triangles);
assert.equal(atlas.chunks.length,baseline.chunks);
assert.equal(new Set(atlas.parts.map(p=>p.id)).size,atlas.parts.length);
assert.equal(new Set(atlas.concepts.map(c=>c.id)).size,atlas.concepts.length);
for(const p of atlas.parts){
  if(byId.has(p.id))assert.equal(p.system,byId.get(p.id).system);
  else assert.ok(!['fascia','fascial-system'].includes(p.system),`Unapproved classification: ${p.id}`);
}
// Restore only approved system values, then hash EVERY manifest field, including
// offsets, bounds, vertex/index counts, all chunk descriptors and concept relations.
const restored={...atlas,parts:atlas.parts.map(p=>byId.has(p.id)?{...p,system:byId.get(p.id).originalSystem}:p)};
assert.equal(atlasHash(restored),baseline.canonicalAtlasSha256,'Unexpected atlas change beyond explicit classifications');
assert.deepEqual(atlas.chunks.flatMap(c=>[c.url,c.gzip]),baseline.assets.map(a=>a.url));
for(const asset of baseline.assets){
  const bytes=readFileSync(new URL(`public${asset.url}`,root));
  assert.equal(bytes.length,asset.bytes,asset.url);
  assert.equal(sha256(bytes),asset.sha256,`Geometry changed: ${asset.url}`);
}
for(const chunk of atlas.chunks)assert.deepEqual(gunzipSync(readFileSync(new URL(`public${chunk.gzip}`,root))),readFileSync(new URL(`public${chunk.url}`,root)));
const ids=new Set(atlas.parts.map(p=>p.id));
for(const c of atlas.concepts)for(const id of c.elements)assert.ok(ids.has(id));
assert.deepEqual(read('public/models/fascia-metadata.json'),metadataFor(allowlist));
assert.deepEqual(classify(atlas,allowlist),atlas,'Classification must be idempotent');
const candidates=read('research/fascia-candidates.json');
assert.equal(candidates.sourceCommit,baseline.sourceCommit);
assert.equal(candidates.candidates.length,6);
assert.equal(allowlist.parts.length,0,'Named fascia stays empty for this reviewed snapshot');
assert.equal(allowlist.namedFasciaStatus,'not represented');
assert.deepEqual([...byId.keys()].sort(),['FJ1423','FJ1423M','FJ1471','FJ1471M']);
for(const id of ['FJ1438','FJ1438M'])assert.ok(!byId.has(id),'Muscle must not become fascia');

// Negative cases use copies, never shipped assets.
for(const mutate of [
  a=>a.fascialSystemParts.push({...a.fascialSystemParts[0]}),
  a=>a.fascialSystemParts[0].id='nonexistent-test-only',
  a=>a.fascialSystemParts[0].conceptId='nonexistent-test-only',
  a=>a.fascialSystemParts[0].name='Incorrect source name',
  a=>a.fascialSystemParts[0].evidence='inferred',
  a=>a.fascialSystemParts[0].sourceReference='',
]){const copy=structuredClone(allowlist);mutate(copy);assert.throws(()=>classify(atlas,copy));}
const before=JSON.stringify(restored);classify(restored,allowlist);assert.equal(JSON.stringify(restored),before);
console.log(`PASS: ${approved.length} broader fascial-system pieces; 0 independent named fasciae (not represented).`);
console.log(`PASS: ${baseline.parts} parts; ${baseline.concepts} concepts; ${baseline.triangles} triangles; ${baseline.assets.length} unchanged binary/gzip SHA-256 checks; complete manifest identity except approved systems.`);
console.log('PASS: provenance, gzip decoding, membership, idempotence, duplicate/unknown/mismatched IDs and incorrect evidence rejection.');
if(process.argv.includes('--require-named-fascia'))assert.ok(allowlist.parts.length>0,'Original named-fascia acceptance BLOCKED: no independent verified mesh. Broader Fascial system is the owner-approved alternative.');
