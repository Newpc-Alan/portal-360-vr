/* Portal 360º VR · Primeiros passos no óculos (v1.1, out/2026) · v1.1: olhar() e apontar() para o painel da Sala
   Na primeira vez que o aluno entra no VR neste aparelho, um tutorial curto ensina, fazendo:
   1. olhar ao redor · 2. apontar o raio e apertar o gatilho · 3. usar um botão flutuante ·
   4. (museu) andar com o analógico · 5. onde fica o Menu · 6. pronto (e como pedir ajuda).
   Cada passo só avança quando o aluno faz o gesto. Texto em placa + voz (MP3 em assets/passos/passo-<id>.mp3;
   sem o MP3, voz do navegador), para quem ainda não lê com fluência.
   Enquanto o tutorial está aberto, os cliques do gatilho não chegam ao app (o aluno não abre peças sem querer).
   Repetir: ?tutorial=1 no endereço, ou window.Portal360Passos.iniciar() (o painel da Sala pode pedir).
   Fonte única: tools/primeiros-passos.js (copiado para cada app). Regra 9: sem onclick inline. */
(function(){'use strict';
if(window.Portal360Passos)return;
const VERSAO='1.1.0',CHAVE='p360_passos_ok';
const LS={get:k=>{try{return localStorage.getItem(k);}catch(_){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}},del:k=>{try{localStorage.removeItem(k);}catch(_){}}};
const q=new URLSearchParams(location.search);if(q.get('tutorial')==='1')LS.del(CHAVE);
const APP=(location.pathname.match(/\/apps\/([^/]+)/)||[])[1]||'';
const BASE=(()=>{const m=location.pathname.match(/^(.*?)\/apps\/[^/]+\/?/);return m?m[1]+'/':location.pathname.replace(/[^/]*$/,'');})();
const ANDA=APP==='historia';/* só o museu tem caminhada pelo analógico */
function ctx(){try{const c=window.PortalEntrada&&window.PortalEntrada.contexto&&window.PortalEntrada.contexto();return c&&c.renderer&&c.scene&&c.camera?c:null;}catch(_){return null;}}
const PASSOS=[
 {id:'olhar',titulo:'Olhe ao seu redor',texto:'Vire a cabeça devagar para os lados. Tudo à sua volta faz parte da aula.',dica:'Vire a cabeça para a esquerda e para a direita'},
 {id:'esfera',titulo:'Aponte e aperte o gatilho',texto:'Do controle sai um raio. Aponte o raio para a bola verde e aperte o GATILHO, o botão do dedo indicador.',dica:'Aponte para a bola verde e aperte o gatilho'},
 {id:'botao',titulo:'Botões flutuantes',texto:'Os botões funcionam do mesmo jeito: aponte o raio e aperte o gatilho. Experimente no botão Próximo.',dica:'Aponte para "Próximo" e aperte o gatilho'},
 ANDA?{id:'analogico',titulo:'Para andar',texto:'Empurre a alavanca do controle, o analógico, para frente para andar. Para os lados, você vira.',dica:'Empurre o analógico para andar'}:null,
 {id:'menu',titulo:'O botão Menu',texto:'O botão Menu, que está piscando, leva para as atividades e as opções. Use quando quiser trocar de atividade.',dica:'Aperte o gatilho em "Entendi"'},
 {id:'fim',titulo:'Pronto!',texto:'Você já sabe usar o óculos. Se precisar de ajuda, levante a mão bem alto e chame o professor. Boa aula!',dica:'Aperte o gatilho em "Começar"'}
].filter(Boolean);
let st=null;/* estado do tutorial em andamento */

/* ---------- desenho ---------- */
function rr(x,X,Y,W,H,R){x.beginPath();if(x.roundRect)x.roundRect(X,Y,W,H,R);else x.rect(X,Y,W,H);}
function quebrar(x,t,w){const out=[];let l='';for(const p of String(t).split(/\s+/)){const n=l?l+' '+p:p;if(x.measureText(n).width>w&&l){out.push(l);l=p;}else l=n;}if(l)out.push(l);return out;}
function tex(T,c){const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=8;return t;}
function plano(T,c,w,h,ordem){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex(T,c),transparent:true,depthTest:false,depthWrite:false}));m.renderOrder=ordem||9990;return m;}
function canvasPainel(passo,i,n){const c=document.createElement('canvas');c.width=1200;c.height=600;const x=c.getContext('2d');
 x.fillStyle='rgba(10,30,52,.97)';rr(x,8,8,1184,584,46);x.fill();x.strokeStyle='#3fd48a';x.lineWidth=7;x.stroke();
 x.textAlign='left';x.fillStyle='#7ddfb0';x.font='800 30px system-ui,Segoe UI,Arial';x.fillText('PRIMEIROS PASSOS  ·  '+(i+1)+' de '+n,56,72);
 for(let k=0;k<n;k++){x.beginPath();x.arc(1080-(n-1-k)*34,62,11,0,Math.PI*2);x.fillStyle=k<=i?'#3fd48a':'#2b4a63';x.fill();}
 x.fillStyle='#ffffff';x.font='800 64px system-ui,Segoe UI,Arial';x.fillText(passo.titulo,56,160);
 x.fillStyle='#d9ecf7';x.font='500 42px system-ui,Segoe UI,Arial';quebrar(x,passo.texto,1080).slice(0,5).forEach((l,k)=>x.fillText(l,56,240+k*56));
 return c;}
function canvasBotao(txt,cor,txtCor){const c=document.createElement('canvas');c.width=640;c.height=180;const x=c.getContext('2d');
 const g=x.createLinearGradient(0,0,0,180);g.addColorStop(0,cor[0]);g.addColorStop(1,cor[1]);x.fillStyle=g;rr(x,8,8,624,164,82);x.fill();x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=6;x.stroke();
 x.fillStyle=txtCor||'#fff';x.font='800 70px system-ui,Segoe UI,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,320,96);return c;}
function canvasDica(t){const c=document.createElement('canvas');c.width=900;c.height=110;const x=c.getContext('2d');x.fillStyle='rgba(255,214,90,.96)';rr(x,4,4,892,102,50);x.fill();
 x.fillStyle='#1b1300';let fs=44;x.font='800 '+fs+'px system-ui,Segoe UI,Arial';while(x.measureText('👉 '+t).width>850&&fs>24){fs-=2;x.font='800 '+fs+'px system-ui,Segoe UI,Arial';}x.textAlign='center';x.textBaseline='middle';x.fillText('👉 '+t,450,58);return c;}

/* ---------- voz ---------- */
let audio=null;
function falar(id,texto){try{if(audio){audio.pause();audio=null;}if(window.speechSynthesis)speechSynthesis.cancel();}catch(_){}
 const a=new Audio(BASE+'assets/passos/passo-'+id+'.mp3');audio=a;let caiu=false;
 const tts=()=>{if(caiu||audio!==a)return;caiu=true;try{if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(texto);u.lang='pt-BR';u.rate=.95;const v=speechSynthesis.getVoices().find(v=>/^pt[-_]BR$/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u);}catch(_){}};
 a.onerror=tts;a.play().catch(tts);}
function calar(){try{if(audio)audio.pause();audio=null;if(window.speechSynthesis)speechSynthesis.cancel();}catch(_){}}

/* ---------- controles: segura os cliques do app enquanto o tutorial está aberto ---------- */
function segurarControles(renderer,on){for(let i=0;i<2;i++){let c=null;try{c=renderer.xr.getController(i);}catch(_){}if(!c)continue;
 if(on&&!c.__p360d){c.__p360d=c.dispatchEvent;c.dispatchEvent=function(ev){if(st&&ev&&/^select|^squeeze/.test(ev.type))return;return c.__p360d.call(this,ev);};}
 else if(!on&&c.__p360d){c.dispatchEvent=c.__p360d;delete c.__p360d;}}}

/* ---------- o tutorial ---------- */
function iniciar(forcar){const c=ctx();const T=window.THREE;if(!c||!T||!c.renderer.xr||!c.renderer.xr.isPresenting)return false;if(st)return true;if(!forcar&&LS.get(CHAVE))return false;
 const {renderer,scene,camera}=c;const sess=renderer.xr.getSession();const g=new T.Group();g.name='p360-passos';scene.add(g);
 st={i:-1,g,renderer,scene,camera,sess,vivo:true,yawAcum:0,yawAnt:null,alvos:[],dispor:[],t0:performance.now(),analog:0,anel:null};
 segurarControles(renderer,true);
 /* âncora: à frente da cabeça, na horizontal; reposiciona se o aluno virar muito */
 const p=new T.Vector3(),qq=new T.Quaternion(),s=new T.Vector3(),f=new T.Vector3();
 st.ancorar=()=>{camera.updateMatrixWorld(true);const cam=renderer.xr.getCamera(camera);cam.matrixWorld.decompose(p,qq,s);f.set(0,0,-1).applyQuaternion(qq);f.y=0;if(f.lengthSq()<1e-4)f.set(0,0,-1);f.normalize();g.position.copy(p);g.position.y-=.1;g.rotation.y=Math.atan2(-f.x,-f.z);};
 st.ancorar();
 st.sel=()=>{if(!st)return;const a=alvoRaio();if(a&&a.userData.p360)acionar(a.userData.p360);};
 sess.addEventListener('select',st.sel);
 st.fimSessao=()=>encerrar(false);sess.addEventListener('end',st.fimSessao);
 const loop=()=>{if(!st||!st.vivo)return;quadro();sess.requestAnimationFrame(loop);};sess.requestAnimationFrame(loop);
 mostrar(0);return true;}
function alvoRaio(){const T=window.THREE;if(!st||!T)return null;const o=new T.Vector3(),dq=new T.Quaternion(),dd=new T.Vector3();const alvos=st.alvos.filter(m=>m.visible);
 for(let i=0;i<2;i++){try{const ctl=st.renderer.xr.getController(i);if(!ctl)continue;ctl.matrixWorld.decompose(o,dq,dd);if(o.lengthSq()<1e-6)continue;const r=new T.Raycaster(o.clone(),new T.Vector3(0,0,-1).applyQuaternion(dq));const h=r.intersectObjects(alvos,false)[0];if(h)return h.object;}catch(_){}}return null;}
function limparPasso(){if(!st)return;st.dispor.forEach(fn=>{try{fn();}catch(_){}});st.dispor=[];st.alvos=[];st.anel=null;st.menuAlvo=null;}
function add(m,x,y,z){m.position.set(x,y,z);st.g.add(m);st.dispor.push(()=>{st.g.remove(m);m.geometry.dispose();if(m.material.map)m.material.map.dispose();m.material.dispose();});return m;}
function mostrar(i){const T=window.THREE;limparPasso();st.i=i;const P=PASSOS[i];st.passoT=performance.now();st.yawAcum=0;st.yawAnt=null;st.analog=0;
 add(plano(T,canvasPainel(P,i,PASSOS.length),1.2,.6,9991),0,.22,-1.5);
 const dica=add(plano(T,canvasDica(P.dica),.9,.11,9992),0,-.14,-1.48);st.dica=dica;
 if(P.id==='esfera'){const b=new T.Mesh(new T.SphereGeometry(.09,32,20),new T.MeshBasicMaterial({color:0x3fd48a,transparent:true,opacity:.95,depthTest:false,depthWrite:false}));b.renderOrder=9993;b.userData.p360='esfera';add(b,.42,-.36,-1.3);st.alvos.push(b);st.bola=b;}
 if(P.id==='botao'||P.id==='menu'||P.id==='fim'){const rot=P.id==='botao'?'Próximo ►':P.id==='menu'?'Entendi ✓':'Começar ►';const b=plano(T,canvasBotao(rot,['#22d68f','#0b8f5c']),.42,.118,9993);b.userData.p360='avancar';if(P.id==='menu')add(b,.4,-.3,-1.46);else add(b,0,-.34,-1.46);/* no passo do Menu o botão vai para o lado, longe do Menu real que está piscando */st.alvos.push(b);st.btn=b;}
 if(i>0){const pul=plano(T,canvasBotao('Pular',['#36536b','#22374a'],'#cfe3f1'),.2,.056,9993);pul.userData.p360='pular';add(pul,.5,-.07,-1.47);st.alvos.push(pul);}
 if(P.id==='menu'){const anel=new T.Mesh(new T.RingGeometry(.2,.24,48),new T.MeshBasicMaterial({color:0xffd65a,transparent:true,depthTest:false,depthWrite:false,side:T.DoubleSide}));anel.renderOrder=9994;st.scene.add(anel);st.anel=anel;st.dispor.push(()=>{if(anel.parent)anel.parent.remove(anel);anel.geometry.dispose();anel.material.dispose();});}
 falar(P.id,P.titulo.replace(/[!.]$/,'')+'. '+P.texto);}
function acionar(o){if(!st)return;const P=PASSOS[st.i];
 if(o==='pular'){encerrar(true);return;}
 if(o==='esfera'&&P.id==='esfera'){concluir();return;}
 if(o==='avancar'&&(P.id==='botao'||P.id==='menu'||P.id==='fim')){concluir();}}
function canvasOk(){const c=document.createElement('canvas');c.width=900;c.height=110;const x=c.getContext('2d');x.fillStyle='rgba(63,212,138,.97)';rr(x,4,4,892,102,50);x.fill();x.fillStyle='#04210f';x.font='800 50px system-ui,Segoe UI,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('✓ Muito bem!',450,58);return c;}
function concluir(){if(!st||st.esperando)return;const T=window.THREE;const ok=plano(T,canvasOk(),.9,.11,9995);
 if(st.dica)st.dica.visible=false;add(ok,0,-.14,-1.47);st.alvos.forEach(a=>a.visible=false);const prox=st.i+1;st.esperando=true;
 setTimeout(()=>{if(!st)return;st.esperando=false;if(prox>=PASSOS.length)encerrar(true);else mostrar(prox);},900);}
function acharMenu(){let m=null;st.scene.traverse(o=>{if(m||!o.visible)return;const u=o.userData||{};if(u.command==='xr:abrirmenu'||u.vrBotao==='menu')m=o;});return m;}
function quadro(){const T=window.THREE;if(!st||!T)return;const P=PASSOS[st.i];if(!P)return;const t=performance.now();
 {const sc=(ctx()||{}).scene||st.scene;if(sc!==st.scene)st.scene=sc;if(st.g.parent!==sc){if(st.g.parent)st.g.parent.remove(st.g);sc.add(st.g);}if(st.anel&&st.anel.parent!==sc){if(st.anel.parent)st.anel.parent.remove(st.anel);sc.add(st.anel);}}
 const cam=st.renderer.xr.getCamera(st.camera);const qq=new T.Quaternion(),pp=new T.Vector3(),ss=new T.Vector3();cam.matrixWorld.decompose(pp,qq,ss);const fw=new T.Vector3(0,0,-1).applyQuaternion(qq);const yaw=Math.atan2(-fw.x,-fw.z);
 /* painel segue de leve: se o aluno virar mais de 55°, o painel volta para a frente dele (menos no passo de olhar) */
 let dif=yaw-st.g.rotation.y;while(dif>Math.PI)dif-=2*Math.PI;while(dif<-Math.PI)dif+=2*Math.PI;
 if(P.id!=='olhar'&&Math.abs(dif)>.96){st.ancorar();}
 if(P.id==='olhar'&&!st.esperando){if(st.yawAnt!==null){let d=yaw-st.yawAnt;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;st.yawAcum+=Math.abs(d);}st.yawAnt=yaw;
  if(st.yawAcum>1.9&&t-st.passoT>2500){st.ancorar();concluir();}}
 if(P.id==='analogico'&&!st.esperando){try{for(const src of st.sess.inputSources){const a=src.gamepad&&src.gamepad.axes;if(a&&Math.hypot(a[2]||0,a[3]||0)>.55)st.analog+=1;}}catch(_){}if(st.analog>25)concluir();}
 /* realce do alvo apontado e pulsar */
 const a=alvoRaio();st.alvos.forEach(m=>{const k=(m===a?1.12:1)*(m===st.bola?1+.08*Math.sin(t/180):1);m.scale.set(k,k,k);});
 if(st.btn&&(P.id==='botao')){const k=1+.05*Math.sin(t/200);if(st.btn!==a)st.btn.scale.set(k,k,1);}
 if(st.anel){const m=acharMenu();if(m){m.updateMatrixWorld(true);const wp=new T.Vector3();m.getWorldPosition(wp);st.anel.position.copy(wp);st.anel.lookAt(pp);const k=1+.18*Math.sin(t/160);st.anel.scale.set(k,k,k);st.anel.visible=true;}else st.anel.visible=false;}}
function encerrar(concluido){if(!st)return;const s=st;st=null;s.vivo=false;calar();
 s.dispor.forEach(fn=>{try{fn();}catch(_){}});try{if(s.g.parent)s.g.parent.remove(s.g);}catch(_){}
 try{s.sess.removeEventListener('select',s.sel);s.sess.removeEventListener('end',s.fimSessao);}catch(_){}
 segurarControles(s.renderer,false);if(concluido)LS.set(CHAVE,new Date().toISOString().slice(0,10));
 try{window.dispatchEvent(new CustomEvent('p360-passos',{detail:{concluido:!!concluido}}));}catch(_){}}

/* ---------- v1.1 · para o painel da Sala: o que o aluno vê (olhar) e apontar um alvo (apontar) ---------- */
function labAtual(){for(const k of ['HistoriaLab','CorpoLab','TerraLab','CelulaLab','DNALab']){const L=window[k];if(L&&L.view)return L;}return null;}
function nomeChave(k){try{for(const n of Object.keys(window)){if(!/_DATA$/.test(n))continue;const D=window[n];const i=D&&D.info&&D.info[k];if(i)return i.name||i.nome||i.title||k;}}catch(_){}
 try{if(typeof CORPOS!=='undefined'&&CORPOS[k])return CORPOS[k].nome||k;}catch(_){}return k;}
function nomeObjeto(o){let x=o;while(x){const u=x.userData||{};
  if(u.p360)return 'tutorial: '+({esfera:'bola verde',avancar:'botão do tutorial',pular:'Pular'}[u.p360]||u.p360);
  if(u.command){const c=u.command;if(c==='xr:abrirmenu')return 'botão Menu';let m;if((m=/^cad:resp:(\d+)/.exec(c)))return 'alternativa '+(+m[1]+1)+' do Caderno';if((m=/^quiz:answer:(\d+)/.exec(c)))return 'alternativa '+(+m[1]+1)+' do Desafio';if((m=/^inspect:(.+)/.exec(c)))return 'botão da ficha '+nomeChave(m[1]);
   return ({'cad:fechar':'Fechar caderno','voice:repeat':'Repetir explicação','voice:stop':'Parar a voz','xr:next':'Mais opções','xr:prev':'Opções anteriores','quiz:next':'Próxima pergunta','inspect:close':'Fechar ficha'}[c])||'um botão';}
  if(u.vrBotao){const a=u.vrBotao;return a==='menu'?'botão Menu':a==='sair'?'Sair do VR':a==='catalogo'?'Catálogo':/^view:/.test(a)?'botão '+a.slice(5):'um botão';}
  if(u.corpoKey)return nomeChave(u.corpoKey);
  if(u.hit){const h=u.hit;if(h.type==='inspect'&&h.key)return nomeChave(h.key);if(h.type==='caderno')return 'porta do Caderno';if(h.type==='ala')return 'círculo de uma ala';if(h.type==='chao')return 'chão';if(h.type==='parede')return 'parede';}
  x=x.parent;}return null;}
let candCache=null,candT=0;
function candidatos(scene){const t=performance.now();if(candCache&&t-candT<2000)return candCache;const out=[];
 scene.traverse(o=>{if(!o.isMesh&&!o.isSprite)return;const u=o.userData||{};if(!(u.command||u.vrBotao||u.corpoKey||u.hit||u.p360))return;
  if(u.hit&&(u.hit.type==='chao'||u.hit.type==='parede'))return;const g=o.geometry;const tri=g&&g.index?g.index.count/3:g&&g.attributes&&g.attributes.position?g.attributes.position.count/3:0;if(tri>6000)return;out.push(o);});
 candCache=out;candT=t;return out;}
function primeiroVisivel(hs){for(const h of hs){let o=h.object,ok=true;while(o){if(o.visible===false){ok=false;break;}o=o.parent;}if(ok)return h.object;}return null;}
function olhar(){const c=ctx();const T=window.THREE;if(!c||!T||!c.renderer.xr||!c.renderer.xr.isPresenting)return null;
 const out={};try{const cand=candidatos(c.scene);const cam=c.renderer.xr.getCamera(c.camera);const o=new T.Vector3(),qq=new T.Quaternion(),sc=new T.Vector3();cam.matrixWorld.decompose(o,qq,sc);
  const r=new T.Raycaster(o,new T.Vector3(0,0,-1).applyQuaternion(qq));const a=primeiroVisivel(r.intersectObjects(cand,false));const n=a&&nomeObjeto(a);if(n)out.olha=n;
  for(let i=0;i<2;i++){const ctl=c.renderer.xr.getController(i);if(!ctl)continue;ctl.matrixWorld.decompose(o,qq,sc);if(o.lengthSq()<1e-6)continue;r.set(o,new T.Vector3(0,0,-1).applyQuaternion(qq));const b=primeiroVisivel(r.intersectObjects(cand,false));const nb=b&&nomeObjeto(b);if(nb){out.raio=nb;break;}}}catch(_){}
 try{const L=labAtual();if(L&&L.view)out.menu=!!L.view.menuAberto;else if(window.PortalSolarV8&&PortalSolarV8.state)out.menu=!!PortalSolarV8.state.menuVR;}catch(_){}
 if(st)out.passo=(st.i+1)+'/'+PASSOS.length;return out;}
/* apontar: o alvo pisca (anel dourado) e, se estiver fora da visão, uma seta mostra para onde virar. 10 segundos. */
let ap=null;
function alvoApontar(oque){const c=ctx();if(!c)return null;let alvo=null;
 if(oque==='menu')return acharMenuEm(c.scene);
 if(oque==='painel'){const L=labAtual();if(L&&L.view&&L.view.ui){let maior=0;L.view.ui.traverse(o=>{if(!o.isMesh||!o.visible||!o.geometry||!o.geometry.parameters)return;const w=o.geometry.parameters.width||0;if(w>maior&&!o.userData.command){maior=w;alvo=o;}});}
  else if(window.PortalSolarV8&&PortalSolarV8.state&&PortalSolarV8.state.xrPanel)alvo=PortalSolarV8.state.xrPanel;return alvo;}
 if(oque==='peca'){const L=labAtual();if(L){if(L.view&&L.view._copia&&L.view._copia.parent)return L.view._copia;const k=L.inspectKey;if(k){c.scene.traverse(o=>{if(!alvo&&o.userData&&o.userData.hit&&o.userData.hit.key===k)alvo=o;});}}return alvo;}
 if(oque==='caderno'){const T=window.THREE;const cam=c.renderer.xr.getCamera(c.camera);const p=new T.Vector3(),qq=new T.Quaternion(),sc=new T.Vector3();cam.matrixWorld.decompose(p,qq,sc);const fw=new T.Vector3(0,0,-1).applyQuaternion(qq);
  let alaId=null;try{const L=labAtual(),D=window.HISTORIA_DATA;if(L&&D&&L.state.ala>=0&&D.ALAS[L.state.ala])alaId=D.ALAS[L.state.ala].id;}catch(_){}
  let melhor=1e9;c.scene.traverse(o=>{const h=o.userData&&o.userData.hit;if(!(h&&h.type==='caderno'&&o.isMesh))return;if(alaId&&h.ala===alaId){alvo=o;melhor=-1;return;}if(melhor<0)return;const w=new T.Vector3();o.getWorldPosition(w);const ang=fw.angleTo(w.sub(p).normalize());if(ang<melhor){melhor=ang;alvo=o;}});return alvo;}
 return null;}
function acharMenuEm(scene){let m=null;scene.traverse(o=>{if(m||!o.visible)return;const u=o.userData||{};if(u.command==='xr:abrirmenu'||u.vrBotao==='menu')m=o;});return m;}
const NOME_ALVO={menu:'o botão Menu',painel:'o painel de texto',peca:'a peça que você escolheu',caderno:'a porta do Caderno'};
function placaTxt(T,t){const c=document.createElement('canvas');c.width=900;c.height=120;const x=c.getContext('2d');x.fillStyle='rgba(255,214,90,.97)';rr(x,4,4,892,112,56);x.fill();x.fillStyle='#1b1300';let fs=46;x.font='800 '+fs+'px system-ui,Segoe UI,Arial';while(x.measureText(t).width>850&&fs>24){fs-=2;x.font='800 '+fs+'px system-ui,Segoe UI,Arial';}x.textAlign='center';x.textBaseline='middle';x.fillText(t,450,62);return plano(T,c,.75,.1,9996);}
function pararApontar(){if(!ap)return;const a=ap;ap=null;a.vivo=false;a.fim.forEach(f=>{try{f();}catch(_){}});}
function apontar(oque){const c=ctx();const T=window.THREE;if(!c||!T||!c.renderer.xr||!c.renderer.xr.isPresenting)return false;pararApontar();
 const {renderer,scene,camera}=c;const sess=renderer.xr.getSession();const fim=[];const a={vivo:true,fim,t0:performance.now(),oque};ap=a;
 const anel=new T.Mesh(new T.RingGeometry(.86,1,56),new T.MeshBasicMaterial({color:0xffd65a,transparent:true,depthTest:false,depthWrite:false,side:T.DoubleSide,toneMapped:false}));anel.renderOrder=9997;scene.add(anel);
 const seta=new T.Mesh(new T.ConeGeometry(.06,.17,24),new T.MeshBasicMaterial({color:0xffd65a,depthTest:false,depthWrite:false,toneMapped:false}));seta.renderOrder=9998;scene.add(seta);a.anel=anel;a.seta=seta;
 const alvo0=alvoApontar(oque);const msg=alvo0?'👀 Olhe para '+NOME_ALVO[oque]+', que está piscando':'👀 Olhe para '+(NOME_ALVO[oque]||'a frente');const placa=placaTxt(T,msg);scene.add(placa);
 const trocarPlaca=t=>{const nova=placaTxt(T,t);placa.material.map.dispose();placa.material.map=nova.material.map;placa.material.needsUpdate=true;nova.geometry.dispose();};
 fim.push(()=>{[anel,seta,placa].forEach(m=>{if(m.parent)m.parent.remove(m);m.geometry.dispose();if(m.material.map)m.material.map.dispose();m.material.dispose();});});
 try{if(window.speechSynthesis){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(msg.replace('👀 ',''));u.lang='pt-BR';speechSynthesis.speak(u);}}catch(_){}
 const cp=new T.Vector3(),cq=new T.Quaternion(),cs=new T.Vector3(),wp=new T.Vector3(),bx=new T.Box3(),sz=new T.Vector3();
 const loop=()=>{if(!a.vivo)return;try{passoApontar();}catch(e){console.warn('Portal360Passos.apontar:',e);}sess.requestAnimationFrame(loop);};
 const passoApontar=()=>{const t=performance.now();if(t-a.t0>(+window.__p360dur||10000)){pararApontar();return;}
  {const sc=(ctx()||{}).scene||scene;[anel,seta,placa].forEach(m=>{if(m.parent!==sc){if(m.parent)m.parent.remove(m);sc.add(m);}});}/* o app pode reconstruir a cena (ex.: trocar de ala): o aviso volta */
  const cam=renderer.xr.getCamera(camera);cam.matrixWorld.decompose(cp,cq,cs);const fw=new T.Vector3(0,0,-1).applyQuaternion(cq);
  placa.position.copy(cp).addScaledVector(fw,1.3).add(new T.Vector3(0,-.32,0).applyQuaternion(cq));placa.quaternion.copy(cq);
  const alvo=alvoApontar(oque);if(alvo){alvo.updateMatrixWorld(true);bx.setFromObject(alvo);if(bx.isEmpty()){alvo.getWorldPosition(wp);sz.set(.3,.3,.3);}else{bx.getCenter(wp);bx.getSize(sz);}
   const r=Math.max(.12,Math.min(.9,Math.max(sz.x,sz.y)*.62));const k=r*(1+.15*Math.sin(t/150));anel.scale.set(k,k,k);anel.position.copy(wp);anel.lookAt(cp);anel.visible=true;
   const dir=wp.clone().sub(cp).normalize();const ang=fw.angleTo(dir);
   /* fora da visão: seta horizontal para o lado em que o aluno deve virar, e o aviso diz o lado */
   if(ang>.6){seta.visible=true;const dir2=new T.Vector3(1,0,0).applyQuaternion(cq);dir2.y=0;dir2.normalize();const sinal=dir.dot(dir2)>=0?1:-1;const lado=dir2.multiplyScalar(sinal);seta.position.copy(cp).addScaledVector(fw,.9).addScaledVector(lado,.3+.04*Math.sin(t/120));seta.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),lado);seta.scale.setScalar(1);
    const ladoTxt=sinal>0?'direita':'esquerda';if(a.lado!==ladoTxt){a.lado=ladoTxt;trocarPlaca('➜ Vire para a '+ladoTxt+': '+NOME_ALVO[oque]+' está piscando');}}else{seta.visible=false;if(a.lado){a.lado=null;trocarPlaca(msg);}}}
  else{anel.visible=false;seta.visible=false;}};
 sess.requestAnimationFrame(loop);const fimS=()=>pararApontar();sess.addEventListener('end',fimS);fim.push(()=>sess.removeEventListener('end',fimS));return !!alvo0;}
/* ---------- quando o aluno entra no VR ---------- */
let ligado=null;
function vigiar(){const c=ctx();if(c&&c.renderer&&c.renderer.xr&&ligado!==c.renderer){ligado=c.renderer;c.renderer.xr.addEventListener('sessionstart',()=>{setTimeout(()=>iniciar(false),2500);});
 if(c.renderer.xr.isPresenting)setTimeout(()=>iniciar(false),2500);}
 setTimeout(vigiar,1500);}
vigiar();
window.Portal360Passos={versao:VERSAO,iniciar:()=>iniciar(true),olhar,apontar,get ativo(){return !!st;},get passo(){return st?PASSOS[st.i].id:null;},esquecer:()=>LS.del(CHAVE),
 _teste:{acionar:o=>acionar(o),concluir:()=>concluir(),passos:PASSOS.map(p=>p.id)}};
})();
