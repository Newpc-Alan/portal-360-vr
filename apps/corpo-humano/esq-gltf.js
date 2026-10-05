/* Esqueleto e Movimento · carregador dos modelos anatômicos (Z-Anatomy, CC BY-SA 4.0)
   Fonte: Z-Anatomy (github.com/LluisV/Z-Anatomy): esqueleto, músculos e articulações convertidos de FBX para glTF,
   agrupados por osso/músculo com nome, deduplicados e simplificados pela NEWPC.
   Coordenadas originais em metros (corpo de 1,71 m, origem nos pés). Referencial do app: (p - (0,OY,0)) * ESC.
   Cada arquivo tem várias partes nomeadas (ex.: umero_d, umero_e); _d = lado direito do corpo, _e = esquerdo. */
(function(){'use strict';
const T=THREE;
const ESC=7.5,OY=0.95;
/* centros (m) das partes, para posicionar recortes, rótulos e pivôs sem esperar o arquivo */
const C={
 esqueleto:{cranio:[0,1.6155,-0.0016],mandibula:[0,1.5366,0.0448],cervical:[0,1.4956,-0.0371],toracica:[0,1.2827,-0.0486],lombar:[0,1.0456,-0.0257],sacro:[0,0.9233,-0.0493],coccix:[0,0.8457,-0.0765],costelas:[0,1.2515,0.0077],esterno:[0,1.3124,0.0719],
  clavicula_e:[0.083,1.4072,-0.0009],clavicula_d:[-0.083,1.4072,-0.0009],escapula_e:[0.1171,1.3361,-0.0558],escapula_d:[-0.1171,1.3361,-0.0558],umero_e:[0.1986,1.2454,-0.0274],umero_d:[-0.1986,1.2454,-0.0274],radio_e:[0.2593,0.9693,-0.0055],radio_d:[-0.2593,0.9693,-0.0055],ulna_e:[0.2272,0.9833,-0.0214],ulna_d:[-0.2272,0.9833,-0.0214],mao_e:[0.2804,0.7807,0.0533],mao_d:[-0.2804,0.7807,0.0533],
  pelve_e:[0.0689,0.9046,-0.0154],pelve_d:[-0.0689,0.9046,-0.0154],femur_e:[0.0902,0.6534,-0.0196],femur_d:[-0.0902,0.6534,-0.0196],patela_e:[0.0844,0.4443,0.0103],patela_d:[-0.0844,0.4443,0.0103],tibia_e:[0.0766,0.2542,-0.0289],tibia_d:[-0.0766,0.2542,-0.0289],fibula_e:[0.1072,0.2365,-0.0432],fibula_d:[-0.1072,0.2365,-0.0432],pe_e:[0.0996,0.0448,0.0229],pe_d:[-0.0996,0.0448,0.0229]},
 musculos:{biceps_e:[0.1878,1.2294,-0.0164],biceps_d:[-0.1878,1.2294,-0.0164],triceps_e:[0.1841,1.2293,-0.0582],triceps_d:[-0.1841,1.2293,-0.0582],deltoide_e:[0.1597,1.3466,-0.0414],deltoide_d:[-0.1597,1.3466,-0.0414],peitoral_e:[0.0969,1.2906,0.0547],peitoral_d:[-0.0969,1.2906,0.0547],reto_abdominal_e:[0.0423,1.054,0.0824],reto_abdominal_d:[-0.0423,1.054,0.0824],obliquo_e:[0.0729,1.0709,0.0353],obliquo_d:[-0.0729,1.0709,0.0353],trapezio_e:[0.0814,1.3552,-0.0649],trapezio_d:[-0.0814,1.3552,-0.0649],latissimo_e:[0.0866,1.1278,-0.0695],latissimo_d:[-0.0866,1.1278,-0.0695],gluteo_e:[0.0741,0.8445,-0.0634],gluteo_d:[-0.0741,0.8445,-0.0634],quadriceps_e:[0.0963,0.6431,0.0123],quadriceps_d:[-0.0963,0.6431,0.0123],isquiotibiais_e:[0.0716,0.5858,-0.0453],isquiotibiais_d:[-0.0716,0.5858,-0.0453],gastrocnemio_e:[0.0847,0.3563,-0.0623],gastrocnemio_d:[-0.0847,0.3563,-0.0623],tibial_anterior_e:[0.0871,0.2267,0.002],tibial_anterior_d:[-0.0871,0.2267,0.002],esternocleidomastoideo_e:[0.0344,1.4861,0.0069],esternocleidomastoideo_d:[-0.0344,1.4861,0.0069]},
 joelho:{lca:[-0.0775,0.4417,-0.034],lcp:[-0.0729,0.4333,-0.0456],menisco_medial:[-0.0545,0.4267,-0.0389],menisco_lateral:[-0.0932,0.432,-0.0294],colateral_tibial:[-0.0495,0.4231,-0.0259],colateral_fibular:[-0.1159,0.4335,-0.0397],capsula:[-0.0757,0.4555,-0.0259]},
 ombro:{labrum:[-0.1491,1.3779,-0.0359],capsula:[-0.1629,1.379,-0.0283],ligamentos:[-0.1613,1.3876,-0.0176]},
 quadril:{labrum:[-0.0842,0.865,-0.0059],capsula:[-0.0935,0.8496,-0.0059],ligamentos:[-0.0899,0.8469,-0.0086]},
 cotovelo:{umero:[-0.2,1.16,-0.03],radio:[-0.25,1.02,-0.01],ulna:[-0.23,1.02,-0.02]},
 silhueta:{silhueta:[0,0.854,0]},cabeca:{pele:[0,1.555,0.0047]}
};
const COR={osso:0xe9e4d6,musculo:0xb8343f,musculoClaro:0xd9666c,ligamento:0xf1e9c4,menisco:0xcfe3ee,capsula:0xaad8ef,labrum:0xd8ecf3,pele:0x8fc3dd};
const corDe=(arq,parte)=>{if(arq==='esqueleto')return COR.osso;if(arq==='musculos')return COR.musculo;if(arq==='silhueta'||arq==='cabeca')return COR.pele;
  if(/^(femur|tibia|fibula|patela|escapula|clavicula|umero|pelve|sacro|radio|ulna)$/.test(parte))return COR.osso;if(/menisco/.test(parte))return COR.menisco;if(parte==='capsula')return COR.capsula;if(parte==='labrum')return COR.labrum;return COR.ligamento;};
const cache={},fila={};let loader=null;
const chave=p=>String(p||'').replace(/_[de]$/,'');          /* umero_d → umero */
const lado=p=>/_d$/.test(p)?'d':/_e$/.test(p)?'e':'';
function toLocal(p){return new T.Vector3(p[0]*ESC,(p[1]-OY)*ESC,p[2]*ESC);}
function material(arq,parte,opt){
  const m=new T.MeshStandardMaterial({color:(opt.cor&&opt.cor(parte))||corDe(arq,parte),roughness:arq==='esqueleto'?.62:.48,metalness:.03});
  if(arq==='silhueta'||arq==='cabeca'){m.transparent=true;m.opacity=opt.opacidade??.12;m.depthWrite=false;m.side=T.DoubleSide;}
  else if(parte==='capsula'){m.transparent=true;m.opacity=.35;m.depthWrite=false;}
  else if(opt.opacidade!==undefined){m.transparent=true;m.opacity=opt.opacidade;m.depthWrite=opt.opacidade>.5;}
  if(window.CORPO_TECIDOS){const TT=window.CORPO_TECIDOS;const t=arq==='esqueleto'?'osso':arq==='musculos'?'musculo':(arq==='silhueta'||arq==='cabeca')?'pele':['ligamentos','capsula','labrum','lca','lcp','menisco_medial','menisco_lateral','colateral_tibial','colateral_fibular'].includes(parte)?'cartilagem':'osso';TT.aplicar(m,t);}
  return m;
}
function carregar(arq,cb){
  if(arq in cache){cb(cache[arq]);return;}
  if(fila[arq]){fila[arq].push(cb);return;}
  fila[arq]=[cb];
  if(!T.GLTFLoader){cache[arq]=null;fila[arq].forEach(f=>f(null));delete fila[arq];return;}
  loader=loader||new T.GLTFLoader();
  loader.load('modelos/'+arq+'.glb?v=1',g=>{cache[arq]=g.scene;fila[arq].forEach(f=>f(g.scene));delete fila[arq];},undefined,()=>{console.warn('Esqueleto: modelo não carregou:',arq);cache[arq]=null;fila[arq].forEach(f=>f(null));delete fila[arq];});
}
/* modelo(arq, opt) → Group no referencial do app (corpo inteiro, pés em y=-OY*ESC).
   opt.partes: lista de partes visíveis (default todas) · opt.hit(parte) → userData.hit · opt.cor(parte) · opt.opacidade
   opt.centrar: recentra o grupo no centro das partes visíveis (para inspeções) · opt.aoCarregar(inst, meshes) */
function modelo(arq,opt={}){
  const g=new T.Group();g.name='gltf:'+arq;g.userData.gltf=arq;
  carregar(arq,src=>{
    if(!src){g.userData.pronto=true;g.userData.falhou=true;window.dispatchEvent(new CustomEvent('corpo:modelo',{detail:{key:arq,group:g,reserva:true}}));return;}
    const inst=src.clone(true);const meshes={},remover=[];
    inst.traverse(o=>{if(!o.isMesh)return;const parte=(/^mesh_\d+$/.test(o.name)||!o.name)?((o.parent&&o.parent.name)||''):o.name;o.userData.parte=parte;o.userData.arq=arq;
      if(opt.partes&&!opt.partes.includes(parte)){remover.push(o);return;}
      o.material=material(arq,parte,opt);const h=opt.hit?opt.hit(parte):null;if(h)o.userData.hit=h;meshes[parte]=o;});
    remover.forEach(o=>{if(o.parent)o.parent.remove(o);});
    const inner=new T.Group();inner.scale.setScalar(ESC);inst.position.set(0,-OY,0);inner.add(inst);g.add(inner);
    if(opt.centrar){const box=new T.Box3();const v=new T.Vector3();Object.values(meshes).forEach(o=>{o.updateMatrixWorld(true);if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox;for(let i=0;i<8;i++){v.set(i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z).applyMatrix4(o.matrixWorld);box.expandByPoint(v);}});
      if(!box.isEmpty()){const c=box.getCenter(new T.Vector3());g.worldToLocal(c);inner.position.sub(c);g.userData.centroLocal=c;}}
    g.userData.meshes=meshes;g.userData.inst=inst;g.userData.inner=inner;
    if(opt.aoCarregar)opt.aoCarregar(inst,meshes,g);
    g.userData.pronto=true;window.dispatchEvent(new CustomEvent('corpo:modelo',{detail:{key:arq,group:g}}));
  });
  return g;
}
/* ponto local (referencial do app) de uma coordenada em metros */
function ponto(x,y,z){return toLocal([x,y,z]);}
function centro(arq,parte){const c=C[arq]&&C[arq][parte];return c?toLocal(c):new T.Vector3();}
function precarregar(arqs){(arqs||Object.keys(C)).forEach(k=>carregar(k,()=>{}));}
window.ESQ_GLTF={ESC,OY,C,COR,modelo,ponto,centro,chave,lado,carregar,precarregar,ATRIBUICAO:'Modelos anatômicos: Z-Anatomy (CC BY-SA 4.0), adaptados pela NEWPC para o Portal 360º VR.'};
})();
