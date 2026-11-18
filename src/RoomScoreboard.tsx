import type { CSSProperties, ReactNode } from 'react';
import { rankPosition } from './ranking';

type RankingEntry = {
  uid: string;
  name: string;
  points: number;
  role?: string | null;
  alive?: boolean;
  earned?: Record<string, number> | null;
};

export function RoomScoreboard({ entries, showRoles, game, children }: {
  entries: RankingEntry[];
  showRoles: boolean;
  game: string;
  children: ReactNode;
}) {
  return (
    <section className={`room-scoreboard scoreboard-${game}`} aria-labelledby="room-scoreboard-title">
      <h2 id="room-scoreboard-title">ルーム累計ランキング</h2>
      {entries.length === 0 ? (
        <p className="room-scoreboard-empty">まだ順位データがありません。</p>
      ) : (
        <table className="room-scoreboard-table" aria-labelledby="room-scoreboard-title">
          <thead>
            <tr>
              <th scope="col">順位</th>
              <th scope="col">プレイヤー</th>
              <th scope="col">累計 pt</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const rank = rankPosition(entries, index, (item) => Number(item.points) || 0);
              const breakdown = Object.entries(entry.earned ?? {});
              return (
                <tr key={entry.uid} className={rank === 1 ? 'scoreboard-leading' : undefined} style={{ '--entry-delay': `${index * 85}ms` } as CSSProperties}>
                  <td className="scoreboard-rank">{rank}<span className="sr-only">位</span></td>
                  <th scope="row">
                    <strong className="scoreboard-name">{entry.name}</strong>
                    {showRoles && entry.role && (
                      <small className="scoreboard-role">{entry.role} · {entry.alive ? '生存' : '死亡'}</small>
                    )}
                    {breakdown.length > 0 && (
                      <ul className="scoreboard-breakdown" aria-label="累計ポイントの内訳">
                        {breakdown.map(([label, points]) => (
                          <li key={label}>{label} <span>{points > 0 ? '+' : ''}{points}</span></li>
                        ))}
                      </ul>
                    )}
                  </th>
                  <td className="scoreboard-points">{entry.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div className="room-scoreboard-actions">{children}</div>
    </section>
  );
}
