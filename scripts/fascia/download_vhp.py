"""公式の小解像度データだけを取得し、配布元のSHA-256で照合する。"""
import argparse,hashlib,json,urllib.request
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('output');a=p.parse_args();out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
files=[('male-small.nii.gz','d32c0e56-ace8-44bc-ae42-295eb24db034','836db59cc879fd69448382eba240bd52df03c3c1639a306ab952f35b90886e37'),('male-small.labels.nii.gz','7e3540e3-d330-40a6-9d95-aed994e84154','537d136a95b40d104b1287b4322b68db752688835784ed2b40c2cd36088f2326')]
for name,identifier,expected in files:
 dest=out/name
 if not dest.exists():urllib.request.urlretrieve(f'https://data.mendeley.com/public-files/datasets/zc53h3dcfg/files/{identifier}/file_downloaded',dest)
 actual=hashlib.sha256(dest.read_bytes()).hexdigest()
 if actual!=expected:raise ValueError(f'{name}: SHA-256 mismatch; file was not accepted')
 print(name,actual)
