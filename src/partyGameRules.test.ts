import { describe, expect, it } from 'vitest';
import { itoOrderIsCorrect, majorityPoints, mergePartyGameSettings, normalizePartyAnswer, PARTY_GAME_IDS, samePartyAnswer } from './partyGameRules';

describe('party game rules', () => {
  it('registers the five additional games', () => {
    expect(PARTY_GAME_IDS).toEqual(['majority', 'ito', 'lateral', 'hyperbomber', 'untilmatch']);
  });
  it('gives a point to every player who chose a most common answer', () => {
    expect(majorityPoints({ a: 2, b: 2, c: 1 })).toEqual({ a: 1, b: 1, c: 0 });
  });
  it('normalizes Japanese text and recognizes identical answers despite punctuation', () => {
    expect(normalizePartyAnswer('  りんご　です。 ')).toBe('りんご です。');
    expect(samePartyAnswer('りんご！', 'りんご')).toBe(true);
    expect(samePartyAnswer('りんご', 'みかん')).toBe(false);
  });
  it('checks an ito ordering against each private number', () => {
    const values = { low: 12, middle: 53, high: 91 };
    expect(itoOrderIsCorrect(values, ['low', 'middle', 'high'])).toBe(true);
    expect(itoOrderIsCorrect(values, ['low', 'high', 'middle'])).toBe(false);
    expect(itoOrderIsCorrect(values, ['low', 'low', 'high'])).toBe(false);
  });
  it('builds a complete, game-specific settings object and drops stale fields', () => {
    expect(mergePartyGameSettings('hyperbomber', { rounds: 99 }, { turnSeconds: 30 })).toEqual({
      turnSeconds: 30,
      pointsEnabled: true,
      addRoomPoints: true,
    });
    expect(mergePartyGameSettings('lateral', null, { quizSource: 'host', title: '問題', solution: '答え', gmMode: 'rotate' })).toEqual({
      pointsEnabled: true, addRoomPoints: true,
    });
  });
});
