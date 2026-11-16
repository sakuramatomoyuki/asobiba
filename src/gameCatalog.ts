/** Shared vocabulary and safe defaults for the games hosted in one room. */
export type GameId = 'jinrou' | 'wordwolf' | 'ogiri' | 'survey' | 'majority' | 'ito' | 'lateral' | 'hyperbomber' | 'untilmatch';

export type GameCatalogEntry = {
  id: GameId;
  name: string;
  shortDescription: string;
  players: string;
  atmosphere: 'medieval' | 'stage' | 'bright';
  available: boolean;
};

export const GAME_CATALOG: readonly GameCatalogEntry[] = [
  { id: 'jinrou', name: '人狼', shortDescription: '村に隠れた人狼を見つけよう。', players: '3〜20人', atmosphere: 'medieval', available: true },
  { id: 'wordwolf', name: 'ワードウルフ', shortDescription: '会話から少数派のお題を見抜こう。', players: '3人以上', atmosphere: 'medieval', available: true },
  { id: 'ogiri', name: '大喜利', shortDescription: 'お題に答えて、みんなで笑いを採点。', players: '3人以上', atmosphere: 'stage', available: true },
  { id: 'survey', name: '匿名アンケート', shortDescription: '匿名の答えを集めて、みんなの傾向を見よう。', players: '3人以上', atmosphere: 'bright', available: true },
  { id: 'majority', name: 'マジョリティパーティー', shortDescription: 'みんなの答えを予想して、多数派を狙おう。', players: '3人以上', atmosphere: 'bright', available: true },
  { id: 'ito', name: 'クモノイト（ito）', shortDescription: '数字を言わずに、感覚をつないで順番に並べよう。', players: '3人以上', atmosphere: 'bright', available: true },
  { id: 'lateral', name: '水平思考クイズ', shortDescription: 'はい／いいえの質問で、物語の謎を解こう。', players: '3人以上', atmosphere: 'bright', available: true },
  { id: 'hyperbomber', name: 'ハイパーボンバー', shortDescription: 'お題に素早く回答。詰まる前にパスをつなごう。', players: '3人以上', atmosphere: 'stage', available: true },
  { id: 'untilmatch', name: '一致するまで終われまてん', shortDescription: '全員の答えがそろうまで、心を合わせよう。', players: '3人以上', atmosphere: 'bright', available: true },
] as const;

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

export const DEFAULT_SURVEY: SurveySettings = { source: 'sequential', maxQuestions: 20 };

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
