import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const base=new URL('../public/models/fascia/',import.meta.url);
const m=JSON.parse(fs.readFileSync(new URL('vhp-atlas.json',base),'utf8'));
assert.equal(m.sourceDataset,'VHP-Connective-Tissue-2025');assert.equal(m.evidence,'image-derived');assert.equal(m.structureType,'connective-tissue-volume');assert.equal(m.sourceDoi,'10.17632/zc53h3dcfg.1');assert.equal(m.inputSha256,'836db59cc879fd69448382eba240bd52df03c3c1639a306ab952f35b90886e37');
const b=fs.readFileSync(new URL('vhp-0.bin',base)),g=fs.readFileSync(new URL('vhp-0.bin.gz',base));
assert.equal(b.length,m.bytes);assert.equal(g.length,m.gzipBytes);assert.deepEqual(gunzipSync(g),b);
for(const [data,expected] of [[b,m.sha256],[g,m.gzipSha256]])assert.equal(createHash('sha256').update(data).digest('hex'),expected);
assert.equal(m.positions,0);assert.equal(m.normals,m.vertexCount*12);assert.equal(m.indices,m.vertexCount*24);assert.equal(m.bytes,m.indices+m.indexCount*4);assert.equal(m.indexCount%3,0);assert.ok(m.vertexCount<=5000000&&m.indexCount<=15000000);
const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
for(let i=0;i<m.vertexCount;i++){let n2=0;for(let d=0;d<3;d++){const v=b.readFloatLE(i*12+d*4),n=b.readFloatLE(m.normals+i*12+d*4);assert.ok(Number.isFinite(v)&&Number.isFinite(n));min[d]=Math.min(min[d],v);max[d]=Math.max(max[d],v);n2+=n*n;}assert.ok(n2<1.01);}
for(let i=0;i<m.indexCount;i++)assert.ok(b.readUInt32LE(m.indices+i*4)<m.vertexCount);
for(let d=0;d<3;d++){assert.ok(Math.abs(min[d]-m.bounds[0][d])<1e-6);assert.ok(Math.abs(max[d]-m.bounds[1][d])<1e-6);}
assert.deepEqual(m.registration.matrix[3],[0,0,0,1]);assert.equal(m.registration.manualAdjustment,false);assert.equal(m.processing.threshold,'> 0');assert.ok(m.processing.metrics.after.triangles===m.indexCount/3);assert.ok(m.processing.metrics.before.components>0);
console.log(`PASS: VHP image-derived overlay, ${m.vertexCount} vertices / ${m.indexCount/3} triangles; finite positions/normals, indices, bounds, gzip and hashes, source and registration provenance.`);
