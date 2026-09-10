import * as T from 'three';
import {decodeModelResponse} from './model-download';

export type OverlayStatus='idle'|'loading'|'ready'|'error';
interface Manifest {version:number;sourceDataset:string;evidence:string;structureType:string;vertexCount:number;indexCount:number;positions:number;normals:number;indices:number;url:string;gzip:string;bytes:number;sha256:string}

// Systemsの分類や部位IDに混ぜず、初めてONになった時だけ別の形状を取得する。
export function createVhpOverlay(scene:T.Scene,onStatus:(status:OverlayStatus)=>void,redraw:()=>void){
 let mesh:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>|undefined,started=false,disposed=false;
 const abort=new AbortController();
 const load=async()=>{started=true;onStatus('loading');try{
  const response=await fetch('/models/fascia/vhp-atlas.json',{signal:abort.signal});if(!response.ok)throw new Error('manifest');const m=await response.json() as Manifest;
  if(m.version!==1||m.evidence!=='image-derived'||m.structureType!=='connective-tissue-volume'||m.sourceDataset!=='VHP-Connective-Tissue-2025'||!Number.isSafeInteger(m.vertexCount)||m.vertexCount<1||m.vertexCount>5000000||!Number.isSafeInteger(m.indexCount)||m.indexCount<3||m.indexCount%3||m.indexCount>15000000||m.positions!==0||m.normals!==m.vertexCount*12||m.indices!==m.vertexCount*24||m.bytes!==m.indices+m.indexCount*4||m.url!=='/models/fascia/vhp-0.bin'||m.gzip!=='/models/fascia/vhp-0.bin.gz')throw new Error('metadata');
  const compressed=typeof DecompressionStream!=='undefined';const buffer=await decodeModelResponse(await fetch(compressed?m.gzip:m.url,{signal:abort.signal}),m.bytes,compressed);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==m.sha256)throw new Error('hash');if(disposed)return;
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,0,m.vertexCount*3),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(buffer,m.normals,m.vertexCount*3),3));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,m.indices,m.indexCount),1));g.computeBoundingSphere();
  mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:'#ae80ba',roughness:.7,metalness:0,side:T.DoubleSide,transparent:true,opacity:.45,depthWrite:false}));mesh.visible=false;scene.add(mesh);onStatus('ready');redraw();
 }catch{if(!disposed){onStatus('error');redraw();}}};
 return {update(enabled:boolean,opacity:number,suspended:boolean){if(enabled&&!started)void load();if(mesh){const visible=enabled&&!suspended;if(mesh.visible!==visible||mesh.material.opacity!==opacity){mesh.visible=visible;mesh.material.opacity=opacity;const transparent=opacity<1;if(mesh.material.transparent!==transparent){mesh.material.transparent=transparent;mesh.material.depthWrite=!transparent;mesh.material.needsUpdate=true;}redraw();}}},dispose(){disposed=true;abort.abort();if(mesh){scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}}};
}
