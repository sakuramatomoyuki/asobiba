/** Server-owned branching narrative. Messages describe conditional futures, never fabricated facts. */
export type FutureScene = 'laboratory' | 'last-train' | 'broadcast';
export interface FutureScenario {
  id: FutureScene; title: string; synopsis: string; atmosphere: string;
  locations: readonly string[]; threat: string; escape: string;
}
export const FUTURE_SCENARIOS: readonly FutureScenario[] = [
  { id:'laboratory', title:'零時の隔離棟',
    synopsis:'封鎖された研究施設で、あなたの端末が鳴る。差出人は自分。送信時刻は、施設崩壊の三分後だった。',
    atmosphere:'冷たい非常灯、結露したガラス、換気口から聞こえる呼吸',
    locations:['隔離室','中央制御室','標本保管庫','排気塔','非常ゲート'],
    threat:'隔離崩壊',escape:'施設外への脱出' },
  { id:'last-train', title:'終電はまだ着かない',
    synopsis:'終電の窓に、誰もいないホームが何度も流れる。未来の自分から「次の駅で、私の声についてくるな」と届いた。',
    atmosphere:'蛍光灯のちらつき、雨の窓、途切れる車内放送',
    locations:['最後尾車両','連結通路','無人駅','運転室','朝のホーム'],
    threat:'消失',escape:'実在する駅への停車' },
  { id:'broadcast', title:'午前二時の留守番電話',
    synopsis:'停電した海辺の宿で、使われていない電話が鳴る。受話器の向こうの自分は、まだあなたが口にしていない言葉を繰り返した。',
    atmosphere:'波音、古い電話、灯台の光が横切る暗い廊下',
    locations:['客室','電話交換室','食堂','灯台への渡り廊下','船着き場'],
    threat:'満潮',escape:'夜明けの救難船への乗船' },
];

export interface FutureState {
  scenarioId: FutureScene; round: number; danger: number;
  inventory: string[]; history: {round:number; action:string; outcome:string}[];
  questionsRemaining: number; status:'playing'|'escaped'|'lost';
}
export function createFutureState(scenarioId: string): FutureState {
  if (!FUTURE_SCENARIOS.some(s=>s.id===scenarioId)) throw new Error('シナリオを選択してください。');
  return {scenarioId:scenarioId as FutureScene,round:1,danger:2,inventory:[],history:[],questionsRemaining:2,status:'playing'};
}

/** Consensus tie resolution is stable and requires a designated decision maker. */
export function futureVoteLeaders(votes: Record<string,string>, options: readonly string[]): string[] {
  const counts=new Map(options.map(id=>[id,0]));
  for (const value of Object.values(votes)) if(counts.has(value))counts.set(value,counts.get(value)!+1);
  const highest=Math.max(0,...counts.values());
  return highest===0?[]:options.filter(id=>counts.get(id)===highest);
}

export type FutureAction = {id:string;label:string;detail:string;danger:number;item?:string;requires?:string;failure:string;success:string};
export type FutureChapter = {scene:string;event:string;investigation:string;actions:FutureAction[]};
const action=(id:string,label:string,detail:string,danger:number,success:string,failure=success,item?:string,requires?:string):FutureAction=>({id,label,detail,danger,success,failure,...(item?{item}:{}),...(requires?{requires}:{})});
export const FUTURE_CHAPTERS: Record<FutureScene,FutureChapter[]> = {
 laboratory:[
  {scene:'ガラスの向こうで、あなたと同じ服の人影が立っている。こちらが手を上げても、人影は動かない。',event:'隔離室の扉は施錠されています。非常用の配線が露出しています。',investigation:'扉の機械式ラッチは停電しても使えます。通電すると隔離警報が作動します。',actions:[action('latch','機械式ラッチを外す','時間をかけて静かに開ける',0,'扉が開いた。人影のいた場所には、内側からついた手形だけが残った。','', '工具'),action('power','扉へ通電する','露出した配線を接続する',2,'警報が鳴る。扉は開いたが、施設の封鎖手順が動き始めた。'),action('glass','観察窓を割る','隣の区画へ抜ける',1,'ガラスの音に、遠い廊下から同じ音が返った。破片の中から工具を回収した。','', '工具')]},
  {scene:'制御盤のモニターに「在室者：0」と表示されている。背後で一度だけ椅子が回る。',event:'排気装置は停止中。保管庫には可燃性ガスの警告があります。',investigation:'主電源の起動は火花を発生させます。排気弁は工具で手動操作できます。',actions:[action('vent','手動の排気弁を開ける','工具を使ってガスを抜く',-1,'空気が流れ始めた。換気口の呼吸は、あなたたちと同じ速さになった。','工具がなく弁を回しきれない。ガスは残った。','排気済','工具'),action('main','主電源を復旧する','照明と保管庫を再起動する',2,'火花のあとに鈍い爆発。モニターの在室者が一人増えた。'),action('backup','非常電源へ切り替える','扉だけを動かす',0,'廊下に細い明かりがともる。排気装置は止まったままだ。','', '予備電源')]},
  {scene:'標本のラベルはすべてあなたたちの名前だ。採取日は明日になっている。',event:'脱出用の認証キーは保管庫の奥。扉の隙間から甘いにおいがします。',investigation:'ガスを抜いた保管庫なら安全です。外壁の避難図は別の脱出経路を示しています。',actions:[action('key','保管庫で認証キーを取る','排気を済ませていれば安全',0,'キーを回収した。最後の棚だけ、空なのに内側から音がする。','ガスを吸い込み警報が上がる。それでもキーは持ち帰った。','認証キー','排気済'),action('map','外壁の避難図を読む','地下への代替ルートを探す',0,'地下通路の入口と、機械式ゲートの手順が分かった。','', '地下経路'),action('call','館内放送で助けを呼ぶ','誰かが応答するか確かめる',1,'あなたの声で「そこを動くな」と返ってきた。回答を待たず受話器を置いた。')]},
  {scene:'排気塔の階段を上る足音が、一人分多い。数えるのをやめると、止まる。',event:'外部へ救難信号を送れます。ゲートへはここから戻る必要があります。',investigation:'救難アンテナには予備電源が必要です。地下ゲートは工具で解錠できます。',actions:[action('signal','救難アンテナを起動する','予備電源があれば救助を呼べる',0,'返答は短い。「信号を確認。外で待つ」。初めて、自分以外の声だった。','電源が足りず、同じ一秒の雑音だけが繰り返される。','救助','予備電源'),action('service','地下ゲートを整備する','工具で避難経路を開く',0,'重いゲートが開いた。外から冷たい空気が入る。','工具がなく整備に失敗。ゲートは動かない。','地下開放','工具'),action('wait','塔の明かりを消して待つ','危険の拡大を抑える',-1,'足音が止んだ。暗闇の中で、全員が互いの名前を確かめた。')]},
  {scene:'ゲートの向こうで朝が始まっている。背後のスピーカーが、全員の名前を一人ずつ呼ぶ。',event:'最後の選択です。振り返らず、脱出手段を決めてください。',investigation:'正面は認証キー、地下は開放済ゲート、屋外救助は受信済の救難信号が必要です。',actions:[action('front','正面ゲートから脱出','認証キーが必要',0,'キーをかざす。全員が出た瞬間、館内の人数表示がゼロになった。','扉は開かない。背後であなたの名前が呼ばれ続けた。',undefined,'認証キー'),action('under','地下通路から脱出','地下ゲートの開放が必要',0,'地上へ出ると、施設の窓すべてに人影が立っていた。あなたたちは数えなかった。','地下ゲートは閉まったまま。水が足元へ流れ込む。',undefined,'地下開放'),action('rescue','屋外の救助へ向かう','救難信号への応答が必要',0,'ライトが霧を裂く。救助員の「全員ですね」に、全員でうなずいた。','救助は来ない。霧の中から自分たちの声だけが近づいてきた。',undefined,'救助')]},
 ],
 'last-train':[
  {scene:'乗客はあなたたちだけ。窓には、一人多く映っている。',event:'同じ駅名が三度流れました。車内の案内板と紙の路線図が食い違っています。',investigation:'液晶の行き先は毎周変わりますが、古い路線図には終点と信号所が残っています。',actions:[action('map','紙の路線図を持ち出す','実在する線路を確認する',0,'地図の端に「朝凪」の文字。液晶には存在しない駅だった。','', '路線図'),action('screen','案内板の指示に従う','前の車両へ移る',1,'次の車両も同じ。座席に置き忘れた鞄だけが、先に着いていた。'),action('brake','非常停止を試す','列車を止める',2,'ブレーキの音がしたのに、窓の景色だけが速くなった。')]},
  {scene:'連結扉のガラスの奥で、あなたがこちらへ背を向けて立っている。',event:'車掌室の鍵と、前方へつながる機械式通路があります。',investigation:'床下の番号は路線図の信号所と一致します。車掌の制服には誰も入っていません。',actions:[action('key','床下の番号を照合する','路線図で正しい車掌室を探す',0,'正しい扉だけが開いた。制御キーを回収した。','別の扉を開くと、通路が元の場所へ戻った。','制御キー','路線図'),action('uniform','制服についていく','車掌らしい影を追う',2,'影は扉を通り抜けた。あなたの切符に、知らない名前が印字されていた。'),action('manual','機械式通路を開く','安全な連結経路を確保する',0,'ロックを外した。通路の先から海のにおいがする。','', '保守通路')]},
  {scene:'無人駅の時計は、あなたの端末の一分先を指している。針がこちらを待っている。',event:'停車時間は短い。信号器か、駅舎の時刻表を調べられます。',investigation:'朝凪へ分岐する信号は手動です。時刻表の最後の便だけ日付が今日になっています。',actions:[action('signal','分岐信号を切り替える','路線図を使って朝凪方面へ',0,'信号が青に変わる。今度は駅名が繰り返されなかった。','正しい分岐が分からず、信号は赤のまま。','正しい分岐','路線図'),action('table','最終便の時刻表を取る','次の実在駅を確認する',0,'時刻表に帰り道が残っていた。紙は雨に濡れていた。','', '時刻表'),action('voice','ホームの呼び声を追う','名前を呼ぶ人を探す',2,'階段の下に、まだ届いていないあなたの通信が落ちていた。誰もいなかった。')]},
  {scene:'運転席は空。操作盤に置かれた手袋だけが、温かい。',event:'運転制御か、保守通路を使った避難準備を行えます。',investigation:'制御キーで停車操作を予約できます。保守通路の出口は時刻表で特定できます。',actions:[action('control','停車を予約する','制御キーが必要',0,'操作盤に「停車予約済」。運転席の影が一度だけうなずいた。','キーがなく操作できない。窓の向こうで駅が消えた。','停車予約','制御キー'),action('exit','保守通路の出口を確認する','時刻表が必要',0,'夜明けに開く通用口を見つけた。','時刻が分からず、出口を特定できなかった。','避難出口','時刻表'),action('lights','客室の電灯を切る','異常の拡大を抑える',-1,'窓の余分な一人が見えなくなった。誰も振り返らなかった。')]},
  {scene:'車窓の空が白む。最後の放送が「降りる方は、ご自分の声をお確かめください」と告げる。',event:'列車が最後の分岐に入りました。脱出方法を決めてください。',investigation:'停車予約、避難出口、または正しい分岐への切替が、それぞれ別の帰路を開きます。',actions:[action('station','予約した駅で降りる','停車予約が必要',0,'ホームに足を下ろす。窓の中の自分は、電車が去るまでこちらを見ていた。','列車は止まらない。扉のボタンだけが冷たく光る。',undefined,'停車予約'),action('passage','保守通路の出口へ向かう','避難出口の確認が必要',0,'階段を上ると、始発を待つ人々の声が聞こえた。','出口は見つからない。階段の先に同じ車両があった。',undefined,'避難出口'),action('branch','朝凪のホームへ降りる','正しい分岐が必要',0,'海の見える駅に着いた。スマホの日付が、やっと今日になった。','そこは朝凪ではない。駅名標にはあなたの名前があった。',undefined,'正しい分岐')]},
 ],
 broadcast:[
  {scene:'受話器を置いても、部屋のどこかで通話が続いている。',event:'宿の電気が消え、窓の下まで波が来ています。',investigation:'非常灯の電池は電話交換室でも使えます。海へ続く階段は既に水没しています。',actions:[action('battery','非常灯の電池を回収する','必要な電源を確保する',0,'電池は温かい。非常灯の下に、自分の筆跡で「持っていけ」とあった。','', '電池'),action('stairs','海側の階段を降りる','船着き場を探す',2,'波の中から電話が鳴った。階段を引き返すと、濡れた足跡が先を歩いていた。'),action('rope','廊下の救命ロープを取る','別の移動手段を準備する',0,'長いロープを回収した。結び目は、まだ濡れていない。','', 'ロープ')]},
  {scene:'交換台のすべてのランプが点灯している。どの回線にも、あなたの部屋番号が表示されている。',event:'救難回線と宿の放送回線を選べます。',investigation:'救難回線は電池で動かせます。放送回線は海側の古いスピーカーにしかつながっていません。',actions:[action('rescue','救難回線を起動する','電池を接続して外部へ連絡',0,'「明け方、灯台の信号を見て迎えに行く」。返事が来た。','交換台は沈黙したまま。電源が必要だった。','救難予約','電池'),action('broadcast','館内放送を使う','全員の集合を呼びかける',1,'放送のあと、上の階から全員の声で返事が来た。誰も上にはいない。'),action('chart','配線図を回収する','灯台への通路を探す',0,'海を渡らず灯台へ出られる保守経路が見つかった。','', '保守経路')]},
  {scene:'食卓には人数分の皿。どれも食べ終わったあとで、椅子だけがゆっくり戻っている。',event:'灯台の信号コードが書かれた手帳と、船の鍵があります。',investigation:'手帳には救難の点滅パターンが書かれています。小舟はロープで固定しなければ流されます。',actions:[action('code','信号の手帳を持ち出す','灯台で使える符号を覚える',0,'最後の頁には「同じ声には返事をしない」。その下に今日の日付。','', '信号符号'),action('boat','小舟を固定する','ロープが必要',0,'小舟を桟橋へつなぎ直した。全員が乗れる大きさだ。','波に引かれ、小舟は暗闇へ消えた。','小舟','ロープ'),action('meal','食卓で待つ','体力を回復しながら時間を待つ',1,'時計が一時間進んだ。皿には、さっきまで無かったあなたの指紋がついていた。')]},
  {scene:'灯台の光が宿を横切るたび、窓の人影が一つずつ減っていく。',event:'灯台へ向かう道が崩れ始めています。',investigation:'保守経路なら無傷で到達できます。信号符号があれば海上へ現在地を知らせられます。',actions:[action('light','灯台で救難信号を送る','信号符号を使う',0,'海の向こうから、同じ間隔の光が返った。','符号が分からず光を送れない。','灯台信号','信号符号'),action('path','保守経路を開く','配線図で通用口を探す',0,'内陸へ続く古い橋を開放した。波音が少し遠くなる。','場所が分からない。壁の向こうで電話が鳴る。','陸路','保守経路'),action('silence','回線をすべて切る','危険の拡大を抑える',-1,'初めて、宿が静かになった。遠くの波の音だけが残った。')]},
  {scene:'空が白み始めた。最後の電話は、あなたの端末から鳴っている。',event:'満潮になる前に、全員で宿を離れてください。',investigation:'灯台信号、小舟、陸路のどれかを確保していれば脱出できます。',actions:[action('ship','灯台下の救助船へ向かう','灯台信号が必要',0,'救助船に乗る。宿を振り返ると、どの窓にも電話の明かりが灯っていた。','船は見えない。潮が足元まで満ちてきた。',undefined,'灯台信号'),action('boat','固定した小舟で離れる','小舟の確保が必要',0,'岸を離れると、全員の電話が同時に切れた。','小舟はない。桟橋の先で、自分の声が助けを呼んでいた。',undefined,'小舟'),action('land','古い橋から内陸へ逃げる','陸路の開放が必要',0,'橋を渡った瞬間、宿の時計が止まった。朝の鳥が鳴き始めた。','通用口は閉じている。背後で電話がまた鳴った。',undefined,'陸路')]},
 ],
};

export function futureChapter(state:FutureState):FutureChapter {
  const chapter=FUTURE_CHAPTERS[state.scenarioId]?.[state.round-1];
  if(!chapter)throw new Error('現在の場面が見つかりません。');
  return chapter;
}
export function projectFuture(state:FutureState, id:string):{text:string;danger:number;success:boolean} {
  const choice=futureChapter(state).actions.find(a=>a.id===id);
  if(!choice)throw new Error('この場面では選べない行動です。');
  const success=!choice.requires||state.inventory.includes(choice.requires);
  const danger=Math.max(0,Math.min(6,state.danger+choice.danger+(success?0:2)));
  return {text:success?choice.success:choice.failure,danger,success};
}
export function resolveFuture(state:FutureState,id:string):FutureState {
  if(state.status!=='playing')throw new Error('この物語は終了しています。');
  const choice=futureChapter(state).actions.find(a=>a.id===id)!;
  const result=projectFuture(state,id);
  // Taking the key is possible even without ventilation, at a real cost.
  const gained=choice.item&&(result.success||state.scenarioId==='laboratory'&&id==='key');
  return {...state,danger:result.danger,inventory:gained?[...new Set([...state.inventory,choice.item!])]:[...state.inventory],
    history:[...state.history,{round:state.round,action:id,outcome:result.text}],
    status:result.danger>=6?'lost':state.round===5?(result.success?'escaped':'lost'):'playing'};
}
/** Each person receives a different fragment of a genuine conditional outcome. */
export function futureMessage(state:FutureState,index:number){
  const choices=futureChapter(state).actions,choice=choices[index%choices.length],prediction=projectFuture(state,choice.id);
  const kind=index%3===0?'目撃記録':index%3===1?'行動記録':'警告';
  const sentences=prediction.text.match(/[^。！？]+[。！？]?/g)||[prediction.text];
  const evidence=kind==='目撃記録'?sentences[0]:sentences.at(-1)!;
  return {id:`${state.round}:${index}`,kind,action:choice.id,label:choice.label,
    condition:`「${choice.label}」を選んだ未来`,
    text:kind==='行動記録'?`私たちは${choice.label}ことにした。［記録欠落］${evidence}`:kind==='警告'?`${evidence} ${choice.requires&&!prediction.success?`あのとき「${choice.requires}」を確かめておけば。`:'これは、あのときの私たちが見た一部分でしかない。'}`:`${evidence}［この先の記録は破損しています］`,
    evidence};
}

export interface FutureSession {
  state:FutureState; order:string[]; phase:'transmission'|'discussion'|'vote'|'tie'|'result'|'ended';
  ready:Record<string,boolean>; votes:Record<string,string>; locked:Record<string,boolean>;
  ballotRound:number; leaders:string[]; investigation:string|null;
  queries:{round:number;action:string;text:string}[]; decision:string|null;
  transmissionLog:{round:number;seat:string;message:ReturnType<typeof futureMessage>}[];
  deferred?:string[];
}
export function createFutureSession(scenario:string,order:string[]):FutureSession {
  if(order.length<3||order.length>8||new Set(order).size!==order.length)throw new Error('3〜8人で開始してください。');
  return {state:createFutureState(scenario),order:[...order],phase:'transmission',ready:{},votes:{},locked:{},ballotRound:0,leaders:[],investigation:null,queries:[],decision:null,transmissionLog:[]};
}
export type FutureCommand = {type:'read'}|{type:'investigate'}|{type:'query';option:string}|{type:'openVote'}|{type:'vote';option:string;confirm?:boolean}|{type:'decide';option:string}|{type:'next'}|{type:'defer';uids:string[]};
export function futureDecisionUid(g:FutureSession){
  return Array.from({length:g.order.length},(_,i)=>g.order[(g.state.round-1+i)%g.order.length]).find(uid=>!g.deferred?.includes(uid))||null;
}
/** Called inside the room transaction; identity and manager privileges are supplied by the server. */
export function actOnFuture(input:FutureSession,uid:string,manager:boolean,command:FutureCommand):FutureSession {
  const g:FutureSession=JSON.parse(JSON.stringify(input));
  restoreFutureSession(g);
  if(!command||!['read','investigate','query','openVote','vote','decide','next','defer'].includes(command.type))throw new Error('操作を選び直してください。');
  if(g.phase==='ended')throw new Error('この物語は終了しています。');
  const member=g.order.includes(uid)&&!g.deferred?.includes(uid),chapter=futureChapter(g.state);
  const active=()=>g.order.filter(id=>!g.deferred?.includes(id));
  const requireManager=()=>{if(!manager)throw new Error('ホストの操作を待っています。')};
  const choose=(option:string)=>{
    if(!chapter.actions.some(a=>a.id===option))throw new Error('行動を選択してください。');
    g.decision=option;g.state=resolveFuture(g.state,option);g.phase='result';
  };
  switch(command.type){
    case 'read':
      if(!member||g.phase!=='transmission')throw new Error('通信を確認できる状態ではありません。');
      if(!g.ready[uid]){g.ready[uid]=true;g.transmissionLog.push({round:g.state.round,seat:uid,message:futureMessage(g.state,g.order.indexOf(uid))})}
      if(active().every(id=>g.ready[id]))g.phase='discussion';
      break;
    case 'investigate':
      requireManager();if(g.phase!=='discussion'||g.investigation)throw new Error('この場面の調査は完了しています。');
      g.investigation=chapter.investigation;break;
    case 'query':
      requireManager();if(g.phase!=='discussion'||g.state.questionsRemaining<=0)throw new Error('未来への問いは使えません。');
      g.queries.push({round:g.state.round,action:command.option,text:projectFuture(g.state,command.option).text});g.state.questionsRemaining--;break;
    case 'openVote':
      requireManager();if(g.phase!=='discussion')throw new Error('議論中に投票を開始できます。');g.phase='vote';break;
    case 'vote':{
      if(!member||g.phase!=='vote'||g.locked[uid])throw new Error('投票できる状態ではありません。');
      const options=g.ballotRound?g.leaders:chapter.actions.map(a=>a.id);
      if(!options.includes(command.option))throw new Error('投票先を選び直してください。');
      g.votes[uid]=command.option;if(command.confirm)g.locked[uid]=true;
      if(active().every(id=>g.locked[id])){
        const leaders=futureVoteLeaders(g.votes,options);g.leaders=leaders;
        if(leaders.length===1)choose(leaders[0]);
        else if(g.ballotRound===0){g.ballotRound=1;g.votes={};g.locked={}}
        else g.phase='tie';
      }break;
    }
    case 'decide':
      if(g.phase!=='tie'||uid!==futureDecisionUid(g)||!g.leaders.includes(command.option))throw new Error('今回の決断役が同票の行動から選んでください。');
      choose(command.option);break;
    case 'next':
      requireManager();if(g.phase!=='result')throw new Error('結果発表のあとに進めます。');
      if(g.state.status!=='playing')g.phase='ended';
      else {g.state.round++;g.phase='transmission';g.ready={};g.votes={};g.locked={};g.ballotRound=0;g.leaders=[];g.investigation=null;g.decision=null;g.deferred=[]}
      break;
    case 'defer':{
      requireManager();if(!['transmission','vote','tie'].includes(g.phase))throw new Error('個別操作中に保留できます。');
      const ids=command.uids.filter(id=>g.order.includes(id));if(!ids.length)throw new Error('保留が必要な参加者はいません。');
      g.deferred=[...new Set([...(g.deferred||[]),...ids])];
      if(!active().length)throw new Error('全員を保留にはできません。接続の復帰をお待ちください。');
      for(const id of ids){delete g.votes[id];delete g.locked[id]}
      if(g.phase==='transmission'&&active().every(id=>g.ready[id]))g.phase='discussion';
      if(g.phase==='vote'&&active().every(id=>g.locked[id])){
        const leaders=futureVoteLeaders(g.votes,g.ballotRound?g.leaders:chapter.actions.map(a=>a.id));g.leaders=leaders;
        if(leaders.length===1)choose(leaders[0]);else if(g.ballotRound===0){g.ballotRound=1;g.votes={};g.locked={}}else g.phase='tie';
      }
      break;
    }
  }
  return g;
}

/** Secret forecasts are never included in the shared room projection. */
export function futurePublic(g:FutureSession){
  restoreFutureSession(g);
  const chapter=futureChapter(g.state),ended=g.phase==='ended';
  return {scenario:FUTURE_SCENARIOS.find(s=>s.id===g.state.scenarioId),round:g.state.round,danger:g.state.danger,inventory:g.state.inventory,status:g.state.status,phase:g.phase,
    scene:chapter.scene,event:chapter.event,options:chapter.actions.map(a=>({id:a.id,label:a.label,detail:a.detail,requires:a.requires||null})),
    readyCount:g.order.filter(id=>g.ready[id]&&!g.deferred?.includes(id)).length,total:g.order.filter(id=>!g.deferred?.includes(id)).length,voteCount:Object.keys(g.locked).length,ballotRound:g.ballotRound,leaders:g.leaders,
    decisionUid:futureDecisionUid(g),deferred:g.deferred||[],investigation:g.investigation,questionsRemaining:g.state.questionsRemaining,
    queries:g.queries.filter(q=>q.round===g.state.round),history:g.state.history,
    transmissions:ended?g.transmissionLog:[]};
}
export function futurePrivate(g:FutureSession,uid:string){
  restoreFutureSession(g);
  const index=g.order.indexOf(uid);if(index<0)return null;
  const recorded=g.transmissionLog.find(entry=>entry.round===g.state.round&&entry.seat===uid)?.message;
  return {message:recorded||futureMessage(g.state,index),ready:!!g.ready[uid]||!!g.deferred?.includes(uid),vote:g.votes[uid]||null,locked:!!g.locked[uid]||!!g.deferred?.includes(uid)};
}

/** Realtime Database omits empty maps and arrays on round trips. */
export function restoreFutureSession(g:FutureSession){
  g.ready??={};g.votes??={};g.locked??={};g.leaders??=[];g.queries??=[];g.transmissionLog??=[];
  g.state.inventory??=[];g.state.history??=[];
}
