import {readFileSync, writeFileSync} from 'node:fs';
import {classify, metadataFor} from './fascia-utils.mjs';

const root = new URL('../', import.meta.url);
const path = new URL('public/models/atlas.json', root);
const input = readFileSync(path, 'utf8');
const allowlist = JSON.parse(readFileSync(new URL('data/fascia-native.json', root)));
const atlas = JSON.parse(input), result = classify(atlas, allowlist);
// Only four approved system values change. All geometry and concept fields survive verbatim.
if (JSON.stringify(result) !== JSON.stringify(atlas)) writeFileSync(path, JSON.stringify(result));
writeFileSync(new URL('public/models/fascia-metadata.json', root), JSON.stringify(metadataFor(allowlist), null, 2) + '\n');
console.log(`Named fascia: ${allowlist.parts.length}; broader Fascial system: ${allowlist.fascialSystemParts.length}. No geometry generated.`);
