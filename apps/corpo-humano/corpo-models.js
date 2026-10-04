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
function label(text,color='#e7f6ff',width=1.5,size=56){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.font='600 '+size+'px Segoe UI,Arial';while(ctx.measureText(text).width>490&&size>17){size-=2;ctx.font='600 '+size+'px Segoe UI,Arial';}ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#031220';ctx.shadowBlur=7;ctx.fillStyle=color;ctx.fillText(text,256,64);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.minFilter=T.LinearMipmapLinearFilter;tx.generateMipmaps=true;tx.anisotropy=8;const sp=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthWrite:false,depthTest:true}));sp.scale.set(width,width/4,1);return sp;}
function textAt(g,text,x,y,z=0,width=1.5,color){const sp=label(text,color,width);sp.position.set(x,y,z);g.add(sp);return sp;}

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
function silhueta(opt={}){
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
/* conjunto do tórax com órgãos, posicionados em relação ao tronco da silhueta */
function torax(opt={}){
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
/* ---------- Cenas por atividade ---------- */
function stageBase(g,width=5,y=-3.15,z=0){const m=new T.Mesh(new T.CircleGeometry(width,72),mat(0x0b2637,{roughness:.7,metalness:.12}));m.rotation.x=-Math.PI/2;m.position.set(0,y,z);g.add(m);const rim=new T.Mesh(new T.RingGeometry(width-.016,width+.016,72),new T.MeshBasicMaterial({color:0x305d72,side:T.DoubleSide}));rim.rotation.x=-Math.PI/2;rim.position.set(0,y+.01,z);g.add(rim);}
function contexto(level){
  const g=new T.Group();
  if(level===0){const s=silhueta({opacidade:.16,nariz:true});s.scale.setScalar(.62);s.position.y=.9;g.add(s);const tx=torax({costelas:false});tx.scale.setScalar(.42);tx.position.set(0,1.25,.08);tx.traverse(o=>{if(o.isMesh)o.userData.hit={type:'context',target:'torax'};});g.add(tx);textAt(g,'CORPO HUMANO · ESQUEMA',0,-3.0,0,4.6,'#89acbd');textAt(g,'TÓRAX',1.6,1.3,.2,1.2,'#ffe3a8');return g;}
  if(level===1){const tx=torax();tx.scale.setScalar(1.05);tx.position.y=-.3;tx.traverse(o=>{if(o.isMesh&&o.userData.hit&&o.userData.hit.type==='inspect')o.userData.hit={type:'context',target:'orgao',key:o.userData.hit.key};});g.add(tx);const s=silhueta({opacidade:.08});s.scale.setScalar(1.05);s.position.y=-.3;g.add(s);textAt(g,'DENTRO DO TÓRAX',0,-2.9,0,3.6,'#89acbd');return g;}
  const tx=torax({costelas:false});tx.scale.setScalar(1.1);tx.position.y=-.3;g.add(tx);return g;
}
function explorar(){const g=new T.Group();const tx=torax({cavidades:false});tx.scale.setScalar(1.1);tx.position.y=-.3;g.add(tx);const s=silhueta({opacidade:.07,nariz:true});s.scale.setScalar(1.1);s.position.y=-.3;g.add(s);g.userData.torax=tx;return g;}
function inspection(key){
  if(key==='coracao'||key==='atrioD'||key==='atrioE'||key==='ventD'||key==='ventE'||key==='aorta')return coracao({cavidades:true});
  if(key==='pulmoes'){const g=new T.Group();const a=pulmao(1),b=pulmao(-1);a.position.x=-.75;b.position.x=.75;g.add(a,b);const br=bronquios();br.position.y=.9;g.add(br);return g;}
  if(key==='traqueia'||key==='laringe')return traqueia();
  if(key==='bronquios'){const g=new T.Group();const br=bronquios();br.scale.setScalar(1.6);g.add(br);return g;}
  if(key==='diafragma')return diafragma();
  if(key==='alveolos')return alveolo({});
  if(key==='nariz'||key==='faringe'){const g=new T.Group();const s=silhueta({opacidade:.25,nariz:true});s.scale.setScalar(.8);s.position.y=-2.2;g.add(s);return g;}
  if(key==='sangue'||key==='corpo_celulas'){const g=new T.Group();const cap=tubo([V(-1.5,0,0),V(-.5,.2,.1),V(.5,-.2,-.1),V(1.5,0,0)],.22,COR.arteria,{transparent:true,opacity:.45});g.add(cap);for(let i=0;i<7;i++){const h=new T.Mesh(new T.TorusGeometry(.09,.045,8,16),mat(0xff5a5a));h.position.set(-1.3+i*.43,Math.sin(i)*.08,0);h.rotation.y=Math.PI/2;g.add(h);}return g;}
  if(key==='torax')return torax();
  const g=new T.Group();g.add(torax({costelas:false}));return g;
}
/* respiração: diafragma e pulmões animados pela abertura (0..1) */
function respire(state){
  const g=new T.Group();const tx=torax({costelas:true});tx.scale.setScalar(1.05);tx.position.y=-.2;g.add(tx);
  const s=silhueta({opacidade:.07,nariz:true});s.scale.setScalar(1.05);s.position.y=-.2;g.add(s);
  const p=tx.userData.partes;const base={pE:p.pulmaoE.scale.clone(),pD:p.pulmaoD.scale.clone(),di:p.diafragma.position.y};
  // partículas de ar no caminho
  const ar=[];for(let i=0;i<10;i++){const b=ball(.05,COR.gasO2,V(0,0,0),{emissive:0x2f7f8f});b.userData.f=i/10;g.add(b);ar.push(b);}
  g.userData.tick=(t,abertura)=>{const a=abertura;p.pulmaoE.scale.set(base.pE.x*(1+.18*a),base.pE.y*(1+.22*a),base.pE.z*(1+.15*a));p.pulmaoD.scale.set(base.pD.x*(1+.18*a),base.pD.y*(1+.22*a),base.pD.z*(1+.15*a));p.diafragma.position.y=base.di-.42*a;p.diafragma.scale.y=1-.45*a;
    ar.forEach(b=>{const dir=state.fase==='inspirando'?1:-1;const u=((t*.35*dir+b.userData.f)%1+1)%1;const y=3.3-u*3.2;b.position.set(Math.sin(u*9)*.05,y*1.05-.2,.1+ (y>1.9?.5:.05));b.visible=state.fase!=='repouso';});};
  textAt(g,'INSPIRAR: diafragma desce · EXPIRAR: diafragma sobe',0,-3.0,0,6.2,'#9cbed0');
  tag(p.diafragma,{type:'respirar'});
  return g;
}
/* ordenação de etapas (caminho do ar / caminho do sangue) */
function sequencia(state,cfg){
  const g=new T.Group();const n=cfg.ordem.length,dy=.62,top=(n-1)*dy/2+.3;
  textAt(g,cfg.titulo,.9,top+.75,0,3.4,cfg.cor);
  for(let i=0;i<n;i++){const y=top-i*dy;const key=state.colocados[i];
    const num=label(String(i+1),i===state.target?'#ffdb9f':'#8fb0c2',.5,96);num.position.set(-.55,y,.05);g.add(num);
    const placa=new T.Mesh(new T.BoxGeometry(2.6,.46,.16),mat(key?0x1d4f63:0x15303f,{transparent:!key,opacity:key?1:.65}));placa.position.set(.9,y,0);tag(placa,{type:'seqSlot',index:i});g.add(placa);
    const txt=label(key?cfg.rotulos[key]:'?',key?'#eafaff':'#ffe3a8',2.4,key?72:96);txt.position.set(.9,y,.1);g.add(txt);
    if(i===state.target&&!key){const marc=new T.Mesh(new T.BoxGeometry(2.72,.56,.06),new T.MeshBasicMaterial({color:0xefd094,wireframe:true}));marc.position.set(.9,y,.02);g.add(marc);}
    if(i<n-1){const seta=new T.ArrowHelper(V(0,-1,0),V(.9,y-.25,0),.12,0x6ca7be,.08,.06);g.add(seta);}
  }
  // bandeja de peças (embaralhadas, sem as já colocadas)
  const restantes=state.bandeja.filter(k=>!state.colocados.includes(k));
  restantes.forEach((k,i)=>{const cols=2,c=i%cols,r=Math.floor(i/cols);const x=-3.75+c*1.6,y=top-.1-r*.72;
    const peca=new T.Mesh(new T.BoxGeometry(1.48,.56,.2),mat(0x2b6f88,{roughness:.4}));peca.position.set(x,y,.1);peca.userData.draggable=true;tag(peca,{type:'seqPiece',key:k});g.add(peca);
    const t=label(cfg.rotulos[k],'#ffffff',1.46,66);t.position.set(x,y,.22);g.add(t);
    if(state.selected===k){const anel=new T.Mesh(new T.BoxGeometry(1.6,.68,.08),new T.MeshBasicMaterial({color:0xffffff,wireframe:true}));anel.position.set(x,y,.1);g.add(anel);}
  });
  if(!state.done)textAt(g,'PEÇAS',-2.95,top+.75,0,1.4,'#9cbed0');
  if(state.done&&cfg.titulo==='CAMINHO DO SANGUE'){
    const co=coracao({cavidades:true});co.scale.setScalar(1.15);co.position.set(-2.9,-.3,0);g.add(co);
    const pts=[V(-.55,1.3,-.1),V(-.5,.75,-.08),V(-.38,.48,.1),V(-.28,-.1,.45),V(-.2,.5,.35),V(-.05,.95,.25),V(.4,1.0,.1),V(.95,.55,-.2),V(.45,.5,-.1),V(.3,.52,.15),V(.3,-.25,.4),V(.15,.35,.1),V(.15,.95,.05),V(.05,1.25,-.05),V(-.3,1.25,-.15),V(-.42,.9,-.25)].map(p=>p.clone().multiplyScalar(1.15).add(V(-2.9,-.3,0)));
    const curva=new T.CatmullRomCurve3(pts);const gotas=[];for(let i=0;i<10;i++){const d=ball(.07,COR.veia,V(),{emissive:0x223355});d.userData.f=i/10;g.add(d);gotas.push(d);}
    textAt(g,'SIGA A GOTA',-2.9,1.75,0,2.2,'#ffb0b0');
    g.userData.tick=(t)=>{gotas.forEach(d=>{const u=(t*.07+d.userData.f)%1;d.position.copy(curva.getPointAt(u));const rico=u>.47&&u<.98;d.material.color.setHex(rico?COR.arteria:COR.veia);d.material.emissive.setHex(rico?0x552222:0x223355);});};
  }
  if(state.done&&cfg.titulo==='CAMINHO DO AR'){
    const tx=torax({costelas:false});tx.scale.setScalar(.95);tx.position.set(-2.9,-.6,0);g.add(tx);const si=silhueta({opacidade:.1,nariz:true});si.scale.setScalar(.95);si.position.set(-2.9,-.6,0);g.add(si);
    const base=V(-2.9,-.6,0),s=.95;const P=(x,y,z)=>V(x*s,y*s,z*s).add(base);
    const rotas=[[P(0,3.1,.56),P(0,2.6,.15),P(0,2.3,.05),P(0,1.6,.05),P(0,1.05,.05),P(-.42,.7,.07),P(-.8,.4,0),P(-.85,-.1,.02)],[P(0,3.1,.56),P(0,2.6,.15),P(0,2.3,.05),P(0,1.6,.05),P(0,1.05,.05),P(.42,.7,.07),P(.78,.4,0),P(.82,-.1,.02)]];
    const parts=[];rotas.forEach((r,k)=>{const c=new T.CatmullRomCurve3(r);for(let i=0;i<7;i++){const d=ball(.055,COR.gasO2,V(),{emissive:0x2f7f8f});d.userData.f=i/7;d.userData.c=c;g.add(d);parts.push(d);}});
    textAt(g,'O AR ENTRA',-2.9,2.6,0,2.0,'#c9f7ff');
    g.userData.tick=(t)=>{parts.forEach(d=>{const u=(t*.12+d.userData.f)%1;d.position.copy(d.userData.c.getPointAt(u));});};
  }
  g.userData.slots={top,dy};
  return g;
}
/* alvéolo com capilar e gases */
function alveolo(state){
  const g=new T.Group();
  const centro=V(0,0,0);const sacos=[V(0,0,0),V(.55,.25,.1),V(-.5,.3,-.1),V(.2,-.5,.2),V(-.35,-.45,-.15),V(.05,.55,-.3),V(.45,-.2,-.4)];
  sacos.forEach((p,i)=>{const s=ball(i?.42:.55,COR.alveolo,p,{transparent:true,opacity:.75,roughness:.35});tag(s,{type:'inspect',key:'alveolos'});g.add(s);});
  const bronq=tubo([V(0,1.9,0),V(0,1.2,0),V(.05,.6,0)],.12,COR.traqueia);tag(bronq,{type:'inspect',key:'bronquios'});g.add(bronq);
  // capilar em espiral ao redor, azul chegando → vermelho saindo
  const pts1=[],pts2=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*1.1-Math.PI*.2,r=1.05;pts1.push(V(Math.cos(a)*r,-.9+i/24*.9,Math.sin(a)*r));}
  for(let i=0;i<=24;i++){const a=Math.PI*.9+i/24*Math.PI*1.1,r=1.05;pts2.push(V(Math.cos(a)*r,0+i/24*.9,Math.sin(a)*r));}
  const capA=tubo(pts1,.11,COR.veia,{transparent:true,opacity:.75});const capB=tubo(pts2,.11,COR.arteria,{transparent:true,opacity:.75});tag(capA,{type:'inspect',key:'sangue'});tag(capB,{type:'inspect',key:'sangue'});g.add(capA,capB);
  // moléculas: O2 no ar do alvéolo, CO2 no sangue
  const o2=new T.Group();for(const d of [V(-.07,0,0),V(.07,0,0)])o2.add(ball(.075,COR.gasO2,d,{emissive:0x2f7f8f}));o2.position.set(-.1,.25,.55);tag(o2,{type:'gas',gas:'o2'});g.add(o2);
  const lo=label('O₂','#c9f7ff',.5,80);lo.position.set(-.1,.5,.6);g.add(lo);
  const co2=new T.Group();co2.add(ball(.075,COR.gasCO2,V(0,0,0)),ball(.06,0xd8d8e8,V(-.14,0,0)),ball(.06,0xd8d8e8,V(.14,0,0)));co2.position.copy(pts1[12]).add(V(0,.1,0));tag(co2,{type:'gas',gas:'co2'});g.add(co2);
  const lc=label('CO₂','#e8e8f4',.6,80);lc.position.copy(co2.position).add(V(0,.25,.1));g.add(lc);
  g.userData.gases={o2,co2,lo,lc,destO2:pts2[10].clone(),destCO2:V(.15,-.1,.5)};
  // hemácias passando no capilar
  const hem=[];for(let i=0;i<6;i++){const h=new T.Mesh(new T.TorusGeometry(.06,.03,6,12),mat(0xff5a5a));h.userData.f=i/6;g.add(h);hem.push(h);}
  const curva=new T.CatmullRomCurve3(pts1.concat(pts2));
  g.userData.tick=(t)=>{hem.forEach(h=>{const u=(t*.08+h.userData.f)%1;const p=curva.getPointAt(u);h.position.copy(p);h.lookAt(curva.getPointAt(Math.min(1,u+.01)));});
    if(state.o2){o2.position.lerp(g.userData.gases.destO2,.04);lo.position.copy(o2.position).add(V(0,.22,.05));}
    if(state.co2){co2.position.lerp(g.userData.gases.destCO2,.04);lc.position.copy(co2.position).add(V(0,.25,.1));}};
  textAt(g,'ALVÉOLO · ar',0,1.1,.6,1.6,'#ffe3a8');textAt(g,'CAPILAR · sangue',1.0,-.9,.6,2.0,'#ffb0b0');
  return g;
}
function dispose(g){if(!g)return;const geos=new Set(),mats=new Set(),tex=new Set();g.traverse(o=>{if(o.geometry&&!o.isSprite)geos.add(o.geometry);for(const m of [].concat(o.material||[])){if(!m)continue;mats.add(m);if(m.map)tex.add(m.map);}});geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());tex.forEach(x=>x.dispose());if(g.parent)g.parent.remove(g);}
window.CORPO_MODELS={V,COR,mat,ball,tubo,label,textAt,tag,organico,coracao,pulmao,traqueia,bronquios,diafragma,costelas,silhueta,torax,contexto,explorar,inspection,respire,sequencia,alveolo,stageBase,dispose};
})();
