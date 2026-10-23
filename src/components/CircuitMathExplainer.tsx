import React, { useEffect, useMemo, useRef, useState } from 'react';

/** Educational, idealised pixel model. Synthetic data, not a measured DAVIS response. */
type Ev = { x: number; y: number; t: number; p: 1 | -1 };
const W = 62, H = 36, T = 240, DT = 3;
const cyan = '#38c9ef', coral = '#fb9275';
const px = (t: number) => 9 + 44*t/T;
const py = (t: number) => 18 + 1.8*Math.sin(2*Math.PI*t/T);
const intensity = (x: number, y: number, t: number) => {
  const r = Math.hypot(x-px(t),y-py(t));
  const coverage = 1/(1+Math.exp(Math.max(-30,Math.min(30,(r-5.6)*2.3))));
  return 0.085 + 0.85*coverage;
};
const logI = (x:number,y:number,t:number) => Math.log(intensity(x,y,t));
function generate(C:number):Ev[] {
  const ref = new Float64Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)ref[y*W+x]=logI(x,y,0);
  const result:Ev[]=[];
  for(let t=DT;t<=T;t+=DT)for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const n=y*W+x, l=logI(x,y,t);
    let count=0;
    while(l-ref[n]>=C && count++<12){ref[n]+=C;result.push({x,y,t,p:1});}
    count=0;
    while(l-ref[n]<=-C && count++<12){ref[n]-=C;result.push({x,y,t,p:-1});}
  }
  return result;
}
function Scene({time, selected, onSelect, events, windowMs, mode}:{time:number;selected:{x:number;y:number};onSelect:(p:{x:number;y:number})=>void;events:Ev[];windowMs:number;mode:'frame'|'events'}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    canvas.width=W*5;canvas.height=H*5;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const image=ctx.createImageData(W,H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const i=4*(y*W+x),v=Math.round(intensity(x,y,time)*255);
      image.data[i]=mode==='frame'?v:8;image.data[i+1]=mode==='frame'?v:19;image.data[i+2]=mode==='frame'?v:36;image.data[i+3]=255;
    }
    if(mode==='events')for(const e of events){
      if(e.t>time||e.t<=time-windowMs)continue;
      const i=4*(e.y*W+e.x);
      if(e.p===1){image.data[i]=56;image.data[i+1]=201;image.data[i+2]=239;}
      else{image.data[i]=251;image.data[i+1]=146;image.data[i+2]=117;}
    }
    const off=document.createElement('canvas');off.width=W;off.height=H;
    off.getContext('2d')?.putImageData(image,0,0);
    ctx.imageSmoothingEnabled=false;ctx.drawImage(off,0,0,canvas.width,canvas.height);
    if(mode==='frame'){
      ctx.strokeStyle=cyan;ctx.lineWidth=2;ctx.strokeRect(selected.x*5,selected.y*5,5,5);
      ctx.strokeStyle='rgba(56,201,239,.40)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(selected.x*5+2,0);ctx.lineTo(selected.x*5+2,H*5);ctx.moveTo(0,selected.y*5+2);ctx.lineTo(W*5,selected.y*5+2);ctx.stroke();
    }
  },[time,selected,events,windowMs,mode]);
  return <canvas ref={ref} className="cme-scene" aria-label={mode==='frame'?'Synthetic grayscale frame; click to select a pixel':'Event accumulation in a temporal window'} onClick={e=>{if(mode!=='frame'||!ref.current)return;const r=ref.current.getBoundingClientRect();onSelect({x:Math.max(0,Math.min(W-1,Math.floor((e.clientX-r.left)/r.width*W))),y:Math.max(0,Math.min(H-1,Math.floor((e.clientY-r.top)/r.height*H)))});}}/>;
}
export default function CircuitMathExplainer(){
  const [time,setTime]=useState(116),[playing,setPlaying]=useState(false),[C,setC]=useState(.38),[windowMs,setWindowMs]=useState(48),[selected,setSelected]=useState({x:32,y:18});
  const [view,setView]=useState<'events'|'voxel'>('events');
  const [stage,setStage]=useState(2);
  const evs=useMemo(()=>generate(C),[C]);
  const atPixel=useMemo(()=>evs.filter(e=>e.x===selected.x&&e.y===selected.y),[evs,selected]);
  const occurred=atPixel.filter(e=>e.t<=time);
  const current=logI(selected.x,selected.y,time);
  const reference=logI(selected.x,selected.y,0)+occurred.reduce((s,e)=>s+e.p*C,0);
  const delta=current-reference;
  const last=occurred[occurred.length-1];
  const windowEvents=evs.filter(e=>e.t<=time&&e.t>time-windowMs);
  const bins=Array.from({length:5},(_,j)=>windowEvents.filter(e=>Math.min(4,Math.floor((e.t-(time-windowMs))*5/windowMs))===j));
  useEffect(()=>{if(!playing)return;let previous=0,id=0;const tick=(stamp:number)=>{if(previous)setTime(v=>(v+(stamp-previous)*.065)%T);previous=stamp;id=requestAnimationFrame(tick);};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[playing]);
  const signal=Array.from({length:T/DT+1},(_,i)=>({t:i*DT,l:logI(selected.x,selected.y,i*DT)}));
  const min=Math.min(...signal.map(v=>v.l))-.16,max=Math.max(...signal.map(v=>v.l))+.16;
  const X=(v:number)=>35+v/T*455,Y=(v:number)=>17+(max-v)/(max-min)*135;
  const signalPath=signal.map((v,i)=>`${i?'L':'M'}${X(v.t).toFixed(1)} ${Y(v.l).toFixed(1)}`).join(' ');
  const refSteps=[{t:0,l:logI(selected.x,selected.y,0)}];
  for(const e of atPixel){refSteps.push({t:e.t,l:refSteps[refSteps.length-1].l});refSteps.push({t:e.t,l:refSteps[refSteps.length-1].l+e.p*C});}
  refSteps.push({t:T,l:refSteps[refSteps.length-1].l});
  const refPath=refSteps.map((v,i)=>`${i?'L':'M'}${X(v.t).toFixed(1)} ${Y(v.l).toFixed(1)}`).join(' ');
  return <div className="cme-root">
    <style>{`
      .cme-root{background:#101d32;color:#edf6ff;border:1px solid #263e5a;border-radius:18px;padding:clamp(14px,2.5vw,25px);font-family:inherit;max-width:100%;overflow:hidden}
      .cme-root *{box-sizing:border-box}.cme-head{display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px;margin-bottom:17px}.cme-kicker{color:${cyan};font-size:11px;letter-spacing:.13em;font-weight:750}
      .cme-head h3{color:white;font-size:clamp(19px,2.4vw,27px);margin:4px 0 5px}.cme-root p{color:#b5c7db;line-height:1.6;font-size:13px;margin:5px 0}.cme-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:12px;background:#0b172a;border-radius:12px;margin-bottom:16px}
      .cme-controls label{font-size:12px;color:#c5d8ee}.cme-controls strong{float:right;color:white;font-size:12px}.cme-controls input{width:100%;accent-color:${cyan};margin-top:9px}.cme-root button{background:#162d45;border:1px solid #34516d;color:#edf6ff;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px}.cme-root button[aria-pressed="true"]{background:#087ca4;border-color:${cyan};color:white}.cme-buttons{display:flex;gap:7px;flex-wrap:wrap}
      .cme-panels{display:grid;grid-template-columns:1fr 1.32fr 1fr;gap:11px}.cme-panel{min-width:0;border:1px solid #31506e;border-radius:12px;padding:12px;background:#0d1a2c}.cme-panel h4{color:#edf6ff;font-size:14px;margin:0 0 4px}.cme-sub{font-size:11px!important;color:#91b6d4!important;margin-bottom:12px!important}.cme-number{display:inline-grid;place-items:center;border:1px solid ${cyan};border-radius:50%;color:${cyan};height:25px;width:25px;margin-right:6px;font-size:12px}
      .cme-scene{width:100%;height:auto;display:block;border:1px solid #34506a;border-radius:7px;image-rendering:pixelated;cursor:crosshair}.cme-readout{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:#aec2da;margin-top:10px}.cme-readout b{color:#f0f8ff}.cme-flow{display:grid;gap:7px;margin:11px 0}.cme-step{border:1px solid #34506c;border-radius:8px;padding:8px;cursor:pointer;text-align:left}.cme-step.active{border-color:${cyan};background:#0c314b}.cme-step strong{display:block;font-size:12px;color:white}.cme-step small{color:#a6bed8;font-size:11px}.cme-arrow{color:${cyan};text-align:center;font-size:12px}.cme-formula{font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;line-height:1.9;background:#081625;padding:10px;border:1px solid #23425c;border-radius:8px;overflow-x:auto;white-space:nowrap}.cme-formula b{color:${cyan}}.cme-graph{width:100%;height:auto;border:1px solid #29445b;border-radius:8px;background:#091526}.cme-leg{display:flex;flex-wrap:wrap;gap:12px;color:#b9cce1;font-size:10px;margin:7px 0}.cme-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}.cme-voxel{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;align-items:start}.cme-bin{min-width:0}.cme-bin canvas{width:100%;height:auto}.cme-bin span{display:block;text-align:center;font-size:10px;color:#c1d1e3}.cme-footer{margin-top:13px;display:grid;grid-template-columns:1.15fr 1fr;gap:12px}.cme-footer section{background:#0b172a;border:1px solid #294662;border-radius:10px;padding:13px}.cme-footer h4{margin:0 0 5px;font-size:13px;color:white}.cme-note{border-top:1px solid #34506a;margin-top:14px;padding-top:10px;color:#94adc8;font-size:11px;line-height:1.5}
      @media(max-width:1100px){.cme-panels{grid-template-columns:1fr 1fr}.cme-panel:last-child{grid-column:1/-1}}@media(max-width:680px){.cme-panels,.cme-footer,.cme-controls{grid-template-columns:1fr}.cme-panel:last-child{grid-column:auto}.cme-root{padding:12px}}
    `}</style>
    <header className="cme-head"><div><div className="cme-kicker">INTERACTIVE FUNDAMENTALS · ANALOG + MATHEMATICAL + BIOLOGICAL</div><h3>From light to asynchronous events</h3><p>Explore how a change in light becomes an electrical signal, crosses a threshold, and produces a spike-like digital event.</p></div><div className="cme-buttons"><button onClick={()=>setPlaying(v=>!v)}>{playing?'❚❚ Pause':'▶ Play'}</button><button onClick={()=>{setPlaying(false);setTime(116);setC(.38);setWindowMs(48);setSelected({x:32,y:18});setView('events');setStage(2);}}>↺ Reset</button></div></header>
    <div className="cme-controls"><label>Time <strong>{Math.round(time)} ms</strong><input type="range" min="0" max={T} step="1" value={time} onChange={e=>{setPlaying(false);setTime(+e.target.value);}}/></label><label>Contrast threshold <strong>C = {C.toFixed(2)}</strong><input type="range" min="0.14" max="0.7" step="0.04" value={C} onChange={e=>setC(+e.target.value)}/></label><label>Event window <strong>{windowMs} ms</strong><input type="range" min="12" max="96" step="6" value={windowMs} onChange={e=>setWindowMs(+e.target.value)}/></label></div>
    <div className="cme-panels">
      <section className="cme-panel"><h4><span className="cme-number">1</span>Conventional image</h4><p className="cme-sub">Scene brightness I(x, y, t) · choose a pixel</p><Scene mode="frame" time={time} selected={selected} onSelect={setSelected} events={evs} windowMs={windowMs}/><p>Click on a pixel. The blue marker selects the photoreceptor monitored in the middle panel.</p><div className="cme-readout"><span>Pixel <b>({selected.x}, {selected.y})</b></span><span>I = <b>{intensity(selected.x,selected.y,time).toFixed(3)}</b></span></div><p><strong>Conventional APS:</strong> samples intensity at frame times. <strong>DVS:</strong> continuously monitors local temporal contrast.</p></section>
      <section className="cme-panel"><h4><span className="cme-number">2</span>Inside one event pixel</h4><p className="cme-sub">Simplified analog circuit ↔ idealised mathematical model</p>
        <div className="cme-flow">{[
          ['Photodiode + log photoreceptor','Light → photocurrent → voltage proportional to log intensity','Photoreceptors turn incident photons into electrical current. A logarithmic front end compresses brightness variations.'],
          ['Differencing amplifier','Current signal − stored reference','An analog change-sensitive path compares the present log-intensity signal against a level established after the last event.'],
          ['ON / OFF comparators','Threshold crossing: ΔL ≥ C or ΔL ≤ −C','Separate positive and negative comparisons initiate ON and OFF events. The thresholds need not be identical in hardware.'],
          ['Reset and asynchronous readout','Update reference; output (x, y, t, p)','After an event, the change detector is reset. Pixel address and polarity are read out asynchronously, and timestamps are assigned in the sensor system.']
        ].map((s,i)=><React.Fragment key={i}><button className={`cme-step ${stage===i?'active':''}`} onClick={()=>setStage(i)} aria-pressed={stage===i}><strong>{i+1}. {s[0]}</strong><small>{s[1]}</small></button>{i<3&&<div className="cme-arrow">↓</div>}</React.Fragment>)}</div>
        <p><strong style={{color:cyan}}>Electronic explanation:</strong> {[
          'Photoreceptors turn incident photons into electrical current. A logarithmic front end compresses brightness variations.',
          'An analog change-sensitive path compares the present log-intensity signal against a level established after the last event.',
          'Separate positive and negative comparisons initiate ON and OFF events. The thresholds need not be identical in hardware.',
          'After an event, the change detector is reset. Pixel address and polarity are read out asynchronously, and timestamps are assigned in the sensor system.'
        ][stage]}</p>
        <div className="cme-formula">L(t) = log I(t)<br/>ΔL(t) = L(t) − L<sub>ref</sub><br/><b>ON:</b> ΔL ≥ +C &nbsp; | &nbsp; <span style={{color:coral}}>OFF:</span> ΔL ≤ −C<br/>L<sub>ref,new</sub> = L<sub>ref,old</sub> + pC</div>
        <svg className="cme-graph" viewBox="0 0 510 198" aria-label="Selected pixel log intensity, reference and event times"><path d="M35 12V167H493" stroke="#58708b" fill="none"/><path d={signalPath} fill="none" stroke={cyan} strokeWidth="2.8"/><path d={refPath} fill="none" stroke="#f1bc68" strokeWidth="1.5" strokeDasharray="5 4"/>{atPixel.map((e,i)=><circle key={i} cx={X(e.t)} cy={Y(logI(e.x,e.y,e.t))} r="3" fill={e.p===1?cyan:coral}/>)}<line x1={X(time)} x2={X(time)} y1="12" y2="167" stroke="#eaf5ff" strokeDasharray="3 4" opacity=".6"/><text x="40" y="183" fontSize="11" fill="#b8cce1">0 ms</text><text x="490" y="183" textAnchor="end" fontSize="11" fill="#b8cce1">240 ms</text><text x="40" y="12" fontSize="11" fill="#b8cce1">Log intensity</text></svg>
        <div className="cme-leg"><span><i className="cme-dot" style={{background:cyan}}/>L(t) and ON</span><span><i className="cme-dot" style={{background:coral}}/>OFF</span><span><i className="cme-dot" style={{background:'#f1bc68'}}/>Reference (dashed)</span></div><div className="cme-readout"><span>L = <b>{current.toFixed(2)}</b></span><span>L<sub>ref</sub> = <b>{reference.toFixed(2)}</b></span><span>ΔL = <b>{delta.toFixed(2)}</b></span></div>
      </section>
      <section className="cme-panel"><h4><span className="cme-number">3</span>Event representation</h4><p className="cme-sub">Sparse output from the same moving circle</p><div className="cme-buttons" style={{marginBottom:10}}><button aria-pressed={view==='events'} onClick={()=>setView('events')}>Event image</button><button aria-pressed={view==='voxel'} onClick={()=>setView('voxel')}>5-bin voxel</button></div>{view==='events'?<Scene mode="events" time={time} selected={selected} onSelect={setSelected} events={evs} windowMs={windowMs}/>:<div className="cme-voxel">{bins.map((group,i)=><div className="cme-bin" key={i}><svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',background:'#081326',border:'1px solid #314a63'}}>{group.map((e,j)=><rect key={j} x={e.x} y={e.y} width="1.2" height="1.2" fill={e.p===1?cyan:coral}/>)}</svg><span>bin {i+1}</span><span>{group.length}</span></div>)}</div>}<div className="cme-leg"><span><i className="cme-dot" style={{background:cyan}}/>ON (+1)</span><span><i className="cme-dot" style={{background:coral}}/>OFF (−1)</span></div><div className="cme-readout"><span>Window events</span><b>{windowEvents.length}</b></div><p>Events carry <strong>location, timestamp, and polarity</strong>; no full grayscale intensity image is transmitted by a pure DVS event channel.</p><div className="cme-formula">e<sub>k</sub> = (x<sub>k</sub>, y<sub>k</sub>, t<sub>k</sub>, p<sub>k</sub>)<br/>{last?`Selected pixel's last event: (${last.x}, ${last.y}, ${last.t} ms, ${last.p>0?'+1':'−1'})`:'No event yet at selected pixel'}</div><p><strong>Voxel grid:</strong> the window is partitioned into five temporal slices. This visualization uses simple event-bin accumulation (not temporal interpolation).</p></section>
    </div>
    <div className="cme-footer"><section><h4>Neuromorphic analogy: retina → event pixel</h4><p><strong>Photoreceptor:</strong> converts light to an electrical signal. <strong>Bipolar-like change pathway:</strong> emphasizes local temporal contrast. <strong>Ganglion-like output:</strong> emits discrete ON/OFF messages when the contrast is sufficient.</p><p>This is a <strong>functional analogy</strong>, not an exact biological circuit or claim that DVS pixels reproduce retinal spike trains.</p></section><section><h4>Read the circuit and the equation together</h4><p>Each pixel remembers a reference level. A sufficiently large change in logarithmic brightness triggers an event; then its reference is updated. In a static scene with stable illumination, an ideal pixel remains silent.</p><p><strong>Experiment:</strong> move the time slider, click a different pixel, and raise C to observe fewer events.</p></section></div>
    <div className="cme-note">Synthetic teaching model · one moving bright disc · ideal symmetric contrast thresholds · finite simulation step {DT} ms. Sensor noise, transistor mismatch, refractory behavior, bandwidth limits and analog readout delays are omitted. Primary reading: Gallego et al., “Event-Based Vision: A Survey,” IEEE TPAMI 2022, Section 2 and Fig. 1.</div>
  </div>;
}
