export type PartyGameId = 'majority'|'ito'|'lateral'|'hyperbomber'|'untilmatch';
export const PARTY_GAME_IDS: readonly PartyGameId[] = ['majority','ito','lateral','hyperbomber','untilmatch'];
export const PARTY_GAME_DEFAULTS: Record<PartyGameId, Record<string, unknown>> = {
  majority: { rounds: 5, pointsEnabled: true, addRoomPoints: true },
  ito: { rounds: 1, pointsEnabled: true, addRoomPoints: true },
  lateral: { pointsEnabled: true, addRoomPoints: true },
  hyperbomber: { turnSeconds: 15, pointsEnabled: true, addRoomPoints: true },
  untilmatch: { matchStreak: 1, maxRounds: 10, pointsEnabled: true, addRoomPoints: true },
};

export function mergePartyGameSettings(
  game: PartyGameId,
  saved?: unknown,
  draft?: unknown,
): Record<string, unknown> {
  const record = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  const allowed: Record<PartyGameId, readonly string[]> = {
    majority: ['rounds', 'pointsEnabled', 'addRoomPoints'],
    ito: ['pointsEnabled', 'addRoomPoints'],
    lateral: ['quizSource', 'title', 'solution', 'pointsEnabled', 'addRoomPoints'],
    hyperbomber: ['turnSeconds', 'promptSource', 'prompt', 'pointsEnabled', 'addRoomPoints'],
    untilmatch: ['matchStreak', 'maxRounds', 'pointsEnabled', 'addRoomPoints'],
  };
  const pick = (value: unknown) => Object.fromEntries(
    Object.entries(record(value)).filter(([key]) => allowed[game].includes(key)),
  );
  return { ...PARTY_GAME_DEFAULTS[game], ...pick(saved), ...pick(draft) };
}
export const MAJORITY_PROMPTS = [
  'すべての異性に好かれる。しかし、すべての同性に嫌われる。',
  '毎日好きなものが食べ放題になる。しかし、体重が今の2倍になる。',
  '空を自由に飛べるようになる。しかし、常に時速30kmで移動しなければならない。',
  '宝くじで1億円当たる。しかし、今後の消費税が20％になる。',
  'どんな言語でも話せるようになる。しかし、母国語（日本語）を忘れてしまう。',
  '記憶力が完璧になる。しかし、嫌な記憶も絶対に忘れなくなる。',
  '何でもする忠実な下僕ができる。しかし、どこに行くにも付いてくる。',
  '理想のタイプと結婚できる。しかし、一生浮気され続ける。',
  '10年間だけ最高の恋人と過ごせる。しかし、その後の人生は一生独身になる。',
  '人の心（本音）が読めるようになる。しかし、自分の本音も常にダダ漏れになる。',
  '一生お金に困らない相手と結婚できる。しかし、相手への恋愛感情はゼロになる。',
  '初恋の人とやり直せる。しかし、これまでの人間関係がすべてリセットされる。',
  '誰からも嫌われなくなる。しかし、誰からも特別に愛されることもなくなる。',
  '睡眠時間が毎日1時間で平気になる。しかし、横になって眠ることができなくなる（常に立ち寝）。',
  '世界中のどこへでも瞬間移動できる。しかし、帰りは必ず徒歩になる。',
  'どんな病気やケガも一瞬で治る。しかし、寿命がちょうど60歳で固定される。',
  '仕事がどんなに忙しくても定時で帰れる。しかし、給料は一生上がらない。',
  '1日だけ透明人間になれる。しかし、翌日は全身蛍光ピンク色になる。',
  '過去に1回だけ戻ってやり直せる。しかし、未来の記憶はすべて消える。',
  '右隣の人とより親密になる。しかし、左隣の人と少し疎遠になる。',
  '今この場にいる全員に100万円配られる。しかし、自分だけ1円ももらえない。',
  'この中で一番仲が良い人の秘密を1つ知れる。しかし、自分の秘密もその人にバレる。',
  '今この場にいる誰か1人と入れ替われる。しかし、一生元の体には戻れない。'
];
export const ITO_THEMES = [
  ['動物の大きさ','小さい','大きい'],['動物の速さ','遅い','速い'],['動物の強さ','弱い','強い'],['水族館の生き物の人気','不人気','大人気'],['家事の大変さ','余裕','超大変'],
  ['なくすと困るもの','どうでもいい','超重要'],['あると便利な家電','全然','めちゃくちゃ'],['休日の過ごし方の人気','不人気','大人気'],['果物の甘さ','全然','めちゃくちゃ'],['魚の美味しさ','いまいち','絶品'],
  ['建物の高さ','低い','高い'],['物の重さ','軽い','重い'],['乗り物の速さ','遅い','速い'],['乗り物の値段','安い','高い'],['ジェットコースターの怖さ','平気','こわい'],
  ['コンビニおにぎりの具の人気','不人気','大人気'],['回転寿司のネタの人気','不人気','大人気'],['焼肉で頼みたいものの人気','不人気','大人気'],['おでんの具の人気','不人気','大人気'],['カレーに入れたい具の人気','不人気','大人気'],
  ['鍋の具の人気','不人気','大人気'],['パン屋でつい取ってしまうパン','全然','めちゃくちゃ'],['果物の人気','不人気','大人気'],['ファミレスで頼むものの人気','不人気','大人気'],['お祭りの屋台グルメの人気','不人気','大人気'],
  ['自販機で買う飲み物の人気','不人気','大人気'],['深夜に食べたくなるもの','全然','めちゃくちゃ'],['ごはんのお供の人気','不人気','大人気'],['ケーキの人気','不人気','大人気'],['駄菓子の人気','不人気','大人気'],
  ['カラオケで盛り上がる曲','全然','めちゃくちゃ'],['初対面で盛り上がる話題','全然','めちゃくちゃ'],['居酒屋で最初に頼みたい飲み物','不人気','大人気'],['居酒屋メニューの人気','不人気','大人気'],['酔っ払いがやりがちな失敗','ないない','超あるある'],
  ['金曜日の解放感','しょんぼり','最高'],['恋愛で大事なこと','どうでもいい','超重要'],['好きな人に言われて嬉しい言葉','しょんぼり','最高'],['上司に言われて嬉しい一言','しょんぼり','最高'],['乾杯で盛り上がる一言','全然','めちゃくちゃ'],
  ['暑い日に食べたいもの','いらない','絶対ほしい'],['お菓子の人気','不人気','大人気'],['ペットにしたい動物の人気','不人気','大人気'],['動物園の人気者','不人気','大人気'],['クリスマスプレゼントの嬉しさ','しょんぼり','最高'],
  ['習い事の人気','不人気','大人気'],['誕生日プレゼントで欲しいもの','いらない','絶対ほしい'],['なりたい職業の人気','不人気','大人気'],['キャラクターの人気','不人気','大人気'],['アイスの美味しさ','いまいち','絶品'],
  ['給食メニューの人気','不人気','大人気'],['学校行事の人気','不人気','大人気'],['授業科目の人気','不人気','大人気'],['テスト前のあるある度','ないない','超あるある'],['文化祭の出し物の人気','不人気','大人気'],
  ['体育の種目の人気','不人気','大人気'],['休み時間の過ごし方の人気','不人気','大人気'],['夏休みの宿題で最後まで残りがちな物','ないない','超あるある'],['修学旅行で行きたい場所','行きたくない','絶対行きたい'],['席替えのワクワク','しょんぼり','最高'],
  ['デートで行きたい場所','行きたくない','絶対行きたい'],['休日デートでしたいこと','したくない','絶対したい'],['結婚相手に求める条件','どうでもいい','超重要'],['やられたら冷める行動','全然','めちゃくちゃ'],['やられたらキュンとする仕草','全然','めちゃくちゃ'],
  ['告白されたい言葉','しょんぼり','最高'],['初デートにちょうどいい場所','全然','めちゃくちゃ'],['恋人に言われて嬉しい言葉','しょんぼり','最高'],['プレゼントでもらって嬉しいもの','しょんぼり','最高'],['一緒に行きたい旅行先','行きたくない','絶対行きたい'],
  ['オフィスにあると嬉しいもの','しょんぼり','最高'],['リモートワークの良さ','全然','めちゃくちゃ'],['昼休みの過ごし方の人気','不人気','大人気'],['職場で言われて嬉しい一言','しょんぼり','最高'],['月曜の朝のつらさを感じる瞬間','余裕','超大変'],
  ['差し入れでもらって嬉しいもの','しょんぼり','最高'],['仕事で嬉しい瞬間','しょんぼり','最高'],['定時後にしたいこと','したくない','絶対したい'],['有給を取りたくなる理由','全然','めちゃくちゃ'],['給料日のうれしさ','しょんぼり','最高'],
  ['無人島に持っていきたいもの','いらない','絶対ほしい'],['3億円当たったらしたいこと','したくない','絶対したい'],['もし透明人間になったらやりたいこと','したくない','絶対したい'],['ほしい超能力の人気','不人気','大人気'],['一日なってみたい職業の人気','不人気','大人気'],
  ['推しになら出せる金額','少ない','多い'],['カラオケで入れると盛り上がる曲','全然','めちゃくちゃ'],['何度もちまちま読み返してしまう漫画','全然','めちゃくちゃ'],['自分へのご褒美で食べたいもの','しょんぼり','最高'],['つい無駄遣いしてしまうもの','全然','めちゃくちゃ'],
  ['球場で生で見たいプレー','いらない','絶対ほしい'],['球場が沸くプレー','全然','めちゃくちゃ'],['球場で食べたいもの','いまいち','絶品'],['もらってうれしいクリスマスプレゼント','いらない','絶対ほしい'],['クリスマスに食べたいもの','いらない','絶対ほしい'],
  ['忘年会のビンゴで当たるとうれしい景品','しょんぼり','最高'],['今年買ってよかったもの','しょんぼり','最高'],['おせち料理の中で好きなもの','いまいち','絶品'],['初詣でお願いしたいこと','どうでもいい','超重要'],['今年食べていちばんおいしかったもの','いまいち','絶品'],
].map(([name, low, high]) => ({ name, low, high }));
export const UNTIL_MATCH_PROMPTS = [
  '目玉焼きにかけるものといえば？', '白い食べ物といえば？', '遠足のおやつといえば？', '夏に食べたいものといえば？',
  '無人島に一つ持っていくなら？', '動物園の人気者といえば？', 'コンビニでつい買うものといえば？', '赤い果物といえば？',
  '朝ごはんの定番といえば？', '一番有名な昔話といえば？', '旅行で持っていくものといえば？', '雨の日にしたいことといえば？',
];
export const LATERAL_DEFAULT_QUIZ = {
  title: 'ある男がレストランで水を頼むと、店員は突然大きな音を立てました。男は「ありがとう」と言って店を出ました。なぜ？',
  solution: '男はしゃっくりを止めたくて水を頼みました。店員が驚かせたことでしゃっくりが止まり、お礼を言いました。',
};
export const BOMBER_PROMPTS = ['「あ」から始まる食べ物','学校にあるもの','旅行に持っていくもの','丸いもの','冬に使うもの','動物園にいる動物','コンビニで買えるもの','海にあるもの','音が出るもの','赤いもの'];

export function normalizePartyAnswer(value: unknown, max = 120): string {
  return String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, max);
}
export function samePartyAnswer(a: unknown, b: unknown): boolean {
  const clean = (value: unknown) => normalizePartyAnswer(value, 120).toLocaleLowerCase('ja').replace(/[、。！!？?・「」『』]/g, '');
  return Boolean(clean(a)) && clean(a) === clean(b);
}
export function majorityPoints(answers: Record<string, number>, enabled = true): Record<string, number> {
  if (!enabled) return Object.fromEntries(Object.keys(answers).map(uid => [uid, 0]));
  const counts = new Map<number, number>();
  Object.values(answers).forEach(answer => counts.set(answer, (counts.get(answer) || 0) + 1));
  const max = Math.max(0, ...counts.values());
  return Object.fromEntries(Object.entries(answers).map(([uid, answer]) => [uid, counts.get(answer) === max ? 1 : 0]));
}
export function itoOrderIsCorrect(values: Record<string, number>, order: string[]): boolean {
  if (!order.length || new Set(order).size !== order.length || order.some(uid => !(uid in values))) return false;
  return order.every((uid, index) => index === 0 || values[order[index - 1]] <= values[uid]);
}
