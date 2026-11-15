export type PartyGameId = 'majority'|'ito'|'lateral'|'hyperbomber'|'untilmatch';
export const PARTY_GAME_IDS: readonly PartyGameId[] = ['majority','ito','lateral','hyperbomber','untilmatch'];
export const PARTY_GAME_DEFAULTS: Record<PartyGameId, Record<string, unknown>> = {
  majority: { rounds: 5, pointsEnabled: true, addRoomPoints: true },
  ito: { rounds: 1, pointsEnabled: true, addRoomPoints: true },
  lateral: { pointsEnabled: true, addRoomPoints: true },
  hyperbomber: { turnSeconds: 15, pointsEnabled: true, addRoomPoints: true },
  untilmatch: { matchStreak: 1, maxRounds: 10, pointsEnabled: true, addRoomPoints: true },
};
export const MAJORITY_PROMPTS = [
  '休日にするなら、家でのんびり？外へお出かけ？', '朝型と夜型、なれるならどっち？', '旅行は計画派？その場で決める派？',
  '一生食べるなら、米料理？麺料理？', 'もらうなら、自由な時間？自由に使えるお金？', '夏と冬、暮らしやすいのはどっち？',
  '連絡は電話？メッセージ？', '遊園地で最初に乗るなら、絶叫系？ゆったり系？',
];
export const ITO_THEMES = ['食べ物のおいしさ','うれしさ','高級感','怖さ','便利さ','テンションが上がる度合い','子どもに人気','見つけた時の珍しさ'];
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
