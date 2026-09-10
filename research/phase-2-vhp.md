# Phase 2: VHP Connective Tissue 概観用試作

## 結果と適用範囲

Stark・Sartori（2025）の男性VHP結合組織画像を、研究用の独立レイヤーとして取り込んだ。名称付き筋膜のモデルではない。筋膜0、筋膜系4、既存BP3Dの2,234メッシュと3,432概念を維持する。VHPにはFMA/BP3Dの架空IDを割り当てない。

この試作の採用範囲は全身の分布の概観のみ。薄い膜の形や連続性を確認できるモデルとしては不合格であり、その制約を常時の説明と詳細欄に表示する。位置合わせも内部組織の精度保証ではない。

## 出典と取得

- 論文: Stark H, Sartori J. Human connective tissue - 3D datasets to characterise the material properties. Scientific Data 12, 1771 (2025). https://doi.org/10.1038/s41597-025-06134-x
- 男性データ: https://doi.org/10.17632/zc53h3dcfg.1 （CC BY 4.0、Heiko Stark / Julian Sartori）。女性データは今回取得しない。
- `male-small.nii.gz`: 92,322,640 bytes、SHA-256 `836db59cc879fd69448382eba240bd52df03c3c1639a306ab952f35b90886e37`。
- `male-small.labels.nii.gz`: 61,339 bytes、SHA-256 `537d136a95b40d104b1287b4322b68db752688835784ed2b40c2cd36088f2326`。
- 公式公開APIの配布ハッシュと一致を確認。NIfTIはオフライン処理にのみ使い、Git/Webへ入れない。

## 画像検査と処理

`vhp-inspection.json`と`vhp-label-inspection.json`にdimensions、dtype、affine、qform/sform、単位、orientation、全値のヒストグラム、percentiles、非ゼロ数、6近傍の連結成分を保存。

画像は540×308×1867、uint16、1 mm isotropic、RAS、affineは単位行列。値0〜18288、非ゼロ48,216,527ボクセル。非ゼロ中央値10328。ラベルは108×62×373、5 mm、1〜16。16は孤立した1ボクセルなので位置合わせの参照から除外した。他の番号に未確認の解剖学名は付けていない。

検査後に、summative binning由来の弱い信号も残すため`>0`を抽出閾値に選択した。これは医学的閾値ではない。6近傍で8ボクセル未満の成分を除去し、249,208ボクセル（非ゼロ領域の0.517%）が失われた。これらをすべてノイズだとは断定しない。closing・平滑化・穴埋めはしない。1ボクセルのゼロpadding、Lewiner marching cubes、level=0.5、step=1。

元の表面は34,719,485頂点／70,911,866三角形。最初のQEM設定aggressiveness=4は目標100万面に到達せず、43,184,586面になった。次のaggressiveness=7で2,000,000面、784,658頂点とした。既存Atlasの簡略化設定は流用していない。

| 指標 | 抽出直後 | Web概観用 |
|---|---:|---:|
| 表面積 mm² | 25,695,644 | 18,329,502.8 |
| 表面の連結成分 | 133,441 | 4,101 |
| 三角形 | 70,911,866 | 2,000,000 |

表面積は28.67%減少。境界箱は`vhp-extraction.json`へ記録。頂点100,000点の決定的サンプルによる双方向最近傍距離を測定した。第1段階の最大11.48 mm、第2段階の最大16.50 mm・95%点2.99 mm。これは三角形表面の厳密Hausdorff距離ではなく、第2段階は第1段階との比較である。元表面と最終表面の厳密Hausdorffや、名前付きの膜ごとの連続性は未検証。成分数の大幅減少を隠さず、詳細な膜の観察用途には採用しない。

## 位置合わせ

VHPラベル1〜15の合併境界を体表参照として、BP3D `FJ2810 Skin`へ合わせる。RASからAtlasの左+X・上+Y・前+Zへ正回転、全身高さによる一様スケール、境界箱中心の平行移動、80% trimmed rigid ICP（最大30反復）を実施。入力mm→出力既存Atlasのm。変換行列と初期行列、全条件を`vhp-registration.json`へ保存した。手調整なし。

評価専用の交互サンプルを分離した体表最近傍距離は、平均26.93→24.57 mm、95%点70.25→71.41 mm、最大167.02→163.49 mm。平均は改善したが95%点は改善していない。幅差-167.38 mm、高さ差+1.77 mm、前後差-3.19 mm。姿勢・体格差を解消できていない。

共通の独立注釈ランドマークがないためlandmark errorは算出しない。対応するBP3Dの部位ラベル体積がなく、結合組織信号と皮膚全体は同じ対象でもないためDice/region overlapを成功指標にしない。内部組織の点対応を保証する情報が足りず、非剛体変形は追加しない。この選択は精密なregistration成功を意味しない。

## Web・UI

独立アセット`public/models/fascia/vhp-atlas.json`、`vhp-0.bin`、`vhp-0.bin.gz`。43 MB／gzip28.4 MB。出典、画像由来の根拠、入力ハッシュ、処理条件、変換、限界を添付。ブラウザーでもバイト数とSHA-256を照合する。

初期OFF。初めてONにした時だけメタデータとgzipをfetchする。Systemsとは別の「研究用の追加レイヤー」、紫色、初期不透明度45%。単独表示・骨格筋肉との比較・不透明度10〜100%。個別選択と分解中は研究レイヤーを一時非表示にし、注意を表示する。元の筋膜系だけ表示ボタンとリセットは研究レイヤーをOFFにする。

## 再現方法

Python 3.12。依存の正確な版は`scripts/fascia/requirements.txt`。大きな元表面を処理するので十分なRAMとディスクが必要（実行環境RAM32 GB）。以下はリポジトリのルートから実行する。実行時の研究用データは追跡外。

```powershell
python -m venv .venv-vhp
.venv-vhp/Scripts/python.exe -m pip install -r scripts/fascia/requirements.txt
.venv-vhp/Scripts/python.exe scripts/fascia/download_vhp.py research/vhp-work
.venv-vhp/Scripts/python.exe scripts/fascia/inspect_vhp.py research/vhp-work/male-small.nii.gz research/vhp-inspection.json
.venv-vhp/Scripts/python.exe scripts/fascia/inspect_vhp.py research/vhp-work/male-small.labels.nii.gz research/vhp-label-inspection.json
.venv-vhp/Scripts/python.exe scripts/fascia/extract_surface.py research/vhp-work/male-small.nii.gz research/vhp-work/vhp-output
.venv-vhp/Scripts/python.exe scripts/fascia/refine_surface.py research/vhp-work/vhp-output
.venv-vhp/Scripts/python.exe scripts/fascia/register_to_bp3d.py research/vhp-work/male-small.labels.nii.gz . research/vhp-work/vhp-output
.venv-vhp/Scripts/python.exe scripts/fascia/export_web_mesh.py research/vhp-work/vhp-output public/models/fascia
npm.cmd run validate
npm.cmd run build
```

`validate-vhp.mjs`でgeometry・gzip・両ハッシュ・有限値・index・bounds・出典・処理整合を検証する。既存Atlas検証も継続する。ブラウザー結果・公開コミットは納品レポートへ記載。

方向確認: 元画像の中央矢状断（x=270）で顔面がY増加側にあることを確認した。NIfTIの前後軸を反転していない。不透明度100%では深度書き込みを有効にし、背面の透過重なりを防止する。
