import React from 'react';

type Props = {
  room: any;
  busy: boolean;
  act: (action: any) => void;
  activeSeat?: any;
  openSeat: (seat: any) => void;
  confirmSeat: () => void;
  hideSeat: () => void;
  onSendChat?: (message: string) => void;
  canAdvanceShared?: boolean;
};

export function WordWolfSetup({ settings, busy, onChange }: { settings: any; busy: boolean; onChange: (settings: any) => void }) {
  const initial = settings?.wordWolf || {};
  const [draft, setDraft] = React.useState(initial);
  const [majority, setMajority] = React.useState(String(initial.topicA || ''));
  const [minority, setMinority] = React.useState(String(initial.topicB || ''));
  React.useEffect(() => { setDraft(initial); setMajority(String(initial.topicA || '')); setMinority(String(initial.topicB || '')); }, [settings?.gameType]);
  const patch = (values: any) => { const next = { ...draft, ...values }; setDraft(next); onChange(next); };
  return <section className="ww-setup"><h4>ワードウルフの設定</h4><div className="ww-setup-grid">
    <label>議論時間<select value={draft.discussionSeconds || 60} disabled={busy} onChange={e => patch({ discussionSeconds: Number(e.target.value) })}>{Array.from({ length: 10 }, (_, i) => (i + 1) * 30).map(n => <option key={n} value={n}>{n < 60 ? `${n}秒` : `${Math.floor(n / 60)}分${n % 60 ? `${n % 60}秒` : ''}`}</option>)}</select></label>
    <label>投票時間<select value={draft.voteSeconds || 30} disabled={busy} onChange={e => patch({ voteSeconds: Number(e.target.value) })}>{Array.from({ length: 10 }, (_, i) => (i + 1) * 30).map(n => <option key={n} value={n}>{n < 60 ? `${n}秒` : `${Math.floor(n / 60)}分${n % 60 ? `${n % 60}秒` : ''}`}</option>)}</select></label>
    <label>お題確認後の進行<select value={draft.wordProgression || 'auto'} disabled={busy} onChange={e => patch({ wordProgression: e.target.value })}><option value="auto">全員確認後、自動で議論へ</option><option value="manual">全員確認後、ホストが「次へ」</option></select></label>
    <label>少数派の人数<select value={draft.minorityCount ?? 'quarter'} disabled={busy} onChange={e => patch({ minorityCount: e.target.value === 'quarter' ? 'quarter' : Number(e.target.value) })}><option value="quarter">参加人数の4分の1（切り捨て・最低1人）</option>{Array.from({ length: Math.max(1, Math.min(9, settings.playerCount - 1)) }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}人</option>)}</select></label>
    <label>お題の用意<select value={draft.wordSource || 'app'} disabled={busy} onChange={e => patch({ wordSource: e.target.value })}><option value="app">アプリからランダム</option><option value="host">ホストが入力</option></select></label>
  </div>{draft.wordSource === 'host'&&<div className="ww-topic-pair"><label>お題 A<input maxLength={40} value={majority} onChange={e => {const value=e.target.value.slice(0,40);setMajority(value);patch({topicA:value})}} placeholder="例：コーヒー"/></label><label>お題 B<input maxLength={40} value={minority} onChange={e => {const value=e.target.value.slice(0,40);setMinority(value);patch({topicB:value})}} placeholder="例：紅茶"/></label></div>}
  <div className="ww-point-options"><label><input type="checkbox" checked={draft.pointsEnabled!==false} disabled={busy} onChange={e => patch({ pointsEnabled: e.target.checked, addRoomPoints: e.target.checked && !!settings.pointsEnabled })}/>ゲーム内ポイントを有効にする</label><label><input type="checkbox" checked={!!settings.pointsEnabled&&draft.addRoomPoints!==false} disabled={busy||!settings.pointsEnabled||draft.pointsEnabled===false} onChange={e => patch({ addRoomPoints: e.target.checked })}/>ルーム累計に加算する</label></div></section>;
}

export function WordWolfGame({ room, busy, act, activeSeat, openSeat, confirmSeat, hideSeat, onSendChat, canAdvanceShared }: Props) {
  const [target, setTarget] = React.useState('');
  const [confirmed, setConfirmed] = React.useState(false);
  const [guess, setGuess] = React.useState('');
  const [chatDraft, setChatDraft] = React.useState('');
  const [remaining, setRemaining] = React.useState(0);
  const phase = room.phase;
  const game = room.miniGame || {};
  const secret = room.secret?.miniGame;
  const shared = ['shared', 'hybrid'].includes(room.settings?.method);
  const eligible = (room.players || []).filter((p: any) => p.alive && p.connected);
  const me = room.players?.find((p: any) => p.uid === (activeSeat?.uid || room.secret?.me?.uid));
  const nextUid = room.sharedTurnUid || room.gm?.sharedTurnUid;
  const nextPlayer = room.players?.find((p: any) => p.uid === nextUid);
  const deadline = Number(game.deadline || room.deadline || 0);
  const display = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const timerLabel = room.paused ? '一時停止中' : display(remaining);
  const phaseName: Record<string,string> = {'wordwolf-word':'お題の確認','wordwolf-discussion':'議論','wordwolf-vote':'投票','wordwolf-caught':'逆転チャンス','wordwolf-guess':'少数派の回答','wordwolf-result':'結果発表'};
  const screenClass = `wordwolf-screen phase-${phase}`;
  const gameHeader = (label = phaseName[phase] || 'ゲーム進行', timer?: string) => <><header className="ww-game-header"><div className="ww-game-brand"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19"/><path d="M31 12a15 15 0 1 0 5 23A17 17 0 0 1 31 12Z"/><path d="m11 36 7-8 5 5 7-10 7 7"/></svg><span><small>第{room.round||1}ラウンド</small><b>ワードウルフ</b></span></div><div className="ww-stage-label"><small>NOW PLAYING</small><b>{label}</b>{timer&&<time className={room.paused ? 'paused' : undefined}>{timer}</time>}</div></header><div className={`ww-phase-track track-${phase}`} aria-hidden="true"><i/></div></>;

  React.useEffect(() => {
    setTarget(''); setConfirmed(false); setGuess(''); setChatDraft('');
  }, [phase, room.round]);
  React.useEffect(() => {
    if (!deadline) { setRemaining(0); return; }
    const update = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    update(); const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const waiting = (title: string, detail: string) => <section className="ww-stage"><svg className="ww-sigil" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="45"/><circle cx="60" cy="60" r="34"/><path d="M60 26v68M26 60h68M36 36l48 48m0-48L36 84"/><path d="m60 39 6 15 15 6-15 6-6 15-6-15-15-6 15-6z"/></svg><h2>{title}</h2><p>{detail}</p><div className="ww-progress">{game.readyCount ?? game.voteCount ?? game.guessCount ?? 0} / {game.readyTotal ?? game.voteCount ?? game.guessTotal ?? eligible.length}</div></section>;
  const handoff = (kind: 'word' | 'vote' | 'guess') => {
    if (!shared || !nextPlayer) return null;
    if (!activeSeat) return <section className="ww-handoff"><p>端末を <b>{nextPlayer.name}</b> さんに渡してください</p><button className="primary wide" onClick={() => openSeat(nextPlayer)}>端末を渡した</button></section>;
    if (activeSeat.awaiting) return <section className="ww-handoff"><p><b>{activeSeat.name}</b> さんですか？</p><button className="primary wide" onClick={confirmSeat}>はい、操作を始める</button><button className="secondary wide" onClick={hideSeat}>いいえ、画面を隠す</button></section>;
    if (!secret || activeSeat.uid !== nextUid) return <section className="ww-handoff"><p>個人情報を準備しています…</p><button className="secondary wide" onClick={hideSeat}>画面を隠す</button></section>;
    if (kind === 'word' && secret.hasRead) return <section className="ww-handoff"><p>お題の確認は完了しています。</p><button className="secondary wide" onClick={hideSeat}>画面を隠す</button></section>;
    if (kind === 'vote' && secret.hasVoted) return <section className="ww-handoff"><p>投票は完了しています。</p><button className="secondary wide" onClick={hideSeat}>画面を隠す</button></section>;
    return null;
  };

  if (phase === 'wordwolf-word') {
    const gate = handoff('word');
    if (gate) return <div className={screenClass}>{gameHeader('お題の確認')}{gate}</div>;
    if (game.readyToAdvance) return <div className={screenClass}>{gameHeader('お題の確認')}{room.canManage || canAdvanceShared ? <section className="ww-stage"><h2>全員がお題を確認しました</h2><p>{game.readyCount} / {game.readyTotal}人が確認済みです。準備ができたら議論を始められます。</p><button className="primary wide" disabled={busy || room.paused} onClick={() => act({ type: 'continueWordcheck' })}>次へ（議論へ）</button></section> : waiting('全員がお題を確認しました', 'ホストが次へ進むまでお待ちください。')}</div>;
    if (!secret?.word) return <div className={screenClass}>{gameHeader('お題の確認')}{waiting('自分のお題を確認してください', '確認後、全員がそろうと議論が始まります。')}</div>;
    return <div className={screenClass}>{gameHeader('自分のお題')}<section className="ww-private-card"><span>あなたのお題</span><strong>{secret.word}</strong><p>この言葉は、ほかの人に見せないでください。</p><button className="primary wide" disabled={busy || secret.hasRead} onClick={() => act({ type: 'wordRead' })}>お題を確認した</button></section>{shared&&<button className="secondary wide ww-hide" onClick={hideSeat}>画面を隠す</button>}{!shared&&secret.hasRead&&waiting('ほかの人を待っています…', `${game.readyCount || 0} / ${game.readyTotal || eligible.length}人がお題を確認しました。`)}</div>;
  }
  if (phase === 'wordwolf-discussion') return <div className={screenClass}>{gameHeader('議論', timerLabel)}<section className="ww-stage"><svg className="ww-sigil" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="46"/><path d="M74 20a42 42 0 1 0 28 65A48 48 0 0 1 74 20Z"/><path d="m60 41 5 13 14 6-14 5-5 14-5-14-14-5 14-6z"/></svg><h2>会話から違いを探そう</h2><p>お題の名前を直接言わずに、みんなで話し合ってください。</p><strong className={`ww-timer${room.paused ? ' paused' : ''}`}>{timerLabel}</strong></section></div>;
  if (phase === 'wordwolf-vote') {
    const gate = handoff('vote');
    if (gate) return <div className={screenClass}>{gameHeader('投票', timerLabel)}{gate}</div>;
    if (secret?.hasVoted) return <div className={screenClass}>{gameHeader('投票', timerLabel)}{waiting('投票しました', 'ほかの人の投票を待っています…')}</div>;
    const choose = (value: string) => { setTarget(value); setConfirmed(false); };
    const submit = () => { if (!target) return; act({ type: 'wordVote', target }); setConfirmed(false); };
    const targetName = target === '__abstain__' ? '無投票' : `${room.players.find((p: any) => p.uid === target)?.name || '選んだ人'}さん`;
    if (confirmed) return <div className={`${screenClass} ww-ballot-confirm-screen`}><section className="ww-ballot-confirm" role="dialog" aria-modal="true"><p>{targetName}に投票しますか？</p><button className="primary wide" disabled={busy} onClick={submit}>はい、投票する</button><button className="secondary wide" onClick={() => setConfirmed(false)}>いいえ、戻る</button></section></div>;
    return <div className={`${screenClass} ww-ballot-screen`}>{gameHeader('投票', timerLabel)}<section className="ww-vote-card"><h2>誰に投票しますか？</h2>{shared&&<div className="ww-voter-turn"><b>{activeSeat?.name || me?.name}</b> さんの番です</div>}<p>投票先は他の人には見えません。</p><select aria-label="投票先を選ぶ" value={target} onChange={event => choose(event.target.value)}><option value="">投票先を選ぶ</option>{eligible.filter((p: any) => p.uid !== me?.uid).map((p: any) => <option key={p.uid} value={p.uid}>{p.name}</option>)}<option value="__abstain__">無投票</option></select><button className="primary wide" disabled={!target || busy} onClick={() => setConfirmed(true)}>投票する</button></section></div>;
  }
  if (phase === 'wordwolf-caught') return <div className={`${screenClass} ww-caught-screen`}>{gameHeader('逆転チャンス', timerLabel)}<section className="ww-caught-reveal"><div className="ww-caught-seal" aria-hidden="true"><i/><i/><i/></div><span className="eyebrow">VOTE REVEAL</span><h2>少数派が見つかりました</h2><p>少数派には逆転のチャンス。多数派のお題を推理してください。</p><strong>{room.paused ? '一時停止中' : '逆転チャンスの準備中…'}</strong></section></div>;
  if (phase === 'wordwolf-guess') {
    const gate = handoff('guess');
    if (gate) return <div className={screenClass}>{gameHeader('少数派の回答', display(remaining))}{gate}</div>;
    if (!secret?.canGuess) return <div className={screenClass}>{gameHeader('少数派の回答', display(remaining))}{waiting('少数派が答えを考えています…', 'お題 Aが当たるか見届けましょう。')}</div>;
    if (secret?.guess) return <div className={screenClass}>{gameHeader('少数派の回答', display(remaining))}{waiting('回答しました', '少数派全員の回答を待っています…')}{room.settings?.method==='individual'&&<WordWolfChat messages={secret.chat||[]} value={chatDraft} onChange={setChatDraft} onSend={()=>{if(chatDraft.trim()){onSendChat?.(chatDraft.trim());setChatDraft('')}}} busy={busy}/>}</div>;
    return <div className={screenClass}>{gameHeader('回答', display(remaining))}<section className="ww-private-card"><span>特別な回答時間</span><h2>もう一方のお題を推理してください</h2><input value={guess} onChange={e => setGuess(e.target.value.slice(0, 60))} maxLength={60} placeholder="お題 Aを入力"/><button className="primary wide" disabled={!guess.trim() || busy} onClick={() => act({ type: 'wordGuess', guess: guess.trim() })}>回答する</button></section>{room.settings?.method==='individual'&&<WordWolfChat messages={secret.chat||[]} value={chatDraft} onChange={setChatDraft} onSend={()=>{if(chatDraft.trim()){onSendChat?.(chatDraft.trim());setChatDraft('')}}} busy={busy}/>}</div>;
  }
  if (phase === 'wordwolf-result') return <div className={`${screenClass} ww-result-screen`}>{gameHeader('結果発表')}<section className="ww-result"><div className="eyebrow">REVEAL</div><h2>{game.caught ? (game.guessCorrect?'少数派の逆推理が的中':'少数派が見つかりました') : '少数派は逃げ切りました'}</h2>{game.caught&&<p>少数派の逆推理：{game.guessCorrect?'正解':'不正解'}</p>}<div className="ww-words"><div><small>多数派のお題</small><b>{game.majorityWord}</b></div><div><small>少数派のお題</small><b>{game.minorityWord}</b></div></div><div className="ww-results-list">{(game.results||[]).map((row: any) => <div key={row.uid}><b>{row.name}</b><span>{row.side} · {row.word}</span><strong>+{row.points} pt</strong>{room.settings.pointsEnabled&&<small>ルーム累計 {row.roomPoints} pt</small>}</div>)}</div>{room.canManage?<><button className="primary wide" disabled={busy} onClick={() => act({ type: room.settings.pointsEnabled?'showRanking':'nextGameSetup' })}>{room.settings.pointsEnabled?'次へ（ルーム累計を見る）':'次のゲームを選ぶ'}</button>{room.settings.pointsEnabled&&<button className="secondary wide" disabled={busy} onClick={() => act({ type: 'nextGameSetup' })}>別のゲームを選ぶ</button>}</>:<p>ホストが次へ進めるまでお待ちください。</p>}</section></div>;
  return null;
}


function WordWolfChat({messages,value,onChange,onSend,busy}:{messages:any[];value:string;onChange:(value:string)=>void;onSend:()=>void;busy:boolean}) {
  return <section className="ww-chat"><header><b>少数派だけの相談</b><small>ここでの会話は多数派には表示されません</small></header><div className="ww-chat-messages">{messages.map((message:any)=><p key={message.id}><b>{message.name}</b><span>{message.text}</span></p>)}{messages.length===0&&<small>まだ会話はありません</small>}</div><div className="ww-chat-compose"><input value={value} maxLength={300} placeholder="相談を入力" onChange={event=>onChange(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&value.trim()){event.preventDefault();onSend()}}}/><button className="primary" disabled={busy||!value.trim()} onClick={onSend}>送信</button></div></section>;
}
