/* Sistema Solar VR · Medidor de quadros (v9.20)
   Escondido por padrão. Liga abrindo o app com ?fps=1 no endereço (no computador ou no navegador do Quest).
   Mostra quadros por segundo (média de 1 s), o pior segundo dos últimos 10 s e o quadro mais lento (ms).
   No 3D aparece no canto da tela; no óculos, numa plaquinha presa à visão, abaixo do centro.
   Referência no Quest: 72 qps é o mínimo confortável; abaixo de 60 por vários segundos, há risco de enjoo. */
(function(){'use strict';
if(!/[?&]fps=1\b/.test(location.search))return;
function pronto(fn){if(window.THREE&&typeof atualizarLabels==='function'&&typeof camera!=='undefined'&&camera)fn();else setTimeout(()=>pronto(fn),100);}
pronto(()=>{
const T=THREE;let n=0,ini=performance.now(),ult=ini,pior=0,hist=[],qps=0;
const div=document.createElement('div');div.style.cssText='position:fixed;left:8px;top:8px;z-index:2147483600;background:rgba(0,0,0,.72);color:#9fffb0;font:600 13px/1.3 monospace;padding:6px 9px;border-radius:8px;pointer-events:none;white-space:pre';document.body.appendChild(div);
let placa=null,ctx=null,tex=null;
function placaVR(){if(placa)return;const c=document.createElement('canvas');c.width=512;c.height=96;ctx=c.getContext('2d');tex=new T.CanvasTexture(c);
 placa=new T.Mesh(new T.PlaneGeometry(.32,.06),new T.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));placa.renderOrder=9999;placa.position.set(0,-.17,-.8);camera.add(placa);}
function texto(){const vr=!!(renderer.xr&&renderer.xr.isPresenting),min=hist.length?Math.min(...hist):qps,cor=min>=70?'#9fffb0':min>=60?'#ffe08a':'#ff8f8f';
 const t=qps+' qps · pior '+min+' · '+pior.toFixed(0)+' ms'+(vr?' · VR':'');div.textContent=t;div.style.color=cor;div.hidden=vr;
 if(vr){placaVR();placa.visible=true;ctx.clearRect(0,0,512,96);ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,0,512,96);ctx.fillStyle=cor;ctx.font='700 40px monospace';ctx.fillText(t,16,62);tex.needsUpdate=true;}else if(placa)placa.visible=false;}
const antes=atualizarLabels;
atualizarLabels=function(){const t=performance.now(),d=t-ult;ult=t;if(d<1000)pior=Math.max(pior,d);n++;
 if(t-ini>=1000){qps=Math.round(n*1000/(t-ini));hist.push(qps);if(hist.length>10)hist.shift();n=0;ini=t;texto();pior=0;}
 return antes.apply(this,arguments);};
});
})();
