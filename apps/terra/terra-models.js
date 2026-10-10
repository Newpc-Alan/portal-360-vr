/* Terra por Dentro · modelos procedurais (v1.0)
   Tudo gerado no navegador: superfície com continentes por ruído, camadas em esferas aninhadas, corte com plano de recorte
   e "tampas" em anel (secção), viagem ao centro em túnel helicoidal com cores por camada. Sem arquivos externos. */
(function(){'use strict';
const T=THREE,D=window.TERRA_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const R=3; /* raio da Terra na cena */
/* proporções didáticas (a crosta real teria 0,5% do raio e ficaria invisível) */
const CAMADAS=[
 {key:'crosta',r:1.0,r0:.965,cor:0x8fd0a0,emis:0x0a2a14},
 {key:'manto_superior',r:.965,r0:.89,cor:0xe07a3c,emis:0x3a1a08},
 {key:'manto_inferior',r:.89,r0:.55,cor:0xc84a28,emis:0x3a0e06},
 {key:'nucleo_externo',r:.55,r0:.25,cor:0xf0a030,emis:0x6a3a08},
 {key:'nucleo_interno',r:.25,r0:0,cor:0xfff0a0,emis:0x8a7030}
];
const mat=(color,extra={})=>new T.MeshStandardMaterial(Object.assign({color,roughness:.7,metalness:.05},extra));
function tag(o,data){o.traverse(x=>{if(x.isMesh)x.userData.hit=data;});o.userData.hit=data;return o;}
function ball(r,color,pos,extra,seg=24){const m=new T.Mesh(new T.SphereGeometry(r,seg,Math.max(10,seg*.7|0)),mat(color,extra));if(pos)m.position.copy(pos);return m;}
function label(text,color='#e7f6ff',width=1.5,size=56){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.font='600 '+size+'px Segoe UI,Arial';while(ctx.measureText(text).width>490&&size>17){size-=2;ctx.font='600 '+size+'px Segoe UI,Arial';}ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#031220';ctx.shadowBlur=7;ctx.fillStyle=color;ctx.fillText(text,256,64);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.minFilter=T.LinearMipmapLinearFilter;tx.generateMipmaps=true;tx.anisotropy=8;const sp=new T.Sprite(new T.SpriteMaterial({toneMapped:false,map:tx,transparent:true,depthWrite:false,depthTest:true}));sp.scale.set(width,width/4,1);return sp;}
function textAt(g,text,x,y,z=0,width=1.5,color){const sp=label(text,color,width);sp.position.set(x,y,z);g.add(sp);return sp;}
function rotuloFixo(text,color='#e7f6ff',width=1.5,size=56){const sp=label(text,color,width,size);const m=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:sp.material.map,transparent:true,depthWrite:false,side:T.DoubleSide}));sp.material.dispose();return m;}
function textFixo(g,text,x,y,z=0,width=1.5,color){const m=rotuloFixo(text,color,width);m.position.set(x,y,z);g.add(m);return m;}
/* ruído de valor com 4 oitavas (determinístico) */
function ruido2(){const P=new Uint8Array(512);let s=1337;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};const p=[];for(let i=0;i<256;i++)p.push(i);for(let i=255;i>0;i--){const j=Math.floor(rnd()*(i+1));[p[i],p[j]]=[p[j],p[i]];}for(let i=0;i<512;i++)P[i]=p[i&255];
  const fade=t=>t*t*t*(t*(t*6-15)+10),lerp=(a,b,t)=>a+t*(b-a),grad=(h,x,y)=>{const u=(h&1)?-x:x,v=(h&2)?-y:y;return u+v;};
  const n=(x,y)=>{const X=Math.floor(x)&255,Y=Math.floor(y)&255;x-=Math.floor(x);y-=Math.floor(y);const u=fade(x),v=fade(y);const A=P[X]+Y,B=P[X+1]+Y;return lerp(lerp(grad(P[A],x,y),grad(P[B],x-1,y),u),lerp(grad(P[A+1],x,y-1),grad(P[B+1],x-1,y-1),u),v);};
  return(x,y)=>{let a=0,f=1,amp=1,tot=0;for(let o=0;o<5;o++){a+=n(x*f,y*f)*amp;tot+=amp;amp*=.5;f*=2.1;}return a/tot;};}
/* superfície: Blue Marble da NASA (domínio público; cópias dos exemplos do three.js r128, convertidas para WebP) */
const TEX={};const loader=new T.TextureLoader();
function textura(nome,opt={}){if(TEX[nome])return TEX[nome];const tx=loader.load('assets/'+nome,t=>{if(opt.aoCarregar)opt.aoCarregar(t);});if(opt.srgb!==false)tx.encoding=T.sRGBEncoding;tx.anisotropy=8;TEX[nome]=tx;return tx;}
let mascara=null;
function carregarMascara(){if(mascara||carregarMascara.indo)return;carregarMascara.indo=true;const im=new Image();im.onload=()=>{const W=1024,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(im,0,0,W,H);const d=x.getImageData(0,0,W,H).data;mascara=new Uint8Array(W*H);for(let k=0;k<W*H;k++)mascara[k]=d[k*4]>110?0:1;/* mapa especular: oceano claro, continente escuro */};im.src='assets/terra-oceano.webp';}
function superficie(){carregarMascara();return textura('terra-cor.webp');}
/* é continente ou oceano no ponto (uv) tocado? */
function tipoCrosta(uv){if(!mascara||!uv)return 'crosta';const W=1024,H=512;const i=Math.floor(uv.x*W)&(W-1),j=Math.min(H-1,Math.floor((1-uv.y)*H));return mascara[j*W+i]?'crosta_continental':'crosta_oceanica';}
/* texturas procedurais (geradas uma vez): rocha/magma por camada para a secção; rocha e veias para o túnel */
const TEXP={};
function texRuido(nome,W,fn){if(TEXP[nome])return TEXP[nome];const c=document.createElement('canvas');c.width=c.height=W;const x=c.getContext('2d');const img=x.createImageData(W,W),d=img.data;const nz=ruido2();for(let j=0;j<W;j++)for(let i=0;i<W;i++){const k=(j*W+i)*4;const [r,g,b,a]=fn(i/W,j/W,nz);d[k]=r;d[k+1]=g;d[k+2]=b;d[k+3]=a===undefined?255:a;}x.putImageData(img,0,0);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.wrapS=tx.wrapT=T.MirroredRepeatWrapping;tx.anisotropy=8;TEXP[nome]=tx;return tx;}
const GRAO={crosta:[.55,.3],manto_superior:[.6,.35],manto_inferior:[.6,.4],nucleo_externo:[.3,.5],nucleo_interno:[.2,.3]};
function texTampa(key){const cam=CAMADAS.find(c=>c.key===key);const base=new T.Color(cam.cor);const [amp,vei]=GRAO[key]||[.5,.3];
  return texRuido('tampa-'+key,512,(u,v,nz)=>{const dx=u-.5,dy=v-.5;const rr=Math.sqrt(dx*dx+dy*dy)*2;/* raio normalizado da Terra (a tampa usa UV centrado) */
    const g1=nz(u*48,v*48)*.5+.5,g2=nz(u*160+9,v*160)*.5+.5,g3=Math.abs(nz(u*22+40,v*22+7));/* grão, grão fino, veios */
    let k=(1-amp)+amp*(0.45*g1+0.55*g2);if(key!=='crosta'&&key!=='nucleo_interno')k*=1-vei*Math.pow(1-Math.min(1,g3*2.2),6)*.9;/* veios escuros ou claros */
    if(key==='nucleo_externo')k*=.9+.35*Math.pow(1-Math.min(1,g3*2.5),4);/* metal líquido: veios claros */
    const calor=key==='crosta'?1:1+(1-rr)*.25;/* mais claro para dentro */const r=Math.min(255,base.r*255*k*calor),g=Math.min(255,base.g*255*k*calor),b=Math.min(255,base.b*255*k*calor);return [r,g,b];});}
function texVeias(){return texRuido('veias',512,(u,v,nz)=>{const g3=Math.abs(nz(u*22+40,v*22+7));const w=Math.pow(1-Math.min(1,g3*2.2),7);const k=255*w;return [k,k*.7,k*.3];});}
function texRocha(){return texRuido('rocha',512,(u,v,nz)=>{const g1=nz(u*9,v*9)*.5+.5,g2=nz(u*40+3,v*40)*.5+.5,g3=Math.abs(nz(u*14+40,v*14+7));const fenda=Math.pow(Math.min(1,g3*3),.5);const k=(.35+.65*(0.5*g1+0.5*g2))*(.45+.55*fenda);const c=255*k;return [c,c,c];});}
function texMagma(){return texRuido('magma',512,(u,v,nz)=>{const g3=Math.abs(nz(u*7+40,v*7+7)),g4=nz(u*60,v*60)*.5+.5;const w=Math.pow(1-Math.min(1,g3*2.6),9)*(.5+.5*g4);const k=255*w;return [k,k*.5,k*.12];});}
/* núcleo externo: metal líquido em redemoinhos largos, sem veios */
function texMetal(){return texRuido('metal',512,(u,v,nz)=>{const g1=nz(u*4+11,v*4)*.5+.5,g2=nz(u*18+3,v*18+9)*.5+.5;const w=.25+.75*Math.pow(.35*g1+.65*g2,1.6);const k=255*w;return [k,k*.72,k*.3];});}
/* a Terra: esferas aninhadas; com corte, plano de recorte + tampas (anéis) na secção; destaque opcional de camadas */
function terra(opt={}){
  const g=new T.Group();const R0=opt.raio||R;const corte=!!opt.corte;const d=(opt.cortePos||0)*R0;/* 0 = pelo centro */
  const destaque=opt.destaque||null;const dim=k=>destaque&&!destaque.includes(k);
  const giro=new T.Group();g.add(giro);const tampas=new T.Group();tampas.rotation.y=opt.anguloCorte!==undefined?opt.anguloCorte:1.0;/* corte oblíquo: vê-se a secção e um pedaço da superfície */g.add(tampas);
  const plano=new T.Plane(V(0,0,-1),d);const local=plano.clone();
  CAMADAS.forEach((c,i)=>{const esf=new T.Mesh(new T.SphereGeometry(c.r*R0,i===0?64:40,i===0?48:28),mat(c.cor,{emissive:c.emis,roughness:i>=3?.45:.8,metalness:i>=3?.25:.02}));
    if(i===0){esf.material.dispose();esf.material=new T.MeshPhongMaterial({map:superficie(),normalMap:textura('terra-normal.webp',{srgb:false}),normalScale:new T.Vector2(.85,.85),specularMap:textura('terra-oceano.webp',{srgb:false}),specular:new T.Color(0x3a4a5a),shininess:18});}
    if(corte){esf.material.clippingPlanes=[plano];esf.material.clipShadows=true;}
    if(dim(c.key)){esf.material.transparent=true;esf.material.opacity=.22;esf.material.depthWrite=false;}
    if(destaque&&destaque.includes(c.key)&&c.key!=='crosta'){esf.material.emissive=new T.Color(c.cor).multiplyScalar(.35);}
    esf.userData.camada=c.key;const hit=opt.hitFn?opt.hitFn(c.key):null;if(hit)esf.userData.hit=hit;if(i===0)esf.userData.dinamico='crosta';
    giro.add(esf);});
  /* nuvens e halo atmosférico (acompanham o corte) */
  if(!opt.semNuvens){const nuv=new T.Mesh(new T.SphereGeometry(R0*1.012,48,32),new T.MeshLambertMaterial({map:textura('terra-nuvens.webp'),transparent:true,opacity:.85,depthWrite:false}));if(corte)nuv.material.clippingPlanes=[plano];if(destaque)nuv.material.opacity=.25;nuv.userData.semEnquadre=true;giro.add(nuv);g.userData.nuvens=nuv;
    const halo=new T.Mesh(new T.SphereGeometry(R0*1.045,48,32),new T.MeshBasicMaterial({color:0x5aa8ff,transparent:true,opacity:.14,side:T.BackSide,depthWrite:false,blending:T.AdditiveBlending}));if(corte)halo.material.clippingPlanes=[plano];halo.userData.semEnquadre=true;giro.add(halo);}
  if(corte){CAMADAS.forEach(c=>{const ro=c.r*R0,ri=c.r0*R0;if(ro<=Math.abs(d))return;const rout=Math.sqrt(ro*ro-d*d),rin=ri>Math.abs(d)?Math.sqrt(ri*ri-d*d):0;
      const anel=new T.Mesh(rin>0?new T.RingGeometry(rin,rout,96):new T.CircleGeometry(rout,96),mat(c.cor,{emissive:c.emis,roughness:.9,side:T.DoubleSide}));
      const tx=texTampa(c.key);anel.material.map=tx;anel.material.color.setHex(0xffffff);if(c.key==='nucleo_externo'||c.key==='nucleo_interno'){anel.material.emissiveMap=tx;anel.material.emissive=new T.Color(c.key==='nucleo_interno'?0xffe9a0:0xff9a30);anel.material.emissiveIntensity=c.key==='nucleo_interno'?.55:.35;}else if(c.key!=='crosta'){anel.material.emissiveMap=texVeias();anel.material.emissive=new T.Color(0xff6a20);anel.material.emissiveIntensity=c.key==='manto_inferior'?.45:.28;}
      /* mapeia a textura radial da tampa pelo raio */const uv=anel.geometry.attributes.uv,pos=anel.geometry.attributes.position;for(let k=0;k<uv.count;k++){const px=pos.getX(k),py=pos.getY(k);const rr=Math.sqrt(px*px+py*py)/(R0);uv.setXY(k,.5+px/(2*R0),.5+py/(2*R0));}uv.needsUpdate=true;
      anel.position.z=d+.002;anel.userData.camada=c.key;if(dim(c.key)){anel.material.transparent=true;anel.material.opacity=.3;}
      if(destaque&&destaque.includes(c.key)){anel.material.emissive=new T.Color(c.cor).multiplyScalar(.5);}
      const hit=opt.hitFn?opt.hitFn(c.key):null;if(hit)anel.userData.hit=hit;tampas.add(anel);
      /* linha fina entre camadas */if(rin>0){const lin=new T.Mesh(new T.RingGeometry(rin-.006*R0,rin+.006*R0,96),new T.MeshBasicMaterial({color:0x140a04,transparent:true,opacity:.55,side:T.DoubleSide}));lin.position.z=d+.004;tampas.add(lin);}});
    /* rótulos nas tampas (opcional) */
    if(opt.rotulos){CAMADAS.forEach((c,i)=>{const rm=(c.r+c.r0)/2*R0;const ang=-.55+i*.42;const rot=rotuloFixo(D.info[c.key].name,'#ffffff',1.5,60);rot.position.set(Math.cos(ang)*rm*(i===0?1.0:1.0)+(i===0?.9:0),Math.sin(ang)*rm,d+.03);if(i===0)rot.position.set(R0*1.05+.75,R0*.55,d+.03);tampas.add(rot);});}
  }
  /* campo magnético (linhas) */
  if(opt.campo){const lin=new T.Group();for(let k=0;k<8;k++){const a=k/8*Math.PI*2;const pts=[];for(let i=0;i<=40;i++){const t=i/40*Math.PI;const rr=R0*(1.02+1.3*Math.sin(t));pts.push(V(Math.cos(a)*Math.sin(t)*rr,Math.cos(t)*rr*1.0,Math.sin(a)*Math.sin(t)*rr));}const cur=new T.CatmullRomCurve3(pts);const tb=new T.Mesh(new T.TubeGeometry(cur,60,.02,6,false),new T.MeshBasicMaterial({color:0xb0a0ff,transparent:true,opacity:.75}));lin.add(tb);}lin.userData.semEnquadre=true;g.add(lin);g.userData.campo=lin;}
  /* ondas sísmicas: anéis que se expandem a partir de um ponto da superfície (na secção) */
  if(opt.ondas){const ond=new T.Group();for(let k=0;k<6;k++){const an=new T.Mesh(new T.RingGeometry(.1,.14,64),new T.MeshBasicMaterial({color:0x9fd0ff,transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false}));an.position.set(0,R0,d+.02);an.userData.f=k/6;ond.add(an);}const epi=new T.Mesh(new T.SphereGeometry(.07,12,10),new T.MeshBasicMaterial({color:0xffffff}));epi.position.set(0,R0,d+.02);ond.add(epi);tampas.add(ond);g.userData.ondas=ond;g.userData.ondasR=R0;}
  /* poço de Kola: marcador na superfície, na secção */
  if(opt.kola){const mk=new T.Mesh(new T.CylinderGeometry(.012,.012,.1,8),new T.MeshBasicMaterial({color:0xffe08a}));mk.position.set(0,R0-.05,d+.02);tampas.add(mk);textFixo(tampas,'Poço de Kola · 12 km',1.3,R0+.25,d+.03,2.2,'#ffe08a');}
  g.userData.plano=plano;g.userData.local=local;g.userData.giro=giro;g.userData.tampas=tampas;g.userData.raio=R0;
  const girar=opt.girar!==false;
  g.userData.tick=(t)=>{if(girar)giro.rotation.y=t*.08;if(g.userData.nuvens)g.userData.nuvens.rotation.y=t*.012;if(corte){tampas.updateMatrixWorld(true);plano.copy(local).applyMatrix4(tampas.matrixWorld);}
    const nuc=giro.children[4];if(nuc&&nuc.material&&nuc.material.emissive)nuc.material.emissiveIntensity=.8+.3*Math.sin(t*1.6);
    if(g.userData.ondas){const R1=g.userData.ondasR;g.userData.ondas.children.forEach(an=>{if(an.userData.f===undefined)return;const u=((t*.22)+an.userData.f)%1;const r=.15+u*R1*1.85;/* só o arco que está dentro da Terra: círculo centrado no epicentro, recortado pelo disco */const a0=Math.asin(Math.min(1,r/(2*R1)));an.geometry.dispose();an.geometry=new T.RingGeometry(Math.max(.01,r-.035),r,72,1,Math.PI+a0,Math.PI-2*a0);an.material.opacity=.9*(1-u*.8);});}
    if(g.userData.campo)g.userData.campo.rotation.y=t*.08;};
  return g;
}
/* contexto: 0 planeta inteiro · 1 aberto ao meio · 2 a casca fina (fatia da crosta em escala) */
function contexto(level){const g=new T.Group();
  if(level===0){const te=terra({hitFn:()=>({type:'context',target:'aberta'})});g.add(te);textAt(g,'TERRA · 12.742 km de diâmetro',0,-R-1.0,0,4.6,'#9fd0ff');g.userData.tick=te.userData.tick;return g;}
  if(level===1){const te=terra({corte:true,rotulos:true,hitFn:()=>({type:'context',target:'crosta'})});g.add(te);textAt(g,'A TERRA ABERTA AO MEIO',0,-R-1.0,0,4.2,'#f6c37a');g.userData.tick=te.userData.tick;return g;}
  /* nível 2: fatia de 100 km de profundidade, em escala, continente × oceano */
  const te=terra({corte:true,raio:1.4,girar:false});te.position.set(-3.1,.6,0);te.scale.setScalar(.9);g.add(te);
  const F=new T.Group();F.position.set(1.4,0,0);g.add(F);const esc=.05;/* 1 km = 0,05 unidade: 100 km = 5 unidades */
  const bloco=(x,w,topo,alt,cor,hit)=>{const m=new T.Mesh(new T.BoxGeometry(w,alt,1.2),mat(cor,{roughness:.85}));m.position.set(x,topo-alt/2,0);if(hit)tag(m,hit);F.add(m);return m;};
  /* continente (esquerda, 2.2 de largura) · oceano (direita) */
  bloco(-1.15,2.2,2.5,35*esc,0x8fd0a0,{type:'inspect',key:'crosta_continental'});bloco(-1.15,2.2,2.5-35*esc,65*esc,0xe07a3c,{type:'inspect',key:'manto_superior'});
  bloco(1.15,2.2,2.5,4*esc,0x2c5f9a,null);bloco(1.15,2.2,2.5-4*esc,7*esc,0x5fa8c8,{type:'inspect',key:'crosta_oceanica'});bloco(1.15,2.2,2.5-11*esc,89*esc,0xe07a3c,{type:'inspect',key:'manto_superior'});
  /* poço de Kola */const kola=new T.Mesh(new T.BoxGeometry(.05,12*esc,.06),new T.MeshBasicMaterial({color:0xffe08a}));kola.position.set(-1.9,2.5-6*esc,.62);F.add(kola);
  textFixo(F,'Continente · crosta de 35 km',-1.15,2.85,.7,2.2,'#bfe8c8');textFixo(F,'Oceano · crosta de 7 km',1.15,2.85,.7,2.0,'#aee0f0');
  textFixo(F,'Poço de Kola · 12 km',-1.5,1.55,.7,1.7,'#ffe08a');textFixo(F,'MANTO',0,-1.2,.7,1.6,'#ffc9a0');textFixo(F,'0 a 100 km de profundidade, em escala',0,-2.95,.7,3.4,'#9cbed0');
  const seta=new T.Mesh(new T.ConeGeometry(.12,.4,12),new T.MeshBasicMaterial({color:0xffe08a}));seta.position.set(-1.9,2.5+.3,.62);seta.rotation.x=Math.PI;F.add(seta);
  g.userData.tick=te.userData.tick;return g;}
function explorar(){const g=new T.Group();const te=terra({corte:true,hitFn:k=>({type:'inspect',key:k})});g.add(te);g.userData.tick=te.userData.tick;return g;}
/* ficha projetada: a Terra aberta com a camada em destaque (ou o fenômeno) */
const DESTAQUE={crosta:['crosta'],crosta_continental:['crosta'],crosta_oceanica:['crosta'],litosfera:['crosta','manto_superior'],astenosfera:['manto_superior'],moho:['crosta','manto_superior'],manto_superior:['manto_superior'],manto_inferior:['manto_inferior'],nucleo_externo:['nucleo_externo'],nucleo_interno:['nucleo_interno'],kola:['crosta']};
function inspection(key){const g=new T.Group();const o={corte:true,raio:1.6,destaque:DESTAQUE[key]||null};
  if(key==='campo_magnetico'){o.campo=true;o.corte=false;}if(key==='ondas_sismicas'){o.ondas=true;}if(key==='kola'){o.kola=true;}if(key==='terra'){o.corte=false;}
  if(key==='crosta_continental'||key==='crosta_oceanica'){o.corte=false;}
  const te=terra(o);g.add(te);g.userData.tick=te.userData.tick;g.userData.pegavel=true;return g;}
/* sequência (fita): tabuleiro com posições + bandeja de peças (porte do Corpo Humano) */
function sequencia(state,cfg){
  const g=new T.Group();const n=cfg.ordem.length,dy=.62,top=(n-1)*dy/2+.3;
  textFixo(g,cfg.titulo,.9,top+.75,0,3.4,cfg.cor);
  for(let i=0;i<n;i++){const y=top-i*dy;const key=state.colocados[i];
    const num=rotuloFixo(String(i+1),i===state.target?'#ffdb9f':'#8fb0c2',.5,96);num.position.set(-.55,y,.05);g.add(num);
    const placa=new T.Mesh(new T.BoxGeometry(2.6,.46,.16),mat(key?0x5a3a1e:0x3a2616,{transparent:!key,opacity:key?1:.65}));placa.position.set(.9,y,0);tag(placa,{type:'seqSlot',index:i});g.add(placa);
    const txt=rotuloFixo(key?cfg.rotulos[key]:'?',key?'#fff4e0':'#ffe3a8',2.4,key?72:96);txt.position.set(.9,y,.1);g.add(txt);
    if(i===state.target&&!key){const marc=new T.Mesh(new T.BoxGeometry(2.72,.56,.06),new T.MeshBasicMaterial({color:0xefd094,wireframe:true}));marc.position.set(.9,y,.02);g.add(marc);}
    if(i<n-1){const seta=new T.ArrowHelper(V(0,-1,0),V(.9,y-.25,0),.12,0xc9a070,.08,.06);g.add(seta);}
  }
  const restantes=state.bandeja.filter(k=>!state.colocados.includes(k));
  restantes.forEach((k,i)=>{const cols=2,c=i%cols,r=Math.floor(i/cols);const x=-3.75+c*1.6,y=top-.1-r*.72;
    const cam=CAMADAS.find(x=>x.key===k);const peca=new T.Mesh(new T.BoxGeometry(1.48,.56,.2),mat(cam?cam.cor:0x8a6a3a,{roughness:.5}));peca.position.set(x,y,.1);peca.userData.draggable=true;tag(peca,{type:'seqPiece',key:k});g.add(peca);
    const t=rotuloFixo(cfg.rotulos[k],k==='nucleo_interno'||k==='nucleo_externo'||k==='crosta'?'#1a1208':'#ffffff',1.46,66);t.position.set(x,y,.22);g.add(t);
    if(state.selected===k){const anel=new T.Mesh(new T.BoxGeometry(1.6,.68,.08),new T.MeshBasicMaterial({color:0xffffff,wireframe:true}));anel.position.set(x,y,.1);g.add(anel);}
  });
  if(!state.done)textFixo(g,'PEÇAS',-2.95,top+.75,0,1.4,'#c9a070');
  if(state.done){const te=terra({corte:true,raio:1.55,rotulos:false,girar:true});te.position.set(-2.9,-.1,0);g.add(te);textFixo(g,'TERRA MONTADA',-2.9,1.95,0,2.4,'#ffe08a');g.userData.tick=te.userData.tick;}
  g.userData.slots={top,dy};
  return g;
}
/* ---- Viagem ao centro: túnel helicoidal, uma volta por trecho, cores por camada ---- */
const ESCALA_VR=5.5;const VOLTAS=D.viagem.length;
function helice(t){const a=t*Math.PI*2*VOLTAS;const rr=4.2;return V(Math.cos(a)*rr,3.6-7.6*t,Math.sin(a)*rr);}
let tuboCache=null;
function corTrecho(t){const i=Math.min(VOLTAS-1,Math.floor(t*VOLTAS));const f=t*VOLTAS-i;const a=new T.Color(D.viagem[i].cor),b=new T.Color(D.viagem[Math.min(VOLTAS-1,i+1)].cor);/* transição suave nos últimos 12% de cada volta */return f>.88?a.lerp(b,(f-.88)/.12):a;}
function tunel(){if(tuboCache)return tuboCache;const pts=[];for(let i=0;i<=420;i++)pts.push(helice(i/420));const curva=new T.CatmullRomCurve3(pts);const seg=2200,rad=28;const geo=new T.TubeGeometry(curva,seg,.42,rad,false);
  /* relevo rochoso: desloca os vértices radialmente com ruído */const pos=geo.attributes.position,nor=geo.attributes.normal;const nz=ruido2();const cols=new Float32Array(pos.count*3);const v=new T.Vector3(),nn=new T.Vector3();
  for(let i=0;i<=seg;i++){const t=i/seg;const base=corTrecho(t);for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;v.fromBufferAttribute(pos,k);nn.fromBufferAttribute(nor,k);const r1=nz(t*1300,j*.9)*.5+.5,r2=nz(t*2800+5,j*1.3)*.5+.5;/* ~1 ciclo a cada 6 cm de parede */const amp=t<.3?.16:t<.72?.11:.05;v.addScaledVector(nn,(r1-.5)*amp);pos.setXYZ(k,v.x,v.y,v.z);const fenda=Math.pow(Math.abs(nz(t*4600+30,j*2.2)),.35);/* rachaduras escuras */
      /* cores em espaço linear: valores baixos para não ficarem pastel depois da conversão sRGB */const r3=r2*r2;const brilho=(t>.72?.22+.6*r3:t>.44?.05+.42*r3:.04+.38*r3)*(.55+.45*fenda);const c=base.clone().multiplyScalar(brilho);cols[k*3]=Math.min(1,c.r);cols[k*3+1]=Math.min(1,c.g);cols[k*3+2]=Math.min(1,c.b);}}
  pos.needsUpdate=true;geo.computeVertexNormals();geo.setAttribute('color',new T.BufferAttribute(cols,3));
  /* repetição da textura ao longo do túnel (u) e em volta (v) */const uv=geo.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k)*160,uv.getY(k)*3);uv.needsUpdate=true;
  /* grupos de material: crosta (voltas 0-1), manto (2-4), núcleo (5-6) */const porSeg=rad*6;geo.clearGroups();const s1=Math.round(seg*2/VOLTAS),s2=Math.round(seg*5/VOLTAS);geo.addGroup(0,s1*porSeg,0);geo.addGroup(s1*porSeg,(s2-s1)*porSeg,1);geo.addGroup(s2*porSeg,(seg-s2)*porSeg,2);
  tuboCache={geo,curva};return tuboCache;}
function viagemCena(state){const g=new T.Group();const {geo,curva}=tunel();const i=state.trecho||0;
  const mats=[new T.MeshStandardMaterial({vertexColors:true,map:texRocha(),side:T.BackSide,roughness:.95,metalness:0}),new T.MeshStandardMaterial({vertexColors:true,map:texRocha(),emissiveMap:texMagma(),emissive:new T.Color(0xff7a20),emissiveIntensity:.5,side:T.BackSide,roughness:.9,metalness:0}),new T.MeshStandardMaterial({vertexColors:true,map:texMetal(),emissiveMap:texMetal(),emissive:new T.Color(0xffb030),emissiveIntensity:.45,side:T.BackSide,roughness:.3,metalness:.7})];const tubo=new T.Mesh(geo,mats);g.add(tubo);
  /* partículas quentes dentro do túnel (faíscas no manto, metal no núcleo) */const n=1400;const pos=new Float32Array(n*3),col=new Float32Array(n*3);let s=7;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};
  for(let k=0;k<n;k++){const t=rnd();const p=helice(t);const a=rnd()*Math.PI*2,rr=.16+rnd()*.2;p.x+=Math.cos(a)*rr;p.z+=Math.sin(a)*rr;p.y+=(rnd()-.5)*.3;pos[k*3]=p.x;pos[k*3+1]=p.y;pos[k*3+2]=p.z;const c=corTrecho(t).lerp(new T.Color(0xffffff),.35);col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b;}
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pos,3));pg.setAttribute('color',new T.BufferAttribute(col,3));
  const sp=document.createElement('canvas');sp.width=sp.height=64;const q=sp.getContext('2d');const rg=q.createRadialGradient(32,32,0,32,32,32);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.4,'rgba(255,220,170,.6)');rg.addColorStop(1,'rgba(255,200,120,0)');q.fillStyle=rg;q.fillRect(0,0,64,64);
  const pts=new T.Points(pg,new T.PointsMaterial({size:.005,map:new T.CanvasTexture(sp),vertexColors:true,transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending}));pts.userData.semEnquadre=true;g.add(pts);
  /* trilha luminosa do trecho atual */const sub=[];for(let k=0;k<=16;k++)sub.push(helice((i+k/16)/VOLTAS));const curvaTrecho=new T.CatmullRomCurve3(sub);
  for(let k=0;k<=12;k++){const p=curvaTrecho.getPointAt(k/12);p.y-=.3;/* luzes no chão do túnel */const b=ball(.025,0xfff2c0,p,{emissive:0xffd080,emissiveIntensity:1.2,transparent:true,opacity:.8},8);b.userData.semEnquadre=true;b.userData.trilha=k/12;g.add(b);}
  g.userData.viagem={curva:curvaTrecho,escalaVR:ESCALA_VR,raioOlhar:0};g.userData.semGiro=true;
  g.userData.tick=t=>{g.traverse(o=>{if(o.userData.trilha!==undefined){o.material.opacity=.3+.6*Math.pow(Math.max(0,Math.sin(t*3-o.userData.trilha*8)),2);}});pts.material.opacity=.7+.25*Math.sin(t*2.1);};
  return g;}
function desafio(){const g=new T.Group();const te=terra({corte:true,hitFn:k=>({type:'inspect',key:k})});g.add(te);g.userData.tick=te.userData.tick;return g;}
function dispose(g){if(!g)return;const geos=new Set(),mats=new Set(),tex=new Set();g.traverse(o=>{if(o.geometry&&!o.isSprite&&o.geometry!==(tuboCache&&tuboCache.geo))geos.add(o.geometry);for(const m of [].concat(o.material||[])){if(!m)continue;mats.add(m);const comp=new Set([...Object.values(TEX),...Object.values(TEXP)]);for(const t of [m.map,m.emissiveMap,m.normalMap,m.specularMap]){if(t&&!comp.has(t))tex.add(t);}}});geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());tex.forEach(x=>x.dispose());if(g.parent)g.parent.remove(g);}
window.TERRA_MODELS={V,R,CAMADAS,mat,ball,label,rotuloFixo,textFixo,textAt,tag,terra,contexto,explorar,inspection,sequencia,viagemCena,desafio,tipoCrosta,dispose,ESCALA_VR};
})();
