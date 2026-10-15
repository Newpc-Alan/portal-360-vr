/* Portal 360º VR · Modo Estande (v1.0.0)
   Tour automático de cerca de 3,5 minutos para feiras e eventos (SENACOP 2026): espaço, Terra por dentro, célula,
   DNA e coração, com narração, legenda e música. Roda sozinho: o visitante aperta o gatilho, assiste, e no fim o
   tour mostra a tela "Fale com a NEWPC", soma 1 no contador do dia e volta à espera para o próximo.
   É um app separado: usa CÓPIAS congeladas (pasta snap/) dos modelos da Célula, da Terra e do DNA, e não altera
   nenhum app do catálogo. Equipe: A ou X pula a cena; B ou Y volta à espera. */
(function(){'use strict';
const T=THREE,VERSAO='1.0.0',$=id=>document.getElementById(id);
const CM=window.CELULA_MODELS,TM=window.TERRA_MODELS,DM=window.DNA_MODELS;

/* ---------- palco ---------- */
const canvas=$('palco');
const renderer=new T.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=T.sRGBEncoding;renderer.localClippingEnabled=true;renderer.xr.enabled=true;
const scene=new T.Scene();scene.background=new T.Color(0x020812);
const camera=new T.PerspectiveCamera(70,innerWidth/innerHeight,.05,500);camera.position.set(0,1.6,0);scene.add(camera);
scene.add(new T.HemisphereLight(0xcfe6ff,0x1a1020,.45));
const sol=new T.DirectionalLight(0xffffff,.55);sol.position.set(3,5,4);scene.add(sol);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

/* céu de estrelas (referência de conforto no VR) */
(function(){const n=2600,p=new Float32Array(n*3);for(let i=0;i<n;i++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,r=180+Math.random()*60,s=Math.sqrt(1-u*u);p[i*3]=Math.cos(a)*s*r;p[i*3+1]=u*r;p[i*3+2]=Math.sin(a)*s*r;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));scene.add(new T.Points(g,new T.PointsMaterial({color:0xcfe0ff,size:.7,sizeAttenuation:true,transparent:true,opacity:.85})));})();

/* cortina para as transições (presa à cabeça) */
const cortina=new T.Mesh(new T.SphereGeometry(.3,16,12),new T.MeshBasicMaterial({color:0x000000,side:T.BackSide,transparent:true,opacity:1,depthTest:false,depthWrite:false}));
cortina.renderOrder=3000;camera.add(cortina);

/* ---------- utilidades ---------- */
function texCanvas(c){const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=8;return t;}
function quebrar(g,txt,maxW){const out=[];let l='';for(const w of String(txt).split(/\s+/)){const n=l?l+' '+w:w;if(g.measureText(n).width>maxW&&l){out.push(l);l=w;}else l=n;}if(l)out.push(l);return out;}
/* placa de texto: título opcional + corpo, fundo escuro translúcido */
function placa(titulo,corpo,w,h,opt={}){const W=1024,H=Math.round(W*h/w),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 if(opt.fundo!==false){g.fillStyle=opt.fundo||'rgba(3,14,28,.86)';g.fillRect(0,0,W,H);g.strokeStyle=opt.borda||'rgba(124,255,184,.55)';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);}
 let y=opt.y0||70;g.textAlign='center';
 if(titulo){g.font='700 '+(opt.tamT||64)+'px Segoe UI,Arial';g.fillStyle=opt.corT||'#ffffff';for(const l of quebrar(g,titulo,W-80)){g.fillText(l,W/2,y);y+=(opt.tamT||64)*1.2;}y+=10;}
 if(corpo){const tc=opt.tamC||42;g.font='500 '+tc+'px Segoe UI,Arial';g.fillStyle=opt.corC||'#d8ecf8';for(const par of String(corpo).split('\n')){for(const l of quebrar(g,par,W-90)){g.fillText(l,W/2,y);y+=tc*1.3;}y+=tc*.25;}}
 const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texCanvas(c),transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false}));m.renderOrder=500;return m;}
function rotulo(txt,cor,w){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');let s=54;g.font='700 '+s+'px Segoe UI,Arial';while(g.measureText(txt).width>490&&s>20){s-=2;g.font='700 '+s+'px Segoe UI,Arial';}
 g.textAlign='center';g.textBaseline='middle';g.shadowColor='#000';g.shadowBlur=8;g.fillStyle=cor||'#e7f6ff';g.fillText(txt,256,48);
 const sp=new T.Sprite(new T.SpriteMaterial({map:texCanvas(c),transparent:true,depthWrite:false}));sp.scale.set(w,w*96/512,1);return sp;}
function liberar(o){if(!o)return;const cache=new Set();o.traverse(x=>{if(x.geometry)x.geometry.dispose();for(const m of [].concat(x.material||[])){if(!m||cache.has(m))continue;cache.add(m);if(m.map&&m.map.isCanvasTexture)m.map.dispose();m.dispose();}});if(o.parent)o.parent.remove(o);}

/* posição da cabeça e direção do olhar (no plano do chão) */
function ancora(){const cam=renderer.xr.isPresenting?renderer.xr.getCamera(camera):camera;const p=new T.Vector3(),q=new T.Quaternion();cam.getWorldPosition(p);cam.getWorldQuaternion(q);
 const f=new T.Vector3(0,0,-1).applyQuaternion(q);f.y=0;if(f.lengthSq()<.01)f.set(0,0,-1);f.normalize();return{p,f,yaw:Math.atan2(-f.x,-f.z)};}
/* coloca um grupo à frente do visitante, virado para ele */
function aFrente(g,a,dist,dy){g.position.copy(a.p).addScaledVector(a.f,dist);g.position.y=a.p.y+(dy||0);g.rotation.y=a.yaw;return g;}
/* luz de estúdio vinda de onde está o visitante (frente, um pouco acima e à direita) */
function luzFrente(g,k){const l=new T.DirectionalLight(0xffffff,k||1.1);l.position.set(1.2,1.6,3);l.target=g;g.add(l);const f=new T.DirectionalLight(0x9fc8ff,.35);f.position.set(-2,.5,1);f.target=g;g.add(f);}

/* ---------- som: narração (MP3 gravado ou voz do navegador) + trilha ---------- */
const musica=new Audio('audio/fundo.mp3');musica.loop=true;musica.volume=.18;
const voz=new Audio();voz.preload='auto';let falando=false,falaSeq=0;
function musicaVol(v){musica.volume=v;}
function narrar(chave,texto){falaSeq++;const seq=falaSeq;pararVoz(true);falando=true;musicaVol(.06);
 const fim=()=>{if(seq!==falaSeq)return;falando=false;musicaVol(.18);};
 const sintetica=()=>{if(seq!==falaSeq)return;try{const u=new SpeechSynthesisUtterance(texto);u.lang='pt-BR';u.rate=1.0;u.onend=u.onerror=fim;speechSynthesis.speak(u);}catch(_){fim();}};
 voz.onended=fim;voz.onerror=()=>sintetica();voz.src='audio/estande-'+chave+'.mp3';const p=voz.play();if(p&&p.catch)p.catch(()=>sintetica());}
function pararVoz(silencio){try{voz.pause();}catch(_){}try{speechSynthesis.cancel();}catch(_){}if(!silencio){falando=false;musicaVol(.18);}}

/* ---------- contador de demonstrações (fica neste aparelho) ---------- */
const CHAVE='pde_estande_contagem';
function hoje(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function lerContagem(){try{return JSON.parse(localStorage.getItem(CHAVE)||'{}');}catch(_){return{};}}
function somar(){const c=lerContagem();c[hoje()]=(c[hoje()]||0)+1;try{localStorage.setItem(CHAVE,JSON.stringify(c));}catch(_){}mostrarContagem();}
function mostrarContagem(){const c=lerContagem(),h=c[hoje()]||0,tot=Object.values(c).reduce((a,b)=>a+b,0);$('contador').textContent='Demonstrações hoje: '+h+' · total neste aparelho: '+tot;}
mostrarContagem();

/* ---------- coração (anatomia real Z-Anatomy, CC BY-SA 4.0) ---------- */
let coracaoGLB=null;
try{new T.GLTFLoader().load('modelos/coracao.glb',g=>{coracaoGLB=g.scene;},undefined,()=>{coracaoGLB=null;});}catch(_){}
function coracaoModelo(){const g=new T.Group();
 if(coracaoGLB){const m=coracaoGLB.clone(true);const CORES={atrioD:0xb8343f,atrioE:0xd9434f,ventD:0xc43b48,ventE:0xd9434f,aorta:0xe8484f,pulmonar:0x4f7fe0,cavas:0x4f7fe0,veiasPulm:0xe8484f,coronarias:0x8f2a33};
  m.traverse(o=>{if(o.isMesh){let n=o.name,p=o;while(p&&!CORES[n]){p=p.parent;n=p&&p.name;}o.material=new T.MeshStandardMaterial({color:new T.Color(CORES[n]||0xc43b48).convertSRGBToLinear(),roughness:.45,metalness:.02});}});
  /* o tamanho vem só do coração (sem as veias cavas, que são longas), para ele aparecer grande */
  const box=new T.Box3();m.updateMatrixWorld(true);m.traverse(o=>{if(o.isMesh){let q=o,cava=false;while(q){if(q.name==='cavas')cava=true;q=q.parent;}if(!cava)box.expandByObject(o);}});if(box.isEmpty())box.setFromObject(m);
  const tam=box.getSize(new T.Vector3()),c=box.getCenter(new T.Vector3());m.position.sub(c);const k=1.1/Math.max(tam.x,tam.y,tam.z);const piv=new T.Group();piv.add(m);piv.scale.setScalar(k);g.add(piv);g.userData.piv=piv;g.userData.k=k;}
 else{const piv=new T.Group();const v=new T.Mesh(new T.SphereGeometry(.42,40,28),new T.MeshStandardMaterial({color:0xb52a35,roughness:.4}));v.scale.set(1,1.2,.9);piv.add(v);const ao=new T.Mesh(new T.TorusGeometry(.22,.07,12,32,Math.PI),new T.MeshStandardMaterial({color:0xc8323c}));ao.position.set(0,.5,0);piv.add(ao);g.add(piv);g.userData.piv=piv;g.userData.k=1;}
 return g;}

/* ---------- as cenas do tour ---------- */
const CENAS=[
 {id:'abertura',dur:11,legenda:'Bem-vindo ao Portal 360º VR. Em três minutos, você vai viajar do espaço até dentro de uma célula. Olhe em volta à vontade.',
  montar(a){const g=new T.Group();const logo=placa('Portal 360º VR','Explore o conhecimento por dentro',1.6,.6,{fundo:false,tamT:96,tamC:50,y0:120,corC:'#9fe8ff'});logo.position.y=.15;g.add(logo);
   const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.drawImage(im,0,0,256,256);const m=new T.Mesh(new T.CircleGeometry(.22,48),new T.MeshBasicMaterial({map:texCanvas(c),transparent:true,depthWrite:false}));m.position.y=.62;g.add(m);};im.src='assets/logo.png';
   aFrente(g,a,2.4,0);g.userData.tick=t=>{g.position.y=a.p.y+Math.sin(t*.8)*.03;};return g;}},
 {id:'solar',dur:38,legenda:'Você está no espaço, no meio do Sistema Solar. Na aula, o aluno examina cada planeta, compara tamanhos e entende o dia, a noite e as estações do ano.',
  montar(a){const g=new T.Group();const sist=new T.Group();sist.rotation.x=.12;g.add(sist);
   const sun=new T.Mesh(new T.SphereGeometry(.7,48,32),new T.MeshBasicMaterial({color:0xffd27a}));sist.add(sun);
   const gc=document.createElement('canvas');gc.width=gc.height=256;const gx=gc.getContext('2d');const gr=gx.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'rgba(255,220,140,.9)');gr.addColorStop(.4,'rgba(255,160,60,.35)');gr.addColorStop(1,'rgba(255,120,30,0)');gx.fillStyle=gr;gx.fillRect(0,0,256,256);
   const brilho=new T.Sprite(new T.SpriteMaterial({map:texCanvas(gc),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));brilho.scale.set(3.4,3.4,1);sist.add(brilho);
   const luz=new T.PointLight(0xfff0d0,1.0,40,1.6);sist.add(luz);
   const terraTex=new T.TextureLoader().load('assets/terra-cor.webp');terraTex.encoding=T.sRGBEncoding;
   const P=[['Mercúrio',0x9c8f84,.06,1.25,1.6],['Vênus',0xe3c27a,.1,1.75,1.2],['Terra',0xffffff,.11,2.3,1.0],['Marte',0xc8603a,.08,2.85,.8],['Júpiter',0xd9b48a,.32,3.75,.45],['Saturno',0xe6d29a,.27,4.75,.33],['Urano',0x9fe0e8,.17,5.55,.24],['Netuno',0x4a74e0,.17,6.2,.19]];
   const corpos=[];P.forEach(([n,cor,r,d,vel],i)=>{const piv=new T.Group();piv.rotation.y=i*1.7;sist.add(piv);
    const mat=n==='Terra'?new T.MeshStandardMaterial({map:terraTex,roughness:.7}):new T.MeshStandardMaterial({color:cor,roughness:.75});const m=new T.Mesh(new T.SphereGeometry(r,32,24),mat);m.position.x=d;piv.add(m);
    if(n==='Saturno'){const an=new T.Mesh(new T.RingGeometry(r*1.3,r*2.2,64),new T.MeshBasicMaterial({color:0xd8c79a,side:T.DoubleSide,transparent:true,opacity:.7}));an.rotation.x=Math.PI/2.4;m.add(an);}
    const rt=rotulo(n,'#e7f6ff',.5);rt.position.set(d,r+.18,0);piv.add(rt);
    const orb=new T.Mesh(new T.RingGeometry(d-.006,d+.006,128),new T.MeshBasicMaterial({color:0x5f86a8,side:T.DoubleSide,transparent:true,opacity:.35}));orb.rotation.x=-Math.PI/2;sist.add(orb);corpos.push([piv,m,vel]);});
   /* o Sol fica 6 m à frente, abaixo da linha dos olhos: as órbitas externas passam em volta do visitante */
   aFrente(g,a,6,-.7);g.userData.tick=(t,dt)=>{for(const [piv,m,vel] of corpos){piv.rotation.y+=dt*vel*.35;m.rotation.y+=dt*1.2;}sun.rotation.y+=dt*.1;};return g;}},
 {id:'terra',dur:38,legenda:'Agora, a Terra aberta ao meio: crosta, manto, núcleo externo e núcleo interno. O aluno viaja até o centro do planeta e entende vulcões, terremotos e rochas.',
  montar(a){const g=new T.Group();const te=TM.terra({corte:true,rotulos:true});te.scale.setScalar(.42);g.add(te);luzFrente(g,1.0);aFrente(g,a,3,0);
   g.userData.tick=(t,dt)=>{if(te.userData.tick)te.userData.tick(t,dt);te.rotation.y=Math.sin(t*.25)*.35;};g.userData.liberar=()=>TM.dispose(g);return g;}},
 {id:'celula',dur:42,legenda:'Encolhemos até o tamanho de uma célula: núcleo, mitocôndrias, complexo golgiense. Em vez de decorar o desenho do livro, o aluno entra na célula.',
  montar(a){const g=new T.Group();const c=CM.celula('animal');c.scale.setScalar(.62);g.add(c);luzFrente(g,1.0);aFrente(g,a,2.7,0);
   g.userData.tick=(t,dt)=>{if(c.userData.tick)c.userData.tick(t,dt);c.rotation.y=Math.sin(t*.3)*.45;c.rotation.x=Math.sin(t*.2)*.08;const k=.62+Math.min(t,10)*.012;c.scale.setScalar(k);};g.userData.liberar=()=>CM.dispose(g);return g;}},
 {id:'dna',dur:34,legenda:'Mais fundo ainda: a molécula de DNA, a receita da vida. O aluno monta a dupla hélice, pareia as bases e vê como o DNA se copia.',
  montar(a){const g=new T.Group();const h=DM.helix();h.scale.setScalar(.36);g.add(h);luzFrente(g,1.9);g.add(new T.AmbientLight(0xffffff,1.1));aFrente(g,a,2.3,0);
   g.userData.tick=(t,dt)=>{h.rotation.y+=dt*.35;h.position.y=Math.sin(t*.4)*.12;};g.userData.liberar=()=>DM.dispose(g);return g;}},
 {id:'coracao',dur:34,legenda:'E aqui, um coração humano batendo, com anatomia real. O corpo humano inteiro, sistema por sistema, com narração e desafios.',
  montar(a){const g=new T.Group();const h=coracaoModelo();g.add(h);luzFrente(g,1.1);aFrente(g,a,1.9,.28);
   g.userData.tick=(t,dt)=>{const ciclo=(t*1.15)%1,pulso=Math.exp(-Math.pow((ciclo-.08)/.05,2))+.6*Math.exp(-Math.pow((ciclo-.3)/.06,2));h.userData.piv.scale.setScalar(h.userData.k*(1+.07*pulso));h.rotation.y=Math.sin(t*.3)*.6;};return g;}},
 {id:'final',dur:18,legenda:'Este é o Portal 360º VR da NEWPC: realidade virtual, 3D e narração, alinhados à BNCC, com relatório para o professor. Converse com nosso consultor aqui no estande.',
  montar(a){const g=new T.Group();const p=placa('Gostou da viagem?','Portal 360º VR · NEWPC Educação\nSistema Solar · Terra por Dentro · Célula · DNA · Corpo Humano\n3D e realidade virtual, narração, alinhado à BNCC, relatório para o professor.\nFale com nosso consultor aqui no estande.',1.7,1.0,{tamT:80,tamC:40,y0:110});
   g.add(p);const cr=placa('','Modelo do coração: Z-Anatomy (CC BY-SA 4.0)',1.2,.08,{fundo:false,tamC:30,y0:50,corC:'#7f9aae'});cr.position.y=-.58;g.add(cr);aFrente(g,a,2.3,.05);g.userData.tick=t=>{p.position.y=Math.sin(t*.8)*.02;};return g;}}
];

/* ---------- máquina do tour ---------- */
let estado='parado',ind=-1,atual=null,tCena=0,anc=null,fade=0,fadeAlvo=0,pendente=null,legenda3D=null,espera=null,sessao=null,aguardaPose=0;
function legendaTexto(txt){$('legenda').textContent=txt||'';if(legenda3D){liberar(legenda3D);legenda3D=null;}
 if(txt&&renderer.xr.isPresenting&&anc){legenda3D=placa('',txt,1.5,.32,{tamC:40,y0:62,fundo:'rgba(3,12,24,.78)',borda:'rgba(55,177,218,.5)'});aFrente(legenda3D,anc,2.1,-.62);scene.add(legenda3D);}}
function limparCena(){if(atual){if(atual.userData.liberar)atual.userData.liberar();else liberar(atual);atual=null;}}
function trocar(fn){pendente=fn;fadeAlvo=1;}
function montarEspera(){limparEspera();anc=ancora();const g=new T.Group();
 const c=lerContagem();const p=placa('Portal 360º VR','Aperte o gatilho para começar a viagem',1.5,.55,{tamT:84,tamC:44,y0:110,corC:'#7CFFB8'});g.add(p);
 const n=placa('','Demonstrações hoje: '+(c[hoje()]||0),.8,.12,{tamC:46,y0:72,fundo:false,corC:'#8fb0c2'});n.position.y=-.42;g.add(n);
 aFrente(g,anc,2.4,0);g.userData.tick=t=>{p.position.y=Math.sin(t*1.2)*.025;};scene.add(g);espera=g;}
function limparEspera(){if(espera){liberar(espera);espera=null;}}
function irEspera(){pararVoz();estado='espera';ind=-1;trocar(()=>{limparCena();legendaTexto('');montarEspera();});}
function iniciar(){if(estado==='tour')return;try{musica.play().catch(()=>{});}catch(_){}estado='tour';ind=-1;proxima();}
function proxima(){ind++;if(ind>=CENAS.length){somar();irEspera();return;}
 const cena=CENAS[ind];trocar(()=>{limparEspera();limparCena();if(ind===0||!anc||cena.id==='abertura')anc=ancora();atual=cena.montar(anc);scene.add(atual);tCena=0;legendaTexto(cena.legenda);narrar(cena.id,cena.legenda);});}
function encerrarTela(){pararVoz();musica.pause();estado='parado';limparCena();limparEspera();legendaTexto('');$('barra').hidden=true;$('painel').classList.remove('oculto');}

/* ---------- entrada: VR, tela, controles ---------- */
const ctrls=[0,1].map(i=>{const c=renderer.xr.getController(i);const l=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(0,0,-1)]),new T.LineBasicMaterial({color:0x7fd6ff}));l.scale.z=1.2;c.add(l);
 c.addEventListener('selectstart',()=>{if(estado==='espera')iniciar();});scene.add(c);return c;});
async function entrarVR(){if(!navigator.xr||!window.isSecureContext){alert('Abra este endereço no navegador do óculos (HTTPS).');return;}
 try{const s=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']});renderer.xr.setReferenceSpaceType('local-floor');await renderer.xr.setSession(s);sessao=s;
  s.addEventListener('end',()=>{sessao=null;encerrarTela();});$('painel').classList.add('oculto');try{musica.play().catch(()=>{});}catch(_){}estado='espera';aguardaPose=20;fade=1;fadeAlvo=1;}
 catch(e){alert('Não foi possível abrir o VR: '+(e&&e.message||e));}}
function verNaTela(){$('painel').classList.add('oculto');$('barra').hidden=false;camera.position.set(0,1.6,0);camera.rotation.set(0,0,0);anc=null;iniciar();}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
 if(a==='vr')entrarVR();else if(a==='tela')verNaTela();else if(a==='pular'){if(estado==='tour')proxima();}else if(a==='parar')encerrarTela();});
addEventListener('keydown',e=>{if(estado==='parado')return;if(e.key==='ArrowRight'||e.key===' '){if(estado==='tour')proxima();else iniciar();}if(e.key==='Escape')encerrarTela();});
if(!navigator.xr)$('btnVR').textContent='🥽 VR (abra no navegador do óculos)';

/* ---------- laço ---------- */
const relogio=new T.Clock();const prevBtn={};
renderer.setAnimationLoop(()=>{const dt=Math.min(.05,relogio.getDelta());
 if(aguardaPose){aguardaPose--;if(!aguardaPose&&estado==='espera'){montarEspera();fadeAlvo=0;}}
 /* transição: escurece, troca, clareia */
 const vel=dt/.55;if(fade<fadeAlvo)fade=Math.min(fadeAlvo,fade+vel);else if(fade>fadeAlvo)fade=Math.max(fadeAlvo,fade-vel);
 if(pendente&&fade>=1){const f=pendente;pendente=null;f();fadeAlvo=0;}
 cortina.material.opacity=fade;cortina.visible=fade>.001;
 if(atual&&atual.userData.tick){tCena+=dt;atual.userData.tick(tCena,dt);}
 if(espera&&espera.userData.tick)espera.userData.tick(relogio.elapsedTime);
 if(estado==='tour'&&ind>=0&&ind<CENAS.length&&!pendente&&tCena>CENAS[ind].dur)proxima();
 /* botões da equipe: A/X pula a cena, B/Y volta à espera */
 if(sessao)for(const src of sessao.inputSources){const gp=src.gamepad;if(!gp)continue;const k=src.handedness;const a=!!(gp.buttons[4]&&gp.buttons[4].pressed),b=!!(gp.buttons[5]&&gp.buttons[5].pressed);
  if(a&&!prevBtn[k+'a']&&estado==='tour')proxima();if(b&&!prevBtn[k+'b']&&estado==='tour')irEspera();prevBtn[k+'a']=a;prevBtn[k+'b']=b;}
 renderer.render(scene,camera);});

/* uso sem internet no estande: guarda tudo no aparelho na primeira visita */
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
window.PortalEstande={versao:VERSAO,CENAS,iniciar,proxima,irEspera,get estado(){return estado;},get ind(){return ind;}};
})();
