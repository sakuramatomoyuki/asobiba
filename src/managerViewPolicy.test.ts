import { describe, expect, it } from 'vitest';
import { safeLateralManagerSnapshot, safeManagerPlayerList, safeOgiriManagerSnapshot, safeWordWolfManagerSnapshot } from '../functions/src/managerViewPolicy.js';

describe('player-host management view', () => {
  it('keeps disconnect and lobby controls while stripping roles and private action data', () => {
    const [player] = safeManagerPlayerList([{
      uid: 'p1', name: 'Host', alive: true, connected: false, hold: true,
      device: 'personal', ready: true, disconnectedAt: 123, disconnectedPhase: 'night',
      role: '人狼', secret: { target: 'p2' }, votes: { p1: 'p2' },
    }]);

    expect(player).toEqual({
      uid: 'p1', name: 'Host', alive: true, connected: false, hold: true,
      device: 'personal', ready: true, disconnectedAt: 123, disconnectedPhase: 'night',
    });
    expect(player).not.toHaveProperty('role');
    expect(player).not.toHaveProperty('secret');
    expect(player).not.toHaveProperty('votes');
  });

  it('does not expose a rotating lateral GM\'s solution or pending/correct guesses to the room manager', () => {
    const game = safeLateralManagerSnapshot({
      solution: '秘密の真相',
      quizChoices: [{ title: '候補', solution: '未公開の候補' }],
      pendingAttempt: { uid: 'p1', answer: '判定待ちの回答' },
      attempts: [
        { uid: 'p1', name: 'A', answer: '不正解の回答', correct: false },
        { uid: 'p2', name: 'B', answer: '正解の回答', correct: true },
      ],
    }, false, 'lateral-play');

    expect(game).not.toHaveProperty('solution');
    expect(game).not.toHaveProperty('quizChoices');
    expect(game).not.toHaveProperty('pendingAttempt');
    expect(game.attempts).toEqual([{ uid: 'p1', name: 'A', answer: '不正解の回答', correct: false }]);
  });

  it('keeps the assigned GM view intact and reveals the solution after the result phase', () => {
    const game = { solution: '真相', quizChoices: [], pendingAttempt: { answer: '解答' }, attempts: [] };
    expect(safeLateralManagerSnapshot(game, true, 'lateral-play')).toEqual(game);
    expect(safeLateralManagerSnapshot(game, false, 'lateral-result').solution).toBe('真相');
  });

  it('keeps unreleased Ogiri answers and individual ratings out of the manager control snapshot', () => {
    const game = {
      answers: { p1: { text: '未発表の回答' } },
      ratings: { p2: { p1: 'funny' } },
      answerOrder: ['p1'],
      answerResults: [{ uid: 'p1', text: '内部結果' }],
      revealOrder: ['p1'],
      revealIndex: 0,
      revealPublished: { p1: false },
      roundScores: { p1: { gamePoints: 4 } },
      round: 1,
    };
    const snapshot = safeOgiriManagerSnapshot(game, 'ogiri-judge');

    expect(snapshot).toEqual({ round: 1 });
    expect(safeOgiriManagerSnapshot(game, 'ogiri-result').roundScores).toEqual(game.roundScores);
  });

  it('shows Word Wolf minority identities but withholds words, ballots, and guesses until the public result', () => {
    const snapshot = safeWordWolfManagerSnapshot({
      minorityUids: ['minority'],
      privateWords: { majority: '映画館', minority: '劇場' },
      majorityWord: '映画館',
      minorityWord: '劇場',
      guesses: { minority: '映画館' },
      votes: { majority: 'minority' },
      results: [{ uid: 'minority', side: 'minority', word: '劇場' }],
      ready: { majority: true },
      settings: { topicA: '映画館', topicB: '劇場' },
    }, 'wordwolf-vote');

    expect(snapshot.minorityUids).toEqual(['minority']);
    expect(snapshot).not.toHaveProperty('privateWords');
    expect(snapshot).not.toHaveProperty('majorityWord');
    expect(snapshot).not.toHaveProperty('minorityWord');
    expect(snapshot).not.toHaveProperty('guesses');
    expect(snapshot).not.toHaveProperty('votes');
    expect(snapshot).not.toHaveProperty('results');
    expect(snapshot.settings).not.toHaveProperty('topicA');
    expect(snapshot.settings).not.toHaveProperty('topicB');
  });
});
