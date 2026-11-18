import { describe, expect, it } from 'vitest';
import { canJudgeUntilMatch, isYesNoQuestion, itoOrderIsCorrect, publicUntilMatchResults, resolveMajorityRound, ITO_THEMES, MAJORITY_PROMPTS, mergePartyGameSettings, normalizePartyAnswer, PARTY_GAME_IDS, samePartyAnswer, UNTIL_MATCH_PROMPTS } from './partyGameRules';

describe('party game rules', () => {
  it('registers the four additional party games', () => {
    expect(PARTY_GAME_IDS).toEqual(['majority', 'ito', 'lateral', 'untilmatch']);
  });
  it('settles majority-party votes, parent transfers, and zero-balance protection', () => {
    expect(resolveMajorityRound(
      { parent: false, a: false, b: true, c: true, d: true },
      'parent',
      { parent: 1, a: 0, b: 0, c: 2, d: 0 },
    )).toEqual({
      yes: 3, no: 2, tie: false, majorityVote: true,
      deltas: { parent: 0, a: 0, b: 1, c: 1, d: 1 },
    });
  });
  it('uses the parent side to break a tie and still awards the minority transfers', () => {
    const result = resolveMajorityRound(
      { parent: false, a: true, b: false, c: true },
      'parent',
      { parent: 0, a: 2, b: 0, c: 1 },
    );
    expect(result.yes).toBe(2);
    expect(result.no).toBe(2);
    expect(result.majorityVote).toBe(false);
    expect(result.deltas).toEqual({ parent: 3, a: -1, b: 1, c: -1 });
  });
  it('returns no point changes when this game has points disabled', () => {
    expect(resolveMajorityRound({ parent: true, a: false }, 'parent', { parent: 0, a: 3 }, false).deltas)
      .toEqual({ parent: 0, a: 0 });
  });
  it('normalizes Japanese text and recognizes identical answers despite punctuation', () => {
    expect(normalizePartyAnswer('  りんご　です。 ')).toBe('りんご です。');
    expect(samePartyAnswer('りんご！', 'りんご')).toBe(true);
    expect(samePartyAnswer('りんご', 'みかん')).toBe(false);
  });
  it('accepts natural Japanese yes/no questions and gives a useful boundary', () => {
    expect(isYesNoQuestion('職業は関係ありますか')).toBe(true);
    expect(isYesNoQuestion('職業は関係ありますか？')).toBe(true);
    expect(isYesNoQuestion('職業は関係ありますか。')).toBe(true);
    expect(isYesNoQuestion('男は店員ですか？')).toBe(true);
    expect(isYesNoQuestion('彼は店員？')).toBe(true);
    expect(isYesNoQuestion('水を飲みましたか')).toBe(true);
    expect(isYesNoQuestion('職業は？')).toBe(false);
    expect(isYesNoQuestion('犯人は誰？')).toBe(false);
    expect(isYesNoQuestion('犯人は何者？')).toBe(false);
    expect(isYesNoQuestion('なんで店を出たの？')).toBe(false);
    expect(isYesNoQuestion('どこで会いましたか？')).toBe(false);
    expect(isYesNoQuestion('誰かに会いましたか？')).toBe(true);
    expect(isYesNoQuestion('どこかへ行きましたか？')).toBe(true);
    expect(isYesNoQuestion('職業を教えてください')).toBe(false);
    expect(isYesNoQuestion('')).toBe(false);
  });
  it('allows only the room creator to judge a published until-match round, exactly once', () => {
    expect(canJudgeUntilMatch('host', 'host', 'untilmatch-result', false)).toBe(true);
    // A temporary manager transfer does not transfer the host's impartial judging duty.
    expect(canJudgeUntilMatch('delegated-manager', 'host', 'untilmatch-result', false)).toBe(false);
    expect(canJudgeUntilMatch('former-host', 'host', 'untilmatch-result', false)).toBe(false);
    expect(canJudgeUntilMatch('last-voter', 'host', 'untilmatch-result', false)).toBe(false);
    expect(canJudgeUntilMatch('host', 'host', 'untilmatch-answer', false)).toBe(false);
    expect(canJudgeUntilMatch('host', 'host', 'untilmatch-result', true)).toBe(false);
  });
  it('keeps until-match responses hidden while answering and shows every answer after collection', () => {
    const answers = [
      { uid: 'a', name: 'A', answer: '夜食', responded: true },
      { uid: 'b', name: 'B', answer: '夜ごはん', responded: true },
      { uid: 'c', name: 'C', answer: 'お茶漬け', responded: true },
    ];
    expect(publicUntilMatchResults('untilmatch-answer', answers)).toEqual([]);
    expect(publicUntilMatchResults('untilmatch-result', answers)).toEqual(answers);
    expect(publicUntilMatchResults('ended', answers)).toEqual(answers);
    expect(publicUntilMatchResults('untilmatch-result', undefined)).toEqual([]);
  });
  it('provides 30 distinct until-match prompts for a full game without repeats', () => {
    expect(UNTIL_MATCH_PROMPTS).toHaveLength(30);
    expect(new Set(UNTIL_MATCH_PROMPTS).size).toBe(UNTIL_MATCH_PROMPTS.length);
  });
  it('provides about 50 distinct majority-party prompts', () => {
    expect(MAJORITY_PROMPTS.length).toBeGreaterThanOrEqual(50);
    expect(MAJORITY_PROMPTS.length).toBeLessThanOrEqual(60);
    expect(new Set(MAJORITY_PROMPTS).size).toBe(MAJORITY_PROMPTS.length);
  });
  it('checks an ito ordering against each private number', () => {
    const values = { low: 12, middle: 53, high: 91 };
    expect(itoOrderIsCorrect(values, ['low', 'middle', 'high'])).toBe(true);
    expect(itoOrderIsCorrect(values, ['low', 'high', 'middle'])).toBe(false);
    expect(itoOrderIsCorrect(values, ['low', 'low', 'high'])).toBe(false);
  });
  it('offers the full set of 100 distinct ito themes with both scale labels', () => {
    expect(ITO_THEMES).toHaveLength(100);
    expect(new Set(ITO_THEMES.map(({ name }) => name)).size).toBe(100);
    expect(ITO_THEMES.every(({ name, low, high }) => Boolean(name && low && high))).toBe(true);
  });
  it('builds a complete, game-specific settings object and drops stale fields', () => {
    expect(PARTY_GAME_IDS).not.toContain('hyperbomber');
    expect(mergePartyGameSettings('lateral', null, { quizSource: 'host', title: '問題', solution: '答え', gmMode: 'rotate' })).toEqual({
      rounds: 1, gmMode: 'rotate', pointsEnabled: true, addRoomPoints: true,
    });
  });
});
