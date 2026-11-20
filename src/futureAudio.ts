import React from 'react';

// Keep the already-unlocked audio context through phase component remounts.
// A delayed release still frees it when leaving the game entirely.
let retainedContext:AudioContext|null=null;
let releaseTimer:number|undefined;

/** Small procedural soundtrack: no downloads, no loops piling up after navigation. */
export function useFutureAudio(scenario:string,phase:string,round:number,danger:number){
 const current=React.useRef({scenario,phase,round,danger});current.current={scenario,phase,round,danger};
 React.useEffect(()=>{
  if(releaseTimer)clearTimeout(releaseTimer);
  let context:AudioContext|null=null,bed:GainNode|null=null,oscillators:OscillatorNode[]=[],last='',timer:number|undefined,noise:AudioBufferSourceNode|null=null,noiseGain:GainNode|null=null;
  const enabled=(kind:string)=>localStorage.getItem(`jinrou-${kind}`)!=='off';
  const tone=(frequency:number,duration:number,volume:number,type:OscillatorType='sine',delay=0)=>{
   if(!context)return;const t=context.currentTime+delay,o=context.createOscillator(),gain=context.createGain();
   o.type=type;o.frequency.setValueAtTime(frequency,t);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.03);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(gain).connect(context.destination);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();gain.disconnect()};
  };
  const update=()=>{
   if(!context)return;const state=current.current,t=context.currentTime;
   const active=enabled('bgm')&&!document.hidden;
   bed?.gain.setTargetAtTime(active?.018:0,t,.15);
   const swell=(state.scenario==='broadcast'||state.scenario==='ship')?(1+Math.sin(t*.45))*.5:state.scenario==='last-train'?(1+Math.sin(t*5))*.25:.3;
   noiseGain?.gain.setTargetAtTime(active?.012+swell*.018:0,t,.3);
   const base=state.scenario==='laboratory'?47:state.scenario==='last-train'?55:state.scenario==='ship'?34:41;
   oscillators.forEach((o,i)=>o.frequency.setTargetAtTime(base*(i===0?1:i===1?1.008:2)+(state.danger>=4?1.2:0),t,.8));
   const key=`${state.round}:${state.phase}`;
   if(last!==key&&enabled('sound')&&!document.hidden){
    if(state.phase==='transmission'){[0,.18,.6,.78].forEach(delay=>{tone(660,.14,.025,'sine',delay);tone(880,.14,.012,'sine',delay)})}
    else if(state.phase==='vote'){tone(110,.7,.04);tone(165,.6,.02,'triangle',.18)}
    else if(state.phase==='result'){tone(state.danger>=4?65:196,1.2,.04,'triangle');tone(state.danger>=4?69:294,1.4,.018,'sine',.15)}
    else if(state.phase==='discussion')tone(220,.8,.018,'sine');
    last=key;
   }
  };
  const start=()=>{
   if(context){void context.resume();update();return}
   const Audio=window.AudioContext||(window as any).webkitAudioContext;if(!Audio)return;
   context=retainedContext&&retainedContext.state!=='closed'?retainedContext:new Audio();retainedContext=context;bed=context!.createGain();bed.gain.value=0;
   // A filtered, gently beating low drone changes its register with the location.
   const filter=context!.createBiquadFilter();filter.type='lowpass';filter.frequency.value=280;bed.connect(filter).connect(context!.destination);
   oscillators=[0,1,2].map(()=>{const o=context!.createOscillator();o.type='sine';o.connect(bed!);o.start();return o});
   const buffer=context!.createBuffer(1,context!.sampleRate*4,context!.sampleRate),samples=buffer.getChannelData(0);let brown=0;
   for(let i=0;i<samples.length;i++){brown=(brown+(Math.random()*2-1)*.03)/1.03;samples[i]=brown*3}
   noise=context!.createBufferSource();noise.buffer=buffer;noise.loop=true;
   const air=context!.createBiquadFilter();air.type='lowpass';air.frequency.value=current.current.scenario==='ship'?700:current.current.scenario==='broadcast'?1100:current.current.scenario==='last-train'?550:220;
   noiseGain=context!.createGain();noiseGain.gain.value=0;noise.connect(air).connect(noiseGain).connect(context!.destination);noise.start();
   void context!.resume();update();timer=window.setInterval(update,350);
  };
  document.addEventListener('pointerdown',start);document.addEventListener('visibilitychange',update);
  if(retainedContext)start();
  return()=>{document.removeEventListener('pointerdown',start);document.removeEventListener('visibilitychange',update);if(timer)clearInterval(timer);oscillators.forEach(o=>{o.stop();o.disconnect()});noise?.stop();noise?.disconnect();bed?.disconnect();noiseGain?.disconnect();releaseTimer=window.setTimeout(()=>{if(retainedContext===context){void context?.close();retainedContext=null}},1000)};
 },[]);
}
