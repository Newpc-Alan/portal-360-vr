/* Corpo Humano Imersivo · Órgãos dos Sentidos · cenas 3D (v4.11)
   Olho e orelha reais do Z-Anatomy (CC BY-SA 4.0): olho.glb (esclera, córnea, íris, cristalino, retina, corpo vítreo,
   nervo óptico, glândula lacrimal) e orelha.glb (tímpano, martelo, bigorna, estribo, cóclea, vestíbulo com os canais
   semicirculares, nervo vestibulococlear), extraídos do NervousSystem100.fbx e do SkeletalSystem100.fbx e simplificados.
   O pavilhão vem das regiões de superfície do Z-Anatomy; o canal auditivo é esquemático. Texturas desenhadas em canvas (íris, vasos da
   esclera, retina com disco óptico) e reflexo úmido dão o realismo sem arquivos extras.
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
/* ---------- realismo: texturas desenhadas em canvas (sem arquivos), coordenadas de textura geradas na hora, reflexo úmido ---------- */
const ENV=()=>{const g=G();return g&&g.envDe?g.envDe():null;};
const TEX={};
function canvasTex(nome,N,desenhar,srgb=true){if(TEX[nome])return TEX[nome];const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');let sd=nome.length*7919;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};desenhar(x,N,r);
  const t=new T.CanvasTexture(c);if(srgb)t.encoding=T.sRGBEncoding;t.anisotropy=8;TEX[nome]=t;return t;}
/* vasinho que se ramifica: usado na esclera e na retina */
function vaso(x,r,x0,y0,ang,len,larg,cor,niv){let px=x0,py=y0,a=ang;x.strokeStyle=cor;x.lineCap='round';for(let k=0;k<14;k++){const nx=px+Math.cos(a)*len/14,ny=py+Math.sin(a)*len/14;x.lineWidth=Math.max(.6,larg*(1-k/16));x.beginPath();x.moveTo(px,py);x.lineTo(nx,ny);x.stroke();px=nx;py=ny;a+=(r()-.5)*.5;
   if(niv>0&&r()<.16)vaso(x,r,px,py,a+(r()<.5?-1:1)*(.5+r()*.6),len*.55,larg*.65,cor,niv-1);}}
const TEX_IRIS=()=>canvasTex('iris',512,(x,N,r)=>{const c=N/2;
  const g=x.createRadialGradient(c,c,N*.13,c,c,N*.5);g.addColorStop(0,'#3a2412');g.addColorStop(.22,'#8a5a2c');g.addColorStop(.42,'#6b4a26');g.addColorStop(.62,'#5a4224');g.addColorStop(.86,'#3c2a18');g.addColorStop(1,'#1a120c');x.fillStyle=g;x.fillRect(0,0,N,N);
  for(let i=0;i<900;i++){const a=r()*Math.PI*2,r0=N*(.13+r()*.08),r1=N*(.3+r()*.19);const v=r();x.strokeStyle=v<.5?`rgba(${190+r()*50},${140+r()*50},${80+r()*40},.28)`:`rgba(30,18,8,.3)`;x.lineWidth=.6+r()*1.6;x.beginPath();x.moveTo(c+Math.cos(a)*r0,c+Math.sin(a)*r0);
   const am=a+(r()-.5)*.08;x.quadraticCurveTo(c+Math.cos(am)*(r0+r1)/2,c+Math.sin(am)*(r0+r1)/2,c+Math.cos(a)*r1,c+Math.sin(a)*r1);x.stroke();}
  x.strokeStyle='rgba(200,150,90,.45)';x.lineWidth=5;x.beginPath();for(let i=0;i<=72;i++){const a=i/72*Math.PI*2,rr=N*(.215+.012*Math.sin(a*9));const px=c+Math.cos(a)*rr,py=c+Math.sin(a)*rr;i?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();
  for(let i=0;i<40;i++){const a=r()*Math.PI*2,rr=N*(.25+r()*.15);x.fillStyle='rgba(20,12,6,.45)';x.beginPath();x.ellipse(c+Math.cos(a)*rr,c+Math.sin(a)*rr,2+r()*5,1+r()*2,a,0,Math.PI*2);x.fill();}
  x.fillStyle='#050505';x.beginPath();x.arc(c,c,N*.13,0,Math.PI*2);x.fill();});
const TEX_ESCLERA=()=>canvasTex('esclera',1024,(x,N,r)=>{x.fillStyle='#f3eee4';x.fillRect(0,0,N,N);
  for(let i=0;i<500;i++){const v=225+r()*25;x.fillStyle=`rgba(${v},${v-8},${v-18},.25)`;x.beginPath();x.arc(r()*N,r()*N,4+r()*30,0,Math.PI*2);x.fill();}
  /* vasinhos mais visíveis perto da córnea (faixa do meio da textura = frente do olho) */
  for(let i=0;i<42;i++){const y0=N*(.2+r()*.6),x0=N*(.62+r()*.26);vaso(x,r,x0,y0,(r()<.5?0:Math.PI)+(r()-.5)*.6,N*(.08+r()*.12),1.6+r()*1.6,`rgba(${170+r()*40},40,45,.55)`,2);}
  for(let i=0;i<30;i++){vaso(x,r,r()*N,r()*N,r()*Math.PI*2,N*.1,1,'rgba(180,70,70,.25)',1);}});
const TEX_RETINA=()=>canvasTex('retina',1024,(x,N,r)=>{const g=x.createLinearGradient(0,0,N,0);g.addColorStop(0,'#c8502c');g.addColorStop(.5,'#d8643a');g.addColorStop(1,'#c8502c');x.fillStyle=g;x.fillRect(0,0,N,N);
  for(let i=0;i<1200;i++){const v=r();x.fillStyle=v<.5?'rgba(255,170,110,.12)':'rgba(120,30,10,.12)';x.beginPath();x.arc(r()*N,r()*N,2+r()*10,0,Math.PI*2);x.fill();}
  /* disco óptico (atrás, um pouco para o nariz) com os vasos saindo dele; fóvea mais escura ao lado */
  const dx=N*.24,dy=N*.5;const fv=x.createRadialGradient(N*.29,dy,2,N*.29,dy,N*.04);fv.addColorStop(0,'rgba(90,20,10,.7)');fv.addColorStop(1,'rgba(90,20,10,0)');x.fillStyle=fv;x.beginPath();x.arc(N*.29,dy,N*.04,0,Math.PI*2);x.fill();
  for(let i=0;i<10;i++)vaso(x,r,dx,dy,i/10*Math.PI*2+(r()-.5)*.3,N*(.22+r()*.12),5+r()*3,i%2?'rgba(140,20,20,.85)':'rgba(110,10,30,.85)',3);
  const dg=x.createRadialGradient(dx,dy,2,dx,dy,N*.03);dg.addColorStop(0,'#fff2c8');dg.addColorStop(1,'#f0c088');x.fillStyle=dg;x.beginPath();x.arc(dx,dy,N*.028,0,Math.PI*2);x.fill();});
const TEX_GLANDULA=()=>canvasTex('glandula',256,(x,N,r)=>{x.fillStyle='#e8a49a';x.fillRect(0,0,N,N);for(let i=0;i<260;i++){const v=r();x.fillStyle=v<.5?'rgba(250,200,190,.35)':'rgba(170,80,80,.25)';x.beginPath();x.arc(r()*N,r()*N,3+r()*9,0,Math.PI*2);x.fill();}});
/* coordenadas de textura: esférica em volta do centro do olho, ou plana (vista de frente) para a íris */
function uvEsfera(geo,c){const p=geo.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){const dx=p.getX(i)-c[0],dy=p.getY(i)-c[1],dz=p.getZ(i)-c[2],l=Math.hypot(dx,dy,dz)||1;uv[i*2]=Math.atan2(dz,dx)/(2*Math.PI)+.5;uv[i*2+1]=Math.acos(Math.max(-1,Math.min(1,dy/l)))/Math.PI;}geo.setAttribute('uv',new T.BufferAttribute(uv,2));}
function uvFrente(geo,cx,cy,R){const p=geo.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=(p.getX(i)-cx)/(2*R)+.5;uv[i*2+1]=(p.getY(i)-cy)/(2*R)+.5;}geo.setAttribute('uv',new T.BufferAttribute(uv,2));}
function suavizar(geo){const p=geo.attributes.position,n=geo.attributes.normal;if(!n)return;const m=new Map(),k=i=>Math.round(p.getX(i)*2e4)+'_'+Math.round(p.getY(i)*2e4)+'_'+Math.round(p.getZ(i)*2e4);
  for(let i=0;i<p.count;i++){const key=k(i),a=m.get(key)||[0,0,0];a[0]+=n.getX(i);a[1]+=n.getY(i);a[2]+=n.getZ(i);m.set(key,a);}
  for(let i=0;i<p.count;i++){const a=m.get(k(i)),l=Math.hypot(a[0],a[1],a[2])||1;n.setXYZ(i,a[0]/l,a[1]/l,a[2]/l);}n.needsUpdate=true;}
const fis=(c,x)=>{const m=new T.MeshPhysicalMaterial(Object.assign({color:new T.Color(c).convertSRGBToLinear(),roughness:.45,metalness:0},x||{}));const e=ENV();if(e){m.envMap=e;m.envMapIntensity=x&&x.envMapIntensity||.9;}return m;};

/* recorta uma malha mantendo só os triângulos cujo centro (em metros do Z-Anatomy) passa no teste; não mexe na malha em cache */
function recortar(m,manter){const g=m.geometry,p=g.attributes.position,ix=g.index;if(!ix)return;const a=ix.array,out=[];
  for(let i=0;i<a.length;i+=3){const x=(p.getX(a[i])+p.getX(a[i+1])+p.getX(a[i+2]))/3,y=(p.getY(a[i])+p.getY(a[i+1])+p.getY(a[i+2]))/3,z=(p.getZ(a[i])+p.getZ(a[i+1])+p.getZ(a[i+2]))/3;if(manter(x,y,z))out.push(a[i],a[i+1],a[i+2]);}
  g.setIndex(out);}
/* ---------- olho real ---------- */
const OLHO_FICHA={esclera:'esclera',cornea:'cornea',iris:'iris',cristalino:'cristalino',retina:'retina',vitreo:'vitreo',nervo_optico:'optico',glandula_lacrimal:'glandula_lacrimal'};
const OLHO_MAT={
 esclera:()=>fis(0xffffff,{map:TEX_ESCLERA(),side:T.DoubleSide,roughness:.32,clearcoat:.8,clearcoatRoughness:.12}),
 cornea:()=>fis(0xeaf6ff,{transparent:true,opacity:.16,depthWrite:false,roughness:.02,clearcoat:1,clearcoatRoughness:.02,side:T.DoubleSide,envMapIntensity:2.2}),
 iris:()=>fis(0xffffff,{map:TEX_IRIS(),roughness:.55,side:T.DoubleSide,clearcoat:.4}),
 cristalino:()=>fis(0xfff0c8,{transparent:true,opacity:.42,depthWrite:false,roughness:.03,clearcoat:1,envMapIntensity:1.6}),
 retina:()=>fis(0xffffff,{map:TEX_RETINA(),side:T.DoubleSide,roughness:.5,clearcoat:.5,clearcoatRoughness:.3}),
 vitreo:()=>fis(0xeef8ff,{transparent:true,opacity:.1,depthWrite:false,roughness:.02,side:T.DoubleSide,clearcoat:1,envMapIntensity:1.4}),
 nervo_optico:()=>fis(0xf2e6cc,{roughness:.5,clearcoat:.3}),
 glandula_lacrimal:()=>fis(0xffffff,{map:TEX_GLANDULA(),roughness:.5,clearcoat:.5})};
const FOCO_OLHO={cornea:'cornea',iris:'iris',pupila:'iris',cristalino:'cristalino',retina:'retina',esclera:'esclera',vitreo:'vitreo',glandula_lacrimal:'glandula_lacrimal',optico:'nervo_optico'};
function olhoReserva(){const w=new T.Group();const s=new T.Mesh(new T.SphereGeometry(.09,32,24),mat(0xf3eee4));w.add(s);const i=new T.Mesh(new T.RingGeometry(.02,.045,32),mat(0x6b4426));i.position.z=.085;w.add(i);return w;}
/* opt.hit(fichaKey)→hit, opt.foco = parte em destaque (as outras ficam translúcidas) */
function olhoModelo(opt={}){registrar();const g=G();const c=CENTROS_SENT.olho;
  const hitDe=p=>opt.hit===undefined?insp(OLHO_FICHA[p]||'olho'):opt.hit?opt.hit(OLHO_FICHA[p]||'olho'):null;
  const corte=opt.corte!==false;
  const o=g.orgao('olho',olhoReserva,hitDe,{aoCarregar:(inst,meshes,grp)=>{for(const [p,m] of Object.entries(meshes)){if(!OLHO_MAT[p])continue;
     m.geometry=m.geometry.clone();suavizar(m.geometry);
     if(p==='iris')uvFrente(m.geometry,-0.0305,1.5915,0.0068);else uvEsfera(m.geometry,c);
     m.material=OLHO_MAT[p]();
     /* a glândula lacrimal fica escondida na órbita: só aparece na ficha dela */
     if(p==='glandula_lacrimal'&&opt.foco!=='glandula_lacrimal'&&!opt.glandula)m.visible=false;
     /* janela de corte: tira o quarto de trás do lado de dentro (nasal) da esclera, da retina e do vítreo, para ver as camadas */
     if(corte&&['esclera','retina','vitreo'].includes(p))recortar(m,(x,y,z)=>!(x>c[0]-.001&&z<c[2]+.003));
     if(p==='nervo_optico')recortar(m,(x,y,z)=>z>.041);
     if(opt.foco&&opt.foco!==p){m.material.transparent=true;m.material.opacity=Math.min(m.material.opacity,.3);m.material.depthWrite=false;}
     if(opt.foco===p){m.material.emissive=new T.Color(0x6a5020);m.material.transparent=p==='cornea'||p==='vitreo';m.material.opacity=p==='cornea'||p==='vitreo'?.7:1;m.material.depthWrite=true;}}
    grp.userData.meshes=meshes;}});
  /* pupila: a abertura no meio da íris (não é uma estrutura, então entra como um disco escuro) */
  const pup=new T.Mesh(new T.CircleGeometry(.0019*g.ESC,32),new T.MeshBasicMaterial({color:0x020203,side:T.DoubleSide}));pup.position.copy(rel([-0.0313,1.5913,0.0752],c));o.add(pup);
  pup.userData.hit=opt.hit===undefined?insp('pupila'):opt.hit?opt.hit('pupila'):null;o.userData.pupila=pup;
  if(opt.foco&&opt.foco!=='iris')pup.visible=false;
  return o;}

/* ---------- orelha real (Z-Anatomy: pavilhão, orelha média e interna) + canal auditivo esquemático ---------- */
const ORELHA_FICHA={pavilhao:'orelha_externa',timpano:'timpano',martelo:'ossiculos',bigorna:'ossiculos',estribo:'ossiculos',coclea:'coclea',vestibulo:'canais_semicirculares',nervo_auditivo:'nervo_auditivo'};
const tecido=(m,t)=>{if(window.CORPO_TECIDOS)window.CORPO_TECIDOS.aplicar(m,t);return m;};
const ORELHA_MAT={
 pavilhao:()=>fis(0xe2ab90,{roughness:.55,clearcoat:.25,clearcoatRoughness:.4,sheen:new T.Color(0x5a2a20),side:T.DoubleSide}),
 timpano:()=>fis(0xd9d2c4,{transparent:true,opacity:.82,side:T.DoubleSide,roughness:.2,clearcoat:.9,envMapIntensity:1.4}),
 martelo:()=>tecido(fis(0xe8dcc4,{roughness:.6}),'osso'),bigorna:()=>tecido(fis(0xe8dcc4,{roughness:.6}),'osso'),estribo:()=>tecido(fis(0xe8dcc4,{roughness:.6}),'osso'),
 coclea:()=>tecido(fis(0xecd4c8,{roughness:.4,clearcoat:.5}),'osso'),vestibulo:()=>tecido(fis(0xe6dcc6,{roughness:.4,clearcoat:.5}),'osso'),
 nervo_auditivo:()=>tecido(fis(0xf2e4b8,{roughness:.5}),'nervo')};
const FOCO_ORELHA={timpano:['timpano'],ossiculos:['martelo','bigorna','estribo'],coclea:['coclea'],canais_semicirculares:['vestibulo'],nervo_auditivo:['nervo_auditivo'],orelha_externa:['pavilhao'],canal_auditivo:['_canal']};
function orelhaReserva(){const w=new T.Group();const c=new T.Mesh(new T.TorusKnotGeometry(.05,.015,64,8),mat(0xecd4c8));w.add(c);return w;}
function orelhaModelo(opt={}){registrar();const g=G();const c=CENTROS_SENT.orelha,E=g.ESC;
  const hitDe=p=>opt.hit===undefined?insp(ORELHA_FICHA[p]||'orelha'):opt.hit?opt.hit(ORELHA_FICHA[p]||'orelha'):null;
  const foco=opt.foco?FOCO_ORELHA[opt.foco]||[]:null;
  const o=g.orgao('orelha',orelhaReserva,hitDe,{aoCarregar:(inst,meshes,grp)=>{for(const [p,m] of Object.entries(meshes)){if(!ORELHA_MAT[p])continue;
     m.geometry=m.geometry.clone();suavizar(m.geometry);m.material=ORELHA_MAT[p]();m.material.side=T.DoubleSide;
     if(foco&&!foco.includes(p)){m.material.transparent=true;m.material.opacity=.3;m.material.depthWrite=false;}
     if(foco&&foco.includes(p))m.material.emissive=new T.Color(0x6a5020);}
    grp.userData.meshes=meshes;grp.userData.pav=meshes.pavilhao||null;}});
  /* canal auditivo esquemático: da concha até o tímpano (o Z-Anatomy não traz o canal) */
  const tim=[-0.0485,1.578,-0.0045],ent=[-0.068,1.5735,-0.005];
  const curva=new T.CatmullRomCurve3([rel(tim,c),rel([-0.055,1.577,-0.004],c),rel([-0.062,1.575,-0.0035],c),rel(ent,c)]);
  const opC=foco&&!foco.includes('_canal')?.12:.5;
  const canal=new T.Mesh(new T.TubeGeometry(curva,24,.0033*E,16,false),fis(0xd88e80,{transparent:true,opacity:opC,depthWrite:false,side:T.DoubleSide,roughness:.5,clearcoat:.4}));
  canal.userData.hit=opt.hit===undefined?insp('canal_auditivo'):opt.hit?opt.hit('canal_auditivo'):null;o.add(canal);
  o.userData.canal=canal;o.userData.curva=curva;
  return o;}

/* olho e orelha lado a lado, ampliados (explorar, contexto e desafio) */
const K_OLHO=16,K_ORELHA=11;
function olhoAmpliado(opt){const w=new T.Group();const o=olhoModelo(opt);o.position.set(0,0,0);o.scale.setScalar(K_OLHO);o.rotation.y=-.85;w.add(o);w.userData.olho=o;return w;}
function orelhaAmpliada(opt){const w=new T.Group();const o=orelhaModelo(opt);o.position.set(0,0,0);o.scale.set(-K_ORELHA,K_ORELHA,K_ORELHA);o.rotation.y=-.35;w.add(o);w.userData.orelha=o;return w;}
function par(opt={}){const w=new T.Group(),Mo=M();
  const a=olhoAmpliado(opt);a.position.set(-2.4,0,0);w.add(a);const b=orelhaAmpliada(opt);b.position.set(2.0,0,0);b.scale.setScalar(.9);w.add(b);
  if(opt.rotulos!==false){Mo.textFixo(w,'OLHO · VISÃO',-2.4,2.7,0,2.6,'#9fc5f0');Mo.textFixo(w,'ORELHA · AUDIÇÃO E EQUILÍBRIO',2.7,2.7,0,3.6,'#f0a6c8');}
  return w;}

/* ---------- contexto ----------
   v4.11.2: no olho (1) e na orelha (2) tocar numa parte abre a ficha dela; avançar fica só no botão do painel. */
function sentContexto(level){const Mo=M(),g=G(),w=new T.Group();
  if(level===0){registrar();/* v4.12.4: o corpo não avança mais ao toque (o raio batia na pele antes do ponto do tato ou da boca e abria o olho) */const sil=g.orgao('silhueta',null,()=>null,{opacidade:.14});w.add(sil);
    const pts=[['Visão',[-0.031,1.592,0.08],0x9fc5f0,-1.6,.5],['Visão',[0.031,1.592,0.08],0x9fc5f0,null],['Audição',[-0.076,1.58,0.0],0xf0a6c8,-1.9,-.2],['Audição',[0.076,1.58,0.0],0xf0a6c8,null],
     ['Olfato',[0,1.585,0.1],0x9ed6ef,1.7,.35],['Paladar',[0,1.528,0.075],0xd96b73,1.7,-.35],['Tato',[0.28,0.79,0.06],0xf2c9a6,1.4,0]];
    /* v4.12.2: cada ponto leva ao seu sentido (visão → olho, audição → orelha, os outros abrem a ficha) */
    const DEST={'Visão':{type:'v4',command:'sent:ctx:olho'},'Audição':{type:'v4',command:'sent:ctx:orelha'},'Olfato':insp('olfato'),'Paladar':insp('paladar'),'Tato':insp('tato')};
    pts.forEach(([t,p,cor,dx,dy])=>{const b=new T.Mesh(new T.SphereGeometry(.09,20,14),new T.MeshBasicMaterial({color:cor}));b.position.copy(g.ponto(...p));b.userData.hit=DEST[t]||CTX;b.userData.pulso=true;w.add(b);
      /* área de toque maior, um pouco à frente da pele, para o raio do óculos acertar o ponto */const alvo=new T.Mesh(new T.SphereGeometry(t==='Tato'?.24:.1,12,8),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));alvo.position.copy(b.position).add(V(0,0,.12));alvo.userData.hit=b.userData.hit;w.add(alvo);
      if(dx!==null){const lp=b.position.clone().add(V(dx*1.25,dy,.5)),sp=label(w,t,lp,'#ffffff',2.4);sp.userData.hit=b.userData.hit;
        /* v4.12.5: o nome vira um botão grande (no óculos os pontos da cabeça ficam a 3 cm um do outro e o raio pulava para o olho) */const pil=new T.Mesh(new T.PlaneGeometry(1.75,.46),new T.MeshBasicMaterial({color:cor,transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide}));pil.position.copy(lp).add(V(0,0,-.02));pil.userData.hit=b.userData.hit;w.add(pil);const fim=lp.clone().add(V(dx>0?-.75:.75,0,0));w.add(new T.Line(new T.BufferGeometry().setFromPoints([b.position.clone(),fim]),new T.LineBasicMaterial({color:cor,transparent:true,opacity:.7})));}});
    w.userData.tick=t=>{w.children.forEach(o=>{if(o.userData.pulso)o.scale.setScalar(1+.25*Math.sin(t*3+o.position.x*4));});};
    Mo.textAt(w,'OS CINCO SENTIDOS',0,-7.9,0,4.2,'#9fc5f0');return w;}
  if(level===1){const a=olhoAmpliado({});a.scale.setScalar(1.15);w.add(a);Mo.textFixo(w,'O OLHO POR DENTRO',0,2.5,0,3.2,'#9fc5f0');
    marcar(w,a.userData.olho,CENTROS_SENT.olho,[['Córnea',[-0.031,1.594,0.0765],V(-.5,.9,0)],['Íris',[-0.0345,1.5875,0.0735],V(-1.0,-.5,0)],['Cristalino',[-0.031,1.591,0.0715],V(-.7,-1.2,0)],['Retina',[-0.026,1.586,0.058],V(.9,-.9,0)],['Nervo óptico',[-0.024,1.5935,0.0505],V(1.0,.7,0)]]);return w;}
  const b=orelhaAmpliada({});b.scale.setScalar(.95);b.position.set(-1.1,.1,0);w.add(b);Mo.textFixo(w,'A ORELHA POR DENTRO',0,2.5,0,3.4,'#f0a6c8');
  marcar(w,b.userData.orelha,CENTROS_SENT.orelha,[['Tímpano',[-0.0485,1.578,-0.0045],V(-.3,-1.1,0)],['Ossículos',[-0.047,1.583,-0.005],V(-.4,1.0,0)],['Cóclea',[-0.0395,1.58,0.0],V(-.9,-.9,0)],['Canais do equilíbrio',[-0.04,1.586,-0.009],V(-1.2,.9,0)],['Pavilhão',[-0.08,1.59,-0.008],V(.4,1.4,0)],['Canal auditivo',[-0.06,1.576,-0.004],V(.2,-1.2,0)]]);return w;}
/* rótulo preso a um ponto real do órgão (m do Z-Anatomy), com uma linha fina até ele */
function marcar(w,org,centro,itens){w.updateMatrixWorld(true);const inv=new T.Matrix4().copy(w.matrixWorld).invert();
  itens.forEach(([t,p,off])=>{const alvo=rel(p,centro);org.localToWorld(alvo);alvo.applyMatrix4(inv);const pos=alvo.clone().add(off);pos.z+=.4;label(w,t,pos,'#fff3e0',1.25);
    const l=new T.Line(new T.BufferGeometry().setFromPoints([alvo,pos.clone().add(V(0,off.y>0?-.12:.12,0))]),new T.LineBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.55}));w.add(l);
    const d=new T.Mesh(new T.SphereGeometry(.035,10,8),new T.MeshBasicMaterial({color:0xffffff}));d.position.copy(alvo);w.add(d);});}
function sentExplorar(){return par({});}
function sentDesafio(){return par({hit:null,rotulos:true});}

/* ---------- olho esquemático em corte (raios de luz) ---------- */
/* comprimento do olho: normal 1, míope mais comprido, hipermetrope mais curto. Retorna {g, xRetina, xLente} */
function olhoCorte(opt={}){const g=new T.Group(),L=opt.comprimento||1,R=1.15,xr=R*L;
  const parede=new T.Mesh(new T.SphereGeometry(R,48,32),fis(0xffffff,{map:TEX_ESCLERA(),transparent:true,opacity:.2,depthWrite:false,side:T.DoubleSide,clearcoat:.8}));parede.scale.set(L,1,1);g.add(parede);
  const ret=new T.Mesh(new T.SphereGeometry(R*.985,48,32,-Math.PI/2.6,Math.PI*0.77,0,Math.PI),fis(0xffffff,{map:TEX_RETINA(),side:T.DoubleSide,roughness:.5,clearcoat:.5}));ret.scale.set(L,1,1);ret.rotation.y=-Math.PI/2;g.add(ret);
  const cor=new T.Mesh(new T.SphereGeometry(.55,32,20,0,Math.PI*2,0,Math.PI/3.3),mat(0xcfefff,{transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide}));cor.rotation.z=Math.PI/2;cor.position.x=-R*L+.42;g.add(cor);
  const iris=new T.Mesh(new T.RingGeometry(.17,.55,48),fis(0xffffff,{map:TEX_IRIS(),side:T.DoubleSide}));iris.rotation.y=Math.PI/2;iris.position.x=-R*L+.32;g.add(iris);
  const len=new T.Mesh(new T.SphereGeometry(1,32,24),mat(0xffe3a0,{transparent:true,opacity:.7,emissive:0x3a2a08}));len.scale.set(.16,.4,.4);len.position.x=-R*L+.55;g.add(len);
  const nervo=new T.Mesh(new T.CylinderGeometry(.13,.13,1.0,16),mat(0xf6e3a0));nervo.rotation.z=Math.PI/2;nervo.position.set(xr+.45,-.12,0);g.add(nervo);
  g.userData={xRetina:xr,xLente:-R*L+.55,xCornea:-R*L+.1,cornea:cor,iris,lente:len,retina:ret,nervo};return g;}
/* a câmera do app centraliza em x=0 e enquadra a caixa do modelo: marcadores invisíveis nas pontas fazem caber tabuleiro + cena */
function alargar(g,x){[-x,x].forEach(v=>{const m=new T.Mesh(new T.BoxGeometry(.01,.01,.01),new T.MeshBasicMaterial({visible:false}));m.position.x=v;g.add(m);});}
function linha(pts,cor,op=1){const geo=new T.BufferGeometry().setFromPoints(pts);return new T.Line(geo,new T.LineBasicMaterial({color:cor,transparent:true,opacity:op}));}
function setaObjeto(alt,cor){const g=new T.Group();const h=new T.Mesh(new T.CylinderGeometry(.05,.05,alt,10),mat(cor,{emissive:0x332200}));g.add(h);const p=new T.Mesh(new T.ConeGeometry(.16,.3,16),mat(cor,{emissive:0x332200}));p.position.y=alt/2+.12;g.add(p);return g;}

/* missão Como enxergamos: tabuleiro + olho em corte; cada etapa encaixada acende o trecho do caminho */
function luz(state,cfg){const Mo=M(),g=Mo.sequencia(state,cfg),n=state.colocados.filter(Boolean).length;
  /* v4.12: olho em corte embaixo da coluna de peças (quadro mais estreito = tudo maior no óculos) */const cena=new T.Group();cena.position.set(-3.05,-1.75,0);cena.scale.setScalar(.5);g.add(cena);
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
  const cena=new T.Group();cena.position.set(-3.7,-1.95,0);cena.scale.setScalar(.45);g.add(cena);
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
