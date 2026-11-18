import { GAME_CATALOG, gameDeviceModeHint, type GameId } from './gameCatalog';

export function GameDirectory({ onGuide }: { onGuide: (game: GameId | null) => void }) {
  return (
    <section className="game-directory" aria-labelledby="game-catalog-title">
      <h2 id="game-catalog-title">遊べるゲーム</h2>
      <ul className="game-directory-list">
        {GAME_CATALOG.map((game) => (
          <li key={game.id}>
            <button
              className="game-directory-entry"
              type="button"
              aria-label={`${game.name}の遊び方`}
              aria-describedby={`directory-${game.id}-description directory-${game.id}-meta`}
              onClick={() => onGuide(game.id)}
            >
              <span className="game-directory-title">{game.name}</span>
              <span className="game-directory-description" id={`directory-${game.id}-description`}>{game.shortDescription}</span>
              <span className="game-directory-meta" id={`directory-${game.id}-meta`}>
                <span>{game.players}</span>
                <span>{gameDeviceModeHint(game)}</span>
                {!game.available && <span>準備中</span>}
              </span>
              <span className="game-directory-arrow" aria-hidden="true">→</span>
            </button>
          </li>
        ))}
      </ul>
      <button className="game-directory-all-guides" type="button" onClick={() => onGuide(null)}>
        遊び方をまとめて見る <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
