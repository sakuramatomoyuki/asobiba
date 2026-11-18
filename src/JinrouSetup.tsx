import React from 'react';
import { recommendedRoles } from '../functions/src/gameRules';

const ROLE_NAMES = ['市民', '占い師', '霊媒師', '騎士', '共有者', '人狼', '狂人', '狂言者', 'てるてる', '怪盗'];
const ROLE_DESCRIPTIONS: Record<string, string> = {
  市民: '市民陣営。夜の能力はありません。話し合いと投票で人狼を探します。',
  占い師: '市民陣営。夜に生存者1人を占い、人狼か人間かを確認します。',
  霊媒師: '市民陣営。処刑された人が人狼か人間かを翌朝に確認します。',
  騎士: '市民陣営。夜に自分以外の生存者1人を襲撃から守ります。',
  共有者: '市民陣営。ほかの共有者が誰か分かり、夜に専用チャットで会話できます。',
  人狼: '人狼陣営。夜に襲撃先を選び、仲間の人狼を知っています。',
  狂人: '人狼陣営。特殊能力はありません。人狼が誰かは知りません。',
  狂言者: '人狼陣営。人狼が誰かを知っていますが、人狼側は狂言者を知りません。',
  てるてる: '中立。昼の投票で処刑されると、単独勝利します。',
  怪盗: '初期は市民陣営。夜に1人と役職を交換し、交換後の役職になります。',
};
const TIE_RULES = [
  ['revote', '同票の人だけで再投票'],
  ['random', '同票からランダムに処刑'],
  ['none', '処刑なし'],
  ['revote-none', '再投票後も同票なら処刑なし'],
];

export function JinrouSetup({ settings, busy, playerCount, onChange }: { settings: any; busy: boolean; playerCount: number; onChange: (settings: any) => void }) {
  const [draft, setDraft] = React.useState(settings || {});
  React.useEffect(() => setDraft(settings || {}), [settings?.gameType, playerCount]);
  const patch = (values: any) => {
    const next = { ...draft, ...values };
    setDraft(next);
    onChange(next);
  };
  const roles = { ...(draft.roles || {}) };
  const total = ROLE_NAMES.reduce((sum, role) => sum + Number(roles[role] || 0), 0);
  const setRoleCount = (role: string, value: number) => patch({ roles: { ...roles, [role]: Math.max(0, Math.min(20, value)) } });
  const formatSeconds = (seconds: number) => seconds < 60 ? `${seconds}秒` : `${Math.floor(seconds / 60)}分${seconds % 60 ? `${seconds % 60}秒` : ''}`;

  return <section className="ww-setup jinrou-setup">
    <h4>人狼の設定</h4>
    <div className="ww-setup-grid">
      <label>議論時間<select value={Number(draft.discussionSeconds || 180)} disabled={busy} onChange={event => patch({ discussionSeconds: Number(event.target.value) })}>{Array.from({ length: 20 }, (_, index) => (index + 1) * 30).map(seconds => <option key={seconds} value={seconds}>{formatSeconds(seconds)}</option>)}</select></label>
      <label>夜の進行<select value={draft.nightProgression || 'auto'} disabled={busy} onChange={event => patch({ nightProgression: event.target.value })}><option value="auto">自動で次へ進む</option><option value="manual">管理者が次へ進める</option></select></label>
      <label>役職確認の進行<select value={draft.rolecheckProgression || 'auto'} disabled={busy} onChange={event => patch({ rolecheckProgression: event.target.value })}><option value="auto">全員確認後に自動で開始</option><option value="manual">管理者が開始</option></select></label>
      <label>投票結果の進行<select value={draft.voteResultProgression || 'manual'} disabled={busy} onChange={event => patch({ voteResultProgression: event.target.value })}><option value="auto">結果発表後、自動で次へ</option><option value="manual">結果発表後、管理者が次へ</option></select></label>
      <label>同票時の処理<select value={draft.tieRule || 'revote'} disabled={busy} onChange={event => patch({ tieRule: event.target.value })}>{TIE_RULES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    <div className="jinrou-role-heading"><b>役職の候補</b><span className={total >= playerCount ? 'valid' : 'invalid'}>{total} / {playerCount}人</span></div>
    <button type="button" className="jinrou-recommended-button" disabled={busy} onClick={() => patch({ roles: recommendedRoles(playerCount) })}>おすすめ編成を適用</button>
    <p className="muted">おすすめ編成は参加人数と同じ数です。合計を参加人数より多くすると、選んだ役職を候補として参加人数分だけランダムに配ります。候補に入れた役職が配られない場合もあります。人狼を候補に入れなければ平和村になり、全員の役職確認後に市民陣営の勝利が決まります。</p>
    <details className="jinrou-role-guide">
      <summary>役職の説明を見る（全10種類）</summary>
      <div className="jinrou-role-guide-list">{ROLE_NAMES.map(role => <article key={role}><b>{role}</b><p>{ROLE_DESCRIPTIONS[role]}</p></article>)}</div>
    </details>
    <div className="jinrou-role-grid">{ROLE_NAMES.map(role => <label key={role}><span>{role}</span><input type="number" inputMode="numeric" min={0} max={20} value={Number(roles[role] || 0)} disabled={busy || (draft.method === 'shared' && role === '共有者')} onChange={event => setRoleCount(role, Number(event.target.value || 0))} /></label>)}</div>
    {total < playerCount && <p className="jinrou-role-warning">候補をあと {playerCount - total} 人分追加してください。</p>}
    <div className="ww-point-options jinrou-rule-options">
      <label><input type="checkbox" checked={!!draft.firstNightAttack} disabled={busy} onChange={event => patch({ firstNightAttack: event.target.checked })} />初日の夜も襲撃あり</label>
      <label><input type="checkbox" checked={!!draft.special?.open} disabled={busy} onChange={event => patch({ special: { ...(draft.special || {}), open: event.target.checked } })} />オープンルール</label>
      <label><input type="checkbox" checked={!!draft.special?.firstDayWhite} disabled={busy} onChange={event => patch({ special: { ...(draft.special || {}), firstDayWhite: event.target.checked } })} />初日白通知</label>
    </div>
  </section>;
}
