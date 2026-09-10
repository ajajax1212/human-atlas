"""1 mm画像の非ゼロ支持域を抽出し、簡略化による欠落を数値で残す。"""
import argparse,json,time
from pathlib import Path
import nibabel as nib
import numpy as np
from scipy import ndimage
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from skimage.measure import marching_cubes, mesh_surface_area
import fast_simplification

def topology(v,f):
 edges=np.concatenate([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]])
 graph=coo_matrix((np.ones(len(edges),dtype=np.uint8),(edges[:,0],edges[:,1])),shape=(len(v),len(v))).tocsr()
 n,l=connected_components(graph,directed=False)
 sizes=np.bincount(l)
 return {'components':int(n),'largestVertexCounts':sorted(sizes.tolist(),reverse=True)[:20],'componentsAtLeast100Vertices':int((sizes>=100).sum())}

def stats(v,f):
 return {'vertices':len(v),'triangles':len(f),'areaMm2':float(mesh_surface_area(v,f)),'boundsMm':[v.min(0).tolist(),v.max(0).tolist()],**topology(v,f)}

def main():
 p=argparse.ArgumentParser();p.add_argument('input');p.add_argument('output');p.add_argument('--faces',type=int,default=1000000);a=p.parse_args()
 out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
 img=nib.load(a.input);d=np.asanyarray(img.dataobj);mask=d>0;original_nonzero=int(mask.sum());del d
 # 低い非ゼロ値もsummative binningの信号なので、任意の強度閾値で薄い組織を消さない。
 # 8ボクセル未満だけを除く。組織でないと断定せず、試作の欠落量として公開する。
 lab,n=ndimage.label(mask);sizes=np.bincount(lab.ravel());keep=sizes>=8;keep[0]=False
 retained=keep[lab];removed=int(mask.sum()-retained.sum());del mask,lab
 print('marching cubes',flush=True)
 v,f,_,_=marching_cubes(np.pad(retained,1),level=.5,spacing=img.header.get_zooms()[:3],allow_degenerate=False)
 v-=1;del retained
 print('raw',len(v),len(f),flush=True)
 before=stats(v,f);sample=v[np.linspace(0,len(v)-1,min(100000,len(v)),dtype=int)].copy()
 print('simplify',flush=True)
 sv,sf=fast_simplification.simplify(v.astype(np.float64),f,target_count=min(a.faces,len(f)),agg=4)
 after=stats(sv,sf)
 # 点群距離は三角形表面の厳密Hausdorffではないので、名称を分けて記録する。
 d1=cKDTree(sv).query(sample,workers=-1)[0];d2=cKDTree(v).query(sv[np.linspace(0,len(sv)-1,min(100000,len(sv)),dtype=int)],workers=-1)[0]
 metrics={'before':before,'after':after,'relativeAreaChange':after['areaMm2']/before['areaMm2']-1,'sampledVertexHausdorffMm':float(max(d1.max(),d2.max())),'sampledVertexDistanceP95Mm':float(np.percentile(np.r_[d1,d2],95)),'distanceMethod':'deterministic up to 100000 vertex samples each direction; nearest vertex, not exact surface Hausdorff','majorSheetContinuity':'component counts reported; regional thin-sheet continuity is not anatomically validated'}
 report={'input':Path(a.input).name,'threshold':'> 0','reason':'retain every nonzero summative-binning signal before component filtering; not a histological cutoff','componentConnectivity':6,'minimumVoxels':8,'removedVoxelCount':removed,'removedFractionOfNonzero':removed/original_nonzero,'morphologicalClosing':False,'smoothing':False,'surfaceAlgorithm':'Lewiner marching cubes','level':.5,'stepSize':1,'paddingVoxels':1,'simplification':{'method':'quadric error','aggressiveness':4,'targetFaces':a.faces},'metrics':metrics}
 np.savez_compressed(out/'surface.npz',vertices=sv.astype(np.float32),faces=sf.astype(np.uint32))
 (out/'extraction.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report),flush=True)

if __name__ == '__main__':
 main()
