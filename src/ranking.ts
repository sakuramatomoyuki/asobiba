/** Competition ranking: tied scores share a rank and the next rank is skipped. */
export function rankPosition<T>(items: T[], index: number, score: (item: T) => number): number {
  if (index <= 0) return 1;
  if (score(items[index]) === score(items[index - 1])) {
    return rankPosition(items, index - 1, score);
  }
  return index + 1;
}
