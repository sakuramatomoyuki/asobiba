export type SurveyQuestion = { id: string; prompt: string; type: 'single' | 'multiple' | 'text' | 'boolean'; options: string[] };
export type SurveyAnswer = string | string[];
type SurveyPlayerState = { uid: string; connected?: boolean; alive?: boolean; hold?: boolean };

/** Finds the next sequential question author, recovering from stale room rosters. */
export function nextSurveyQuestionAuthor(
  rawOrder: unknown,
  rawQuestionIndex: unknown,
  players: Record<string, SurveyPlayerState>,
  previousAuthorUid?: unknown,
): string | null {
  const order = Array.isArray(rawOrder)
    ? [...new Set(rawOrder.filter((uid): uid is string => typeof uid === 'string' && Boolean(players[uid])))]
    : [];
  const eligible = (uid: string) => Boolean(players[uid]?.connected && players[uid]?.alive && !players[uid]?.hold);
  const activeRoster = Object.values(players).filter(player => eligible(player.uid)).map(player => player.uid);
  // Preserve the randomized order created at game start, but include any
  // currently active player missing from an old or partially written roster.
  // Without this merge, one valid stored UID could prevent every omitted
  // participant from ever receiving a question-author turn.
  const rotation = [...order, ...activeRoster.filter(uid => !order.includes(uid))];
  const index = Number.isFinite(Number(rawQuestionIndex)) ? Math.trunc(Number(rawQuestionIndex)) : 0;
  const previousIndex = typeof previousAuthorUid === 'string' ? rotation.indexOf(previousAuthorUid) : -1;
  const startIndex = previousIndex >= 0 ? previousIndex + 1 : index;
  const start = ((startIndex % Math.max(1, rotation.length)) + Math.max(1, rotation.length)) % Math.max(1, rotation.length);
  for (let offset = 0; offset < rotation.length; offset++) {
    const uid = rotation[(start + offset) % rotation.length];
    if (eligible(uid)) return uid;
  }
  // If every entry in the stored order is inactive, assign the turn from the
  // live roster instead of leaving the question phase without an author.
  if (!activeRoster.length) return null;
  const previousActiveIndex = typeof previousAuthorUid === 'string' ? activeRoster.indexOf(previousAuthorUid) : -1;
  const activeStart = previousActiveIndex >= 0 ? previousActiveIndex + 1 : index;
  return activeRoster[((activeStart % activeRoster.length) + activeRoster.length) % activeRoster.length];
}

/** Sequential questions belong only to the assigned player; manager privileges do not override the turn. */
export function canSetSurveyQuestion(source: unknown, uid: string, authorUid: string | null, isManager: boolean): boolean {
  if (source === 'host') return isManager && uid === authorUid;
  return source === 'sequential' && Boolean(authorUid) && uid === authorUid;
}

export function validateSurveyQuestion(question: Partial<SurveyQuestion>): string | null {
  const prompt = String(question.prompt || '').trim();
  if (!prompt || prompt.length > 120) return '質問文は1〜120文字で入力してください。';
  if (!['single', 'multiple', 'text', 'boolean'].includes(String(question.type))) return '回答形式を選んでください。';
  if (question.type === 'single' || question.type === 'multiple') {
    const options = (question.options || []).map((option) => String(option).trim()).filter(Boolean);
    if (options.length < 2 || options.length > 10 || new Set(options).size !== options.length || options.some((option) => option.length > 80)) return '選択肢は重複なしで2〜10個、各80文字以内にしてください。';
  }
  return null;
}

export function normalizeSurveyAnswer(question: SurveyQuestion, raw: unknown): SurveyAnswer | null {
  if (question.type === 'text') {
    const value = String(raw || '').trim();
    return value && value.length <= 80 ? value : null;
  }
  if (question.type === 'boolean') return raw === true || raw === 'はい' ? 'はい' : raw === false || raw === 'いいえ' ? 'いいえ' : null;
  const allowed = new Set(question.options);
  if (question.type === 'single') return typeof raw === 'string' && allowed.has(raw) ? raw : null;
  if (question.type === 'multiple' && Array.isArray(raw)) {
    const values = [...new Set(raw.map(String))];
    return values.length > 0 && values.length <= 10 && values.every((value) => allowed.has(value)) ? values : null;
  }
  return null;
}

/** Produces anonymous, aggregate-only results. No respondent IDs or names leave this helper. */
export function anonymousSurveyResults(
  question: SurveyQuestion,
  answers: Record<string, SurveyAnswer>,
  randomIndex: (maxExclusive: number) => number = (maxExclusive) => Math.floor(Math.random() * maxExclusive),
) {
  const values = Object.values(answers);
  if (question.type === 'text') {
    const responses = values.map(String);
    for (let index = responses.length - 1; index > 0; index--) {
      const selected = Math.max(0, Math.min(index, Math.trunc(randomIndex(index + 1))));
      [responses[index], responses[selected]] = [responses[selected], responses[index]];
    }
    return { responseCount: responses.length, responses };
  }
  const counts = Object.fromEntries(question.type === 'boolean' ? ['はい', 'いいえ'].map((choice) => [choice, 0]) : question.options.map((choice) => [choice, 0]));
  for (const value of values) for (const choice of Array.isArray(value) ? value : [String(value)]) if (choice in counts) counts[choice]++;
  return { responseCount: values.length, counts, percentages: Object.fromEntries(Object.entries(counts).map(([choice, count]) => [choice, values.length ? Math.round((Number(count) / values.length) * 100) : 0])) };
}

/** Manager progress may expose response counts and closed aggregates, never respondent IDs or raw answers. */
export function surveyManagerView(game: any) {
  const questionView = (question: any) => question ? {
    id: String(question.id || ''),
    prompt: String(question.prompt || ''),
    type: question.type,
    options: Array.isArray(question.options) ? question.options.map(String) : [],
    responseCount: Object.keys(question.answers || {}).length,
    results: question.results || null,
  } : null;
  return {
    type: 'survey',
    source: game?.source === 'host' ? 'host' : 'sequential',
    // Preserve the unbounded setting in manager snapshots; coercing the string
    // "infinite" to a number silently turned it into 0 questions.
    maxQuestions: game?.maxQuestions === 'infinite'
      ? 'infinite'
      : Math.max(0, Number(game?.maxQuestions) || 0),
    questionIndex: Number(game?.questionIndex) || 0,
    questions: (Array.isArray(game?.questions) ? game.questions : []).map(questionView),
    currentQuestion: questionView(game?.currentQuestion),
    finished: Boolean(game?.finished),
    startedAt: Number(game?.startedAt) || 0,
  };
}
