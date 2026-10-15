/* Portal de entrada · Portal 360º VR · Portal do Educador (v1.0.0, out/2026)
   Abertura cinematográfica ao entrar no óculos (e no 3D da lousa/desktop), igual para todos os apps do catálogo.
   Sequência (~9 s): escuridão com estrelas → partículas chegam em redemoinho → formam o logo do Portal do Educador →
   o logo vira um anel de luz → o anel avança e atravessa o aluno → o mundo do app se revela numa onda de luz → título.
   - VR/realidade mista: desenhado dentro da cena do próprio app (mesmo renderer), por cima de tudo, sem pós-processamento.
   - 3D: camada própria por cima da página (canvas transparente), que se abre revelando o app.
   - Gatilho do controle, clique, toque, Esc ou Espaço pulam. Na 2ª entrada no VR da mesma página, versão curta.
   - Som sintetizado no navegador (sem arquivos). Requer THREE r128 global.
   Uso (no app, depois que a cena existe):
     PortalEntrada.configurar({titulo, subtitulo, cor, logo, obter:()=>({renderer,scene,camera}), auto3D:true});
     PortalEntrada.depois(fn, atraso)  → roda fn quando a abertura revela o app (ou após "atraso" ms se não houver abertura)
     PortalEntrada.tocar3D()           → abertura em 3D sob demanda
   Arquivo-mestre: assets/portal-entrada/portal-entrada.js (cópia idêntica em cada apps/<app>/portal-entrada.js). */
(function(){
'use strict';
if(window.PortalEntrada)return;
const VERSAO='1.0.1';
const DUR=9.4,REVELA_FIM=7.6,INICIO_CURTO=5.2;
let cfg=null,ativo=null,entradasXR=0,fila=[];
const agoraS=()=>(typeof window.__peRelogio==='function'?window.__peRelogio():performance.now()/1000); /* relógio substituível só em teste */
const reduzido=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){return false;}};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fase=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const suave=x=>x*x*(3-2*x);
const sai=x=>1-Math.pow(1-x,3);

/* ---------- som sintetizado ---------- */
let actx=null;
function audio(){try{if(!actx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;actx=new C();}if(actx.state==='suspended')actx.resume();return actx;}catch(_){return null;}}
function trilha(ctx,curto){
  if(!ctx)return null;
  const mestre=ctx.createGain();mestre.gain.value=0;mestre.connect(ctx.destination);
  const t0=ctx.currentTime+0.02,off=curto?INICIO_CURTO:0,em=s=>t0+Math.max(0,s-off);
  mestre.gain.setValueAtTime(0,t0);mestre.gain.linearRampToValueAtTime(0.55,t0+0.6);
  const nos=[];
  // drone grave que cresce até a travessia
  if(!curto){
    const filtro=ctx.createBiquadFilter();filtro.type='lowpass';filtro.frequency.setValueAtTime(120,t0);filtro.frequency.exponentialRampToValueAtTime(900,em(5.6));filtro.frequency.exponentialRampToValueAtTime(200,em(8.5));filtro.connect(mestre);
    const g=ctx.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.32,em(2));g.gain.linearRampToValueAtTime(0.5,em(5.6));g.gain.exponentialRampToValueAtTime(0.001,em(8.8));g.connect(filtro);
    [55,55.4,82.5].forEach((f,i)=>{const o=ctx.createOscillator();o.type=i===2?'triangle':'sawtooth';o.frequency.value=f;o.connect(g);o.start(t0);o.stop(em(9));nos.push(o);});
    // brilho quando o logo se forma
    [880,1318.5,1760,2637].forEach((f,i)=>{const o=ctx.createOscillator(),gg=ctx.createGain();o.type='sine';o.frequency.value=f;const ti=em(3.35+i*0.09);gg.gain.setValueAtTime(0,ti);gg.gain.linearRampToValueAtTime(0.09/(i+1)+0.03,ti+0.02);gg.gain.exponentialRampToValueAtTime(0.0008,ti+2.2);o.connect(gg);gg.connect(mestre);o.start(ti);o.stop(ti+2.4);nos.push(o);});
  }
  // whoosh na travessia do portal
  const dur=1.8,buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*dur),ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);
  const ru=ctx.createBufferSource();ru.buffer=buf;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;
  const tw=em(5.3);bp.frequency.setValueAtTime(220,tw);bp.frequency.exponentialRampToValueAtTime(2600,tw+0.9);bp.frequency.exponentialRampToValueAtTime(400,tw+dur);
  const gw=ctx.createGain();gw.gain.setValueAtTime(0,tw);gw.gain.linearRampToValueAtTime(0.5,tw+0.85);gw.gain.exponentialRampToValueAtTime(0.001,tw+dur);
  ru.connect(bp);bp.connect(gw);gw.connect(mestre);ru.start(tw);ru.stop(tw+dur);nos.push(ru);
  // acorde de chegada no app
  [261.6,392,523.3,659.3].forEach((f,i)=>{const o=ctx.createOscillator(),gg=ctx.createGain();o.type='sine';o.frequency.value=f;const ti=em(6.5)+i*0.04;gg.gain.setValueAtTime(0,ti);gg.gain.linearRampToValueAtTime(0.07,ti+0.25);gg.gain.exponentialRampToValueAtTime(0.0008,ti+2.6);o.connect(gg);gg.connect(mestre);o.start(ti);o.stop(ti+2.8);nos.push(o);});
  return{parar(rapido){try{const t=ctx.currentTime;mestre.gain.cancelScheduledValues(t);mestre.gain.setValueAtTime(mestre.gain.value,t);mestre.gain.linearRampToValueAtTime(0,t+(rapido?0.3:0.8));setTimeout(()=>{nos.forEach(n=>{try{n.stop();}catch(_){}});try{mestre.disconnect();}catch(_){}},1000);}catch(_){}}};
}

/* ---------- alvos das partículas a partir do logo ---------- */
function alvosDoLogo(img,n,largura){
  const out=new Float32Array(n*3);
  let pts=[];
  try{
    if(img&&img.naturalWidth){
      const S=160,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.drawImage(img,0,0,S,S);
      const px=g.getImageData(0,0,S,S).data;
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=(y*S+x)*4;if(px[i+3]<140)continue;const l=(px[i]*0.3+px[i+1]*0.59+px[i+2]*0.11)/255;const p=Math.pow(l,2.2)+0.04;pts.push([x/S-0.5,0.5-y/S,p]);}
    }
  }catch(_){pts=[];}
  for(let k=0;k<n;k++){
    let x,y;
    if(pts.length){let tent=0,p;do{p=pts[(Math.random()*pts.length)|0];tent++;}while(Math.random()>p[2]&&tent<24);x=p[0]+(Math.random()-0.5)/160;y=p[1]+(Math.random()-0.5)/160;}
    else{const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*0.48;x=Math.cos(a)*r;y=Math.sin(a)*r;}
    out[k*3]=x*largura;out[k*3+1]=y*largura;out[k*3+2]=(Math.random()-0.5)*0.03;
  }
  return out;
}

/* ---------- placa de título ---------- */
function texturaTitulo(T,titulo,subtitulo,cor){
  const c=document.createElement('canvas');c.width=1024;c.height=320;const g=c.getContext('2d');
  g.clearRect(0,0,1024,320);
  const fundo=g.createRadialGradient(512,170,40,512,170,520);fundo.addColorStop(0,'rgba(3,12,26,0.78)');fundo.addColorStop(0.6,'rgba(3,12,26,0.55)');fundo.addColorStop(1,'rgba(3,12,26,0)');g.fillStyle=fundo;g.fillRect(0,0,1024,320);
  const fonte='"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif';
  g.textAlign='center';g.textBaseline='middle';
  let tam=96;g.font='800 '+tam+'px '+fonte;while(g.measureText(titulo).width>940&&tam>40){tam-=4;g.font='800 '+tam+'px '+fonte;}
  g.shadowColor=cor;g.shadowBlur=36;g.fillStyle='#ffffff';g.fillText(titulo,512,128);
  g.shadowBlur=0;
  const gr=g.createLinearGradient(262,0,762,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,cor);gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(262,200,500,3);
  g.font='600 30px '+fonte;g.fillStyle='#bfe9ff';
  const sub=(subtitulo||'').toUpperCase().split('').join(String.fromCharCode(8202));
  g.fillText(sub,512,250);
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;
}

/* ---------- shaders ---------- */
const VEU_VS='varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const VEU_FS=[
'precision mediump float;varying vec3 vDir;uniform float uR;uniform float uOp;uniform float uT;uniform vec3 uBorda;',
'float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}',
'void main(){',
' float ang=acos(clamp(dot(normalize(vDir),vec3(0.0,0.0,-1.0)),-1.0,1.0));',
' float a=smoothstep(uR-0.32,uR,ang);',
' vec3 base=vec3(0.006,0.016,0.04)+vec3(0.0,0.025,0.06)*(1.0-abs(vDir.y));',
' vec3 cel=floor(normalize(vDir)*150.0);float s=h(cel);',
' float est=step(0.9965,s)*(0.55+0.45*sin(uT*2.0+s*60.0));',
' float borda=uR>0.0?exp(-pow((ang-uR)/0.075,2.0)):0.0;',
' vec3 cor=base+vec3(est)*0.9+uBorda*borda*1.7;',
' gl_FragColor=vec4(cor,max(a,borda*0.95)*uOp);',
'}'].join('\n');
const PART_VS=[
'attribute vec3 aAlvo;attribute vec4 aR;uniform float uT;uniform float uIn;uniform float uMorph;uniform float uAnel;uniform float uTam;uniform float uPix;',
'uniform vec3 uCorA;uniform vec3 uCorB;varying vec3 vCor;varying float vBri;',
'void main(){',
' float ang=aR.y*6.2832+uT*(0.9/(0.25+aR.x));float rad=0.15+aR.x*1.5;',
' float br=floor(aR.w*3.0)*2.0944;float esp=ang+rad*1.8+br*0.0;vec3 vort=vec3(cos(esp)*rad,sin(esp)*rad*0.82,(aR.z-0.5)*0.25*rad+sin(uT*1.3+aR.w*6.28)*0.04);vort.y+=vort.z*0.35;',
' vort.z-=(1.0-uIn)*(4.0+aR.w*6.0);vort.xy*=mix(3.0,1.0,uIn);',
' vec3 logo=aAlvo+vec3(0.0,0.0,sin(uT*3.0+aR.w*20.0)*0.01);',
' float ra=aR.y*6.2832+uT*0.6;vec3 anel=vec3(cos(ra)*0.78,sin(ra)*0.78,0.0)+(aR.xzw-0.5)*0.05;',
' float m=clamp(uMorph*1.6-aR.w*0.6,0.0,1.0);m=m*m*(3.0-2.0*m);',
' float r=clamp(uAnel*1.6-aR.x*0.6,0.0,1.0);r=r*r*(3.0-2.0*r);',
' vec3 p=mix(mix(vort,logo,m),anel,r);',
' vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;',
' gl_PointSize=clamp(uTam*(0.6+aR.z*0.9)*uPix/max(-mv.z,0.2),1.0,64.0);',
' vCor=mix(uCorA,uCorB,step(0.84,aR.x));vBri=0.55+0.45*sin(uT*4.0+aR.w*40.0);',
'}'].join('\n');
const PART_FS='precision mediump float;varying vec3 vCor;varying float vBri;uniform float uOp;void main(){float d=length(gl_PointCoord-0.5);float a=smoothstep(0.5,0.0,d);a*=a;gl_FragColor=vec4(vCor*vBri*a*uOp,a*uOp);}';

function corVec(T,hex){const c=new T.Color(hex);return new T.Vector3(c.r,c.g,c.b);}

/* ---------- monta a cena da abertura ---------- */
function montar(T,opt){
  const N=opt.xr?2600:3200;
  const raiz=new T.Group();raiz.name='portal-entrada';
  const veuGrupo=new T.Group();
  const palco=new T.Group();palco.position.set(0,0,-2.6);raiz.add(palco);
  const lista=[];
  const mat=m=>{m.depthTest=false;m.depthWrite=false;m.transparent=true;lista.push(m);return m;};
  // véu
  const veuMat=mat(new T.ShaderMaterial({vertexShader:VEU_VS,fragmentShader:VEU_FS,side:T.BackSide,uniforms:{uR:{value:-0.4},uOp:{value:1},uT:{value:0},uBorda:{value:corVec(T,'#7fe3ff')}}}));
  const veu=new T.Mesh(new T.SphereGeometry(5,48,32),veuMat);veu.renderOrder=9990;veu.frustumCulled=false;veuGrupo.add(veu);
  // partículas
  const geo=new T.BufferGeometry();
  const pos=new Float32Array(N*3),rnd=new Float32Array(N*4);for(let i=0;i<N*4;i++)rnd[i]=Math.random();
  geo.setAttribute('position',new T.BufferAttribute(pos,3));
  geo.setAttribute('aAlvo',new T.BufferAttribute(alvosDoLogo(opt.img,N,1.3),3));
  geo.setAttribute('aR',new T.BufferAttribute(rnd,4));
  const partMat=mat(new T.ShaderMaterial({vertexShader:PART_VS,fragmentShader:PART_FS,blending:T.AdditiveBlending,uniforms:{uT:{value:0},uIn:{value:0},uMorph:{value:0},uAnel:{value:0},uOp:{value:0},uTam:{value:20},uPix:{value:1},uCorA:{value:corVec(T,'#57d4ff')},uCorB:{value:corVec(T,opt.cor)}}}));
  const pontos=new T.Points(geo,partMat);pontos.renderOrder=9991;pontos.frustumCulled=false;palco.add(pontos);
  // logo nítido (aparece sobre as partículas quando elas formam a imagem)
  let logoTex=null,logo=null;
  if(opt.img&&opt.img.naturalWidth){logoTex=new T.Texture(opt.img);logoTex.encoding=T.sRGBEncoding;logoTex.needsUpdate=true;
    logo=new T.Mesh(new T.PlaneGeometry(1.3,1.3),mat(new T.MeshBasicMaterial({map:logoTex,opacity:0})));logo.renderOrder=9992;logo.frustumCulled=false;logo.position.z=0.02;palco.add(logo);}
  // halo do anel
  const haloMat=mat(new T.MeshBasicMaterial({color:new T.Color('#9fe8ff'),opacity:0,blending:T.AdditiveBlending,side:T.DoubleSide}));
  const halo=new T.Mesh(new T.RingGeometry(0.765,0.795,128),haloMat);halo.renderOrder=9992;halo.frustumCulled=false;palco.add(halo);
  // título
  const titTex=texturaTitulo(T,opt.titulo,opt.subtitulo,opt.cor);
  const titMat=mat(new T.MeshBasicMaterial({map:titTex,opacity:0}));
  const titulo=new T.Mesh(new T.PlaneGeometry(2.1,2.1*320/1024),titMat);titulo.renderOrder=9993;titulo.frustumCulled=false;titulo.position.set(0,0.02,-2.2);raiz.add(titulo);
  return{raiz,veuGrupo,palco,veuMat,partMat,logo,haloMat,titMat,titulo,
    atualizar(t,pix){
      const u=partMat.uniforms;u.uT.value=t;u.uPix.value=pix;veuMat.uniforms.uT.value=t;
      u.uIn.value=sai(fase(t,0.1,2.2));
      u.uMorph.value=suave(fase(t,2.3,3.7));
      u.uAnel.value=suave(fase(t,4.3,5.3));
      u.uOp.value=fase(t,0.1,0.8)*(1-fase(t,6.3,7.0));
      if(logo)logo.material.opacity=fase(t,3.2,3.9)*(1-fase(t,4.3,4.9))*0.95;
      haloMat.opacity=fase(t,4.9,5.4)*(1-fase(t,6.2,6.8))*0.5;
      const voo=suave(fase(t,5.0,6.6));palco.position.z=-2.6+voo*2.9;const esc=1+voo*2.4;palco.scale.set(esc,esc,esc);
      palco.rotation.z=t*0.05;
      veuMat.uniforms.uR.value=t<5.55?-0.4:Math.pow(fase(t,5.55,REVELA_FIM),opt.xr?1.5:1.2)*(opt.angMax||Math.PI+0.5);
      titMat.opacity=fase(t,7.0,7.6)*(1-fase(t,8.8,9.4));
      titulo.position.y=0.02+(1-sai(fase(t,7.0,7.7)))*-0.06;
    },
    descartar(){raiz.traverse(o=>{if(o.geometry)o.geometry.dispose();});veu.geometry.dispose();lista.forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}
  };
}

/* ---------- logo ---------- */
let logoImg=null,logoPronto=null;
function carregarLogo(src){if(logoPronto)return logoPronto;logoPronto=new Promise(res=>{if(!src){res(null);return;}const i=new Image();i.onload=()=>{logoImg=i;res(i);};i.onerror=()=>res(null);i.src=src;setTimeout(()=>res(logoImg),2500);});return logoPronto;}

function liberarFila(){const f=fila;fila=[];f.forEach(x=>{try{x();}catch(e){console.error(e);}});}

/* ---------- VR / realidade mista: dentro da cena do app ---------- */
function tocarXR(){
  const T=window.THREE;if(!T||!cfg)return;
  const ctx=cfg.obter&&cfg.obter();if(!ctx||!ctx.renderer||!ctx.scene||!ctx.camera)return;
  const {renderer,scene,camera}=ctx;const session=renderer.xr.getSession&&renderer.xr.getSession();if(!session)return;
  if(ativo)ativo.fim(true);
  entradasXR++;const curto=entradasXR>1;
  const c=montar(T,{xr:true,img:logoImg,cor:cfg.cor,titulo:cfg.titulo,subtitulo:cfg.subtitulo});
  scene.add(c.veuGrupo);scene.add(c.raiz);c.raiz.visible=false;
  const som=trilha(audio(),curto);
  const t0=agoraS()-(curto?INICIO_CURTO:0);let saindo=0,fixado=false,revelou=false,encerrado=false;
  const pos=new T.Vector3(),q=new T.Quaternion(),esc=new T.Vector3(),fr=new T.Vector3();
  // engole os cliques dos controles durante a abertura (para não acionar botões escondidos) e usa o gatilho para pular
  const ctrls=[];for(let i=0;i<2;i++){try{const g=renderer.xr.getController(i);const orig=g.dispatchEvent;g.dispatchEvent=function(e){if(e&&/^(select|squeeze)/.test(e.type)){if(e.type==='selectstart'||e.type==='squeezestart')pular();return;}return orig.call(this,e);};ctrls.push([g,orig]);}catch(_){}}
  function pular(){if(!saindo&&!encerrado){saindo=agoraS();if(som)som.parar(true);}}
  function fim(imediato){if(encerrado)return;encerrado=true;ctrls.forEach(([g,o])=>{g.dispatchEvent=o;});scene.remove(c.raiz);scene.remove(c.veuGrupo);c.descartar();if(imediato&&som)som.parar(true);if(!revelou){revelou=true;liberarFila();}ativo=null;}
  session.addEventListener('end',()=>fim(true),{once:true});
  function quadro(){
    if(encerrado)return;
    const agora=agoraS(),t=agora-t0;
    camera.matrixWorld.decompose(pos,q,esc);
    c.veuGrupo.position.copy(pos);
    if(!fixado&&agora-(t0+(curto?INICIO_CURTO:0))>0.25){
      fr.set(0,0,-1).applyQuaternion(q);fr.y=0;if(fr.lengthSq()<1e-4)fr.set(0,0,-1);fr.normalize();
      const yaw=Math.atan2(-fr.x,-fr.z);c.raiz.position.copy(pos);c.raiz.rotation.set(0,yaw,0);c.veuGrupo.rotation.set(0,yaw,0);c.raiz.visible=true;fixado=true;
    }
    let pix=1.8;try{const l=session.renderState.baseLayer;if(l&&l.framebufferHeight)pix=l.framebufferHeight/1000;}catch(_){}
    c.atualizar(Math.min(t,DUR),pix);
    if(saindo){const k=1-fase(agora,saindo,saindo+0.4);c.veuMat.uniforms.uOp.value=k;c.partMat.uniforms.uOp.value*=k;c.titMat.opacity*=k;c.haloMat.opacity*=k;if(c.logo)c.logo.material.opacity*=k;if(k<=0){fim(false);return;}}
    if(!revelou&&t>=REVELA_FIM){revelou=true;liberarFila();}
    if(t>=DUR){fim(false);return;}
    session.requestAnimationFrame(quadro);
  }
  session.requestAnimationFrame(quadro);
  ativo={fim,pular};
}

/* ---------- 3D: camada própria por cima da página ---------- */
function tocar3D(){
  const T=window.THREE;if(!T||!cfg||ativo||reduzido())return Promise.resolve(false);
  return carregarLogo(cfg.logo).then(()=>{
    if(ativo)return false;
    // <dialog> modal entra na "camada de topo": fica acima até de outros diálogos modais do app (ex.: boas-vindas do Corpo Humano)
    if(!document.getElementById('pe-estilo')){const st=document.createElement('style');st.id='pe-estilo';st.textContent='.pe-camada{position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;z-index:2147483600;cursor:pointer;touch-action:none;overflow:hidden}.pe-camada::backdrop{background:transparent}';document.head.appendChild(st);}
    const modal=typeof HTMLDialogElement==='function';
    const ov=document.createElement(modal?'dialog':'div');ov.className='pe-camada';
    const cv=document.createElement('canvas');cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';ov.appendChild(cv);
    const bt=document.createElement('button');bt.type='button';bt.dataset.action='pe-pular';bt.textContent='Pular ▸';
    bt.style.cssText='position:absolute;right:22px;bottom:22px;z-index:2;border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:10px 18px;background:rgba(5,14,26,.6);color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer;opacity:.8';
    ov.appendChild(bt);document.body.appendChild(ov);
    if(modal){try{ov.showModal();}catch(_){ov.setAttribute('open','');}ov.addEventListener('cancel',e=>{e.preventDefault();pular();});}
    let renderer;try{renderer=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true,powerPreference:'high-performance'});}catch(e){ov.remove();return false;}
    renderer.outputEncoding=T.sRGBEncoding;renderer.setClearColor(0x000000,0);const dpr=Math.min(window.devicePixelRatio||1,2);renderer.setPixelRatio(dpr);
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(60,1,0.05,50);
    const c=montar(T,{xr:false,img:logoImg,cor:cfg.cor,titulo:cfg.titulo,subtitulo:cfg.subtitulo,angMax:1.6});scene.add(c.veuGrupo);scene.add(c.raiz);
    function dimensionar(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
      // garante largura útil de ~3,6 m a 2,6 m de distância em tela retrato
      const vfovMin=2*Math.atan(1.7/2.6)*180/Math.PI,hfov=2*Math.atan(1.85/2.6);const vfovPorLargura=2*Math.atan(Math.tan(hfov/2)/camera.aspect)*180/Math.PI;
      camera.fov=Math.max(60,Math.min(100,camera.aspect<1?vfovPorLargura:vfovMin));camera.updateProjectionMatrix();}
    dimensionar();addEventListener('resize',dimensionar);
    const som=trilha(audio(),false);
    const t0=agoraS();let saindo=0,revelou=false,encerrado=false,raf=0;
    function pular(){if(!saindo&&!encerrado){saindo=agoraS();if(som)som.parar(true);}}
    const tecla=e=>{if(e.key==='Escape'||e.key===' '||e.key==='Enter'){e.preventDefault();pular();}};
    ov.addEventListener('pointerdown',e=>{e.preventDefault();pular();});addEventListener('keydown',tecla,true);
    function fim(){if(encerrado)return;encerrado=true;cancelAnimationFrame(raf);removeEventListener('resize',dimensionar);removeEventListener('keydown',tecla,true);c.descartar();try{renderer.dispose();renderer.forceContextLoss();}catch(_){}try{if(ov.open&&ov.close)ov.close();}catch(_){}ov.remove();if(!revelou){revelou=true;liberarFila();}ativo=null;}
    function quadro(){
      const agora=agoraS(),t=agora-t0;
      c.atualizar(Math.min(t,DUR),Math.max(0.9,renderer.domElement.height/1000));
      if(saindo){const k=1-fase(agora,saindo,saindo+0.4);c.veuMat.uniforms.uOp.value=k;c.partMat.uniforms.uOp.value*=k;c.titMat.opacity*=k;c.haloMat.opacity*=k;if(c.logo)c.logo.material.opacity*=k;if(k<=0){fim();return;}}
      if(t>6.6)ov.style.pointerEvents='none';
      if(!revelou&&t>=REVELA_FIM){revelou=true;liberarFila();}
      renderer.render(scene,camera);
      if(t>=DUR){fim();return;}
      raf=requestAnimationFrame(quadro);
    }
    raf=requestAnimationFrame(quadro);
    ativo={fim,pular};
    return true;
  });
}

/* ---------- API ---------- */
function ligarRenderer(){
  if(!cfg)return;let tent=0;
  const tentar=()=>{const ctx=cfg.obter&&cfg.obter();if(ctx&&ctx.renderer&&ctx.renderer.xr){ctx.renderer.xr.addEventListener('sessionstart',()=>{if(!logoImg&&cfg.logo)carregarLogo(cfg.logo);tocarXR();});return;}if(++tent<120)setTimeout(tentar,250);};
  tentar();
}
window.PortalEntrada={
  versao:VERSAO,
  configurar(o){
    cfg=Object.assign({titulo:'Portal 360º',subtitulo:'Portal 360º · Portal do Educador',cor:'#57d4ff',logo:'assets/logo.png',auto3D:true},o||{});
    carregarLogo(cfg.logo);ligarRenderer();
    if(cfg.auto3D){
      const q=new URLSearchParams(location.search);
      const chave='portal360_entrada_'+location.pathname;let ja=false;try{ja=sessionStorage.getItem(chave)==='1';}catch(_){}
      if(q.get('vr')!=='1'&&q.get('embed')!=='1'&&q.get('abertura')!=='0'&&!ja){try{sessionStorage.setItem(chave,'1');}catch(_){}setTimeout(()=>tocar3D(),150);}
    }
  },
  tocar3D,
  pular(){if(ativo)ativo.pular();},
  /* renderer, cena e câmera do app (usado pela Sala do professor para os avisos no VR) */
  contexto(){try{return cfg&&cfg.obter?cfg.obter():null;}catch(_){return null;}},
  get ativo(){return !!ativo;},
  depois(fn,atraso){if(typeof fn!=='function')return;if(ativo)fila.push(fn);else setTimeout(fn,atraso||0);}
};
})();
