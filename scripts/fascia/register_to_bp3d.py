"""異なる献体の体表による粗い位置合わせ。精密な筋膜対応とは扱わない。"""
import argparse,json
from pathlib import Path
import nibabel as nib
import numpy as np
from scipy.spatial import cKDTree
from skimage.measure import marching_cubes

p=argparse.ArgumentParser();p.add_argument('labels');p.add_argument('repo');p.add_argument('output');a=p.parse_args()
repo=Path(a.repo);atlas=json.loads((repo/'public/models/atlas.json').read_text())
skin=next(p for p in atlas['parts'] if p['id']=='FJ2810' and p['name']=='Skin')
blob=(repo/'public'/atlas['chunks'][skin['chunk']]['url'].lstrip('/')).read_bytes()
target=np.frombuffer(blob,dtype='<f4',count=skin['vertexCount']*3,offset=skin['positions']).reshape(-1,3).astype(float)
img=nib.load(a.labels);d=np.asanyarray(img.dataobj)
# 16は検査で孤立した1ボクセルと判明したため、体表の基準に含めない。
v,f,_,_=marching_cubes(np.pad((d>0)&(d<16),1),.5)
v=nib.affines.apply_affine(img.affine,v-1)
# NIfTI RASをAtlasの左+X・上+Y・前+Zへ。回転の行列式は+1。
axis=np.array([[-1,0,0],[0,0,1],[0,1,0]],float)
src=v@axis.T
scale=np.ptp(target,axis=0)[1]/np.ptp(src,axis=0)[1]
trans=(target.min(0)+target.max(0))/2-scale*(src.min(0)+src.max(0))/2
matrix=np.eye(4);matrix[:3,:3]=scale*axis;matrix[:3,3]=trans
initial=matrix.copy();src=nib.affines.apply_affine(matrix,v)
# 交互サンプルを評価専用に分け、体表への過適合を一部確認する。
train=src[::4];test=src[2::4];reference=target[::2];held=target[1::2]
tree=cKDTree(reference)
def distances(points):
 d1=cKDTree(held).query(points,workers=-1)[0];d2=cKDTree(points).query(held,workers=-1)[0];ds=np.r_[d1,d2]*1000
 return {'symmetricMeanMm':float(ds.mean()),'symmetricP95Mm':float(np.percentile(ds,95)),'sampledHausdorffMm':float(ds.max())}
before=distances(test);iterations=0
for i in range(30):
 dist,idx=tree.query(train);accept=dist<=np.quantile(dist,.8);x=train[accept];y=reference[idx[accept]]
 xc=x.mean(0);yc=y.mean(0);u,_,vt=np.linalg.svd((x-xc).T@(y-yc));r=vt.T@u.T
 if np.linalg.det(r)<0:vt[-1]*=-1;r=vt.T@u.T
 t=yc-r@xc;step=np.eye(4);step[:3,:3]=r;step[:3,3]=t
 matrix=step@matrix;train=train@r.T+t;test=test@r.T+t;iterations=i+1
 if np.linalg.norm(t)<1e-6 and np.linalg.norm(r-np.eye(3))<1e-5:break
final=nib.affines.apply_affine(matrix,v)
report={'source':'VHP male, 2025 connective tissue dataset','target':'BodyParts3D 4.0 / FJ2810 Skin','method':'RAS-to-atlas proper rotation; global height scale; body-envelope centering; trimmed rigid point-to-point ICP','version':1,'matrixInput':'NIfTI affine world coordinates in mm','matrixOutput':'existing Human Atlas coordinates in meters','matrix':matrix.tolist(),'initialMatrix':initial.tolist(),'globalScaleMetersPerMm':float(scale),'reference':{'source':'union of official body-region labels 1 through 15; label 16 singleton excluded','targetPartId':'FJ2810','sourceSurfaceVertices':len(v),'targetSurfaceVertices':len(target)},'parameters':{'iterations':iterations,'maximumIterations':30,'retainedCorrespondenceQuantile':.8,'sourceTrainStride':4,'sourceHeldOutOffset':2,'targetTrainStride':2,'targetHeldOutOffset':1},'manualAdjustment':False,'landmarks':[],'metrics':{'initialHeldOutSurfaceSampleDistance':before,'finalHeldOutSurfaceSampleDistance':distances(test),'bodyExtentErrorMm':((np.ptp(final,axis=0)-np.ptp(target,axis=0))*1000).tolist(),'distanceCaveat':'nearest sampled vertices, not exact triangle surface distances','landmarkError':None,'landmarkErrorReason':'No independently annotated homologous landmarks are provided in both datasets. Body envelope is used only for coarse anatomical placement.','dice':None,'regionOverlap':None,'overlapReason':'Target Atlas lacks a matching labeled donor volume; connective signal is not homologous to the whole skin envelope.'},'nonRigidRegistration':{'applied':False,'reason':'Body-region volumes alone do not establish pointwise tissue correspondences; a warp would imply unsupported precision.'},'quality':'coarse educational alignment; different donor proportions and limb posture remain; not anatomically validated'}
out=Path(a.output);out.mkdir(parents=True,exist_ok=True);(out/'registration.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report),flush=True)
