/* Corpo Humano Imersivo · controlador dos módulos 9, 10 e 11 (Linfático, Tegumentar, Reprodutor) (v4.8)
   Plugado no corpo-app.js por ganchos genéricos (window.CORPO_EXTRA): estado inicial, painel lateral, comandos,
   cena 3D, desafio, inspeção, legenda, áudio de abertura e enquadramento do corpo inteiro no VR.
   Também cuida da liberação do Reprodutor em Ajustes. Regra 9: data-act/data-action + delegação, sem onclick. */
(function(){'use strict';
const D=window.CORPO_DATA;
const L=()=>window.LTR_MODELS;
const VIEWS={linContexto:'lin',linfatico:'lin',defesa:'lin',tegContexto:'teg',tegumentar:'teg',camadas:'teg',repContexto:'rep',reprodutor:'rep',puberdade:'rep'};
const CTX={lin:{chave:'linContext',lista:'linContext',view:'linContexto',explorar:'linfatico',skill:'defesa',botoes:['Ver os órgãos de defesa','Entrar no linfonodo','Explorar a defesa'],nota:['Representação esquemática da rede linfática: os vasos reais são muito mais finos e numerosos.','Órgãos em escala aproximada. A medula óssea aparece dentro dos fêmures, do esterno e da pelve.','O linfonodo foi ampliado centenas de vezes. Os de verdade têm de 2 milímetros a 2 centímetros.']},
 teg:{chave:'tegContext',lista:'tegContext',view:'tegContexto',explorar:'tegumentar',skill:'protecao',botoes:['Ver a pele de perto','Cortar a pele','Explorar a pele'],nota:['A pele cobre todo o corpo, das pálpebras à sola dos pés.','Pedaço de pele ampliado cerca de 50 vezes.','Corte esquemático. A espessura real da pele vai de meio milímetro (pálpebra) a 4 milímetros (sola do pé).']},
 rep:{chave:'repContext',lista:'repContext',view:'repContexto',explorar:'reprodutor',skill:'reproducao',botoes:['Ver o sistema feminino','Ver o sistema masculino','Explorar os órgãos'],nota:['Os órgãos ficam protegidos pelos ossos do quadril.','Prancha esquemática dos órgãos internos, no estilo dos atlas escolares.','Prancha esquemática dos órgãos internos, no estilo dos atlas escolares.']}};
const EXPLORAR={linfatico:['Explore a defesa do corpo','Aponte em uma estrutura na cena ou escolha abaixo. A ficha conta o papel dela na defesa, com explicação em áudio.','Como o corpo se defende?','lin-aula-explorar'],
 tegumentar:['Explore a pele','Aponte em uma estrutura do corte ou escolha abaixo. A ficha conta o que ela faz, com explicação em áudio.','Como a pele protege o corpo?','teg-aula-explorar'],
 reprodutor:['Explore o sistema reprodutor','Aponte em um órgão das pranchas ou escolha abaixo. A ficha conta a função de cada um, com explicação em áudio.','Como o corpo se prepara para a reprodução?','rep-aula-explorar']};
const CATALOGO={
 linfatico:[['Órgãos de defesa',['tonsilas','timo','baco','medula_ossea']],['Rede linfática',['vasos_linfaticos','linfonodos','ducto_toracico']],['Células',['leucocitos']]],
 tegumentar:[['Camadas',['epiderme','derme','hipoderme']],['Anexos da pele',['pelos','unhas','sudoriparas','sebaceas']],['Proteção e sentidos',['melanina','receptores_pele']]],
 reprodutor:[['Feminino',['ovarios','tubas_uterinas','utero','canal_vaginal']],['Masculino',['testiculos','epididimo','ducto_deferente','vesiculas_seminais','prostata']]]};
const LEG={
 lin:[['#8fe8c8','Vasos linfáticos'],['#7fd6b0','Linfonodos'],['#5fd0a8','Ducto torácico'],['#8a4f7d','Baço'],['#e9c9a8','Timo'],['#e89aa8','Tonsilas'],['#e04a4a','Medula óssea']],
 teg:[['#f2c9a6','Epiderme'],['#e8a39c','Derme'],['#f6e3a0','Hipoderme'],['#9ff3ff','Glândula do suor'],['#f0d08a','Glândula sebácea'],['#e8484f','Vasos'],['#f6e3a0','Nervos e receptores']],
 rep:[['#f0a6c8','Ovários'],['#d97a9a','Útero'],['#e6b0d0','Tubas uterinas'],['#9fc5f0','Testículos'],['#a0c0e8','Ducto deferente'],['#d9b48a','Próstata'],['#c9d8a0','Glândulas seminais']]};
const DESAFIO={lin:'linDesafio',teg:'tegDesafio',rep:'repDesafio'};

function inicial(freshSeq){return{linContext:0,tegContext:0,repContext:0,camadas:{feitos:{},erros:0},defesa:freshSeq('defesa'),puberdade:freshSeq('puberdade')};}
function garantir(S,freshSeq){if(!S.camadas)S.camadas={feitos:{},erros:0};['linContext','tegContext','repContext'].forEach(k=>{if(typeof S[k]!=='number')S[k]=0;});['defesa','puberdade'].forEach(k=>{if(!S[k]&&freshSeq)S[k]=freshSeq(k);});}

/* ---------- painel lateral ---------- */
function painel(S,H){
  const {btn,pill,esc,listaHTML,tourHTML,seqUI}=H,v=S.view,mod=VIEWS[v];let h='';
  if(v===CTX[mod].view){const c=CTX[mod],lv=S[c.chave],lista=D[c.lista],e=lista[lv];
    h+='<h2>'+esc(e.name)+'</h2><div class="step-list">'+lista.map((x,i)=>'<span class="'+(i<=lv?'done':'')+'"></span>').join('')+'</div><p>'+esc(e.text)+'</p><div class="button-row">'+btn('Etapa anterior','ltr:ctx:back','',lv===0)+btn(c.botoes[lv],lv<2?'ltr:ctx:next':'view:'+c.explorar,'primary')+'</div><div class="info-card"><p>'+esc(c.nota[lv])+'</p></div>';
    return{html:h,text:e.text,key:e.audio};}
  if(EXPLORAR[v]){const [t,p,q,k]=EXPLORAR[v];h+='<h2>'+esc(t)+'</h2><p>'+esc(p)+'</p>'+listaHTML(v)+tourHTML(v)+'<p class="fine">Pergunta central: <b>'+esc(q)+'</b></p>'+(v==='reprodutor'?'<p class="fine">Conteúdo do 8º ano (BNCC EF08CI08 a EF08CI11). As pranchas mostram os órgãos internos em vista de atlas.</p>':'');
    return{html:h,text:'Aponte em uma estrutura para ver a ficha e ouvir a explicação. Investigue pelo menos três.',key:k};}
  if(v==='defesa'){h+='<h2>Defenda o corpo</h2>'+pill('CORTE NO DEDO')+pill('RESPOSTA EM ETAPAS')+seqUI('defesa')+'<p class="fine">Repare na cena ao lado: cada etapa encaixada aparece no corte.</p>';
    const fim=S.defesa.done;return{html:h,text:fim?'Defesa completa! A pele foi rompida, a inflamação chamou reforços, os fagócitos engoliram os invasores, a linfa levou as pistas ao linfonodo, os linfócitos produziram anticorpos e algumas células guardaram a memória. É essa memória que a vacina ensina.':'Uma bactéria entrou por um corte no dedo. Coloque em ordem a resposta do corpo, do corte até a memória.',key:fim?'lin-defesa-concluida':'lin-aula-defesa'};}
  if(v==='puberdade'){h+='<h2>Puberdade: quem dá o sinal?</h2>'+pill('ENCÉFALO')+pill('HORMÔNIOS')+pill('GÔNADAS')+seqUI('puberdade')+'<p class="fine">A puberdade começa em idades diferentes para cada pessoa, em geral entre 8 e 14 anos. Tudo isso é normal.</p>';
    const fim=S.puberdade.done;return{html:h,text:fim?'Caminho completo! O hipotálamo dá o sinal, a hipófise libera FSH e LH, que viajam pelo sangue até ovários e testículos. Eles passam a produzir estrogênio, progesterona e testosterona, e o corpo começa a mudar.':'Coloque em ordem o caminho dos hormônios da puberdade, do encéfalo até as mudanças no corpo.',key:fim?'rep-puberdade-concluida':'rep-aula-puberdade'};}
  if(v==='camadas'){const c=S.camadas,itens=D.camadas.itens,nomes=D.camadas.nomes,feitos=itens.filter(it=>c.feitos[it.id]===it.camada).length,fim=feitos===itens.length;
    h+='<h2>Camadas da pele</h2><p>Em que camada fica cada estrutura? Escolha epiderme, derme ou hipoderme.</p>';
    itens.forEach(it=>{const ok=c.feitos[it.id]===it.camada;h+='<div class="metric-row"><span><i class="dot" style="background:'+it.cor+'"></i>'+esc(it.nome)+'</span><b>'+(ok?'✓ '+esc(nomes[it.camada]):'')+'</b></div>'+(ok?'':'<div class="button-row">'+['epiderme','derme','hipoderme'].map(k=>'<button data-act="ltr:cam:'+it.id+':'+k+'" data-xr="'+esc(it.nome)+' → '+esc(nomes[k])+'">'+esc(nomes[k])+'</button>').join('')+'</div>');});
    h+='<div class="metric-row"><span>Colocadas</span><b>'+feitos+' / '+itens.length+'</b></div><div class="metric-row"><span>Tentativas incorretas</span><b>'+c.erros+'</b></div>'+(fim?'<p>✓ Pele organizada: a epiderme protege e dá a cor, a derme sente, sua e nutre, a hipoderme isola e amortece.</p>':'')+btn('Recomeçar','ltr:cam:reset','wide');
    return{html:h,text:fim?'Pele organizada! A epiderme protege e dá a cor, a derme guarda vasos, glândulas, pelos e receptores, e a hipoderme isola o calor e amortece pancadas.':'Coloque cada estrutura na camada certa da pele: epiderme, derme ou hipoderme.',key:fim?'teg-camadas-concluida':'teg-aula-camadas'};}
  return{html:'',text:'',key:null};
}

/* ---------- comandos ---------- */
function command(kind,op,a,api){
  if(kind!=='ltr')return false;const S=api.S;garantir(S);
  if(op==='ctx'){const mod=VIEWS[S.view];const c=CTX[mod];if(!c)return true;const sub=a;
    if(sub==='next'&&S[c.chave]<2){S[c.chave]++;api.log('contexto',c.skill,{level:S[c.chave]});if(S[c.chave]===2)api.mark(c.view);}
    else if(sub==='next'&&S[c.chave]===2){api.switchView(c.explorar);return true;}
    if(sub==='back')S[c.chave]=Math.max(0,S[c.chave]-1);
    api.render();if(S.autoVoice)api.narrator.say(api.instruction,api.instructionKey);return true;}
  if(op==='cam'){/* a = "item:camada" vem dividido: cmd ltr:cam:item:camada → a=item; a 4ª parte vem em api.extra */
    const c=S.camadas;if(a==='reset'){S.camadas={feitos:{},erros:0};api.render();return true;}
    const it=D.camadas.itens.find(x=>x.id===a),escolha=api.extra;if(!it||c.feitos[it.id]===it.camada)return true;
    const ok=escolha===it.camada;api.log('camadas','protecao',{item:it.id,choice:escolha,correct:ok});
    if(!ok){c.erros++;api.render();const msg='Ainda não. Pense: essa estrutura precisa de sangue e nervos, fica na superfície ou serve de reserva?';api.fb(msg,'warning');if(S.autoVoice)api.narrator.say(msg,'teg-camadas-erro');return true;}
    c.feitos[it.id]=escolha;const todos=D.camadas.itens.every(x=>c.feitos[x.id]===x.camada);if(todos)api.mark('camadas');api.render();api.fb(it.why);
    if(S.autoVoice)api.narrator.say(it.why,'teg-cam-'+it.id,todos?{text:api.instruction,key:api.instructionKey}:null);return true;}
  return true;
}

/* ---------- cena 3D ---------- */
function cena(S){const Mo=L();if(!Mo)return null;garantir(S);
  switch(S.view){
   case'linContexto':return Mo.linContexto(S.linContext);
   case'linfatico':return Mo.linExplorar();
   case'defesa':return Mo.defesa(S.defesa,D.sequencias.defesa);
   case'tegContexto':return Mo.tegContexto(S.tegContext);
   case'tegumentar':return Mo.tegExplorar();
   case'camadas':return Mo.camadas(S.camadas);
   case'repContexto':return Mo.repContexto(S.repContext);
   case'reprodutor':return Mo.repExplorar();
   case'puberdade':return Mo.puberdade(S.puberdade,D.sequencias.puberdade);}
  return null;}
const temDesafio=m=>!!DESAFIO[m];
function desafio(m){const Mo=L();if(!Mo)return null;return m==='lin'?Mo.linDesafio():m==='teg'?Mo.tegDesafio():Mo.repDesafio();}
function legenda(S){const mod=VIEWS[S.view]||(S.view==='desafio'&&DESAFIO[S.modulo]?S.modulo:null);return mod?LEG[mod]:null;}
function introAudio(id,S){for(const m in CTX){const c=CTX[m];if(id===c.view&&!S[c.chave])return m+'-aula-contexto';}return null;}
function resetCtx(S){S.linContext=0;S.tegContext=0;S.repContext=0;}
/* no VR, o corpo inteiro fica de pé à frente do aluno nestas cenas */
function inteiro(S){return (S.view==='linContexto'&&S.linContext<2)||S.view==='linfatico'||(S.view==='tegContexto'&&S.tegContext===0)||(S.view==='repContexto'&&S.repContext===0)||(S.view==='desafio'&&S.modulo==='lin');}

window.CORPO_EXTRA={views:VIEWS,INSPECT:Object.keys(VIEWS),SEQ:['defesa','puberdade'],CATALOGO,EXPLORAR:Object.keys(EXPLORAR),
 inicial,garantir,painel,command,cena,temDesafio,desafio,legenda,introAudio,resetCtx,inteiro,
 ehLtr:k=>!!(D.LTR_NOVAS&&D.LTR_NOVAS.includes(k)),inspection:k=>L().inspection(k)};

/* ---------- Ajustes: liberação do Reprodutor ---------- */
function ligarAjustes(){
  const box=document.getElementById('repBox'),chk=document.getElementById('repLiberado'),nota=document.getElementById('repNota');if(!box||!chk)return;
  const q=new URLSearchParams(location.search).get('reprodutor');
  if(q==='0'){box.hidden=true;if(nota){nota.hidden=false;nota.textContent='O sistema reprodutor foi bloqueado no link desta turma.';}return;}
  if(q==='1'){chk.checked=true;chk.disabled=true;if(nota){nota.hidden=false;nota.textContent='Liberado pelo link da turma (secretaria ou professor).';}return;}
  chk.checked=D.reprodutorLiberado();
  chk.addEventListener('change',()=>{
    const Lab=window.CorpoLab;
    if(chk.checked){const ok=window.confirm('Liberar o Sistema Reprodutor nesta sessão?\n\nConteúdo do 8º ano (BNCC EF08CI08 a EF08CI11): órgãos internos em prancha de atlas, puberdade e saúde. Fica liberado até fechar o navegador.');if(!ok){chk.checked=false;return;}}
    D.liberarReprodutor(chk.checked);
    if(Lab){if(!chk.checked&&Lab.state.sistema==='reprodutor')Lab.command('sistema:respiratorio');if(Lab.renderNav)Lab.renderNav();if(Lab.renderMenu)Lab.renderMenu();if(Lab.view&&Lab.view.xr)Lab.view.buildXRUI();}
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ligarAjustes);else ligarAjustes();
})();
