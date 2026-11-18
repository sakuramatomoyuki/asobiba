/** Shared vocabulary and safe defaults for the games hosted in one room. */
import { gameSupportsDeviceMode, minimumPlayersForGame, supportedDeviceModes } from '../functions/src/gameRules';
export type GameId = 'jinrou' | 'wordwolf' | 'ogiri' | 'survey' | 'majority' | 'ito' | 'lateral' | 'untilmatch';

export type GameCatalogEntry = {
  id: GameId;
  name: string;
  shortDescription: string;
  /** A plain-language cue that lets a first-time player choose by feel. */
  mood: string;
  mark: string;
  players: string;
  deviceModes: readonly ('individual' | 'shared' | 'hybrid')[];
  atmosphere: 'medieval' | 'stage' | 'bright';
  available: boolean;
};

export const GAME_CATALOG: readonly GameCatalogEntry[] = [
  { id: 'jinrou', name: '人狼', shortDescription: '会話と投票で人狼を探し、市民陣営の勝利を目指す正体隠匿ゲーム。', mood: '推理・駆け引き', mark: '☾', players: `${minimumPlayersForGame('jinrou')}〜20人`, deviceModes: gameDeviceModes('jinrou'), atmosphere: 'medieval', available: true },
  { id: 'wordwolf', name: 'ワードウルフ', shortDescription: '自分のお題を隠して会話し、違うお題を持つ人を見つけます。', mood: '会話・少数派探し', mark: '♧', players: `${minimumPlayersForGame('wordwolf')}〜20人`, deviceModes: gameDeviceModes('wordwolf'), atmosphere: 'medieval', available: true },
  { id: 'ogiri', name: '大喜利', shortDescription: 'お題に文字や絵で答え、発表と採点を楽しみます。', mood: 'ひらめき・リアクション', mark: '✦', players: `${minimumPlayersForGame('ogiri')}〜20人`, deviceModes: gameDeviceModes('ogiri'), atmosphere: 'stage', available: true },
  { id: 'survey', name: '匿名アンケート', shortDescription: '匿名で質問に答え、みんなの回答傾向を見ます。勝敗なし。', mood: '匿名回答・発見', mark: '▤', players: `${minimumPlayersForGame('survey')}〜20人`, deviceModes: gameDeviceModes('survey'), atmosphere: 'bright', available: true },
  { id: 'majority', name: 'マジョリティパーティー', shortDescription: '親の二択を聞き、自分が選びたい方へ投票。結果に応じて点が動きます。', mood: '究極の二択・駆け引き', mark: '⇄', players: `${minimumPlayersForGame('majority')}〜20人`, deviceModes: gameDeviceModes('majority'), atmosphere: 'bright', available: true },
  { id: 'ito', name: 'クモノイト（ito）', shortDescription: '数字とテーマを確認し、みんなで相談して小さい順に並べます。', mood: '協力・感覚合わせ', mark: '①', players: `${minimumPlayersForGame('ito')}〜20人`, deviceModes: gameDeviceModes('ito'), atmosphere: 'bright', available: true },
  { id: 'lateral', name: '水平思考クイズ', shortDescription: '司会役に質問して手がかりを集め、謎の真相を推理します。', mood: '質問・謎解き', mark: '?', players: `${minimumPlayersForGame('lateral')}〜20人`, deviceModes: gameDeviceModes('lateral'), atmosphere: 'bright', available: true },
  { id: 'untilmatch', name: '一致するまで終われまてん', shortDescription: '全員の答えを一斉公開。言い方が違っても、意味が同じならホスト判定で一致にできる協力ゲームです。', mood: '連想・チームワーク', mark: '≋', players: `${minimumPlayersForGame('untilmatch')}〜20人`, deviceModes: gameDeviceModes('untilmatch'), atmosphere: 'bright', available: true },
] as const;

export function gameDeviceModes(gameId: GameId): GameCatalogEntry['deviceModes'] {
  return supportedDeviceModes(gameId);
}

export function gameDeviceModeHint(game: Pick<GameCatalogEntry, 'deviceModes'>): string {
  const labels: Record<GameCatalogEntry['deviceModes'][number], string> = {
    individual: '各自の端末',
    shared: '共有端末',
    hybrid: '併用',
  };
  if (game.deviceModes.length === 3) return '各自の端末・共有端末・併用に対応';
  if (game.deviceModes.length === 1) return `${labels[game.deviceModes[0]]}のみ対応`;
  return `${game.deviceModes.map((mode) => labels[mode]).join('・')}に対応`;
}

/** Give players a concrete next step when a room's device mode cannot run a game. */
export function gameDeviceModeUnavailableMessage(gameId: string, method: string): string {
  const game = GAME_CATALOG.find((entry) => entry.id === gameId);
  if (!game || gameSupportsDeviceMode(gameId, method)) return '';
  const availableModes: Record<GameCatalogEntry['deviceModes'][number], string> = {
    individual: '各自の端末',
    shared: '共有端末',
    hybrid: '併用',
  };
  const roomModes: Record<string, string> = {
    individual: '各自の端末',
    shared: '共有端末',
    hybrid: '併用',
  };
  const supported = game.deviceModes.map((mode) => `「${availableModes[mode]}」`).join('・');
  const current = roomModes[method] || '不明な';
  return `${game.name}は${supported}方式のみ対応です。今のルームは「${current}」方式です。対応する方式で新しいルームを作成してください。`;
}

export type WordWolfSettings = {
  discussionSeconds: number;
  voteSeconds: number;
  minorityCount: number | 'quarter';
  wordSource: 'app' | 'host';
  minorityChatSeconds: number;
};

export type OgiriSettings = {
  mode: 'survive' | 'knockout' | 'normal';
  scoring: 'fun' | 'ten-point';
  threshold: number;
  questionCount: number | 'infinite';
  inputMode: 'text' | 'drawing' | 'either';
  judgeMode: 'host' | 'all';
  answerFlow: 'buzz' | 'batch';
  promptSource: 'app' | 'host';
  pointsEnabled: boolean;
  addRoomPoints: boolean;
};

export type SurveyQuestionType = 'single' | 'multiple' | 'text' | 'boolean';
export type SurveySettings = { source: 'host' | 'sequential'; maxQuestions: number | 'infinite' };

export const DEFAULT_WORD_WOLF: WordWolfSettings = {
  discussionSeconds: 60,
  voteSeconds: 30,
  minorityCount: 'quarter',
  wordSource: 'app',
  minorityChatSeconds: 60,
};

export const DEFAULT_OGIRI: OgiriSettings = {
  mode: 'normal',
  scoring: 'fun',
  threshold: 0.5,
  questionCount: 5,
  inputMode: 'either',
  judgeMode: 'all',
  answerFlow: 'batch',
  promptSource: 'app',
  pointsEnabled: true,
  addRoomPoints: true,
};

export const DEFAULT_SURVEY: SurveySettings = { source: 'sequential', maxQuestions: 5 };

export function validateWordWolfSettings(value: Partial<WordWolfSettings>): string | null {
  for (const [name, seconds] of [['議論時間', value.discussionSeconds], ['投票時間', value.voteSeconds]] as const) {
    if (typeof seconds !== 'number' || seconds < 30 || seconds > 300 || seconds % 30 !== 0) {
      return `${name}は30秒から5分まで、30秒単位で設定してください。`;
    }
  }
  if (value.minorityCount !== 'quarter' && (!Number.isInteger(value.minorityCount) || Number(value.minorityCount) < 1)) {
    return '少数派の人数を確認してください。';
  }
  return null;
}

export function defaultMinorityCount(playerCount: number): number {
  return Math.max(1, Math.floor(Math.max(0, playerCount) / 4));
}

export function surveyQuestionIsValid(type: SurveyQuestionType, prompt: string, options: string[]): boolean {
  const text = prompt.trim();
  if (!text || text.length > 120) return false;
  if (type === 'text' || type === 'boolean') return true;
  const choices = options.map((option) => option.trim()).filter(Boolean);
  return choices.length >= 2 && choices.length <= 10 && new Set(choices).size === choices.length;
}

export function rankByRoomPoints<T extends { points: number }>(players: T[]): Array<T & { rank: number }> {
  let previous: number | undefined;
  let rank = 0;
  return [...players]
    .sort((a, b) => b.points - a.points)
    .map((player, index) => {
      if (previous !== player.points) rank = index + 1;
      previous = player.points;
      return { ...player, rank };
    });
}
