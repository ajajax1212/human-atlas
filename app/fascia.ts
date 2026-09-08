import nativeMetadata from '../public/models/fascia-metadata.json';
import type {SystemId} from './anatomy';

export type EvidenceLevel = 'source-named' | 'image-derived' | 'literature-derived' | 'inferred';
export type FascialClassification = 'superficial' | 'deep' | 'visceral' | 'neural' | 'other' | 'uncertain';
export interface FasciaMetadata {
  partId: string;
  conceptId: string;
  name: string;
  system: SystemId;
  classification: FascialClassification;
  structureType: string;
  evidence: EvidenceLevel;
  sourceDataset: 'BodyParts3D-4.0' | 'VHP-Connective-Tissue-2025' | 'Literature' | 'Derived';
  sourceReference: string;
  notes: string;
}
export const EVIDENCE_LABELS: Record<EvidenceLevel,string> = {
  'source-named': 'Source anatomy',
  'image-derived': 'Image-derived',
  'literature-derived': 'Literature-derived',
  inferred: 'Inferred / Educational model',
};
export const DEFAULT_FASCIA_OPACITY = 0.65;
export const fasciaMetadata = new Map((nativeMetadata.parts as FasciaMetadata[]).map(p => [p.partId,p]));
export const isFascialLayer = (system:string) => system === 'fascia' || system === 'fascial-system';
