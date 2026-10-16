/* Corpo Humano Imersivo · Órgãos dos Sentidos · cenas 3D (v4.11)
   Olho e orelha reais do Z-Anatomy (CC BY-SA 4.0): olho.glb (esclera, córnea, íris, cristalino, retina, corpo vítreo,
   nervo óptico, glândula lacrimal) e orelha.glb (tímpano, martelo, bigorna, estribo, cóclea, vestíbulo com os canais
   semicirculares, nervo vestibulococlear), extraídos do NervousSystem100.fbx e do SkeletalSystem100.fbx e simplificados.
   O Z-Anatomy não traz o pavilhão nem o canal da orelha externa: eles entram aqui como peças esquemáticas.
   As missões "Como enxergamos" e "Lentes que corrigem" usam um olho esquemático em corte, para os raios de luz ficarem claros. */
(function(){'use strict';
const T=THREE,D=CORPO_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const G=()=>window.CORPO_GLTF,M=()=>window.CORPO_MODELS;
const insp=k=>({type:'inspect',key:k});
const CTX={type:'v4',command:'sent:ctx:next'};
/* centros (m, referencial do Z-Anatomy) do olho direito e da orelha interna direita */
const CENTROS_SENT={olho:[-0.0305,1.591,0.065],orelha:[-0.044,1.582,-0.006]};
function registrar(){const g=G();if(g&&!g.CENTROS.olho)Object.assign(g.CENTROS,CENTROS_SENT);}
const mat=(c,x)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.02},x||{}));
function hitTodos(o,h){o.traverse(x=>{if(x.isMesh)x.userData.hit=h||null;});return o;}
const label=(w,t,p,cor='#eafaff',wd=1.5)=>{const sp=M().label(t,cor,wd,62);sp.position.copy(p);w.add(sp);return sp;};
/* ponto do corpo (m) relativo ao centro de um órgão, em unidades da cena */
const rel=(p,c)=>V((p[0]-c[0])*G().ESC,(p[1]-c[1])*G().ESC,(p[2]-c[2])*G().ESC);

/* recorta uma malha mantendo só os triângulos cujo centro (em metros do Z-Anatomy) passa no teste; não mexe na malha em cache */
function recortar(m,manter){const g=m.geometry.clone(),p=g.attributes.position,ix=g.index;if(!ix)return;const a=ix.array,out=[];
  for(let i=0;i<a.length;i+=3){const x=(p.getX(a[i])+p.getX(a[i+1])+p.getX(a[i+2]))/3,y=(p.getY(a[i])+p.getY(a[i+1])+p.getY(a[i+2]))/3,z=(p.getZ(a[i])+p.getZ(a[i+1])+p.getZ(a[i+2]))/3;if(manter(x,y,z))out.push(a[i],a[i+1],a[i+2]);}
  g.setIndex(out);m.geometry=g;}
/* ---------- olho real ---------- */
const OLHO_FICHA={esclera:'esclera',cornea:'cornea',iris:'iris',cristalino:'cristalino',retina:'retina',vitreo:'vitreo',nervo_optico:'optico',glandula_lacrimal:'glandula_lacrimal'};
const OLHO_MAT={
 esclera:()=>mat(0xf4f1ea,{side:T.DoubleSide,roughness:.35}),
 cornea:()=>mat(0xcfefff,{transparent:true,opacity:.3,depthWrite:false,roughness:.04,side:T.DoubleSide}),
 iris:()=>mat(0x7a5236,{roughness:.6,side:T.DoubleSide}),
 cristalino:()=>mat(0xffe3a0,{transparent:true,opacity:.6,roughness:.08,emissive:0x3a2a08}),
 retina:()=>mat(0xe0603f,{side:T.DoubleSide,roughness:.55,emissive:0x2a0c06}),
 vitreo:()=>mat(0xd8f0ff,{transparent:true,opacity:.18,depthWrite:false,roughness:.05,side:T.DoubleSide}),
 nervo_optico:()=>mat(0xf6e3a0,{roughness:.5}),
 glandula_lacrimal:()=>mat(0xf0b8b0,{roughness:.55})};
const FOCO_OLHO={cornea:'cornea',iris:'iris',pupila:'iris',cristalino:'cristalino',retina:'retina',esclera:'esclera',vitreo:'vitreo',glandula_lacrimal:'glandula_lacrimal',optico:'nervo_optico'};
function olhoReserva(){const w=new T.Group();const s=new T.Mesh(new T.SphereGeometry(.09,32,24),OLHO_MAT.esclera());w.add(s);const i=new T.Mesh(new T.RingGeometry(.02,.045,32),OLHO_MAT.iris());i.position.z=.085;w.add(i);return w;}
/* opt.hit(fichaKey)→hit, opt.foco = parte em destaque (as outras ficam translúcidas) */
function olhoModelo(opt={}){registrar();const g=G();const c=CENTROS_SENT.olho;
  const hitDe=p=>opt.hit===undefined?insp(OLHO_FICHA[p]||'olho'):opt.hit?opt.hit(OLHO_FICHA[p]||'olho'):null;
  const corte=opt.corte!==false;
  const o=g.orgao('olho',olhoReserva,hitDe,{aoCarregar:(inst,meshes,grp)=>{for(const [p,m] of Object.entries(meshes)){if(!OLHO_MAT[p])continue;m.material=OLHO_MAT[p]();
     /* janela de corte: tira o quarto de trás do lado de fora (temporal) da esclera, da retina e do vítreo, para ver as camadas */
     if(corte&&['esclera','retina','vitreo'].includes(p))recortar(m,(x,y,z)=>!(x>c[0]-.001&&z<c[2]+.003));
     if(p==='nervo_optico')recortar(m,(x,y,z)=>z>.041);
     if(opt.foco&&opt.foco!==p){m.material.transparent=true;m.material.opacity=Math.min(m.material.opacity,.3);m.material.depthWrite=false;}
     if(opt.foco===p){m.material.emissive=new T.Color(0x6a5020);m.material.transparent=p==='cornea'||p==='vitreo';m.material.opacity=p==='cornea'||p==='vitreo'?.7:1;m.material.depthWrite=true;}}
    grp.userData.meshes=meshes;}});
  /* pupila: a abertura no meio da íris (não é uma estrutura, então entra como um disco escuro) */
  const pup=new T.Mesh(new T.CircleGeometry(.0019*g.ESC,32),new T.MeshBasicMaterial({color:0x050508,side:T.DoubleSide}));pup.position.copy(rel([-0.0305,1.5915,0.0785],c));o.add(pup);
  pup.userData.hit=opt.hit===undefined?insp('pupila'):opt.hit?opt.hit('pupila'):null;o.userData.pupila=pup;
  if(opt.foco&&opt.foco!=='iris')pup.visible=false;
  return o;}

/* ---------- orelha real + orelha externa esquemática ---------- */
const ORELHA_FICHA={timpano:'timpano',martelo:'ossiculos',bigorna:'ossiculos',estribo:'ossiculos',coclea:'coclea',vestibulo:'canais_semicirculares',nervo_auditivo:'nervo_auditivo'};
const ORELHA_MAT={timpano:()=>mat(0xf6e3a0,{transparent:true,opacity:.85,side:T.DoubleSide,roughness:.4}),martelo:()=>mat(0xe9e4d6,{roughness:.6}),bigorna:()=>mat(0xe9e4d6,{roughness:.6}),estribo:()=>mat(0xe9e4d6,{roughness:.6}),
 coclea:()=>mat(0xf0a6c8,{roughness:.45,emissive:0x2a0c18}),vestibulo:()=>mat(0xa6f0d6,{roughness:.45,emissive:0x0c2a20}),nervo_auditivo:()=>mat(0xf6e3a0,{roughness:.5})};
const FOCO_ORELHA={timpano:['timpano'],ossiculos:['martelo','bigorna','estribo'],coclea:['coclea'],canais_semicirculares:['vestibulo'],nervo_auditivo:['nervo_auditivo'],orelha_externa:['_pav'],canal_auditivo:['_canal']};
function orelhaReserva(){const w=new T.Group();const c=new T.Mesh(new T.TorusKnotGeometry(.05,.015,64,8),ORELHA_MAT.coclea());w.add(c);return w;}
function orelhaModelo(opt={}){registrar();const g=G();const c=CENTROS_SENT.orelha,E=g.ESC;
  const hitDe=p=>opt.hit===undefined?insp(ORELHA_FICHA[p]||'orelha'):opt.hit?opt.hit(ORELHA_FICHA[p]||'orelha'):null;
  const foco=opt.foco?FOCO_ORELHA[opt.foco]||[]:null;
  const o=g.orgao('orelha',orelhaReserva,hitDe,{aoCarregar:(inst,meshes,grp)=>{for(const [p,m] of Object.entries(meshes)){if(!ORELHA_MAT[p])continue;m.material=ORELHA_MAT[p]();m.material.side=T.DoubleSide;
     if(foco&&!foco.includes(p)){m.material.transparent=true;m.material.opacity=.3;m.material.depthWrite=false;}
     if(foco&&foco.includes(p))m.material.emissive=new T.Color(0x6a5020);}
    grp.userData.meshes=meshes;}});
  /* orelha externa esquemática: canal auditivo (do tímpano até a entrada) e pavilhão em forma de concha */
  const tim=[-0.0485,1.578,-0.0045],ent=[-0.073,1.581,0.003];
  const curva=new T.CatmullRomCurve3([rel(tim,c),rel([-0.058,1.5795,-0.002],c),rel([-0.066,1.5815,0.0015],c),rel(ent,c)]);
  const opC=foco&&!foco.includes('_canal')?.12:.42;
  const canal=new T.Mesh(new T.TubeGeometry(curva,24,.0034*E,16,false),mat(0xe8a39c,{transparent:true,opacity:opC,depthWrite:false,side:T.DoubleSide,roughness:.6}));
  canal.userData.hit=opt.hit===undefined?insp('canal_auditivo'):opt.hit?opt.hit('canal_auditivo'):null;o.add(canal);
  /* pavilhão esquemático: concha (prato raso) + hélice (aro em C) + lóbulo, no plano perpendicular ao canal */
  const opP=foco&&!foco.includes('_pav')?.14:.6;const mp=mat(0xf2c9a6,{transparent:true,opacity:opP,depthWrite:false,side:T.DoubleSide,roughness:.7});
  const pav=new T.Group();pav.position.copy(rel([-0.0745,1.583,0.002],c));pav.rotation.y=-Math.PI/2;
  const concha=new T.Mesh(new T.SphereGeometry(.0085*E,24,12,0,Math.PI*2,0,Math.PI/2.4),mp);concha.scale.set(1,1.25,.45);concha.rotation.x=-Math.PI/2;concha.position.z=-.002*E;pav.add(concha);
  const helice=new T.Mesh(new T.TorusGeometry(.0135*E,.0022*E,10,40,Math.PI*1.45),mp);helice.rotation.z=-Math.PI*.2;helice.scale.set(.85,1.25,1);helice.position.set(.002*E,.003*E,.003*E);pav.add(helice);
  const lobulo=new T.Mesh(new T.SphereGeometry(.0042*E,16,12),mp);lobulo.scale.set(1,1.2,.5);lobulo.position.set(.0035*E,-.0145*E,.002*E);pav.add(lobulo);
  const hp=opt.hit===undefined?insp('orelha_externa'):opt.hit?opt.hit('orelha_externa'):null;pav.traverse(x=>{if(x.isMesh)x.userData.hit=hp;});o.add(pav);
  pav.material=mp;
  o.userData.canal=canal;o.userData.pav=pav;o.userData.curva=curva;
  return o;}

/* olho e orelha lado a lado, ampliados (explorar, contexto e desafio) */
const K_OLHO=16,K_ORELHA=11;
function olhoAmpliado(opt){const w=new T.Group();const o=olhoModelo(opt);o.position.set(0,0,0);o.scale.setScalar(K_OLHO);o.rotation.y=-.85;w.add(o);w.userData.olho=o;return w;}
function orelhaAmpliada(opt){const w=new T.Group();const o=orelhaModelo(opt);o.position.set(0,0,0);o.scale.set(-K_ORELHA,K_ORELHA,K_ORELHA);o.rotation.y=-.35;w.add(o);w.userData.orelha=o;return w;}
function par(opt={}){const w=new T.Group(),Mo=M();
  const a=olhoAmpliado(opt);a.position.set(-2.4,0,0);w.add(a);const b=orelhaAmpliada(opt);b.position.set(2.5,0,0);w.add(b);
  if(opt.rotulos!==false){Mo.textFixo(w,'OLHO · VISÃO',-2.4,2.7,0,2.6,'#9fc5f0');Mo.textFixo(w,'ORELHA · AUDIÇÃO E EQUILÍBRIO',2.7,2.7,0,3.6,'#f0a6c8');}
  return w;}

/* ---------- contexto ---------- */
function sentContexto(level){const Mo=M(),g=G(),w=new T.Group();
  if(level===0){registrar();const sil=g.orgao('silhueta',null,()=>CTX,{opacidade:.14});w.add(sil);
    const pts=[['Visão',[-0.031,1.592,0.08],0x9fc5f0,-1.6,.5],['Visão',[0.031,1.592,0.08],0x9fc5f0,null],['Audição',[-0.076,1.58,0.0],0xf0a6c8,-1.9,-.2],['Audição',[0.076,1.58,0.0],0xf0a6c8,null],
     ['Olfato',[0,1.585,0.1],0x9ed6ef,1.7,.35],['Paladar',[0,1.528,0.075],0xd96b73,1.7,-.35],['Tato',[0.28,0.79,0.06],0xf2c9a6,1.4,0]];
    pts.forEach(([t,p,cor,dx,dy])=>{const b=new T.Mesh(new T.SphereGeometry(.07,20,14),new T.MeshBasicMaterial({color:cor}));b.position.copy(g.ponto(...p));b.userData.hit=CTX;b.userData.pulso=true;w.add(b);
      if(dx!==null)label(w,t,b.position.clone().add(V(dx,dy,.5)),'#ffffff',1.2);});
    w.userData.tick=t=>{w.children.forEach(o=>{if(o.userData.pulso)o.scale.setScalar(1+.25*Math.sin(t*3+o.position.x*4));});};
    Mo.textAt(w,'OS CINCO SENTIDOS',0,-7.9,0,4.2,'#9fc5f0');return w;}
  if(level===1){const a=olhoAmpliado({hit:()=>CTX});a.scale.setScalar(1.15);w.add(a);Mo.textFixo(w,'O OLHO POR DENTRO',0,2.5,0,3.2,'#9fc5f0');
    [['Córnea',V(.6,.9,1.2)],['Íris',V(-1.6,.6,.8)],['Cristalino',V(-1.7,-.3,.8)],['Retina',V(1.9,-.7,0)]].forEach(([t,p])=>label(w,t,p,'#fff3e0',1.2));return w;}
  const b=orelhaAmpliada({hit:()=>CTX});b.scale.setScalar(1.1);w.add(b);Mo.textFixo(w,'A ORELHA POR DENTRO',0,2.5,0,3.4,'#f0a6c8');
  [['Tímpano',V(-1.2,.8,.6)],['Ossículos',V(-.3,1.4,.6)],['Cóclea',V(1.0,-1.0,.6)],['Canais do equilíbrio',V(1.4,1.2,.6)],['Pavilhão',V(-2.6,-.8,.6)]].forEach(([t,p])=>label(w,t,p,'#fff3e0',1.4));return w;}
function sentExplorar(){return par({});}
function sentDesafio(){return par({hit:null,rotulos:true});}

/* ---------- olho esquemático em corte (raios de luz) ---------- */
/* comprimento do olho: normal 1, míope mais comprido, hipermetrope mais curto. Retorna {g, xRetina, xLente} */
function olhoCorte(opt={}){const g=new T.Group(),L=opt.comprimento||1,R=1.15,xr=R*L;
  const parede=new T.Mesh(new T.SphereGeometry(R,48,32),mat(0xf4f1ea,{transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide}));parede.scale.set(L,1,1);g.add(parede);
  const ret=new T.Mesh(new T.SphereGeometry(R*.985,48,32,-Math.PI/2.6,Math.PI*0.77,0,Math.PI),mat(0xe0603f,{side:T.DoubleSide,emissive:0x2a0c06}));ret.scale.set(L,1,1);ret.rotation.y=-Math.PI/2;g.add(ret);
  const cor=new T.Mesh(new T.SphereGeometry(.55,32,20,0,Math.PI*2,0,Math.PI/3.3),mat(0xcfefff,{transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide}));cor.rotation.z=Math.PI/2;cor.position.x=-R*L+.42;g.add(cor);
  const iris=new T.Mesh(new T.RingGeometry(.17,.55,48),mat(0x7a5236,{side:T.DoubleSide}));iris.rotation.y=Math.PI/2;iris.position.x=-R*L+.32;g.add(iris);
  const len=new T.Mesh(new T.SphereGeometry(1,32,24),mat(0xffe3a0,{transparent:true,opacity:.7,emissive:0x3a2a08}));len.scale.set(.16,.4,.4);len.position.x=-R*L+.55;g.add(len);
  const nervo=new T.Mesh(new T.CylinderGeometry(.13,.13,1.0,16),mat(0xf6e3a0));nervo.rotation.z=Math.PI/2;nervo.position.set(xr+.45,-.12,0);g.add(nervo);
  g.userData={xRetina:xr,xLente:-R*L+.55,xCornea:-R*L+.1,cornea:cor,iris,lente:len,retina:ret,nervo};return g;}
/* a câmera do app centraliza em x=0 e enquadra a caixa do modelo: marcadores invisíveis nas pontas fazem caber tabuleiro + cena */
function alargar(g,x){[-x,x].forEach(v=>{const m=new T.Mesh(new T.BoxGeometry(.01,.01,.01),new T.MeshBasicMaterial({visible:false}));m.position.x=v;g.add(m);});}
function linha(pts,cor,op=1){const geo=new T.BufferGeometry().setFromPoints(pts);return new T.Line(geo,new T.LineBasicMaterial({color:cor,transparent:true,opacity:op}));}
function setaObjeto(alt,cor){const g=new T.Group();const h=new T.Mesh(new T.CylinderGeometry(.05,.05,alt,10),mat(cor,{emissive:0x332200}));g.add(h);const p=new T.Mesh(new T.ConeGeometry(.16,.3,16),mat(cor,{emissive:0x332200}));p.position.y=alt/2+.12;g.add(p);return g;}

/* missão Como enxergamos: tabuleiro + olho em corte; cada etapa encaixada acende o trecho do caminho */
function luz(state,cfg){const Mo=M(),g=Mo.sequencia(state,cfg),n=state.colocados.filter(Boolean).length;
  alargar(g,5.6);const cena=new T.Group();cena.position.set(3.9,.15,0);cena.scale.setScalar(.5);g.add(cena);
  const olho=olhoCorte();cena.add(olho);const u=olho.userData;
  const obj=setaObjeto(1.0,0xffd27f);obj.position.set(-3.0,0,0);cena.add(obj);label(cena,'Objeto',V(-3.0,-.95,.3),'#ffe9b0',1.1);
  const topo=V(-3.0,.62,0),base=V(-3.0,-.5,0);const img=[V(u.xRetina-.06,-.22,0),V(u.xRetina-.06,.18,0)];
  const raios=[];[[topo,img[0]],[base,img[1]]].forEach(([de,para],k)=>{[.22,0,-.22].forEach(yl=>{const pl=V(u.xLente,yl+(k?-.05:.05),0);
    const r1=linha([de,V(u.xCornea,de.y*.35+yl*.6,0)],0xfff2b0,.9),r2=linha([V(u.xCornea,de.y*.35+yl*.6,0),pl],0xfff2b0,.9),r3=linha([pl,para],0xfff2b0,.9);
    r1.visible=n>=1;r2.visible=n>=3;r3.visible=n>=4;cena.add(r1,r2,r3);raios.push(r1,r2,r3);});});
  if(n>=5){const inv=setaObjeto(.32,0xffd27f);inv.rotation.z=Math.PI;inv.position.set(u.xRetina-.08,-.02,0);inv.scale.setScalar(.9);cena.add(inv);label(cena,'Imagem invertida',V(u.xRetina+.2,1.05,.3),'#ffe9b0',1.6);}
  const brilhar=(m,on)=>{if(m&&m.material){m.material.emissive=new T.Color(on?0x3a4a5a:0x000000);}};
  brilhar(u.cornea,n>=2);brilhar(u.iris,n>=3);if(n>=4)u.lente.material.emissive.setHex(0x6a5010);if(n>=5)u.retina.material.emissive.setHex(0x6a2010);
  const pulsos=[];if(n>=6){u.nervo.material.emissive.setHex(0x5a4a10);for(let i=0;i<4;i++){const p=new T.Mesh(new T.SphereGeometry(.07,12,8),new T.MeshBasicMaterial({color:0xfff6c0}));p.userData.f=i/4;cena.add(p);pulsos.push(p);}}
  if(n>=7){const occ=new T.Mesh(new T.SphereGeometry(.42,24,16),mat(0x9fc5f0,{emissive:0x24406a,transparent:true,opacity:.85}));occ.position.set(u.xRetina+1.3,-.12,0);occ.scale.set(1,.8,.8);cena.add(occ);label(cena,'Lobo occipital',V(u.xRetina+1.3,.75,.3),'#cfe6ff',1.5);cena.userData.occ=occ;}
  label(cena,'Córnea',V(u.xCornea-.25,1.05,.3),'#dff4ff',1.0);label(cena,'Cristalino',V(u.xLente+.15,-.85,.4),'#ffe9b0',1.1);label(cena,'Retina',V(u.xRetina,-1.35,.3),'#ffd0c0',1.0);
  g.userData.tick=t=>{pulsos.forEach(p=>{const k=(t*.45+p.userData.f)%1;p.position.set(u.xRetina+.05+k*.95,-.12,0);});if(cena.userData.occ)cena.userData.occ.scale.setScalar(1+.06*Math.sin(t*4));};
  return g;}

/* missão Lentes que corrigem: olho míope ou hipermetrope, raios paralelos de um objeto distante e a lente escolhida */
/* foco a 1,75 (unidades do olho) atrás do cristalino; o olho míope é 17% mais comprido e o hipermetrope 17% mais curto.
   A lente certa desloca o foco exatamente até a retina: +0,39 (divergente) ou -0,39 (convergente). */
const COMP={miopia:1.17,hipermetropia:.83},F0=1.75,PODER={nenhuma:0,divergente:.391,convergente:-.391};
function lentes(state){const Mo=M(),w=new T.Group();const caso=state.caso||'miopia',lente=(state.escolha&&state.escolha[caso])||'nenhuma',K=1.35;
  const olho=olhoCorte({comprimento:COMP[caso]});olho.scale.setScalar(K);w.add(olho);const u=olho.userData;
  const xr=u.xRetina*K,xl=u.xLente*K,xlc=-3.0,foco=(u.xLente+F0+PODER[lente])*K;
  const desvio={nenhuma:1,divergente:1.22,convergente:.8}[lente];
  [.42,.2,-.2,-.42].forEach(y=>{const y2=y*desvio,yr=y2+(0-y2)*(xr-xl)/(foco-xl);const pts=[V(-5.6,y,0),V(xlc,y,0),V(xl,y2,0)];
    if(foco<xr)pts.push(V(foco,0,0));pts.push(V(xr-.02,yr,0));w.add(linha(pts,0xfff2b0,.95));});
  if(lente!=='nenhuma'){const r=.6,perfil=lente==='convergente'?[[0,-r],[.12,-r*.7],[.18,0],[.12,r*.7],[0,r]]:[[0,-r],[.2,-r*.8],[.06,0],[.2,r*.8],[0,r]];
    const sh=new T.Shape();sh.moveTo(-perfil[0][0],perfil[0][1]);perfil.forEach(([x,y])=>sh.lineTo(x,y));[...perfil].reverse().forEach(([x,y])=>sh.lineTo(-x,y));
    const lm=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:.9,bevelEnabled:false}),mat(0xbfe6ff,{transparent:true,opacity:.55,depthWrite:false,roughness:.05}));lm.position.set(xlc,0,-.45);w.add(lm);
    label(w,D.lentes.lentes[lente],V(xlc,1.15,.3),'#dff4ff',2.0);}
  const erro=Math.abs(foco-xr),ok=erro<.12;
  const mancha=new T.Mesh(new T.CircleGeometry(ok?.08:Math.min(.55,.1+erro*.9),32),new T.MeshBasicMaterial({color:ok?0x7CFFB8:0xffd27f,transparent:true,opacity:ok?.95:.55,side:T.DoubleSide}));mancha.rotation.y=Math.PI/2;mancha.position.set(xr-.03,0,0);w.add(mancha);
  const pf=new T.Mesh(new T.SphereGeometry(.06,12,8),new T.MeshBasicMaterial({color:ok?0x7CFFB8:0xff9f6b}));pf.position.set(foco,0,0);w.add(pf);
  const cs=D.lentes.casos.find(c=>c.id===caso);
  Mo.textFixo(w,(cs?cs.nome.toUpperCase():'')+' · '+(ok?'FOCO NA RETINA ✓':foco<xr?'FOCO ANTES DA RETINA':'FOCO DEPOIS DA RETINA'),0,2.2,0,5.2,ok?'#7CFFB8':'#ffd27f');
  label(w,'Retina',V(xr,-1.75,.3),'#ffd0c0',1.0);label(w,'Luz de um objeto distante',V(-4.6,.85,.3),'#ffe9b0',2.2);
  return w;}

/* missão Como ouvimos: tabuleiro + orelha real; cada etapa encaixada acende o trecho do caminho do som */
function som(state,cfg){const Mo=M(),g=Mo.sequencia(state,cfg),n=state.colocados.filter(Boolean).length;
  alargar(g,5.6);const cena=new T.Group();cena.position.set(3.75,.1,0);cena.scale.setScalar(.45);g.add(cena);
  const b=orelhaAmpliada({hit:null});cena.add(b);const o=b.userData.orelha;
  const ondas=[];if(n>=1){for(let i=0;i<4;i++){const r=new T.Mesh(new T.TorusGeometry(.5,.025,8,48),new T.MeshBasicMaterial({color:0xf0a6c8,transparent:true,opacity:.7}));r.rotation.y=Math.PI/2;r.userData.f=i/4;cena.add(r);ondas.push(r);}}
  const pulsos=[];if(n>=3){for(let i=0;i<3;i++){const p=new T.Mesh(new T.SphereGeometry(.07/K_ORELHA,12,8),new T.MeshBasicMaterial({color:0xfff0f6}));p.userData.f=i/3;o.add(p);pulsos.push(p);}}
  if(n>=7){const tl=new T.Mesh(new T.SphereGeometry(.45,24,16),mat(0xa9d7a4,{emissive:0x1f4a1c,transparent:true,opacity:.85}));tl.position.set(-1.6,1.6,0);tl.scale.set(1.2,.7,.7);cena.add(tl);label(cena,'Lobo temporal',V(-1.6,2.35,.3),'#d8ffd0',1.5);cena.userData.tl=tl;}
  label(cena,'Som',V(3.4,1.2,.3),'#ffd8ea',.8);
  g.userData.tick=t=>{
    ondas.forEach(r=>{const k=(t*.35+r.userData.f)%1;r.position.set(3.6-k*1.2,-.3,0);r.scale.setScalar(1.3-k*.8);r.material.opacity=.75*(1-k);});
    if(o.userData.curva&&pulsos.length){pulsos.forEach(p=>{const k=(t*.4+p.userData.f)%1;o.userData.curva.getPointAt(1-k,p.position);});}
    const ms=o.userData.meshes;const pav=o.userData.pav,can=o.userData.canal;
    if(pav)pav.material.emissive.setHex(n>=2?(Math.sin(t*6)>0?0x5a3020:0x2a1810):0);if(can)can.material.emissive.setHex(n>=3?0x4a2020:0);
    if(ms){if(ms.timpano){ms.timpano.material.emissive.setHex(n>=4?0x6a5a10:0);const tm=ms.timpano;if(!tm.userData.cc){tm.geometry.computeBoundingBox();tm.userData.cc=tm.geometry.boundingBox.getCenter(new T.Vector3());}const sk=n>=4?1+.08*Math.sin(t*30):1;tm.scale.setScalar(sk);tm.position.copy(tm.userData.cc).multiplyScalar(1-sk);/* vibra em volta do próprio centro (a malha está em metros, com origem nos pés) */}
      ['martelo','bigorna','estribo'].forEach(k=>{if(ms[k]){ms[k].material.emissive.setHex(n>=5?0x5a5040:0);ms[k].position.x=n>=5?.0004*Math.sin(t*30):0;}});
      if(ms.coclea)ms.coclea.material.emissive.setHex(n>=6?(Math.sin(t*5)>0?0x7a2050:0x4a1030):0x2a0c18);
      if(ms.nervo_auditivo)ms.nervo_auditivo.material.emissive.setHex(n>=7?(Math.sin(t*8)>0?0x7a6a20:0x3a3010):0);}
    if(cena.userData.tl)cena.userData.tl.scale.setScalar(1+.06*Math.sin(t*4));};
  return g;}

/* ---------- inspeções ---------- */
function inspection(key){const w=new T.Group();
  if(D.SENT_OLHO.includes(key)){const a=olhoAmpliado({foco:key==='olho'?null:FOCO_OLHO[key]});a.scale.setScalar(1.1);w.add(a);return w;}
  if(D.SENT_ORELHA.includes(key)){const b=orelhaAmpliada({foco:key==='orelha'?null:key});w.add(b);return w;}
  if(key==='olfato')return M().inspection('nariz');
  if(key==='paladar')return M().inspection('boca');
  if(key==='tato'&&window.LTR_MODELS)return window.LTR_MODELS.inspection('receptores_pele');
  return M().inspection(key);}
const ehSent=k=>!!(D.SENT_NOVAS&&D.SENT_NOVAS.includes(k));
window.SENT_MODELS={sentContexto,sentExplorar,sentDesafio,luz,lentes,som,olhoModelo,orelhaModelo,olhoCorte,inspection,ehSent,CENTROS_SENT};
})();
