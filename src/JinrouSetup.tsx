import React from 'react';

const ROLE_NAMES = ['市民', '占い師', '霊媒師', '騎士', '共有者', '人狼', '狂人', '狂言者'];
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
      <label>同票時の処理<select value={draft.tieRule || 'revote'} disabled={busy} onChange={event => patch({ tieRule: event.target.value })}>{TIE_RULES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    <div className="jinrou-role-heading"><b>役職の人数</b><span className={total === playerCount ? 'valid' : 'invalid'}>{total} / {playerCount}人</span></div>
    <div className="jinrou-role-grid">{ROLE_NAMES.map(role => <label key={role}><span>{role}</span><input type="number" inputMode="numeric" min={0} max={20} value={Number(roles[role] || 0)} disabled={busy} onChange={event => setRoleCount(role, Number(event.target.value || 0))} /></label>)}</div>
    {total !== playerCount && <p className="jinrou-role-warning">役職の合計を参加人数に合わせてください。</p>}
    <div className="ww-point-options jinrou-rule-options">
      <label><input type="checkbox" checked={!!draft.firstNightAttack} disabled={busy} onChange={event => patch({ firstNightAttack: event.target.checked })} />初日の夜も襲撃あり</label>
      <label><input type="checkbox" checked={!!draft.special?.open} disabled={busy} onChange={event => patch({ special: { ...(draft.special || {}), open: event.target.checked } })} />オープンルール</label>
      <label><input type="checkbox" checked={!!draft.special?.firstDayWhite} disabled={busy} onChange={event => patch({ special: { ...(draft.special || {}), firstDayWhite: event.target.checked } })} />初日白通知</label>
    </div>
  </section>;
}
