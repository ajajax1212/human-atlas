import {EVIDENCE_LABELS,fasciaMetadata} from './fascia';
import type {Part} from './anatomy';

export function FasciaProvenance({parts, conceptName}:{parts:Part[];conceptName?:string}) {
  const records=parts.flatMap(p=>{const m=fasciaMetadata.get(p.id);return m?[m]:[];});
  if(!records.length)return null;
  return <section className="fascia-provenance" aria-label="Fascial data provenance">
    <h3>Source pieces & evidence</h3>
    {records.some(p=>p.name.toLowerCase()!==conceptName?.toLowerCase())&&<p className="coverage-note">This catalogue concept maps to the source pieces below. It does not establish a complete model of the named parent fascia.</p>}
    {records.map(m=><article key={m.partId}>
      <h4>{m.name}</h4>
      <dl>
        <dt>Display category</dt><dd>{m.system==='fascia'?'Fascia (named)':'Fascial system (broader)'}</dd>
        <dt>Fascial classification</dt><dd>{m.classification==='uncertain'?'Uncertain — not established':m.classification}</dd>
        <dt>Structure type</dt><dd>{m.structureType.replaceAll('-',' ')}</dd>
        <dt>Source dataset</dt><dd>{m.sourceDataset}</dd>
        <dt>Evidence</dt><dd>{EVIDENCE_LABELS[m.evidence]}</dd>
        <dt>Atlas reference</dt><dd>{m.conceptId}</dd>
        <dt>Source mesh</dt><dd>{m.partId}</dd>
      </dl>
      <p>{m.notes}</p>
      <a href={m.sourceReference} target="_blank" rel="noreferrer">Official source mapping ↗</a>
    </article>)}
    <p>Source anatomy means BodyParts3D supplies the name and geometry. It does not mean direct segmentation of a particular donor.</p>
  </section>;
}
