import React, { useMemo, useState } from 'react';

type Event = {x:number;y:number;t:number;p:1|-1};
const W=28,H=18,DURATION=180,C=0.26;
// Deterministic, synthetic log-brightness field: moving vertical bright bar.
const brightness=(x:number,y:number,t:number)=>{
  const center=3+(t/DURATION)*21;
  const near=(z:number)=>1/(1+Math.exp(-1.45*z));
  const bar=near(x-center+3)-near(x-center-3);
  const texture=.055*Math.sin(y*.75+x*.27);
  return .85*bar+texture;
};
function generate():Event[]{
  const refs=Array.from({length:W*H},(_,i)=>brightness(i%W,Math.floor(i/W),0));
  const out:Event[]=[];
  for(let t=1;t<=DURATION;t++)for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const idx=y*W+x,L=brightness(x,y,t);
    while(L-refs[idx]>=C){refs[idx]+=C;out.push({x,y,t,p:1});}
    while(L-refs[idx]<=-C){refs[idx]-=C;out.push({x,y,t,p:-1});}
  }
  return out.sort((a,b)=>a.t-b.t||a.y-b.y||a.x-b.x);
}
const all=generate();
const blue='#38c8ef',orange='#ff9374';
export default function EventDataExplorer(){
  const [time,setTime]=useState(90);
  const [windowMs,setWindowMs]=useState(30);
  const [mode,setMode]=useState<'events'|'frame'|'voxel'|'surface'>('events');
  const [pol,setPol]=useState<'both'|'on'|'off'>('both');
  const [selected,setSelected]=useState<number|null>(null);
  const inWindow=useMemo(()=>all.filter(e=>e.t<=time&&e.t>time-windowMs&&(pol==='both'||(pol==='on'?e.p===1:e.p===-1))),[time,windowMs,pol]);
  const counts=useMemo(()=>{const a=Array.from({length:W*H},()=>0);inWindow.forEach(e=>a[e.y*W+e.x]+=e.p);return a;},[inWindow]);
  const recent=useMemo(()=>{const a=Array.from({length:W*H},()=>-Infinity);all.forEach(e=>{if(e.t<=time&&(pol==='both'||(pol==='on'?e.p===1:e.p===-1)))a[e.y*W+e.x]=e.t;});return a;},[time,pol]);
  const timeBins=5;const active=inWindow.length;const totalOn=inWindow.filter(e=>e.p===1).length;
  const pixels=Array.from({length:W*H},(_,i)=>({x:i%W,y:Math.floor(i/W),i}));
  const dots=(events:Event[])=>events.map((e,i)=><circle key={`${i}-${e.t}`} cx={e.x+.5} cy={e.y+.5} r={.31} fill={e.p===1?blue:orange} opacity={.9}/>);
  const norm=(v:number)=>Math.min(1,Math.abs(v)/3);
  const image=(bin:number|null)=>{
    const entries=bin===null?counts:(()=>{const a=Array.from({length:W*H},()=>0);inWindow.forEach(e=>{if(Math.min(4,Math.floor((e.t-(time-windowMs))/windowMs*5))===bin)a[e.y*W+e.x]+=e.p;});return a;})();
    return <svg viewBox={`0 0 ${W} ${H}`} className="evl-pixel-grid" role="img" aria-label="Event polarity accumulation on sensor grid">
      <rect width={W} height={H} fill="#0a1526"/>{pixels.map(({x,y,i})=>{const v=entries[i];return v?<rect key={i} x={x} y={y} width=".96" height=".96" fill={v>0?blue:orange} opacity={.25+.75*norm(v)}/>:null;})}
    </svg>;
  };
  const view=()=>{
    if(mode==='voxel')return <div className="evl-bins">{Array.from({length:timeBins},(_,i)=><div key={i}><span>Bin {i+1}</span>{image(i)}</div>)}</div>;
    if(mode==='frame')return image(null);
    if(mode==='surface')return <svg viewBox={`0 0 ${W} ${H}`} className="evl-pixel-grid" role="img" aria-label="Latest-event time surface">
      <rect width={W} height={H} fill="#0a1526"/>{pixels.map(({x,y,i})=>{const age=time-recent[i];if(!Number.isFinite(age))return null;return <rect key={i} x={x} y={y} width=".96" height=".96" fill={blue} opacity={.10+.90*Math.exp(-age/22)}/>;})}
    </svg>;
    return <svg viewBox={`0 0 ${W} ${H}`} className="evl-pixel-grid" role="img" aria-label="Raw events as spatial points"><rect width={W} height={H} fill="#0a1526"/>{dots(inWindow)}</svg>;
  };
  const selectedEvent=selected===null?null:inWindow[selected]||null;
  return <section className="evl-stream">
    <div className="evl-stream-head"><div><div className="evl-kicker">INTERACTIVE DATA EXPLORER</div><h3>From event tuples to representations.</h3><p>Move through a short event sequence and inspect the raw data behind each visualization.</p></div><span className="evl-tag">SYNTHETIC · 28 × 18 PIXELS</span></div>
    <div className="evl-controls-row"><label>Observation time <b>{time} ms</b><input type="range" min="20" max={DURATION} value={time} step="1" onChange={e=>{setTime(+e.target.value);setSelected(null);}}/></label><label>Time window <b>{windowMs} ms</b><input type="range" min="10" max="70" step="5" value={windowMs} onChange={e=>{setWindowMs(+e.target.value);setSelected(null);}}/></label><label>Polarity <select value={pol} onChange={e=>setPol(e.target.value as typeof pol)}><option value="both">ON + OFF</option><option value="on">ON only</option><option value="off">OFF only</option></select></label></div>
    <div className="evl-tabs" role="group" aria-label="Representation selector">{([['events','Raw events'],['frame','Event frame'],['voxel','Voxel grid · 5 bins'],['surface','Time surface']] as const).map(([key,title])=><button key={key} className={mode===key?'active':''} onClick={()=>setMode(key)}>{title}</button>)}</div>
    <div className="evl-stream-content"><div className="evl-visual"><div className="evl-pane-header"><span>{mode==='events'?'Event coordinates (x, y)':mode==='frame'?'Signed event accumulation':mode==='voxel'?'Spatiotemporal bins':'Last-event timestamp decay'}</span><small>t ∈ ({time-windowMs}, {time}] ms</small></div>{view()}<div className="evl-legend"><span><i style={{background:blue}}/> ON (+1)</span><span><i style={{background:orange}}/> OFF (−1)</span>{mode==='surface'&&<small>Brightness = exp(−age / 22 ms)</small>}</div></div>
    <div className="evl-data"><div className="evl-pane-header"><span>Event stream · (x, y, t, p)</span><small>{active} events</small></div><div className="evl-table-scroll"><table><thead><tr><th>#</th><th>x</th><th>y</th><th>t (ms)</th><th>p</th></tr></thead><tbody>{inWindow.slice(0,18).map((e,i)=><tr key={i} className={selected===i?'chosen':''} onClick={()=>setSelected(i)}><td>{i+1}</td><td>{e.x}</td><td>{e.y}</td><td>{e.t}</td><td style={{color:e.p===1?blue:orange}}>{e.p>0?'+1':'−1'}</td></tr>)}</tbody></table></div><div className="evl-selected">{selectedEvent?`Selected: e = (${selectedEvent.x}, ${selectedEvent.y}, ${selectedEvent.t} ms, ${selectedEvent.p>0?'+1':'−1'})`:`Select a row to inspect an event. Showing first 18 of ${active}.`}</div></div></div>
    <div className="evl-stream-footer"><div><strong>{active}</strong><span>Events in window</span></div><div><strong>{totalOn}</strong><span>ON events</span></div><div><strong>{active-totalOn}</strong><span>OFF events</span></div><div><strong>{all.length}</strong><span>Full 180 ms stream</span></div></div>
    <p className="evl-disclaimer">Teaching example, not an MVSEC recording. A moving bright bar is sampled at 1 ms; each pixel emits threshold-crossing events with C = 0.26 in log-brightness units. The 5-bin voxel view shows signed event counts (without temporal interpolation). Next lab: repeat with MVSEC indoor_flying1.</p>
    <style>{`
      .evl-stream{background:#111d31;color:#d8e8f4;border:1px solid #31445a;border-radius:18px;padding:26px;margin:30px 0;font-family:system-ui,sans-serif}.evl-stream-head{display:flex;justify-content:space-between;gap:20px;align-items:start}.evl-stream h3{color:#fff;font-size:clamp(22px,2.5vw,31px);line-height:1.2;margin:6px 0 8px}.evl-stream p{color:#acbed0;font-size:14px;line-height:1.6;margin:0}.evl-kicker{font-size:11px;letter-spacing:.12em;color:#42c9f0;font-weight:700}.evl-tag{font-size:10px;white-space:nowrap;color:#aad3e4;border:1px solid #355066;padding:8px 11px;border-radius:40px}.evl-controls-row{display:grid;grid-template-columns:1fr 1fr .72fr;gap:18px;margin:24px 0}.evl-controls-row label{font-size:12px;display:flex;flex-direction:column;gap:10px;color:#afc1d3}.evl-controls-row label b{color:#fff}.evl-controls-row input{accent-color:#38c8ef;width:100%}.evl-controls-row select{width:100%;padding:9px;border-radius:7px;background:#172940;color:#fff;border:1px solid #3e5366}.evl-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}.evl-tabs button{border:1px solid #394f64;border-radius:8px;background:#17273e;color:#b7cadd;padding:10px 13px;cursor:pointer;font-size:12px}.evl-tabs button.active{background:#1f6a87;color:#fff;border-color:#39c4e7}.evl-stream-content{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(265px,.75fr);gap:16px}.evl-visual,.evl-data{border:1px solid #31455b;border-radius:12px;overflow:hidden;background:#0b1729}.evl-visual{padding:15px;display:flex;flex-direction:column;justify-content:space-between}.evl-pane-header{display:flex;justify-content:space-between;gap:10px;font-size:12px;font-weight:650;color:#dfecfa;margin-bottom:13px}.evl-pane-header small{font-weight:400;color:#8ba0b8}.evl-pixel-grid{width:100%;max-height:330px;aspect-ratio:28/18;image-rendering:pixelated;display:block}.evl-bins{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.evl-bins>div:last-child{grid-column:1/-1;max-width:50%;margin:auto}.evl-bins span{font-size:10px;color:#b0c3d4}.evl-bins .evl-pixel-grid{margin-top:3px}.evl-legend{display:flex;align-items:center;gap:17px;flex-wrap:wrap;margin-top:13px;color:#adbdce;font-size:11px}.evl-legend span{display:flex;gap:6px;align-items:center}.evl-legend i{height:8px;width:8px;display:inline-block;border-radius:50%}.evl-table-scroll{max-height:330px;overflow:auto}.evl-data table{border-collapse:collapse;width:100%;font-size:11px;color:#b8c9da}.evl-data th{position:sticky;top:0;background:#192c42;text-align:left;padding:8px}.evl-data td{border-top:1px solid #26374a;padding:6px 8px;font-variant-numeric:tabular-nums}.evl-data tr{cursor:pointer}.evl-data tbody tr:hover,.evl-data tr.chosen{background:#25415e}.evl-data .evl-selected{border-top:1px solid #2e4358;padding:11px;font-size:11px;color:#9db5c9}.evl-stream-footer{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:15px}.evl-stream-footer div{padding:12px;background:#182b42;border-radius:9px;display:flex;flex-direction:column;gap:5px}.evl-stream-footer strong{font-size:22px;color:#fff}.evl-stream-footer span{font-size:10px;color:#acc1d2}.evl-disclaimer{font-size:11px!important;margin-top:14px!important;color:#8fa8c0!important}@media(max-width:750px){.evl-stream{padding:14px}.evl-stream-head{flex-direction:column}.evl-controls-row{grid-template-columns:1fr}.evl-stream-content{grid-template-columns:1fr}.evl-stream-footer{grid-template-columns:repeat(2,1fr)}}
    `}</style>
  </section>;
}
