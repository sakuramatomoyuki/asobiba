import assert from 'node:assert/strict';

// Deliberately hard-coded loopback endpoints: this test cannot touch production.
const project='jinrou-de81a';
async function client(){
 const response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
 const account=await response.json();assert.ok(account.idToken);
 return {uid:account.localId,call:async(name,data)=>{
  const res=await fetch(`http://127.0.0.1:5001/${project}/asia-northeast1/${name}`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${account.idToken}`},body:JSON.stringify({data})});
  const payload=await res.json();if(payload.error)throw new Error(`${name}: ${JSON.stringify(payload.error)}`);return payload.result;
 }};
}
const routes={laboratory:['latch','vent','key','wait','front'],'last-train':['map','key','signal','control','station'],broadcast:['battery','rescue','code','light','ship'],ship:['tools','pump','key','boat','leave']};
for(const mode of ['individual','shared','hybrid'])for(const [scenario,route] of Object.entries(routes)){
 const host=await client(),b=await client(),c=await client();
 const shared=mode==='shared'?[{name:'未来A'},{name:'未来B'},{name:'未来C'}]:mode==='hybrid'?[{name:'未来A'},{name:'未来B'}]:[];
 const created=await host.call('createRoom',{requestId:crypto.randomUUID(),playerName:'未来A',playerCount:3,settings:{method:mode,hostMode:'player',sharedPlayers:shared,pointsEnabled:true}}),code=created.code;
 let players=[{...host,seatUid:undefined},{...b,seatUid:undefined},{...c,seatUid:undefined}];
 try{
  if(mode==='individual')for(const [i,p] of [b,c].entries())await p.call('joinRoom',{code,name:`未来${i?'C':'B'}`,kind:'player'});
  if(mode==='hybrid')await c.call('joinRoom',{code,name:'未来C',kind:'player'});
  await host.call('updateRoom',{code,action:{type:'setGame',game:'future'}});
  const waiting=(await host.call('getRoom',{code,kind:'player'})).view;
  if(mode!=='individual'){
   const seats=waiting.players.filter(p=>p.device==='shared');
   players=seats.map(seat=>({...host,uid:seat.uid,seatUid:seat.uid}));
   if(mode==='hybrid')players.push({...c,seatUid:undefined});
   await host.call('updateRoom',{code,action:{type:'roomReady',sharedAll:true,ready:true}});
  }
  if(mode==='individual')for(const p of players)await p.call('updateRoom',{code,action:{type:'roomReady',ready:true}});
  if(mode==='hybrid')await c.call('updateRoom',{code,action:{type:'roomReady',ready:true}});
  const clockTest=mode==='individual'&&scenario==='laboratory';
  await host.call('updateRoom',{code,action:{type:'start',gameSettings:{scenario,discussionSeconds:clockTest?60:0,pointsEnabled:true,addRoomPoints:true}}});
  if(mode!=='individual'){
   const secondShared=waiting.settings.sharedOrder[1];
   const denied=(await host.call('getRoom',{code,seatUid:secondShared})).view;
   assert.equal(denied.secret,null,'out-of-turn shared seats must not expose forecasts');
  }
  const order=mode==='individual'?players:players.sort((a,b)=>waiting.settings.sharedOrder.indexOf(a.uid)-waiting.settings.sharedOrder.indexOf(b.uid));
  const act=(p,command)=>p.call('updateRoom',{code,...(p.seatUid?{seatUid:p.seatUid}:{}),action:{type:'futureAction',command}});
  for(let round=0;round<5;round++){
   if(round===1){
    const returning=players[1],before=(await returning.call('getRoom',{code,...(returning.seatUid?{seatUid:returning.seatUid}:{kind:'player'})})).view;
    const restored=(await returning.call('joinRoom',{code,name:'再接続時に改名しない',kind:'player',...(returning.seatUid?{seatUid:returning.seatUid}:{})})).view;
    assert.equal(restored.round,before.round);assert.equal(restored.players.find(p=>p.uid===returning.uid).name,before.players.find(p=>p.uid===returning.uid).name);
   }
   for(const p of order){const v=(await p.call('getRoom',{code,...(p.seatUid?{seatUid:p.seatUid}:{kind:'player'})})).view;assert.ok(v.secret.miniGame.message.text);await act(p,{type:'read'});}
   const discussion=(await host.call('getRoom',{code,publicOnly:mode!=='individual',kind:'player'})).view;
   assert.equal(discussion.phase,'future-discussion');assert.equal(discussion.miniGame.transmissions.length,0);
   await act(host,{type:'investigate'});
   if(clockTest&&round===0){
    await assert.rejects(()=>act(b,{type:'openVote'}));
    await host.call('updateRoom',{code,action:{type:'pause'}});
    const paused=(await host.call('getRoom',{code,kind:'player'})).view;assert.equal(paused.paused,true);assert.equal(paused.deadline,null);
    await assert.rejects(()=>act(host,{type:'openVote'}));
    await host.call('updateRoom',{code,action:{type:'resume'}});
    const resumed=(await host.call('getRoom',{code,kind:'player'})).view;assert.ok(resumed.deadline>Date.now());
    const expired=Date.now()-1000;
    const patch=await fetch(`http://127.0.0.1:9000/rooms/${code}.json?ns=${project}-default-rtdb&auth=owner`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({deadline:expired,'clientMeta/deadline':expired})});assert.ok(patch.ok);
    const advanced=await host.call('heartbeat',{code,knownRevision:-1,presenceOnly:false});assert.equal(advanced.view.phase,'future-vote');
    const persisted=(await host.call('getRoom',{code,kind:'player'})).view;assert.equal(persisted.phase,'future-vote');
   }else await act(host,{type:'openVote'});
   for(const p of order)await act(p,{type:'vote',option:route[round],confirm:true});
   const result=(await host.call('getRoom',{code,publicOnly:mode!=='individual',kind:'player'})).view;
   assert.equal(result.phase,'future-result');assert.equal(result.miniGame.round,round+1);
   await act(host,{type:'next'});
  }
  const ended=(await host.call('getRoom',{code,publicOnly:mode!=='individual',kind:'player'})).view;
  assert.equal(ended.phase,'ended');assert.equal(ended.miniGame.status,'escaped');assert.equal(ended.miniGame.history.length,5);assert.equal(ended.miniGame.transmissions.length,15);
  assert.equal(ended.rankings.length,3);assert.ok(ended.rankings.every(p=>p.points===7));
  console.log(`PASS ${mode} / ${scenario}: 5 chapters, secret forecasts, votes, escape, +7 points`);
 }finally{await host.call('disbandRoom',{code}).catch(error=>console.error('Test room cleanup:',error.message));}
}
