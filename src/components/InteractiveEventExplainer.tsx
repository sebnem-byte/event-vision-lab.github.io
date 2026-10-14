import React, {useMemo,useState,useEffect,useRef} from 'react';

type Event = {x:number;y:number;t:number;p:1|-1};
const W=72,H=42,DURATION=240,STEP=2,ON='#39c8f0',OFF='#ff9479';
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const diskX=(t:number)=>12+47*t/DURATION;
const diskY=(t:number)=>20+2*Math.sin(t/DURATION*Math.PI*2);
function intensity(x:number,y:number,t:number){
  const d=Math.hypot(x-diskX(t),y-diskY(t));
  // A bright moving disc over a fixed, dim grayscale scene. Edge antialiasing is deterministic.
  const disc=1/(1+Math.exp(clamp((d-6)*2.5,-30,30)));
  const background=0.10 + (x>=7&&x<=24&&y>=29&&y<=36?.055:0) + (x>=48&&x<=64&&y>=27&&y<=36?.07:0);
  return clamp(background+0.84*disc,0.01,0.99);
}
function brightness(x:number,y:number,t:number){return Math.log(intensity(x,y,t));}
function calculate(C:number){
  const refs=new Float64Array(W*H); const events:Event[]=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)refs[y*W+x]=brightness(x,y,0);
  for(let t=STEP;t<=DURATION;t+=STEP){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const i=y*W+x,L=brightness(x,y,t);
      // Each pixel maintains its own reference log intensity; multiple crossings are possible.
      let count=0;
      while(L-refs[i]>=C&&count++<15){refs[i]+=C;events.push({x,y,t,p:1});}
      count=0;
      while(L-refs[i]<=-C&&count++<15){refs[i]-=C;events.push({x,y,t,p:-1});}
    }
  }
  return events;
}
function paint(canvas:HTMLCanvasElement|null,t:number,events:Event[],view:'scene'|'events',windowMs:number,pol:'both'|'on'|'off',selected:{x:number;y:number}){
  if(!canvas)return;
  canvas.width=W*5;canvas.height=H*5;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const im=ctx.createImageData(W,H);
  if(view==='scene'){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const g=Math.round(intensity(x,y,t)*255);let i=(y*W+x)*4;
      im.data[i]=g;im.data[i+1]=g;im.data[i+2]=g;im.data[i+3]=255;
    }
  }else{
    for(let i=0;i<W*H;i++){im.data[i*4]=9;im.data[i*4+1]=20;im.data[i*4+2]=36;im.data[i*4+3]=255;}
    // Single pixel can emit more than one event; sign of latest event colors pixel.
    for(const e of events){if(e.t>t||e.t<=t-windowMs||(pol!=='both'&&(pol==='on'?e.p!==1:e.p!==-1)))continue;
      const i=(e.y*W+e.x)*4;
      if(e.p===1){im.data[i]=57;im.data[i+1]=200;im.data[i+2]=240;}
      else{im.data[i]=255;im.data[i+1]=148;im.data[i+2]=121;}
    }
  }
  const off=document.createElement('canvas');off.width=W;off.height=H;off.getContext('2d')!.putImageData(im,0,0);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(off,0,0,canvas.width,canvas.height);
  if(view==='scene'){ctx.strokeStyle='#3dd8fb';ctx.lineWidth=1.5;ctx.strokeRect(selected.x*5,selected.y*5,5,5);
    ctx.strokeStyle='rgba(57,200,240,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(selected.x*5+2.5,0);ctx.lineTo(selected.x*5+2.5,canvas.height);ctx.moveTo(0,selected.y*5+2.5);ctx.lineTo(canvas.width,selected.y*5+2.5);ctx.stroke();}
}
function RenderCanvas({t,events,view,windowMs,pol,selected,onPixel}:{t:number;events:Event[];view:'scene'|'events';windowMs:number;pol:'both'|'on'|'off';selected:{x:number;y:number};onPixel?:(x:number,y:number)=>void}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>paint(ref.current,t,events,view,windowMs,pol,selected),[t,events,view,windowMs,pol,selected]);
  return <canvas ref={ref} className="ice-canvas" role="img" aria-label={view==='scene'?'Grayscale scene containing a moving bright disc; click any pixel to inspect it':'Accumulated positive and negative events generated from the exact same grayscale scene'} onClick={e=>{if(!onPixel||!ref.current)return;const r=ref.current.getBoundingClientRect();onPixel(clamp(Math.floor((e.clientX-r.left)/r.width*W),0,W-1),clamp(Math.floor((e.clientY-r.top)/r.height*H),0,H-1));}}/>;
}
export default function InteractiveEventExplainer(){
  const [t,setT]=useState(110),[playing,setPlaying]=useState(false),[C,setC]=useState(.32),[windowMs,setWindowMs]=useState(48),[view,setView]=useState<'events'|'voxel'|'surface'>('events'),[pol,setPol]=useState<'both'|'on'|'off'>('both'),[selected,setSelected]=useState({x:33,y:20});
  const events=useMemo(()=>calculate(C),[C]);
  const filtered=useMemo(()=>events.filter(e=>e.t<=t&&e.t>t-windowMs&&(pol==='both'||(pol==='on'?e.p===1:e.p===-1))),[events,t,windowMs,pol]);
  const signal=useMemo(()=>Array.from({length:DURATION/STEP+1},(_,i)=>({t:i*STEP,L:brightness(selected.x,selected.y,i*STEP)})),[selected]);
  const selectedEvents=useMemo(()=>events.filter(e=>e.x===selected.x&&e.y===selected.y),[events,selected]);
  useEffect(()=>{if(!playing)return;let last=0,frame=0;const loop=(ms:number)=>{if(!last)last=ms;const dt=ms-last;last=ms;setT(prev=>(prev+dt*.07)%DURATION);frame=requestAnimationFrame(loop);};frame=requestAnimationFrame(loop);return()=>cancelAnimationFrame(frame);},[playing]);
  const graphW=530,graphH=220,left=38,right=10,top=14,bottom=30;
  const sx=(v:number)=>left+v/DURATION*(graphW-left-right);
  const ymin=Math.min(...signal.map(s=>s.L))-.1,ymax=Math.max(...signal.map(s=>s.L))+.1;
  const sy=(v:number)=>top+(ymax-v)/(ymax-ymin)*(graphH-top-bottom);
  const path=signal.map((s,i)=>`${i?'L':'M'}${sx(s.t).toFixed(2)} ${sy(s.L).toFixed(2)}`).join(' ');
  const eventsAt=selectedEvents.filter(e=>e.t<=t);
  const latest=eventsAt[eventsAt.length-1];
  const previousReference=brightness(selected.x,selected.y,0)+(eventsAt.reduce((sum,e)=>sum+e.p*C,0));
  const currentL=brightness(selected.x,selected.y,t);
  const binLists=useMemo(()=>Array.from({length:5},(_,i)=>filtered.filter(e=>{const n=Math.floor((e.t-(t-windowMs))/windowMs*5);return clamp(n,0,4)===i;})),[filtered,t,windowMs]);
  const bins=binLists.map((list,i)=><div className="ice-bin" key={i}><span>t{i} · {list.length} events</span><div className="ice-bin-frame"><svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"><rect width={W} height={H} fill="#0a1525"/>{list.map((e,j)=><rect key={j} x={e.x} y={e.y} width="1" height="1" fill={e.p===1?ON:OFF}/>)}</svg></div></div>);
  const latestPerPixel=useMemo(()=>{const arr=new Float32Array(W*H).fill(-999);for(const e of events)if(e.t<=t&&(pol==='both'||(pol==='on'?e.p===1:e.p===-1)))arr[e.y*W+e.x]=e.t;return arr;},[events,t,pol]);
  const onCount=filtered.filter(e=>e.p===1).length;
  return <div className="ice-root">
    <div className="ice-toolbar"><div className="ice-toolbar-title"><span className="ice-status">LIVE CONCEPT LAB</span><h3>From light to asynchronous events.</h3><p>One moving object. One shared timeline. Three synchronized views.</p></div><div className="ice-actions"><button className="ice-play" onClick={()=>setPlaying(v=>!v)}>{playing?'❚❚ Pause':'▶ Play'}</button><button onClick={()=>{setPlaying(false);setT(110);setSelected({x:33,y:20});setC(.32);setWindowMs(48);setView('events');setPol('both');}}>↺ Reset</button></div></div>
    <div className="ice-timeline"><label>Time <strong>{Math.floor(t)} / {DURATION} ms</strong><input type="range" min="0" max={DURATION} step="1" value={t} onChange={e=>{setPlaying(false);setT(+e.target.value);}}/></label><label>Contrast threshold <strong>C = {C.toFixed(2)}</strong><input type="range" min="0.12" max="0.8" step="0.04" value={C} onChange={e=>setC(+e.target.value)}/></label><label>Accumulation window <strong>{windowMs} ms</strong><input type="range" min="12" max="100" step="4" value={windowMs} onChange={e=>setWindowMs(+e.target.value)}/></label></div>
    <div className="ice-grid">
      <section className="ice-panel"><div className="ice-heading"><span className="ice-number">1</span><div><h4>Conventional image</h4><p>Full intensity frame I(x, y, t)</p></div></div><RenderCanvas t={t} events={events} view="scene" windowMs={windowMs} pol={pol} selected={selected} onPixel={(x,y)=>setSelected({x,y})}/><div className="ice-caption">Click any pixel to inspect its brightness history. The cyan crosshair identifies the selected pixel.</div><div className="ice-data"><span>Selected pixel</span><b>({selected.x}, {selected.y})</b><span>Intensity</span><b>{intensity(selected.x,selected.y,t).toFixed(3)}</b></div></section>
      <section className="ice-panel"><div className="ice-heading"><span className="ice-number">2</span><div><h4>Threshold crossing</h4><p>Log brightness at pixel ({selected.x}, {selected.y})</p></div></div><svg className="ice-graph" viewBox={`0 0 ${graphW} ${graphH}`} role="img" aria-label="Selected pixel logarithmic brightness trajectory and event trigger locations"><rect width={graphW} height={graphH} fill="#091425" rx="8"/>{Array.from({length:5},(_,i)=><line key={i} x1={left} x2={graphW-right} y1={top+i*(graphH-top-bottom)/4} y2={top+i*(graphH-top-bottom)/4} stroke="#4a657a" opacity=".25"/>)}<path d={path} fill="none" stroke="#edf5ff" strokeWidth="2.3"/><line x1={sx(t)} x2={sx(t)} y1={top} y2={graphH-bottom} stroke={ON} strokeDasharray="4 4" opacity=".8"/>{selectedEvents.map((e,i)=><circle key={i} cx={sx(e.t)} cy={sy(brightness(selected.x,selected.y,e.t))} r="3.2" fill={e.p===1?ON:OFF}/>)}<circle cx={sx(t)} cy={sy(currentL)} r="5" stroke="#fff" strokeWidth="1.5" fill={ON}/><text x={left} y={graphH-7} fill="#99adc1" fontSize="12">0 ms</text><text x={graphW-58} y={graphH-7} fill="#99adc1" fontSize="12">240 ms</text><text x={left+4} y={top+14} fill="#b7cddd" fontSize="11">L(t) = log I(t)</text></svg><div className="ice-trigger"><span className="ice-chip on">● ON +1</span><span className="ice-chip off">● OFF −1</span><span>{eventsAt.length} events at selected pixel</span></div><div className="ice-data"><span>Log intensity</span><b>{currentL.toFixed(2)}</b><span>Updated reference</span><b>{previousReference.toFixed(2)}</b></div><p className="ice-hint">Threshold lines are relative to each pixel's updated reference, not fixed global values.</p>{latest&&<div className="ice-tuple">Latest event: ({latest.x}, {latest.y}, {latest.t} ms, {latest.p>0?'+1':'−1'})</div>}</section>
      <section className="ice-panel"><div className="ice-heading"><span className="ice-number">3</span><div><h4>Event representation</h4><p>Same scene, asynchronous output</p></div></div><div className="ice-tabs">{([['events','Event image'],['voxel','Voxel grid'],['surface','Time surface']] as const).map(([id,label])=><button key={id} className={view===id?'active':''} onClick={()=>setView(id)}>{label}</button>)}</div>{view==='events'?<RenderCanvas t={t} events={events} view="events" windowMs={windowMs} pol={pol} selected={selected}/>:view==='voxel'?<div className="ice-voxel">{bins}</div>:<svg className="ice-surface" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Exponential last-event time surface"><rect width={W} height={H} fill="#0a1525"/>{Array.from(latestPerPixel,(last,i)=>{const age=t-last;if(last<0||age>100)return null;return <rect key={i} x={i%W} y={Math.floor(i/W)} width="1" height="1" fill={ON} opacity={.1+.9*Math.exp(-age/28)}/>})}</svg>}<div className="ice-legend"><span><i style={{background:ON}}/> ON (+1): {onCount}</span><span><i style={{background:OFF}}/> OFF (−1): {filtered.length-onCount}</span></div><div className="ice-data"><span>Events in window</span><b>{filtered.length}</b><span>Event tuple</span><b>(x, y, t, p)</b></div><div className="ice-polarity"><label>Show <select value={pol} onChange={e=>setPol(e.target.value as typeof pol)}><option value="both">ON and OFF</option><option value="on">ON only</option><option value="off">OFF only</option></select></label></div></section>
    </div>
    <div className="ice-bottom"><strong>Follow the causality</strong><span>Moving bright disc → brightness at each pixel changes → crossing ±C triggers events → events are accumulated or grouped into temporal bins</span></div><p className="ice-disclaimer">Idealized synthetic teaching model (72 × 42 pixels, 2 ms simulation steps). A stationary background generates no new events. The reference level advances by ±C on each threshold crossing. Event image and voxel views are computed from the same simulated stream; voxel bins show event locations, not interpolated values. Hardware noise, latency and refractory effects are omitted.</p>
    <style>{`
      .ice-root{background:#101d31;color:#d7e6f7;border:1px solid #31455d;border-radius:20px;padding:24px;font-family:system-ui,Arial,sans-serif;margin:24px 0;box-sizing:border-box}.ice-root *{box-sizing:border-box}.ice-toolbar{display:flex;align-items:center;justify-content:space-between;gap:15px}.ice-toolbar-title h3{font-size:clamp(21px,2vw,29px);color:#fff;margin:7px 0 6px}.ice-toolbar-title p,.ice-heading p{color:#9bb0c6;font-size:12px;margin:0}.ice-status{font-size:10px;font-weight:750;color:#43cbef;letter-spacing:.16em}.ice-actions{display:flex;gap:8px;white-space:nowrap}.ice-actions button{color:#d9effb;background:#192e47;border:1px solid #416078;padding:9px 13px;border-radius:9px;cursor:pointer}.ice-actions .ice-play{color:#05101e;background:#42c9ee;border-color:#42c9ee;font-weight:700}.ice-timeline{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin:24px 0}.ice-timeline label{display:flex;flex-direction:column;gap:8px;color:#abc0d3;font-size:12px}.ice-timeline strong{color:#fff}.ice-root input{width:100%;accent-color:#40c8eb}.ice-grid{display:grid;grid-template-columns:1fr 1.05fr 1.05fr;gap:12px;align-items:stretch}.ice-panel{background:#0b1729;border:1px solid #304459;border-radius:13px;min-width:0;padding:14px}.ice-heading{display:flex;align-items:center;gap:10px;min-height:57px;margin-bottom:12px}.ice-heading h4{color:#e9f6ff;font-size:15px;margin:0 0 5px}.ice-number{border:1px solid #39bfe9;background:#0e3049;width:29px;height:29px;border-radius:50%;display:grid;place-items:center;color:#4ad0ef;font-weight:800;flex-shrink:0}.ice-canvas,.ice-surface{display:block;width:100%;aspect-ratio:72/42;image-rendering:pixelated;border:1px solid #34485b;background:#091425;border-radius:8px}.ice-panel:first-child .ice-canvas{cursor:crosshair}.ice-graph{display:block;width:100%;aspect-ratio:530/220;border:1px solid #34485b;border-radius:8px}.ice-caption,.ice-hint{color:#97adc3!important;font-size:11px!important;line-height:1.6;margin:11px 0}.ice-data{display:grid;grid-template-columns:1fr auto;gap:7px 10px;margin-top:13px;padding:12px;background:#14283f;border-radius:8px;font-size:11px;color:#acc1d5}.ice-data b{color:#fff;font-variant-numeric:tabular-nums}.ice-trigger,.ice-legend{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin:12px 0;font-size:11px}.ice-chip{font-weight:750}.ice-chip.on{color:#39c8f0}.ice-chip.off{color:#ff9479}.ice-legend i{width:8px;height:8px;display:inline-block;border-radius:50%;margin-right:5px}.ice-tuple{margin-top:10px;font-family:ui-monospace,monospace;color:#cae6f4;font-size:10px;overflow-wrap:anywhere}.ice-tabs{display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap}.ice-tabs button{font-size:10px;cursor:pointer;padding:7px 8px;border-radius:6px;border:1px solid #31506a;background:#182a40;color:#c4d6e9}.ice-tabs button.active{background:#1b6a86;border-color:#4ed1f2;color:#fff}.ice-voxel{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;min-height:175px;align-content:center}.ice-bin{font-size:9px;color:#a9c3d8}.ice-bin-frame{margin-top:4px;border:1px solid #3c5971;background:#091425;transform:skewY(-5deg)}.ice-bin svg{display:block;width:100%}.ice-polarity{margin-top:12px;font-size:11px;color:#9fb5c7}.ice-polarity select{background:#1a3049;color:#f1f7fc;border:1px solid #42627c;border-radius:6px;padding:5px;margin-left:8px}.ice-bottom{display:flex;gap:14px;margin-top:14px;align-items:center;background:#12314b;border:1px solid #255f77;border-radius:11px;padding:12px 15px;font-size:12px}.ice-bottom strong{color:#61dcf6;white-space:nowrap}.ice-bottom span{color:#bfd5e3}.ice-disclaimer{font-size:10px!important;line-height:1.6;color:#95abc1!important;margin:12px 0 0!important}@media(max-width:1140px){.ice-grid{grid-template-columns:1fr 1fr}.ice-grid .ice-panel:last-child{grid-column:1/-1}.ice-voxel{grid-template-columns:repeat(5,1fr)}}@media(max-width:690px){.ice-root{padding:14px}.ice-toolbar{align-items:flex-start;flex-direction:column}.ice-timeline{grid-template-columns:1fr;gap:12px}.ice-grid{grid-template-columns:1fr}.ice-grid .ice-panel:last-child{grid-column:auto}.ice-bottom{align-items:flex-start;flex-direction:column}.ice-voxel{grid-template-columns:repeat(3,1fr)}}
    `}</style>
  </div>;
}
