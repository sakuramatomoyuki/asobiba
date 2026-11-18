export type SurveyPrompt = {
  prompt: string;
  type: 'single' | 'multiple' | 'text' | 'boolean';
  options?: string[];
};

/** Light, low-pressure prompts that work for mixed-age groups and repeat play. */
export const SURVEY_PROMPTS: SurveyPrompt[] = [
  {prompt:'休日にいちばんしたいことは？',type:'single',options:['家でゆっくり','外で遊ぶ','旅行','趣味に没頭']},
  {prompt:'朝に飲むならどれ？',type:'single',options:['コーヒー','お茶','水','飲まない']},
  {prompt:'好きな季節は？',type:'single',options:['春','夏','秋','冬']},
  {prompt:'旅行先を選ぶなら？',type:'single',options:['自然','温泉','都会','テーマパーク']},
  {prompt:'一日自由なら、外出したい？',type:'boolean'},
  {prompt:'朝食でよく食べるものは？',type:'single',options:['ごはん','パン','シリアル','食べない']},
  {prompt:'好きな麺料理は？',type:'single',options:['ラーメン','うどん','そば','パスタ']},
  {prompt:'コンビニでつい買うものは？',type:'single',options:['お菓子','飲み物','ホットスナック','新商品']},
  {prompt:'映画を見るならどこ？',type:'single',options:['映画館','自宅','どちらも','あまり見ない']},
  {prompt:'好きな天気は？',type:'single',options:['晴れ','くもり','雨','雪']},
  {prompt:'旅行の計画はどのくらい立てる？',type:'single',options:['細かく立てる','大まかに立てる','現地で決める']},
  {prompt:'一番落ち着く時間帯は？',type:'single',options:['朝','昼','夕方','夜']},
  {prompt:'家で過ごすなら何をする？',type:'multiple',options:['読書','動画を見る','料理','ゲーム','昼寝']},
  {prompt:'外出時に持っていくものは？',type:'multiple',options:['飲み物','イヤホン','本','充電器','ハンカチ']},
  {prompt:'好きな甘いものは？',type:'single',options:['ケーキ','アイス','和菓子','チョコレート']},
  {prompt:'新しい店を見つけたら入ってみる？',type:'boolean'},
  {prompt:'友だちと集まるなら何をしたい？',type:'single',options:['食事','散歩','ボードゲーム','おしゃべり']},
  {prompt:'行ってみたい場所を教えてください。',type:'text'},
  {prompt:'最近うれしかった小さな出来事は？',type:'text'},
  {prompt:'好きな動物は？',type:'single',options:['犬','猫','鳥','魚','その他']},
  {prompt:'昼ごはんを選ぶなら？',type:'single',options:['定食','麺類','丼もの','軽食']},
  {prompt:'新しい趣味を始めるなら？',type:'single',options:['スポーツ','楽器','ものづくり','語学']},
  {prompt:'買い物はどちらが好き？',type:'single',options:['お店で見る','ネットで探す','どちらも好き']},
  {prompt:'明日が休みなら夜更かしする？',type:'boolean'},
  {prompt:'一緒に遊ぶならどれがいい？',type:'single',options:['カードゲーム','謎解き','スポーツ','おしゃべり']},
  {prompt:'気分転換にしたいことは？',type:'multiple',options:['散歩','音楽を聴く','甘いものを食べる','昼寝','景色を見る']},
  {prompt:'落ち着く場所はどこ？',type:'single',options:['自分の部屋','公園','カフェ','図書館']},
  {prompt:'一度は体験してみたいことは？',type:'text'},
  {prompt:'季節のイベントは好き？',type:'boolean'},
  {prompt:'おやつに選ぶなら？',type:'single',options:['クッキー','せんべい','フルーツ','アイス']},
  {prompt:'雨の日にしたいことは？',type:'multiple',options:['映画を見る','本を読む','料理をする','ゲームをする','ゆっくり休む']},
  {prompt:'遠出するならどの移動手段？',type:'single',options:['電車','車','飛行機','船']},
  {prompt:'一日の中で好きな食事は？',type:'single',options:['朝ごはん','昼ごはん','夕ごはん','おやつ']},
  {prompt:'知らないジャンルの音楽も聴いてみる？',type:'boolean'},
  {prompt:'理想の休日の始まり方は？',type:'text'},
  {prompt:'部屋に置くならどれ？',type:'multiple',options:['観葉植物','大きなクッション','本棚','間接照明','小さな時計']},
  {prompt:'新しい料理を食べるのは好き？',type:'boolean'},
  {prompt:'旅先で楽しみなのは？',type:'multiple',options:['景色','食べ物','温泉','買い物','街歩き']},
  {prompt:'好きな飲み物の種類は？',type:'single',options:['お茶','コーヒー','炭酸飲料','ジュース']},
  {prompt:'一つだけ道具を持って公園へ行くなら？',type:'text'},
  {prompt:'待ち合わせには早めに着く？',type:'boolean'},
  {prompt:'家で音楽を聴くなら？',type:'single',options:['スピーカー','イヤホン','どちらも','あまり聴かない']},
  {prompt:'みんなで食べるならどれ？',type:'single',options:['ピザ','お寿司','焼肉','鍋']},
  {prompt:'好きな香りは？',type:'text'},
  {prompt:'行列が短ければ新しいお店に入る？',type:'boolean'},
  {prompt:'気軽なプレゼントでもらうとうれしいものは？',type:'single',options:['お菓子','飲み物','文房具','小さな雑貨']},
  {prompt:'外で見つけると少しうれしいものは？',type:'text'},
  {prompt:'写真を撮るのは好き？',type:'boolean'},
];

/** Prefer unused app questions; once the full deck is exhausted, start a fresh cycle. */
export function availableSurveyPromptIndices(used: unknown): number[] {
  const usedIndices = new Set(Array.isArray(used)
    ? used.filter((value): value is number => Number.isInteger(value) && value >= 0 && value < SURVEY_PROMPTS.length)
    : []);
  const available = SURVEY_PROMPTS.map((_, index) => index).filter((index) => !usedIndices.has(index));
  return available.length ? available : SURVEY_PROMPTS.map((_, index) => index);
}

export function chooseSurveyPromptIndex(
  used: unknown,
  randomIndex: (length: number) => number = (length) => Math.floor(Math.random() * length),
): number {
  const available = availableSurveyPromptIndices(used);
  const selected = Math.min(available.length - 1, Math.max(0, Math.floor(randomIndex(available.length))));
  return available[selected];
}
