import { describe, expect, it } from 'vitest';
import {
  DEFAULT_WORD_WOLF,
  GAME_CATALOG,
  defaultMinorityCount,
  rankByRoomPoints,
  surveyQuestionIsValid,
  validateWordWolfSettings,
} from './gameCatalog';
import { availableSurveyPromptIndices, chooseSurveyPromptIndex, SURVEY_PROMPTS } from '../functions/src/surveyPrompts';
import { GAME_GUIDES } from './GameGuides';

describe('multi-game catalog and shared setup rules', () => {
  it('lists each planned game exactly once', () => {
    expect(GAME_CATALOG.map((game) => game.id)).toEqual(['jinrou', 'wordwolf', 'ogiri', 'survey', 'majority', 'ito', 'lateral', 'untilmatch']);
  });

  it('gives every game a beginner guide with a goal, first move, steps, and tips', () => {
    expect(GAME_GUIDES.map((guide) => guide.id).sort()).toEqual(GAME_CATALOG.map((game) => game.id).sort());
    for (const guide of GAME_GUIDES) {
      expect(guide.name.trim(), `${guide.id} guide name`).not.toBe('');
      expect(guide.summary.trim(), `${guide.id} summary`).not.toBe('');
      expect(guide.aim.trim(), `${guide.id} goal`).not.toBe('');
      expect(guide.firstMove.trim(), `${guide.id} first move`).not.toBe('');
      expect(guide.steps.length, `${guide.id} steps`).toBeGreaterThanOrEqual(2);
      expect(guide.tips.length, `${guide.id} tips`).toBeGreaterThan(0);
    }
  });

  it('shows two-player minimums for the small-group games and omits Hyperbomber', () => {
    const games = Object.fromEntries(GAME_CATALOG.map((game) => [game.id, game]));
    expect(games.ogiri.players).toBe('2〜20人');
    expect(games.lateral.players).toBe('2〜20人');
    expect(games.untilmatch.players).toBe('2〜20人');
    expect(GAME_CATALOG.some((game) => String(game.id) === 'hyperbomber')).toBe(false);
  });

  it('uses a quarter of players, rounded down, for the suggested minority', () => {
    expect(defaultMinorityCount(3)).toBe(1);
    expect(defaultMinorityCount(8)).toBe(2);
    expect(defaultMinorityCount(20)).toBe(5);
  });

  it('starts Word Wolf at one minute of discussion and thirty seconds of voting', () => {
    expect(DEFAULT_WORD_WOLF.discussionSeconds).toBe(60);
    expect(DEFAULT_WORD_WOLF.voteSeconds).toBe(30);
    expect(validateWordWolfSettings(DEFAULT_WORD_WOLF)).toBeNull();
    expect(validateWordWolfSettings({ ...DEFAULT_WORD_WOLF, voteSeconds: 45 })).toContain('30秒単位');
  });

  it('validates survey question options and hides duplicate choices', () => {
    expect(surveyQuestionIsValid('single', '好きな季節は？', ['春', '夏'])).toBe(true);
    expect(surveyQuestionIsValid('multiple', '好きな季節は？', ['春', '春'])).toBe(false);
    expect(surveyQuestionIsValid('text', 'ひとこと', [])).toBe(true);
  });

  it('keeps a varied, valid anonymous-survey prompt bank without duplicate questions', () => {
    expect(SURVEY_PROMPTS).toHaveLength(48);
    expect(new Set(SURVEY_PROMPTS.map((entry) => entry.prompt)).size).toBe(48);
    expect(new Set(SURVEY_PROMPTS.map((entry) => entry.type))).toEqual(new Set(['single', 'multiple', 'text', 'boolean']));
    for (const entry of SURVEY_PROMPTS) {
      expect(surveyQuestionIsValid(entry.type, entry.prompt, entry.options || [])).toBe(true);
    }
  });

  it('offers only unused app questions until a new prompt cycle is needed', () => {
    expect(availableSurveyPromptIndices([0, 2, '3', -1])).toEqual(
      SURVEY_PROMPTS.map((_, index) => index).filter((index) => index !== 0 && index !== 2),
    );
    expect(chooseSurveyPromptIndex([0, 1], () => 0)).toBe(2);
    expect(availableSurveyPromptIndices(SURVEY_PROMPTS.map((_, index) => index))).toHaveLength(SURVEY_PROMPTS.length);
  });

  it('assigns tied overall standings the same rank and skips the next rank', () => {
    expect(rankByRoomPoints([{ name: 'A', points: 10 }, { name: 'B', points: 10 }, { name: 'C', points: 8 }]))
      .toEqual([{ name: 'A', points: 10, rank: 1 }, { name: 'B', points: 10, rank: 1 }, { name: 'C', points: 8, rank: 3 }]);
  });
});
