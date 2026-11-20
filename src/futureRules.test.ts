import {describe,it,expect} from 'vitest';
import {FUTURE_SCENARIOS,FUTURE_CHAPTERS,createFutureState,futureChapter,futureMessage,futureVoteLeaders,projectFuture,resolveFuture,createFutureSession,actOnFuture,futurePublic,type FutureState} from '../functions/src/futureRules';

describe('未来から届く物語の整合性',()=>{
  for(const scenario of FUTURE_SCENARIOS){
    it(`${scenario.title}: 全分岐が有限で、脱出と失敗の両方が存在する`,()=>{
      let escaped=0,lost=0;
      const walk=(state:FutureState)=>{
        if(state.status!=='playing'){state.status==='escaped'?escaped++:lost++;return}
        for(const option of futureChapter(state).actions){
          const preview=projectFuture(state,option.id),next=resolveFuture(state,option.id);
          expect(next.danger).toBe(preview.danger);
          expect(next.history.at(-1)?.outcome).toBe(preview.text);
          expect(next.inventory).not.toContain(undefined);
          expect(next.danger).toBeGreaterThanOrEqual(0);
          expect(next.danger).toBeLessThanOrEqual(6);
          if(next.status==='playing')walk({...next,round:next.round+1});else walk(next);
        }
      };
      walk(createFutureState(scenario.id));
      expect(escaped).toBeGreaterThan(0);expect(lost).toBeGreaterThan(0);
    });
    it(`${scenario.title}: 各通信は実際に到達可能な予測に基づく`,()=>{
      for(let round=1;round<=5;round++){
        const state={...createFutureState(scenario.id),round};
        const chapter=FUTURE_CHAPTERS[scenario.id][round-1];
        expect(chapter.actions).toHaveLength(3);
        expect(new Set(chapter.actions.map(a=>a.id)).size).toBe(3);
        for(let seat=0;seat<8;seat++){
          const message=futureMessage(state,seat),prediction=projectFuture(state,message.action);
          expect(prediction.text).toContain(message.evidence);
          expect(message.text).toContain(message.evidence);
          expect(message.text).not.toContain('undefined');
        }
      }
    });
  }
  it('投票は不正な選択を数えず、同票候補をすべて残す',()=>{
    expect(futureVoteLeaders({a:'left',b:'right',c:'invalid'},['left','right'])).toEqual(['left','right']);
    expect(futureVoteLeaders({},['left','right'])).toEqual([]);
  });
  it('終了後の操作と未知の選択を拒否する',()=>{
    expect(()=>createFutureState('invalid')).toThrow();
    expect(()=>resolveFuture({...createFutureState('laboratory'),status:'lost'},'latch')).toThrow();
    expect(()=>projectFuture(createFutureState('laboratory'),'invalid')).toThrow();
  });
  it('3人の確認、議論、投票、結果の後に次の場面へ進む',()=>{
    let g=createFutureSession('laboratory',['a','b','c']);
    for(const uid of g.order)g=actOnFuture(g,uid,uid==='a',{type:'read'});
    expect(g.phase).toBe('discussion');
    g=actOnFuture(g,'a',true,{type:'openVote'});
    for(const uid of g.order)g=actOnFuture(g,uid,uid==='a',{type:'vote',option:'latch',confirm:true});
    expect(g.phase).toBe('result');
    expect(g.state.inventory).toContain('工具');
    g=actOnFuture(g,'a',true,{type:'next'});
    expect(g.state.round).toBe(2);expect(g.phase).toBe('transmission');expect(g.ready).toEqual({});expect(g.votes).toEqual({});
  });
  it('確定投票を二重適用せず、管理操作と個人操作を検証する',()=>{
    const initial=createFutureSession('laboratory',['a','b','c']);
    expect(()=>actOnFuture(initial,'outsider',false,{type:'read'})).toThrow();
    expect(()=>actOnFuture(initial,'b',false,{type:'openVote'})).toThrow();
    let g=initial;for(const uid of g.order)g=actOnFuture(g,uid,false,{type:'read'});
    g=actOnFuture(g,'a',true,{type:'openVote'});
    g=actOnFuture(g,'a',true,{type:'vote',option:'latch',confirm:true});
    expect(()=>actOnFuture(g,'a',true,{type:'vote',option:'glass',confirm:true})).toThrow();
    expect(g.state.history).toHaveLength(0);
  });
  it('再投票後も同票なら決断役だけが決める',()=>{
    let g=createFutureSession('laboratory',['a','b','c']);
    for(const uid of g.order)g=actOnFuture(g,uid,false,{type:'read'});
    g=actOnFuture(g,'a',true,{type:'openVote'});
    for(let ballot=0;ballot<2;ballot++)for(const [index,uid] of g.order.entries())g=actOnFuture(g,uid,false,{type:'vote',option:['latch','power','glass'][index],confirm:true});
    expect(g.phase).toBe('tie');
    expect(()=>actOnFuture(g,'b',false,{type:'decide',option:'latch'})).toThrow();
    g=actOnFuture(g,'a',true,{type:'decide',option:'latch'});expect(g.phase).toBe('result');
  });
  it('未来への問いは2回まで。公開情報に個別通信を含めない',()=>{
    let g=createFutureSession('broadcast',['a','b','c']);
    for(const uid of g.order)g=actOnFuture(g,uid,false,{type:'read'});
    expect(futurePublic(g).transmissions).toEqual([]);
    for(let i=0;i<2;i++)g=actOnFuture(g,'a',true,{type:'query',option:'battery'});
    expect(()=>actOnFuture(g,'a',true,{type:'query',option:'battery'})).toThrow();
    expect(g.queries).toHaveLength(2);
  });
  it('データベースが空の配列とマップを省略しても再接続できる',()=>{
    const prune=(value:any):any=>Array.isArray(value)?value.length?value.map(prune):undefined:value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,prune(v)]).filter(([,v])=>v!==undefined&&!(v&&typeof v==='object'&&Object.keys(v).length===0))):value;
    const stored=prune(createFutureSession('laboratory',['a','b','c']));
    expect(futurePublic(stored).voteCount).toBe(0);
    const next=actOnFuture(prune(stored),'a',true,{type:'read'});
    expect(next.ready.a).toBe(true);expect(next.transmissionLog).toHaveLength(1);
    expect(()=>actOnFuture(next,'a',true,{type:'invalid'} as any)).toThrow();
  });
  it('切断者をその場面だけ保留し、全員待ちを解消する',()=>{
    let g=createFutureSession('laboratory',['a','b','c']);
    g=actOnFuture(g,'a',true,{type:'read'});g=actOnFuture(g,'b',false,{type:'read'});
    expect(()=>actOnFuture(g,'b',false,{type:'defer',uids:['c']})).toThrow();
    g=actOnFuture(g,'a',true,{type:'defer',uids:['c']});expect(g.phase).toBe('discussion');expect(futurePublic(g).total).toBe(2);
    g=actOnFuture(g,'a',true,{type:'openVote'});
    for(const uid of ['a','b'])g=actOnFuture(g,uid,uid==='a',{type:'vote',option:'latch',confirm:true});
    expect(g.phase).toBe('result');g=actOnFuture(g,'a',true,{type:'next'});
    expect(futurePublic(g).total).toBe(3);expect(g.deferred).toEqual([]);
  });
});
