"""オフライン画像を配信せず、出典と変換を添えた独立Webアセットを作る。"""
import argparse,gzip,hashlib,json
from pathlib import Path
import numpy as np
import nibabel as nib
import trimesh

p=argparse.ArgumentParser();p.add_argument('work');p.add_argument('output');a=p.parse_args();work=Path(a.work);out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
s=np.load(work/'surface-refined.npz');reg=json.loads((work/'registration.json').read_text());ex=json.loads((work/'extraction-refined.json').read_text());v=nib.affines.apply_affine(np.array(reg['matrix']),s['vertices']).astype('<f4');f=s['faces'].astype('<u4')
mesh=trimesh.Trimesh(vertices=v,faces=f,process=False);norm=np.asarray(mesh.vertex_normals,dtype='<f4')
blob=v.tobytes()+norm.tobytes()+f.tobytes();compressed=gzip.compress(blob,compresslevel=9,mtime=0)
(out/'vhp-0.bin').write_bytes(blob);(out/'vhp-0.bin.gz').write_bytes(compressed)
manifest={'version':1,'sourceDataset':'VHP-Connective-Tissue-2025','evidence':'image-derived','structureType':'connective-tissue-volume','name':'VHP Connective Tissue','sourceDoi':'10.17632/zc53h3dcfg.1','paperDoi':'10.1038/s41597-025-06134-x','license':'CC BY 4.0','authors':['Heiko Stark','Julian Sartori'],'inputSha256':'836db59cc879fd69448382eba240bd52df03c3c1639a306ab952f35b90886e37','vertexCount':len(v),'indexCount':int(f.size),'positions':0,'normals':int(v.nbytes),'indices':int(v.nbytes+norm.nbytes),'bounds':[v.min(0).tolist(),v.max(0).tolist()],'url':'/models/fascia/vhp-0.bin','gzip':'/models/fascia/vhp-0.bin.gz','bytes':len(blob),'gzipBytes':len(compressed),'sha256':hashlib.sha256(blob).hexdigest(),'gzipSha256':hashlib.sha256(compressed).hexdigest(),'registration':reg,'processing':ex,'limitations':['Image-derived connective tissue, not named fascia.','Different donors; coarse body-envelope alignment only.','Some disconnected small components omitted and surface simplified.','No clinical or sheet-continuity validation.']}
(out/'vhp-atlas.json').write_text(json.dumps(manifest,indent=2),encoding='utf8');print(json.dumps({k:manifest[k] for k in ['vertexCount','indexCount','bytes','gzipBytes','bounds']}))

