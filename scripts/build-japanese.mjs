import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const atlas=JSON.parse(await readFile(new URL('public/models/atlas.json',root)));
const records={},sources=[];
const japanese=s=>/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(s);
for(const file of ['isa_parts_list.txt','partof_parts_list.txt']){
 const raw=await readFile(new URL('research/name-sources/'+file,root));
 sources.push({url:'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/'+file,sha256:createHash('sha256').update(raw).digest('hex')});
 const lines=raw.toString('utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
 if(lines.shift()!=='concept id\trepresentation id\ten\tkanji\tkana')throw Error('Unexpected columns');
 for(const line of lines){const [id,representationId,en,kanji,kana]=line.split('\t');if(!id||!en||kanji===undefined||kana===undefined)throw Error('Invalid source row');
  const row={representationId,en,kanji,kana,source:file};
  (records[id]??=[]).push(row);
 }
}
// 英語のままのkanji欄を日本語名と誤認しない。階層ごとに異なるBP番号ではなくFMA IDを照合する。
const names={};
for(const id of new Set([...atlas.concepts.map(c=>c.id),...atlas.parts.map(p=>p.conceptId)])){
 const rows=records[id]??[],translated=rows.filter(r=>japanese(r.kanji));
 names[id]={ja:translated[0]?.kanji??null,kana:translated.find(r=>japanese(r.kana))?.kana??null,rows};
}
const count=items=>({total:items.length,japanese:items.filter(x=>names[x.id??x.conceptId]?.ja).length});
const concepts=count(atlas.concepts),parts={total:atlas.parts.length,japanese:atlas.parts.filter(p=>names[p.conceptId]?.ja).length};
concepts.englishFallback=concepts.total-concepts.japanese;parts.englishFallback=parts.total-parts.japanese;
const output={sourceDataset:'BodyParts3D-4.0',sources,policy:'Exact concept ID; official kanji only; no inferred translations; ISA preferred, PARTOF supplements; English fallback',coverage:{concepts,parts},names};
await writeFile(new URL('public/models/names-ja.json',root),JSON.stringify(output)+'\n');
console.log(JSON.stringify(output.coverage));
