/* Corpo Humano Imersivo · Relatório do professor (v3.4)
   Gera um relatório de uma página por sessão: identificação da turma, sistemas trabalhados,
   missões concluídas, resultado do Desafio situação por situação e espaço para observações.
   Saída: impressão/PDF (iframe srcdoc) ou arquivo HTML autocontido para arquivar/enviar. */
(function(){
const D=window.CORPO_DATA;
const KEY='pde_corpo_turma';
const SKILLS={respiracao:'Respiração',circulacao:'Circulação',digestao:'Digestão',integracao:'Integração dos sistemas','troca-gasosa':'Troca gasosa',movimento:'Movimento',articulacoes:'Articulações',coluna:'Coluna vertebral',explorar:'Ossos e proteção',musculos:'Músculos',reflexo:'Arco reflexo',encefalo:'Encéfalo',nervos:'Medula e nervos'};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function turma(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(_){return{};}}
function salvarTurma(t){try{localStorage.setItem(KEY,JSON.stringify(t));}catch(_){}}
function lerForm(){const t={};['escola','turma','grupo','professor'].forEach(k=>{const el=document.getElementById('rel_'+k);if(el)t[k]=el.value.trim();});salvarTurma(t);return t;}
function preencherForm(){const t=turma();['escola','turma','grupo','professor'].forEach(k=>{const el=document.getElementById('rel_'+k);if(el&&t[k]!==undefined)el.value=t[k];});}
function duracao(S){const ms=Date.now()-(S.started||Date.now());const m=Math.round(ms/60000);return m<1?'menos de 1 min':m+' min';}
function dataBR(d){return d.toLocaleDateString('pt-BR')+' · '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
function dados(){
 const Lab=window.CorpoLab,S=Lab.state,r=Lab.report();
 const visitados=S.visited||[];
 const feito=id=>{if(id==='explorar')return visitados.filter(k=>!Lab.ehOsso(k)&&!Lab.ehMusculo(k)).length>=3;if(id==='ossos')return visitados.filter(Lab.ehOsso).length>=3;if(id==='musculos')return visitados.filter(Lab.ehMusculo).length>=3;if(id==='encefalo'||id==='nervos')return (r[id]||[]).length>=3;const seq=S[id];if(seq&&typeof seq==='object'&&'done' in seq)return !!seq.done;return (S.completed||[]).includes(id);};
 const detalhe=id=>{const seq=S[id],v4=S.v4||{};if(id==='encefalo')return (r.encefalo||[]).length+' regiões';if(id==='nervos')return (r.nervos||[]).length+' estruturas';if(id==='laboratorio')return (v4.seen||[]).length+' estruturas';if(id==='montagemTorax')return (v4.placed||[]).length+' / 4'+(v4.errors?' · '+v4.errors+' erros':'')+(v4.hints?' · '+v4.hints+' pistas':'');if(id==='coracaoLab')return (v4.heartSeen||[]).length+' / 4 cavidades';if(id==='missaoOxigenio')return 'etapa '+((v4.missionStep||0)+1)+' de 8'+(v4.missionAnswer!==null&&v4.missionAnswer!==undefined?(v4.missionDone&&D.questions.find(q=>q.id==='celulas').correct===v4.missionAnswer?' · pergunta final correta':' · pergunta final incorreta'):'');if(id==='explorar')return visitados.filter(k=>!Lab.ehOsso(k)&&!Lab.ehMusculo(k)).length+' órgãos';if(id==='ossos')return visitados.filter(Lab.ehOsso).length+' ossos';if(id==='musculos')return visitados.filter(Lab.ehMusculo).length+' músculos';if(id==='respire')return (S.respire?S.respire.ciclos:0)+' ciclos';if(id==='movimento')return (S.movimento?S.movimento.ciclos:0)+' ciclos';if(id==='articulacoes')return ['dobradica','esferoide','pivo'].filter(k=>S.artic&&S.artic[k]).length+' / 3 tipos';if(seq&&seq.colocados)return seq.colocados.filter(Boolean).length+' / '+seq.colocados.length+(seq.erros?' · '+seq.erros+' erros':'');return '';};
 const sistemas=D.sistemas.filter(x=>!x.breve).map(sis=>{
  const miss=sis.atividades.map(id=>{const a=D.activities.find(x=>x.id===id)||{label:id};return{id,label:a.label,feito:feito(id),detalhe:detalhe(id)};});
  const q=(S.quizzes||{})[sis.id];const Q=D.todasQuestoes.filter(x=>sis.questoes.includes(x.id));
  const quiz=Q.map((item,i)=>{const resp=q?q.answers[i]:undefined;return{texto:item.q,skill:SKILLS[item.skill]||item.skill,respondida:resp!==undefined,correta:resp===item.correct,escolha:resp!==undefined?item.options[resp]:'',certa:item.options[item.correct]};});
  const acertos=quiz.filter(x=>x.correta).length,respondidas=quiz.filter(x=>x.respondida).length;
  const tocado=miss.filter(m=>m.feito).length>=2||respondidas>0||(S.completed||[]).includes('aula:'+sis.id)||S.sistema===sis.id;
  return{id:sis.id,nome:sis.nome,estuda:sis.estuda,missoes:miss,quiz,acertos,respondidas,total:quiz.length,concluido:!!(q&&q.done),aula:(S.completed||[]).includes('aula:'+sis.id),tocado};
 });
 return{S,r,sistemas,duracao:duracao(S),agora:new Date(),turma:turma(),visitados:visitados.length,erros:r.errors,pistas:r.hints,versao:D.version};
}
function html(d){
 const t=d.turma;const trab=d.sistemas.filter(s=>s.tocado);const lista=trab.length?trab:d.sistemas.filter(s=>s.id===d.S.sistema);
 const blocos=lista.map(s=>{
  const miss=s.missoes.map(m=>'<tr><td>'+esc(m.label)+'</td><td class="c">'+(m.feito?'<b class="ok">✓ concluída</b>':'<span class="nao">não concluída</span>')+'</td><td>'+esc(m.detalhe)+'</td></tr>').join('');
  const quiz=s.quiz.length?'<table><thead><tr><th style="width:52%">Situação</th><th>Habilidade</th><th class="c">Resultado</th></tr></thead><tbody>'+s.quiz.map((q,i)=>'<tr><td>'+(i+1)+'. '+esc(q.texto)+(q.respondida&&!q.correta?'<div class="mini">Escolheu: '+esc(q.escolha)+' · Resposta esperada: '+esc(q.certa)+'</div>':'')+'</td><td>'+esc(q.skill)+'</td><td class="c">'+(q.respondida?(q.correta?'<b class="ok">✓ acertou</b>':'<b class="err">✗ errou</b>'):'<span class="nao">não respondida</span>')+'</td></tr>').join('')+'</tbody></table><p class="tot">Desafio '+esc(s.nome)+': <b>'+s.acertos+' de '+s.total+'</b> situações corretas na primeira tentativa'+(s.concluido?'':' (desafio não finalizado)')+'.</p>':'';
  return '<section class="sis"><h2>Sistema '+esc(s.nome)+'</h2><p class="sub">'+esc(s.estuda)+(s.aula?' · Aula guiada concluída':'')+'</p><table><thead><tr><th>Missão</th><th class="c">Situação</th><th>Registro</th></tr></thead><tbody>'+miss+'</tbody></table>'+quiz+'</section>';
 }).join('');
 const totalA=lista.reduce((a,s)=>a+s.acertos,0),totalQ=lista.reduce((a,s)=>a+s.total,0),totalM=lista.reduce((a,s)=>a+s.missoes.filter(m=>m.feito).length,0),totalMT=lista.reduce((a,s)=>a+s.missoes.length,0);
 const ident=[['Escola',t.escola],['Turma',t.turma],['Aluno ou grupo',t.grupo],['Professor(a)',t.professor]].map(([k,v])=>'<div><span>'+k+'</span><b>'+(v?esc(v):'<i class="linha"></i>')+'</b></div>').join('');
 return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório · Corpo Humano Imersivo</title><style>'+
 '@page{size:A4;margin:14mm 14mm 16mm}*{box-sizing:border-box}body{margin:0;font:11.5px/1.5 "Segoe UI",Roboto,Arial,sans-serif;color:#17202a;background:#fff}'+
 '.cab{display:flex;align-items:center;gap:14px;border-bottom:3px solid #1a6b2a;padding:0 0 10px;margin-bottom:14px}.cab img{width:46px;height:46px;object-fit:contain}.cab h1{margin:0;font-size:20px;color:#0f2c4a;letter-spacing:-.4px}.cab .k{font-size:9px;letter-spacing:2px;color:#1a6b2a;font-weight:700}.cab small{display:block;color:#5b6b7a;font-size:10px}'+
 '.ident{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;margin:0 0 12px;padding:10px 12px;background:#f3f7f4;border:1px solid #d7e4da;border-radius:8px}.ident div{display:flex;gap:8px;align-items:baseline}.ident span{color:#5b6b7a;font-size:10px;min-width:92px}.ident b{flex:1;font-weight:600;color:#0f2c4a}.linha{display:block;border-bottom:1px solid #9aa9b5;height:12px}'+
 '.meta{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:10px;color:#5b6b7a;margin:0 0 10px}.meta b{color:#0f2c4a}'+
 '.resumo{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 0 14px}.resumo div{border:1px solid #d7e4da;border-radius:8px;padding:8px 10px;text-align:center}.resumo b{display:block;font-size:20px;color:#1a6b2a;letter-spacing:-.5px}.resumo span{font-size:9.5px;color:#5b6b7a}'+
 '.sis{margin:0 0 14px;break-inside:avoid}.sis h2{font-size:14px;margin:0;color:#0f2c4a;border-left:4px solid #1a6b2a;padding-left:8px}.sub{margin:3px 0 6px 12px;color:#5b6b7a;font-size:10px}'+
 'table{width:100%;border-collapse:collapse;margin:4px 0 6px;font-size:10.5px}th{background:#0f2c4a;color:#fff;text-align:left;padding:5px 7px;font-weight:600;font-size:9.5px}td{padding:5px 7px;border-bottom:1px solid #e3e9ee;vertical-align:top}.c{text-align:center;white-space:nowrap}.ok{color:#1a6b2a}.err{color:#b3261e}.nao{color:#8a98a5}.mini{font-size:9.5px;color:#5b6b7a;margin-top:2px}.tot{margin:2px 0 0;font-size:10.5px}'+
 '.obs{margin-top:12px;break-inside:avoid}.obs h2{font-size:13px;color:#0f2c4a;margin:0 0 6px}.obs .l{height:22px;border-bottom:1px solid #9aa9b5}'+
 '.rod{margin-top:14px;padding-top:8px;border-top:1px solid #d7e4da;font-size:9px;color:#6b7a88;line-height:1.5}'+
 '@media screen{body{padding:24px;background:#e9edf0}.folha{max-width:210mm;margin:0 auto;background:#fff;padding:14mm;box-shadow:0 8px 40px #0002}}@media print{.folha{padding:0}}'+
 '</style></head><body><div class="folha">'+
 '<header class="cab"><img src="'+location.origin+location.pathname.replace(/[^/]*$/,'')+'assets/logo.png" alt=""><div><div class="k">PORTAL 360º VR · CORPO HUMANO IMERSIVO</div><h1>Relatório do professor</h1><small>Registro da sessão para acompanhamento pedagógico e evidência de uso em sala</small></div></header>'+
 '<div class="ident">'+ident+'</div>'+
 '<div class="meta"><span>Data: <b>'+dataBR(d.agora)+'</b></span><span>Duração da sessão: <b>'+d.duracao+'</b></span><span>Sistemas trabalhados: <b>'+lista.map(s=>s.nome).join(', ')+'</b></span><span>Versão: <b>'+esc(d.versao)+'</b></span></div>'+
 '<div class="resumo"><div><b>'+totalM+'/'+totalMT+'</b><span>missões concluídas</span></div><div><b>'+totalA+'/'+totalQ+'</b><span>situações corretas no Desafio</span></div><div><b>'+d.visitados+'</b><span>estruturas investigadas</span></div><div><b>'+d.erros+'</b><span>tentativas incorretas · '+d.pistas+' pistas</span></div></div>'+
 blocos+
 '<section class="obs"><h2>Observações do professor</h2><div class="l"></div><div class="l"></div><div class="l"></div><div class="l"></div></section>'+
 '<footer class="rod">O relatório descreve ações e tentativas registradas nesta sessão; não é um diagnóstico de aprendizagem. Erros e pistas indicam pontos para retomada em aula, não penalizam o aluno. Nenhum dado é enviado a servidor: o registro existe apenas neste dispositivo. Portal do Educador · NEWPC Tecnologia · Modelos anatômicos Z-Anatomy (CC BY-SA 4.0).</footer>'+
 '</div></body></html>';
}
function imprimir(){lerForm();const doc=html(dados());let f=document.getElementById('relatorioFrame');if(!f){f=document.createElement('iframe');f.id='relatorioFrame';f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0';document.body.appendChild(f);}
 f.onload=()=>{try{f.contentWindow.focus();f.contentWindow.print();}catch(_){baixar();}};f.srcdoc=doc;}
function baixar(){lerForm();const d=dados();const t=d.turma;const nome=['Relatorio-CorpoHumano',t.turma,t.grupo].filter(Boolean).join('-').replace(/[^\w\-]+/g,'_')+'.html';const blob=new Blob([html(d)],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=nome;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function abrir(){lerForm();const w=window.open('','_blank');if(!w){imprimir();return;}w.document.open();w.document.write(html(dados()));w.document.close();}
window.CorpoRelatorio={dados,html,imprimir,baixar,abrir,preencherForm,lerForm};
})();
