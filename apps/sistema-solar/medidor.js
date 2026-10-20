/* Sistema Solar VR · Medidor de quadros (v9.20)
   Escondido por padrão. Liga abrindo o app uma vez com ?fps=1 no endereço; fica lembrado no aparelho até abrir com ?fps=0.
   Mostra quadros por segundo (média de 1 s), o pior segundo dos últimos 10 s e o quadro mais lento (ms).
   No 3D aparece embaixo, no centro da tela; no óculos, numa plaquinha presa à visão, abaixo do centro.
   Referência no Quest: 72 qps é o mínimo confortável; abaixo de 60 por vários segundos, há risco de enjoo. */
(function(){'use strict';
/* ?fps=1 liga e fica lembrado neste aparelho (vale também entrando pelo catálogo); ?fps=0 desliga */
let ligado=false;try{if(/[?&]fps=1\b/.test(location.search))localStorage.setItem('pde_fps','1');if(/[?&]fps=0\b/.test(location.search))localStorage.removeItem('pde_fps');ligado=localStorage.getItem('pde_fps')==='1';}catch(_){ligado=/[?&]fps=1\b/.test(location.search);}
if(!ligado)return;
function pronto(fn){if(window.THREE&&typeof atualizarLabels==='function'&&typeof camera!=='undefined'&&camera)fn();else setTimeout(()=>pronto(fn),100);}
pronto(()=>{
const T=THREE;let n=0,ini=performance.now(),ult=ini,pior=0,hist=[],qps=0;
const div=document.createElement('div');div.style.cssText='position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:50;background:rgba(0,0,0,.82);color:#9fffb0;font:700 16px/1.3 "Segoe UI",Arial,sans-serif;padding:7px 14px;border-radius:10px;border:2px solid currentColor;pointer-events:none;white-space:pre';(document.querySelector('.palco')||document.body).appendChild(div);
let placa=null,ctx=null,tex=null;
function placaVR(){if(placa)return;const c=document.createElement('canvas');c.width=768;c.height=96;ctx=c.getContext('2d');tex=new T.CanvasTexture(c);
 placa=new T.Mesh(new T.PlaneGeometry(.48,.06),new T.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));placa.renderOrder=9999;placa.frustumCulled=false;scene.add(placa);}
/* no óculos a placa acompanha a cabeça a cada quadro (presa à cena, não à câmera: alguns navegadores de óculos não desenham filhos da câmera) */
const _p=new T.Vector3(),_q=new T.Quaternion(),_o=new T.Vector3();
function seguir(){if(!placa||!placa.visible)return;let cam=camera;try{if(renderer.xr.isPresenting)cam=renderer.xr.getCamera(camera);}catch(_){}cam.getWorldPosition(_p);cam.getWorldQuaternion(_q);_o.set(0,-.11,-.75).applyQuaternion(_q);placa.position.copy(_p).add(_o);placa.quaternion.copy(_q);}
/* régua: no óculos o mínimo confortável é ~72 qps; no computador o limite é a tela (quase sempre 60 Hz), então 55+ já é o máximo */
function texto(){const vr=!!(renderer.xr&&renderer.xr.isPresenting),min=hist.length?Math.min(...hist):qps,ok=vr?70:55,lim=vr?60:40,cor=min>=ok?'#9fffb0':min>=lim?'#ffe08a':'#ff8f8f',sel=min>=ok?'ótimo':min>=lim?'no limite':'precisa ajuste';
 const t='Desempenho: '+qps+' quadros/s · pior '+min+' · '+sel+(vr?' (óculos)':' (tela)');div.textContent=t;div.style.color=cor;div.hidden=vr;
 if(vr){placaVR();placa.visible=true;ctx.clearRect(0,0,768,96);ctx.fillStyle='rgba(0,0,0,.82)';ctx.fillRect(0,0,768,96);ctx.strokeStyle=cor;ctx.lineWidth=6;ctx.strokeRect(3,3,762,90);ctx.fillStyle=cor;ctx.font='700 30px Segoe UI,Arial';ctx.fillText(t,16,60);tex.needsUpdate=true;}else if(placa)placa.visible=false;}
const antes=atualizarLabels;
atualizarLabels=function(){const t=performance.now(),d=t-ult;ult=t;if(d<1000)pior=Math.max(pior,d);n++;
 if(t-ini>=1000){qps=Math.round(n*1000/(t-ini));hist.push(qps);if(hist.length>10)hist.shift();n=0;ini=t;texto();pior=0;}
 seguir();return antes.apply(this,arguments);};
});
})();
