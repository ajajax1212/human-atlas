import {EVIDENCE_LABELS,fasciaMetadata} from './fascia';
import {displayName,hasJapaneseName} from './names';
import type {Part} from './anatomy';
export function FasciaProvenance({parts,conceptName}:{parts:Part[];conceptName?:string}){
 const records=parts.flatMap(p=>{const m=fasciaMetadata.get(p.id);return m?[m]:[];});
 if(!records.length)return null;
 return <section className="fascia-provenance" aria-label="筋膜系データの出典"><h3>収録構造と根拠</h3>
 {records.some(p=>p.name.toLowerCase()!==conceptName?.toLowerCase())&&<p className="coverage-note">この概念に対応する実際のメッシュは以下の構造です。親概念の名称が示す筋膜全体を再現しているわけではありません。</p>}
 {records.map(m=><article key={m.partId}><h4>{displayName(m.conceptId,m.name)}</h4>{!hasJapaneseName(m.conceptId)&&<p>公式日本語名が未登録のため、構造名は英語で表示しています。</p>}<dl>
 <dt>表示区分</dt><dd>{m.system==='fascia'?'筋膜':'筋膜系（広義）'}</dd><dt>筋膜分類</dt><dd>未確定</dd>
 <dt>構造タイプ</dt><dd>{m.structureType==='iliotibial-tract'?'腸脛靱帯':'手首屈筋支帯'}</dd>
 <dt>出典データ</dt><dd>{m.sourceDataset}</dd><dt>根拠</dt><dd>{EVIDENCE_LABELS[m.evidence]}</dd><dt>Atlas ID</dt><dd>{m.conceptId}</dd><dt>3DメッシュID</dt><dd>{m.partId}</dd></dl>
 <p>広義の筋膜系に限って収録しています。このメッシュは{m.structureType==='iliotibial-tract'?'大腿筋膜全体':'上肢の筋膜全体'}を表しません。確認した公式表では筋膜の細分類は確定できません。</p>
 <a href={m.sourceReference} target="_blank" rel="noreferrer">公式の構成表を開く ↗</a></article>)}
 <p>「原データ由来」はBodyParts3Dが名称と形状を提供しているという意味です。特定の献体画像からの直接抽出を意味しません。</p></section>;
}
