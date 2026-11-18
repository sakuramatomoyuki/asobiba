import React from 'react';

type Props = {
  children: React.ReactNode;
  resetKey: string;
};

type State = { failed: boolean };

/** Keep a rendering error in one screen from leaving the whole game view blank. */
export class GameRenderBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidUpdate(previous: Props) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="game-render-error" role="alert" aria-live="assertive">
          <span className="game-render-error-mark" aria-hidden="true">!</span>
          <h2>画面を表示できませんでした</h2>
          <p>ゲーム画面の表示中に問題が起きました。操作がサーバーに届いていれば進行状況は保存されています。画面を読み込み直し、復帰後に現在のフェーズをご確認ください。</p>
          <button type="button" onClick={() => window.location.reload()}>ゲームに戻るため再読み込み</button>
        </section>
      );
    }

    return this.props.children;
  }
}
