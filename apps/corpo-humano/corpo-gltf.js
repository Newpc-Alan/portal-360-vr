/* Corpo Humano Imersivo · carregador dos modelos anatômicos (Z-Anatomy, CC BY-SA 4.0)
   Fonte: Z-Anatomy (github.com/LluisV/Z-Anatomy), malhas convertidas de FBX para glTF e simplificadas pela NEWPC.
   Coordenadas originais em metros (corpo de 1,71 m, origem nos pés). Aqui: escala ESC e origem vertical OY (centro do tórax).
   Cada órgão vira um Group já posicionado no lugar anatômico; se o arquivo não carregar (rede da escola), o grupo
   recebe o modelo procedural de reserva passado pelo chamador. */
(function(){'use strict';
const T=THREE;
const ESC=7.5,OY=1.28;
const CENTROS={pulmoes:[-0.001,1.299,0.01],traqueia:[0,1.433,0.006],bronquios:[0.002,1.303,0.005],faringe:[0,1.5238,0.0375],esofago:[0.005,1.335,-0.008],estomago:[0.038,1.166,0.036],figado:[-0.012,1.175,0.023],intestino_delgado:[0.009,1.012,0.043],intestino_grosso:[0,0.975,0.008],coracao:[0.022,1.284,0.019],aorta:[0.011,1.213,-0.003],diafragma:[0.007,1.152,0.009],costelas:[0,1.255,0.008],silhueta:[0,0.854,0],laringe:[0,1.484,0.0197],nariz:[0,1.5766,0.0783],boca:[0,1.5259,0.0458],cabeca:[0,1.555,0.0047]};
const CORACAO_PARTES={atrioD:[-0.0145,1.2955,0.0291],atrioE:[0.021,1.3005,0.0113],ventD:[0.0197,1.2852,0.0477],ventE:[0.0424,1.2815,0.0281],aorta:[0.0112,1.3525,0.0006],pulmonar:[0.0259,1.3135,0.0117],cavas:[-0.0145,1.2042,0.0172],veiasPulm:[0.0053,1.3131,-0.0129]};
const CORES={pulmoes:0xd98585,traqueia:0x9ed6ef,bronquios:0xbfe3f4,faringe:0xaad8ef,esofago:0xe9a070,estomago:0xe08a50,figado:0x9e4d40,intestino_delgado:0xf0c07a,intestino_grosso:0xc99a6b,diafragma:0xb48ae8,costelas:0xe9e4d6,silhueta:0x8fc3dd,cabeca:0x8fc3dd,aorta:0xe8484f};
const CORES_PARTES={laringe:{tireoide:0xd8ecf3,cricoide:0xcfe3ee,aritenoide:0xc4dbe8,hioide:0xe9e4d6,epiglote:0xe7a0a0,laringofaringe:0xaad8ef},nariz:{cartilagens:0xd8ecf3,ossos:0xe9e4d6,conchas:0xe3b7b0,mucosa:0xe39a9a},faringe:{nasofaringe:0x9ed6ef,orofaringe:0xaad8ef,laringofaringe:0xbfe3f4},boca:{lingua:0xd96b73,palato:0xe8a39c,uvula:0xe08a90}};
const OPAC_PARTES={nariz:{mucosa:.8}};
const CORES_CORACAO={atrioD:0xb8343f,atrioE:0xd9434f,ventD:0xc43b48,ventE:0xd9434f,aorta:0xe8484f,pulmonar:0x4f7fe0,cavas:0x4f7fe0,veiasPulm:0xe8484f,coronarias:0x8f2a33};
const cache={},fila={};let loader=null;
function toLocal(p){return new T.Vector3(p[0]*ESC,(p[1]-OY)*ESC,p[2]*ESC);}
function material(key,parte){
  const cor=key==='coracao'?(CORES_CORACAO[parte]??CORES_CORACAO.ventE):(CORES_PARTES[key]?(CORES_PARTES[key][parte]??0xd8ecf3):(CORES[key]??0xcccccc));
  const m=new T.MeshStandardMaterial({color:cor,roughness:key==='costelas'?.7:.5,metalness:.05});
  if(key==='silhueta'||key==='cabeca'){m.transparent=true;m.opacity=key==='cabeca'?.16:.12;m.depthWrite=false;m.side=T.DoubleSide;}
  if(key==='costelas'){m.transparent=true;m.opacity=.62;}
  const op=OPAC_PARTES[key]&&OPAC_PARTES[key][parte];if(op!==undefined){m.transparent=true;m.opacity=op;m.depthWrite=false;}
  return m;
}
function carregar(key,cb){
  if(key in cache){cb(cache[key]);return;}
  if(fila[key]){fila[key].push(cb);return;}
  fila[key]=[cb];
  if(!T.GLTFLoader){cache[key]=null;fila[key].forEach(f=>f(null));delete fila[key];return;}
  loader=loader||new T.GLTFLoader();
  loader.load('modelos/'+key+'.glb?v=3',g=>{cache[key]=g.scene;fila[key].forEach(f=>f(g.scene));delete fila[key];},undefined,()=>{console.warn('Corpo Humano: modelo não carregou, usando reserva:',key);cache[key]=null;fila[key].forEach(f=>f(null));delete fila[key];});
}
/* orgao(key, reserva(), hitFn(parte)) → Group posicionado no lugar anatômico */
function orgao(key,reserva,hitFn,opt={}){
  const g=new T.Group();g.name='gltf:'+key;g.position.copy(toLocal(CENTROS[key]));g.userData.gltf=key;
  const hitDe=parte=>hitFn?hitFn(parte):null;
  carregar(key,src=>{
    if(!src){if(reserva){const r=reserva();r.traverse(o=>{if(o.isMesh){const h=hitDe(o.name);if(h)o.userData.hit=h;}});g.add(r);}g.userData.pronto=true;window.dispatchEvent(new CustomEvent('corpo:modelo',{detail:{key,group:g,reserva:true}}));return;}
    const inst=src.clone(true);
    inst.traverse(o=>{if(o.isMesh){const parte=o.name||(o.parent&&o.parent.name)||'';o.material=material(key,parte);if(opt.opacidade!==undefined){o.material.transparent=true;o.material.opacity=opt.opacidade;o.material.depthWrite=false;}const h=hitDe(parte);if(h)o.userData.hit=h;o.userData.parte=parte;}});
    const inner=new T.Group();inner.scale.setScalar(ESC);const c=CENTROS[key];inst.position.set(-c[0],-c[1],-c[2]);inner.add(inst);g.add(inner);
    g.userData.pronto=true;window.dispatchEvent(new CustomEvent('corpo:modelo',{detail:{key,group:g}}));
  });
  return g;
}
/* posição local (no mesmo referencial dos grupos) de um ponto dado em metros do Z-Anatomy */
function ponto(x,y,z){return toLocal([x,y,z]);}
/* centro local de uma parte do coração, relativo ao grupo do coração */
function parteCoracao(parte){const p=CORACAO_PARTES[parte],c=CENTROS.coracao;return new T.Vector3((p[0]-c[0])*ESC,(p[1]-c[1])*ESC,(p[2]-c[2])*ESC);}
function precarregar(keys){(keys||Object.keys(CENTROS)).forEach(k=>carregar(k,()=>{}));}
window.CORPO_GLTF={ESC,OY,CENTROS,CORACAO_PARTES,CORES,orgao,ponto,parteCoracao,carregar,precarregar,ATRIBUICAO:'Modelos anatômicos: Z-Anatomy (CC BY-SA 4.0), adaptados pela NEWPC para o Portal 360º VR.'};
})();
