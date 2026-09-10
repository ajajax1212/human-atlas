import metadata from '../public/models/names-ja.json' with {type:'json'};
type NameRecord={ja:string|null;kana:string|null;rows:{en:string;kanji:string;kana:string;representationId:string;source:string}[]};
const names:Record<string,NameRecord>=metadata.names;
export const displayName=(id:string,en:string)=>names[id]?.ja?.split(';')[0]||en;
export const hasJapaneseName=(id:string)=>Boolean(names[id]?.ja);
// 表記ゆれの吸収は検索だけに限定し、公式名称metadataを書き換えない。
export const normalizeSearch=(value:string)=>value.normalize('NFKC').toLowerCase().replaceAll('靭','靱').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).trim();
export function matchesName(id:string,en:string,query:string){const n=names[id];return normalizeSearch([id,en,n?.ja,n?.kana,...(n?.rows.flatMap(r=>[r.en,r.kanji,r.kana,r.representationId])??[])].join(' ')).includes(normalizeSearch(query));}
