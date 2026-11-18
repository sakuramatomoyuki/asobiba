/** Public player fields a player-host needs for management controls. */
export function safeManagerPlayerList(players: Array<Record<string, any>>) {
  return players.map((player) => ({
    uid: player.uid,
    name: player.name,
    alive: Boolean(player.alive),
    connected: Boolean(player.connected),
    hold: Boolean(player.hold),
    device: player.device || 'personal',
    ready: Boolean(player.ready),
    ...(player.disconnectedAt ? { disconnectedAt: player.disconnectedAt } : {}),
    ...(player.disconnectedPhase ? { disconnectedPhase: player.disconnectedPhase } : {}),
  }));
}

/**
 * A room manager may control a rotating lateral-thinking game without being
 * its current GM. Keep that management snapshot from exposing unreleased
 * solutions or submissions. Wrong guesses are intentionally public in this
 * game, so those can remain visible to the manager as well.
 */
export function safeLateralManagerSnapshot(
  game: Record<string, any>,
  isAssignedGm: boolean,
  phase: string,
) {
  const snapshot = { ...game };
  if (isAssignedGm) return snapshot;

  delete snapshot.pendingAttempt;
  delete snapshot.quizChoices;

  if (phase !== 'lateral-result') delete snapshot.solution;

  snapshot.attempts = (Array.isArray(game.attempts) ? game.attempts : [])
    .filter((attempt: Record<string, any>) => attempt?.correct === false)
    .map((attempt: Record<string, any>) => ({
      uid: attempt.uid,
      name: attempt.name,
      answer: attempt.answer,
      correct: false,
    }));

  return snapshot;
}

/** Ogiri submissions and individual ratings are exposed only through the
 * phase-aware public game view, never through the manager control snapshot. */
export function safeOgiriManagerSnapshot(game: Record<string, any>, phase: string) {
  const snapshot = { ...game };
  for (const key of [
    'answers',
    'ratings',
    'answerOrder',
    'answerResults',
    'revealOrder',
    'revealIndex',
    'revealPublished',
  ]) delete snapshot[key];
  if (phase !== 'ogiri-result') {
    for (const key of ['roundScores', 'gameScores', 'finalRanking', 'roundRanking', 'eliminated']) {
      delete snapshot[key];
    }
  }
  return snapshot;
}

/** The non-playing manager may know who is in the minority, but not their
 * private words, ballots, or reversal guesses before the public result. */
export function safeWordWolfManagerSnapshot(game: Record<string, any>, phase: string) {
  const snapshot = { ...game };
  delete snapshot.privateWords;
  delete snapshot.guesses;
  delete snapshot.votes;
  delete snapshot.ready;

  if (phase !== 'wordwolf-result') {
    delete snapshot.majorityWord;
    delete snapshot.minorityWord;
    delete snapshot.results;
    if (phase !== 'wordwolf-caught') delete snapshot.voteLeaderUids;
    if (snapshot.settings && typeof snapshot.settings === 'object') {
      snapshot.settings = { ...snapshot.settings };
      delete snapshot.settings.topicA;
      delete snapshot.settings.topicB;
    }
  }

  return snapshot;
}
