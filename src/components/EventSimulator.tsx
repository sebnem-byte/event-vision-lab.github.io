import React, { useMemo, useState } from 'react';

/** Simplified ideal DVS pixel with a reference level updated by ±C per event. */
export default function EventSimulator() {
  const [threshold,setThreshold] = useState(0.22);
  const [amplitude,setAmplitude] = useState(0.95);
  const [frequency,setFrequency] = useState(1.3);
  const data = useMemo(() => {
    const count = 620;
    const signal = (t:number) => amplitude*Math.sin(2*Math.PI*frequency*t) + 0.1*Math.sin(2*Math.PI*0.33*t);
    let ref = signal(0);
    const events: {t:number,p:number,level:number}[] = [];
    const samples: {t:number,L:number}[] = [];
    for(let i=0;i<=count;i++){
      const t=i/count; const L=signal(t); samples.push({t,L});
      while(L-ref>=threshold){ref+=threshold;events.push({t,p:1,level:ref});}
      while(L-ref<=-threshold){ref-=threshold;events.push({t,p:-1,level:ref});}
    }
    return {samples,events};
  },[threshold,amplitude,frequency]);
  const W=850, H=265, left=36, right=18, top=16, baseline=205;
  const x=(t:number)=>left+t*(W-left-right);
  const y=(v:number)=> 116-v*72;
  const path=data.samples.map((s,i)=>`${i?'L':'M'}${x(s.t).toFixed(2)} ${y(s.L).toFixed(2)}`).join(' ');
  const pos=data.events.filter(e=>e.p===1).length;
  const neg=data.events.length-pos;
  return <div className="dvs-widget">
    <div className="dvs-controls">
      <label>Contrast threshold <strong>C = {threshold.toFixed(2)}</strong><input aria-label="Contrast threshold" type="range" min="0.08" max="0.6" step="0.02" value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/></label>
      <label>Log-intensity amplitude <strong>{amplitude.toFixed(2)}</strong><input aria-label="Log-intensity amplitude" type="range" min="0.15" max="1.35" step="0.05" value={amplitude} onChange={e=>setAmplitude(Number(e.target.value))}/></label>
      <label>Motion frequency <strong>{frequency.toFixed(1)} Hz</strong><input aria-label="Motion frequency" type="range" min="0.5" max="4" step="0.1" value={frequency} onChange={e=>setFrequency(Number(e.target.value))}/></label>
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Simulated log brightness signal and ON OFF events on a common time axis">
      {[0,1,2,3,4].map(i=><line key={i} x1={left} x2={W-right} y1={32+i*39} y2={32+i*39} stroke="currentColor" opacity=".09" />)}
      <path d={path} stroke="#34c5e7" strokeWidth="3" fill="none" />
      <line x1={left} x2={W-right} y1={baseline} y2={baseline} stroke="currentColor" opacity=".4" />
      {data.events.map((e,i)=><line key={i} x1={x(e.t)} x2={x(e.t)} y1={baseline} y2={e.p===1?baseline-30:baseline+30} stroke={e.p===1?'#25bcf4':'#fb8b69'} strokeWidth="2" opacity=".8"/>)}
      <text x="40" y="22" fill="currentColor" fontSize="12" opacity=".8">Log intensity L(t)</text>
      <text x="40" y="260" fill="currentColor" fontSize="12" opacity=".8">Events over time →</text>
      <text x="742" y="202" fill="currentColor" fontSize="11" opacity=".7">t = 1 s</text>
    </svg>
    <div className="dvs-summary"><span><i className="dot on"/> ON events: <b>{pos}</b></span><span><i className="dot off"/> OFF events: <b>{neg}</b></span><span>Total: <b>{data.events.length}</b></span></div>
    <p className="dvs-note">Idealized single-pixel simulation. The reference log brightness is reset by ±C after each event; sensor noise, refractory periods and bandwidth limits are omitted.</p>
    <style>{`
      .dvs-widget{background:#111d31;color:#d8e8f4;border:1px solid #31445a;border-radius:18px;padding:22px;margin:22px 0;font-family:system-ui,sans-serif;}
      .dvs-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.dvs-controls label{font-size:13px;display:flex;flex-direction:column;gap:9px;color:#b7c8d7}.dvs-controls strong{color:white}.dvs-controls input{width:100%;accent-color:#39c3e6}.dvs-widget svg{width:100%;display:block;margin-top:12px}.dvs-summary{display:flex;gap:22px;flex-wrap:wrap;font-size:13px}.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}.on{background:#25bcf4}.off{background:#fb8b69}.dvs-note{color:#9eb0c1;font-size:12px;margin:15px 0 0!important;line-height:1.5}@media(max-width:650px){.dvs-controls{grid-template-columns:1fr}.dvs-widget{padding:13px}}
    `}</style>
  </div>
}
