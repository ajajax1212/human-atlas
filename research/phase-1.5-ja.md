# Phase 1.5 日本語化と筋膜系表示

公式のIS-A/PARTOF名称表をFMA concept IDで照合する。BP representation IDは階層ごとに異なるため結合キーにしない。両方の行と原表、SHA-256を保持。IS-Aを優先し、日本語欄に日本語がない場合はPARTOFで補完する。いずれも日本語がなければ元のAtlas英語名を保持する。独自の解剖学名は生成しない。表示には公式の最初の同義語、検索には全同義語・かな・英語・IDを使う。

- 概念: 3432中885件が日本語、2547件が英語fallback。
- メッシュ部位: 2234中426件が日本語、1808件が英語fallback。
- 左右別の腸脛靱帯と手首屈筋支帯は公式日本語未登録。構造名を英語のまま残す。一般説明の日本語と公式構造名を区別する。
- 筋膜0、筋膜系4を保持。常設の単独表示、4構造の選択、比較、透明度10〜100%（初期65%）。
- geometry、manifest、ID、system割当は8ce12d6から不変。Phase 2未着手。
- 再生成: npm.cmd run names:build。検証: npm.cmd run validate、npm.cmd run build。
- 原データの名称表はBodyParts3Dと同じCC BY 4.0。原著作権表示はpublic/ATTRIBUTION.mdを参照。
