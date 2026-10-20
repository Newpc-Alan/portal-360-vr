/* Sistema Solar VR · Escala real (v9.13)
   Viagem em 8 paradas, sempre com tamanhos E distâncias na proporção verdadeira: da Terra até a estrela mais próxima.
   Os planetas ficam alinhados (como numa régua) para comparar as distâncias; o céu de fundo é o real.
   A cada parada: barra de escala em km e a comparação "se a Terra fosse uma bolinha de gude de 1 cm".
   Técnica: as posições são recalculadas a cada quadro em relação ao ponto de foco (sem coordenadas gigantes na GPU),
   e a transição alarga a visão em escala logarítmica, levando o foco junto para nada sair de quadro.
   Regra 9: controles com addEventListener, sem onclick. */
(function(){'use strict';
function pronto(fn){if(window.THREE&&typeof esfera==='function'&&typeof entrarVista==='function'&&window.PortalSolarV8&&document.querySelector('.barrasup'))fn();else setTimeout(()=>pronto(fn),80);}
pronto(()=>{
const T=THREE,UA=149597871;
/* corpos (km): raio e posição em relação ao Sol */
const CORPOS_E=[
 {k:'sol',nome:'Sol',r:696340,p:[0,0,0],cor:'#ffcf5a'},
 {k:'mercurio',nome:'Mercúrio',r:2440,p:[.387*UA,0,0],cor:'#b9b0a2'},
 {k:'venus',nome:'Vênus',r:6052,p:[.723*UA,0,0],cor:'#e8c98f'},
 {k:'terra',nome:'Terra',r:6371,p:[UA,0,0],cor:'#6fb2ff'},
 {k:'lua',nome:'Lua',r:1737,p:[UA,0,-384400],cor:'#d7d9de'},
 {k:'marte',nome:'Marte',r:3390,p:[1.524*UA,0,0],cor:'#e0714a'},
 {k:'jupiter',nome:'Júpiter',r:69911,p:[5.203*UA,0,0],cor:'#e3c9a0'},
 {k:'saturno',nome:'Saturno',r:58232,p:[9.537*UA,0,0],cor:'#ead6a6'},
 {k:'urano',nome:'Urano',r:25362,p:[19.19*UA,0,0],cor:'#a6e3ea'},
 {k:'netuno',nome:'Netuno',r:24622,p:[30.07*UA,0,0],cor:'#5f86ff'},
 {k:'voyager',nome:'Voyager 1',r:0,p:[171*UA,0,0],cor:'#9fe0ff'},
 {k:'proxima',nome:'Próxima Centauri',r:107000,p:[268000*UA,0,0],cor:'#ff8a5c'}];
const POR={};CORPOS_E.forEach(c=>POR[c.k]=c);
/* paradas: foco (km), largura da visão (km), título e texto (escala da bolinha de gude: Terra = 1 cm) */
const PARADAS=[
 {id:'terra',rot:'Terra',foco:[UA,0,0],W:46000,tit:'A Terra',txt:'12.742 km de diâmetro. Para sentir as distâncias desta viagem, imagine a Terra como uma <b>bolinha de gude de 1 cm</b>.'},
 {id:'lua',rot:'Lua',foco:[UA,0,-192200],W:560000,tit:'Terra e Lua',txt:'A Lua fica a 384.400 km: cabem 30 Terras enfileiradas no caminho. Na escala da bolinha, a Lua é um grão de 3 mm a <b>30 cm</b> de distância.'},
 {id:'sol',rot:'Sol',foco:[UA*.5,0,0],W:UA*1.2,tit:'Sol e Terra',txt:'O Sol é 109 vezes mais largo que a Terra e fica a 150 milhões de km (1 UA). Na escala: uma bola de <b>1,09 m</b> a <b>117 m</b> da bolinha, mais que um campo de futebol.'},
 {id:'marte',rot:'Marte',foco:[UA*.77,0,0],W:UA*1.75,tit:'Até Marte',txt:'Marte fica a 1,5 UA do Sol. Na escala: um grão de 5 mm a <b>179 m</b> da bola-Sol. Repare como os planetas viram pontinhos: o espaço é quase todo vazio.'},
 {id:'jupiter',rot:'Júpiter',foco:[UA*2.6,0,0],W:UA*6,tit:'Até Júpiter',txt:'Júpiter fica a 5,2 UA. Na escala: uma bola de <b>11 cm</b> a <b>611 m</b> do Sol, a distância de seis quarteirões.'},
 {id:'netuno',rot:'Netuno',foco:[UA*15.2,0,0],W:UA*34,tit:'Até Netuno',txt:'Netuno fica a 30 UA. Na escala: uma bola de 4 cm a <b>3,5 km</b> do Sol. A família dos planetas ocuparia um bairro inteiro, com 7 km de largura.'},
 {id:'voyager',rot:'Voyager 1',foco:[UA*86,0,0],W:UA*195,tit:'Voyager 1',txt:'A nave mais distante, a cerca de 171 UA, depois de 49 anos viajando. Na escala da bolinha, estaria a <b>20 km</b> do Sol.'},
 {id:'proxima',rot:'Estrela mais próxima',foco:[UA*134000,0,0],W:UA*310000,tit:'Próxima Centauri',txt:'A estrela mais próxima do Sol fica a 4,24 anos-luz (40 trilhões de km). Na escala da bolinha: a <b>31.500 km</b>, quase uma volta inteira na Terra de verdade. Na velocidade da Voyager, a viagem levaria uns <b>75 mil anos</b>.'}];
/* ---------- estilos e interface ---------- */
const css=document.createElement('style');css.textContent=`
#escLabels{position:absolute;inset:0;pointer-events:none;overflow:hidden}
#escLabels .lab{position:absolute;transform:translate(-50%,-150%);font-size:11.5px;color:#eaf2ff;background:rgba(10,16,32,.6);border:1px solid rgba(255,255,255,.18);padding:1px 7px;border-radius:20px;white-space:nowrap;font-weight:600}
#escPainel{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);width:min(760px,calc(100% - 24px));background:rgba(6,18,34,.9);border:1px solid #2c5b7a;border-radius:14px;padding:12px 14px;color:#e8f2ff;font:14px/1.45 'Segoe UI',Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45)}
#escPainel .linha{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#escPainel .chip{border:1px solid #2f6b8f;background:#0d2a40;color:#cfe6ff;border-radius:20px;padding:4px 10px;font:600 12px 'Segoe UI',Arial;cursor:pointer}
#escPainel .chip.on{background:#1a6b2a;border-color:#3fae5a;color:#fff}
#escPainel h3{margin:8px 0 2px;font-size:16px;color:#8fe0b4}
#escPainel p{margin:0}
#escPainel .rodape{display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:10px;flex-wrap:wrap}
#escPainel .regua{display:flex;align-items:center;gap:8px;font:600 12px 'Segoe UI',Arial;color:#cfe6ff}
#escPainel .regua i{display:block;height:6px;border:2px solid #cfe6ff;border-top:0}
#escPainel .nav button{border:0;border-radius:8px;padding:6px 12px;font:600 13px 'Segoe UI',Arial;cursor:pointer;margin-left:6px}
#escPainel .nav .ant{background:#22405a;color:#fff}#escPainel .nav .prox{background:#1a6b2a;color:#fff}#escPainel .nav .sair{background:#5a2222;color:#fff}
#escAviso{position:absolute;top:12px;right:12px;background:rgba(10,16,32,.75);color:#cbd6e6;font:12px 'Segoe UI',Arial;padding:5px 10px;border-radius:8px;pointer-events:none}
@media(max-width:640px){#escPainel{font-size:13px}#escPainel h3{font-size:15px}}`;document.head.appendChild(css);
const palco=document.querySelector('.palco');
const camadaLab=document.createElement('div');camadaLab.id='escLabels';camadaLab.hidden=true;palco.appendChild(camadaLab);
const painel=document.createElement('div');painel.id='escPainel';painel.hidden=true;palco.appendChild(painel);
const aviso=document.createElement('div');aviso.id='escAviso';aviso.hidden=true;aviso.textContent='Tamanhos e distâncias na proporção real · planetas alinhados';palco.appendChild(aviso);
painel.innerHTML='<div class="linha" id="escChips"></div><h3 id="escTit"></h3><p id="escTxt"></p><div class="rodape"><div class="regua"><i id="escBarra"></i><span id="escBarraTxt"></span></div><div class="nav"><button class="ant" data-esc="ant">‹ Voltar</button><button class="prox" data-esc="prox">Próxima ›</button><button class="sair" data-esc="sair">✕ Sair</button></div></div>';
const chips=painel.querySelector('#escChips');
PARADAS.forEach((p,i)=>{const b=document.createElement('button');b.className='chip';b.dataset.escIr=String(i);b.textContent=(i+1)+'. '+p.rot;chips.appendChild(b);});
painel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.escIr!==undefined)ir(+b.dataset.escIr);else if(b.dataset.esc==='prox')ir(Math.min(PARADAS.length-1,atual+1));else if(b.dataset.esc==='ant')ir(Math.max(0,atual-1));else if(b.dataset.esc==='sair')sair();});
/* botão de entrada na barra de vistas */
const barra=document.querySelector('.barrasup');const btn=document.createElement('button');btn.className='btn';btn.id='btnEscala';btn.textContent='📏 Escala real';
const depois=barra.querySelector('[data-v="desafio"]');if(depois&&depois.nextSibling)barra.insertBefore(btn,depois.nextSibling);else barra.appendChild(btn);
btn.addEventListener('click',()=>{if(ativo)sair();else entrar();});
/* ---------- cena ---------- */
let ativo=false,grupo=null,itens=[],atual=0,anim=null,foco=new T.Vector3(),W=46000,luz=null;
const TEX_PONTO=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.45,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c);})();
const ESC_VISTA=36;/* unidades da cena ocupadas pela largura W */
function montar(){grupo=new T.Group();grupo.name='escalaReal';scene.add(grupo);itens=[];
 luz=new T.PointLight(0xffffff,1.7,0,0);grupo.add(luz);grupo.add(new T.AmbientLight(0xffffff,.12));
 CORPOS_E.forEach(c=>{let m=null;
  if(c.r>0){const temTex=(typeof TEX!=='undefined')&&TEX[c.k];m=c.k==='proxima'?new T.Mesh(new T.SphereGeometry(1,48,32),new T.MeshBasicMaterial({color:0xff7a45})):esfera(1,(typeof CORPOS!=='undefined'&&CORPOS[c.k])?CORPOS[c.k].cor:0x999999,c.k==='sol',temTex?c.k:null);
   m.userData.corpoKey=null;m.userData.vrInterativo=false;if(c.k==='saturno'&&typeof criarAnelSaturno==='function')m.add(criarAnelSaturno(1));grupo.add(m);}
  const s=new T.Sprite(new T.SpriteMaterial({map:TEX_PONTO,color:new T.Color(c.cor),sizeAttenuation:false,transparent:true,depthWrite:false}));s.scale.set(.014,.014,1);s.renderOrder=2;grupo.add(s);
  const el=document.createElement('div');el.className='lab';el.textContent=c.nome;camadaLab.appendChild(el);
  itens.push({c,m,s,el});});}
function desmontar(){if(grupo){scene.remove(grupo);grupo.traverse(o=>{if(o.geometry)o.geometry.dispose();});}grupo=null;itens=[];camadaLab.innerHTML='';}
function posicionar(){const s=ESC_VISTA/W,v=new T.Vector3();
 const sol=POR.sol;luz.position.set((sol.p[0]-foco.x)*s,(sol.p[1]-foco.y)*s,(sol.p[2]-foco.z)*s);
 const w=palco.clientWidth,h=palco.clientHeight;
 for(const it of itens){const c=it.c;v.set((c.p[0]-foco.x)*s,(c.p[1]-foco.y)*s,(c.p[2]-foco.z)*s);
  if(it.m){it.m.position.copy(v);const r=c.r*s;it.m.scale.setScalar(Math.max(r,1e-6));it.m.visible=r>.0008&&v.length()<3500;}
  it.s.position.copy(v);it.s.visible=v.length()<3500;
  /* rótulo: só se estiver na frente e não colado em outro maior */
  const q=v.clone();grupo.localToWorld(q);q.project(camera);const dentro=q.z<1&&Math.abs(q.x)<1.05&&Math.abs(q.y)<1.05&&it.s.visible;
  it.el.style.display=dentro?'block':'none';if(dentro){it.el.style.left=((q.x*.5+.5)*w)+'px';it.el.style.top=((-q.y*.5+.5)*h)+'px';it.px=[(q.x*.5+.5)*w,(-q.y*.5+.5)*h];}else it.px=null;}
 /* rótulos sobrepostos: fica o do corpo maior (a Terra vence a Lua, o Sol vence Mercúrio quando tudo vira um ponto) */
 const vis=itens.filter(i=>i.px);for(let a=0;a<vis.length;a++)for(let b=a+1;b<vis.length;b++){const A=vis[a],B=vis[b];if(A.el.style.display==='none'||B.el.style.display==='none')continue;if(Math.abs(A.px[0]-B.px[0])<80&&Math.abs(A.px[1]-B.px[1])<18)(A.c.r>=B.c.r?B:A).el.style.display='none';}
 regua(w);}
function fmtKm(km){if(km>=1e12)return (km/1e12).toLocaleString('pt-BR',{maximumFractionDigits:1})+' trilhões de km';if(km>=1e9)return (km/1e9).toLocaleString('pt-BR',{maximumFractionDigits:1})+' bilhões de km';if(km>=1e6)return (km/1e6).toLocaleString('pt-BR',{maximumFractionDigits:1})+' milhões de km';return km.toLocaleString('pt-BR',{maximumFractionDigits:0})+' km';}
function regua(w){const visW=2*camDist*Math.tan(camera.fov*Math.PI/360)*camera.aspect;const kmPorPx=(visW/(ESC_VISTA/W))/w;let alvo=kmPorPx*140;const e=Math.pow(10,Math.floor(Math.log10(alvo)));const n=[1,2,5,10].map(x=>x*e).reduce((a,b)=>Math.abs(b-alvo)<Math.abs(a-alvo)?b:a);
 const bar=painel.querySelector('#escBarra');bar.style.width=Math.round(n/kmPorPx)+'px';painel.querySelector('#escBarraTxt').textContent=fmtKm(n);}
function texto(i){const p=PARADAS[i];painel.querySelector('#escTit').textContent=(i+1)+' de '+PARADAS.length+' · '+p.tit;painel.querySelector('#escTxt').innerHTML=p.txt;
 chips.querySelectorAll('.chip').forEach((b,j)=>b.classList.toggle('on',j===i));painel.querySelector('[data-esc="ant"]').disabled=i===0;painel.querySelector('[data-esc="prox"]').disabled=i===PARADAS.length-1;}
function ir(i){const p=PARADAS[i];atual=i;texto(i);anim={t:0,dur:i===0&&!anim?0:3.2,f0:foco.clone(),f1:new T.Vector3(...p.foco),w0:W,w1:p.W};}
function passo(dt){if(!anim)return;anim.t=anim.dur?Math.min(1,anim.t+dt/anim.dur):1;const e=anim.t<.5?4*anim.t*anim.t*anim.t:1-Math.pow(-2*anim.t+2,3)/2;
 const lw=Math.log(anim.w0)+(Math.log(anim.w1)-Math.log(anim.w0))*e;W=Math.exp(lw);
 /* o foco anda junto com a largura da visão: os dois corpos ficam em quadro durante a viagem */
 const g=Math.abs(anim.w1-anim.w0)>1?(W-anim.w0)/(anim.w1-anim.w0):e;foco.copy(anim.f0).lerp(anim.f1,Math.max(0,Math.min(1,g)));if(anim.t>=1)anim=null;}
function entrar(){if(estado.vr)return;if(estado.vista!=='sistema')entrarVista('sistema');if(typeof narrParar==='function')narrParar();
 ativo=true;root.visible=false;document.getElementById('labels').style.visibility='hidden';montar();camadaLab.hidden=false;painel.hidden=false;aviso.hidden=false;btn.classList.add('on');
 document.querySelectorAll('.barrasup [data-v]').forEach(b=>b.classList.remove('on'));
 const bd=document.getElementById('badge');if(bd)bd.textContent='Escala real';const dc=document.getElementById('dica');if(dc)dc.style.visibility='hidden';
 camTarget.set(0,0,0);camDist=34;camElev=.18;camAzim=0;atualizarCamera();
 foco.set(...PARADAS[0].foco);W=PARADAS[0].W;anim=null;ir(0);}
function sair(volta){if(!ativo)return;ativo=false;desmontar();root.visible=true;document.getElementById('labels').style.visibility='';camadaLab.hidden=true;const dc=document.getElementById('dica');if(dc)dc.style.visibility='';painel.hidden=true;aviso.hidden=true;btn.classList.remove('on');anim=null;
 if(volta!==false)entrarVista('sistema');}
/* trocar de vista ou entrar no óculos encerra a viagem */
const vistaAntes=entrarVista;entrarVista=function(v){if(ativo)sair(false);const r=vistaAntes.apply(this,arguments);if(v==='sistema'){const b=document.querySelector('.barrasup [data-v="sistema"]');b&&b.classList.add('on');}return r;};
let ult=performance.now();const labelsAntes=atualizarLabels;
atualizarLabels=function(){const t=performance.now(),dt=Math.min(.05,(t-ult)/1000);ult=t;
 if(ativo){if(estado.vr){sair();}else{passo(dt);posicionar();for(const it of itens)if(it.m&&it.c.k!=='proxima')it.m.rotation.y+=dt*.05;}}
 return labelsAntes.apply(this,arguments);};
window.SOLAR_ESCALA={entrar,sair,ir,estado:()=>({ativo,atual,W,foco:foco.toArray()})};
});
})();
