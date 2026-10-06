/* Corpo Humano Imersivo v2.0 · modelos 3D procedurais (Three.js r128)
   Estilo "atlas escolar": formas anatômicas reconhecíveis, cores convencionais.
   Cada órgão é um Group com userData.hit = {type:'inspect', key} para apontar/clicar.
   Ponto de troca: se um glTF CC-BY for adotado, basta substituir a função do órgão. */
(function(){'use strict';
const T=THREE,D=CORPO_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const COR={pele:0x8fc3dd,osso:0xe9e4d6,pulmao:0xd37c7c,pulmaoEsc:0xa85c5c,coracao:0xd9434f,coracaoEsc:0xb0323d,veia:0x4f7fe0,arteria:0xe8484f,traqueia:0x9ed6ef,cartilagem:0xd8eef7,diafragma:0xb48ae8,alveolo:0xf3c98b,gasO2:0x9ff3ff,gasCO2:0x9a9ab0};
const mat=(color,extra={})=>new T.MeshStandardMaterial(Object.assign({color,roughness:.5,metalness:.05},extra));
function tag(o,data){o.traverse(x=>{if(x.isMesh)x.userData.hit=data;});o.userData.hit=data;return o;}
function ball(r,color,pos,extra,seg=24){const m=new T.Mesh(new T.SphereGeometry(r,seg,Math.max(10,seg*.7|0)),mat(color,extra));if(pos)m.position.copy(pos);return m;}
function elips(rx,ry,rz,color,pos,extra){const m=ball(1,color,pos,extra,28);m.scale.set(rx,ry,rz);return m;}
/* relevo irregular: desloca vértices ao longo da normal com ruído suave (aspecto orgânico) */
function organico(mesh,amp=.05,freq=3.1,seed=1){const g=mesh.geometry;const pos=g.attributes.position,nor=g.attributes.normal;const v=new T.Vector3(),n=new T.Vector3();
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);n.fromBufferAttribute(nor,i);const d=amp*(Math.sin(v.x*freq+seed)*Math.cos(v.y*freq*1.3+seed*2)+.6*Math.sin(v.z*freq*1.7-seed)*Math.cos(v.x*freq*.7)+.35*Math.sin((v.x+v.y+v.z)*freq*2.3));v.addScaledVector(n,d);pos.setXYZ(i,v.x,v.y,v.z);}
  pos.needsUpdate=true;g.computeVertexNormals();return mesh;}
function tubo(pts,r,color,extra,seg=48){const curve=new T.CatmullRomCurve3(pts);return new T.Mesh(new T.TubeGeometry(curve,seg,r,12,false),mat(color,extra));}
function label(text,color='#e7f6ff',width=1.5,size=56){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.font='600 '+size+'px Segoe UI,Arial';while(ctx.measureText(text).width>490&&size>17){size-=2;ctx.font='600 '+size+'px Segoe UI,Arial';}ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#031220';ctx.shadowBlur=7;ctx.fillStyle=color;ctx.fillText(text,256,64);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.minFilter=T.LinearMipmapLinearFilter;tx.generateMipmaps=true;tx.anisotropy=8;const sp=new T.Sprite(new T.SpriteMaterial({toneMapped:false,map:tx,transparent:true,depthWrite:false,depthTest:true}));sp.scale.set(width,width/4,1);return sp;}
function textAt(g,text,x,y,z=0,width=1.5,color){const sp=label(text,color,width);sp.position.set(x,y,z);g.add(sp);return sp;}
/* v4.7.1 · rótulo fixo no mundo (plano, não sprite): no VR as letras dos tabuleiros não giram com a cabeça */
function rotuloFixo(text,color='#e7f6ff',width=1.5,size=56){const sp=label(text,color,width,size);const m=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:sp.material.map,transparent:true,depthWrite:false,side:T.DoubleSide}));sp.material.dispose();return m;}
function textFixo(g,text,x,y,z=0,width=1.5,color){const m=rotuloFixo(text,color,width);m.position.set(x,y,z);g.add(m);return m;}

/* ---------- Órgãos ---------- */
function coracao(opt={}){
  const g=new T.Group();
  // ventrículos: massa principal inclinada, ponta para baixo-esquerda do paciente (direita de quem olha)
  const vent=organico(elips(.56,.72,.5,COR.coracao,V(0,-.1,0)),.035,2.4,5);vent.rotation.z=-.35;vent.rotation.x=.15;g.add(vent);
  const sulco=tubo([V(-.1,.45,.45),V(.05,.1,.52),V(.22,-.3,.42),V(.3,-.62,.2)],.025,COR.coracaoEsc);g.add(sulco);
  // átrios: duas bolsas atrás e acima
  const atD=organico(elips(.33,.3,.3,COR.coracaoEsc,V(-.38,.48,-.08)),.03,3,2);g.add(atD);
  const atE=organico(elips(.3,.27,.28,COR.coracaoEsc,V(.3,.5,-.18)),.03,3,4);g.add(atE);
  // aorta: sobe do ventrículo esquerdo e faz o arco
  const aorta=tubo([V(.12,.35,.05),V(.15,.95,.05),V(.05,1.25,-.05),V(-.3,1.25,-.15),V(-.42,.9,-.25),V(-.4,.3,-.3)],.11,COR.arteria);g.add(aorta);
  for(const dx of [-.22,-.05,.12]){g.add(tubo([V(dx,1.2,-.1),V(dx-.05,1.55,-.12)],.05,COR.arteria));}
  // tronco pulmonar: sai do ventrículo direito, azul, cruza à frente da aorta
  const pulm=tubo([V(-.22,.3,.3),V(-.15,.75,.3),V(0,.95,.25)],.1,COR.veia);g.add(pulm);
  g.add(tubo([V(0,.95,.25),V(.35,.95,.1)],.07,COR.veia),tubo([V(0,.95,.25),V(-.35,.95,.1)],.07,COR.veia));
  // veias cavas (superior e inferior) no átrio direito
  g.add(tubo([V(-.5,.7,-.1),V(-.52,1.3,-.1)],.09,COR.veia),tubo([V(-.5,.25,-.08),V(-.55,-.35,-.1)],.09,COR.veia));
  // veias pulmonares no átrio esquerdo
  g.add(tubo([V(.45,.5,-.2),V(.85,.55,-.25)],.055,COR.arteria),tubo([V(.45,.4,-.2),V(.85,.3,-.3)],.055,COR.arteria));
  // artérias coronárias
  g.add(tubo([V(.2,.4,.4),V(.35,.05,.45),V(.3,-.35,.35)],.02,COR.arteria),tubo([V(-.15,.35,.42),V(-.35,0,.4),V(-.3,-.35,.25)],.02,COR.arteria));
  tag(g,{type:'inspect',key:'coracao'});
  if(opt.cavidades){
    const marc=(key,pos,txt)=>{const m=ball(.09,0xffffff,pos,{emissive:0x335566});tag(m,{type:'inspect',key});g.add(m);const sp=label(txt,'#ffffff',1.1,60);sp.position.copy(pos).add(V(0,.17,.12));g.add(sp);};
    marc('atrioD',V(-.38,.5,.25),'Átrio direito');marc('atrioE',V(.3,.52,.15),'Átrio esquerdo');marc('ventD',V(-.28,-.1,.5),'Ventrículo direito');marc('ventE',V(.3,-.25,.45),'Ventrículo esquerdo');marc('aorta',V(-.15,1.3,.05),'Aorta');
  }
  g.userData.bate=true;return g;
}
function pulmao(lado){ // lado: -1 esquerdo (do paciente, fica à direita de quem olha), +1 direito
  const g=new T.Group();const s=lado;
  const sup=organico(elips(.52,.78,.46,COR.pulmao,V(0,.45,0)),.045,2.6,lado);g.add(sup);
  const inf=organico(elips(.6,.7,.52,COR.pulmao,V(s*.04,-.45,.02)),.045,2.9,lado+3);g.add(inf);
  if(lado>0){const med=organico(elips(.58,.5,.5,COR.pulmao,V(s*.02,0,.05)),.04,3.2,7);g.add(med);} // lobo médio só no direito
  // fissuras (linhas escuras) sugerindo os lobos
  g.add(tubo([V(-s*.4,.2,.4),V(0,-.05,.5),V(s*.5,-.3,.3)],.015,COR.pulmaoEsc));
  if(lado>0)g.add(tubo([V(-s*.3,.55,.35),V(s*.2,.35,.48),V(s*.5,.2,.3)],.015,COR.pulmaoEsc));
  // concavidade cardíaca no esquerdo: leve achatamento
  if(lado<0){g.scale.set(.92,1,1);}
  tag(g,{type:'inspect',key:'pulmoes'});return g;
}
function traqueia(){
  const g=new T.Group();
  const tr=new T.Mesh(new T.CylinderGeometry(.13,.14,1.25,20),mat(COR.traqueia,{roughness:.35}));tr.position.y=.6;g.add(tr);
  for(let i=0;i<9;i++){const an=new T.Mesh(new T.TorusGeometry(.145,.025,8,20,Math.PI*1.6),mat(COR.cartilagem));an.rotation.x=Math.PI/2;an.rotation.z=Math.PI*.2;an.position.y=.1+i*.125;g.add(an);}
  tag(g,{type:'inspect',key:'traqueia'});
  // laringe no topo
  const lar=new T.Mesh(new T.CylinderGeometry(.19,.14,.3,16),mat(COR.cartilagem));lar.position.y=1.35;tag(lar,{type:'inspect',key:'laringe'});g.add(lar);
  const pomo=ball(.09,COR.cartilagem,V(0,1.38,.15));tag(pomo,{type:'inspect',key:'laringe'});g.add(pomo);
  return g;
}
function bronquios(){
  const g=new T.Group();
  const ramo=(a,b,r)=>{const t=tubo([a,a.clone().lerp(b,.5),b],r,COR.traqueia,{roughness:.4},12);g.add(t);return t;};
  const base=V(0,0,0);
  for(const s of [-1,1]){
    const b1=V(s*.42,-.35,.02);ramo(base,b1,.085);
    const b2a=V(s*.7,-.05,.08),b2b=V(s*.72,-.75,.1),b2c=V(s*.9,-.42,-.05);
    ramo(b1,b2a,.055);ramo(b1,b2b,.055);ramo(b1,b2c,.05);
    for(const p of [b2a,b2b,b2c]){for(let k=0;k<3;k++){const ang=k*2.1+s;const q=p.clone().add(V(s*.18*Math.abs(Math.cos(ang)),.2*Math.sin(ang),.18*Math.cos(ang*1.3)));ramo(p,q,.03);}}
  }
  tag(g,{type:'inspect',key:'bronquios'});return g;
}
function diafragma(){
  const g=new T.Group();
  const cup=new T.Mesh(new T.SphereGeometry(1.3,36,18,0,Math.PI*2,0,Math.PI*.42),mat(COR.diafragma,{side:T.DoubleSide,roughness:.6}));cup.scale.set(1,.55,.78);g.add(cup);
  const borda=new T.Mesh(new T.TorusGeometry(1.26,.035,8,48),mat(0x9f78d6));borda.rotation.x=Math.PI/2;borda.position.y=.08;g.add(borda);
  tag(g,{type:'inspect',key:'diafragma'});return g;
}
function costelas(){
  const g=new T.Group();const m=mat(COR.osso,{roughness:.7,transparent:true,opacity:.55});
  for(let i=0;i<8;i++){const y=1.45-i*.3,r=1.05+Math.sin(i/7*Math.PI)*.35;for(const s of [-1,1]){const arc=new T.Mesh(new T.TorusGeometry(r,.035,8,36,Math.PI*.95),m);arc.rotation.x=Math.PI/2+.12;arc.rotation.z=s>0?-Math.PI*.02:Math.PI*1.02-.08;arc.position.set(0,y,-.15);arc.scale.set(1,.85,1);g.add(arc);}}
  const est=new T.Mesh(new T.BoxGeometry(.18,1.6,.08),m);est.position.set(0,.85,.98);g.add(est);
  const col=new T.Mesh(new T.CylinderGeometry(.09,.09,3.2,10),m);col.position.set(0,.3,-1.1);g.add(col);
  g.userData.ossos=true;return g;
}
function silhuetaProc(opt={}){
  const g=new T.Group();const m=mat(COR.pele,{transparent:true,opacity:opt.opacidade??.13,depthWrite:false,roughness:.3});
  // tronco por revolução
  const perfil=[];const pts=[[0,-3.1],[.55,-3.05],[.78,-2.3],[.9,-1.2],[1.0,-.2],[1.05,.9],[1.0,1.7],[.75,2.1],[.3,2.25],[0,2.3]];
  for(const [x,y] of pts)perfil.push(new T.Vector2(x,y));
  const tronco=new T.Mesh(new T.LatheGeometry(perfil,32),m);tronco.scale.set(1,1,.62);g.add(tronco);
  const pescoco=new T.Mesh(new T.CylinderGeometry(.26,.32,.6,16),m);pescoco.position.y=2.45;g.add(pescoco);
  const cabeca=elips(.5,.62,.55,COR.pele,V(0,3.2,0),{transparent:true,opacity:opt.opacidade??.13,depthWrite:false});g.add(cabeca);
  for(const s of [-1,1]){
    const braco=tubo([V(s*1.0,1.75,0),V(s*1.35,.9,.05),V(s*1.45,-.1,.1),V(s*1.5,-1.0,.15)],.2,COR.pele,{transparent:true,opacity:opt.opacidade??.13,depthWrite:false});g.add(braco);
    const perna=tubo([V(s*.42,-3.0,0),V(s*.45,-4.4,.05),V(s*.47,-5.7,.05)],.27,COR.pele,{transparent:true,opacity:opt.opacidade??.13,depthWrite:false});g.add(perna);
  }
  if(opt.nariz){const nz=ball(.1,0xaad8ef,V(0,3.1,.56),{transparent:true,opacity:.8});tag(nz,{type:'inspect',key:'nariz'});g.add(nz);const fa=new T.Mesh(new T.CylinderGeometry(.1,.1,.55,12),mat(0xaad8ef,{transparent:true,opacity:.7}));fa.position.set(0,2.55,.12);tag(fa,{type:'inspect',key:'faringe'});g.add(fa);}
  return g;
}
/* conjunto do tórax com órgãos (procedural, reserva) */
function toraxProc(opt={}){
  const g=new T.Group();
  if(opt.costelas!==false)g.add(costelas());
  const pE=pulmao(-1),pD=pulmao(1);pE.position.set(.78,.55,-.05);pD.position.set(-.8,.55,-.05);g.add(pE,pD);
  const tr=traqueia();tr.position.set(0,1.0,.05);g.add(tr);
  const br=bronquios();br.position.set(0,1.05,.05);g.add(br);
  const co=coracao({cavidades:!!opt.cavidades});co.scale.setScalar(.72);co.position.set(.18,.25,.42);co.rotation.y=-.2;g.add(co);
  const di=diafragma();di.position.set(0,-.62,-.05);g.add(di);
  g.userData.partes={pulmaoE:pE,pulmaoD:pD,traqueia:tr,bronquios:br,coracao:co,diafragma:di};
  return g;
}

/* ---------- Sistema digestório (Fase 2) ---------- */
function digestivoProc(opt={}){
  const g=new T.Group();const CORD={esof:0xe9a070,estom:0xe08a50,delg:0xf0c07a,grosso:0xc99a6b,figado:0x9e4d40,boca:0xffb3a7};
  const boca=organico(elips(.3,.18,.22,CORD.boca,V(0,3.05,.42)),.02,4,1);tag(boca,{type:'inspect',key:'boca'});g.add(boca);
  const far=new T.Mesh(new T.CylinderGeometry(.11,.11,.5,12),mat(0xaad8ef,{transparent:true,opacity:.75}));far.position.set(0,2.6,.1);tag(far,{type:'inspect',key:'faringe'});g.add(far);
  const esof=tubo([V(0,2.35,.05),V(-.05,1.7,-.15),V(-.1,.9,-.2),V(-.25,.35,-.05)],.09,CORD.esof);tag(esof,{type:'inspect',key:'esofago'});g.add(esof);
  const est=organico(elips(.62,.42,.4,CORD.estom,V(.05,.15,.15)),.035,2.8,9);est.rotation.z=-.5;tag(est,{type:'inspect',key:'estomago'});g.add(est);
  const fig=organico(elips(.75,.38,.45,CORD.figado,V(-.65,.55,.15)),.03,2.5,3);fig.rotation.z=.15;tag(fig,{type:'inspect',key:'figado'});g.add(fig);
  // intestino delgado: tubo serpenteando dentro do abdome
  const pts=[];for(let i=0;i<46;i++){const u=i/45;const y=-.25-u*1.9;pts.push(V(Math.sin(u*Math.PI*7.5)*.62+Math.cos(u*13)*.08,y,Math.cos(u*Math.PI*7.5)*.22+.1));}
  pts.unshift(V(.55,-.1,.2));const delg=tubo(pts,.11,CORD.delg,{roughness:.55},220);tag(delg,{type:'inspect',key:'intestino_delgado'});g.add(delg);
  // intestino grosso: moldura (ascendente, transverso, descendente)
  const gro=tubo([V(.95,-2.3,0),V(1.0,-1.4,-.05),V(1.0,-.55,-.05),V(.6,-.4,-.15),V(-.2,-.4,-.2),V(-.95,-.5,-.1),V(-1.0,-1.4,-.05),V(-.95,-2.2,0),V(-.5,-2.5,.05),V(-.1,-2.75,.05)],.16,CORD.grosso,{roughness:.6},140);tag(gro,{type:'inspect',key:'intestino_grosso'});g.add(gro);
  g.userData.tubo=[V(0,3.05,.42),V(0,2.6,.1),V(0,2.35,.05),V(-.1,.9,-.2),V(-.25,.35,-.05),V(.1,.1,.15),V(.55,-.1,.2),...pts.filter((p,i)=>i%6===0),V(.95,-2.3,0),V(1.0,-.55,-.05),V(-.2,-.4,-.2),V(-1.0,-1.4,-.05),V(-.1,-2.75,.05)];
  return g;
}

/* ---------- Modelos anatômicos reais (Z-Anatomy via CORPO_GLTF), com reserva procedural ---------- */
const G=()=>window.CORPO_GLTF||null;
function silhueta(opt={}){
  const g=G();if(!g)return silhuetaProc(opt);
  const w=new T.Group();const sil=g.orgao('silhueta',()=>silhuetaProc(opt),null,{opacidade:opt.opacidade??.13});sil.userData.semEnquadre=!opt.enquadrar;w.add(sil);
  if(opt.nariz){w.add(g.orgao('nariz',()=>{const nz=ball(.13,0xaad8ef,V(0,0,0),{transparent:true,opacity:.85,emissive:0x1a3a4a});return nz;},()=>({type:'inspect',key:'nariz'})));
    w.add(g.orgao('faringe',null,()=>({type:'inspect',key:'faringe'})));
    w.add(g.orgao('laringe',null,()=>({type:'inspect',key:'laringe'})));}
  return w;
}
function torax(opt={}){
  const g=G();if(!g)return toraxProc(opt);
  const w=new T.Group();const hit=(key,parte)=>{let d={type:'inspect',key};
    if(key==='coracao'&&opt.cavidades&&['atrioD','atrioE','ventD','ventE','aorta'].includes(parte))d={type:'inspect',key:parte};
    if(key==='costelas')d={type:'inspect',key:'torax'};
    return opt.hitFn?opt.hitFn(key,parte,d):d;};
  const partes={};
  if(opt.costelas!==false)partes.costelas=w.add(g.orgao('costelas',()=>costelas(),p=>hit('costelas',p))).children.slice(-1)[0];
  partes.pulmoes=g.orgao('pulmoes',()=>{const q=new T.Group();const a=pulmao(1),b=pulmao(-1);a.position.x=-.8;b.position.x=.8;q.add(a,b);return q;},p=>hit('pulmoes',p));w.add(partes.pulmoes);
  partes.traqueia=g.orgao('traqueia',()=>{const t=traqueia();t.position.y=-.7;return t;},p=>hit('traqueia',p));w.add(partes.traqueia);
  partes.bronquios=g.orgao('bronquios',()=>bronquios(),p=>hit('bronquios',p));w.add(partes.bronquios);
  partes.coracao=g.orgao('coracao',()=>{const c=coracao({cavidades:!!opt.cavidades});c.scale.setScalar(.72);return c;},p=>hit('coracao',p));w.add(partes.coracao);
  partes.diafragma=g.orgao('diafragma',()=>diafragma(),p=>hit('diafragma',p));w.add(partes.diafragma);
  partes.aorta=g.orgao('aorta',null,p=>hit('aorta',p));w.add(partes.aorta);
  w.userData.partes=partes;return w;
}
function digestivo(opt={}){
  const g=G();if(!g)return digestivoProc(opt);
  const w=new T.Group();
  w.add(g.orgao('boca',()=>organico(elips(.42,.22,.3,0xffb3a7,V(0,0,0)),.02,4,1),()=>({type:'inspect',key:'boca'})));
  for(const k of ['faringe','esofago','estomago','figado','intestino_delgado','intestino_grosso'])w.add(g.orgao(k,null,()=>({type:'inspect',key:k})));
  const P=(x,y,z)=>g.ponto(x,y,z);
  w.userData.tubo=[P(0,1.59,.085),P(0,1.53,.04),P(0,1.45,-.005),P(0,1.33,-.01),P(.02,1.22,.0),P(.06,1.17,.04),P(.0,1.12,.04),P(-.03,1.06,.05),P(.04,1.0,.06),P(-.02,.95,.05),P(-.09,.96,.0),P(-.09,1.06,.01),P(0,1.09,.03),P(.09,1.06,.0),P(.09,.93,.0),P(.02,.84,.02)];
  return w;
}
/* ---------- Cenas por atividade ---------- */
function stageBase(g,width=5,y=-3.15,z=0){const m=new T.Mesh(new T.CircleGeometry(width,72),mat(0x0b2637,{roughness:.7,metalness:.12}));m.rotation.x=-Math.PI/2;m.position.set(0,y,z);g.add(m);const rim=new T.Mesh(new T.RingGeometry(width-.016,width+.016,72),new T.MeshBasicMaterial({color:0x305d72,side:T.DoubleSide}));rim.rotation.x=-Math.PI/2;rim.position.set(0,y+.01,z);g.add(rim);}
function contexto(level){
  const g=new T.Group();
  if(level===0){const corpo=new T.Group();corpo.add(silhueta({opacidade:.16,nariz:true,enquadrar:true}),torax({costelas:false,hitFn:()=>({type:'context',target:'torax'})}));corpo.scale.setScalar(.5);corpo.position.y=1.55;g.add(corpo);textAt(g,'CORPO HUMANO',0,-3.95,0,4.0,'#89acbd');textAt(g,'TÓRAX',1.5,1.6,.3,1.2,'#ffe3a8');return g;}
  if(level===1){g.add(torax({hitFn:(key,parte,d)=>({type:'context',target:'orgao',key:d.key})}),silhueta({opacidade:.08}));textAt(g,'DENTRO DO TÓRAX',0,-3.3,0,3.2,'#89acbd');return g;}
  g.add(torax({costelas:false}));return g;
}
function explorar(){const g=new T.Group();const tx=torax({cavidades:false});g.add(tx);g.add(silhueta({opacidade:.07,nariz:true}));g.userData.torax=tx;return g;}
function inspection(key){
  const g=G();
  const centrado=(k,hitFn)=>{const w=new T.Group();if(!g)return null;const o=g.orgao(k,null,hitFn||(()=>({type:'inspect',key:k})));o.position.set(0,0,0);w.add(o);return w;};
  if(g&&(key==='coracao'||['atrioD','atrioE','ventD','ventE','aorta'].includes(key))){const w=centrado('coracao',p=>({type:'inspect',key:['atrioD','atrioE','ventD','ventE','aorta'].includes(p)?p:'coracao'}));
    for(const [p,txt] of [['atrioD','Átrio direito'],['atrioE','Átrio esquerdo'],['ventD','Ventrículo direito'],['ventE','Ventrículo esquerdo'],['aorta','Aorta']]){const pos=g.parteCoracao(p);const sp=label(txt,'#ffffff',.9,64);sp.position.copy(pos).add(V(p==='atrioD'||p==='ventD'?-.55:.55,p==='aorta'?.25:.1,.45));w.add(sp);const m=ball(.045,0xffffff,pos.clone().add(V(0,0,.35)),{emissive:0x335566});tag(m,{type:'inspect',key:p});w.add(m);}
    return w;}
  if(!g){if(key==='coracao')return coracao({cavidades:true});}
  if(key==='pulmoes'){if(!g){const q=new T.Group();const a=pulmao(1),b=pulmao(-1);a.position.x=-.75;b.position.x=.75;q.add(a,b);const br=bronquios();br.position.y=.9;q.add(br);return q;}const w=centrado('pulmoes');const br=g.orgao('bronquios',null,()=>({type:'inspect',key:'bronquios'}));br.position.sub(g.ponto(...g.CENTROS.pulmoes));w.add(br);return w;}
  const fantasma=(w,c)=>{const cb=g.orgao('cabeca',null,null,{opacidade:.16});cb.position.copy(V((g.CENTROS.cabeca[0]-c[0])*g.ESC,(g.CENTROS.cabeca[1]-c[1])*g.ESC,(g.CENTROS.cabeca[2]-c[2])*g.ESC));cb.userData.semEnquadre=true;w.add(cb);};
  const rotulo=(w,txt,pos,dx,dz=.1)=>{const sp=label(txt,'#ffffff',.3,64);sp.position.copy(pos).add(V(dx,.03,dz));w.add(sp);w.add(ball(.012,0xffffff,pos.clone().add(V(0,0,dz*.6)),{emissive:0x335566}));};
  if(key==='laringe'&&g){const w=centrado('laringe');const c=g.CENTROS.laringe,P=(x,y,z)=>V((x-c[0])*g.ESC,(y-c[1])*g.ESC,(z-c[2])*g.ESC);fantasma(w,c);
    for(const [txt,pos,dx] of [['Osso hioide',P(0,1.509,.03),.32],['Epiglote',P(0,1.497,.023),-.3],['Cartilagem tireoide',P(0,1.483,.03),.34],['Cartilagem cricoide',P(0,1.462,.02),-.34]])rotulo(w,txt,pos,dx);
    return w;}
  if(key==='nariz'&&g){const w=centrado('nariz');const c=g.CENTROS.nariz,P=(x,y,z)=>V((x-c[0])*g.ESC,(y-c[1])*g.ESC,(z-c[2])*g.ESC);
    fantasma(w,c);
    {const o=g.orgao('faringe',null,()=>({type:'inspect',key:'faringe'}),{opacidade:.35});o.position.copy(P(...g.CENTROS.faringe));o.userData.semEnquadre=true;w.add(o);}
    for(const [txt,pos,dx] of [['Cartilagens do nariz',P(0,1.58,.105),.34],['Conchas nasais',P(.012,1.565,.06),-.34],['Cavidade nasal',P(0,1.6,.07),.34],['Nasofaringe',P(0,1.571,.028),-.3]])rotulo(w,txt,pos,dx,.3);
    w.rotation.y=Math.PI/2;/* perfil: a cavidade nasal se lê de lado, como no atlas */
    const q=new T.Group();q.add(w);return q;}
  if(key==='boca'&&g){const w=centrado('boca');const c=g.CENTROS.boca,P=(x,y,z)=>V((x-c[0])*g.ESC,(y-c[1])*g.ESC,(z-c[2])*g.ESC);
    fantasma(w,c);
    for(const [txt,pos,dx] of [['Língua',P(0,1.515,.05),.3],['Palato mole',P(0,1.55,.035),-.3],['Úvula',P(0,1.545,.015),.3]])rotulo(w,txt,pos,dx);
    return w;}
  if(key==='traqueia'||key==='laringe')return g?centrado('traqueia',()=>({type:'inspect',key})):traqueia();
  if(key==='bronquios')return g?centrado('bronquios'):(()=>{const q=new T.Group();const br=bronquios();br.scale.setScalar(1.6);q.add(br);return q;})();
  if(key==='diafragma')return g?centrado('diafragma'):diafragma();
  if(key==='alveolos')return alveolo({});
  if(key==='faringe'&&g){const w=centrado('faringe',p=>({type:'inspect',key:'faringe'}));const c=g.CENTROS.faringe,P=(x,y,z)=>V((x-c[0])*g.ESC,(y-c[1])*g.ESC,(z-c[2])*g.ESC);fantasma(w,c);
    for(const k of ['nariz','laringe','boca']){const o=g.orgao(k,null,()=>({type:'inspect',key:k}),{opacidade:.35});o.position.copy(P(...g.CENTROS[k]));o.userData.semEnquadre=true;w.add(o);}
    for(const [txt,pos,dx] of [['Nasofaringe (ar)',P(0,1.571,.028),-.34],['Orofaringe (ar e alimento)',P(0,1.53,.042),-.4],['Laringofaringe',P(0,1.483,.016),-.34]])rotulo(w,txt,pos,dx,.25);
    w.rotation.y=Math.PI/2;const q=new T.Group();q.add(w);return q;}
  if(key==='nariz'||key==='faringe'){const q=new T.Group();const s=silhuetaProc({opacidade:.25,nariz:true});s.scale.setScalar(.8);s.position.y=-2.2;q.add(s);return q;}
  if(key==='sangue'||key==='corpo_celulas'){const q=new T.Group();const pts=[V(-1.6,0,0),V(-.6,.18,.1),V(.5,-.18,-.1),V(1.6,0,0)];const curva=new T.CatmullRomCurve3(pts);
    const parede=new T.Mesh(new T.TubeGeometry(curva,60,.3,20,false),mat(0xe9a6a6,{transparent:true,opacity:.28,roughness:.5,side:T.DoubleSide}));q.add(parede);
    const plasma=new T.Mesh(new T.TubeGeometry(curva,40,.27,16,false),mat(0xffe3c8,{transparent:true,opacity:.1,roughness:1}));q.add(plasma);
    // células endoteliais: ladrilhos achatados na parede
    for(let i=0;i<34;i++){const u=.04+((i*.37)%1)*.92,p=curva.getPointAt(u),tg=curva.getTangentAt(u),ang=i*2.1;const n=new T.Vector3(0,1,0).cross(tg).normalize(),b=tg.clone().cross(n);const pos=p.clone().add(n.clone().multiplyScalar(Math.cos(ang)*.3)).add(b.multiplyScalar(Math.sin(ang)*.3));const cel=elips(.11,.015,.08,0xffc9c9,pos,{transparent:true,opacity:.38,roughness:.6});cel.lookAt(p);cel.rotateX(Math.PI/2);q.add(cel);}
    const hems=[];for(let i=0;i<16;i++){const h=hemacia(.085,i%5===0?0xb43040:0xe0404a);h.userData.f=i/16;h.userData.off=V((Math.random()-.5)*.26,(Math.random()-.5)*.26,0);h.userData.rot=Math.random()*3;q.add(h);hems.push(h);}
    const leuco=organico(ball(.13,0xf4f1ff,V(0,0,0),{roughness:.9}),.03,6,9);leuco.userData.f=.5;q.add(leuco);
    const plaq=[];for(let i=0;i<8;i++){const pl=elips(.045,.015,.035,0xe9d8a6,V(0,0,0),{roughness:.8});pl.userData.f=i/8+.03;pl.userData.off=V((Math.random()-.5)*.3,(Math.random()-.5)*.3,0);q.add(pl);plaq.push(pl);}
    q.userData.tick=(t)=>{const mv=(o,vel)=>{const u=(t*vel+o.userData.f)%1;const p=curva.getPointAt(u),tg=curva.getTangentAt(u);o.position.copy(p).add(o.userData.off||V(0,0,0));o.lookAt(p.clone().add(tg));if(o.userData.rot!==undefined)o.rotateX(o.userData.rot+t*.5);};hems.forEach(h=>mv(h,.07));plaq.forEach(p=>mv(p,.075));mv(leuco,.05);};
    textAt(q,'HEMÁCIAS',-.6,.55,.3,1.2,'#ffb0b0');textAt(q,'LEUCÓCITO',.7,-.55,.3,1.3,'#e8e8ff');textAt(q,'PAREDE DO CAPILAR',0,-.75,.3,2.2,'#ffd9c2');return q;}
  if(['esofago','estomago','intestino_delgado','intestino_grosso','figado'].includes(key)&&g)return centrado(key);
  if(['boca','esofago','estomago','intestino_delgado','intestino_grosso','figado'].includes(key)){const d=digestivoProc();const q=new T.Group();[...d.children].forEach(o=>{if(!(o.userData.hit&&o.userData.hit.key===key))d.remove(o);});const box=new T.Box3().setFromObject(d),c=box.getCenter(new T.Vector3());d.position.copy(c).multiplyScalar(-1);q.add(d);return q;}
  if(key==='torax')return torax();
  const q=new T.Group();q.add(torax({costelas:false}));return q;
}
/* respiração: diafragma e pulmões animados pela abertura (0..1) */
function respire(state){
  const g=new T.Group();const tx=torax({costelas:true,hitFn:(key,parte,d)=>key==='diafragma'?{type:'respirar'}:d});g.add(tx);g.add(silhueta({opacidade:.07,nariz:true}));
  const p=tx.userData.partes;const gl=G();
  const base={pul:p.pulmoes.scale.clone(),di:p.diafragma.position.y,pE:p.pulmaoE?p.pulmaoE.scale.clone():null,pD:p.pulmaoD?p.pulmaoD.scale.clone():null};
  const rota=gl?[gl.ponto(0,1.63,.1),gl.ponto(0,1.53,.035),gl.ponto(0,1.43,0),gl.ponto(0,1.32,0),gl.ponto(.04,1.26,0)]:[V(0,3.1,.6),V(0,2.3,.1),V(0,1.2,.05),V(.4,.6,.05)];
  const curva=new T.CatmullRomCurve3(rota);
  const ar=[];for(let i=0;i<10;i++){const b=ball(.06,COR.gasO2,V(0,0,0),{emissive:0x2f7f8f});b.userData.f=i/10;g.add(b);ar.push(b);}
  g.userData.tick=(t,abertura)=>{const a=abertura;
    if(p.pulmaoE){p.pulmaoE.scale.set(base.pE.x*(1+.18*a),base.pE.y*(1+.22*a),base.pE.z*(1+.15*a));p.pulmaoD.scale.set(base.pD.x*(1+.18*a),base.pD.y*(1+.22*a),base.pD.z*(1+.15*a));}
    else p.pulmoes.scale.set(base.pul.x*(1+.12*a),base.pul.y*(1+.16*a),base.pul.z*(1+.10*a));
    p.diafragma.position.y=base.di-.38*a;p.diafragma.scale.y=1-.4*a;
    ar.forEach(b=>{const dir=state.fase==='inspirando'?1:-1;const u=((t*.3*dir+b.userData.f)%1+1)%1;b.position.copy(curva.getPointAt(u));b.visible=state.fase!=='repouso';});};
  textAt(g,'INSPIRAR: diafragma desce · EXPIRAR: diafragma sobe',0,-3.4,0,5.6,'#9cbed0');
  if(!gl)tag(p.diafragma,{type:'respirar'});
  return g;
}
/* ordenação de etapas (caminho do ar / caminho do sangue) */
function sequencia(state,cfg){
  const g=new T.Group();const n=cfg.ordem.length,dy=.62,top=(n-1)*dy/2+.3;
  textFixo(g,cfg.titulo,.9,top+.75,0,3.4,cfg.cor);
  for(let i=0;i<n;i++){const y=top-i*dy;const key=state.colocados[i];
    const num=rotuloFixo(String(i+1),i===state.target?'#ffdb9f':'#8fb0c2',.5,96);num.position.set(-.55,y,.05);g.add(num);
    const placa=new T.Mesh(new T.BoxGeometry(2.6,.46,.16),mat(key?0x1d4f63:0x15303f,{transparent:!key,opacity:key?1:.65}));placa.position.set(.9,y,0);tag(placa,{type:'seqSlot',index:i});g.add(placa);
    const txt=rotuloFixo(key?cfg.rotulos[key]:'?',key?'#eafaff':'#ffe3a8',2.4,key?72:96);txt.position.set(.9,y,.1);g.add(txt);
    if(i===state.target&&!key){const marc=new T.Mesh(new T.BoxGeometry(2.72,.56,.06),new T.MeshBasicMaterial({color:0xefd094,wireframe:true}));marc.position.set(.9,y,.02);g.add(marc);}
    if(i<n-1){const seta=new T.ArrowHelper(V(0,-1,0),V(.9,y-.25,0),.12,0x6ca7be,.08,.06);g.add(seta);}
  }
  // bandeja de peças (embaralhadas, sem as já colocadas)
  const restantes=state.bandeja.filter(k=>!state.colocados.includes(k));
  restantes.forEach((k,i)=>{const cols=2,c=i%cols,r=Math.floor(i/cols);const x=(cfg.titulo==='CAMINHO DO ALIMENTO'?2.75:-3.75)+c*1.6,y=top-.1-r*.72;
    const peca=new T.Mesh(new T.BoxGeometry(1.48,.56,.2),mat(0x2b6f88,{roughness:.4}));peca.position.set(x,y,.1);peca.userData.draggable=true;tag(peca,{type:'seqPiece',key:k});g.add(peca);
    const t=rotuloFixo(cfg.rotulos[k],'#ffffff',1.46,66);t.position.set(x,y,.22);g.add(t);
    if(state.selected===k){const anel=new T.Mesh(new T.BoxGeometry(1.6,.68,.08),new T.MeshBasicMaterial({color:0xffffff,wireframe:true}));anel.position.set(x,y,.1);g.add(anel);}
  });
  if(!state.done)textFixo(g,'PEÇAS',cfg.titulo==='CAMINHO DO ALIMENTO'?3.55:-2.95,top+.75,0,1.4,'#9cbed0');
  const gl=G();
  if(state.done&&cfg.titulo==='CAMINHO DO SANGUE'){
    let pts;const base=V(-2.9,-.2,0),esc=1.15;
    if(gl){const co=gl.orgao('coracao',()=>coracao({cavidades:true}),p=>({type:'inspect',key:['atrioD','atrioE','ventD','ventE','aorta'].includes(p)?p:'coracao'}));co.position.copy(base);co.scale.setScalar(esc);g.add(co);
      const pc=p=>gl.parteCoracao(p).multiplyScalar(esc).add(base);
      pts=[pc('cavas').add(V(0,-.6,0)),pc('cavas'),pc('atrioD'),pc('ventD'),pc('pulmonar'),pc('pulmonar').add(V(-.9,.35,.1)),pc('pulmonar').add(V(-1.3,-.1,.1)),pc('veiasPulm').add(V(-.9,-.2,0)),pc('veiasPulm'),pc('atrioE'),pc('ventE'),pc('aorta').add(V(.1,-.2,.1)),pc('aorta'),pc('aorta').add(V(-.1,.7,0)),pc('aorta').add(V(-.4,1.1,0))];}
    else{const co=coracao({cavidades:true});co.scale.setScalar(esc);co.position.copy(base);g.add(co);
      pts=[V(-.55,1.3,-.1),V(-.5,.75,-.08),V(-.38,.48,.1),V(-.28,-.1,.45),V(-.2,.5,.35),V(-.05,.95,.25),V(.4,1.0,.1),V(.95,.55,-.2),V(.45,.5,-.1),V(.3,.52,.15),V(.3,-.25,.4),V(.15,.35,.1),V(.15,.95,.05),V(.05,1.25,-.05),V(-.3,1.25,-.15),V(-.42,.9,-.25)].map(p=>p.clone().multiplyScalar(esc).add(base));}
    const curva=new T.CatmullRomCurve3(pts);const gotas=[];for(let i=0;i<10;i++){const d=ball(.07,COR.veia,V(),{emissive:0x223355});d.userData.f=i/10;g.add(d);gotas.push(d);}
    textFixo(g,'SIGA A GOTA',-2.9,1.75,0,2.2,'#ffb0b0');
    g.userData.tick=(t)=>{gotas.forEach(d=>{const u=(t*.07+d.userData.f)%1;d.position.copy(curva.getPointAt(u));const rico=u>.47&&u<.98;d.material.color.setHex(rico?COR.arteria:COR.veia);d.material.emissive.setHex(rico?0x552222:0x223355);});};
  }
  if(cfg.titulo==='CAMINHO DO ALIMENTO'){
    const esc=gl?.68:.78,base=gl?V(-2.9,.1,0):V(-2.9,-.1,0);
    const d=digestivo();d.scale.setScalar(esc);d.position.copy(base);g.add(d);const si=silhueta({opacidade:.08,nariz:false});si.scale.setScalar(esc);si.position.copy(base);g.add(si);
    if(state.done){const curva=new T.CatmullRomCurve3(d.userData.tubo.map(p=>p.clone().multiplyScalar(esc).add(base)));const bolos=[];for(let i=0;i<8;i++){const b=ball(.07,0xffe08a,V(),{emissive:0x553d10});b.userData.f=i/8;g.add(b);bolos.push(b);}
      textFixo(g,'SIGA O ALIMENTO',-2.9,2.75,0,2.6,'#ffe08a');g.userData.tick=(t)=>{bolos.forEach(b=>{const u=(t*.05+b.userData.f)%1;b.position.copy(curva.getPointAt(u));});};}
  }
  if(state.done&&cfg.titulo==='CAMINHO DO AR'){
    const esc=gl?.9:.95,base=gl?V(-2.9,-.1,0):V(-2.9,-.6,0);
    const tx=torax({costelas:false});tx.scale.setScalar(esc);tx.position.copy(base);g.add(tx);const si=silhueta({opacidade:.1,nariz:true});si.scale.setScalar(esc);si.position.copy(base);g.add(si);
    const P=gl?((x,y,z)=>gl.ponto(x,y,z).multiplyScalar(esc).add(base)):((x,y,z)=>V(x*esc,y*esc,z*esc).add(base));
    const rotas=gl?[[P(0,1.605,.095),P(0,1.53,.035),P(0,1.43,0),P(0,1.33,0),P(-.035,1.30,0),P(-.07,1.26,.0),P(-.08,1.21,.01)],[P(0,1.605,.095),P(0,1.53,.035),P(0,1.43,0),P(0,1.33,0),P(.035,1.30,0),P(.07,1.26,0),P(.08,1.21,.01)]]
      :[[P(0,3.1,.56),P(0,2.6,.15),P(0,2.3,.05),P(0,1.6,.05),P(0,1.05,.05),P(-.42,.7,.07),P(-.8,.4,0),P(-.85,-.1,.02)],[P(0,3.1,.56),P(0,2.6,.15),P(0,2.3,.05),P(0,1.6,.05),P(0,1.05,.05),P(.42,.7,.07),P(.78,.4,0),P(.82,-.1,.02)]];
    const parts=[];rotas.forEach((r,k)=>{const c=new T.CatmullRomCurve3(r);for(let i=0;i<7;i++){const d=ball(.055,COR.gasO2,V(),{emissive:0x2f7f8f});d.userData.f=i/7;d.userData.c=c;g.add(d);parts.push(d);}});
    textFixo(g,'O AR ENTRA',-2.9,2.6,0,2.0,'#c9f7ff');
    g.userData.tick=(t)=>{parts.forEach(d=>{const u=(t*.12+d.userData.f)%1;d.position.copy(d.userData.c.getPointAt(u));});};
  }
  g.userData.slots={top,dy};
  return g;
}
/* alvéolo com capilar e gases */
/* ---------- microescala: hemácia, capilares e alvéolo ---------- */
function hemacia(R=.07,cor=0xd83a3a){const pts=[[0,-.05],[.3,-.075],[.55,-.1],[.75,-.14],[.9,-.1],[1,0],[.9,.1],[.75,.14],[.55,.1],[.3,.075],[0,.05]].map(([x,y])=>new T.Vector2(x*R,y*R*1.4));
  const m=new T.Mesh(new T.LatheGeometry(pts,28),mat(cor,{roughness:.45,metalness:.05}));m.geometry.computeVertexNormals();return m;}
/* tubo com cor variando ao longo (azul → vermelho) */
function tuboGrad(pts,r,corA,corB,opacity=.95,seg=60){const curve=new T.CatmullRomCurve3(pts);const geo=new T.TubeGeometry(curve,seg,r,10,false);const n=geo.attributes.position.count,col=new Float32Array(n*3),a=new T.Color(corA),b=new T.Color(corB),c=new T.Color();
  for(let i=0;i<n;i++){const u=Math.floor(i/11)/seg;c.copy(a).lerp(b,Math.min(1,Math.max(0,(u-.3)/.45)));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  geo.setAttribute('color',new T.BufferAttribute(col,3));const m=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.05,transparent:opacity<1,opacity}));m.userData.curva=curve;return m;}
/* rede capilar abraçando uma esfera (centro c, raio R) */
function redeCapilar(c,R,n,seed){let s=seed;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};const g=new T.Group();
  for(let k=0;k<n;k++){const ax=new T.Vector3(rnd()-.5,rnd()-.5,rnd()-.5).normalize();const u=new T.Vector3(1,0,0).cross(ax);if(u.lengthSq()<.01)u.set(0,0,1).cross(ax);u.normalize();const v=ax.clone().cross(u);const t0=rnd()*Math.PI*2,arc=Math.PI*(.9+rnd()*.7),pts=[];
    for(let i=0;i<=14;i++){const th=t0+i/14*arc,rr=R*(1.03+.04*Math.sin(i*1.7+k));pts.push(c.clone().add(u.clone().multiplyScalar(Math.cos(th)*rr)).add(v.clone().multiplyScalar(Math.sin(th)*rr)));}
    g.add(tuboGrad(pts,.022+rnd()*.012,COR.veia,COR.arteria,1,28));}
  return g;}
function alveolo(state){
  const g=new T.Group();
  const sacos=[[V(0,0,0),.6],[V(.62,.28,.1),.44],[V(-.56,.32,-.1),.42],[V(.22,-.56,.22),.4],[V(-.4,-.5,-.15),.38],[V(.05,.62,-.3),.36],[V(.5,-.22,-.45),.36],[V(-.25,.1,.55),.34],[V(.3,.35,-.6),.3]];
  const memb=new T.Group();
  sacos.forEach(([p,r],i)=>{const s=organico(ball(r,0xf0c9a2,p,{transparent:true,opacity:.62,roughness:.55,metalness:0,emissive:0x2a1a10},36),.035,4.2+i*.3,i+3);tag(s,{type:'inspect',key:'alveolos'});memb.add(s);
    const ar=ball(r*.82,0xfff1dc,p,{transparent:true,opacity:.18,roughness:1},20);memb.add(ar);});
  g.add(memb);
  // ducto alveolar / bronquíolo terminal
  const bronq=tubo([V(0,2.0,0),V(.02,1.35,0),V(.05,.75,0)],.13,COR.traqueia,{roughness:.6});tag(bronq,{type:'inspect',key:'bronquios'});g.add(bronq);
  for(let i=0;i<7;i++){const anel=new T.Mesh(new T.TorusGeometry(.14,.02,8,20),mat(COR.cartilagem));anel.position.set(.02,1.95-i*.16,0);anel.rotation.x=Math.PI/2;g.add(anel);}
  // capilares: dois vasos principais (vênula chega azul, arteríola sai vermelha) + rede fina sobre cada saco
  const pts1=[],pts2=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*1.1-Math.PI*.2,r=1.12;pts1.push(V(Math.cos(a)*r,-.95+i/24*.95,Math.sin(a)*r));}
  for(let i=0;i<=24;i++){const a=Math.PI*.9+i/24*Math.PI*1.1,r=1.12;pts2.push(V(Math.cos(a)*r,0+i/24*.95,Math.sin(a)*r));}
  const capA=tuboGrad(pts1,.085,COR.veia,0x8a5fc8,1,48);const capB=tuboGrad(pts2,.085,0x8a5fc8,COR.arteria,1,48);tag(capA,{type:'inspect',key:'sangue'});tag(capB,{type:'inspect',key:'sangue'});g.add(capA,capB);
  const rede=new T.Group();sacos.forEach(([p,r],i)=>rede.add(redeCapilar(p,r,i?4:7,11+i*7)));tag(rede,{type:'inspect',key:'sangue'});g.add(rede);
  // moléculas: O2 no ar do alvéolo, CO2 no sangue
  const o2=new T.Group();for(const d of [V(-.07,0,0),V(.07,0,0)])o2.add(ball(.075,COR.gasO2,d,{emissive:0x2f7f8f}));o2.position.set(-.1,.25,.7);tag(o2,{type:'gas',gas:'o2'});g.add(o2);
  const lo=label('O₂','#c9f7ff',.5,80);lo.position.set(-.1,.5,.75);g.add(lo);
  const co2=new T.Group();co2.add(ball(.075,COR.gasCO2,V(0,0,0)),ball(.06,0xd8d8e8,V(-.14,0,0)),ball(.06,0xd8d8e8,V(.14,0,0)));co2.position.copy(pts1[12]).add(V(0,.12,0));tag(co2,{type:'gas',gas:'co2'});g.add(co2);
  const lc=label('CO₂','#e8e8f4',.6,80);lc.position.copy(co2.position).add(V(0,.25,.1));g.add(lc);
  g.userData.gases={o2,co2,lo,lc,destO2:pts2[10].clone(),destCO2:V(.15,-.1,.6)};
  // hemácias percorrendo o vaso principal: escuras ao chegar, vivas ao sair
  const hem=[];const curva=new T.CatmullRomCurve3(pts1.concat(pts2));
  for(let i=0;i<14;i++){const h=hemacia(.055);h.userData.f=i/14;h.userData.rot=Math.random()*Math.PI;g.add(h);hem.push(h);}
  const escura=new T.Color(0x8c2430),viva=new T.Color(0xe8484f);
  g.userData.tick=(t)=>{hem.forEach(h=>{const u=(t*.06+h.userData.f)%1;const p=curva.getPointAt(u);h.position.copy(p);h.lookAt(curva.getPointAt(Math.min(1,u+.01)));h.rotateX(Math.PI/2+h.userData.rot+t*.4);h.material.color.copy(escura).lerp(viva,Math.min(1,Math.max(0,(u-.4)/.3)));});
    if(state.o2){o2.position.lerp(g.userData.gases.destO2,.04);lo.position.copy(o2.position).add(V(0,.22,.05));}
    if(state.co2){co2.position.lerp(g.userData.gases.destCO2,.04);lc.position.copy(co2.position).add(V(0,.25,.1));}};
  textAt(g,'ALVÉOLO · ar',0,1.15,.7,1.6,'#ffe3a8');textAt(g,'CAPILAR · sangue',1.05,-1.0,.6,2.0,'#ffb0b0');
  return g;
}
function dispose(g){if(!g)return;const geos=new Set(),mats=new Set(),tex=new Set();g.traverse(o=>{if(o.geometry&&!o.isSprite)geos.add(o.geometry);for(const m of [].concat(o.material||[])){if(!m)continue;mats.add(m);if(m.map)tex.add(m.map);}});geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());tex.forEach(x=>x.dispose());if(g.parent)g.parent.remove(g);}
window.CORPO_MODELS={V,COR,mat,ball,tubo,label,rotuloFixo,textFixo,textAt,tag,organico,digestivo,digestivoProc,toraxProc,silhuetaProc,coracao,pulmao,traqueia,bronquios,diafragma,costelas,silhueta,torax,contexto,explorar,inspection,respire,sequencia,alveolo,stageBase,dispose};
})();
