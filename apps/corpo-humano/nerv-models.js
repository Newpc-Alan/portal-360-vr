/* Corpo Humano Imersivo · Módulo 3: Sistema Nervoso · cenas 3D (Three.js r128) sobre as malhas do Z-Anatomy (v4.0)
   Arquivos: encefalo.glb (15 partes: lobos _d/_e, cerebelo, tronco, tálamo, hipotálamo, corpo caloso), medula.glb (medula, cauda_equina),
   nervos.glb (nervos periféricos e cranianos, _d/_e). Usa ESQ_GLTF (mesmo referencial do esqueleto) e ESQ_MODELS (recorte, rótulos, sequência). */
(function(){'use strict';
const T=THREE,D=CORPO_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const G=()=>window.ESQ_GLTF,E=()=>window.ESQ_MODELS;
const CENTRO_ENC=[0,1.632,-0.018];                       /* centro do encéfalo (m) */
const ENC=['lobo_frontal','lobo_parietal','lobo_temporal','lobo_occipital','lobo_limbico','cerebelo','tronco','talamo','hipotalamo','corpo_caloso'];
const MED=['medula','cauda_equina'];
const inspectHit=p=>({type:'inspect',key:G().chave(p)});
const ehEnc=k=>ENC.includes(k),ehMed=k=>MED.includes(k);
const ehNerv=k=>!!(D.NERV_KEYS&&D.NERV_KEYS.includes(k));
/* esmaece todas as partes que não pertencem à chave em destaque */
function destacar(key){return (inst,meshes)=>{Object.entries(meshes).forEach(([p,m])=>{if(G().chave(p)===key)return;/* cada malha já tem material próprio (esq-gltf) */m.material.transparent=true;m.material.opacity=.16;m.material.depthWrite=false;});};}
function nervoso(opt={}){const g=new T.Group();['encefalo','medula','nervos'].forEach(a=>g.add(G().modelo(a,Object.assign({hit:opt.semHit?null:(opt.hit||inspectHit)},opt.opacidade!==undefined?{opacidade:opt.opacidade}:{}))));return g;}

/* ---------- Contexto: corpo inteiro → sistema nervoso central → dentro do encéfalo ---------- */
function contexto(level){
  const M=E(),g=new T.Group();
  if(level===0){g.add(M.silhueta({opacidade:.2,enquadrar:true,hit:()=>({type:'context'})}));g.add(nervoso({hit:()=>({type:'context'})}));M.textAt(g,'SISTEMA NERVOSO',0,-7.9,0,4.4,'#d9a6e0');return g;}
  if(level===1){g.add(M.esqueleto({semHit:true,opacidade:.22}));g.add(G().modelo('encefalo',{hit:()=>({type:'context'})}),G().modelo('medula',{hit:()=>({type:'context'})}));M.textAt(g,'ENCÉFALO E MEDULA · SISTEMA NERVOSO CENTRAL',0,-7.9,0,6.4,'#e7c8f0');return g;}
  g.add(encefaloCena());return g;
}
/* ---------- Encéfalo: cérebro em lobos, cerebelo, tronco e estruturas centrais, com a cabeça em transparência ---------- */
function encefaloCena(){
  const M=E(),g=new T.Group();
  g.add(M.recorte('encefalo',null,{centroM:CENTRO_ENC,hit:inspectHit}));
  const cb=G().modelo('cabeca',{opacidade:.08});cb.position.copy(G().ponto(...CENTRO_ENC).multiplyScalar(-1));cb.userData.semEnquadre=true;g.add(cb);
  M.textAt(g,'ENCÉFALO · aponte em uma região',0,-1.35,0,3.6,'#e7c8f0');
  return g;
}
/* ---------- Medula e nervos: corpo inteiro, nervos em destaque sobre a silhueta ---------- */
function nervosCena(){
  const M=E(),g=new T.Group();
  g.add(M.silhueta({opacidade:.1}));g.add(M.esqueleto({semHit:true,opacidade:.12}));
  g.add(G().modelo('encefalo',{opacidade:.45,hit:inspectHit}),G().modelo('medula',{hit:inspectHit}),G().modelo('nervos',{hit:inspectHit}));
  g.userData.corpoInteiro=true;return g;
}
function desafio(){const M=E(),g=new T.Group();g.add(M.silhueta({opacidade:.08}));g.add(nervoso({semHit:true}));return g;}

/* ---------- Inspeção (ficha): a estrutura em destaque com o seu entorno esmaecido ---------- */
function inspection(key){
  const M=E(),g=G(),w=new T.Group();
  if(ehEnc(key)){const c=g.C.encefalo[key]||g.C.encefalo[key+'_d'];const centro=g.C.encefalo[key]?c:[0,c[1],c[2]];
    w.add(M.recorte('encefalo',null,{centroM:centro,hit:inspectHit,aoCarregar:destacar(key)}));return w;}
  if(ehMed(key)){const c=g.C.medula[key];
    w.add(M.recorte('medula',null,{centroM:c,hit:inspectHit,aoCarregar:destacar(key)}));
    w.add(M.recorte('esqueleto',key==='medula'?['cervical','toracica','lombar']:['lombar','sacro','coccix'],{centroM:c,opacidade:.28,hit:p=>({type:'inspect',key:g.chave(p)})}));return w;}
  const partes=g.C.nervos[key]?[key]:[key+'_d',key+'_e'].filter(p=>g.C.nervos[p]);
  if(!partes.length){w.add(nervoso());return w;}
  const c=g.C.nervos[partes[0]];const centro=partes.length>1?[0,c[1],c[2]]:c;
  w.add(M.recorte('nervos',partes,{centroM:centro,hit:()=>({type:'inspect',key})}));
  if(key==='medula'||/^(plexo_braquial|intercostais|vago)$/.test(key))w.add(M.recorte('medula',null,{centroM:centro,opacidade:.35,hit:inspectHit}));
  /* ossos de referência para o aluno se localizar */
  const OSSOS={ciatico:['pelve_d','femur_d','tibia_d','fibula_d'],femoral:['pelve_d','femur_d','patela_d'],mediano:['umero_d','radio_d','ulna_d','mao_d'],ulnar:['umero_d','radio_d','ulna_d','mao_d'],radial:['umero_d','radio_d','ulna_d','mao_d'],intercostais:['costelas','esterno'],plexo_braquial:['cervical','clavicula_d','escapula_d','umero_d'],vago:['cervical','toracica','costelas'],optico:['cranio'],facial:['cranio','mandibula'],trigemeo:['cranio','mandibula']};
  if(OSSOS[key])w.add(M.recorte('esqueleto',OSSOS[key],{centroM:centro,opacidade:.32,hit:p=>({type:'inspect',key:g.chave(p)})}));
  return w;
}

/* ---------- Arco reflexo: tabuleiro de etapas + perna de referência; concluído, o sinal percorre o caminho ---------- */
const PERNA=[-0.06,0.78,-0.01];
function perna(opt={}){const M=E(),g=G(),w=new T.Group();
  w.add(M.recorte('esqueleto',['lombar','sacro','pelve_d','femur_d','patela_d','tibia_d','fibula_d'],{centroM:PERNA,opacidade:opt.ossos??.3,hit:p=>({type:'inspect',key:g.chave(p)})}));
  w.add(M.recorte('musculos',['quadriceps_d'],{centroM:PERNA,opacidade:.75,hit:()=>({type:'inspect',key:'quadriceps'})}));
  w.add(M.recorte('medula',null,{centroM:PERNA,hit:inspectHit}));
  w.add(M.recorte('nervos',['femoral_d'],{centroM:PERNA,hit:()=>({type:'inspect',key:'femoral'})}));
  return w;}
function reflexo(state,cfg){
  const M=E();if(state.done)return reflexoConcluido(cfg);
  const g=M.sequencia(state,cfg);
  /* troca a referência óssea padrão pela perna com nervo femoral e medula */
  [...g.children].forEach(o=>{if(o.userData.gltf){M.dispose(o);}});
  const ref=perna();ref.position.set(-2.4,.55,0);ref.scale.setScalar(.3);ref.rotation.y=.45;ref.userData.semEnquadre=true;g.add(ref);
  return g;
}
function reflexoConcluido(cfg){
  const M=E(),g=G(),w=new T.Group();const ref=perna({ossos:.35});ref.scale.setScalar(.85);w.add(ref);
  const P=p=>g.ponto(...p).sub(g.ponto(...PERNA)).multiplyScalar(.85);
  /* caminho do sinal (m): pele do joelho → nervo femoral (sensitivo) → medula L3 → nervo femoral (motor) → quadríceps */
  const pts=[[-0.084,0.43,0.06],[-0.07,0.62,0.04],[-0.05,0.86,0.01],[-0.02,1.0,-0.03],[0,1.04,-0.045],[-0.03,0.98,-0.02],[-0.06,0.82,0.02],[-0.096,0.66,0.03]].map(P);
  const curva=new T.CatmullRomCurve3(pts);const tubo=new T.Mesh(new T.TubeGeometry(curva,80,.035,8,false),new T.MeshBasicMaterial({color:0xd9a6e0,transparent:true,opacity:.35}));w.add(tubo);
  const sinal=M.ball(.11,0xfff3a0,null,{emissive:0xffd36b,emissiveIntensity:1.2});w.add(sinal);
  [['1 · Receptor na pele',pts[0],1.3],['2 · Neurônio sensitivo',pts[2],1.5],['3 · Medula espinhal',pts[4],1.4],['4 · Neurônio motor',pts[6],-1.5],['5 · Músculo responde',pts[7],-1.6]].forEach(([t,p,dx])=>{const sp=M.label(t,'#ffffff',1.7,62);sp.position.copy(p).add(V(dx,.12,.3));w.add(sp);});
  M.textAt(w,'ARCO REFLEXO · o sinal vai e volta sem passar pelo cérebro',0,3.3,0,6.2,cfg.cor);
  w.userData.tick=t=>{const k=(t*.22)%1;curva.getPointAt(k,sinal.position);sinal.scale.setScalar(1+Math.sin(t*9)*.12);};
  return w;
}
window.NERV_MODELS={contexto,encefaloCena,nervosCena,desafio,inspection,reflexo,reflexoConcluido,ehEnc,ehMed,ehNerv,ENC,MED};
})();
