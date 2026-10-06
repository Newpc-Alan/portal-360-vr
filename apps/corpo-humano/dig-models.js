/* Corpo Humano Imersivo · Módulo 4: Sistema Digestório · cenas 3D (Three.js r128) sobre as malhas do Z-Anatomy (v4.2)
   Reúne os órgãos já existentes (boca, faringe, esôfago, estômago, fígado, intestinos) com os novos (pâncreas, vesícula + ducto biliar,
   glândulas salivares, duodeno, apêndice). Usa CORPO_GLTF.orgao (posição anatômica) e CORPO_MODELS (rótulos, silhueta, sequência). */
(function(){'use strict';
const T=THREE,D=CORPO_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const G=()=>window.CORPO_GLTF,M=()=>window.CORPO_MODELS;
const TUBO=['boca','faringe','esofago','estomago','duodeno','intestino_delgado','intestino_grosso','apendice'];
const GLANDULAS=['salivares','figado','vesicula','pancreas'];
const TODOS=TUBO.concat(GLANDULAS);
const ehDig=k=>!!(D.DIG_TODAS&&D.DIG_TODAS.includes(k));
/* chave da ficha para cada parte clicada (a língua é parte do modelo da boca) */
const hitDe=(k)=>p=>({type:'inspect',key:(k==='boca'&&p==='lingua')?'lingua':k});
/* o sistema inteiro; opac(k) devolve a opacidade de cada órgão (undefined = normal) */
function sistema(opt={}){
  const g=G(),w=new T.Group();
  TODOS.forEach(k=>{const op=opt.opac?opt.opac(k):undefined;const o=g.orgao(k,null,opt.semHit?null:(opt.hit?opt.hit(k):hitDe(k)),op!==undefined?{opacidade:op}:{});if(op!==undefined&&op<.5)o.userData.semEnquadre=!!opt.enquadrarSoDestaque;w.add(o);});
  return w;
}
function silhueta(op){const s=M().silhueta({opacidade:op??.08,nariz:true});return s;}
/* ---------- Contexto ---------- */
function contexto(level){
  const w=new T.Group(),Mo=M();
  if(level===0){w.add(M().silhueta({opacidade:.18,nariz:true,enquadrar:true}));w.add(sistema({hit:()=>()=>({type:'context'})}));Mo.textAt(w,'SISTEMA DIGESTÓRIO · UM TUBO DE 9 METROS',0,-7.9,0,6.2,'#f6c37a');return w;}
  if(level===1){w.add(silhueta(.06));w.add(sistema({hit:()=>()=>({type:'context'}),opac:k=>GLANDULAS.includes(k)?.12:undefined}));Mo.textAt(w,'TUBO DIGESTÓRIO',0,-3.25,0,3.4,'#f6c37a');return w;}
  w.add(silhueta(.06));w.add(sistema({opac:k=>TUBO.includes(k)?.22:undefined}));
  const g=G(),P=k=>g.ponto(...g.CENTROS[k]);
  [['Glândulas salivares','salivares',1.4,.2],['Fígado','figado',-1.6,.3],['Vesícula biliar','vesicula',-1.7,-.1],['Pâncreas','pancreas',1.6,-.15]].forEach(([t,k,dx,dy])=>{const sp=Mo.label(t,'#fff3d6',1.5,64);sp.position.copy(P(k)).add(V(dx,dy,.5));w.add(sp);});
  Mo.textAt(w,'GLÂNDULAS ANEXAS',0,-3.25,0,3.4,'#f6c37a');return w;
}
/* ---------- Explorar ---------- */
function explorar(){const w=new T.Group();w.add(silhueta(.07));w.add(sistema());return w;}
function desafio(){const w=new T.Group();w.add(silhueta(.07));w.add(sistema({semHit:true}));return w;}
/* ---------- Inspeção: o órgão em destaque, o resto do sistema esmaecido (fora do enquadre) ---------- */
function inspection(key){
  const g=G(),w=new T.Group();
  const arq=key==='lingua'?'boca':key;const c=g.CENTROS[arq];if(!c)return M().inspection(key);
  const off=k=>{const ck=g.CENTROS[k];return V((ck[0]-c[0])*g.ESC,(ck[1]-c[1])*g.ESC,(ck[2]-c[2])*g.ESC);};
  const principal=g.orgao(arq,null,hitDe(arq),key==='lingua'?{aoCarregar:(inst,meshes)=>{Object.entries(meshes).forEach(([p,m])=>{if(p==='lingua')return;m.material.transparent=true;m.material.opacity=.18;m.material.depthWrite=false;});}}:{});principal.position.set(0,0,0);
  w.add(principal);
  const vizinhos={boca:['salivares','faringe'],lingua:['salivares'],salivares:['boca'],faringe:['boca','esofago'],esofago:['faringe','estomago'],estomago:['esofago','duodeno','pancreas'],duodeno:['estomago','pancreas','vesicula'],intestino_delgado:['duodeno','intestino_grosso'],intestino_grosso:['intestino_delgado','apendice'],apendice:['intestino_grosso'],figado:['vesicula','estomago'],vesicula:['figado','duodeno'],pancreas:['duodeno','estomago']}[key]||[];
  vizinhos.forEach(k=>{const o=g.orgao(k,null,hitDe(k),{opacidade:.14});o.position.copy(off(k));o.userData.semEnquadre=true;w.add(o);});
  return w;
}
/* ---------- Jornada do pão: sistema esmaecido, parada em destaque, bolo alimentar pulsando ---------- */
function jornada(state){
  const g=G(),Mo=M(),w=new T.Group();const et=D.jornada[state.etapa]||D.jornada[0];
  const ativos=et.orgao?[et.orgao].concat(et.extras||[]).concat(et.orgao==='esofago'?['faringe']:[]):TODOS;
  w.add(silhueta(.06));
  w.add(sistema({opac:k=>ativos.includes(k)?undefined:.16}));
  if(et.orgao){const c=g.ponto(...g.CENTROS[et.orgao]);
    const bolo=Mo.organico?Mo.organico(Mo.ball(.16,0xffe6a8,c.clone(),{emissive:0xffb347,emissiveIntensity:.9,roughness:.5}),.02,3,5):Mo.ball(.16,0xffe6a8,c.clone(),{emissive:0xffb347});bolo.userData.semEnquadre=true;w.add(bolo);
    const anel=new T.Mesh(new T.TorusGeometry(.3,.02,10,40),new T.MeshBasicMaterial({color:0xffd27f}));anel.position.copy(c);anel.userData.semEnquadre=true;w.add(anel);
    const sp=Mo.label((state.etapa+1)+' · '+et.titulo,'#fff3d6',2.2,70);sp.position.copy(c).add(V(1.3,.35,.6));sp.userData.semEnquadre=true;w.add(sp);
    w.userData.tick=t=>{bolo.scale.setScalar(1+Math.sin(t*4)*.12);anel.rotation.y=t*1.2;anel.rotation.x=Math.PI/2+Math.sin(t*.9)*.35;};
  }else{Mo.textAt(w,'COMIDA → ENERGIA · 24 a 72 horas',0,-3.25,0,5,'#f6c37a');}
  return w;
}
window.DIG_MODELS={contexto,explorar,desafio,inspection,jornada,sistema,ehDig,TUBO,GLANDULAS,TODOS};
})();
