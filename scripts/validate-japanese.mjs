import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {displayName,matchesName,hasJapaneseName} from '../app/names.ts';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root));
const atlasRaw=await read('public/models/atlas.json'),atlas=JSON.parse(atlasRaw),metadata=JSON.parse(await read('public/models/names-ja.json'));
// Phase 1.5ではsystem割当を含むmanifest全体が前回公開版と同一である必要がある。
assert.equal(atlasRaw.toString(),execFileSync('git',['show','8ce12d6:public/models/atlas.json'],{encoding:'utf8',maxBuffer:16*1024*1024}));
const rows=new Map();
for(const source of metadata.sources){const file=source.url.split('/').at(-1),raw=await read('research/name-sources/'+file);assert.equal(createHash('sha256').update(raw).digest('hex'),source.sha256);for(const line of raw.toString().trim().split(/\r?\n/).slice(1)){const [id,representationId,en,kanji,kana]=line.split('\t');const list=rows.get(id)??[];list.push({representationId,en,kanji,kana,source:file});rows.set(id,list);}}
for(const [id,n] of Object.entries(metadata.names)){assert.deepEqual(n.rows,rows.get(id)??[]);const translated=n.rows.filter(r=>/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(r.kanji));assert.equal(n.ja,translated[0]?.kanji??null);}
assert.equal(displayName('FMA51048','iliotibial tract'),'腸脛靱帯');
for(const q of ['腸脛靱帯','腸脛靭帯','iliotibial tract','ちょうけいじんたい','チョウケイジンタイ'])assert.ok(matchesName('FMA51048','iliotibial tract',q),q);
for(const id of ['FMA58776','FMA58777','FMA40120','FMA40121'])assert.equal(hasJapaneseName(id),false);
assert.equal(displayName('unknown','Original English'),'Original English');assert.equal(matchesName('FMA51048','iliotibial tract','不存在'),false);
for(const [kind,items] of [['concepts',atlas.concepts],['parts',atlas.parts]]){const translated=items.filter(x=>hasJapaneseName(kind==='parts'?x.conceptId:x.id)).length;assert.deepEqual(metadata.coverage[kind],{total:items.length,japanese:translated,englishFallback:items.length-translated});}
console.log('PASS: official Japanese source hashes and every mapped row; English fallback; Japanese/English/kana search; exact Phase 1.5 manifest identity.');
console.log(JSON.stringify(metadata.coverage));

