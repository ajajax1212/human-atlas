import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {entries} from './fascia-utils.mjs';

const root = new URL('../', import.meta.url);
const allowlist = JSON.parse(readFileSync(new URL('data/fascia-native.json', root)));
const atlas = JSON.parse(execFileSync('git', ['show', `${allowlist.sourceCommit}:public/models/atlas.json`], {cwd: root, maxBuffer: 16 * 1024 * 1024}));
const terms = ['fascia','fascial','aponeurosis','retinaculum','intermuscular septum','iliotibial tract'];
const matches = name => terms.filter(t => name.toLowerCase().includes(t));
const approved = new Map(entries(allowlist).map(p => [p.id, p]));
const candidates = atlas.parts.filter(p => matches(p.name).length).map(p => ({
  partId: p.id, conceptId: p.conceptId, englishName: p.name, currentSystem: p.system,
  candidateReason: matches(p.name),
  decision: approved.get(p.id)?.system ?? 'excluded',
  reason: approved.get(p.id)?.notes ?? 'Tensor fasciae latae is a muscle name, not a named fascia. Preserve original system; correcting pre-existing atlas groupings is outside this change.',
}));
const report = {
  source: `https://github.com/ashemag/human-atlas/tree/${allowlist.sourceCommit}`,
  sourceCommit: allowlist.sourceCommit,
  summary: {totalParts: atlas.parts.length, totalConcepts: atlas.concepts.length, totalTriangles: atlas.triangles,
    chunks: atlas.chunks.length, systems: atlas.parts.reduce((r,p) => ({...r,[p.system]:(r[p.system]??0)+1}), {}),
    connectiveTissueParts: atlas.parts.filter(p=>p.system==='connective').length,
    namedFasciaIncluded: allowlist.parts.length, fascialSystemIncluded: allowlist.fascialSystemParts.length},
  searchTerms: terms, candidates,
  matchingConcepts: atlas.concepts.filter(c=>matches(c.name).length).map(c=>({...c,
    sourcePieces: c.elements.map(id=>{const p=atlas.parts.find(p=>p.id===id);return {id,name:p.name,conceptId:p.conceptId};})})),
  caveat: 'Candidate generation is not classification. Parent concept membership does not establish complete geometry of that parent. No independent named fascia was verified in this snapshot. Do not interpret this as absence from all BodyParts3D releases.',
};
mkdirSync(new URL('research/',root),{recursive:true});
writeFileSync(new URL('research/fascia-candidates.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({summary:report.summary,candidates},null,2));
