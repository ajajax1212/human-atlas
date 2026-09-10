"""最初の保守的な設定では目標数に達しなかったため、別設定を比較する。"""
import argparse,json
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree
import fast_simplification
# 実行副作用のない統計関数だけを別ファイルから読み込む。
from extract_surface import stats
p=argparse.ArgumentParser();p.add_argument('work');a=p.parse_args();work=Path(a.work);s=np.load(work/'surface.npz');v=s['vertices'];f=s['faces'];report=json.loads((work/'extraction.json').read_text())
print('refine',len(v),len(f),flush=True)
sv,sf=fast_simplification.simplify(v.astype(float),f,target_count=2000000,agg=7)
print('stats',len(sv),len(sf),flush=True)
after=stats(sv,sf);sample=v[np.linspace(0,len(v)-1,100000,dtype=int)]
d1=cKDTree(sv).query(sample,workers=-1)[0];d2=cKDTree(v).query(sv[np.linspace(0,len(sv)-1,min(100000,len(sv)),dtype=int)],workers=-1)[0]
report['firstPass']=report['simplification'];report['firstPassMetrics']=report['metrics'];report['simplification']={'method':'quadric error, second pass after aggressiveness 4','aggressiveness':7,'targetFaces':2000000}
report['metrics']={'before':report['firstPassMetrics']['before'],'after':after,'relativeAreaChange':after['areaMm2']/report['firstPassMetrics']['before']['areaMm2']-1,'sampledVertexHausdorffMmSecondPass':float(max(d1.max(),d2.max())),'sampledVertexDistanceP95MmSecondPass':float(np.percentile(np.r_[d1,d2],95)),'distanceMethod':'100000 deterministic vertex samples against first-pass mesh; not exact triangle Hausdorff nor direct original comparison','majorSheetContinuity':'Components measured. Thin sheets and individual anatomical continuity remain unvalidated.'}
np.savez_compressed(work/'surface-refined.npz',vertices=sv.astype(np.float32),faces=sf.astype(np.uint32));(work/'extraction-refined.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report['metrics']),flush=True)
