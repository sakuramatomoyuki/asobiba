import { describe, expect, it } from 'vitest';
import { anonymousSurveyResults, canSetSurveyQuestion, nextSurveyQuestionAuthor, normalizeSurveyAnswer, surveyManagerView, validateSurveyQuestion } from '../functions/src/surveyRules.js';

describe('anonymous survey server rules', () => {
  const single = { id: 'q1', prompt: '好きな季節は？', type: 'single' as const, options: ['春', '夏'] };
  it('validates prompts and bounded, unique options', () => {
    expect(validateSurveyQuestion(single)).toBeNull();
    expect(validateSurveyQuestion({ ...single, options: ['春', '春'] })).toContain('重複');
    expect(validateSurveyQuestion({ ...single, prompt: 'x'.repeat(121) })).toContain('120文字');
  });
  it('accepts only answers valid for the question type', () => {
    expect(normalizeSurveyAnswer(single, '春')).toBe('春');
    expect(normalizeSurveyAnswer(single, '冬')).toBeNull();
    expect(normalizeSurveyAnswer({ ...single, type: 'multiple' }, ['春', '夏', '春'])).toEqual(['春', '夏']);
    expect(normalizeSurveyAnswer({ ...single, type: 'text' }, '自由回答')).toBe('自由回答');
    expect(normalizeSurveyAnswer({ ...single, type: 'boolean' }, 'いいえ')).toBe('いいえ');
  });
  it('keeps sequential question creation on the assigned player, even when the host is a manager', () => {
    expect(canSetSurveyQuestion('sequential', 'assigned', 'assigned', false)).toBe(true);
    expect(canSetSurveyQuestion('sequential', 'host', 'assigned', true)).toBe(false);
    expect(canSetSurveyQuestion('sequential', 'other', 'assigned', false)).toBe(false);
    expect(canSetSurveyQuestion('host', 'host', 'host', true)).toBe(true);
    expect(canSetSurveyQuestion('host', 'assigned', 'host', false)).toBe(false);
  });
  it('rotates question authors beyond the initial roster length and skips unavailable players', () => {
    const players = Object.fromEntries(['A','B','C','D'].map(uid => [uid, { uid, connected: true, alive: true, hold: false }]));
    expect(nextSurveyQuestionAuthor(['A','B','C','D'], 4, players)).toBe('A');
    players.A.connected = false;
    expect(nextSurveyQuestionAuthor(['A','B','C','D'], 4, players)).toBe('B');
  });
  it('continues after the player who actually authored the last question', () => {
    const players = Object.fromEntries(['A','B','C','D'].map(uid => [uid, { uid, connected: true, alive: true, hold: false }]));
    expect(nextSurveyQuestionAuthor(['A','B','C','D'], 0, players)).toBe('A');
    players.A.connected = false;
    const skippedTurnAuthor = nextSurveyQuestionAuthor(['A','B','C','D'], 1, players, 'A');
    expect(skippedTurnAuthor).toBe('B');
    expect(nextSurveyQuestionAuthor(['A','B','C','D'], 2, players, skippedTurnAuthor)).toBe('C');
    expect(nextSurveyQuestionAuthor(['A','B','C','D'], 3, players, 'C')).toBe('D');
  });
  it('recovers an author from the active roster when a stored question order is missing or stale', () => {
    const players = {
      A: { uid: 'A', connected: false, alive: true, hold: false },
      B: { uid: 'B', connected: true, alive: true, hold: false },
    };
    expect(nextSurveyQuestionAuthor(undefined, 0, players)).toBe('B');
    expect(nextSurveyQuestionAuthor(['A'], 1, players)).toBe('B');
    expect(nextSurveyQuestionAuthor(['A', 'A'], 8, players)).toBe('B');
  });
  it('returns anonymous option aggregates or unlabeled text answers', () => {
    const result: any = anonymousSurveyResults(single, { user1: '春', user2: '春', user3: '夏' });
    expect(result.counts).toEqual({ 春: 2, 夏: 1 });
    expect(result.percentages).toEqual({ 春: 67, 夏: 33 });
    expect(result).not.toHaveProperty('user1');
    expect(anonymousSurveyResults({ ...single, type: 'text' }, { user1: '回答' })).toEqual({ responseCount: 1, responses: ['回答'] });
  });
  it('shuffles free-text answers before publishing them without respondent identifiers', () => {
    const result: any = anonymousSurveyResults(
      { ...single, type: 'text' },
      { user1: '一人目の回答', user2: '二人目の回答', user3: '三人目の回答' },
      () => 0,
    );
    expect(result).toEqual({ responseCount: 3, responses: ['二人目の回答', '三人目の回答', '一人目の回答'] });
    expect(result).not.toHaveProperty('user1');
    expect(result).not.toHaveProperty('user2');
    expect(result).not.toHaveProperty('user3');
  });
  it('never returns respondent identifiers or raw in-progress answers to managers', () => {
    const view = surveyManagerView({
      source: 'sequential', maxQuestions: 5, questionIndex: 0,
      currentQuestion: { ...single, answers: { privateUidA: 'private-answer-A', privateUidB: 'private-answer-B' } },
      questions: [],
    });
    const currentQuestion = view.currentQuestion!;
    expect(currentQuestion.responseCount).toBe(2);
    expect(currentQuestion).not.toHaveProperty('answers');
    expect(JSON.stringify(view)).not.toContain('privateUid');
    expect(JSON.stringify(view)).not.toContain('private-answer');
  });
});
