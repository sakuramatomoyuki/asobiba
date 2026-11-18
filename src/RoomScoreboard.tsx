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

const SCORE_COLORS: Record<string, Record<string, string>> = {
  jinrou: { ink: '#fff0cd', muted: '#bfc8d8', accent: '#e8c67c', paper: '#131d2b', lead: '#30302a', buttonInk: '#231b0e' },
  wordwolf: { ink: '#ffe8e2', muted: '#d0bbc5', accent: '#e8a7a0', paper: '#241c29', lead: '#40303b', buttonInk: '#321c20' },
  ogiri: { ink: '#171717', muted: '#4f4f45', accent: '#ffe222', paper: '#fffef5', lead: '#fff4a8', buttonInk: '#171717' },
  ito: { ink: '#39254e', muted: '#6d587f', accent: '#7542a0', paper: '#fdfaff', lead: '#eee1f8', buttonInk: '#ffffff' },
  majority: { ink: '#512c22', muted: '#7d594a', accent: '#b64729', paper: '#fff9ef', lead: '#ffe4cb', buttonInk: '#ffffff' },
  lateral: { ink: '#193b48', muted: '#526e79', accent: '#246c83', paper: '#f5fcff', lead: '#dceef5', buttonInk: '#ffffff' },
  untilmatch: { ink: '#204730', muted: '#52705d', accent: '#287044', paper: '#fbfff6', lead: '#e0f2d6', buttonInk: '#ffffff' },
};

export function RoomScoreboard({ entries, showRoles, game, children }: {
  entries: RankingEntry[];
  showRoles: boolean;
  game: string;
  children: ReactNode;
}) {
  const colors = SCORE_COLORS[game] ?? SCORE_COLORS.lateral;
  const style = Object.fromEntries(Object.entries(colors).map(([name, value]) => [`--score-${name}`, value])) as CSSProperties;
  return (
    <section className={`room-scoreboard scoreboard-${game}`} aria-labelledby="room-scoreboard-title" style={style}>
      <div className="scoreboard-celebration" aria-hidden="true"><span className="scoreboard-crown" /><span className="scoreboard-stars">✦ ✧ ✦</span>{Array.from({ length: 16 }, (_, index) => <i key={index} style={{ '--particle': index } as CSSProperties} />)}</div>
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
                  <td className="scoreboard-rank"><span className={`scoreboard-medallion medal-${Math.min(rank, 4)}`}>{rank}</span><span className="sr-only">位</span></td>
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
