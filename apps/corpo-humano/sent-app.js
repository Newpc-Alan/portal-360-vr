/* Corpo Humano Imersivo · controlador do módulo 12 (Órgãos dos Sentidos) (v4.11)
   Encaixa-se nos mesmos ganchos genéricos (window.CORPO_EXTRA) do ltr-app.js: envolve o controlador que já existe e
   responde só pelas telas dos sentidos; o resto continua com os módulos anteriores. Regra 9: data-act + delegação. */
(function(){'use strict';
const D=window.CORPO_DATA,PREV=window.CORPO_EXTRA;
const MS=()=>window.SENT_MODELS;
const VIEWS={sentContexto:'sent',sentidos:'sent',luz:'sent',lentes:'sent',som:'sent'};
const CATALOGO={sentidos:[['Olho · visão',D.SENT_OLHO.concat(['optico'])],['Orelha · audição e equilíbrio',D.SENT_ORELHA],['Outros sentidos',D.SENT_OUTROS]]};
const BOTOES=['Ver o olho por dentro','Ver a orelha por dentro','Explorar os sentidos'];
const NOTAS=['Os órgãos dos sentidos levam informações ao encéfalo pelos nervos.','Olho real (Z-Anatomy) ampliado cerca de 16 vezes. A esclera aparece transparente para mostrar o interior.','Orelha interna e média reais (Z-Anatomy) ampliadas cerca de 11 vezes. O pavilhão e o canal são esquemáticos.'];
const LEG=[['#f4f1ea','Esclera'],['#cfefff','Córnea'],['#7a5236','Íris'],['#ffe3a0','Cristalino'],['#e0603f','Retina'],['#f6e3a0','Tímpano e nervos'],['#e9e4d6','Ossículos'],['#f0a6c8','Cóclea'],['#a6f0d6','Canais do equilíbrio']];

function lentesInicial(){return{caso:'miopia',escolha:{},feitos:{},erros:0};}
function inicial(freshSeq){return{sentContext:0,lentes:lentesInicial(),luz:freshSeq('luz'),som:freshSeq('som')};}
function garantir(S,freshSeq){if(typeof S.sentContext!=='number')S.sentContext=0;if(!S.lentes||!S.lentes.escolha)S.lentes=lentesInicial();['luz','som'].forEach(k=>{if(!S[k]&&freshSeq)S[k]=freshSeq(k);});}

/* ---------- painel lateral ---------- */
function painel(S,H){const {btn,pill,esc,listaHTML,tourHTML,seqUI}=H,v=S.view;let h='';
  if(v==='sentContexto'){const lv=S.sentContext,e=D.sentContext[lv];
    h+='<h2>'+esc(e.name)+'</h2><div class="step-list">'+D.sentContext.map((x,i)=>'<span class="'+(i<=lv?'done':'')+'"></span>').join('')+'</div><p>'+esc(e.text)+'</p><div class="button-row">'+btn('Etapa anterior','sent:ctx:back','',lv===0)+btn(BOTOES[lv],lv<2?'sent:ctx:next':'view:sentidos','primary')+'</div><div class="info-card"><p>'+esc(NOTAS[lv])+'</p></div>';
    return{html:h,text:e.text,key:e.audio};}
  if(v==='sentidos'){h+='<h2>Explore os órgãos dos sentidos</h2><p>Aponte em uma estrutura do olho ou da orelha na cena, ou escolha abaixo. Em "Outros sentidos" estão o olfato, o paladar e o tato.</p>'+listaHTML('sentidos')+tourHTML('sentidos')+'<p class="fine">Pergunta central: <b>Como percebemos o mundo?</b></p><p class="fine">BNCC EF06CI08: funcionamento do olho humano e lentes corretivas.</p>';
    return{html:h,text:'Aponte em uma estrutura para ver a ficha e ouvir a explicação. Investigue pelo menos três.',key:'sent-aula-explorar'};}
  if(v==='luz'){h+='<h2>Como enxergamos</h2>'+pill('LUZ')+pill('OLHO')+pill('ENCÉFALO')+seqUI('luz')+'<p class="fine">Repare no olho em corte ao lado: cada etapa encaixada acende um trecho do caminho.</p>';
    const fim=S.luz.done;return{html:h,text:fim?'Caminho completo! A luz sai do objeto, atravessa a córnea, entra pela pupila, é focalizada pelo cristalino e forma na retina uma imagem de cabeça para baixo. O nervo óptico leva o sinal até o lobo occipital, e é o encéfalo que vira a imagem e enxerga.':'Coloque em ordem o caminho da luz, do objeto até o encéfalo.',key:fim?'sent-luz-concluida':'sent-aula-luz'};}
  if(v==='som'){h+='<h2>Como ouvimos</h2>'+pill('VIBRAÇÃO')+pill('ORELHA')+pill('ENCÉFALO')+seqUI('som')+'<p class="fine">Repare na orelha ao lado: cada etapa encaixada faz uma parte vibrar ou acender.</p>';
    const fim=S.som.done;return{html:h,text:fim?'Caminho completo! O som vibra o ar, o pavilhão recolhe a vibração, que entra pelo canal e faz o tímpano vibrar. Os ossículos aumentam a vibração, a cóclea a transforma em sinal nervoso e o nervo leva o sinal ao lobo temporal, onde o som é entendido.':'Coloque em ordem o caminho do som, da vibração do ar até o encéfalo.',key:fim?'sent-som-concluida':'sent-aula-som'};}
  if(v==='lentes'){const L=S.lentes,cs=D.lentes.casos,atual=cs.find(c=>c.id===L.caso)||cs[0],fim=cs.every(c=>L.feitos[c.id]);
    h+='<h2>Lentes que corrigem</h2><p>Cada pessoa abaixo tem um problema de visão. Escolha a pessoa e teste as lentes até a imagem cair em cima da retina.</p><div class="button-row">'+cs.map(c=>btn((L.feitos[c.id]?'✓ ':'')+c.nome,'sent:caso:'+c.id,c.id===atual.id?'primary':'')).join('')+'</div>';
    h+='<div class="info-card"><p><b>'+esc(atual.nome)+'</b>: '+esc(atual.queixa)+'</p></div><div class="button-row">'+Object.entries(D.lentes.lentes).map(([k,t])=>'<button data-act="sent:lente:'+k+'" data-xr="'+esc(t)+'" class="'+((L.escolha[atual.id]||'nenhuma')===k?'selected':'')+'">'+esc(t)+'</button>').join('')+'</div>';
    h+='<div class="metric-row"><span>Visões corrigidas</span><b>'+cs.filter(c=>L.feitos[c.id]).length+' / '+cs.length+'</b></div><div class="metric-row"><span>Tentativas incorretas</span><b>'+L.erros+'</b></div>'+(L.feitos[atual.id]?'<p>✓ '+esc(atual.why)+'</p>':'')+btn('Recomeçar','sent:lente:reset','wide')+'<p class="fine">Atividade de estudo: quem receita óculos é o oftalmologista, depois de examinar os olhos.</p>';
    return{html:h,text:fim?'Muito bem! Na miopia, a imagem se forma antes da retina e a lente divergente empurra o foco para trás. Na hipermetropia, a imagem se formaria depois da retina e a lente convergente traz o foco para a frente.':'Escolha a pessoa e teste as lentes até a imagem se formar em cima da retina.',key:fim?'sent-lentes-concluida':'sent-aula-lentes'};}
  return null;}

/* ---------- comandos ---------- */
function command(kind,op,a,api){if(kind!=='sent')return false;const S=api.S;garantir(S);
  if(op==='ctx'){if(a==='next'&&S.sentContext<2){S.sentContext++;api.log('contexto','sentidos',{level:S.sentContext});if(S.sentContext===2)api.mark('sentContexto');}
    else if(a==='next'){api.switchView('sentidos');return true;}
    if(a==='back')S.sentContext=Math.max(0,S.sentContext-1);api.render();if(S.autoVoice)api.narrator.say(api.instruction,api.instructionKey);return true;}
  if(op==='caso'){if(D.lentes.casos.some(c=>c.id===a)){S.lentes.caso=a;api.render();}return true;}
  if(op==='lente'){const L=S.lentes;if(a==='reset'){S.lentes=lentesInicial();api.render();return true;}
    const caso=D.lentes.casos.find(c=>c.id===L.caso);if(!caso||!D.lentes.lentes[a])return true;L.escolha[caso.id]=a;
    if(a==='nenhuma'){api.render();api.fb('Sem lente, o foco fica '+(caso.foco==='antes'?'antes':'depois')+' da retina: a imagem fica embaçada.','warning');return true;}
    const ok=a===caso.correta;api.log('lentes','sentidos',{caso:caso.id,choice:a,correct:ok});
    if(!ok){L.erros++;api.render();const msg='Com essa lente o foco foi para o lado errado. Repare onde o foco está, antes ou depois da retina, e experimente a outra lente.';api.fb(msg,'warning');if(S.autoVoice)api.narrator.say(msg,'sent-lentes-erro');return true;}
    L.feitos[caso.id]=true;const todos=D.lentes.casos.every(c=>L.feitos[c.id]);if(todos)api.mark('lentes');
    const prox=D.lentes.casos.find(c=>!L.feitos[c.id]);api.render();api.fb(caso.why);
    if(S.autoVoice)api.narrator.say(caso.why,'sent-lente-'+caso.id,todos?{text:api.instruction,key:api.instructionKey}:null);
    if(prox)setTimeout(()=>{if(S.view==='lentes'&&S.lentes.caso===caso.id){S.lentes.caso=prox.id;api.render();}},4200);
    return true;}
  return true;}

/* ---------- cena 3D ---------- */
function cena(S){const Mo=MS();if(!Mo)return null;garantir(S);
  switch(S.view){case'sentContexto':return Mo.sentContexto(S.sentContext);case'sentidos':return Mo.sentExplorar();case'luz':return Mo.luz(S.luz,D.sequencias.luz);case'lentes':return Mo.lentes(S.lentes);case'som':return Mo.som(S.som,D.sequencias.som);}
  return null;}
const ehSent=k=>!!(D.SENT_NOVAS&&D.SENT_NOVAS.includes(k));

/* ---------- composição com o controlador anterior ---------- */
const P=PREV||{views:{},INSPECT:[],SEQ:[],CATALOGO:{},EXPLORAR:[],inicial:()=>({}),garantir(){},painel:()=>({html:'',text:'',key:null}),command:()=>false,cena:()=>null,temDesafio:()=>false,desafio:()=>null,legenda:()=>null,introAudio:()=>null,resetCtx(){},inteiro:()=>false,ehLtr:()=>false,inspection:()=>null};
window.CORPO_EXTRA={views:Object.assign({},P.views,VIEWS),INSPECT:P.INSPECT.concat(Object.keys(VIEWS)),SEQ:P.SEQ.concat(['luz','som']),CATALOGO:Object.assign({},P.CATALOGO,CATALOGO),EXPLORAR:P.EXPLORAR.concat(['sentidos']),
 inicial:f=>Object.assign(P.inicial(f),inicial(f)),
 garantir:(S,f)=>{if(VIEWS[S.view])garantir(S,f);else P.garantir(S,f);},
 painel:(S,H)=>VIEWS[S.view]?(painel(S,H)||{html:'',text:'',key:null}):P.painel(S,H),
 command:(kind,op,a,api)=>kind==='sent'?command(kind,op,a,api):P.command(kind,op,a,api),
 cena:S=>VIEWS[S.view]?cena(S):P.cena(S),
 temDesafio:m=>m==='sent'||P.temDesafio(m),
 desafio:m=>m==='sent'?(MS()?MS().sentDesafio():null):P.desafio(m),
 legenda:S=>(VIEWS[S.view]||(S.view==='desafio'&&S.modulo==='sent'))?LEG:P.legenda(S),
 introAudio:(id,S)=>id==='sentContexto'&&!S.sentContext?'sent-aula-contexto':P.introAudio(id,S),
 resetCtx:S=>{P.resetCtx(S);S.sentContext=0;},
 inteiro:S=>(S.view==='sentContexto'&&S.sentContext===0)||P.inteiro(S),
 ehLtr:k=>ehSent(k)||P.ehLtr(k),
 inspection:k=>ehSent(k)?MS().inspection(k):P.inspection(k)};
})();
