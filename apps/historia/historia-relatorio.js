/* Portal 360º VR · Relatório do professor (núcleo comum, out/2026)
   Uma página por sessão: identificação da turma, atividades concluídas, Desafio situação por situação e observações.
   Saída: impressão/PDF, nova aba ou arquivo HTML. Nenhum dado sai do dispositivo (os campos da turma ficam no localStorage).
   Cada app chama window.PDERelatorio.ligar({...}) com o seu adaptador de dados (ver o fim deste arquivo). */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CAMPOS=['escola','turma','grupo','professor'];
let CFG=null;
function turma(){try{return JSON.parse(localStorage.getItem(CFG.chave)||'{}');}catch(_){return{};}}
function salvarTurma(t){try{localStorage.setItem(CFG.chave,JSON.stringify(t));}catch(_){}}
function lerForm(){const t={};CAMPOS.forEach(k=>{const el=document.getElementById('rel_'+k);if(el)t[k]=el.value.trim();});salvarTurma(t);return t;}
function preencherForm(){const t=turma();CAMPOS.forEach(k=>{const el=document.getElementById('rel_'+k);if(el&&t[k]!==undefined)el.value=t[k];});}
function dataBR(d){return d.toLocaleDateString('pt-BR')+' · '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
function duracao(ini){const m=Math.round((Date.now()-(ini||Date.now()))/60000);return m<1?'menos de 1 min':m+' min';}
function html(){
 const d=CFG.dados(),t=turma(),agora=new Date();
 const blocos=d.secoes.map(s=>{
  const ativ=s.atividades.map(a=>'<tr><td>'+esc(a.label)+'</td><td class="c">'+(a.feito?'<b class="ok">✓ concluída</b>':'<span class="nao">não concluída</span>')+'</td><td>'+esc(a.detalhe||'')+'</td></tr>').join('');
  const q=s.quiz||[],acertos=q.filter(x=>x.correta).length;
  const quiz=q.length?'<table><thead><tr><th style="width:52%">Situação</th><th>Habilidade</th><th class="c">Resultado</th></tr></thead><tbody>'+q.map((x,i)=>'<tr><td>'+(i+1)+'. '+esc(x.texto)+(x.respondida&&!x.correta&&x.escolha?'<div class="mini">Escolheu: '+esc(x.escolha)+' · Resposta esperada: '+esc(x.certa)+'</div>':'')+'</td><td>'+esc(x.skill||'')+'</td><td class="c">'+(x.respondida?(x.correta?'<b class="ok">✓ acertou</b>':'<b class="err">✗ errou</b>'):'<span class="nao">não respondida</span>')+'</td></tr>').join('')+'</tbody></table><p class="tot">Desafio: <b>'+acertos+' de '+q.length+'</b> situações corretas na primeira tentativa.</p>':'';
  return '<section class="sis"><h2>'+esc(s.nome)+'</h2>'+(s.sub?'<p class="sub">'+esc(s.sub)+'</p>':'')+'<table><thead><tr><th>Atividade</th><th class="c">Situação</th><th>Registro</th></tr></thead><tbody>'+ativ+'</tbody></table>'+quiz+'</section>';
 }).join('');
 const ident=[['Escola',t.escola],['Turma',t.turma],['Aluno ou grupo',t.grupo],['Professor(a)',t.professor]].map(([k,v])=>'<div><span>'+k+'</span><b>'+(v?esc(v):'<i class="linha"></i>')+'</b></div>').join('');
 const cards=d.cards.map(c=>'<div><b>'+esc(c[0])+'</b><span>'+esc(c[1])+'</span></div>').join('');
 const logo=location.origin+location.pathname.replace(/[^/]*$/,'')+CFG.logo;
 return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório · '+esc(CFG.app)+'</title><style>'+
 '*{box-sizing:border-box}body{margin:0;font:11.5px/1.45 "Segoe UI",Roboto,Arial,sans-serif;color:#17202a;background:#fff}@page{size:A4;margin:12mm}'+
 '.cab{display:flex;align-items:center;gap:14px;border-bottom:3px solid #1a6b2a;padding-bottom:10px;margin-bottom:12px}.cab img{width:48px;height:48px;object-fit:contain}.cab img.marca{width:auto;height:34px;margin-left:auto}.k{font-size:9px;letter-spacing:2px;color:#1a6b2a;font-weight:700}h1{margin:2px 0 0;font-size:21px;color:#0f2c4a}.cab small{color:#5b6b7a;font-size:10px}'+
 '.ident{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}.ident div{border:1px solid #d7e4da;border-radius:8px;padding:6px 8px}.ident span{display:block;font-size:9px;color:#5b6b7a;text-transform:uppercase;letter-spacing:.6px}.ident b{font-size:12px;color:#0f2c4a}.linha{display:block;height:14px;border-bottom:1px solid #9aa9b5}'+
 '.meta{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:10px;color:#5b6b7a;margin-bottom:10px}.meta b{color:#0f2c4a}'+
 '.resumo{display:grid;grid-template-columns:repeat('+d.cards.length+',1fr);gap:8px;margin-bottom:12px}.resumo div{background:#f3f7f4;border:1px solid #d7e4da;border-radius:10px;padding:8px;text-align:center}.resumo b{display:block;font-size:19px;color:#1a6b2a}.resumo span{font-size:9.5px;color:#5b6b7a}'+
 '.sis{margin-bottom:10px;break-inside:avoid}.sis h2{font-size:13.5px;color:#0f2c4a;border-left:4px solid #1a6b2a;padding-left:8px;margin:0 0 2px}.sub{margin:0 0 6px;color:#5b6b7a;font-size:10px}'+
 'table{width:100%;border-collapse:collapse;margin:4px 0}th{background:#0f2c4a;color:#fff;text-align:left;padding:5px 7px;font-size:9.5px;font-weight:600}td{padding:5px 7px;border-bottom:1px solid #e3e9ee;vertical-align:top}.c{text-align:center;white-space:nowrap}.ok{color:#1a6b2a}.err{color:#b3261e}.nao{color:#8a98a5}.mini{font-size:9.5px;color:#5b6b7a;margin-top:2px}.tot{margin:2px 0 0;font-size:10.5px}'+
 '.obs{margin-top:12px;break-inside:avoid}.obs h2{font-size:13px;color:#0f2c4a;margin:0 0 6px}.obs .l{height:22px;border-bottom:1px solid #9aa9b5}'+
 '.rod{margin-top:14px;padding-top:8px;border-top:1px solid #d7e4da;font-size:9px;color:#6b7a88;line-height:1.5}'+
 '@media screen{body{padding:24px;background:#e9edf0}.folha{max-width:210mm;margin:0 auto;background:#fff;padding:14mm;box-shadow:0 8px 40px #0002}}@media print{.folha{padding:0}}'+
 '</style></head><body><div class="folha">'+
 '<header class="cab"><img src="'+logo+'" alt=""><div><div class="k">PORTAL 360º VR · '+esc(CFG.app.toUpperCase())+'</div><h1>Relatório do professor</h1><small>Registro da sessão para acompanhamento pedagógico e evidência de uso em sala</small></div><img class="marca" src="'+new URL('../../assets/marca/p360-assinatura-horizontal-claro.svg?v=2',location.href).href+'" alt="Portal 360º VR"></header>'+
 '<div class="ident">'+ident+'</div>'+
 '<div class="meta"><span>Data: <b>'+dataBR(agora)+'</b></span><span>Duração da sessão: <b>'+duracao(d.inicio)+'</b></span><span>Versão: <b>'+esc(d.versao||'')+'</b></span></div>'+
 '<div class="resumo">'+cards+'</div>'+blocos+
 '<section class="obs"><h2>Observações do professor</h2><div class="l"></div><div class="l"></div><div class="l"></div><div class="l"></div></section>'+
 '<footer class="rod">O relatório descreve ações e tentativas registradas nesta sessão; não é um diagnóstico de aprendizagem. Erros e pistas indicam pontos para retomada em aula, não penalizam o aluno. Nenhum dado é enviado a servidor: o registro existe apenas neste dispositivo. Portal do Educador · NEWPC Tecnologia.'+(CFG.creditos?' '+esc(CFG.creditos):'')+'</footer>'+
 '</div></body></html>';
}
function imprimir(){lerForm();const doc=html();let f=document.getElementById('relatorioFrame');if(!f){f=document.createElement('iframe');f.id='relatorioFrame';f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0';document.body.appendChild(f);}
 f.onload=()=>{try{f.contentWindow.focus();f.contentWindow.print();}catch(_){baixar();}};f.srcdoc=doc;}
function baixar(){lerForm();const t=turma();const nome=['Relatorio-'+CFG.arquivo,t.turma,t.grupo].filter(Boolean).join('-').replace(/[^\w\-]+/g,'_')+'.html';const blob=new Blob([html()],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=nome;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function abrir(){lerForm();const w=window.open('','_blank');if(!w){imprimir();return;}w.document.open();w.document.write(html());w.document.close();}
function painel(){
 const s=document.createElement('section');s.className='rel-prof';s.style.cssText='margin:14px 0 6px;padding:14px;border:1px solid #3e6a5c;background:#0f2f2c;border-radius:12px;color:#ddf2ff';
 const campo=(k,rot,ph)=>'<label style="margin:0;font-size:11px;color:#9fc9c2">'+rot+'<input id="rel_'+k+'" type="text" autocomplete="off" placeholder="'+ph+'" style="width:100%;margin-top:4px;padding:8px;background:#0d2132;color:#ddf2ff;border:1px solid #3b5a6e;border-radius:7px;font:inherit"></label>';
 s.innerHTML=(CFG.guia?'<p class="fine"><a href="'+CFG.guia+'" target="_blank" rel="noopener" style="color:#b9f0da">📘 Guia do professor: mapeamento BNCC e planos de aula</a></p>':'')+
  '<h3 style="margin:0 0 4px;font-size:15px;color:#b9f0da">Relatório do professor</h3><p class="fine" style="margin:0">Uma página com a turma, as atividades concluídas e o resultado do Desafio situação por situação. Os campos ficam salvos neste dispositivo.</p>'+
  '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px 10px;margin:10px 0 8px">'+campo('escola','Escola','Nome da escola')+campo('turma','Turma','Ex.: 8º A')+campo('grupo','Aluno ou grupo','Opcional')+campo('professor','Professor(a)','Nome')+'</div>'+
  '<div style="display:flex;flex-wrap:wrap;gap:8px">'+['imprimir|🖨 Imprimir / PDF|1','abrir|Abrir em nova aba|0','baixar|Baixar HTML|0'].map(x=>{const [a,t,pri]=x.split('|');return '<button type="button" data-rel="'+a+'" style="font:600 13px system-ui,Segoe UI,Arial,sans-serif;padding:9px 14px;border-radius:9px;cursor:pointer;border:1px solid '+(pri==='1'?'#1a6b2a;background:#1a6b2a;color:#fff':'#3b5a6e;background:#0d2132;color:#ddf2ff')+'">'+t+'</button>';}).join('')+'</div>';
 return s;}
function ligar(cfg){CFG=cfg;
 const instalar=()=>{const dlg=document.querySelector(cfg.dialogo);if(!dlg||dlg.querySelector('.rel-prof'))return;const p=painel();const alvo=cfg.antes?dlg.querySelector(cfg.antes):null;const box=cfg.dentro?dlg.querySelector(cfg.dentro)||dlg:dlg;if(alvo)alvo.parentNode.insertBefore(p,alvo);else box.appendChild(p);preencherForm();};
 const iniciar=()=>{instalar();if(cfg.observar){const dlg=document.querySelector(cfg.dialogo);if(dlg)new MutationObserver(()=>{if(!dlg.hidden&&!dlg.querySelector('.rel-prof'))instalar();}).observe(dlg,{childList:true,subtree:false,attributes:true,attributeFilter:['hidden']});}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
 document.addEventListener('click',e=>{const b=e.target.closest('[data-rel]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.rel;if(a==='imprimir')imprimir();else if(a==='abrir')abrir();else if(a==='baixar')baixar();},true);
}
window.PDERelatorio={ligar,html,imprimir,baixar,abrir};
})();

/* ---------- adaptador da História VR ---------- */
(function(){'use strict';
const SKILL={nilo:'O Nilo e a vida no Egito',religiao:'Religião e vida após a morte',escrita:'Escrita e registro',sociedade:'Organização social e poder',tempo:'Tempo histórico e cronologia'};
window.PDERelatorio.ligar({app:'História VR',arquivo:'HistoriaVR',chave:'pde_historia_turma',logo:'assets/logo.png',dialogo:'#summaryDialog',antes:'#summaryDialog > details',guia:'guia-professor.html',
 creditos:'Maquetes geradas pela NEWPC. Datas e medidas aproximadas, conforme literatura didática.',
 dados(){const L=window.HistoriaLab,S=L.state,r=L.report(),c=S.completed||[];
  const DD=window.HISTORIA_DATA||{};
  const ativ=id=>(DD.activities||[]).find(a=>a.id===id)||{label:id};
  const lista=v=>((DD.CATALOGO||{})[v]||[]).flatMap(g=>g[1]);const vistos=v=>lista(v).filter(k=>(S.visited||[]).includes(k)).length;
  const det=id=>{try{if(id==='explorar'||id==='museu')return vistos(id)+' de '+lista(id).length+(id==='museu'?' peças':' fichas');
   if(id==='mumificacao')return S.mumificacao.colocados.filter(Boolean).length+' de '+DD.sequencias.mumificacao.ordem.length+' etapas'+(S.mumificacao.erros?' · '+S.mumificacao.erros+' erros':'');
   if(id==='piramide')return c.includes('piramide')?DD.viagem.length+' trechos':'trecho '+(S.viagem.trecho+1)+' de '+DD.viagem.length;
   if(id==='hieroglifos')return S.hieroglifos.done?S.hieroglifos.acertos+' de '+DD.HIEROGLIFOS.length+' na primeira tentativa':'sinal '+(S.hieroglifos.rodada+1)+' de '+DD.HIEROGLIFOS.length;}catch(_){}return '';};
  const feito=id=>{if(c.includes(id))return true;try{if(id==='mumificacao')return !!S.mumificacao.done;if(id==='hieroglifos')return !!S.hieroglifos.done;}catch(_){}return false;};
  const secoes=(DD.temas||[]).map(t=>{
   const atividades=t.atividades.map(id=>({label:ativ(id).label,feito:feito(id),detalhe:det(id)}));
   const q=(S.quizzes||{})[t.id];const Q=(t.questoes||[]).map(id=>(DD.todasQuestoes||DD.questions||[]).find(x=>x.id===id)).filter(Boolean);
   const quiz=Q.map((it,i)=>{const resp=q?q.answers[i]:undefined;return{texto:it.q,skill:SKILL[it.skill]||it.skill,respondida:resp!==undefined,correta:resp===it.correct,escolha:resp!==undefined?it.options[resp]:'',certa:it.options[it.correct]};});
   const tocado=atividades.some(a=>a.feito)||quiz.some(x=>x.respondida)||S.tema===t.id;
   return{nome:'Tema '+t.nome,sub:t.estuda,atividades,quiz,tocado};}).filter(s=>s.tocado);
  const tm=secoes.reduce((a,s)=>a+s.atividades.filter(x=>x.feito).length,0),tt=secoes.reduce((a,s)=>a+s.atividades.length,0),qa=secoes.reduce((a,s)=>a+s.quiz.filter(x=>x.correta).length,0),qt=secoes.reduce((a,s)=>a+s.quiz.length,0);
  return{inicio:S.started,versao:DD.version||L.version,
   cards:[[tm+'/'+tt,'missões concluídas'],[qa+'/'+qt,'situações corretas no Desafio'],[String((S.visited||[]).length),'fichas investigadas'],[String(r.errors),'tentativas incorretas · '+r.hints+' pistas']],
   secoes};}});
})();
