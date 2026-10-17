/* Portal 360º VR · padrão visual e de conforto do VR (v1.0, out/2026)
   Mesmo acabamento já validado no Corpo Humano 4.13, aplicado por cima da camada *-portal.js dos apps
   Célula, Terra e DNA, sem reescrevê-la:
   1. Botões em pílula com degradê, brilho e sombra; ação principal (botão .primary do painel) em verde vivo com ►.
   2. Painel de texto e fundo do menu com cantos arredondados.
   3. Menu centrado na altura dos olhos, com "Fechar menu" embaixo; painéis e menu um pouco mais longe (1,62 → 1,95 m).
   4. Distância ajustável pelo aluno em 10 níveis (X aproxima, Y afasta no controle esquerdo; também no menu VER),
      guardada no aparelho. A cena se afasta a partir dos olhos sem mudar de tamanho real.
   Fonte única: tools/pde-vr-padrao.js (copiada para cada app por tools/copiar-vr-padrao.sh). Regra 9: sem onclick. */
(function(){'use strict';
const LABS=['CelulaLab','TerraLab','DNALab','CorpoLab'];
function labAtual(){for(const k of LABS){const L=window[k];if(L&&L.view)return L;}return null;}
function pronto(fn,n){const L=labAtual();const P=L&&Object.getPrototypeOf(L.view);if(P&&P.alternarMenuVR&&P.xrBotaoLargo&&P.textPlane&&!P.__vrPadrao)fn(L,P);else if((n||0)<500)setTimeout(()=>pronto(fn,(n||0)+1),60);}
pronto(function(Lab,Proto){
Proto.__vrPadrao=true;
const T=window.THREE,view=Lab.view,APP=(document.body.dataset.app||location.pathname.split('/').filter(Boolean).slice(-2,-1)[0]||'app');
const UI_Z=-1.62,BTN_H=.115,UI_LONGE=1.2,MENU_CENTRO=-.1;

/* ---------- desenho ---------- */
function texturaCanvas(c){const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.generateMipmaps=true;try{tex.anisotropy=view.renderer.capabilities.getMaxAnisotropy();}catch(e){tex.anisotropy=8;}return tex;}
function quebrar(ctx,text,maxW){const out=[];let line='';for(const w of String(text).split(/\s+/)){const n=(line?line+' ':'')+w;if(ctx.measureText(n).width>maxW&&line){out.push(line);line=w;}else line=n;}if(line)out.push(line);return out;}
function pilula(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function clarear(hex,f){const n=parseInt(String(hex).replace('#','').slice(0,6),16);if(isNaN(n))return hex;const c=[n>>16&255,n>>8&255,n&255].map(v=>Math.round(v+(255-v)*f));return 'rgb('+c.join(',')+')';}
const PRIMARIO={bg:'#16c784',bg2:'#0b8f5c',borda:'#8dffd0',texto:'#ffffff',primario:true};
const APERTADO={bg:'#3cc6ea',bg2:'#1c88b0',borda:'#ffffff',texto:'#ffffff'};
/* cores antigas de acerto/erro do Desafio ganham degradê, sem mudar o significado */
function modernizar(cor){if(!cor)return cor;if(cor.borda==='#3fd48a')return{bg:'#16a865',bg2:'#0b7a48',borda:'#7CFFB8',texto:'#ffffff'};if(cor.borda==='#ff6b6b')return{bg:'#d6455a',bg2:'#9c2333',borda:'#ff9aa6',texto:'#ffffff'};if(cor.bg==='#0f6b3a'&&cor.borda==='#7CFFB8')return PRIMARIO;return cor;}
function pintarBotao(c,linhas,size,paleta,disabled){const g=c.getContext('2d'),W=c.width,H=c.height,m=Math.round(H*.07),r=(H-2*m)*.5;g.clearRect(0,0,W,H);
  const base=paleta||{bg:'#17344a',borda:'#4fa3c7',texto:'#eaf6ff'};
  if(!disabled){g.save();g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=H*.08;g.shadowOffsetY=H*.035;pilula(g,m,m,W-2*m,H-2*m,r);g.fillStyle='#000';g.fill();g.restore();}
  pilula(g,m,m,W-2*m,H-2*m,r);const gr=g.createLinearGradient(0,m,0,H-m);
  if(disabled){gr.addColorStop(0,'#162633');gr.addColorStop(1,'#101d27');}else{gr.addColorStop(0,clarear(base.bg,.18));gr.addColorStop(1,base.bg2||base.bg);}
  g.fillStyle=gr;g.fill();
  if(!disabled){g.save();pilula(g,m,m,W-2*m,H-2*m,r);g.clip();const br=g.createLinearGradient(0,m,0,m+(H-2*m)*.5);br.addColorStop(0,'rgba(255,255,255,.22)');br.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=br;g.fillRect(0,m,W,(H-2*m)*.5);g.restore();}
  pilula(g,m,m,W-2*m,H-2*m,r);g.lineWidth=Math.max(4,H*.025);g.strokeStyle=disabled?'rgba(120,150,170,.18)':(base.borda||'#4fa3c7');g.globalAlpha=disabled?1:.85;g.stroke();g.globalAlpha=1;
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=disabled?'#4f6575':(base.texto||'#ffffff');g.font='700 '+size+'px Segoe UI,Arial';
  if(!disabled&&base.primario){g.shadowColor='rgba(0,60,30,.6)';g.shadowBlur=6;}
  const passo=size*1.15,y0=H/2+size*.04-(linhas.length-1)*passo/2;linhas.forEach((l,i)=>g.fillText(l,W/2,y0+i*passo));}
function rotuloPrimario(label,p){return p&&p.primario&&!/[►▶✓↺◀✕☰]/.test(label)?label+'  ►':label;}
function corFinal(v,cmd,cor,disabled){cor=modernizar(cor);if(!cor&&v._primarios&&v._primarios.has(cmd))cor=PRIMARIO;if(cmd==='quiz:next'&&(!cor||cor.bg==='#0f6b3a'))cor=PRIMARIO;
  const a=v._apertado,fixo=cor&&(cor.borda==='#7CFFB8'||cor.borda==='#ff9aa6');if(!disabled&&!fixo&&a&&a.cmd===cmd&&performance.now()-a.t<700){if(!v._flashT)v._flashT=setTimeout(()=>{v._flashT=null;if(v.xr)v.buildXRUI();},740);return APERTADO;}return cor;}

Proto.xrButton=function(label,cmd,x,y,w,disabled,cor){
  w=w||.46;cor=corFinal(this,cmd,cor,disabled);const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');label=rotuloPrimario(label,cor);
  let size=76;g.font='700 '+size+'px Segoe UI,Arial';let linhas=[label];
  if(g.measureText(label).width>880){let l2=quebrar(g,label,880);while(l2.length>2&&size>40){size-=4;g.font='700 '+size+'px Segoe UI,Arial';l2=quebrar(g,label,880);}if(l2.length<=2&&size>=48){linhas=l2;size=Math.min(size,62);}else{while(g.measureText(label).width>880&&size>28){size-=3;g.font='700 '+size+'px Segoe UI,Arial';}}}
  pintarBotao(c,linhas,size,cor,disabled);
  const m=new T.Mesh(new T.PlaneGeometry(w,BTN_H),new T.MeshBasicMaterial({map:texturaCanvas(c),side:T.DoubleSide,transparent:true}));
  m.position.set(x,y,UI_Z);m.rotation.y=-Math.atan2(x,-UI_Z);m.userData.command=cmd;this.ui.add(m);if(!disabled)this.uiHits.push(m);return m;};
Proto.xrBotaoLargo=function(label,cmd,x,y,disabled,cor){
  cor=corFinal(this,cmd,cor,disabled);const c=document.createElement('canvas');c.width=2048;c.height=384;const g=c.getContext('2d');label=rotuloPrimario(label,cor);
  let size=100;g.font='700 '+size+'px Segoe UI,Arial';let linhas=quebrar(g,label,1800);while(linhas.length>2&&size>56){size-=6;g.font='700 '+size+'px Segoe UI,Arial';linhas=quebrar(g,label,1800);}
  pintarBotao(c,linhas,size,cor,disabled);
  const m=new T.Mesh(new T.PlaneGeometry(1.08,.2),new T.MeshBasicMaterial({map:texturaCanvas(c),side:T.DoubleSide,transparent:true}));
  m.position.set(x,y,UI_Z);m.rotation.y=-Math.atan2(x,-UI_Z);m.userData.command=cmd;this.ui.add(m);if(!disabled)this.uiHits.push(m);return m;};
Proto.textPlane=function(title,body,w,h,tom){
  w=w||1.06;h=h||.86;const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const c=canvas.getContext('2d');
  const cores={ok:['rgba(10,46,34,.97)','#3fd48a'],erro:['rgba(60,16,22,.97)','#ff6b6b'],neutro:['rgba(10,31,46,.97)','#4c8294']}[tom||'neutro']||['rgba(10,31,46,.97)','#4c8294'];
  pilula(c,6,6,1012,1012,56);c.fillStyle=cores[0];c.fill();c.strokeStyle=cores[1];c.lineWidth=6;c.globalAlpha=.8;c.stroke();c.globalAlpha=1;
  const grande=!!(tom&&tom!=='neutro')||((Lab.state||{}).view==='desafio');let y=100;
  c.font='600 70px Segoe UI,Arial';c.fillStyle='#a4e6d1';for(const l of quebrar(c,title,930)){c.fillText(l,52,y);y+=86;}
  y+=24;const fb=grande?64:56;c.font='400 '+fb+'px Segoe UI,Arial';c.fillStyle='#e6f3fb';for(const l of quebrar(c,body,930)){if(y>990)break;c.fillText(l,52,y);y+=fb*1.32;}
  return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texturaCanvas(canvas),transparent:true,side:T.DoubleSide,depthWrite:false}));};

/* ação principal = botão .primary do painel (lido junto com a lista de ações) */
const acoesBase=Proto._acoes;
Proto._acoes=function(){const out=acoesBase.call(this);const P=new Set();document.querySelectorAll('#lessonPanel button.primary[data-act]').forEach(b=>{if(!/^(quiz:answer|seq:pick|pair:pick)/.test(b.dataset.act))P.add(b.dataset.act);});this._primarios=P;return out;};

/* ---------- distância ajustável ---------- */
const DIST=[.6,.7,.8,.9,1,1.1,1.2,1.35,1.5,1.65],DIST0=4,CHAVE='pde_'+APP+'_vr_dist10';
try{const v=parseInt(localStorage.getItem(CHAVE),10);view.xrDistI=isNaN(v)?DIST0:Math.max(0,Math.min(DIST.length-1,v));}catch(_){view.xrDistI=DIST0;}view.xrDist=DIST[view.xrDistI];
function avisar(t,aviso){const e=document.getElementById('feedback');if(!e)return;e.hidden=false;e.textContent=t;e.className='feedback'+(aviso?' warning':'');clearTimeout(avisar._t);avisar._t=setTimeout(()=>{if(e.textContent===t){e.hidden=true;e.textContent='';if(view.xr)view.buildXRUI();}},2600);}
Proto.mudarDistancia=function(passo){const i=Math.max(0,Math.min(DIST.length-1,(this.xrDistI??DIST0)+passo));if(i===this.xrDistI){avisar(passo<0?'Já está no mais perto.':'Já está no mais longe.',true);if(this.xr)this.buildXRUI();return;}
  this.xrDistI=i;this.xrDist=DIST[i];try{localStorage.setItem(CHAVE,String(i));}catch(_){}
  this.placeXR();avisar('Distância '+(i+1)+' de '+DIST.length+(i===0?' (mais perto)':i===DIST.length-1?' (mais longe)':''));if(this.xr)this.buildXRUI();};
const placeBase=Proto.placeXR;
Proto.placeXR=function(){placeBase.apply(this,arguments);const f=this.xrDist||1;if(this.xr&&this.model&&this.anchor&&!this.dentro&&Math.abs(f-1)>.01){const a=this.anchor;this.root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(this.model);if(!b.isEmpty()){const c=b.getCenter(new T.Vector3());this.root.position.x+=(c.x-a.p.x)*(f-1);this.root.position.z+=(c.z-a.p.z)*(f-1);this.root.updateMatrixWorld(true);}}};
const selectBase=Proto.xrSelect;
Proto.xrSelect=function(ctrl){if(!this.held||!this.held.has(ctrl)){const ui=this.controllerRay(ctrl).intersectObjects(this.uiHits,false)[0];const cmd=ui&&ui.object.userData.command;if(cmd==='xr:perto'||cmd==='xr:longe'){this._apertado={cmd,t:performance.now()};this.mudarDistancia(cmd==='xr:perto'?-1:1);return;}}return selectBase.call(this,ctrl);};

/* ---------- montagem: menu na altura dos olhos, tudo um pouco mais longe ---------- */
function fundoRedondo(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');pilula(g,3,3,506,506,26);g.fillStyle='rgba(6,18,34,.9)';g.fill();g.strokeStyle='rgba(95,179,214,.45)';g.lineWidth=3;g.stroke();return texturaCanvas(c);}
const buildBase=Proto.buildXRUI;
Proto.buildXRUI=function(){buildBase.apply(this,arguments);if(!this.xr||!this.ui)return;const ch=this.ui.children;
  const iMenu=ch.findIndex(o=>o.userData&&o.userData.command==='xr:abrirmenu');
  if(this.menuAberto&&iMenu>=0&&iMenu<ch.length-1){let lo=1e9,hi=-1e9;for(let i=iMenu+1;i<ch.length;i++){const o=ch[i];if(!o.geometry)continue;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox;lo=Math.min(lo,o.position.y+bb.min.y*o.scale.y);hi=Math.max(hi,o.position.y+bb.max.y*o.scale.y);
      if(o.userData.ordem===990&&o.material&&o.material.map){o.material.map.dispose();o.material.map=fundoRedondo();o.material.needsUpdate=true;}}
    if(lo<hi){const dy=MENU_CENTRO-(lo+hi)/2;for(let i=iMenu+1;i<ch.length;i++)ch[i].position.y+=dy;ch[iMenu].position.y=lo+dy-.1;}}
  else if(iMenu>=0)ch[iMenu].position.y=-.74;
  const k=UI_LONGE*(this.xrDist||1);ch.forEach(o=>{if(o.userData._longe)return;o.position.z*=k;if(o.rotation.y)o.rotation.y=-Math.atan2(o.position.x,-o.position.z);o.userData._longe=true;});};

if(view.xr)view.buildXRUI();
});
})();
