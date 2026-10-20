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
 {id:'terra',audio:'escala-1',fala:"Vamos fazer uma viagem com tudo no tamanho certo e na distância certa. Começamos pela Terra, com doze mil, setecentos e quarenta e dois quilômetros de diâmetro. Para entender as distâncias, imagine a Terra do tamanho de uma bolinha de gude, com um centímetro. Guarde essa bolinha na cabeça: ela vai ser a nossa régua.",rot:'Terra',foco:[UA,0,0],W:46000,tit:'A Terra',txt:'12.742 km de diâmetro. Para sentir as distâncias desta viagem, imagine a Terra como uma <b>bolinha de gude de 1 cm</b>.'},
 {id:'lua',audio:'escala-2',fala:"A Lua fica a trezentos e oitenta e quatro mil quilômetros da Terra. Caberiam trinta Terras enfileiradas no caminho! Na escala da bolinha de gude, a Lua seria um grãozinho de três milímetros, a trinta centímetros de distância: o comprimento de uma régua escolar.",rot:'Lua',foco:[UA,0,-192200],W:560000,tit:'Terra e Lua',txt:'A Lua fica a 384.400 km: cabem 30 Terras enfileiradas no caminho. Na escala da bolinha, a Lua é um grão de 3 mm a <b>30 cm</b> de distância.'},
 {id:'sol',audio:'escala-3',fala:"Agora, o Sol. Ele é cento e nove vezes mais largo que a Terra e fica a cento e cinquenta milhões de quilômetros. Na nossa escala, o Sol seria uma bola de mais de um metro, e a bolinha de gude da Terra ficaria a cento e dezessete metros dela, mais longe que o comprimento de um campo de futebol.",rot:'Sol',foco:[UA*.5,0,0],W:UA*1.2,tit:'Sol e Terra',txt:'O Sol é 109 vezes mais largo que a Terra e fica a 150 milhões de km (1 UA). Na escala: uma bola de <b>1,09 m</b> a <b>117 m</b> da bolinha, mais que um campo de futebol.'},
 {id:'marte',audio:'escala-4',fala:"Marte fica uma vez e meia mais longe do Sol do que a Terra. Na escala, seria um grão de cinco milímetros a cento e setenta e nove metros da bola do Sol. Repare: os planetas viraram pontinhos. O espaço é quase todo vazio.",rot:'Marte',foco:[UA*.77,0,0],W:UA*1.75,tit:'Até Marte',txt:'Marte fica a 1,5 UA do Sol. Na escala: um grão de 5 mm a <b>179 m</b> da bola-Sol. Repare como os planetas viram pontinhos: o espaço é quase todo vazio.'},
 {id:'jupiter',audio:'escala-5',fala:"Júpiter, o maior planeta, fica cinco vezes mais longe do Sol do que a Terra. Na escala da bolinha, Júpiter seria uma bola de onze centímetros, a seiscentos e onze metros do Sol. Uns seis quarteirões de caminhada!",rot:'Júpiter',foco:[UA*2.6,0,0],W:UA*6,tit:'Até Júpiter',txt:'Júpiter fica a 5,2 UA. Na escala: uma bola de <b>11 cm</b> a <b>611 m</b> do Sol, a distância de seis quarteirões.'},
 {id:'netuno',audio:'escala-6',fala:"Netuno, o último planeta, fica trinta vezes mais longe do Sol do que a Terra. Na escala, seria uma bola de quatro centímetros a três quilômetros e meio do Sol. A família inteira de planetas ocuparia um bairro, com sete quilômetros de uma ponta à outra.",rot:'Netuno',foco:[UA*15.2,0,0],W:UA*34,tit:'Até Netuno',txt:'Netuno fica a 30 UA. Na escala: uma bola de 4 cm a <b>3,5 km</b> do Sol. A família dos planetas ocuparia um bairro inteiro, com 7 km de largura.'},
 {id:'voyager',audio:'escala-7',fala:"Esta é a Voyager 1, o objeto feito por seres humanos mais distante da Terra, viajando há quase cinquenta anos. Ela está cento e setenta vezes mais longe do Sol do que a Terra. Na escala da bolinha de gude, estaria a vinte quilômetros da bola do Sol.",rot:'Voyager 1',foco:[UA*86,0,0],W:UA*195,tit:'Voyager 1',txt:'A nave mais distante, a cerca de 171 UA, depois de 49 anos viajando. Na escala da bolinha, estaria a <b>20 km</b> do Sol.'},
 {id:'proxima',audio:'escala-8',fala:"E a estrela mais próxima do Sol, Próxima Centauri, fica a pouco mais de quatro anos-luz: quarenta trilhões de quilômetros. Na escala da bolinha de gude, ela estaria a trinta e um mil e quinhentos quilômetros, quase uma volta inteira ao redor da Terra de verdade. Na velocidade da Voyager, a viagem levaria setenta e cinco mil anos. É por isso que dizemos que o espaço é imenso.",rot:'Estrela mais próxima',foco:[UA*134000,0,0],W:UA*310000,tit:'Próxima Centauri',txt:'A estrela mais próxima do Sol fica a 4,24 anos-luz (40 trilhões de km). Na escala da bolinha: a <b>31.500 km</b>, quase uma volta inteira na Terra de verdade. Na velocidade da Voyager, a viagem levaria uns <b>75 mil anos</b>.'}];
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
#escAviso{position:absolute;top:12px;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(10,16,32,.75);color:#cbd6e6;font:12px 'Segoe UI',Arial;padding:5px 10px;border-radius:8px;pointer-events:none}
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
/* no modo Imersão a barra de vistas some: a viagem entra no menu do canto, como no menu do óculos */
const imMenu=document.getElementById('imMenu');let btnIm=null;
if(imMenu){btnIm=document.createElement('button');btnIm.id='btnEscalaIm';btnIm.textContent='📏 Escala real';imMenu.insertBefore(btnIm,imMenu.firstChild);btnIm.addEventListener('click',()=>{if(ativo)sair();else entrar();});}
/* ---------- cena ---------- */
/* dois modos: 'tela' (computador e lousa, rótulos em HTML) e 'vr' (óculos: cena 1,8 m à frente, rótulos, painel e botões em 3D) */
let ativo=false,modo='tela',grupo=null,itens=[],atual=0,anim=null,foco=new T.Vector3(),W=46000,luz=null,vr={painel:null,botoes:[]};
const TEX_PONTO=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.45,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c);})();
const CFG={tela:{esc:36,lim:3500,minR:.0008},vr:{esc:2.4,lim:4.2,minR:.0006}};/* esc: largura da cena (unidades/metros) ocupada por W */
function rotuloVR(txt,cor){const sp=textoCanvasVR(512,112,(g,c)=>{g.font='700 52px Segoe UI,Arial';const w=Math.min(500,g.measureText(txt).width+44);g.fillStyle='rgba(8,18,36,.78)';g.beginPath();g.roundRect((512-w)/2,14,w,84,40);g.fill();g.strokeStyle=cor;g.lineWidth=4;g.stroke();g.fillStyle='#eef6ff';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,256,58);});sp.scale.set(.26,.057,1);return sp;}
function montar(){grupo=new T.Group();grupo.name='escalaReal';scene.add(grupo);itens=[];
 luz=new T.PointLight(0xffffff,1.7,0,0);grupo.add(luz);grupo.add(new T.AmbientLight(0xffffff,.12));
 CORPOS_E.forEach(c=>{let m=null;
  if(c.r>0){const temTex=(typeof TEX!=='undefined')&&TEX[c.k];m=c.k==='proxima'?new T.Mesh(new T.SphereGeometry(1,48,32),new T.MeshBasicMaterial({color:0xff7a45})):esfera(1,(typeof CORPOS!=='undefined'&&CORPOS[c.k])?CORPOS[c.k].cor:0x999999,c.k==='sol',temTex?c.k:null);
   m.userData.corpoKey=null;m.userData.vrInterativo=false;if(c.k==='saturno'&&typeof criarAnelSaturno==='function')m.add(criarAnelSaturno(1));grupo.add(m);}
  const s=new T.Sprite(new T.SpriteMaterial({map:TEX_PONTO,color:new T.Color(c.cor),sizeAttenuation:modo==='vr',transparent:true,depthWrite:false}));
  if(modo==='vr')s.scale.set(.028,.028,1);else s.scale.set(.014,.014,1);s.renderOrder=2;grupo.add(s);
  let el=null,lab=null;if(modo==='tela'){el=document.createElement('div');el.className='lab';el.textContent=c.nome;camadaLab.appendChild(el);}else{lab=rotuloVR(c.nome,c.cor);grupo.add(lab);}
  itens.push({c,m,s,el,lab});});}
function desmontar(){if(grupo){scene.remove(grupo);grupo.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.isSprite&&o.material&&o.material.map&&o.material.map!==TEX_PONTO)o.material.map.dispose();});}grupo=null;itens=[];camadaLab.innerHTML='';limparVR();}
function posicionar(){const K=CFG[modo],s=K.esc/W,v=new T.Vector3();
 const sol=POR.sol;luz.position.set((sol.p[0]-foco.x)*s,(sol.p[1]-foco.y)*s,(sol.p[2]-foco.z)*s);
 const w=palco.clientWidth,h=palco.clientHeight;
 for(const it of itens){const c=it.c;v.set((c.p[0]-foco.x)*s,(c.p[1]-foco.y)*s,(c.p[2]-foco.z)*s);const perto=v.length()<K.lim;
  if(it.m){it.m.position.copy(v);const r=c.r*s;it.m.scale.setScalar(Math.max(r,1e-6));it.m.visible=r>K.minR&&perto;}
  it.s.position.copy(v);it.s.visible=perto;
  if(modo==='vr'){const r=it.m?c.r*s:0;it.lab.position.set(v.x,v.y+Math.max(.055,r+.04),v.z);it.lab.visible=perto&&Math.abs(v.x)<1.9;it.px=it.lab.visible?[v.x,v.y]:null;continue;}
  const q=v.clone();grupo.localToWorld(q);q.project(camera);const dentro=q.z<1&&Math.abs(q.x)<1.05&&Math.abs(q.y)<1.05&&perto;
  it.el.style.display=dentro?'block':'none';if(dentro){it.el.style.left=((q.x*.5+.5)*w)+'px';it.el.style.top=((-q.y*.5+.5)*h)+'px';it.px=[(q.x*.5+.5)*w,(-q.y*.5+.5)*h];}else it.px=null;}
 /* rótulos sobrepostos: fica o do corpo maior (a Terra vence a Lua, o Sol vence Mercúrio quando tudo vira um ponto) */
 const vis=itens.filter(i=>i.px),dx=modo==='vr'?.25:80,dy=modo==='vr'?.06:18,esc=i=>modo==='vr'?!i.lab.visible:i.el.style.display==='none',some=i=>{if(modo==='vr')i.lab.visible=false;else i.el.style.display='none';};
 for(let a=0;a<vis.length;a++)for(let b=a+1;b<vis.length;b++){const A=vis[a],B=vis[b];if(esc(A)||esc(B))continue;if(Math.abs(A.px[0]-B.px[0])<dx&&Math.abs(A.px[1]-B.px[1])<dy)some(A.c.r>=B.c.r?B:A);}
 if(modo==='tela')regua(w);}
function fmtKm(km){if(km>=1e12)return (km/1e12).toLocaleString('pt-BR',{maximumFractionDigits:1})+' trilhões de km';if(km>=1e9)return (km/1e9).toLocaleString('pt-BR',{maximumFractionDigits:1})+' bilhões de km';if(km>=1e6)return (km/1e6).toLocaleString('pt-BR',{maximumFractionDigits:1})+' milhões de km';return km.toLocaleString('pt-BR',{maximumFractionDigits:0})+' km';}
function regua(w){const visW=2*camDist*Math.tan(camera.fov*Math.PI/360)*camera.aspect;const kmPorPx=(visW/(CFG.tela.esc/W))/w;let alvo=kmPorPx*140;const e=Math.pow(10,Math.floor(Math.log10(alvo)));const n=[1,2,5,10].map(x=>x*e).reduce((a,b)=>Math.abs(b-alvo)<Math.abs(a-alvo)?b:a);
 const bar=painel.querySelector('#escBarra');bar.style.width=Math.round(n/kmPorPx)+'px';painel.querySelector('#escBarraTxt').textContent=fmtKm(n);}
function texto(i){const p=PARADAS[i];painel.querySelector('#escTit').textContent=(i+1)+' de '+PARADAS.length+' · '+p.tit;painel.querySelector('#escTxt').innerHTML=p.txt;
 chips.querySelectorAll('.chip').forEach((b,j)=>b.classList.toggle('on',j===i));painel.querySelector('[data-esc="ant"]').disabled=i===0;painel.querySelector('[data-esc="prox"]').disabled=i===PARADAS.length-1;
 if(modo==='vr')painelVR(i);}
/* narração de cada parada: toca audio/escala-N.mp3; enquanto o arquivo não existir, usa a voz sintética com o mesmo texto */
let voz=null;
function calar(){if(voz){voz.onended=null;voz.onerror=null;try{voz.pause();}catch(_){}voz=null;}try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(_){}if(typeof duckMusica==='function')duckMusica(false);}
function sintetica(txt){if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(txt);u.lang='pt-BR';u.rate=.95;const v=speechSynthesis.getVoices().find(x=>/pt[-_]BR/i.test(x.lang));if(v)u.voice=v;u.onend=()=>{if(typeof duckMusica==='function')duckMusica(false);};speechSynthesis.speak(u);}
function falar(i){calar();if(typeof narrParar==='function')narrParar();const p=PARADAS[i];if(!p.audio)return;
 const S=window.PortalSolarV8&&PortalSolarV8.state,vol=S&&typeof S.voice==='number'?S.voice:1;if(!vol)return;
 const a=new Audio('audio/'+p.audio+'.mp3');a.volume=vol;voz=a;if(typeof duckMusica==='function')duckMusica(true);
 a.onended=()=>{if(voz===a){voz=null;if(typeof duckMusica==='function')duckMusica(false);}};
 a.onerror=()=>{if(voz!==a)return;voz=null;sintetica(p.fala);};
 const pr=a.play();if(pr&&pr.catch)pr.catch(()=>{});}
function ir(i){const p=PARADAS[i];atual=i;texto(i);falar(i);anim={t:0,dur:i===0&&!anim?0:3.2,f0:foco.clone(),f1:new T.Vector3(...p.foco),w0:W,w1:p.W};}
function passo(dt){if(!anim)return;anim.t=anim.dur?Math.min(1,anim.t+dt/anim.dur):1;const e=anim.t<.5?4*anim.t*anim.t*anim.t:1-Math.pow(-2*anim.t+2,3)/2;
 const lw=Math.log(anim.w0)+(Math.log(anim.w1)-Math.log(anim.w0))*e;W=Math.exp(lw);
 /* o foco anda junto com a largura da visão: os dois corpos ficam em quadro durante a viagem */
 const g=Math.abs(anim.w1-anim.w0)>1?(W-anim.w0)/(anim.w1-anim.w0):e;foco.copy(anim.f0).lerp(anim.f1,Math.max(0,Math.min(1,g)));if(anim.t>=1)anim=null;}
/* ---------- óculos: painel e botões 3D ---------- */
function limparVR(){if(vr.painel){if(vr.painel.parent)vr.painel.parent.remove(vr.painel);vr.painel.material.map.dispose();vr.painel=null;}
 for(const b of vr.botoes){const k=vrBotoes.indexOf(b);if(k>=0)vrBotoes.splice(k,1);if(b.parent)b.parent.remove(b);b.material.map.dispose();}vr.botoes=[];}
function painelVR(i){if(vr.painel){grupo.remove(vr.painel);vr.painel.material.map.dispose();}
 const p=PARADAS[i],limpo=p.txt.replace(/<[^>]+>/g,'');
 vr.painel=textoCanvasVR(1024,400,(g,c)=>{g.fillStyle='rgba(5,19,34,.94)';g.beginPath();g.roundRect(0,0,c.width,c.height,30);g.fill();g.strokeStyle='#37b1da';g.lineWidth=5;g.stroke();
  g.fillStyle='#8fe0b4';g.font='700 44px Segoe UI,Arial';g.fillText((i+1)+' de '+PARADAS.length+' · '+p.tit,36,64);
  g.fillStyle='#e4f3ff';g.font='500 33px Segoe UI,Arial';let y=116;for(const l of quebrarLinhas(g,limpo,c.width-72).slice(0,6)){g.fillText(l,36,y);y+=44;}
  g.fillStyle='#bfe6f2';g.font='600 30px Segoe UI,Arial';g.fillText('Largura da cena: '+fmtKm(p.W)+' · proporção real',36,c.height-26);});
 vr.painel.scale.set(1.15,.45,1);vr.painel.position.set(0,-.66,.35);grupo.add(vr.painel);
 if(!vr.botoes.length){[['‹ Voltar','esc:ant',-.42],['Próxima ›','esc:prox',0],['✕ Sair','esc:sair',.42]].forEach(([t,a,x])=>{const b=criarBotaoVR(t,a,a==='esc:sair'?'rgba(120,26,26,.96)':a==='esc:prox'?'rgba(26,107,42,.96)':null);b.scale.set(.34,.085,1);b.position.set(x,-.97,.38);grupo.add(b);vr.botoes.push(b);});}}
function ancorar(){/* cena 1,8 m à frente, um pouco abaixo dos olhos, virada para o aluno */
 const p=new T.Vector3(),q=new T.Quaternion();let cam=camera;try{if(renderer.xr.isPresenting)cam=renderer.xr.getCamera(camera);}catch(_){}cam.getWorldPosition(p);cam.getWorldQuaternion(q);
 const f=new T.Vector3(0,0,-1).applyQuaternion(q);f.y=0;if(f.lengthSq()<.01)f.set(0,0,-1);f.normalize();const r=new T.Vector3(-f.z,0,f.x),up=new T.Vector3(0,1,0);
 grupo.position.copy(p).addScaledVector(f,1.8).add(new T.Vector3(0,-.12,0));grupo.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(r,up,f.clone().negate()));}
/* os painéis normais do óculos somem durante a viagem (voltam ao sair) */
function esconderXR(){const S=window.PortalSolarV8&&PortalSolarV8.state;if(!S)return;[S.xrPanel,S.xrCaption,S.xrFocus].concat(S.ctxBtns||[],S.inspections||[]).forEach(o=>{if(o)o.visible=false;});}
/* a cópia ampliada de um planeta ou nave clicado antes (zoom à frente da câmera) sai da cena ao começar a viagem */
function limparZoom(){const S=window.PortalSolarV8&&PortalSolarV8.state;if(!S||!S.desktopFocus)return;const g=S.desktopFocus;if(g.parent)g.parent.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose();});S.desktopFocus=null;S.desktopFocusKey=null;S.desktopFocusT=0;document.body.classList.remove('v8-system-focus');}
/* ---------- entrar e sair ---------- */
function entrar(){if(estado.vista!=='sistema')entrarVista('sistema');if(typeof narrParar==='function')narrParar();
 modo=estado.vr?'vr':'tela';ativo=true;root.visible=false;limparZoom();montar();btn.classList.add('on');if(btnIm)btnIm.textContent='✕ Sair da escala';
 if(modo==='tela'){document.getElementById('labels').style.visibility='hidden';camadaLab.hidden=false;painel.hidden=false;aviso.hidden=false;
  document.querySelectorAll('.barrasup [data-v]').forEach(b=>b.classList.remove('on'));
  const bd=document.getElementById('badge');if(bd)bd.textContent='Escala real';const dc=document.getElementById('dica');if(dc)dc.style.visibility='hidden';
  camTarget.set(0,0,0);camDist=34;camElev=.18;camAzim=0;atualizarCamera();}
 else{ancorar();const S=PortalSolarV8.state;if(S&&S.menuVR&&PortalSolarV8.menuVRAlternar)PortalSolarV8.menuVRAlternar();esconderXR();}
 foco.set(...PARADAS[0].foco);W=PARADAS[0].W;anim=null;ir(0);}
function sair(volta){if(!ativo)return;ativo=false;testeVR=false;calar();desmontar();root.visible=true;document.getElementById('labels').style.visibility='';camadaLab.hidden=true;const dc=document.getElementById('dica');if(dc)dc.style.visibility='';painel.hidden=true;aviso.hidden=true;btn.classList.remove('on');if(btnIm)btnIm.textContent='📏 Escala real';anim=null;
 if(volta!==false)entrarVista('sistema');}
/* trocar de vista encerra a viagem; 'escala' é a vista nova do menu do óculos */
const vistaAntes=entrarVista;entrarVista=function(v){if(v==='escala'){entrar();return;}if(ativo)sair(false);const r=vistaAntes.apply(this,arguments);if(v==='sistema'){const b=document.querySelector('.barrasup [data-v="sistema"]');b&&b.classList.add('on');}return r;};
const acaoAntes=acaoBotaoVR;acaoBotaoVR=function(a){if(a==='view:escala'){entrar();return;}if(a&&a.startsWith('esc:')){if(a==='esc:prox')ir(Math.min(PARADAS.length-1,atual+1));else if(a==='esc:ant')ir(Math.max(0,atual-1));else sair();return;}return acaoAntes.apply(this,arguments);};
let ult=performance.now();const labelsAntes=atualizarLabels;
atualizarLabels=function(){const t=performance.now(),dt=Math.min(.05,(t-ult)/1000);ult=t;
 if(ativo){if((modo==='vr')!==(!!estado.vr||testeVR)){sair();}else{passo(dt);posicionar();for(const it of itens)if(it.m&&it.c.k!=='proxima')it.m.rotation.y+=dt*.05;}}
 return labelsAntes.apply(this,arguments);};
if(typeof atualizarVR==='function'){const vrAntes=atualizarVR;atualizarVR=function(){const r=vrAntes.apply(this,arguments);if(ativo&&modo==='vr')esconderXR();return r;};}
/* teste no computador do layout do óculos (sem headset): SOLAR_ESCALA._testeVR() */
let testeVR=false;
function _testeVR(){testeVR=true;if(estado.vista!=='sistema')entrarVista('sistema');modo='vr';ativo=true;root.visible=false;montar();ancorar();foco.set(...PARADAS[0].foco);W=PARADAS[0].W;anim=null;ir(0);}
window.SOLAR_ESCALA={entrar,sair,ir,_testeVR,estado:()=>({ativo,modo,atual,W,foco:foco.toArray()})};
});
})();
