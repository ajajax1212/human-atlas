export type SystemId = 'skeletal'|'muscular'|'arterial'|'venous'|'nervous'|'digestive'|'respiratory'|'urinary'|'reproductive'|'lymphatic'|'endocrine'|'integumentary'|'connective'|'sensory'|'cardiac'|'fascia'|'fascial-system';
export const SYSTEMS: {id:SystemId;name:string;color:string;description:string}[] = [
 {id:'skeletal',name:'骨格',color:'#e2d9ba',description:'骨は体を支え、臓器を保護し、筋肉の付着部となります。内部ではミネラルの貯蔵や血液細胞の産生も行われます。'},
 {id:'muscular',name:'筋肉',color:'#a85b50',description:'骨格筋は付着部を引くことで運動を生み出します。腱とともに関節を動かし、姿勢を保ち、熱を産生します。'},
 {id:'cardiac',name:'心臓',color:'#b96760',description:'心臓は4つの部屋を持つ筋肉のポンプです。弁によって血液の流れを調節し、肺循環と体循環へ送り出します。'},
 {id:'sensory',name:'感覚器',color:'#b0c8ce',description:'視覚・聴覚・平衡感覚などに関わる構造です。刺激を受け取り、神経系とともに情報を伝えます。'},
 {id:'arterial',name:'動脈',color:'#c05245',description:'動脈は心臓から血液を送り出す血管です。全身の組織へ、また肺循環では肺へ血液を運びます。'},
 {id:'venous',name:'静脈',color:'#527c9f',description:'静脈は心臓へ血液を戻す血管です。浅部・深部の血管網が組織から血液を集め、肺静脈は肺から酸素を含む血液を戻します。'},
 {id:'nervous',name:'神経系',color:'#d8b565',description:'脳・脊髄・末梢神経は信号を伝達・処理し、感覚、運動、協調動作、体の自律的な調節を支えます。'},
 {id:'respiratory',name:'呼吸器系',color:'#b98991',description:'気道は空気を肺へ導き、肺では空気と血液の間で酸素と二酸化炭素を交換します。呼吸筋による圧力変化が換気を支えます。'},
 {id:'digestive',name:'消化器系',color:'#b8916b',description:'消化管は食物を分解し、栄養と水を吸収して残りを送り出します。関連する臓器は胆汁や消化酵素を供給します。'},
 {id:'urinary',name:'泌尿器系',color:'#b47961',description:'腎臓は血液をろ過し、水分・電解質・酸塩基のバランスを調節します。尿は尿管を通って膀胱にたまり、尿道から排出されます。'},
 {id:'lymphatic',name:'リンパ系',color:'#879f7c',description:'リンパ管は余分な組織液を循環へ戻します。リンパ節などのリンパ器官は免疫応答に関わります。'},
 {id:'endocrine',name:'内分泌系',color:'#c5a09a',description:'内分泌器官はホルモンを血液中に分泌し、代謝、成長、ストレス応答、生殖などを調節します。'},
 {id:'reproductive',name:'生殖器系',color:'#bda098',description:'このアトラスの男性生殖器は、精子の産生・成熟・輸送と性ホルモンの産生に関わります。'},
 {id:'integumentary',name:'体表',color:'#ba9b7d',description:'体表は位置関係を把握するための外側の目印です。外皮系は保護、感覚、体温調節に関わります。'},
 {id:'fascia',name:'筋膜',color:'#7cb8af',description:'収録なし。現在使用しているBodyParts3Dデータでは、独立した名称付き筋膜モデルを確認できていません。'},
 {id:'fascial-system',name:'筋膜系',color:'#7caaa6',description:'現在表示できるのは左右の腸脛靱帯と左右の手首屈筋支帯の4構造のみです。全身の筋膜を再現したものではありません。'},
 {id:'connective',name:'結合組織',color:'#aec3bb',description:'軟骨・靱帯などの結合組織は構造を支え、つなぎ、隔てます。関節の安定や力の分散に関わります。'},
];
export interface Part {id:string;name:string;conceptId:string;system:SystemId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;sex?:'male';source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
export type View = 'three-quarter'|'front'|'back'|'side';
export interface SceneState {vhpEnabled?:boolean;vhpOpacity?:number;fasciaOpacity:number;fascialSystemOpacity:number;inspectorOpen?:boolean;explode:number;visible:SystemId[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number}
export const DEFAULT_VISIBLE:SystemId[] = ['cardiac','sensory','skeletal','muscular','arterial','venous','nervous','respiratory','digestive','urinary','lymphatic','endocrine','reproductive','connective','fascial-system'];
export const EXPLANATIONS:Record<string,string> = {
 'heart':'胸部にある筋肉のポンプです。右側は肺へ、左側は全身へ血液を送り出します。',
 'liver':'横隔膜の右下にある大きな臓器です。吸収された栄養を処理し、胆汁や血液中の多くのタンパク質を作ります。',
 'brain':'神経系の中枢です。各領域が連携して知覚、運動、記憶、言語、身体機能の調節を支えます。',
 'stomach':'食道と小腸の間にある筋肉性の袋です。食物をたくわえ、胃酸や酵素と混ぜて十二指腸へ送り出します。',
 'spleen':'左上腹部のリンパ器官です。血液をろ過し、古くなった血球の除去や免疫応答に関わります。',
 'pancreas':'消化と内分泌の働きを持つ腹部の臓器です。消化酵素を小腸へ送り、インスリンやグルカゴンなどを分泌します。',
 'urinary bladder':'骨盤内にある筋肉性の袋です。腎臓から尿管を通って届いた尿をたくわえます。',
 'trachea':'喉頭と気管支をつなぐ気道です。軟骨が呼吸時に気道を開いた状態に保ちます。',
 'diaphragm':'胸部と腹部を隔てる広い筋肉です。収縮すると胸郭内の容積が増え、肺への吸気を助けます。',
};
export function explanation(name:string,system:SystemId){return EXPLANATIONS[name.toLowerCase()] ?? SYSTEMS.find(s=>s.id===system)?.description ?? '';}
