/* Esqueleto e Movimento · cenas 3D (Three.js r128) sobre as malhas do Z-Anatomy
   Cada cena é um Group; peças clicáveis têm userData.hit = {type, key}. Usa ESQ_GLTF para carregar e posicionar. */
(function(){'use strict';
const T=THREE,D=ESQ_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const G=()=>window.ESQ_GLTF;
const COR={osso:0xe9e4d6,musculo:0xb8343f,pele:0x8fc3dd,marcador:0xffd166,ok:0x3ddc84};
const mat=(color,extra={})=>new T.MeshStandardMaterial(Object.assign({color,roughness:.5,metalness:.05},extra));
function tag(o,data){o.traverse(x=>{if(x.isMesh)x.userData.hit=data;});o.userData.hit=data;return o;}
function ball(r,color,pos,extra,seg=24){const m=new T.Mesh(new T.SphereGeometry(r,seg,Math.max(10,seg*.7|0)),mat(color,extra));if(pos)m.position.copy(pos);return m;}
function label(text,color='#e7f6ff',width=1.5,size=56){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.font='600 '+size+'px Segoe UI,Arial';while(ctx.measureText(text).width>490&&size>17){size-=2;ctx.font='600 '+size+'px Segoe UI,Arial';}ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#031220';ctx.shadowBlur=7;ctx.fillStyle=color;ctx.fillText(text,256,64);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.minFilter=T.LinearMipmapLinearFilter;tx.generateMipmaps=true;tx.anisotropy=8;const sp=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthWrite:false,depthTest:true}));sp.scale.set(width,width/4,1);return sp;}
function textAt(g,text,x,y,z=0,width=1.5,color){const sp=label(text,color,width);sp.position.set(x,y,z);g.add(sp);return sp;}
function stageBase(g,width=5,y=-3.15,z=0){const m=new T.Mesh(new T.CircleGeometry(width,72),mat(0x0b2637,{roughness:.7,metalness:.12}));m.rotation.x=-Math.PI/2;m.position.set(0,y,z);g.add(m);const rim=new T.Mesh(new T.RingGeometry(width-.016,width+.016,72),new T.MeshBasicMaterial({color:0x305d72,side:T.DoubleSide}));rim.rotation.x=-Math.PI/2;rim.position.set(0,y+.01,z);g.add(rim);}
const inspectHit=p=>({type:'inspect',key:G().chave(p)});
const D_=k=>k+'_d';

/* ---------- blocos reutilizáveis ---------- */
function esqueleto(opt={}){const g=G();return g.modelo('esqueleto',Object.assign({hit:opt.semHit?null:inspectHit},opt));}
function musculos(opt={}){const g=G();return g.modelo('musculos',Object.assign({hit:opt.semHit?null:inspectHit},opt));}
function silhueta(opt={}){const g=G();const s=g.modelo('silhueta',{opacidade:opt.opacidade??.14,hit:opt.hit});s.userData.semEnquadre=!opt.enquadrar;return s;}
/* recorte: só algumas partes de um arquivo, centradas num ponto (m) ou no centro das partes */
function recorte(arq,partes,opt={}){const g=G();const o=g.modelo(arq,Object.assign({partes,centrar:!opt.centroM},opt));if(opt.centroM){o.position.copy(g.ponto(...opt.centroM).multiplyScalar(-1));}return o;}

/* ---------- Cenas ---------- */
function contexto(level){
  const g=new T.Group();
  if(level===0){g.add(silhueta({opacidade:.2,enquadrar:true,hit:()=>({type:'context',target:'esqueleto'})}));g.add(esqueleto({semHit:true,hit:()=>({type:'context',target:'esqueleto'})}));textAt(g,'CORPO HUMANO',0,-6.2,0,4,'#89acbd');return g;}
  if(level===1){g.add(esqueleto({hit:()=>({type:'context',target:'musculos'})}));textAt(g,'ESQUELETO · 206 OSSOS',0,-6.2,0,4.6,'#ffe3a8');return g;}
  g.add(esqueleto({semHit:true}),musculos({hit:inspectHit}));textAt(g,'MÚSCULOS SOBRE OS OSSOS',0,-6.2,0,5,'#ffb0b0');return g;
}
function explorar(){const g=new T.Group();g.add(esqueleto());g.add(silhueta({opacidade:.06}));g.userData.esqueleto=true;return g;}
function musculosCena(){const g=new T.Group();g.add(esqueleto({semHit:true,opacidade:.42}));g.add(musculos());return g;}
function desafio(){const g=new T.Group();g.add(esqueleto({semHit:true}),musculos({semHit:true,opacidade:.85}));return g;}

/* ligações músculo → ossos de apoio (contexto na inspeção) */
const APOIO={biceps:['escapula_d','umero_d','radio_d'],triceps:['escapula_d','umero_d','ulna_d'],deltoide:['clavicula_d','escapula_d','umero_d'],peitoral:['clavicula_d','esterno','costelas','umero_d'],reto_abdominal:['esterno','costelas','pelve_d','pelve_e'],obliquo:['costelas','pelve_d'],trapezio:['cranio','cervical','toracica','clavicula_d','escapula_d'],latissimo:['toracica','lombar','sacro','pelve_d','umero_d'],gluteo:['pelve_d','sacro','femur_d'],quadriceps:['pelve_d','femur_d','patela_d','tibia_d'],isquiotibiais:['pelve_d','femur_d','tibia_d','fibula_d'],gastrocnemio:['femur_d','tibia_d','fibula_d','pe_d'],tibial_anterior:['tibia_d','fibula_d','pe_d'],esternocleidomastoideo:['cranio','clavicula_d','esterno']};
const ARTIC={joelho:{ossos:['femur_d','tibia_d','fibula_d','patela_d'],arq:'joelho',centro:[-0.0775,0.4417,-0.034],rotulos:[['LCA (cruzado anterior)','lca',.5],['LCP (cruzado posterior)','lcp',-.5],['Menisco medial','menisco_medial',.5],['Menisco lateral','menisco_lateral',-.5],['Colateral fibular','colateral_fibular',-.5],['Colateral tibial','colateral_tibial',.5]]},
  ombro:{ossos:['escapula_d','umero_d','clavicula_d'],arq:'ombro',centro:[-0.1613,1.3876,-0.0176],rotulos:[['Labrum (anel de cartilagem)','labrum',.5],['Cápsula articular','capsula',-.5],['Ligamentos','ligamentos',.5]]},
  quadril:{ossos:['pelve_d','femur_d','sacro'],arq:'quadril',centro:[-0.0899,0.8469,-0.0086],rotulos:[['Labrum','labrum',.5],['Cápsula articular','capsula',-.5],['Ligamentos','ligamentos',.5]]},
  cotovelo:{ossos:[],arq:'cotovelo',centro:[-0.24,1.088,-0.02],rotulos:[['Úmero','umero',.4],['Ulna (olécrano)','ulna',-.4],['Rádio','radio',.4]]},
  pivo:{ossos:['cervical','cranio'],centro:[0,1.545,-0.03],rotulos:[['Atlas (C1)',[0,1.565,-0.03],.5],['Áxis (C2)',[0,1.535,-0.03],-.5]]}};
function rotulo(w,txt,pos,dx,tam=.32){const sp=label(txt,'#ffffff',tam,64);sp.position.copy(pos).add(V(dx,.03,.08));w.add(sp);w.add(ball(.012,0xffffff,pos.clone().add(V(0,0,.05)),{emissive:0x335566}));}
function inspection(key){
  const g=G();const w=new T.Group();
  if(ARTIC[key]){const a=ARTIC[key];const P=(p)=>g.ponto(...p).sub(g.ponto(...a.centro));
    if(a.arq)w.add(recorte(a.arq,null,{centroM:a.centro,hit:()=>({type:'inspect',key})}));
    else w.add(recorte('esqueleto',a.ossos,{centroM:a.centro,opacidade:key==='pivo'?.55:.78,hit:p=>({type:'inspect',key:G().chave(p)}),cor:p=>p==='cranio'?0xd8d2c4:COR.osso}));
    a.rotulos.forEach(([txt,parte,dx])=>{const pos=Array.isArray(parte)?P(parte):(a.arq?g.centro(a.arq,parte).sub(g.ponto(...a.centro)):V());rotulo(w,txt,pos,dx,.3);});
    if(key==='pivo'||key==='ombro'||key==='quadril'){const cb=g.modelo('cabeca',{opacidade:.1});cb.position.copy(g.ponto(...a.centro).multiplyScalar(-1));cb.userData.semEnquadre=true;if(key==='pivo')w.add(cb);}
    return w;}
  if(APOIO[key]){const c=g.C.musculos[D_(key)];
    w.add(recorte('musculos',[D_(key)],{centroM:c,hit:()=>({type:'inspect',key})}));
    w.add(recorte('esqueleto',APOIO[key],{centroM:c,opacidade:.6,hit:p=>({type:'inspect',key:G().chave(p)})}));
    return w;}
  /* ossos: pares mostram o lado direito; mãos e pés também */
  const partes=g.C.esqueleto[key]?[key]:g.C.esqueleto[D_(key)]?[D_(key)]:null;
  if(!partes){w.add(esqueleto());return w;}
  w.add(recorte('esqueleto',partes,{hit:()=>({type:'inspect',key})}));
  return w;
}
/* movimento: braço direito com cotovelo articulado; bíceps e tríceps mudam de volume */
function movimento(state){
  const g=G();const w=new T.Group();const PIV=[-0.24,1.088,-0.02];const centro=[-0.22,1.1,-0.02];
  const ossos=recorte('esqueleto',['clavicula_d','escapula_d','umero_d','radio_d','ulna_d','mao_d'],{centroM:centro,hit:p=>({type:'mover'}),aoCarregar:(inst,meshes)=>{const piv=new T.Group();piv.position.set(...PIV);inst.add(piv);['radio_d','ulna_d','mao_d'].forEach(k=>{if(meshes[k])piv.attach(meshes[k]);});w.userData.pivot=piv;}});
  w.add(ossos);
  const musc=recorte('musculos',['biceps_d','triceps_d'],{centroM:centro,hit:p=>({type:'mover'}),aoCarregar:(inst,meshes)=>{w.userData.musc={};for(const k of ['biceps_d','triceps_d']){const m=meshes[k];if(!m)continue;const grp=new T.Group();grp.position.set(...g.C.musculos[k]);inst.add(grp);grp.attach(m);w.userData.musc[k]=grp;}}});
  w.add(musc);
  const P=(p)=>g.ponto(...p).sub(g.ponto(...centro));
  const lb=label('BÍCEPS','#ffb0b0',1.1,70);lb.position.copy(P([-0.17,1.2,0.06])).add(V(0,0,.45));w.add(lb);
  const lt=label('TRÍCEPS','#ffd6d6',1.1,70);lt.position.copy(P([-0.17,1.2,-0.1])).add(V(0,0,-.45));w.add(lt);
  w.userData.tick=(t,abertura)=>{const a=abertura;if(w.userData.pivot)w.userData.pivot.rotation.x=-a*1.95;const m=w.userData.musc||{};if(m.biceps_d)m.biceps_d.scale.set(1+.32*a,1-.16*a,1+.32*a);if(m.triceps_d)m.triceps_d.scale.set(1-.1*a,1+.04*a,1-.1*a);};
  textAt(w,'FLEXIONAR: bíceps contrai · ESTENDER: tríceps contrai',0,-2.6,0,5.4,'#9cbed0');
  return w;
}
/* articulações: esqueleto com três marcadores (dobradiça, bola-e-soquete, pivô) */
function articulacoes(state){
  const g=G();const w=new T.Group();w.add(esqueleto({hit:inspectHit}));
  const pontos=[['dobradica',[-0.0775,0.4417,-0.0],'DOBRADIÇA · joelho'],['esferoide',[-0.1613,1.3876,0.0],'BOLA E SOQUETE · ombro'],['pivo',[0,1.55,0.0],'PIVÔ · atlas e áxis']];
  const marc=[];pontos.forEach(([tipo,p,txt])=>{const pos=g.ponto(...p);const feito=state[tipo];const b=ball(.17,feito?COR.ok:COR.marcador,pos,{emissive:feito?0x1b6b3a:0x7a5a10,transparent:true,opacity:.85});tag(b,{type:'artic',tipo});w.add(b);marc.push(b);
    const anel=new T.Mesh(new T.TorusGeometry(.26,.025,10,32),new T.MeshBasicMaterial({color:feito?COR.ok:COR.marcador}));anel.position.copy(pos);w.add(anel);anel.userData.gira=true;
    if(feito){const l=label(txt,'#dfffe9',2.2,60);l.position.copy(pos).add(V(p[0]<0?-1.5:1.5,.45,.3));w.add(l);}});
  w.userData.tick=(t)=>{marc.forEach((b,i)=>{const s=1+Math.sin(t*3+i)*.12;b.scale.setScalar(s);});w.children.forEach(o=>{if(o.userData.gira){o.rotation.y=t*.8;o.rotation.x=Math.PI/2+Math.sin(t)*.3;}});};
  return w;
}
/* ordenação de etapas (tabuleiro de posições + bandeja de peças) */
function sequencia(state,cfg){
  if(state.done)return sequenciaConcluida(cfg);
  const g=new T.Group();const n=cfg.ordem.length,dy=.62,top=(n-1)*dy/2+.3;
  textAt(g,cfg.titulo,.9,top+.75,0,3.4,cfg.cor);
  for(let i=0;i<n;i++){const y=top-i*dy;const key=state.colocados[i];
    const num=label(String(i+1),i===state.target?'#ffdb9f':'#8fb0c2',.5,96);num.position.set(-.55,y,.05);g.add(num);
    const placa=new T.Mesh(new T.BoxGeometry(2.6,.46,.16),mat(key?0x1d4f63:0x15303f,{transparent:!key,opacity:key?1:.65}));placa.position.set(.9,y,0);tag(placa,{type:'seqSlot',index:i});g.add(placa);
    const txt=label(key?cfg.rotulos[key]:'?',key?'#eafaff':'#ffe3a8',2.4,key?72:96);txt.position.set(.9,y,.1);g.add(txt);
    if(i===state.target&&!key){const marc=new T.Mesh(new T.BoxGeometry(2.72,.56,.06),new T.MeshBasicMaterial({color:0xefd094,wireframe:true}));marc.position.set(.9,y,.02);g.add(marc);}
    if(i<n-1){const seta=new T.ArrowHelper(V(0,-1,0),V(.9,y-.25,0),.12,0x6ca7be,.08,.06);g.add(seta);}
  }
  const restantes=state.bandeja.filter(k=>!state.colocados.includes(k));
  restantes.forEach((k,i)=>{const cols=2,c=i%cols,r=Math.floor(i/cols);const x=2.75+c*1.6,y=top-.1-r*.72;
    const peca=new T.Mesh(new T.BoxGeometry(1.48,.56,.2),mat(0x2b6f88,{roughness:.4}));peca.position.set(x,y,.1);peca.userData.draggable=true;tag(peca,{type:'seqPiece',key:k});g.add(peca);
    const t=label(cfg.rotulos[k],'#ffffff',1.46,66);t.position.set(x,y,.22);g.add(t);});
  if(restantes.length)textAt(g,'PEÇAS',3.55,top+.55,0,1.2,'#8fb0c2');
  g.userData.slots={top,dy};
  /* referência: o recorte real ao lado, com as partes já colocadas em destaque */
  const ref=cfg.titulo==='COLUNA VERTEBRAL'?recorte('esqueleto',['cervical','toracica','lombar','sacro','coccix','cranio'],{cor:p=>state.colocados.includes(p)?0xffd166:p==='cranio'?0xcfc9bb:COR.osso,opacidade:.95,hit:p=>({type:'inspect',key:G().chave(p)})}):recorte('esqueleto',['clavicula_d','escapula_d','umero_d','radio_d','ulna_d','mao_d'],{cor:p=>{const k=G().chave(p);const key=(k==='radio'||k==='ulna')?'antebraco':k;return state.colocados.includes(key)?0xffd166:COR.osso;},hit:p=>({type:'inspect',key:G().chave(p)})});
  ref.position.set(cfg.titulo==='COLUNA VERTEBRAL'?-2.6:-2.0,cfg.titulo==='COLUNA VERTEBRAL'?-.2:.1,0);ref.scale.setScalar(cfg.titulo==='COLUNA VERTEBRAL'?.5:.55);ref.rotation.y=cfg.titulo==='COLUNA VERTEBRAL'?.35:.5;ref.userData.semEnquadre=true;g.add(ref);
  return g;
}
function sequenciaConcluida(cfg){
  const g=new T.Group();
  if(cfg.titulo==='COLUNA VERTEBRAL'){const r=recorte('esqueleto',['cervical','toracica','lombar','sacro','coccix'],{hit:p=>({type:'inspect',key:G().chave(p)}),cor:p=>({cervical:0xfff0b3,toracica:0xffd166,lombar:0xf4a261,sacro:0xe76f51,coccix:0xc9516b})[p]||COR.osso});r.scale.setScalar(.8);g.add(r);
    const gl=G();const c=gl.ponto(0,1.17,-.04);[['Cervical · 7',[0,1.49,-.03]],['Torácica · 12',[0,1.28,-.05]],['Lombar · 5',[0,1.045,-.025]],['Sacro',[0,.92,-.05]],['Cóccix',[0,.845,-.077]]].forEach(([t,p],i)=>{const sp=label(t,'#ffffff',1.6,66);sp.position.copy(gl.ponto(...p).sub(c).multiplyScalar(.8)).add(V(1.6,0,0));g.add(sp);});
    textAt(g,'COLUNA VERTEBRAL · 33 VÉRTEBRAS',0,3.4,0,5,cfg.cor);return g;}
  const r=recorte('esqueleto',['clavicula_d','escapula_d','umero_d','radio_d','ulna_d','mao_d'],{hit:p=>({type:'inspect',key:G().chave(p)}),cor:p=>({clavicula_d:0xfff0b3,escapula_d:0xffd166,umero_d:0xf4a261,radio_d:0xe76f51,ulna_d:0xe76f51,mao_d:0xc9516b})[p]||COR.osso});g.add(r);
  const gl=G();const c=gl.ponto(-0.2,1.09,-0.02);[['Clavícula',[-0.083,1.407,0]],['Escápula',[-0.117,1.336,-.056]],['Úmero',[-0.199,1.245,-.027]],['Rádio e ulna',[-0.245,.975,-.013]],['Mão',[-0.28,.78,.053]]].forEach(([t,p])=>{const sp=label(t,'#ffffff',1.4,66);sp.position.copy(gl.ponto(...p).sub(c)).add(V(-1.3,0,.2));g.add(sp);});
  textAt(g,'DO OMBRO À MÃO',0,3.2,0,4,cfg.cor);return g;
}
function dispose(g){if(!g)return;const geos=new Set(),mats=new Set(),tex=new Set();g.traverse(o=>{if(o.geometry&&!o.isSprite)geos.add(o.geometry);for(const m of [].concat(o.material||[])){if(!m)continue;mats.add(m);if(m.map)tex.add(m.map);}});geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());tex.forEach(x=>x.dispose());if(g.parent)g.parent.remove(g);}
window.ESQ_MODELS={V,COR,mat,ball,label,textAt,tag,esqueleto,musculos,silhueta,recorte,contexto,explorar,musculosCena,desafio,inspection,movimento,articulacoes,sequencia,sequenciaConcluida,stageBase,dispose,APOIO,ARTIC};
})();
