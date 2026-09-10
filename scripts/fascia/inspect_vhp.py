"""公式NIfTIの値と座標を先に記録し、閾値を後から選べるようにする。"""
import argparse, hashlib, json
from pathlib import Path
import nibabel as nib
import numpy as np
from scipy import ndimage

p=argparse.ArgumentParser(); p.add_argument('input'); p.add_argument('output'); a=p.parse_args()
img=nib.load(a.input); data=np.asanyarray(img.dataobj)
hist=np.bincount(data.ravel().astype(np.int32)); nz=data[data>0]
labels,count=ndimage.label(data>0, structure=ndimage.generate_binary_structure(3,1))
sizes=np.bincount(labels.ravel()); sizes[0]=0
q,qcode=img.get_qform(coded=True); s,scode=img.get_sform(coded=True)
result={'file':Path(a.input).name,'sha256':hashlib.sha256(Path(a.input).read_bytes()).hexdigest(), 'dimensions':list(data.shape),'dtype':str(data.dtype),'voxelSize':img.header.get_zooms()[:3], 'units':img.header.get_xyzt_units(),'affine':img.affine.tolist(),'qform':None if q is None else q.tolist(),'qformCode':int(qcode),'sform':None if s is None else s.tolist(),'sformCode':int(scode),'orientation':nib.aff2axcodes(img.affine),'min':int(data.min()),'max':int(data.max()),'percentiles':dict(zip(map(str,[0,25,50,75,90,95,99,100]),np.percentile(data,[0,25,50,75,90,95,99,100]).tolist())),'nonzeroPercentiles':dict(zip(map(str,[0,25,50,75,90,95,99,100]),np.percentile(nz,[0,25,50,75,90,95,99,100]).tolist())),'nonzeroVoxelCount':int(nz.size),'histogram':[[int(i),int(n)] for i,n in enumerate(hist) if n], 'components6':{'count':int(count),'largestVoxelCounts':sorted(sizes.tolist(),reverse=True)[:20]},'description':str(img.header['descrip'])}
if data.max()<100:
 result['labels']=[{'value':int(v),'voxels':int(hist[v]),'indexBounds':[np.array(np.where(data==v)).min(axis=1).tolist(),np.array(np.where(data==v)).max(axis=1).tolist()]} for v in np.unique(data) if v]
Path(a.output).parent.mkdir(parents=True,exist_ok=True)
Path(a.output).write_text(json.dumps(result,ensure_ascii=False,indent=2,default=lambda x:float(x)),encoding='utf8')
print(json.dumps({k:v for k,v in result.items() if k not in ['histogram','labels']},default=lambda x:float(x)),flush=True)
