/* Corpo Humano Imersivo · Módulos 9, 10 e 11: Linfático, Tegumentar e Reprodutor · cenas 3D (Three.js r128) (v4.8)
   Tudo procedural, no estilo "atlas escolar", no mesmo referencial dos modelos Z-Anatomy (corpo de 1,71 m, ESC 7,5, OY do tórax).
   Ponto de troca: órgãos com centro em CENTROS_LTR (baço, timo, tonsilas) usam o glTF do Z-Anatomy quando a chave estiver
   em D.LTR_GLB e o arquivo modelos/<chave>.glb existir; até lá entra o modelo procedural de reserva.
   Reprodutor: pranchas esquemáticas dos órgãos internos (vista de atlas), sem genitália externa, fora da silhueta do corpo. */
(function(){'use strict';
const T=THREE,D=CORPO_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const G=()=>window.CORPO_GLTF,M=()=>window.CORPO_MODELS,E=()=>window.ESQ_GLTF;
const P=(x,y,z)=>G().ponto(x,y,z);
const insp=k=>({type:'inspect',key:k});
const CTX={type:'v4',command:'ltr:ctx:next'};
const S_=1/7.5; /* 1 unidade da cena = 1/7,5 m */
D.LTR_GLB=D.LTR_GLB||[];
const CENTROS_LTR={baco:[0.085,1.13,-0.03],timo:[0,1.37,0.045],tonsilas:[0,1.515,0.045]};
function registrar(){const g=G();if(g&&!g.CENTROS.baco)Object.assign(g.CENTROS,CENTROS_LTR);}
const mat=(c,x)=>M().mat(c,x);
function hitTodos(o,h){if(!h)return o;o.traverse(x=>{if(x.isMesh)x.userData.hit=h;});return o;}
function brilho(c,k=.28){return new T.Color(c).multiplyScalar(k).getHex();}
function elip(rx,ry,rz,cor,extra,org){const m=new T.Mesh(new T.SphereGeometry(1,32,22),mat(cor,extra));m.scale.set(rx,ry,rz);if(org)M().organico(m,org[0],org[1],org[2]);return m;}
function tubo(pts,r,cor,extra,seg=48,rad=10){const c=new T.CatmullRomCurve3(pts);const m=new T.Mesh(new T.TubeGeometry(c,seg,r,rad,false),mat(cor,extra));m.userData.curva=c;return m;}
/* órgão com ponto de troca: glTF do Z-Anatomy se disponível, senão reserva procedural centrada na origem */
function zOrgao(key,reserva,hit,opt={}){registrar();const g=G();
  if(g&&D.LTR_GLB.includes(key))return g.orgao(key,reserva,hit?()=>hit:null,opt);
  const w=new T.Group();if(g)w.position.copy(g.ponto(...CENTROS_LTR[key]));const r=reserva();hitTodos(r,hit);if(opt.opacidade!==undefined)r.traverse(o=>{if(o.isMesh){o.material.transparent=true;o.material.opacity=opt.opacidade;o.material.depthWrite=false;}});w.add(r);w.userData.gltf=key;return w;}
/* pulsa mantendo o formato (elipsoides têm escala não uniforme) */
function pulsar(o,k){if(!o.userData.s0)o.userData.s0=o.scale.clone();o.scale.copy(o.userData.s0).multiplyScalar(k);}
const label=(w,t,p,cor='#eafaff',wd=1.4)=>{const sp=M().label(t,cor,wd,62);sp.position.copy(p);w.add(sp);return sp;};

/* =====================================================================================
   LINFÁTICO
   ===================================================================================== */
const COR_LIN=0x7fd6b0,COR_VASO=0x8fe8c8;
/* trajetos (m) no lado esquerdo do paciente (x>0); o direito é espelhado */
const TRAJ={
 braco:[[0.29,0.72,0.07],[0.282,0.80,0.04],[0.257,0.92,0.0],[0.236,1.06,-0.02],[0.215,1.20,-0.03],[0.168,1.32,-0.01]],
 perna:[[0.085,0.09,0.02],[0.086,0.25,-0.02],[0.085,0.48,-0.03],[0.078,0.68,0.0],[0.085,0.86,0.05]],
 pelve:[[0.085,0.86,0.05],[0.06,0.94,0.02],[0.025,1.02,-0.02],[0.0,1.08,-0.035]],
 cabeca:[[0.06,1.62,0.03],[0.055,1.55,0.02],[0.047,1.49,0.0],[0.045,1.44,0.0],[0.05,1.42,0.0]],
 axila:[[0.168,1.32,-0.01],[0.12,1.38,0.0],[0.07,1.415,0.0],[0.05,1.42,0.0]]
};
const DUCTO=[[0.0,1.08,-0.035],[0.0,1.16,-0.045],[0.003,1.25,-0.048],[0.008,1.33,-0.04],[0.02,1.39,-0.025],[0.035,1.425,-0.008],[0.05,1.42,0.0]];
const NODOS=[ /* [x,y,z,quantos,espalhamento(m)] lado esquerdo; espelhados quando x≠0 */
 [0.045,1.48,0.0,3,.012],[0.168,1.32,-0.01,4,.015],[0.085,0.86,0.05,3,.013],[0.085,0.48,-0.04,2,.008],[0.03,1.0,0.03,4,.02],[0.0,1.3,0.0,2,.015]];
const espelha=p=>[-p[0],p[1],p[2]];
function curvaM(pts){return new T.CatmullRomCurve3(pts.map(p=>P(...p)));}
function baco(){const w=new T.Group();const b=elip(.11*7.5/2,.07*7.5/2,.045*7.5/2,0x8a4f7d,{roughness:.45,emissive:0x1d0a18},[.03,3.2,4]);b.rotation.set(.2,.5,-.7);w.add(b);
  const hilo=tubo([V(-.12,.02,.12),V(-.05,0,.2),V(.02,-.02,.24)],.035,0xc03a44,{roughness:.4});w.add(hilo);return w;}
function timo(){const w=new T.Group();[-1,1].forEach(s=>{const l=elip(.12,.24,.07,0xe9c9a8,{roughness:.6,emissive:0x1a1208},[.015,6,s+3]);l.position.set(s*.08,0,0);l.rotation.z=-s*.12;w.add(l);});return w;}
function tonsilas(){const w=new T.Group();[-1,1].forEach(s=>{const t=elip(.05,.08,.04,0xe89aa8,{roughness:.5,emissive:0x2a0d12},[.008,14,s+5]);t.position.set(s*.13,0,0);w.add(t);});return w;}
/* rede linfática completa no corpo. opt: {hit:função(chave)→hit, opac, fluxo} */
function rede(opt={}){
  const w=new T.Group(),hit=opt.hit||insp,op=opt.opac??1,tr=op<1?{transparent:true,opacity:op}:{};
  const curvas=[];
  const vaso=(pts,r,k)=>{const c=curvaM(pts);const m=new T.Mesh(new T.TubeGeometry(c,Math.max(16,pts.length*10),r,8,false),mat(COR_VASO,Object.assign({roughness:.35,emissive:0x0f3a2c},tr)));hitTodos(m,hit(k));w.add(m);curvas.push(c);return m;};
  ['braco','perna','pelve','cabeca','axila'].forEach(k=>{vaso(TRAJ[k],.022,'vasos_linfaticos');vaso(TRAJ[k].map(espelha),.022,'vasos_linfaticos');});
  /* ramos finos: coxa, antebraço e tronco */
  [[[0.12,0.55,0.03],[0.1,0.7,0.04],[0.085,0.86,0.05]],[[0.27,0.95,0.03],[0.24,1.1,0.01],[0.168,1.32,-0.01]],[[0.12,1.15,0.09],[0.15,1.25,0.06],[0.168,1.32,-0.01]],[[0.04,0.95,0.06],[0.03,1.0,0.03],[0.0,1.08,-0.035]]].forEach(r=>{vaso(r,.012,'vasos_linfaticos');if(r[0][0]!==0)vaso(r.map(espelha),.012,'vasos_linfaticos');});
  /* ducto torácico (mais grosso) e ducto linfático direito */
  const dm=vaso(DUCTO,.034,'ducto_toracico');dm.material.color.setHex(0x5fd0a8);dm.material.emissive.setHex(0x14503a);
  const cist=elip(.07,.12,.05,0x5fd0a8,Object.assign({emissive:0x14503a},tr));cist.position.copy(P(0,1.08,-0.035));hitTodos(cist,hit('ducto_toracico'));w.add(cist);
  /* linfonodos */
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647-.5;};
  NODOS.forEach(([x,y,z,n,e])=>{const lados=x===0?[1]:[1,-1];lados.forEach(s=>{for(let i=0;i<n;i++){const nd=elip(.05,.075,.045,COR_LIN,Object.assign({roughness:.4,emissive:0x1c5a42},tr));nd.position.copy(P(s*x+rnd()*e*2,y+rnd()*e*2,z+rnd()*e));nd.rotation.set(rnd()*2,rnd()*2,rnd()*2);hitTodos(nd,hit('linfonodos'));w.add(nd);}});});
  /* órgãos */
  w.add(zOrgao('baco',baco,hit('baco'),op<1?{opacidade:op}:{}));
  w.add(zOrgao('timo',timo,hit('timo'),op<1?{opacidade:op}:{}));
  w.add(zOrgao('tonsilas',tonsilas,hit('tonsilas'),op<1?{opacidade:op}:{}));
  /* medula óssea: faixa vermelha dentro dos fêmures, do esterno e da pelve */
  [[[0.09,0.5,-0.02],[0.09,0.82,-0.02]],[[-0.09,0.5,-0.02],[-0.09,0.82,-0.02]],[[0,1.28,0.07],[0,1.36,0.07]]].forEach(seg=>{const m=tubo(seg.map(p=>P(...p)),.03,0xe04a4a,Object.assign({emissive:0x5a1010,roughness:.5},tr),8);hitTodos(m,hit('medula_ossea'));w.add(m);});
  [-1,1].forEach(s=>{const m=elip(.16,.12,.05,0xe04a4a,Object.assign({emissive:0x5a1010,transparent:true,opacity:Math.min(op,.75)}));m.position.copy(P(s*0.07,0.93,-0.015));m.rotation.z=s*.5;hitTodos(m,hit('medula_ossea'));w.add(m);});
  /* fluxo da linfa: bolinhas andando em direção ao ducto */
  if(opt.fluxo!==false){const bolas=[];curvas.forEach((c,i)=>{const n=c.getLength()>3?3:2;for(let k=0;k<n;k++){const b=new T.Mesh(new T.SphereGeometry(.03,8,6),new T.MeshBasicMaterial({color:0xd8fff0}));b.userData={c,f:k/n+i*.07};w.add(b);bolas.push(b);}});
    w.userData.tick=t=>{bolas.forEach(b=>{const u=(t*.06+b.userData.f)%1;b.userData.c.getPointAt(u,b.position);});};}
  return w;
}
/* linfonodo ampliado (corte): cápsula, centros germinativos, linfócitos, vasos aferentes e eferente, bactérias presas */
function linfonodo(opt={}){
  const w=new T.Group(),Mo=M();const h=k=>opt.hit?opt.hit:insp(k);
  const cap=elip(2.0,1.25,1.0,0x7fd6b0,{transparent:true,opacity:.28,roughness:.3,side:T.DoubleSide,depthWrite:false},[.05,1.6,2]);hitTodos(cap,h('linfonodos'));w.add(cap);
  const cortex=elip(1.75,1.05,.82,0x9a78c8,{transparent:true,opacity:.22,roughness:.5,depthWrite:false});hitTodos(cortex,h('linfonodos'));w.add(cortex);
  let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  /* centros germinativos (folículos) junto à borda */
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.3;const f=new T.Mesh(new T.SphereGeometry(.26,24,16),mat(0xb08ae0,{roughness:.5,emissive:0x2a1a4a}));f.position.set(Math.cos(a)*1.4,Math.sin(a)*.8,(rnd()-.5)*.3);hitTodos(f,h('leucocitos'));w.add(f);
    for(let k=0;k<5;k++){const l=new T.Mesh(new T.SphereGeometry(.06,10,8),mat(0xf2f2ff,{emissive:0x303050}));l.position.copy(f.position).add(V((rnd()-.5)*.5,(rnd()-.5)*.5,(rnd()-.5)*.5+.2));hitTodos(l,h('leucocitos'));w.add(l);}}
  /* vasos aferentes (lado convexo, em cima) e eferente (hilo, embaixo) */
  const vasos=[];[[-1.3,1.9],[0,2.1],[1.3,1.9]].forEach(([x,y])=>{const t=tubo([V(x*1.25,y,0),V(x*1.05,1.45,0),V(x*.85,.95,0)],.08,COR_VASO,{roughness:.35,emissive:0x0f3a2c},24);hitTodos(t,h('vasos_linfaticos'));w.add(t);vasos.push(t.userData.curva);});
  const ef=tubo([V(0,-.9,0),V(.15,-1.4,0),V(.45,-1.95,0)],.1,COR_VASO,{roughness:.35,emissive:0x0f3a2c},24);hitTodos(ef,h('vasos_linfaticos'));w.add(ef);
  /* hilo com artéria e veia */
  w.add(tubo([V(-.45,-1.95,0),V(-.3,-1.4,.1),V(-.1,-.9,.1)],.06,0xe8484f,{roughness:.4},16));w.add(tubo([V(-.75,-1.9,0),V(-.5,-1.4,-.1),V(-.25,-.95,-.1)],.06,0x4f7fe0,{roughness:.4},16));
  /* linfócitos espalhados pela região central */
  for(let i=0;i<40;i++){const l=new T.Mesh(new T.SphereGeometry(.055,8,6),mat(0xf2f2ff,{emissive:0x303050}));const a=rnd()*Math.PI*2,r=Math.sqrt(rnd());l.position.set(Math.cos(a)*r*1.1,Math.sin(a)*r*.55,(rnd()-.5)*.8);hitTodos(l,h('leucocitos'));w.add(l);}
  /* bactérias chegando pela linfa e sendo capturadas */
  const bact=[];for(let i=0;i<9;i++){const b=new T.Mesh(T.CapsuleGeometry?new T.CapsuleGeometry(.07,.18,4,8):new T.CylinderGeometry(.07,.07,.26,8),mat(0xb6f03a,{emissive:0x4a7a10}));b.userData={c:vasos[i%3],f:i*.11,preso:V((rnd()-.5)*1.8,(rnd()-.2)*.9,(rnd()-.5)*.6)};w.add(b);bact.push(b);}
  const lab=opt.rotulos!==false;
  if(lab){label(w,'Linfa chega',V(-2.3,2.1,0),'#c9fff0',1.4);label(w,'Centros de defesa',V(2.75,.9,.4),'#e6d6ff',1.7);label(w,'Linfa filtrada sai',V(1.75,-1.95,0),'#c9fff0',1.8);label(w,'Linfócitos',V(-2.7,-.2,.4),'#ffffff',1.2);label(w,'Bactérias presas',V(2.6,-.6,.4),'#d8ff9a',1.6);}
  w.userData.tick=t=>{bact.forEach(b=>{const u=((t*.08+b.userData.f)%1.4);if(u<1){b.userData.c.getPointAt(Math.min(1,u),b.position);b.rotation.z=t*2;b.visible=true;}else{b.position.lerp(b.userData.preso,.08);b.scale.setScalar(Math.max(.2,1-(u-1)*2.2));}});};
  w.userData.semGiro=false;return w;
}
function linContexto(level){
  const Mo=M(),w=new T.Group();
  if(level===0){w.add(Mo.silhueta({opacidade:.16,nariz:false,enquadrar:true}));w.add(rede({hit:()=>CTX}));Mo.textAt(w,'LINFÁTICO · A REDE DE DEFESA DO CORPO',0,-7.9,0,6.2,'#a6f0d6');return w;}
  if(level===1){w.add(Mo.silhueta({opacidade:.1,nariz:false,enquadrar:true}));w.add(rede({hit:()=>CTX,opac:.22,fluxo:false}));
    w.add(zOrgao('baco',baco,CTX));w.add(zOrgao('timo',timo,CTX));w.add(zOrgao('tonsilas',tonsilas,CTX));
    [['Tonsilas',P(0,1.515,0.045),1.5,.2],['Timo',P(0,1.37,0.045),1.3,0],['Baço',P(0.085,1.13,-0.03),1.4,-.1],['Medula óssea',P(0.09,0.66,-0.02),1.7,0]].forEach(([t,p,dx,dy])=>label(w,t,p.clone().add(V(dx,dy,.6)),'#fff3e0',1.4));
    Mo.textAt(w,'ÓRGÃOS DE DEFESA',0,-7.9,0,4.4,'#a6f0d6');return w;}
  w.add(linfonodo({hit:CTX}));Mo.textFixo(w,'DENTRO DO LINFONODO',0,2.85,0,4.2,'#a6f0d6');return w;
}
function linExplorar(){const Mo=M(),w=new T.Group();w.add(Mo.silhueta({opacidade:.12,nariz:false,enquadrar:true}));w.add(rede());return w;}
function linDesafio(){const Mo=M(),w=new T.Group();w.add(Mo.silhueta({opacidade:.12,nariz:false,enquadrar:true}));w.add(rede({hit:()=>null}));return w;}
/* missão Defenda o corpo: tabuleiro + cena do dedo cortado à direita; concluída, a defesa anima inteira */
function defesa(state,cfg){
  const Mo=M(),g=Mo.sequencia(state,cfg);const n=state.colocados.filter(Boolean).length;
  const cena=new T.Group();cena.position.set(4.9,.1,0);cena.scale.setScalar(.78);g.add(cena);
  /* pele em corte com o corte */
  const pele=new T.Mesh(new T.BoxGeometry(4,.5,1.6),mat(0xf2c9a6,{roughness:.7}));pele.position.y=1.6;cena.add(pele);
  const derme=new T.Mesh(new T.BoxGeometry(4,1.2,1.6),mat(0xe8a39c,{roughness:.7,transparent:true,opacity:.9}));derme.position.y=.75;cena.add(derme);
  const fenda=new T.Mesh(new T.BoxGeometry(.25,.9,1.62),mat(0x6a1a1a,{roughness:.8}));fenda.position.set(0,1.45,0);cena.add(fenda);
  const vaso=tubo([V(-2,.5,.3),V(0,.35,.3),V(2,.5,.3)],.14,0xe8484f,{roughness:.4,transparent:true,opacity:.85},24);cena.add(vaso);
  const linfa=tubo([V(.6,.9,-.3),V(1.6,.2,-.3),V(2.6,-1.0,-.3),V(3.0,-1.9,-.3)],.09,COR_VASO,{emissive:0x0f3a2c},32);cena.add(linfa);
  const no=elip(.42,.3,.3,COR_LIN,{emissive:0x1c5a42},[.02,5,3]);no.position.set(3.1,-2.2,-.3);cena.add(no);
  label(cena,'Corte no dedo',V(-1.4,2.4,.6),'#ffe3c8',1.8);label(cena,'Linfonodo',V(3.3,-2.95,0),'#c9fff0',1.5);
  /* elementos que aparecem conforme as etapas são encaixadas */
  let seed=3;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const bact=[],fag=[],anti=[];
  for(let i=0;i<10;i++){const b=elip(.05,.1,.05,0x9ccf3a,{emissive:0x2a4a08});b.position.set((rnd()-.5)*1.4,1.0+rnd()*.7,(rnd()-.5)*.9);b.visible=n>=1;cena.add(b);bact.push(b);}
  if(n>=2){const glow=new T.Mesh(new T.SphereGeometry(1.3,24,16),new T.MeshBasicMaterial({color:0xff6a4a,transparent:true,opacity:.18,depthWrite:false}));glow.position.set(0,1.2,0);cena.add(glow);}
  for(let i=0;i<4;i++){const f=elip(.2,.2,.2,0xf2f2ff,{emissive:0x353550},[.03,6,i]);f.position.set(-1.5+i,.45,.4);f.visible=n>=3;cena.add(f);fag.push(f);}
  if(n>=4){const pist=[];for(let i=0;i<4;i++){const b=elip(.05,.05,.05,0xffd27f,{emissive:0x5a4010});b.userData.f=i*.25;cena.add(b);pist.push(b);}cena.userData.pistas=pist;}
  if(n>=5){for(let i=0;i<10;i++){const y=new T.Group();const m=mat(0xffe08a,{emissive:0x6a5010});const a=new T.Mesh(new T.CylinderGeometry(.02,.02,.16,6),m);a.position.y=-.08;y.add(a);[-1,1].forEach(s=>{const b=new T.Mesh(new T.CylinderGeometry(.02,.02,.12,6),m);b.position.set(s*.045,.04,0);b.rotation.z=-s*.6;y.add(b);});y.userData.alvo=bact[i].position.clone();y.position.set(3.1,-2.2,-.3);cena.add(y);anti.push(y);}}
  if(n>=6){const mem=[];for(let i=0;i<3;i++){const m=elip(.16,.16,.16,0xb08ae0,{emissive:0x3a2a6a});m.position.set(2.7+i*.35,-1.5,.3);cena.add(m);mem.push(m);}label(cena,'Memória',V(3.1,-.9,.5),'#e6d6ff',1.3);}
  g.userData.tick=t=>{
    bact.forEach((b,i)=>{b.rotation.z=t*1.5+i;if(n>=5&&anti[i]){anti[i].position.lerp(b.position,.03);anti[i].rotation.z=t;}if(n>=3){const f=fag[i%4];if(f){f.position.lerp(V(b.position.x,b.position.y-.15,b.position.z),.006);}}if(n>=6){b.userData.k=Math.max(.15,(b.userData.k??1)-.004);pulsar(b,b.userData.k);}});
    if(cena.userData.pistas)cena.userData.pistas.forEach(p=>{const u=(t*.15+p.userData.f)%1;linfa.userData.curva.getPointAt(u,p.position);});
    pulsar(no,n>=5?1+Math.sin(t*3)*.06:1);
  };
  return g;
}
/* inspeções */
function vasoValvulas(){const w=new T.Group();const c=new T.CatmullRomCurve3([V(0,-2.4,0),V(.15,-1,0),V(-.1,.4,0),V(0,2.4,0)]);
  const t=new T.Mesh(new T.TubeGeometry(c,60,.38,20,false),mat(COR_VASO,{transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false,roughness:.3}));hitTodos(t,insp('vasos_linfaticos'));w.add(t);
  [-1.4,0,1.4].forEach(y=>{const p=c.getPointAt((y+2.4)/4.8);[-1,1].forEach(s=>{const v=new T.Mesh(new T.ConeGeometry(.34,.5,16,1,true,s>0?0:Math.PI,Math.PI),mat(0x5fd0a8,{side:T.DoubleSide,transparent:true,opacity:.8}));v.position.copy(p);hitTodos(v,insp('vasos_linfaticos'));w.add(v);});});
  const bolas=[];for(let i=0;i<10;i++){const b=new T.Mesh(new T.SphereGeometry(.06,10,8),new T.MeshBasicMaterial({color:0xd8fff0}));b.userData.f=i/10;w.add(b);bolas.push(b);}
  label(w,'Válvulas: a linfa só sobe',V(1.7,0,.4),'#c9fff0',2.2);
  w.userData.tick=t=>{bolas.forEach(b=>{const u=(t*.08+b.userData.f)%1;c.getPointAt(u,b.position);b.position.x+=Math.sin(b.userData.f*30)*.12;});};return w;}
function femurMedula(){const w=new T.Group();
  const osso=new T.Mesh(new T.CylinderGeometry(.42,.42,4,32,1,true,0,Math.PI*1.4),mat(0xe9e4d6,{side:T.DoubleSide,roughness:.6}));hitTodos(osso,insp('medula_ossea'));w.add(osso);
  [2.2,-2.2].forEach(y=>{const ep=new T.Mesh(new T.SphereGeometry(.75,28,18,0,Math.PI*1.4),mat(0xe9e4d6,{side:T.DoubleSide,roughness:.6}));ep.position.y=y;hitTodos(ep,insp('medula_ossea'));w.add(ep);
    const esp=new T.Mesh(new T.SphereGeometry(.65,20,14),mat(0xd96a5a,{roughness:.7,emissive:0x3a0a08}));esp.position.y=y;hitTodos(esp,insp('medula_ossea'));w.add(esp);});
  const med=new T.Mesh(new T.CylinderGeometry(.3,.3,4,24),mat(0xe04a4a,{roughness:.6,emissive:0x4a0e0e}));hitTodos(med,insp('medula_ossea'));w.add(med);
  const cel=[];for(let i=0;i<30;i++){const c=new T.Mesh(new T.SphereGeometry(.05,8,6),mat(i%3?0xff8080:0xf2f2ff,{emissive:i%3?0x4a1010:0x303050}));c.userData.f=i/30;w.add(c);cel.push(c);}
  label(w,'Medula vermelha: fábrica do sangue',V(0,3.3,0),'#ffd0d0',3.2);
  w.userData.tick=t=>{cel.forEach((c,i)=>{const u=(t*.05+c.userData.f)%1;c.position.set(Math.cos(i*2.4)*.22,-2+u*4,Math.sin(i*2.4)*.22+.1);});};return w;}
function celulasDefesa(){const w=new T.Group();
  /* neutrófilo com núcleo lobado */
  const n=elip(.8,.8,.8,0xf2f2ff,{transparent:true,opacity:.55,roughness:.4,depthWrite:false});n.position.set(-2.4,0,0);w.add(n);[[-.25,.15],[.1,.3],[.3,-.1],[-.05,-.3]].forEach(([x,y])=>{const l=elip(.22,.18,.18,0x7a4ac8,{roughness:.5});l.position.set(-2.4+x,y,0);w.add(l);});label(w,'Neutrófilo',V(-2.4,1.25,0),'#ffffff',1.4);
  /* macrófago engolindo bactérias */
  const ma=elip(1.1,.9,.8,0xe8e0ff,{transparent:true,opacity:.5,roughness:.4,depthWrite:false},[.12,2.5,4]);w.add(ma);const nu=elip(.35,.3,.3,0x7a4ac8);nu.position.set(-.2,.1,0);w.add(nu);
  const bs=[];for(let i=0;i<3;i++){const b=elip(.08,.18,.08,0x9ccf3a,{emissive:0x2a4a08});b.userData.f=i;w.add(b);bs.push(b);}label(w,'Macrófago (fagócito)',V(0,1.4,0),'#ffffff',2.0);
  /* linfócito e anticorpos */
  const li=elip(.55,.55,.55,0xf2f2ff,{transparent:true,opacity:.55,depthWrite:false});li.position.set(2.4,0,0);w.add(li);const ln=elip(.45,.45,.45,0x6a3ab8);ln.position.set(2.4,0,0);w.add(ln);label(w,'Linfócito',V(2.4,1.0,0),'#ffffff',1.3);
  const ants=[];for(let i=0;i<6;i++){const y=new T.Group();const m=mat(0xffe08a,{emissive:0x6a5010});const a=new T.Mesh(new T.CylinderGeometry(.03,.03,.24,6),m);a.position.y=-.12;y.add(a);[-1,1].forEach(s=>{const b=new T.Mesh(new T.CylinderGeometry(.03,.03,.18,6),m);b.position.set(s*.07,.06,0);b.rotation.z=-s*.6;y.add(b);});y.userData.f=i/6;w.add(y);ants.push(y);}
  label(w,'Anticorpos',V(3.6,-1.2,0),'#ffe8a8',1.4);
  hitTodos(w,insp('leucocitos'));
  w.userData.tick=t=>{bs.forEach((b,i)=>{const u=((t*.25+i*.33)%1);b.position.set(1.6-u*1.5,Math.sin(i*2)*.4,0);pulsar(b,u>.75?Math.max(.1,1-(u-.75)*4):1);});ants.forEach((y,i)=>{const u=(t*.12+y.userData.f)%1;y.position.set(2.4+Math.cos(i)*.3+u*1.6,Math.sin(i*1.7)*.5-u*.6,.3);y.rotation.z=t+i;});};return w;}
function linInspection(key){
  const w=new T.Group(),g=G();
  if(key==='linfonodos'){const l=linfonodo({rotulos:true});l.scale.setScalar(.75);w.add(l);return w;}
  if(key==='leucocitos'){const c=celulasDefesa();c.scale.setScalar(1.0);w.add(c);return w;}
  if(key==='vasos_linfaticos'){const v=vasoValvulas();v.scale.setScalar(.8);w.add(v);return w;}
  if(key==='medula_ossea'){const f=femurMedula();f.scale.setScalar(.7);w.add(f);return w;}
  const rel=(k,c)=>{const ck=g.CENTROS[k];if(!ck)return null;const o=g.orgao(k,null,null,{opacidade:.16});o.position.set((ck[0]-c[0])*g.ESC,(ck[1]-c[1])*g.ESC,(ck[2]-c[2])*g.ESC);o.userData.semEnquadre=true;return o;};
  if(key==='ducto_toracico'){const r=rede({hit:()=>insp('ducto_toracico'),opac:.25});const c=[0,1.25,-0.03];r.position.copy(P(...c).multiplyScalar(-1));const pai=new T.Group();pai.add(r);pai.scale.setScalar(.9);w.add(pai);
    const d=tubo(DUCTO.map(p=>P(...p).sub(P(...c))),.06,0x5fd0a8,{emissive:0x1c6a4a},40);hitTodos(d,insp('ducto_toracico'));pai.add(d);return w;}
  const BUILD={baco,timo,tonsilas}[key];if(BUILD){registrar();const c=CENTROS_LTR[key];const o=BUILD();o.scale.setScalar(key==='tonsilas'?3:1.6);hitTodos(o,insp(key));w.add(o);
    const viz={baco:['estomago'],timo:['coracao'],tonsilas:['boca']}[key]||[];viz.forEach(k=>{const v=rel(k,c);if(v){v.scale.multiplyScalar(key==='tonsilas'?3:1.6);v.position.multiplyScalar(key==='tonsilas'?3:1.6);w.add(v);}});return w;}
  return M().inspection(key);
}

/* =====================================================================================
   TEGUMENTAR · bloco de pele em corte
   ===================================================================================== */
const COR_PELE={epiderme:0xf2c9a6,corneo:0xf7e3cf,derme:0xe8a39c,hipoderme:0xf6e3a0};
const ALT={epi:.28,derme:1.5,hipo:1.1},LARG=4.2,PROF=2.4;
const Y_EPI=ALT.derme+ALT.hipo+ALT.epi/2,Y_DER=ALT.hipo+ALT.derme/2,Y_HIP=ALT.hipo/2;
/* posição de referência de cada estrutura no bloco (para marcadores da missão) */
const POS_PELE={queratina:V(-1.2,ALT.hipo+ALT.derme+ALT.epi+.04,.5),melanina:V(.4,ALT.hipo+ALT.derme+.04,PROF/2),sudoripara:V(1.3,ALT.hipo+.35,PROF/2),foliculo:V(-.9,ALT.hipo+.55,PROF/2),vasos:V(.2,ALT.hipo+.85,PROF/2),receptores:V(-.2,ALT.hipo+ALT.derme-.3,PROF/2),gordura:V(-1.2,ALT.hipo*.45,PROF/2),amortece:V(1.1,ALT.hipo*.55,PROF/2)};
/* altura dos rótulos da missão (evita sobreposição) */
const LBL_Y={queratina:3.1,melanina:2.72,receptores:2.36,vasos:2.0,foliculo:1.64,sudoripara:1.28,amortece:.86,gordura:.42};
function blocoPele(opt={}){
  const w=new T.Group(),Mo=M();const hit=k=>opt.hit?opt.hit(k):insp(k);const corte=opt.corte!==false;const dest=opt.destaque;
  const op=k=>dest&&dest!==k?{transparent:true,opacity:.22,depthWrite:false}:{};
  const camada=(h,y,cor,k,extra={})=>{const m=new T.Mesh(new T.BoxGeometry(LARG,h,PROF,24,1,12),mat(cor,Object.assign({roughness:.75},extra,op(k))));m.position.y=y;hitTodos(m,hit(k));w.add(m);return m;};
  /* epiderme com camada córnea por cima; relevo suave na superfície */
  const epi=camada(ALT.epi,Y_EPI,COR_PELE.epiderme,'epiderme');
  {const g=epi.geometry,p=g.attributes.position;for(let i=0;i<p.count;i++){if(p.getY(i)>0){p.setY(i,p.getY(i)+Math.sin(p.getX(i)*6)*.025+Math.cos(p.getZ(i)*7)*.02);}}p.needsUpdate=true;g.computeVertexNormals();}
  const corneo=new T.Mesh(new T.BoxGeometry(LARG,.06,PROF),mat(COR_PELE.corneo,Object.assign({roughness:.9},op('epiderme'))));corneo.position.y=Y_EPI+ALT.epi/2+.03;hitTodos(corneo,hit('epiderme'));w.add(corneo);
  if(!corte){/* só a superfície: epiderme sobre uma base escura */const base=new T.Mesh(new T.BoxGeometry(LARG,ALT.derme+ALT.hipo,PROF),mat(0xd9a088,{roughness:.85}));base.position.y=(ALT.derme+ALT.hipo)/2;hitTodos(base,hit('derme'));w.add(base);}
  if(corte){
    camada(ALT.derme,Y_DER,COR_PELE.derme,'derme',{transparent:true,opacity:dest&&dest!=='derme'?.18:.42,depthWrite:false});
    const hip=camada(ALT.hipo,Y_HIP,COR_PELE.hipoderme,'hipoderme',{transparent:true,opacity:dest&&dest!=='hipoderme'?.22:.55,depthWrite:false});
    /* lóbulos de gordura visíveis no corte */
    let s=5;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let i=0;i<46;i++){const l=new T.Mesh(new T.SphereGeometry(.1+rnd()*.06,14,10),mat(0xf0d27a,Object.assign({roughness:.5,emissive:0x3a3008},op('hipoderme'))));l.position.set(-LARG/2+.2+rnd()*(LARG-.4),.14+rnd()*(ALT.hipo-.28),PROF/2-.12-rnd()*1.6);hitTodos(l,hit(dest==='gordura'?'hipoderme':'hipoderme'));w.add(l);}
    /* papilas dérmicas: ondulação logo abaixo da epiderme */
    for(let i=0;i<9;i++){const pa=new T.Mesh(new T.SphereGeometry(.14,12,8,0,Math.PI*2,0,Math.PI/2),mat(0xeeb0a8,Object.assign({roughness:.7},op('derme'))));pa.position.set(-LARG/2+.3+i*.45,ALT.hipo+ALT.derme-.02,PROF/2-.05);hitTodos(pa,hit('derme'));w.add(pa);}
    /* melanina: grânulos escuros na base da epiderme */
    for(let i=0;i<40;i++){const m=new T.Mesh(new T.SphereGeometry(.025,6,5),mat(0x5a3020,Object.assign({roughness:.5},op('melanina'))));m.position.set(-LARG/2+.1+rnd()*(LARG-.2),ALT.hipo+ALT.derme+.03+rnd()*.05,PROF/2-.02-rnd()*.6);hitTodos(m,hit('melanina'));w.add(m);}
    /* vasos: arteríola e vênula na derme, com alças subindo às papilas */
    const art=tubo([V(-LARG/2,ALT.hipo+.85,PROF/2-.3),V(0,ALT.hipo+.8,PROF/2-.35),V(LARG/2,ALT.hipo+.9,PROF/2-.3)],.07,0xe8484f,Object.assign({roughness:.4},op('derme')),40);hitTodos(art,hit('derme'));w.add(art);
    const vei=tubo([V(-LARG/2,ALT.hipo+.65,PROF/2-.6),V(0,ALT.hipo+.6,PROF/2-.62),V(LARG/2,ALT.hipo+.7,PROF/2-.6)],.08,0x4f7fe0,Object.assign({roughness:.4},op('derme')),40);hitTodos(vei,hit('derme'));w.add(vei);
    for(let i=0;i<5;i++){const x=-1.6+i*.8;const al=tubo([V(x,ALT.hipo+.8,PROF/2-.32),V(x+.05,ALT.hipo+ALT.derme-.1,PROF/2-.3),V(x+.15,ALT.hipo+ALT.derme-.12,PROF/2-.45),V(x+.2,ALT.hipo+.62,PROF/2-.6)],.025,0xc04a6a,Object.assign({roughness:.4},op('derme')),24,6);hitTodos(al,hit('derme'));w.add(al);}
    /* glândula sudorípara: novelo + ducto até o poro */
    const nov=[];for(let i=0;i<=60;i++){const a=i/60*Math.PI*8;nov.push(V(1.3+Math.cos(a)*.18,ALT.hipo+.25+i/60*.25,PROF/2-.35+Math.sin(a)*.18));}
    nov.push(V(1.35,ALT.hipo+.9,PROF/2-.35),V(1.4,ALT.hipo+ALT.derme+.1,PROF/2-.35),V(1.42,Y_EPI+ALT.epi/2+.05,PROF/2-.35));
    const sud=tubo(nov,.04,0x9ff3ff,Object.assign({roughness:.3,emissive:0x0f3a40},op('sudoriparas')),160,8);hitTodos(sud,hit('sudoriparas'));w.add(sud);
    /* receptores: fibra nervosa amarela, corpúsculo de Pacini (cebola) e de Meissner perto da superfície */
    const nerv=tubo([V(-LARG/2,ALT.hipo+.3,PROF/2-.5),V(-.6,ALT.hipo+.35,PROF/2-.45),V(-.25,ALT.hipo+ALT.derme-.35,PROF/2-.4)],.035,0xf6e3a0,Object.assign({emissive:0x4a4010},op('receptores_pele')),30,6);hitTodos(nerv,hit('receptores_pele'));w.add(nerv);
    const pac=new T.Group();for(let k=0;k<4;k++){const c=new T.Mesh(new T.SphereGeometry(.09+k*.05,16,12),mat(0xf6e3a0,Object.assign({transparent:true,opacity:.35+k*.1,roughness:.4,depthWrite:false},op('receptores_pele'))));pac.add(c);}pac.scale.set(1,1.5,1);pac.position.set(-1.6,ALT.hipo+.2,PROF/2-.5);hitTodos(pac,hit('receptores_pele'));w.add(pac);
    const mei=elip(.07,.13,.07,0xfff0b0,Object.assign({emissive:0x5a4a10},op('receptores_pele')));mei.position.set(-.25,ALT.hipo+ALT.derme-.25,PROF/2-.4);hitTodos(mei,hit('receptores_pele'));w.add(mei);
  }
  /* pelos com folículo, glândula sebácea e músculo eretor */
  [-0.9,0.5].forEach((x,i)=>{
    const base=V(x,ALT.hipo+.45,PROF/2-.9-i*.3);const topo=V(x+.35,Y_EPI+ALT.epi/2+.9,base.z);
    if(corte){const fol=tubo([base,V(x+.12,ALT.hipo+ALT.derme*.6,base.z),V(x+.22,Y_EPI,base.z)],.11,0xc98a7a,Object.assign({transparent:true,opacity:.55,roughness:.6},op('pelos')),20,10);hitTodos(fol,hit('pelos'));w.add(fol);
      const bulbo=elip(.16,.13,.16,0x8a5a4a,op('pelos'));bulbo.position.copy(base);hitTodos(bulbo,hit('pelos'));w.add(bulbo);
      const seb=new T.Group();for(let k=0;k<4;k++){const b=new T.Mesh(new T.SphereGeometry(.09,12,8),mat(0xf0d08a,Object.assign({roughness:.4,emissive:0x3a3008},op('sebaceas'))));b.position.set(x+.32+(k%2)*.12,ALT.hipo+ALT.derme*.62+(k>>1)*.12,base.z+.05);seb.add(b);}hitTodos(seb,hit('sebaceas'));w.add(seb);
      const ere=tubo([V(x+.2,ALT.hipo+ALT.derme*.45,base.z),V(x+.55,ALT.hipo+ALT.derme*.75,base.z),V(x+.8,ALT.hipo+ALT.derme-.05,base.z)],.03,0xb8343f,op('pelos'),12,6);hitTodos(ere,hit('pelos'));w.add(ere);}
    const fio=tubo([corte?base:V(x+.2,Y_EPI,base.z),V(x+.22,Y_EPI,base.z),topo],.04,0x3a2a22,Object.assign({roughness:.6},op('pelos')),24,6);hitTodos(fio,hit('pelos'));w.add(fio);
  });
  /* poros na superfície */
  const poro=new T.Mesh(new T.RingGeometry(.03,.07,16),new T.MeshBasicMaterial({color:0x8a5a4a,side:T.DoubleSide}));poro.rotation.x=-Math.PI/2;poro.position.set(1.42,Y_EPI+ALT.epi/2+.065,PROF/2-.35);w.add(poro);
  /* escamas da camada córnea soltando */
  const esc=[];for(let i=0;i<6;i++){const e=new T.Mesh(new T.BoxGeometry(.18,.015,.14),mat(0xf7e3cf,Object.assign({roughness:.9},op('epiderme'))));e.position.set(-1.5+i*.3,Y_EPI+ALT.epi/2+.1,.6-i*.2);e.rotation.set(.3,i,.2);e.userData.f=i;hitTodos(e,hit('epiderme'));w.add(e);esc.push(e);}
  if(opt.rotulos!==false&&corte){const R=(t,y,c)=>{const sp=Mo.label(t,c,1.6,62);sp.position.set(-LARG/2-.95,y,PROF/2);w.add(sp);const l=new T.Mesh(new T.BoxGeometry(.3,.015,.015),new T.MeshBasicMaterial({color:new T.Color(c)}));l.position.set(-LARG/2-.18,y,PROF/2);w.add(l);};
    R('Epiderme',Y_EPI,'#ffe3c8');R('Derme',Y_DER,'#ffc8c0');R('Hipoderme',Y_HIP,'#fff0b8');}
  w.position.y=-(ALT.epi+ALT.derme+ALT.hipo)/2;
  w.userData.tick=t=>{esc.forEach(e=>{e.position.y=Y_EPI+ALT.epi/2+.1+((t*.08+e.userData.f*.17)%1)*.6;e.rotation.y=t*.3+e.userData.f;});};
  return w;
}
function pelePeca(opt){const b=blocoPele(opt);const w=new T.Group();w.add(b);return w;}
function tegContexto(level){
  const Mo=M(),w=new T.Group(),g=G();
  if(level===0){const sil=g?g.orgao('silhueta',()=>Mo.silhuetaProc({opacidade:.55}),()=>CTX,{opacidade:.62,aoCarregar:(inst,meshes)=>{Object.values(meshes).forEach(m=>{m.material.color.setHex(0xf2c9a6);m.material.emissive=new T.Color(0x3a2214);});}}):Mo.silhuetaProc({opacidade:.55});sil.userData.semEnquadre=false;hitTodos(sil,CTX);w.add(sil);
    Mo.textAt(w,'A PELE · 2 m² · 4 kg · O MAIOR ÓRGÃO',0,-7.9,0,6.2,'#f2c9a6');return w;}
  const b=pelePeca({corte:level===2,hit:()=>CTX});b.scale.setScalar(1.15);if(level===1)b.rotation.x=.55;w.add(b);
  Mo.textFixo(w,level===1?'UM PEDAÇO DE PELE, AMPLIADO':'A PELE EM CORTE · TRÊS CAMADAS',0,2.75,0,5.0,'#f2c9a6');return w;
}
function tegExplorar(){const w=new T.Group();const b=pelePeca({});b.scale.setScalar(1.15);w.add(b);return w;}
function tegDesafio(){const w=new T.Group();const b=pelePeca({hit:()=>null,rotulos:false});b.scale.setScalar(1.15);w.add(b);return w;}
/* missão Camadas: bloco + marcadores nas estruturas já colocadas */
function camadas(state){
  const Mo=M(),w=new T.Group();const b=blocoPele({rotulos:true});const pai=new T.Group();pai.add(b);pai.scale.setScalar(1.15);w.add(pai);
  D.camadas.itens.forEach(it=>{const r=state.feitos[it.id];if(r!==it.camada)return;const p=POS_PELE[it.id].clone().add(b.position);
    const m=new T.Mesh(new T.SphereGeometry(.09,16,12),new T.MeshBasicMaterial({color:0x3ddc84}));m.position.copy(p);pai.add(m);
    const ly=LBL_Y[it.id]+b.position.y;const sp=Mo.rotuloFixo('✓ '+it.nome,'#c8ffd9',2.0,58);sp.position.set(LARG/2+1.3,ly,p.z);pai.add(sp);
    const l=tubo([p,V(LARG/2+.05,ly,p.z),V(LARG/2+.25,ly,p.z)],.012,0x3ddc84,{emissive:0x1b6b3a},8,4);pai.add(l);});
  return w;
}
function unhaDedo(){const w=new T.Group();
  const dedo=new T.Mesh(T.CapsuleGeometry?new T.CapsuleGeometry(.55,2.2,8,24):new T.CylinderGeometry(.55,.55,2.6,24),mat(0xf2c9a6,{roughness:.6}));dedo.rotation.z=Math.PI/2;dedo.scale.set(1,1,.85);hitTodos(dedo,insp('unhas'));w.add(dedo);
  const unha=elip(.62,.07,.4,0xf8e8e0,{roughness:.2,metalness:.05});unha.position.set(.95,.5,0);unha.rotation.z=-.08;hitTodos(unha,insp('unhas'));w.add(unha);
  const borda=elip(.1,.05,.38,0xffffff,{roughness:.3});borda.position.set(1.55,.47,0);hitTodos(borda,insp('unhas'));w.add(borda);
  const lun=elip(.16,.05,.22,0xffffff,{roughness:.4});lun.position.set(.42,.555,0);hitTodos(lun,insp('unhas'));w.add(lun);
  const cut=elip(.12,.06,.42,0xe8b090,{roughness:.6});cut.position.set(.3,.52,0);w.add(cut);
  const matriz=elip(.18,.06,.36,0xd98a8a,{emissive:0x3a1010,transparent:true,opacity:.75});matriz.position.set(.18,.38,0);hitTodos(matriz,insp('unhas'));w.add(matriz);
  label(w,'Lâmina (queratina)',V(1.3,1.05,0),'#ffffff',1.9);label(w,'Lúnula',V(.35,1.0,0),'#ffffff',1.0);label(w,'Matriz: onde a unha nasce',V(-.6,-.85,0),'#ffd0d0',2.4);
  w.rotation.x=.75;w.rotation.y=-.3;return w;}
function tegInspection(key){const w=new T.Group();
  if(key==='unhas'){const u=unhaDedo();u.scale.setScalar(1.2);w.add(u);return w;}
  const mapa={epiderme:'epiderme',derme:'derme',hipoderme:'hipoderme',pelos:'pelos',sudoriparas:'sudoriparas',sebaceas:'sebaceas',melanina:'melanina',receptores_pele:'receptores_pele'};
  const b=blocoPele({destaque:mapa[key],rotulos:false});b.scale.setScalar(.85);w.add(b);return w;}

/* =====================================================================================
   REPRODUTOR · pranchas esquemáticas (vista de atlas, órgãos internos)
   ===================================================================================== */
function torno(perfil,cor,extra,seg=40){const pts=perfil.map(([r,y])=>new T.Vector2(r,y));return new T.Mesh(new T.LatheGeometry(pts,seg),mat(cor,extra));}
function pranchaFeminina(opt={}){
  const w=new T.Group();const hit=k=>opt.hit?opt.hit(k):insp(k);const op=k=>opt.destaque&&opt.destaque!==k?{transparent:true,opacity:.2,depthWrite:false}:{};
  /* útero (pera invertida) com colo */
  const ut=torno([[0,-1.05],[.22,-1.0],[.28,-.8],[.36,-.45],[.62,0],[.78,.45],[.74,.75],[.5,.95],[0,1.0]],0xd97a9a,Object.assign({roughness:.5,emissive:0x2a0a14},op('utero')));ut.scale.z=.62;M().organico(ut,.02,3,2);hitTodos(ut,hit('utero'));w.add(ut);
  const cav=new T.Mesh(new T.ConeGeometry(.32,.9,3),mat(0x8a2a4a,Object.assign({roughness:.6},op('utero'))));cav.rotation.x=Math.PI;cav.position.set(0,.35,.33);cav.scale.z=.15;hitTodos(cav,hit('utero'));w.add(cav);
  /* canal vaginal */
  const va=torno([[.18,-2.3],[.24,-2.0],[.22,-1.4],[.2,-1.05],[0,-1.0]],0xe8a0b4,Object.assign({roughness:.55,transparent:true,opacity:op('canal_vaginal').opacity??.85},op('canal_vaginal')),24);va.scale.z=.55;hitTodos(va,hit('canal_vaginal'));w.add(va);
  /* tubas uterinas com fímbrias e ovários */
  [-1,1].forEach(s=>{const tb=tubo([V(s*.68,.62,0),V(s*1.15,.85,0),V(s*1.6,.75,0),V(s*1.95,.35,.05),V(s*1.85,0,.15)],.07,0xe6b0d0,Object.assign({roughness:.45},op('tubas_uterinas')),48);hitTodos(tb,hit('tubas_uterinas'));w.add(tb);
    for(let k=0;k<7;k++){const a=k/7*Math.PI*2;const f=new T.Mesh(new T.ConeGeometry(.04,.26,6),mat(0xeec0d8,op('tubas_uterinas')));f.position.set(s*1.85+Math.cos(a)*.12,-.1,.15+Math.sin(a)*.12);f.rotation.set(Math.sin(a)*.6,0,Math.cos(a)*.6+Math.PI);hitTodos(f,hit('tubas_uterinas'));w.add(f);}
    const ov=elip(.32,.2,.18,0xf0a6c8,Object.assign({roughness:.6,emissive:0x2a0a1a},op('ovarios')),[.02,8,s+4]);ov.position.set(s*1.45,-.12,0);ov.rotation.z=s*.35;hitTodos(ov,hit('ovarios'));w.add(ov);
    const lig=tubo([V(s*.62,.15,0),V(s*1.15,-.05,0),V(s*1.25,-.12,0)],.03,0xd9b0c0,Object.assign({transparent:true,opacity:.6},op('ovarios')),12,6);w.add(lig);
    /* folículos no ovário */
    for(let k=0;k<3;k++){const fo=new T.Mesh(new T.SphereGeometry(.05,10,8),mat(0xfff0f6,Object.assign({emissive:0x3a2a30},op('ovarios'))));fo.position.set(s*(1.38+k*.08),-.08+(k%2)*.07,.17);hitTodos(fo,hit('ovarios'));w.add(fo);}
  });
  const ovulo=new T.Mesh(new T.SphereGeometry(.06,12,10),new T.MeshBasicMaterial({color:0xfff6c8}));w.add(ovulo);
  const cam=new T.CatmullRomCurve3([V(1.6,-.08,.18),V(1.85,0,.15),V(1.95,.35,.05),V(1.6,.75,0),V(1.15,.85,0),V(.68,.62,0)]);
  if(opt.rotulos!==false){const L=(t,p)=>label(w,t,p,'#ffe0ee',1.6);L('Útero',V(0,1.3,.4));L('Ovário',V(1.55,-.62,.3));L('Tuba uterina',V(1.25,1.25,.2));L('Canal vaginal',V(.95,-1.9,.3));}
  w.userData.tick=t=>{const u=(t*.07)%1;cam.getPointAt(u,ovulo.position);};
  return w;
}
function pranchaMasculina(opt={}){
  const w=new T.Group();const hit=k=>opt.hit?opt.hit(k):insp(k);const op=k=>opt.destaque&&opt.destaque!==k?{transparent:true,opacity:.2,depthWrite:false}:{};
  /* bexiga de referência (sem ficha aqui) */
  const bx=elip(.72,.6,.6,0xe9c27a,{transparent:true,opacity:.28,depthWrite:false,roughness:.4});bx.position.set(0,.95,0);w.add(bx);
  /* próstata abraçando a uretra */
  const pr=elip(.36,.3,.3,0xd9b48a,Object.assign({roughness:.55,emissive:0x2a1a08},op('prostata')),[.02,7,2]);pr.position.set(0,.12,0);hitTodos(pr,hit('prostata'));w.add(pr);
  const ur=tubo([V(0,.5,0),V(0,.12,0),V(0,-.35,.05),V(0,-.6,.15)],.05,0xe9c27a,Object.assign({roughness:.4,transparent:true,opacity:.8},op('prostata')),20,8);hitTodos(ur,hit('prostata'));w.add(ur);
  [-1,1].forEach(s=>{
    /* glândulas seminais atrás da bexiga */
    const vs=[];for(let k=0;k<=24;k++){const u=k/24;vs.push(V(s*(.22+u*.55)+Math.sin(u*18)*.04,.35+u*.55,-.55+Math.cos(u*18)*.04));}
    const gs=tubo(vs,.1,0xc9d8a0,Object.assign({roughness:.5},op('vesiculas_seminais')),60,10);hitTodos(gs,hit('vesiculas_seminais'));w.add(gs);
    /* testículo + epidídimo */
    const te=elip(.3,.4,.27,0x9fc5f0,Object.assign({roughness:.5,emissive:0x0a1a2a},op('testiculos')),[.01,6,s]);te.position.set(s*.5,-1.55,.45);hitTodos(te,hit('testiculos'));w.add(te);
    const ep=tubo([V(s*.52,-1.15,.4),V(s*.66,-1.25,.25),V(s*.72,-1.55,.2),V(s*.62,-1.88,.25),V(s*.5,-1.95,.35)],.09,0xb8d4f0,Object.assign({roughness:.5},op('epididimo')),30,10);hitTodos(ep,hit('epididimo'));w.add(ep);
    /* ducto deferente: sobe, contorna a bexiga e desce por trás até a próstata */
    const dd=tubo([V(s*.5,-1.95,.35),V(s*.62,-1.3,.0),V(s*.6,-.4,.3),V(s*.95,.6,.25),V(s*.85,1.3,-.1),V(s*.45,1.0,-.6),V(s*.18,.35,-.35),V(s*.05,.15,-.1)],.045,0xa0c0e8,Object.assign({roughness:.45},op('ducto_deferente')),80,8);hitTodos(dd,hit('ducto_deferente'));w.add(dd);
    if(s>0)w.userData.ducto=dd.userData.curva;
  });
  const esp=[];for(let i=0;i<8;i++){const b=new T.Mesh(new T.SphereGeometry(.035,8,6),new T.MeshBasicMaterial({color:0xe8f4ff}));b.userData.f=i/8;w.add(b);esp.push(b);}
  if(opt.rotulos!==false){const L=(t,p)=>label(w,t,p,'#dcecff',1.6);L('Bexiga',V(0,1.75,.2));L('Glândulas seminais',V(-1.55,.95,-.3));L('Próstata',V(-.95,.05,.3));L('Ducto deferente',V(1.6,.6,.3));L('Epidídimo',V(1.45,-1.25,.3));L('Testículo',V(-1.3,-1.6,.4));}
  w.userData.tick=t=>{esp.forEach(b=>{const u=(t*.05+b.userData.f)%1;if(w.userData.ducto)w.userData.ducto.getPointAt(u,b.position);});};
  return w;
}
function pranchas(opt={}){const w=new T.Group(),Mo=M();
  const f=pranchaFeminina(opt);f.position.set(-2.7,0,0);w.add(f);const m=pranchaMasculina(opt);m.position.set(2.7,0,0);w.add(m);
  if(opt.titulos!==false){Mo.textAt(w,'FEMININO',-2.7,2.3,0,2.4,'#f0a6c8');Mo.textAt(w,'MASCULINO',2.7,2.6,0,2.6,'#9fc5f0');}
  const tf=f.userData.tick,tm=m.userData.tick;w.userData.tick=t=>{if(tf)tf(t);if(tm)tm(t);};return w;}
function pelveReferencia(hit){const w=new T.Group(),Mo=M(),g=G(),e=E();
  w.add(Mo.silhueta({opacidade:.14,nariz:false,enquadrar:true}));
  if(e){const o=e.modelo('esqueleto',{partes:['pelve_e','pelve_d','sacro','lombar'],opacidade:.35});o.position.y=-(g.OY-e.OY)*g.ESC;o.userData.semEnquadre=true;w.add(o);}
  if(g){const b=g.orgao('bexiga',null,null,{opacidade:.3});b.userData.semEnquadre=true;w.add(b);}
  const anel=new T.Mesh(new T.TorusGeometry(1.0,.05,10,64),new T.MeshBasicMaterial({color:0xf0a6c8,transparent:true,opacity:.85}));anel.position.copy(P(0,0.86,0.04));anel.rotation.x=Math.PI/2*.15;w.add(anel);
  const brilho_=new T.Mesh(new T.SphereGeometry(.85,24,16),new T.MeshBasicMaterial({color:0xf0a6c8,transparent:true,opacity:.18,depthWrite:false}));brilho_.position.copy(anel.position);hitTodos(brilho_,hit);w.add(brilho_);
  label(w,'Pelve',anel.position.clone().add(V(1.9,.2,.4)),'#ffe0ee',1.2);
  w.userData.tick=t=>{anel.scale.setScalar(1+Math.sin(t*2.5)*.06);};hitTodos(w.children[0],hit);return w;}
function repContexto(level){const Mo=M(),w=new T.Group();
  if(level===0){w.add(pelveReferencia(CTX));Mo.textAt(w,'SISTEMA REPRODUTOR · NA PELVE',0,-7.9,0,5.6,'#f0a6c8');return w;}
  const p=level===1?pranchaFeminina({hit:()=>CTX}):pranchaMasculina({hit:()=>CTX});p.scale.setScalar(1.25);w.add(p);
  Mo.textAt(w,level===1?'SISTEMA GENITAL FEMININO':'SISTEMA GENITAL MASCULINO',0,-3.4,0,5.0,level===1?'#f0a6c8':'#9fc5f0');
  Mo.textAt(w,'Representação esquemática dos órgãos internos',0,-3.95,0,4.2,'#c9d6e0');return w;}
function repExplorar(){const w=new T.Group();w.add(pranchas());return w;}
function repDesafio(){const w=new T.Group();w.add(pranchas({hit:()=>null,rotulos:false}));return w;}
/* missão Puberdade: tabuleiro + cabeça (hipotálamo e hipófise) ligada às gônadas pelo sangue */
function puberdade(state,cfg){
  const Mo=M(),g=Mo.sequencia(state,cfg),gl=G(),e=E();const n=state.colocados.filter(Boolean).length;
  const cena=new T.Group();cena.position.set(4.7,0,0);g.add(cena);
  const cab=new T.Group();cab.position.set(0,1.9,0);cena.add(cab);
  if(gl){/* cabeça translúcida com o hipotálamo (1,614 m) na origem do grupo */const c=gl.orgao('cabeca',null,null,{opacidade:.12});c.position.set(0,(gl.CENTROS.cabeca[1]-1.614)*gl.ESC,(gl.CENTROS.cabeca[2]-0.0124)*gl.ESC);cab.add(c);}
  const hipot=elip(.12,.09,.1,0xffd27f,{emissive:n>=1?0x8a6010:0x221a08});hipot.position.set(0,.05,.05);cab.add(hipot);
  const hipof=elip(.08,.07,.07,0xe0a0a8,{emissive:n>=2?0x8a2030:0x220a0c});hipof.position.set(0,-.12,.1);cab.add(hipof);
  label(cab,'Hipotálamo',V(-.95,.25,.3),n>=1?'#ffe9a8':'#8fa6b4',1.4);label(cab,'Hipófise',V(.85,-.2,.3),n>=2?'#ffd0d8':'#8fa6b4',1.2);
  const gon=new T.Group();gon.position.set(0,-1.5,0);cena.add(gon);
  const ov=elip(.24,.15,.14,0xf0a6c8,{emissive:n>=4?0x6a2040:0x1a0810});ov.position.set(-.55,0,0);gon.add(ov);
  const te=elip(.2,.27,.18,0x9fc5f0,{emissive:n>=4?0x20406a:0x081018});te.position.set(.55,0,0);gon.add(te);
  label(gon,'Ovários',V(-.6,-.55,.3),n>=4?'#ffe0ee':'#8fa6b4',1.2);label(gon,'Testículos',V(.65,-.6,.3),n>=4?'#dcecff':'#8fa6b4',1.4);
  const via=new T.CatmullRomCurve3([V(0,1.75,.15),V(.35,.9,.25),V(-.25,0,.25),V(.1,-1.2,.2)]);
  const vaso=new T.Mesh(new T.TubeGeometry(via,40,.04,8,false),new T.MeshBasicMaterial({color:0xe8484f,transparent:true,opacity:n>=3?.55:.15}));cena.add(vaso);
  const hs=[];if(n>=3){for(let i=0;i<6;i++){const b=new T.Mesh(new T.SphereGeometry(.06,10,8),new T.MeshBasicMaterial({color:0xffd27f}));b.userData.f=i/6;cena.add(b);hs.push(b);}}
  const sx=[];if(n>=5){for(let i=0;i<8;i++){const b=new T.Mesh(new T.SphereGeometry(.05,8,6),new T.MeshBasicMaterial({color:i%2?0xf0a6c8:0x9fc5f0}));b.userData={f:i/8,a:i*.8};cena.add(b);sx.push(b);}}
  if(n>=6)label(cena,'Mudanças da puberdade',V(0,-2.45,.3),'#fff3e0',2.4);
  g.userData.tick=t=>{hs.forEach(b=>{const u=(t*.18+b.userData.f)%1;via.getPointAt(u,b.position);});sx.forEach(b=>{const u=(t*.2+b.userData.f)%1;b.position.set(Math.cos(b.userData.a)*(.3+u*1.4),-1.5+Math.sin(b.userData.a)*(.3+u*.9),.2);b.material.opacity=1-u;b.material.transparent=true;});
    if(n>=1)pulsar(hipot,1+Math.sin(t*4)*.08);if(n>=2)pulsar(hipof,1+Math.sin(t*4+1)*.08);if(n>=4){pulsar(ov,1+Math.sin(t*3)*.05);pulsar(te,1+Math.sin(t*3+.5)*.05);}};
  return g;
}
function repInspection(key){const w=new T.Group();const fem=D.REP_KEYS.indexOf(key)<4;
  const p=fem?pranchaFeminina({destaque:key,rotulos:false}):pranchaMasculina({destaque:key,rotulos:false});p.scale.setScalar(.95);w.add(p);return w;}

/* ---------- inspeção unificada ---------- */
function inspection(key){
  if(D.LIN_KEYS.includes(key))return linInspection(key);
  if(D.TEG_KEYS.includes(key))return tegInspection(key);
  if(D.REP_KEYS.includes(key))return repInspection(key);
  return M().inspection(key);
}
const ehLtr=k=>!!(D.LTR_NOVAS&&D.LTR_NOVAS.includes(k));
window.LTR_MODELS={linContexto,linExplorar,linDesafio,defesa,linfonodo,rede,tegContexto,tegExplorar,tegDesafio,camadas,blocoPele,repContexto,repExplorar,repDesafio,puberdade,pranchas,pranchaFeminina,pranchaMasculina,inspection,ehLtr,CENTROS_LTR};
})();
