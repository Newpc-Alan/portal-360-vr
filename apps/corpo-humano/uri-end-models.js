/* Corpo Humano Imersivo · Módulos 5 e 6: Urinário e Endócrino · cenas 3D (Three.js r128) (v4.3)
   Modelos Z-Anatomy: rins (rim_d/e, pelve_renal_d/e), ureteres, bexiga (+uretra), adrenais, tireoide (+paratireoides), hipofise, pineal,
   mais pâncreas (módulo digestório) e hipotálamo (encefalo.glb, referencial do esqueleto, deslocado para o do tórax).
   O néfron é procedural (não existe no atlas nessa escala): glomérulo, cápsula, túbulo com alça e ducto coletor, com partículas. */
(function(){'use strict';
const T=THREE,D=CORPO_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const G=()=>window.CORPO_GLTF,M=()=>window.CORPO_MODELS,E=()=>window.ESQ_GLTF;
const URI=['rins','ureteres','bexiga'],END=['hipofise','pineal','tireoide','adrenais','pancreas'];
const chave=p=>String(p||'').replace(/_[de]$/,'');
const fichaDe=p=>{const c=chave(p);return c==='adrenal'?'adrenais':c;};
const hitInspect=()=>p=>({type:'inspect',key:fichaDe(p)});
const ehUri=k=>!!(D.URI_KEYS&&D.URI_KEYS.includes(k)),ehEnd=k=>!!(D.END_KEYS&&D.END_KEYS.includes(k));
/* hipotálamo: parte do encefalo.glb (referencial do esqueleto, OY 0,95) trazida para o referencial do tórax (OY 1,28) */
const DY=()=>-(G().OY-E().OY)*G().ESC;
function hipotalamo(opt={}){const e=E();if(!e)return new T.Group();const o=e.modelo('encefalo',{partes:['hipotalamo'],hit:opt.semHit?null:()=>({type:'inspect',key:'hipotalamo'}),opacidade:opt.opacidade});o.position.y=DY();o.userData.gltf='hipotalamo';return o;}
function encefaloFantasma(op){const e=E();if(!e)return new T.Group();const o=e.modelo('encefalo',{opacidade:op||.1});o.position.y=DY();o.userData.semEnquadre=true;return o;}
function orgaos(lista,opt={}){const g=G(),w=new T.Group();lista.forEach(k=>{const op=opt.opac?opt.opac(k):undefined;const o=g.orgao(k,null,opt.semHit?null:(opt.hit?opt.hit(k):hitInspect()),op!==undefined?{opacidade:op}:{});if(op!==undefined&&op<.5)o.userData.semEnquadre=true;w.add(o);});return w;}
function glandulas(opt={}){const w=orgaos(END,opt);w.add(hipotalamo(opt.semHit?{semHit:true}:(opt.hit?{hit:opt.hit('hipotalamo')}:{})));return w;}
const silhueta=op=>M().silhueta({opacidade:op??.08,nariz:true,hitsVias:false,viasOpacidade:.3});

/* ---------- Néfron procedural ---------- */
function nefron(opt={}){
  const Mo=M(),w=new T.Group();const hit=opt.hit||{type:'inspect',key:'nefron'};
  const tag=(o)=>{o.traverse(x=>{if(x.isMesh)x.userData.hit=hit;});return o;};
  /* cápsula de Bowman + glomérulo */
  const capsula=new T.Mesh(new T.SphereGeometry(1.0,40,28),Mo.mat(0xcfe9f3,{transparent:true,opacity:.22,roughness:.3,side:T.DoubleSide}));capsula.position.set(-2.2,1.6,0);w.add(tag(capsula));
  const glom=new T.Mesh(new T.TorusKnotGeometry(.42,.09,160,12,3,5),Mo.mat(0xd9434f,{roughness:.45,emissive:0x3a0a10}));glom.position.copy(capsula.position);w.add(tag(glom));
  /* arteríolas */
  const art=(a,b,cor)=>{const c=new T.CatmullRomCurve3([a,b]);const m=new T.Mesh(new T.TubeGeometry(c,8,.08,10,false),Mo.mat(cor,{roughness:.4}));w.add(tag(m));return m;};
  art(V(-4.2,2.3,0),V(-2.9,1.9,0),0xe8484f);art(V(-1.6,2.1,0),V(-.6,2.6,0),0xc03a44);
  /* capilar peritubular: volta do sangue */
  const capPath=new T.CatmullRomCurve3([V(-.6,2.6,0),V(.6,2.4,.5),V(1.4,.6,.5),V(.6,-1.4,.5),V(-.4,-2.2,.5),V(-2.2,-1.6,.6),V(-3.4,.2,.4),V(-4.3,1.2,0)]);
  const cap=new T.Mesh(new T.TubeGeometry(capPath,80,.07,8,false),Mo.mat(0x6f8fe0,{roughness:.4,transparent:true,opacity:.75}));w.add(tag(cap));
  /* túbulo: proximal → alça de Henle → distal → ducto coletor */
  const tubPath=new T.CatmullRomCurve3([V(-1.3,1.2,0),V(-.4,.9,0),V(.5,.4,0),V(.9,-.8,0),V(.9,-2.6,0),V(1.3,-3.1,0),V(1.7,-2.6,0),V(1.7,-.6,0),V(2.0,.6,0),V(2.8,1.0,0),V(3.4,.4,0)]);
  const tub=new T.Mesh(new T.TubeGeometry(tubPath,120,.17,12,false),Mo.mat(0xf6dfa0,{roughness:.5,transparent:true,opacity:.85}));w.add(tag(tub));
  const colPath=new T.CatmullRomCurve3([V(3.4,.4,0),V(3.5,-1.0,0),V(3.5,-3.4,0)]);
  const col=new T.Mesh(new T.TubeGeometry(colPath,24,.22,12,false),Mo.mat(0xe9c27a,{roughness:.5,transparent:true,opacity:.9}));w.add(tag(col));
  const rot=(t,p,wd=1.6,c='#dff3ff')=>{const sp=Mo.label(t,c,wd,60);sp.position.copy(p);w.add(sp);};
  rot('Glomérulo (capilares)',V(-2.2,2.95,0),2.2,'#ffb0b0');rot('Cápsula',V(-3.3,.5,0),1.2);rot('Sangue entra',V(-4.3,2.75,0),1.6,'#ffb0b0');rot('Sangue sai limpo',V(-4.6,.75,0),2.0,'#b9c8ff');
  rot('Túbulo',V(.3,1.35,0),1.2,'#ffe9b3');rot('Alça de Henle',V(1.3,-3.6,0),1.8,'#ffe9b3');rot('Ducto coletor',V(4.6,-.6,0),1.8,'#ffe9b3');rot('URINA',V(3.5,-3.95,0),1.4,'#ffd27f');
  w.userData.caminhos={urina:[tubPath,colPath],sangue:[tubPath,capPath]};
  /* partículas: enviar(cor, destino) coloca 6 bolinhas percorrendo o caminho escolhido */
  const parts=[];
  w.userData.enviar=(cor,destino)=>{for(let i=0;i<6;i++){const b=Mo.ball(.11,cor,V(-2.2,1.6,0),{emissive:new T.Color(cor).multiplyScalar(.45).getHex()});b.userData={destino,f:-i*.07,vel:.11};w.add(b);parts.push(b);}};
  w.userData.tick=t=>{glom.rotation.y=t*.4;glom.rotation.x=Math.sin(t*.5)*.3;parts.forEach(b=>{b.userData.f+=0.0028;let u=b.userData.f;if(u<0){return;}const [a,c]=w.userData.caminhos[b.userData.destino]||w.userData.caminhos.urina;if(u<.5)a.getPointAt(Math.min(1,u*2),b.position);else{const k=Math.min(1,(u-.5)*2);c.getPointAt(k,b.position);if(k>=1)b.visible=((t*4)|0)%2===0;}});};
  w.userData.semGiro=true;
  if(!opt.semBase){const base=new T.Mesh(new T.PlaneGeometry(11,8.6),Mo.mat(0x0b2637,{transparent:true,opacity:.35,roughness:.9}));base.position.set(0,-.3,-.6);w.add(base);}
  return w;
}

/* ---------- Urinário ---------- */
function uriContexto(level){
  const Mo=M(),w=new T.Group();
  if(level===0){w.add(Mo.silhueta({opacidade:.18,nariz:true,hitsVias:false,viasOpacidade:.3,enquadrar:true}));w.add(orgaos(URI,{hit:()=>()=>({type:'context'})}));Mo.textAt(w,'SISTEMA URINÁRIO · A ESTAÇÃO DE TRATAMENTO DO SANGUE',0,-7.9,0,6.6,'#9ff3ff');return w;}
  if(level===1){w.add(silhueta(.06));w.add(orgaos(URI,{hit:()=>()=>({type:'context'})}));{const cs=G().orgao('costelas',null,null,{opacidade:.15});cs.userData.semEnquadre=true;w.add(cs);}
    const g=G(),P=(k,p)=>g.ponto(...g.PARTES_POS[k][p]);
    [['Rim',P('rins','rim_e'),1.5],['Ureter',P('ureteres','ureter_e'),1.4],['Bexiga',P('bexiga','bexiga'),1.5],['Uretra',P('bexiga','uretra'),1.4]].forEach(([t,p,dx])=>{const sp=Mo.label(t,'#dff3ff',1.3,64);sp.position.copy(p).add(V(dx,.1,.5));w.add(sp);});
    Mo.textAt(w,'RINS · URETERES · BEXIGA · URETRA',0,-4.3,0,5.4,'#9ff3ff');return w;}
  w.add(nefron({hit:{type:'context'}}));return w;
}
function uriExplorar(){const w=new T.Group();w.add(silhueta(.07));w.add(orgaos(URI));{const cs=G().orgao('costelas',null,null,{opacidade:.12});cs.userData.semEnquadre=true;w.add(cs);}return w;}
function uriDesafio(){const w=new T.Group();w.add(silhueta(.07));w.add(orgaos(URI,{semHit:true}));return w;}
function filtragem(state){const w=nefron({hit:{type:'inspect',key:'nefron'}});D.filtragem.itens.forEach(it=>{const r=state.feitos[it.id];if(r&&r===it.destino)w.userData.enviar(new T.Color(it.cor).getHex(),it.destino);});return w;}

/* ---------- Endócrino ---------- */
function endContexto(level){
  const Mo=M(),w=new T.Group();
  if(level===0){w.add(Mo.silhueta({opacidade:.18,nariz:true,hitsVias:false,viasOpacidade:.3,enquadrar:true}));w.add(glandulas({hit:()=>()=>({type:'context'})}));Mo.textAt(w,'SISTEMA ENDÓCRINO · MENSAGENS PELO SANGUE',0,-7.9,0,6.4,'#ffd27f');return w;}
  const g=G();
  if(level===1){const c=g.orgao('cabeca',null,null,{opacidade:.12});c.userData.semEnquadre=true;w.add(c);w.add(encefaloFantasma());w.add(orgaos(['hipofise','pineal','tireoide'],{hit:()=>()=>({type:'context'})}));w.add(hipotalamo({hit:()=>({type:'context'})}));
    const P=k=>g.ponto(...g.CENTROS[k]);[['Hipotálamo',g.ponto(0,1.6141,0.0124),-1.5,.25],['Hipófise',P('hipofise'),1.3,-.1],['Pineal',P('pineal'),1.3,.2],['Tireoide',P('tireoide'),1.4,0]].forEach(([t,p,dx,dy])=>{const sp=Mo.label(t,'#fff3d6',1.3,64);sp.position.copy(p).add(V(dx,dy,.4));w.add(sp);});
    Mo.textAt(w,'CABEÇA E PESCOÇO',0,-2.0,0,3.2,'#ffd27f');return w;}
  w.add(orgaos(['rins','estomago'],{semHit:true,opac:()=>.14}));w.add(orgaos(['adrenais','pancreas'],{hit:()=>()=>({type:'context'})}));
  const P=k=>g.ponto(...g.CENTROS[k]);[['Adrenais',P('adrenais'),1.5,.3],['Pâncreas',P('pancreas'),1.6,-.3]].forEach(([t,p,dx,dy])=>{const sp=Mo.label(t,'#fff3d6',1.4,64);sp.position.copy(p).add(V(dx,dy,.5));w.add(sp);});
  Mo.textAt(w,'ABDOME',0,-2.4,0,2.4,'#ffd27f');return w;
}
function endExplorar(){const w=new T.Group();w.add(silhueta(.07));w.add(encefaloFantasma());w.add(glandulas());w.add(orgaos(['rins'],{semHit:true,opac:()=>.12}));return w;}
function endDesafio(){const w=new T.Group();w.add(silhueta(.07));w.add(glandulas({semHit:true}));return w;}
/* alvos do hormônio (referencial do tórax) */
function alvos(nome){const g=G(),p=(x,y,z)=>g.ponto(x,y,z);
  return {coracao:[p(...g.CENTROS.coracao),p(-.2,1.25,0.06),p(.2,1.25,.06)],celulas:[p(0,1.62,0.02),p(-.2,1.25,.05),p(.2,1.0,.05),p(-.09,.65,0),p(.09,.65,0),p(.25,1.1,0)],encefalo:[p(0,1.64,0),p(-.03,1.62,-.05),p(.03,1.62,-.05)],ossos:[p(-.09,.65,-.02),p(.09,.65,-.02),p(-.2,1.25,-.03),p(.2,1.25,-.03),p(0,1.1,-.04)]}[nome]||[p(0,1.25,0)];}
function mensageiros(state){
  const Mo=M(),g=G(),w=new T.Group();w.add(silhueta(.12));w.add(encefaloFantasma());
  const hit=k=>()=>({type:'mens',key:k});
  w.add(orgaos(END,{hit}));w.add(hipotalamo({hit:hit('hipotalamo')}));
  const sit=D.mensageiros[state.i];if(!sit)return w;
  const resolvido=state.resolvidas.includes(sit.id);
  if(resolvido){/* o hormônio viaja da glândula aos alvos */
    const origem=sit.glandula==='hipotalamo'?g.ponto(0,1.6141,0.0124):g.ponto(...g.CENTROS[sit.glandula]);
    const cor=0xffd27f;const bolas=[];
    alvos(sit.alvo).forEach((alvo,i)=>{const meio=origem.clone().lerp(alvo,.5).add(V((i%2?1:-1)*.6,.3,.5));const c=new T.CatmullRomCurve3([origem,meio,alvo]);const tubo=new T.Mesh(new T.TubeGeometry(c,24,.025,6,false),Mo.mat(cor,{transparent:true,opacity:.35,emissive:0x7a5a10}));w.add(tubo);
      const marc=Mo.ball(.14,0x3ddc84,alvo,{emissive:0x1b6b3a,transparent:true,opacity:.85});w.add(marc);
      for(let k=0;k<3;k++){const b=Mo.ball(.09,cor,origem.clone(),{emissive:0xb08030});b.userData={c,f:-k*.3-i*.12};w.add(b);bolas.push(b);}});
    const sp=Mo.label(sit.hormonio+' → '+sit.alvoNome,'#fff3d6',3.2,64);sp.position.copy(origem).add(V(0,.9,.6));w.add(sp);
    w.userData.tick=t=>{bolas.forEach(b=>{b.userData.f+=0.006;const u=b.userData.f;if(u<0){b.visible=false;return;}b.visible=true;b.userData.c.getPointAt(Math.min(1,u%1),b.position);});};
  }else{/* marcador pulsante na região geral, sem entregar a resposta */const anel=new T.Mesh(new T.TorusGeometry(.5,.03,8,40),new T.MeshBasicMaterial({color:0xffd27f,transparent:true,opacity:.5}));anel.position.copy(g.ponto(0,1.25,.1));anel.visible=false;w.add(anel);}
  return w;
}
/* ---------- Inspeção ---------- */
const ARQ={rim:'rins',pelve_renal:'rins',ureter:'ureteres',bexiga:'bexiga',uretra:'bexiga',adrenais:'adrenais',tireoide:'tireoide',paratireoides:'tireoide',hipofise:'hipofise',pineal:'pineal',pancreas:'pancreas'};
function inspection(key){
  const g=G(),w=new T.Group();
  if(key==='nefron'){const n=nefron({semBase:true});n.scale.setScalar(.6);w.add(n);return w;}
  if(key==='hipotalamo'){const e=E();const o=e.modelo('encefalo',{partes:['hipotalamo'],hit:()=>({type:'inspect',key:'hipotalamo'}),centrar:true});w.add(o);const fant=e.modelo('encefalo',{opacidade:.12,centrar:false});fant.position.copy(e.ponto(0,1.6141,0.0124).multiplyScalar(-1));fant.userData.semEnquadre=true;w.add(fant);return w;}
  const arq=ARQ[key];if(!arq)return M().inspection(key);
  const parteDe=p=>fichaDe(p)===key;
  const c=g.CENTROS[arq];
  const o=g.orgao(arq,null,hitInspect(),{aoCarregar:(inst,meshes)=>{Object.entries(meshes).forEach(([p,m])=>{if(parteDe(p))return;m.material.transparent=true;m.material.opacity=.2;m.material.depthWrite=false;});}});o.position.set(0,0,0);w.add(o);
  const viz={rim:['adrenais','ureteres'],pelve_renal:['ureteres'],ureter:['rins','bexiga'],bexiga:['ureteres'],uretra:['ureteres'],adrenais:['rins'],tireoide:['laringe','traqueia'],paratireoides:['laringe'],hipofise:['pineal'],pineal:['hipofise'],pancreas:['estomago','duodeno']}[key]||[];
  viz.forEach(k=>{const ck=g.CENTROS[k];if(!ck)return;const v=g.orgao(k,null,hitInspect(),{opacidade:.16});v.position.set((ck[0]-c[0])*g.ESC,(ck[1]-c[1])*g.ESC,(ck[2]-c[2])*g.ESC);v.userData.semEnquadre=true;w.add(v);});
  if(key==='hipofise'||key==='pineal'){const f=encefaloFantasma(.06);f.position.y+= -c[1]*g.ESC+g.OY*g.ESC;f.position.x-=c[0]*g.ESC;f.position.z-=c[2]*g.ESC;w.add(f);}
  return w;
}
window.URI_END_MODELS={uriContexto,uriExplorar,uriDesafio,filtragem,nefron,endContexto,endExplorar,endDesafio,mensageiros,inspection,ehUri,ehEnd,URI,END};
})();
