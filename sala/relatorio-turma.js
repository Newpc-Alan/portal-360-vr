/* Portal Maestro VR · Relatório da turma (v1.0, out/2026)
   Junta o resultado que cada óculos envia à sala (salas/<código>/resultados/<óculos>/<app>, sala-cliente 1.8+) e monta
   um relatório de aprendizagem da turma: participação, missões concluídas, acerto no Desafio, leitura por conteúdo com as
   habilidades da BNCC relacionadas, quadro por óculos e pontos de atenção. Sem dado pessoal: só o número do óculos.
   Saída: página própria pronta para imprimir ou salvar em PDF; escola, turma e professor são editáveis na própria página.
   Cada aula fica guardada neste computador (últimas 12) para gerar o relatório depois de encerrar a sala. */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS={get:k=>{try{return localStorage.getItem(k);}catch(_){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}}};
const HIST='maestro_relatorios_v1',CAB='maestro_relatorio_cab';

/* habilidades relacionadas (mesmo mapeamento dos guias do professor de cada app; confirme com o currículo da rede) */
const H={
 EF05CI06:'Justificar por que os sistemas digestório e respiratório são corresponsáveis pela nutrição do organismo.',
 EF05CI07:'Relacionar o sistema circulatório à distribuição de nutrientes e à eliminação de resíduos.',
 EF05CI08:'Organizar um cardápio equilibrado com base nas necessidades individuais.',
 EF05CI11:'Associar o movimento diário do Sol ao movimento de rotação da Terra.',
 EF05CI12:'Concluir sobre a periodicidade das fases da Lua.',
 EF06CI05:'Explicar a organização básica das células como unidade estrutural e funcional dos seres vivos.',
 EF06CI06:'Concluir que os organismos são um arranjo de sistemas com diferentes níveis de organização.',
 EF06CI07:'Justificar o papel do sistema nervoso na coordenação das ações motoras e sensoriais.',
 EF06CI08:'Explicar a importância da visão e selecionar lentes para corrigir defeitos da visão.',
 EF06CI09:'Deduzir que sustentação e movimento resultam da interação dos sistemas muscular, ósseo e nervoso.',
 EF06CI11:'Identificar as camadas que estruturam o planeta Terra e suas características.',
 EF06CI12:'Identificar tipos de rocha e relacionar a formação de fósseis às rochas sedimentares.',
 EF07CI15:'Interpretar vulcões, terremotos e tsunamis pelo modelo das placas tectônicas.',
 EF07CI16:'Justificar o formato das costas brasileira e africana pela deriva dos continentes.',
 EF08CI08:'Explicar as transformações da puberdade pela atuação dos hormônios e do sistema nervoso.',
 EF08CI12:'Justificar as fases da Lua e os eclipses por meio de modelos.',
 EF08CI13:'Representar rotação e translação e o papel da inclinação do eixo nas estações do ano.',
 EF09CI08:'Associar os gametas à transmissão das características hereditárias.',
 EF09CI09:'Discutir as ideias de Mendel sobre hereditariedade.',
 EF09CI14:'Descrever a composição e a estrutura do Sistema Solar.'};
const BNCC={
 corpo:{respiratorio:['EF05CI06','EF06CI06'],circulatorio:['EF05CI07','EF06CI06'],digestorio:['EF05CI06','EF05CI08'],esqueletico:['EF06CI09'],muscular:['EF06CI09'],nervoso:['EF06CI07'],sentidos:['EF06CI08'],urinario:['EF05CI07'],endocrino:['EF08CI08'],linfatico:['EF06CI06'],tegumentar:['EF06CI06'],reprodutor:['EF08CI08']},
 terra:{terra:['EF06CI11'],camadas:['EF06CI11'],placas:['EF07CI15','EF07CI16'],vulcao:['EF07CI15'],rochas:['EF06CI12']},
 celula:{animal:['EF06CI05','EF06CI06'],vegetal:['EF06CI05']},
 dna:{dna:['EF09CI08','EF09CI09']},
 solar:{solar:['EF05CI11','EF05CI12','EF08CI12','EF08CI13','EF09CI14']}};
const NOME_APP={corpo:'Corpo Humano',terra:'Terra por Dentro',celula:'Célula 3D',dna:'DNA Imersivo',solar:'Sistema Solar'};

/* ---------- histórico local ---------- */
function historico(){try{return JSON.parse(LS.get(HIST)||'[]');}catch(_){return [];}}
function guardar(codigo,sala){if(!codigo||!sala||!sala.resultados)return;const h=historico().filter(x=>x.codigo!==codigo||x.dia!==new Date().toISOString().slice(0,10));
  const rotulos={};Object.entries(sala.oculos||{}).forEach(([id,o])=>{rotulos[id]=o&&o.rotulo;});
  h.unshift({codigo,dia:new Date().toISOString().slice(0,10),quando:Date.now(),resultados:sala.resultados,rotulos});LS.set(HIST,JSON.stringify(h.slice(0,12)));}

/* ---------- cálculo ---------- */
const pct=(a,b)=>b?Math.round(100*a/b):null;
function nivel(p){return p===null?{t:'Sem dados',c:'sd'}:p>=70?{t:'Consolidado',c:'ok'}:p>=50?{t:'Em desenvolvimento',c:'med'}:{t:'Precisa de retomada',c:'baixo'};}
function calcular(resultados,rotulos){
  const oculos=[],conteudos={};
  Object.entries(resultados||{}).forEach(([id,porApp])=>{const linha={id,rotulo:(rotulos||{})[id]||'',apps:[],missoes:0,missoesTot:0,ac:0,re:0,erros:0,pistas:0};
    Object.entries(porApp||{}).forEach(([app,r])=>{if(!r||!r.secoes)return;linha.rotulo=linha.rotulo||r.rotulo||'Óculos';let usou=false;
      r.secoes.forEach(s=>{const feitas=(s.missoes||[]).filter(m=>m.feita).length,d=s.desafio||{};/* conta como trabalhado com 2+ missões ou o Desafio respondido: missões compartilhadas entre sistemas (ex.: Explorar) não abrem um conteúdo sozinhas */const tocou=feitas>=2||(d.respondidas||0)>0;if(!tocou)return;usou=true;
        linha.missoes+=feitas;linha.missoesTot+=(s.missoes||[]).length;linha.ac+=d.acertos||0;linha.re+=d.respondidas||0;
        const k=app+':'+s.id,c=conteudos[k]||(conteudos[k]={app,sec:s.id,nome:s.nome,oculos:0,feitas:0,tot:0,ac:0,re:0,missoes:{}});
        c.oculos++;c.feitas+=feitas;c.tot+=(s.missoes||[]).length;c.ac+=d.acertos||0;c.re+=d.respondidas||0;
        (s.missoes||[]).forEach(m=>{const mm=c.missoes[m.id]||(c.missoes[m.id]={nome:m.nome,feitas:0,n:0});mm.n++;if(m.feita)mm.feitas++;});});
      if(usou){linha.apps.push(NOME_APP[app]||app);linha.erros+=r.erros||0;linha.pistas+=r.pistas||0;}});
    if(linha.apps.length)oculos.push(linha);});
  oculos.sort((a,b)=>String(a.rotulo).localeCompare(String(b.rotulo),'pt-BR',{numeric:true}));
  const lista=Object.values(conteudos).sort((a,b)=>b.oculos-a.oculos);
  lista.forEach(c=>{c.pMis=pct(c.feitas,c.tot);c.pDes=pct(c.ac,c.re);c.niv=nivel(c.re?c.pDes:c.pMis);c.bncc=((BNCC[c.app]||{})[c.sec])||[];});
  const tot={oculos:oculos.length,missoes:oculos.reduce((s,o)=>s+o.missoes,0),ac:oculos.reduce((s,o)=>s+o.ac,0),re:oculos.reduce((s,o)=>s+o.re,0),erros:oculos.reduce((s,o)=>s+o.erros,0),pistas:oculos.reduce((s,o)=>s+o.pistas,0)};
  return{oculos,conteudos:lista,tot};}

/* ---------- página ---------- */
function pagina(dados,info){const {oculos,conteudos,tot}=dados;let cab={};try{cab=JSON.parse(LS.get(CAB)||'{}');}catch(_){}
  const data=new Date(info.quando||Date.now()).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  const pDes=pct(tot.ac,tot.re),media=tot.oculos?(tot.missoes/tot.oculos).toFixed(1).replace('.',','):'0';
  const habil={};conteudos.forEach(c=>c.bncc.forEach(b=>{(habil[b]=habil[b]||[]).push(c);}));
  const atencao=conteudos.filter(c=>c.niv.c==='baixo'||c.niv.c==='med');
  const misFracas=[];conteudos.forEach(c=>Object.values(c.missoes).forEach(m=>{const p=pct(m.feitas,m.n);if(m.n>=2&&p!==null&&p<50)misFracas.push({c,m,p});}));misFracas.sort((a,b)=>a.p-b.p);
  const barra=p=>p===null?'<span class="sd">sem dados</span>':'<span class="barra"><i style="width:'+p+'%"></i></span> <b>'+p+'%</b>';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório da turma · Portal 360º VR</title>
<style>
:root{--azul:#0F2C4A;--verde:#1a6b2a;--lima:#a6c544;--ciano:#3ea8ce;--suave:#5b6b7a;--borda:#dbe3ec}
*{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--azul);background:#eef2f6}
.folha{max-width:980px;margin:24px auto;background:#fff;padding:34px 40px;border-radius:14px;box-shadow:0 4px 24px rgba(15,44,74,.12)}
.topo{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:4px solid;border-image:linear-gradient(90deg,var(--ciano),var(--lima)) 1;padding-bottom:16px}
h1{margin:0;font-size:26px}h2{font-size:18px;margin:28px 0 10px}.sub{color:var(--suave);margin:4px 0 0}
.campos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 18px;margin-top:14px;font-size:14px}
.campos span[contenteditable]{border-bottom:1px dashed #9fb3c6;min-width:160px;display:inline-block;padding:0 4px;outline:none}
.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:20px}
.kpi{background:#f3f7fb;border-radius:12px;padding:14px}.kpi b{display:block;font-size:28px}.kpi span{font-size:13px;color:var(--suave)}
table{width:100%;border-collapse:collapse;font-size:13.5px}th,td{padding:8px 8px;border-bottom:1px solid var(--borda);text-align:left;vertical-align:top}th{background:#f3f7fb;font-size:12px;text-transform:uppercase;letter-spacing:.4px;color:var(--suave)}
.barra{display:inline-block;width:90px;height:8px;background:#e3eaf1;border-radius:6px;vertical-align:middle;overflow:hidden}.barra i{display:block;height:100%;background:linear-gradient(90deg,var(--ciano),var(--verde))}
.tag{display:inline-block;padding:2px 8px;border-radius:20px;font-size:12px;font-weight:700}.tag.ok{background:#dff3e4;color:#1a6b2a}.tag.med{background:#fff1d6;color:#8a5a00}.tag.baixo{background:#fde3e1;color:#a5281c}.tag.sd{background:#eef2f6;color:var(--suave)}
.cod{font-weight:800;white-space:nowrap}.hab{color:var(--suave);font-size:12.5px}.sd{color:var(--suave);font-size:12px}
ul{margin:6px 0 0 18px;padding:0}li{margin:4px 0}
.nota{font-size:12px;color:var(--suave);margin-top:26px;border-top:1px solid var(--borda);padding-top:10px;line-height:1.5}
.acoes{max-width:980px;margin:16px auto 0;display:flex;gap:10px;justify-content:flex-end}.acoes button{border:0;border-radius:10px;padding:10px 16px;font-weight:700;cursor:pointer;background:var(--azul);color:#fff}.acoes button.sec{background:#dfe7ef;color:var(--azul)}
@media print{body{background:#fff}.folha{box-shadow:none;margin:0;max-width:none;padding:0}.acoes{display:none}.campos span[contenteditable]{border:0}h2{break-after:avoid}tr{break-inside:avoid}}
@media (max-width:700px){.folha{padding:20px 16px;margin:0;border-radius:0}.kpis{grid-template-columns:repeat(2,1fr)}.campos{grid-template-columns:1fr}}
</style></head><body>
<div class="acoes"><button class="sec" data-action="salvar">Baixar arquivo</button><button data-action="imprimir">Imprimir ou salvar em PDF</button></div>
<div class="folha">
<div class="topo"><div><h1>Relatório da turma</h1><p class="sub">Portal 360º VR · aula de ${esc(data)} · sala ${esc(info.codigo||'')}</p>
<div class="campos"><div>Escola: <span contenteditable data-c="escola">${esc(cab.escola||'')}</span></div><div>Turma: <span contenteditable data-c="turma">${esc(cab.turma||'')}</span></div>
<div>Professor(a): <span contenteditable data-c="professor">${esc(cab.professor||'')}</span></div><div>Componente: <span contenteditable data-c="componente">${esc(cab.componente||'Ciências')}</span></div></div></div>
${info.logo?'<img src="'+esc(info.logo)+'" alt="" style="width:64px;height:64px;border-radius:50%">':''}</div>
<div class="kpis"><div class="kpi"><b>${tot.oculos}</b><span>óculos com atividade</span></div><div class="kpi"><b>${tot.missoes}</b><span>missões concluídas (média ${media} por óculos)</span></div>
<div class="kpi"><b>${pDes===null?'–':pDes+'%'}</b><span>acerto no Desafio (${tot.ac} de ${tot.re} respostas)</span></div><div class="kpi"><b>${tot.pistas}</b><span>pistas usadas · ${tot.erros} tentativas incorretas</span></div></div>
<h2>Aprendizagem por conteúdo</h2>
${conteudos.length?`<table><thead><tr><th>Conteúdo</th><th>Habilidades BNCC</th><th>Óculos</th><th>Missões</th><th>Desafio</th><th>Leitura</th></tr></thead><tbody>${conteudos.map(c=>`<tr><td><b>${esc(c.nome)}</b><div class="sd">${esc(NOME_APP[c.app]||c.app)}</div></td><td>${c.bncc.map(b=>'<span class="cod">'+b+'</span>').join('<br>')||'<span class="sd">–</span>'}</td><td>${c.oculos}</td><td>${barra(c.pMis)}</td><td>${c.re?barra(c.pDes)+'<div class="sd">'+c.ac+' de '+c.re+'</div>':'<span class="sd">não respondido</span>'}</td><td><span class="tag ${c.niv.c}">${c.niv.t}</span></td></tr>`).join('')}</tbody></table>`:'<p class="sd">Nenhum óculos enviou resultado nesta aula.</p>'}
${Object.keys(habil).length?`<h2>Habilidades trabalhadas</h2><table><tbody>${Object.keys(habil).sort().map(b=>`<tr><td class="cod">${b}</td><td>${esc(H[b]||'')}<div class="hab">Trabalhada em: ${habil[b].map(c=>esc(c.nome)).join(', ')}</div></td></tr>`).join('')}</tbody></table>`:''}
<h2>Pontos de atenção</h2>
${atencao.length||misFracas.length?`<ul>${atencao.map(c=>`<li><b>${esc(c.nome)}</b>: ${c.re?'acerto de '+c.pDes+'% no Desafio':'só '+c.pMis+'% das missões concluídas'}. Sugestão: retomar em sala antes de avançar${c.bncc.length?' ('+c.bncc.join(', ')+')':''}.</li>`).join('')}${misFracas.slice(0,3).map(x=>`<li>Missão <b>${esc(x.m.nome)}</b> (${esc(x.c.nome)}): concluída por ${x.m.feitas} de ${x.m.n} óculos.</li>`).join('')}</ul>`:'<p>Nenhum ponto crítico: os conteúdos trabalhados ficaram com acerto de 70% ou mais.</p>'}
<h2>Quadro por óculos</h2>
${oculos.length?`<table><thead><tr><th>Óculos</th><th>Apps</th><th>Missões</th><th>Desafio</th><th>Pistas</th><th>Erros</th></tr></thead><tbody>${oculos.map(o=>`<tr><td><b>${esc(o.rotulo)}</b></td><td>${esc(o.apps.join(', '))}</td><td>${o.missoes}</td><td>${o.re?o.ac+' de '+o.re+' ('+pct(o.ac,o.re)+'%)':'<span class="sd">–</span>'}</td><td>${o.pistas}</td><td>${o.erros}</td></tr>`).join('')}</tbody></table>`:''}
<p class="nota">Como ler: cada linha é um óculos, não um aluno nominal (o Portal 360º VR não coleta dados pessoais). Se um óculos foi usado por mais de um aluno, os números somam o uso dele. "Leitura" usa o acerto no Desafio quando houve respostas e, sem respostas, a proporção de missões concluídas: 70% ou mais, consolidado; de 50% a 69%, em desenvolvimento; abaixo de 50%, precisa de retomada. As habilidades são as relacionadas a cada conteúdo no guia do professor; confirme com o currículo da rede. Gerado em ${esc(new Date().toLocaleString('pt-BR'))}.</p>
</div>
<script>
document.addEventListener('input',e=>{const c=e.target.dataset&&e.target.dataset.c;if(!c)return;try{const k='${CAB}';const v=JSON.parse(localStorage.getItem(k)||'{}');v[c]=e.target.textContent.trim();localStorage.setItem(k,JSON.stringify(v));}catch(_){}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;if(b.dataset.action==='imprimir')window.print();if(b.dataset.action==='salvar'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['<!doctype html>'+document.documentElement.outerHTML],{type:'text/html'}));a.download='relatorio-turma-${esc(info.codigo||'')}-${new Date(info.quando||Date.now()).toISOString().slice(0,10)}.html';a.click();}});
<\/script></body></html>`;}

function abrir(resultados,rotulos,info){const html=pagina(calcular(resultados,rotulos),info||{});const w=window.open('','_blank');if(!w)return false;w.document.open();w.document.write(html);w.document.close();return true;}
window.RelatorioTurma={guardar,historico,calcular,pagina,abrir,BNCC,H};
})();
