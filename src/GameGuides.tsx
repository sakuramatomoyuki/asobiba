import React from 'react';
import { GAME_CATALOG, gameDeviceModeHint, type GameId } from './gameCatalog';

type Guide = {
  id: GameId;
  name: string;
  mood: string;
  summary: string;
  aim: string;
  firstMove: string;
  steps: string[];
  tips: string[];
  twoPlayerNote?: string;
  roles?: { name: string; description: string }[];
};

export const GAME_GUIDES: readonly Guide[] = [
  {
    id: 'jinrou', name: '人狼', mood: '推理と会話',
    summary: '会話と投票で人狼を探す、正体隠匿ゲームです。',
    aim: '市民陣営は人狼を全員処刑、人狼陣営は生きている人狼の数が市民陣営の生存者数以上になることを目指します。てるてるは投票で処刑されると単独勝利です。',
    firstMove: '朝の結果を見たら、気になったことを一つずつ話しましょう。役職を名乗るかどうかは自分で判断できます。',
    steps: ['役職を自分だけで確認します。人狼や占い師などは夜に能力を使います。', '昼は公開情報をもとに話し合い、投票で処刑する人を決めます。', '夜と昼を繰り返し、どちらかの勝利条件が成立すると終了です。'],
    tips: ['役職や個人に届いた結果は、画面に表示された本人だけの情報です。', '投票先や夜の行動は、確定するまで他の人に見えません。', '怪盗は最初は市民陣営ですが、夜に役職を交換すると交換後の役職・陣営になります。'],
    roles: [
      { name: '市民', description: '市民陣営。夜の能力はありません。話し合いと投票で人狼を探します。' },
      { name: '占い師', description: '市民陣営。夜に生存者1人を占い、人狼か人間かを確認します。' },
      { name: '霊媒師', description: '市民陣営。処刑された人が人狼か人間かを翌朝に確認します。' },
      { name: '騎士', description: '市民陣営。夜に自分以外の生存者1人を襲撃から守ります。同じ人を続けて守れます。' },
      { name: '共有者', description: '市民陣営。ほかの共有者が誰か分かり、夜に専用チャットで会話できます。' },
      { name: '人狼', description: '人狼陣営。夜に襲撃先を選び、仲間の人狼を知っています。' },
      { name: '狂人', description: '人狼陣営。特殊能力はなく、人狼が誰かは知りません。人狼側も狂人を知りません。' },
      { name: '狂言者', description: '人狼陣営。人狼が誰かを知っていますが、人狼側は狂言者を知りません。' },
      { name: 'てるてる', description: '中立。昼の投票で処刑されると、陣営勝敗とは別に単独勝利します。' },
      { name: '怪盗', description: '初期配布では市民陣営。夜に1人と役職を交換し、交換後の自分の役職を知ります。役職に応じて陣営も変わります。' },
    ],
  },
  {
    id: 'wordwolf', name: 'ワードウルフ', mood: '会話と少数派探し',
    summary: '少し違うお題を持つ人を、会話から見つけます。',
    aim: '多数派は少数派を見つけ、少数派は正体を隠し切るか逆転回答を当てましょう。',
    firstMove: 'お題を言い切らず、「どんな場面で使う？」「誰と楽しむ？」のような質問から始めると会話が続きます。',
    steps: ['自分のお題だけを確認します。多数派か少数派かは、お題の違いから推理します。', 'お題を直接言わずに話し合い、怪しい人へ投票します。', '少数派が見つかった場合は、多数派のお題を推理する逆転回答に進みます。'],
    tips: ['最初からお題を言うとゲームがすぐ終わってしまいます。特徴や経験を話すのがおすすめです。', '最多票が同数なら、同率1位が全員少数派の場合に見破り成功です。多数派が1人でも同率1位に入ると、少数派は見つかりません。', '少数派の相談内容は少数派だけに表示されます。'],
  },
  {
    id: 'ogiri', name: '大喜利', mood: 'ひらめきとリアクション',
    summary: '2人から遊べる、お題に答えてみんなの反応で盛り上がるステージゲームです。',
    aim: '設定された採点方法でポイントを集め、最終ランキング上位を目指します。',
    firstMove: '最初の5秒はお題だけが表示されます。回答開始の合図が出たら、お題の言葉を一つ拾って答えましょう。絵で答える設定なら、線や形だけのシンプルな絵でも大丈夫です。',
    twoPlayerNote: '2人なら、お互いの回答を順番に発表し、相手の回答にリアクションや点数をつけます。自分の回答は採点できません。',
    steps: ['お題を読み、文字または絵で回答します。', '早押し形式は回答した人から発表し、全員回答後形式は回答の早い順に一人ずつ発表します。発表者が「みんなに見せる」を押すと回答が公開されます。', '自分以外の回答にリアクションまたは点数をつけ、集計後に次のお題へ進みます。'],
    tips: ['採点方法・回答形式・発表形式は開始前に確認できます。自分の回答には採点できません。', '発表者の回答は先に画面へ読み込まれますが、発表者が「みんなに見せる」を押すまでは伏せてあります。ボタンを押すとすぐに公開されます。', '「面白い／普通」は「面白い」の割合、「0〜10点」は平均点で合格ラインを判定します。', '採点を忘れた回答は、集計時に「普通」として扱われます。', '採点者をホストだけにした場合、ホスト自身の回答は公平のため他の参加者が採点します。', '2人プレイでも遊べます。合格ライン方式や最下位脱落方式では、条件により早めに終了することがあります。'],
  },
  {
    id: 'survey', name: '匿名アンケート', mood: 'みんなの傾向を発見',
    summary: '質問に匿名で答え、全員の回答を集計して楽しみます。',
    aim: '勝ち負けやポイントはありません。回答の分布や意外な意見を楽しむゲームです。',
    firstMove: '選択式なら一番近いものを選び、自由記述なら短く答えましょう。回答は匿名ですが、個人を特定できる情報は書かないでください。',
    steps: ['ホストまたは順番の参加者が質問と回答形式を用意します。', '全員が名前と結び付かない形で回答します。回答中は他の人の内容は見えません。', '回答が締め切られると、選択肢の割合または匿名の自由回答が表示されます。'],
    tips: ['自由記述は80文字までです。個人を特定する情報は書かないようにしましょう。', '質問を作った人も匿名で回答できます。', '参加者が順番に質問を作る設定では、全員に一度ずつ回った後も、設定された質問数に達するまで順番が巡ります。', '締切前の回答内容は、ホストを含め誰にも見えません。ポイントや勝敗はありません。'],
  },
  {
    id: 'majority', name: 'マジョリティパーティー', mood: '究極の選択',
    summary: '究極の二択に、自分の答えを決めて参加します。',
    aim: '親の二択に「押す」か「押さない」で投票し、多数派に入ってポイントを集めます。自分の気持ちを貫くか、みんなの選択を読んで合わせるかは自由です。',
    firstMove: 'まずはお題の条件を質問して確かめましょう。投票では「自分ならどうするか」と「みんなはどちらを選びそうか」の両方を考えてみてください。',
    steps: ['毎ラウンド1人の「親」が進行役になります。親はランダムなお題3つから1つ選び、自分で作ることもできます。', '質問タイムでは投票先を明かさずに確認し、親は質問に答えます。', '全員が「押す／押さない」を秘密投票します。多数派・少数派を発表してポイントを精算し、次の親へ進みます。'],
    tips: ['自分の本音で選んでも、ポイントを狙って多数派になりそうな方を選んでも大丈夫です。多数派に入ると+1点です。', '質問タイムでは、どちらに投票するかを明かさずに条件を確認しましょう。', '少数派の親は所持点があれば1点失い、少数派のほかの人も所持点があれば1点を親へ渡します。0点の人はマイナスになりませんが、親は0点のプレイヤーからも1点を獲得します。', '同票なら親が選んだ側を多数派として扱います。'],
  },
  {
    id: 'ito', name: 'クモノイト（ito）', mood: '協力と感覚のすり合わせ',
    summary: '自分の数字とテーマを確認し、みんなで相談して小さい順に並べます。',
    aim: '全員の数字を小さい順に並べられたら成功です。',
    firstMove: '数字は言わず、テーマに沿った具体例を一つ挙げて、みんなで「どちらが大きそうか」を相談しましょう。',
    steps: ['各自が自分の数字と、1〜100のテーマ・尺度を確認します。', '数字を直接明かさず、テーマに沿って順番をみんなで相談します。専用のヒント入力欄はありません。', '相談して順番を決め、管理者が一覧を並べ替えて判定します。'],
    tips: ['テーマの「1」と「100」が何を表すか確認しましょう。', '時間制限はありません。口頭で相談し、数字そのものは秘密のままにします。', '結果では、みんなが作った順と本当の順を並べて確認できます。'],
  },
  {
    id: 'lateral', name: '水平思考クイズ', mood: '質問で謎を解く',
    summary: '2人から遊べます。司会役に質問しながら、不思議な出来事の真相を探ります。',
    aim: '真相を言い当てたプレイヤーは5ポイントを獲得します。',
    firstMove: '問題文の登場人物や状況を一つ選んで、「その人は一人でしたか？」のように、はい／いいえで答えられる質問をしてみましょう。',
    twoPlayerNote: '2人参加でホストがプレイヤー兼ホストなら、ホスト固定ではホストが司会役、もう1人が推理役です。ホストが管理専任なら、2人とも推理に参加できます。交代制では参加者が問題ごとに司会役を交代します。',
    steps: ['担当する司会役（GM）が問題を選び、タイトルと問題文を発表します。', 'プレイヤーは「はい／いいえ／分からない」で答えられる質問をして、手がかりを集めます。', '真相が分かったら解答します。司会役が判定し、不正解の内容はみんなに公開されます。'],
    tips: ['質問は「職業は関係ありますか？」のように、はい／いいえで答えられる形にします。', '司会役はその問題の解答者にはなりません。ホスト固定ならホストが毎問担当し、交代制なら担当者が問題ごとに交代します。', '真相を見られるのは担当する司会役だけです。ホスト権限があるだけでは、真相は見えません。', '不正解の解答は全員に公開されるため、確信が持てるまで質問で手がかりを集めましょう。'],
  },
  {
    id: 'untilmatch', name: '一致するまで終われまてん', mood: '連想とチームワーク',
    summary: '2人から遊べる、みんなの連想を合わせるゲームです。',
    aim: '全員の回答が公開されたあと、ルーム作成者（ホスト）が意味を見て一致かどうかを判定します。表記が違っても、同じ答えだとホストが判断すれば成功です。',
    firstMove: 'お題を読んだら、特別な答えより「みんながまず思い浮かべそうな答え」を一つ考えて入力しましょう。',
    twoPlayerNote: '2人とも回答し、回答がそろったらホストが2つを見比べて一致かどうかを判定します。ホスト自身も回答者なら、自分の答えを含む両方の回答を確認して判定します。',
    steps: ['お題を読み、ほかの人も思い浮かべそうな答えを一つ入力します。回答するまでは、ほかの人の答えは見えません。', '全員が回答すると、判定の前に名前付きですべての回答が全員へ公開されます。', 'ルーム作成者（ホスト）が全回答を見て一致か不一致かを判定します。一致ならゲーム終了。不一致なら、設定した問題数が残っている場合は次のお題へ進みます。'],
    tips: ['文字が完全に同じでなくても、読み方・言い換え・意味が同じならホスト判断で一致にできます。機械的な正解基準ではなく、ルーム作成者が全員の回答を見て判定します。', '回答は判定前に全員へ公開され、一致・不一致のどちらでも結果画面に残ります。ホストもプレイヤーなら、自分の回答を含む全員分を確認してから判定します。', '初期設定は最大10問です。一致すると全員に2ポイント加算されてゲーム終了します（ポイント設定が有効な場合）。最大問数までに一致しなければ終了し、無制限設定では不一致の後にホストが続行か終了を選びます。'],
  },
];

export function GameGuidePanel({ game }: { game?: string | null }) {
  const selectedGuide = game ? GAME_GUIDES.find((guide) => guide.id === game) : undefined;
  const guides = selectedGuide ? [selectedGuide] : GAME_GUIDES;
  const [openGuideId, setOpenGuideId] = React.useState<string>(selectedGuide?.id ?? '');
  React.useEffect(() => setOpenGuideId(selectedGuide?.id ?? ''), [selectedGuide?.id]);
  return <section className="game-guide-panel" aria-label="ゲーム別の遊び方">
    <div className="game-guide-heading"><span className="eyebrow">GUIDE BY GAME</span><h2>{selectedGuide ? 'このゲームの遊び方' : 'ゲーム別の遊び方'}</h2><p>初めての人も、各画面の案内に沿って進めれば大丈夫です。</p><details className="game-guide-basics"><summary>参加方法・ホスト・司会役について</summary><div><p className="game-guide-device-note"><b>参加方法</b> 「各自の端末」は全員が自分のスマートフォンやPCを使います。「共有端末」は1台を順番に使い、「併用」は両方を混ぜます。対応する参加方法はゲームによって異なります。</p><p className="game-guide-host-note"><b>ホストと司会役</b> ホストはルームやゲームの開始・進行を管理します。プレイヤー兼ホストにも、他の人の役職や秘密の回答は表示されません。水平思考クイズの司会役（GM）は、問題選び・質問への返答・解答の判定を担当します。設定によりホスト固定または交代制です。司会役を担当する人だけが、その問題の真相を見ます。観戦者は進行を操作せず、公開情報だけを見ます。</p></div></details></div>
    <div className="game-guide-list">{guides.map((guide) => {const catalogGame=GAME_CATALOG.find((entry)=>entry.id===guide.id);const isOpen=openGuideId===guide.id;const panelId=`game-guide-panel-${guide.id}`;return <article key={guide.id} className={`game-guide game-guide-${guide.id}${isOpen?' is-open':''}`}>
      <button className="game-guide-trigger" type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={()=>setOpenGuideId((current)=>current===guide.id?'':guide.id)}><span className="game-guide-mark" aria-hidden="true">{catalogGame?.mark}</span><span className="game-guide-title"><span className="game-guide-mood">{guide.mood}</span><strong>{guide.name}</strong></span><span className="game-guide-summary">{guide.summary}</span><span className="game-guide-players">{catalogGame?.players}<small>{catalogGame?gameDeviceModeHint(catalogGame):''}</small></span><span className="game-guide-chevron" aria-hidden="true">⌄</span></button>
      <div id={panelId} className="game-guide-accordion" aria-hidden={!isOpen} {...(!isOpen ? { inert: '' } as any : {})}><div className="game-guide-accordion-inner"><div className="game-guide-body"><div className="game-guide-goal"><b>目指すこと</b><p>{guide.aim}</p></div><div className="game-guide-first-move"><b>まずはここから</b><p>{guide.firstMove}</p></div>{guide.twoPlayerNote&&<div className="game-guide-two-player"><b>2人で遊ぶとき</b><p>{guide.twoPlayerNote}</p></div>}{guide.roles&&<details className="game-guide-role-list"><summary>役職の早見表（{guide.roles.length}種類）</summary><div>{guide.roles.map((role)=><article key={role.name}><b>{role.name}</b><p>{role.description}</p></article>)}</div></details>}<div className="game-guide-columns"><section><h3>ゲームの流れ</h3><ol className="game-guide-animated-steps">{guide.steps.map((step,stepIndex) => <li key={step} style={{'--step-delay':`${stepIndex*150}ms`} as React.CSSProperties}>{step}</li>)}</ol></section><section><h3>初めて遊ぶ方へ</h3><ul>{guide.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></section></div></div></div></div>
    </article>})}</div>
  </section>;
}
