/* Corpo Humano Imersivo · Laboratório (v3.5): Camadas, Monte o tórax, Coração e Do ar à célula.
 * Origem: prévia 4.0 (outra ferramenta), portada para a base v3.4 (navegação por sistema, espaço sem chão, relatório).
 * Usa o mesmo controlador, canal de voz e relatório das demais missões. Sem cadastro, telemetria ou servidor. */
(function () {
 'use strict';
 const T=window.THREE,D=window.CORPO_DATA,G=window.CORPO_GLTF,M=window.CORPO_MODELS;
 const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ID=['laboratorio','montagemTorax','coracaoLab','missaoOxigenio'];
 const CORE=['pulmaoD','coracao','pulmaoE','diafragma'];
 const LETTER={pulmaoD:'A',coracao:'B',pulmaoE:'C',diafragma:'D'};
 const PARTS={
  pulmaoD:{name:'Pulmão direito',file:'pulmoes_lobos',info:'pulmoes',layer:'respiratorio',filter:n=>n.startsWith('direito'),spread:V(-1.7,.15,0),tray:V(-2.75,.9,.25),color:0x729bdd},
  pulmaoE:{name:'Pulmão esquerdo',file:'pulmoes_lobos',info:'pulmoes',layer:'respiratorio',filter:n=>n.startsWith('esquerdo'),spread:V(1.7,.15,0),tray:V(2.75,.9,.25),color:0x94aee4},
  coracao:{name:'Coração',file:'coracao',info:'coracao',layer:'circulatorio',spread:V(0,0,1.9),tray:V(-2.55,-1.35,.35),color:0xec7078},
  diafragma:{name:'Diafragma',file:'diafragma',info:'diafragma',layer:'respiratorio',spread:V(0,-1.5,0),tray:V(2.55,-1.6,.25),color:0xbc99df},
  traqueia:{name:'Traqueia',file:'traqueia',info:'traqueia',layer:'respiratorio',spread:V(0,.7,0),color:0x78c8ce},
  bronquios:{name:'Brônquios',file:'bronquios',info:'bronquios',layer:'respiratorio',spread:V(0,.2,.8),color:0x93d8d5},
  aorta:{name:'Aorta',file:'aorta',info:'aorta',layer:'circulatorio',spread:V(.5,0,-.8),color:0xe77870},
  ossos:{name:'Caixa torácica',file:'costelas',info:'torax',layer:'ossos',color:0xeee2bd},
  pele:{name:'Superfície do corpo',file:'silhueta',info:'corpo',layer:'pele',color:0xafc5d4},
  musculos:{name:'Músculos do tórax',file:'musculos',info:'peitoral',layer:'musculos',filter:n=>n.startsWith('peitoral')||n.startsWith('reto_abdominal'),color:0xa95b67}
 };
 const PHASES=[{name:'Enchimento',text:'O coração recebe sangue durante o relaxamento.',keys:['atrioD','atrioE']},{name:'Contração dos átrios',text:'Os átrios ajudam a completar o enchimento dos ventrículos.',keys:['atrioD','atrioE']},{name:'Contração dos ventrículos',text:'Os ventrículos ejetam sangue para a circulação pulmonar e a circulação do corpo.',keys:['ventD','ventE']},{name:'Relaxamento',text:'O músculo relaxa e um novo ciclo começa.',keys:[]}];
 const MISSION=[
  {title:'O ar entra',info:'nariz',focus:'traqueia',scene:'torax',goal:'Tudo começa no nariz. Veja por onde o ar entra e como ele desce até a traqueia.'},
  {title:'Chegada aos pulmões',info:'pulmoes',focus:'pulmaoD',scene:'torax',goal:'O ar chegou aos pulmões. Localize os dois e prepare-se: vamos olhar bem de perto.'},
  {title:'Troca no alvéolo',info:'alveolos',scene:'micro',goal:'Estamos dentro de um alvéolo. Ative a passagem do oxigênio para o sangue e a do gás carbônico para o ar, e veja as duas trocas acontecerem.'},
  {title:'Retorno ao coração',info:'atrioE',focus:'atrioE',scene:'heart',goal:'O sangue, agora rico em oxigênio, volta dos pulmões e chega ao átrio esquerdo.'},
  {title:'Bombeamento',info:'ventE',focus:'ventE',scene:'heart',goal:'Encontre o ventrículo esquerdo. É ele que bombeia o sangue com força para o corpo inteiro.'},
  {title:'Distribuição pela aorta',info:'aorta',focus:'aorta',scene:'torax',goal:'Pela aorta, o sangue sai do coração e se espalha em artérias cada vez menores.'},
  {title:'Chegada às células',info:'corpo_celulas',scene:'blood',goal:'Chegamos a um capilar, bem fininho. Aqui o oxigênio deixa o sangue e entra nas células dos tecidos.'},
  {title:'Explique a conexão',info:'corpo_celulas',scene:'torax',goal:'Aplique o que você observou na pergunta final.'}
 ];
 const extra=[
  {id:ID[0],label:'Camadas',title:'Descubra o corpo por dentro.',subtitle:'Escolha uma estrutura. Isole, separe e investigue.',kicker:'LABORATÓRIO',modulo:'resp'},
  {id:ID[1],label:'Monte o tórax',title:'Cada órgão tem seu lugar.',subtitle:'Posicione quatro estruturas e reconstrua o tórax.',kicker:'MISSÃO PRÁTICA',modulo:'resp'},
  {id:ID[2],label:'Coração',title:'Conheça o coração em detalhe.',subtitle:'Explore as partes e acompanhe o ciclo didático.',kicker:'ANATOMIA EM FOCO',modulo:'resp'},
  {id:ID[3],label:'Do ar à célula',title:'Siga o caminho do oxigênio.',subtitle:'Oito etapas conectam respiração e circulação.',kicker:'INVESTIGAÇÃO GUIADA',modulo:'resp'}
 ];
 D.activities.push(...extra);
 /* missões dentro dos sistemas (v3.3) */
 const ins=(sid,id,depois)=>{const sis=D.sistemas.find(x=>x.id===sid);if(!sis||sis.atividades.includes(id))return;const i=sis.atividades.indexOf(depois);sis.atividades.splice(i<0?sis.atividades.length:i+1,0,id);};
 ins('respiratorio','laboratorio','contexto');ins('respiratorio','montagemTorax','respire');ins('circulatorio','coracaoLab','explorar');ins('circulatorio','missaoOxigenio','caminhoSangue');
 /* passos da aula guiada (chaves de áudio lab-*: MP3 quando gravado; até lá, voz do navegador ou texto) */
 D.guide.push(
  {view:'laboratorio',title:'Veja o corpo em camadas',goal:'Aqui o corpo se abre em camadas. Toque no coração, nos pulmões ou no diafragma e ligue e desligue as camadas para ver quem fica ao lado de quem.',check:'laboratorio',audio:'lab-camadas'},
  {view:'montagemTorax',title:'Reconstrua o tórax',goal:'Agora é com você: coloque os dois pulmões, o coração e o diafragma no lugar certo. As sombras no tórax mostram onde cada um se encaixa.',check:'montagemTorax',audio:'lab-montagem'},
  {view:'coracaoLab',title:'Por dentro do coração',goal:'Vamos entrar no coração. Toque em cada uma das quatro cavidades e acompanhe o ciclo, do enchimento ao relaxamento.',check:'coracaoLab',audio:'lab-coracao'},
  {view:'missaoOxigenio',title:'Do ar à célula',goal:'Siga o oxigênio em oito etapas, do ar que entra pelo nariz até a célula. No final, responda à pergunta.',check:'missaoOxigenio',audio:'lab-missao'});
 const btn=(label,cmd,cls='',disabled=false,pressed)=>'<button type="button" data-act="'+esc(cmd)+'" class="'+cls+'"'+(disabled?' disabled':'')+(pressed===undefined?'':' aria-pressed="'+pressed+'"')+'>'+esc(label)+'</button>';
 const range=(key,label,value,min,max,step=1)=>'<label class="v4-range">'+esc(label)+' <output>'+Math.round(value)+(max===100?'%':'')+'</output><input type="range" data-v4-range="'+key+'" value="'+value+'" min="'+min+'" max="'+max+'" step="'+step+'"></label>';
 const meter=(n,total,label)=>'<div class="v4-progress"><div><span>'+esc(label)+'</span><b>'+n+' / '+total+'</b></div><progress value="'+n+'" max="'+total+'"></progress></div>';
 let rt=null;
 const accepts=view=>ID.includes(view);
 function initial(){return{selected:null,layers:{pele:false,ossos:true,respiratorio:true,circulatorio:true,musculos:false},bonesOpacity:28,spread:0,style:'anatomico',playing:true,breath:'auto',isolate:false,cut:false,cutAxis:'frontal',cutPosition:50,placed:[],target:null,errors:0,hints:0,attempts:[],undo:[],heartPart:null,heartPhase:0,missionStep:0,missionAnswer:null,missionDone:false,gas:{o2:false,co2:false},seen:[],heartSeen:[]};}
 function infoFor(key){const p=PARTS[key];return p?Object.assign({},D.info[p.info],{name:p.name,key:p.info}):Object.assign({},D.info[key]||D.info.coracao,{key:D.info[key]?key:'coracao'});}
 function selectedCard(s){if(!s.selected||!PARTS[s.selected])return '<div class="v4-tip">Selecione um órgão na cena ou nos botões. A explicação aparece aqui, sem cobrir o modelo.</div>';
  const i=infoFor(s.selected);return '<section class="v4-selection"><span class="eyebrow">ESTRUTURA SELECIONADA</span><h3>'+esc(i.name)+'</h3><p>'+esc(i.text)+'</p><div class="button-row">'+btn('Ouvir explicação','v4:listen','primary')+btn(s.isolate?'Mostrar conjunto':'Isolar órgão','v4:isolate','',false,s.isolate)+'</div></section>';}
 function cutTools(s){return '<details class="v4-details"'+(s.cut?' open':'')+'><summary>Corte visual de estudo</summary><div class="button-row">'+btn(s.cut?'Desativar corte':'Ativar corte','v4:cut','',false,s.cut)+'</div>'+(s.cut?'<div class="v4-segment">'+[['frontal','Frontal'],['lateral','Lateral'],['transversal','Transversal']].map(([v,l])=>btn(l,'v4:axis:'+v,'',false,s.cutAxis===v)).join('')+'</div>'+range('cutPosition','Posição do corte',s.cutPosition,0,100)+'<div class="button-row">'+btn('Recuar corte','v4:cutStep:-10')+btn('Avançar corte','v4:cutStep:10')+'</div>':'')+'<p class="fine">Corta as superfícies disponíveis. Não preenche a secção nem cria tecidos internos ausentes. Não é uma imagem de tomografia.</p></details>';}
 function sidebar(S){const s=S.v4;let html='',text='',key=null;
  if(S.view==='laboratorio'){
   html='<span class="eyebrow">EXPLORE NO SEU RITMO</span><h2>Corpo em camadas</h2><p class="v4-intro">Um mesmo modelo. Diferentes formas de descobrir.</p>';
   html+='<div class="v4-segment">'+btn('Anatômico','v4:style:anatomico','',false,s.style==='anatomico')+btn('Didático','v4:style:didatico','',false,s.style==='didatico')+'</div>';
   html+='<details class="v4-details" open><summary>Camadas e transparência</summary><div class="v4-layers">'+[['pele','Superfície'],['ossos','Ossos'],['respiratorio','Respiração'],['circulatorio','Circulação'],['musculos','Músculos']].map(([k,l])=>btn((s.layers[k]?'✓ ':'')+l,'v4:layer:'+k,'',false,s.layers[k])).join('')+'</div>'+range('bonesOpacity','Opacidade dos ossos',s.bonesOpacity,0,100)+'<div class="button-row v4-small">'+btn('− Opacidade','v4:opacity:-20')+btn('+ Opacidade','v4:opacity:20')+'</div>'+range('spread','Separar estruturas',s.spread,0,100)+'<div class="button-row v4-small">'+btn('− Separação','v4:spread:-25')+btn('+ Separação','v4:spread:25')+'</div></details>';
   html+='<div class="v4-organ-list">'+['coracao','pulmaoD','pulmaoE','diafragma','traqueia','bronquios'].map(k=>btn(PARTS[k].name,'v4:select:'+k,'',false,s.selected===k)).join('')+'</div>'+selectedCard(s);
   html+='<div class="button-row">'+btn(s.playing?'Pausar animação':'Animar respiração','v4:play','primary',false,s.playing)+btn('Restaurar anatomia','v4:restore')+'</div><div class="button-row v4-small">'+btn('Inspirar','v4:breath:in')+btn('Expirar','v4:breath:out')+'</div>'+cutTools(s);
   text=s.selected?infoFor(s.selected).text:'Aqui o corpo se abre em camadas. Toque no coração, nos pulmões ou no diafragma e ligue e desligue as camadas para ver quem fica ao lado de quem.';key=s.selected?infoFor(s.selected).key:'lab-camadas';
  }else if(S.view==='montagemTorax'){
   const done=s.placed.length===CORE.length;
   html='<span class="eyebrow">MISSÃO · LOCALIZAR E POSICIONAR</span><h2>Reconstrua o tórax</h2><p>Arraste as peças para as referências translúcidas. Você também pode escolher uma peça e um destino abaixo.</p>'+meter(s.placed.length,4,'Estruturas posicionadas');
   html+='<h3>1. Escolha a peça</h3><div class="v4-organ-list">'+CORE.map(k=>btn((s.placed.includes(k)?'✓ ':'')+PARTS[k].name,'v4:select:'+k,'',s.placed.includes(k),s.selected===k)).join('')+'</div>';
   html+='<h3>2. Escolha o destino</h3><div class="v4-targets">'+CORE.map(k=>btn(LETTER[k],'v4:target:'+LETTER[k],'',s.placed.includes(k),s.target===LETTER[k])).join('')+'</div>';
   html+='<div class="button-row">'+btn('Encaixar peça','v4:place','primary',!s.selected||!s.target||done)+btn('Uma pista','v4:hint','',done)+'</div><div class="button-row v4-small">'+btn('Girar −15°','v4:turn:-15','',!s.selected)+btn('Girar +15°','v4:turn:15','',!s.selected)+btn('Alinhar peça','v4:align','',!s.selected)+'</div>';
   html+='<div class="metric-row"><span>Tentativas incorretas</span><b>'+s.errors+'</b></div><div class="metric-row"><span>Pistas consultadas</span><b>'+s.hints+'</b></div><div class="button-row">'+btn('Desfazer encaixe','v4:undo','',!s.undo.length)+btn('Recomeçar','v4:restartAssembly')+'</div>';
   if(done)html+='<div class="v4-success"><b>Tórax reconstruído.</b><p>Agora conecte a posição das estruturas ao percurso do oxigênio.</p>'+btn('Seguir para Do ar à célula','view:missaoOxigenio','primary')+'</div>';
   html+='<p class="fine">D e E referem-se ao corpo observado, não ao observador. No VR, use o botão lateral do controle para segurar a peça.</p>';
   text=done?'Tórax reconstruído! Repare como tudo se encaixa: os pulmões abraçam o coração, e o diafragma fecha o tórax por baixo.':'Agora é com você: coloque os dois pulmões, o coração e o diafragma no lugar certo. As sombras no tórax mostram onde cada um se encaixa.';key=done?'lab-montagem-fim':'lab-montagem';
  }else if(S.view==='coracaoLab'){
   const i=infoFor(s.heartPart||'coracao'),phase=PHASES[s.heartPhase];
   html='<span class="eyebrow">ANATOMIA EM FOCO</span><h2>Por dentro do coração</h2><p>Selecione uma cavidade ou acompanhe uma etapa do ciclo didático.</p><div class="v4-organ-list">'+[['atrioD','Átrio direito'],['atrioE','Átrio esquerdo'],['ventD','Ventrículo direito'],['ventE','Ventrículo esquerdo']].map(([k,l])=>btn(l,'v4:heartpart:'+k,'',false,s.heartPart===k)).join('')+'</div>';
   html+='<section class="v4-selection"><span class="eyebrow">'+esc(i.kind)+'</span><h3>'+esc(i.name)+'</h3><p>'+esc(i.text)+'</p>'+btn('Ouvir explicação','v4:listen','primary')+'</section>';
   html+='<div class="v4-cycle"><span>ETAPA DO CICLO</span><strong id="v4CycleLabel">'+phase.name+'</strong><p id="v4CycleText">'+phase.text+'</p></div><div class="button-row">'+btn(s.playing?'Pausar ciclo':'Animar ciclo','v4:play','primary',false,s.playing)+btn('Próxima etapa','v4:heartstep')+'</div>'+cutTools(s)+'<p class="fine">Movimentos e tempos são ilustrativos. Não há cálculo de pressão, frequência cardíaca ou desempenho clínico.</p>';
   text=i.text;key=i.key;
  }else{
   const step=MISSION[s.missionStep],final=s.missionStep===MISSION.length-1,q=D.questions.find(x=>x.id==='celulas');
   html='<span class="eyebrow">MISSÃO · CONECTAR OS SISTEMAS</span><h2>'+esc(step.title)+'</h2>'+meter(s.missionStep+1,MISSION.length,'Etapa da investigação')+'<p>'+esc(step.goal)+'</p>';
   if(!final)html+='<section class="v4-selection"><span class="eyebrow">'+esc(D.info[step.info].name)+'</span><p>'+esc(D.info[step.info].text)+'</p>'+btn('Ouvir explicação','v4:listen','primary')+'</section>';
   if(step.scene==='micro')html+='<div class="button-row">'+btn((s.gas.o2?'✓ ':'')+'O₂ → sangue','v4:gas:o2','',s.gas.o2)+btn((s.gas.co2?'✓ ':'')+'CO₂ → ar','v4:gas:co2','',s.gas.co2)+'</div><p class="fine">Partículas e escalas ampliadas para leitura. Azul é uma convenção didática, não a cor natural do sangue.</p>';
   if(final){html+='<p><b>'+esc(q.q)+'</b></p><div class="answer-list">'+q.options.map((o,i)=>btn(o,'v4:answer:'+i,s.missionAnswer===null?'':i===q.correct?'correct':i===s.missionAnswer?'incorrect':'',s.missionAnswer!==null)).join('')+'</div>';if(s.missionAnswer!==null)html+='<div class="v4-success"><b>'+(s.missionAnswer===q.correct?'Conexão identificada.':'Vamos revisar a conexão.')+'</b><p>'+esc(q.why)+'</p>'+btn('Ver meu resumo','summary','primary')+'</div>';}
   const blocked=s.missionStep===2&&(!s.gas.o2||!s.gas.co2);
   html+='<div class="button-row">'+btn('Etapa anterior','v4:mission:back','',s.missionStep===0)+btn('Próxima etapa','v4:mission:next','primary',final||blocked)+'</div>'+btn('Recomeçar investigação','v4:restartMission','wide');
   if(blocked)html+='<p class="fine">Ative as duas trocas para continuar.</p>';
   text=final?q.q:step.goal;key=final?'desafio-celulas':('lab-missao-'+(s.missionStep+1));
  }
  return{html,text,key};
 }
 function cloneMaterial(m){const n=m.clone();n.userData.sharedTextures=!!m.map;n.side=T.DoubleSide;n.metalness=0;n.roughness=.68;return n;}
 function buildOrgan(key,r,options={}){
  const cfg=PARTS[key],g=new T.Group();g.name='v4:'+key;g.userData.v4organ=key;g.userData.layer=cfg.layer;g.userData.home=G.ponto(...(G.CENTROS[cfg.file]||[0,1.28,0])).toArray();g.position.fromArray(g.userData.home);r.organs[key]=g;r.anatomy.add(g);g.userData.draggable=r.assembly&&CORE.includes(key)&&!r.state.v4.placed.includes(key);
  G.carregar(cfg.file,src=>{
   if(r.group.userData.disposed)return;
   if(!src){g.userData.failed=true;document.getElementById('v4Phase').textContent='MODELO INDISPONÍVEL · '+cfg.name.toUpperCase();return;}
   const obj=src.clone(true),remove=[];obj.traverse(o=>{if(!o.isMesh)return;const name=(!o.name||/^mesh_\d+$/.test(o.name))?(o.parent&&o.parent.name||''):o.name;if(cfg.filter&&!cfg.filter(name)){remove.push(o);return;}o.geometry=o.geometry.clone();if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals();const base=G.material(cfg.file==='pulmoes_lobos'?'pulmoes':cfg.file,name);if(key==='musculos')base.color.setHex(0xb8343f);o.material=cloneMaterial(base);o.material.userData.baseColor=o.material.color.getHex();o.userData.part=name;o.userData.hit={type:'v4',command:r.heart?'v4:heartpart:'+(['atrioD','atrioE','ventD','ventE','aorta'].includes(name)?name:'coracao'):'v4:select:'+key};r.materials.push({mesh:o,key,part:name,material:o.material,base:o.material.color.clone()});});
   remove.forEach(o=>o.removeFromParent?o.removeFromParent():o.parent.remove(o));
   obj.updateMatrixWorld(true);const box=new T.Box3().setFromObject(obj);if(box.isEmpty()){g.userData.failed=true;return;}
   const center=box.getCenter(V());obj.position.sub(center);const scaled=new T.Group();scaled.scale.setScalar(G.ESC);scaled.add(obj);g.add(scaled);g.userData.home=G.ponto(center.x,center.y,center.z).toArray();g.position.fromArray(g.userData.home);g.userData.ready=true;
   if(r.heart){g.userData.home=[0,0,0];g.position.set(0,0,0);g.userData.displayScale=3;g.scale.setScalar(3);}
   if(r.assembly&&CORE.includes(key)){
    const ghost=new T.Group();ghost.name='referencia:'+key;const c=scaled.clone(true);c.traverse(o=>{if(o.isMesh){o.material=new T.MeshBasicMaterial({color:0x91b6c9,transparent:true,opacity:.11,depthWrite:false,side:T.DoubleSide});o.userData.hit={type:'v4',command:'v4:target:'+LETTER[key]};}});ghost.add(c);ghost.position.fromArray(g.userData.home);r.ghosts[key]=ghost;r.references.add(ghost);
    const dot=new T.Mesh(new T.SphereGeometry(.105,16,12),new T.MeshBasicMaterial({color:0xdbedff,transparent:true,opacity:.85}));dot.position.fromArray(g.userData.home);dot.position.z+=.65;dot.userData.hit={type:'v4',command:'v4:target:'+LETTER[key]};r.references.add(dot);r.dots[key]=dot;
    const lab=M.label(LETTER[key],'#d7eaff',.38,82);lab.position.copy(dot.position).add(V(.14,.14,0));r.references.add(lab);r.labels[key]=lab;
    if(!r.state.v4.placed.includes(key))g.position.copy(cfg.tray);
   }
   sync(r.state,r.view);window.dispatchEvent(new CustomEvent('corpo:modelo',{detail:{key:cfg.file,group:g}}));
  });return g;
 }
 function create(S,view){
  const group=new T.Group(),anatomy=new T.Group(),references=new T.Group();group.add(anatomy,references);
  const mission=S.view==='missaoOxigenio'?MISSION[S.v4.missionStep]:null;
  const r={group,anatomy,references,state:S,view,organs:{},ghosts:{},dots:{},labels:{},materials:[],assembly:S.view==='montagemTorax',heart:S.view==='coracaoLab'||mission?.scene==='heart',mission,clock:0,phaseClock:0,breath:0,plane:new T.Plane(),nextHud:0,ready:false};rt=r;
  if(mission?.scene==='micro'){const m=M.alveolo(S.v4.gas);anatomy.add(m);r.micro=m;}
  else if(mission?.scene==='blood'){const m=M.inspection('sangue');anatomy.add(m);r.micro=m;}
  else if(r.heart)buildOrgan('coracao',r);
  else{
   ['pulmaoD','pulmaoE','coracao','diafragma','traqueia','bronquios','aorta','ossos'].forEach(k=>buildOrgan(k,r));
   if(!r.assembly){buildOrgan('pele',r);if(S.v4.layers.musculos)buildOrgan('musculos',r);}
  }
  group.userData.tickV4=dt=>tick(r,dt);group.userData.v4=true;
  if(mission){S.v4.selected=mission.focus&&PARTS[mission.focus]?mission.focus:null;S.v4.heartPart=r.heart?mission.focus:null;}
  sync(S,view);return group;
 }
 function sync(S,view){if(!rt||rt.state!==S)return;const r=rt,s=S.v4,heartMode=r.heart,usingMission=!!r.mission;
  for(const [k,g] of Object.entries(r.organs)){
   const cfg=PARTS[k];g.visible=heartMode?true:usingMission?(k!=='pele'&&k!=='musculos'):(r.assembly?true:!!s.layers[cfg.layer]);
   if(!r.assembly&&!usingMission&&!heartMode&&s.isolate)g.visible=k===s.selected;
   if(g.userData.ready&&!r.assembly&&!g.userData.held){
    if(s.isolate&&!usingMission&&!heartMode&&k===s.selected){g.position.set(0,0,0);g.scale.setScalar(k==='coracao'?3:k==='diafragma'?1.4:1.6);}
    else{g.position.fromArray(g.userData.home);g.scale.setScalar(g.userData.displayScale||1);if(!usingMission&&!heartMode&&cfg.spread)g.position.addScaledVector(cfg.spread,s.spread/100);}
   }
   if(k==='pele')g.userData.semEnquadre=true;
   if(r.assembly){g.userData.draggable=CORE.includes(k)&&!s.placed.includes(k);if(s.placed.includes(k)&&!g.userData.held){g.position.fromArray(g.userData.home);g.quaternion.identity();}if(r.ghosts[k])r.ghosts[k].visible=!s.placed.includes(k);if(r.dots[k]){r.dots[k].visible=!s.placed.includes(k);r.dots[k].material.color.setHex(s.target===LETTER[k]?0xffd785:0xdbeeff);}if(r.labels[k])r.labels[k].visible=!s.placed.includes(k);}
  }
  const doCut=s.cut&&(S.view==='laboratorio'||S.view==='coracaoLab');
  r.materials.forEach(({material:m,key:k,base,part})=>{
   m.color.copy(base);if(s.style==='didatico'&&!heartMode)m.color.setHex(PARTS[k].color);
   let opacity=1;if(k==='ossos')opacity=r.assembly?.17:usingMission?.16:s.bonesOpacity/100;if(k==='pele')opacity=.1;if(k==='musculos')opacity=.75;
   m.opacity=opacity;m.transparent=opacity<.999;m.depthWrite=opacity>=.95;
   const sel=heartMode?((s.heartPart||r.mission?.focus)===part):s.selected===k;
   m.emissive.setHex(sel?0x193843:0);m.emissiveIntensity=sel?.8:0;
   if(!!m.clippingPlanes!==doCut){m.clippingPlanes=doCut?[r.plane]:null;m.needsUpdate=true;}
  });
  if(view&&view.refreshHits)view.refreshHits();
 }
 function tick(r,dt){if(r.group.userData.disposed)return;const S=r.state,s=S.v4,paused=S.reducedMotion||(!s.playing&&!r.mission);if(!paused)r.clock+=dt;
  const desired=s.breath==='in'?1:s.breath==='out'?0:(Math.sin(r.clock*1.1-Math.PI/2)+1)/2;
  if(!paused||s.breath!=='auto')r.breath+=(desired-r.breath)*Math.min(1,dt*3);
  if(!r.assembly&&!r.micro){
   for(const [k,o] of Object.entries(r.organs)){
    if(!o.userData.ready||o.userData.held)continue;const isolated=s.isolate&&!r.mission&&!r.heart&&s.selected===k,base=o.userData.displayScale||(isolated?(k==='coracao'?3:k==='diafragma'?1.4:1.6):1);
    if(k==='pulmaoD'||k==='pulmaoE')o.scale.set(base*(1+.045*r.breath),base*(1+.065*r.breath),base*(1+.04*r.breath));
    if(k==='diafragma'){const y=isolated?0:o.userData.home[1]+(!r.mission&&!r.heart?-1.5*s.spread/100:0);o.position.y=y-.18*r.breath;o.scale.set(base,base*(1-.15*r.breath),base);}
    if(k==='coracao'){const pulse=paused?0:Math.max(0,Math.sin(r.clock*5.4))*.028;o.scale.setScalar(base*(1+pulse));}
   }
  }
  if(r.micro?.userData.tick)r.micro.userData.tick(r.clock);
  if(r.heart&&s.playing&&!S.reducedMotion&&!r.mission){r.phaseClock+=dt;if(r.phaseClock>2){r.phaseClock=0;s.heartPhase=(s.heartPhase+1)%4;const a=document.getElementById('v4CycleLabel'),b=document.getElementById('v4CycleText');if(a)a.textContent=PHASES[s.heartPhase].name;if(b)b.textContent=PHASES[s.heartPhase].text;}}
  if(r.heart){const phaseKeys=PHASES[s.heartPhase].keys;r.materials.forEach(({material:m,part})=>{const active=(s.heartPart||r.mission?.focus)?(s.heartPart||r.mission.focus)===part:phaseKeys.includes(part);m.emissive.setHex(active?0x54212a:0);m.emissiveIntensity=active?.5:0;});}
  if(s.cut){const normal=s.cutAxis==='lateral'?V(-1,0,0):s.cutAxis==='transversal'?V(0,-1,0):V(0,0,-1);const extent=s.cutAxis==='frontal'?(r.heart?1.5:1.2):2.3;r.group.updateMatrixWorld(true);r.plane.set(normal,(s.cutPosition/100-.5)*extent*2).applyMatrix4(r.group.matrixWorld);}
  r.nextHud+=dt;if(r.nextHud>.3){r.nextHud=0;const phase=document.getElementById('v4Phase');if(phase){const loading=Object.values(r.organs).some(g=>!g.userData.ready&&!g.userData.failed),failed=Object.values(r.organs).some(g=>g.userData.failed);phase.textContent=failed?'ALGUM MODELO NÃO CARREGOU':loading?'CARREGANDO ANATOMIA':r.assembly?s.placed.length+' DE 4 ESTRUTURAS':r.mission?'ETAPA '+(s.missionStep+1)+' · '+r.mission.title.toUpperCase():r.heart?PHASES[s.heartPhase].name.toUpperCase():!s.playing?'ANIMAÇÃO PAUSADA':r.breath>.55?'INSPIRAÇÃO · MODELO DIDÁTICO':'EXPIRAÇÃO · MODELO DIDÁTICO';}}
 }
 function refresh(api,rebuild=false){api.sidebar();if(rebuild)api.render();else sync(api.state,api.view);api.save();}
 function hear(api){const S=api.state,s=S.v4;let key=S.view==='missaoOxigenio'?MISSION[s.missionStep].info:S.view==='coracaoLab'?(s.heartPart||'coracao'):PARTS[s.selected]?.info;
  if(!key){const p=sidebar(S);api.narrator.say(p.text,p.key||null);return;}const i=D.info[key]||D.info.coracao;api.narrator.say(i.text,D.info[key]?key:'coracao');}
 function narrarEtapa(api){const S=api.state,s=S.v4;if(!S.autoVoice)return;const step=MISSION[s.missionStep],final=s.missionStep===MISSION.length-1;if(final){api.narrator.say(D.questions.find(x=>x.id==='celulas').q,'desafio-celulas');return;}const i=D.info[step.info];api.narrator.say(step.goal,'lab-missao-'+(s.missionStep+1),{text:i.text,key:step.info});}
 function recordAttempt(api,key,destination,ok,method){const s=api.state.v4;s.attempts.push({piece:key,target:destination,correct:ok,method,at:new Date().toISOString()});if(s.attempts.length>200)s.attempts.shift();api.log('tentativa','montagemTorax',{component:key,choice:destination,correct:ok,method});if(!ok)s.errors++;}
 function place(api,key,letter,method='buttons',orientationOK=true){const s=api.state.v4;if(!CORE.includes(key)||s.placed.includes(key))return;const ok=LETTER[key]===letter&&orientationOK;recordAttempt(api,key,letter,ok,method);
  if(ok){s.placed.push(key);s.undo.push(key);s.selected=null;s.target=null;const g=rt?.organs[key];if(g){g.position.fromArray(g.userData.home);g.quaternion.identity();g.scale.setScalar(1);g.userData.draggable=false;}if(s.placed.length===4)api.mark('montagemTorax');refresh(api);api.fb(s.placed.length===4?'Tórax reconstruído. Você posicionou as quatro estruturas.':'Encaixe correto: '+PARTS[key].name+'.');if(s.placed.length===4&&api.state.autoVoice)api.narrator.say('Tórax reconstruído! Repare como tudo se encaixa: os pulmões abraçam o coração, e o diafragma fecha o tórax por baixo.','lab-montagem-fim');}
  else{refresh(api);api.fb(orientationOK?'Observe novamente a posição dessa estrutura. A referência escolhida pertence a outra peça.':'A posição está próxima, mas a orientação precisa ser ajustada. Use Alinhar peça e tente de novo.','warning');}
 }
 function drop(g,api){if(!g||!g.userData.v4organ||!rt)return;const key=g.userData.v4organ,s=api.state.v4;if(!rt.assembly)return;
  let nearest=null,dist=Infinity;CORE.forEach(k=>{const a=rt.organs[k];if(!a?.userData.ready||s.placed.includes(k))return;const d=g.position.distanceTo(V().fromArray(a.userData.home));if(d<dist){dist=d;nearest=k;}});
  if(nearest&&dist<.62){const angle=g.quaternion.angleTo(new T.Quaternion());place(api,key,LETTER[nearest],'drag',angle<.65);}
  else{recordAttempt(api,key,'fora',false,'drag');api.fb('Aproxime o órgão de uma referência. Os botões da lateral oferecem a mesma atividade.','warning');refresh(api);}
  if(!s.placed.includes(key)){g.position.copy(PARTS[key].tray);sync(api.state,api.view);}api.save();
 }
 function command(cmd,api){
  if(!cmd.startsWith('v4:'))return false;
  const [,op,arg]=cmd.split(':'),S=api.state,s=S.v4;let rebuild=false;
  if(op==='select'){
   if(!PARTS[arg])return true;s.selected=arg;s.isolate=false;if(!s.seen.includes(arg))s.seen.push(arg);const ik=PARTS[arg].info;if(!S.visited.includes(ik))S.visited.push(ik);api.log('inspecao','laboratorio',{component:arg});if(S.view==='laboratorio'&&s.seen.length>=3)api.mark('laboratorio');refresh(api);if(S.autoVoice)hear(api);return true;
  }
  if(op==='layer'&&arg in s.layers){s.layers[arg]=!s.layers[arg];s.isolate=false;if(arg==='musculos'&&s.layers.musculos&&rt&&!rt.organs.musculos)buildOrgan('musculos',rt);}
  else if(op==='style'&&['anatomico','didatico'].includes(arg))s.style=arg;
  else if(op==='spread')s.spread=T.MathUtils.clamp(s.spread+Number(arg),0,100);
  else if(op==='isolate'){if(!s.selected)return true;s.isolate=!s.isolate;}
  else if(op==='restore'){s.spread=0;s.isolate=false;s.cut=false;s.layers=initial().layers;s.bonesOpacity=28;s.breath='auto';if(api.view)api.view.center();}
  else if(op==='play'){s.playing=!s.playing;s.breath='auto';}
  else if(op==='breath'){s.playing=false;s.breath=arg;}
  else if(op==='cut')s.cut=!s.cut;
  else if(op==='axis'&&['frontal','lateral','transversal'].includes(arg)){s.cutAxis=arg;s.cutPosition=50;}
  else if(op==='cutStep')s.cutPosition=T.MathUtils.clamp(s.cutPosition+Number(arg),0,100);
  else if(op==='listen'){hear(api);return true;}
  else if(op==='target'&&Object.values(LETTER).includes(arg))s.target=arg;
  else if(op==='place'){if(s.selected&&s.target)place(api,s.selected,s.target);return true;}
  else if(op==='turn'||op==='align'){const g=rt?.organs[s.selected];if(g&&!s.placed.includes(s.selected)){if(op==='align')g.quaternion.identity();else g.rotation.z+=T.MathUtils.degToRad(Number(arg));}api.save();return true;}
  else if(op==='hint'){s.hints++;api.log('pista','montagemTorax',{component:s.selected||''});const k=s.selected&&CORE.includes(s.selected)?s.selected:CORE.find(x=>!s.placed.includes(x));api.fb(k?'Observe '+PARTS[k].name.toLowerCase()+': a referência '+LETTER[k]+' indica sua posição no corpo.':'A montagem já está completa.','warning');refresh(api);return true;}
  else if(op==='undo'){const k=s.undo.pop();if(k){s.placed=s.placed.filter(x=>x!==k);S.completed=S.completed.filter(x=>x!=='montagemTorax');const g=rt?.organs[k];if(g){g.position.copy(PARTS[k].tray);g.quaternion.identity();}api.log('desfazer','montagemTorax',{component:k});}}
  else if(op==='restartAssembly'){Object.assign(s,{placed:[],undo:[],selected:null,target:null,errors:0,hints:0,attempts:[]});S.completed=S.completed.filter(x=>x!=='montagemTorax');rebuild=true;}
  else if(op==='opacity'){s.bonesOpacity=T.MathUtils.clamp(s.bonesOpacity+Number(arg),0,100);}
  else if(op==='heartpart'){s.heartPart=arg;s.selected='coracao';if(!S.visited.includes(arg)&&D.info[arg])S.visited.push(arg);api.log('inspecao','coracaoLab',{component:arg});if(!s.heartSeen)s.heartSeen=[];if(!s.heartSeen.includes(arg))s.heartSeen.push(arg);if(s.heartSeen.length>=4)api.mark('coracaoLab');refresh(api);if(S.autoVoice)hear(api);return true;}
  else if(op==='heartstep'){s.playing=false;s.heartPhase=(s.heartPhase+1)%4;}
  else if(op==='gas'){if(['o2','co2'].includes(arg)){s.gas[arg]=true;api.log('troca','missaoOxigenio',{gas:arg});}}
  else if(op==='mission'){
   if(arg==='next'&&s.missionStep===2&&(!s.gas.o2||!s.gas.co2))return true;
   s.missionStep=T.MathUtils.clamp(s.missionStep+(arg==='next'?1:-1),0,MISSION.length-1);api.narrator.stop();api.log('etapa','missaoOxigenio',{position:s.missionStep});refresh(api,true);narrarEtapa(api);return true;
  }
  else if(op==='answer'){if(s.missionAnswer!==null)return true;const q=D.questions.find(x=>x.id==='celulas'),a=Number(arg);if(!Number.isInteger(a)||a<0||a>=q.options.length)return true;s.missionAnswer=a;s.missionDone=true;api.mark('missaoOxigenio');api.log('avaliacao','integracao',{question:'celulas',choice:a,correct:a===q.correct});if(S.autoVoice)api.narrator.say('Lembre o caminho: o oxigênio entra no sangue nos alvéolos, volta ao coração, é bombeado pela aorta e chega a cada célula do corpo.','desafio-celulas-explica');}
  else if(op==='restartMission'){Object.assign(s,{missionStep:0,missionAnswer:null,missionDone:false,gas:{o2:false,co2:false}});S.completed=S.completed.filter(x=>x!=='missaoOxigenio');rebuild=true;}
  refresh(api,rebuild);return true;
 }
 function gripStart(ctrl,api){if(api.state.view!=='montagemTorax'||!rt?.assembly)return false;const view=api.view,ray=view.controllerRay(ctrl),hit=view.hits(ray)[0];if(!hit)return true;let g=hit.object;while(g&&!g.userData.v4organ)g=g.parent;if(!g||!CORE.includes(g.userData.v4organ)||!g.userData.ready||api.state.v4.placed.includes(g.userData.v4organ))return true;
  const grip=ctrl.userData.grip||ctrl;g._v4Parent=g.parent;g.userData.held=true;grip.attach(g);g.position.set(0,-.02,-.24);view.held.set(ctrl,g);api.state.v4.selected=g.userData.v4organ;api.sidebar();return true;
 }
 function gripEnd(ctrl,api){const g=api.view?.held.get(ctrl);if(!g?.userData.v4organ)return false;const parent=g._v4Parent;if(parent)parent.attach(g);g.userData.held=false;delete g._v4Parent;api.view.held.delete(ctrl);drop(g,api);return true;}
 function report(S){const s=S.v4;return{estruturasInvestigadas:[...s.seen],montagem:{colocadas:[...s.placed],tentativasIncorretas:s.errors,pistas:s.hints,tentativas:[...s.attempts]},missaoOxigenio:{etapa:s.missionStep+1,concluida:s.missionDone,resposta:s.missionAnswer,trocas:{...s.gas}},coracao:[...(s.heartSeen||[])],aviso:'Registros de interação, não um diagnóstico de aprendizagem.'};}
 document.addEventListener('input',e=>{const k=e.target.dataset?.v4Range;if(!k||!['spread','bonesOpacity','cutPosition'].includes(k)||!window.CorpoLab)return;const api=window.CorpoLab.getAPI();api.state.v4[k]=T.MathUtils.clamp(Number(e.target.value),0,100);const output=e.target.parentNode.querySelector('output');if(output)output.textContent=Math.round(api.state.v4[k])+'%';sync(api.state,api.view);api.save();});
 window.CORPO_V4={initial,accepts,sidebar,create,command,drop,gripStart,gripEnd,report,sync,get runtime(){return rt;},CORE,PARTS,MISSION};
})();
