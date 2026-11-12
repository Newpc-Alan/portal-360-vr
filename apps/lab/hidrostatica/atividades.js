/* Portal Lab 3D · Bancada 04 · Hidrostática · roteiros pedagógicos (v1.0)
   Cada experimento: objetivos, conhecimentos prévios, materiais, hipótese, procedimento (com condição de avanço
   lida do estado da simulação), colunas da tabela, gráfico, questões e conclusão. Textos para EF (9º ano) e EM.
   BNCC indicada para validação pela equipe pedagógica. */
(function(){'use strict';
const X={};
X.bancada={numero:'04',nome:'Hidrostática',descricao:'Empuxo, densidade, pressão e vasos comunicantes com dinamômetro, cilindro, recipiente graduado, transbordamento e tubo em U.'};
X.experimentos=[
{id:'arquimedes',num:11,nome:'Princípio de Arquimedes',cena:'cilindro',recipiente:'transbordamento',
 bncc:{ef:'Ciências · 9º ano (habilidade a validar pela equipe pedagógica)',em:'EM13CNT101 · EM13CNT301'},
 objetivos:['Medir o empuxo pela diferença entre o peso no ar e o peso aparente na água.','Coletar o líquido deslocado e calcular o peso dele.','Verificar que o empuxo é igual ao peso do líquido deslocado.'],
 previos:['Peso é a força com que a Terra puxa um corpo: P = m · g.','O dinamômetro mede forças em newtons (N) pela deformação de uma mola.','1 mL corresponde a 1 cm³.'],
 materiais:['Suporte universal com haste e mufa','Dinamômetro (analógico ou digital)','Cilindro metálico de 50 cm³ com argola','Recipiente de transbordamento cheio até a bica','Proveta graduada de 100 mL','Fio inextensível'],
 hipotese:{q:'Ao mergulhar o cilindro na água, o que você espera que aconteça com a leitura do dinamômetro?',op:['Aumenta','Diminui','Não muda'],ok:1},
 passos:[
  {t:'Com o cilindro fora da água, observe a leitura do dinamômetro e registre a medição. Esse é o peso no ar.',ok:(s,c)=>c.medidas.some(m=>m.situ==='fora')},
  {t:'Desça o cilindro devagar (arraste o cilindro, use o controle de altura ou as setas do teclado). Observe a água saindo pela bica.',ok:(s)=>s.coletado>1e-6},
  {t:'Mergulhe o cilindro por inteiro, sem encostar no fundo, e registre a medição.',ok:(s,c)=>c.medidas.some(m=>m.situ==='submerso')},
  {t:'Leia o volume na proveta. Compare o empuxo medido (peso no ar − peso aparente) com o peso da água coletada.',ok:(s,c)=>c.comparou},
  {t:'Responda às questões e conclua a atividade.',ok:(s,c)=>c.concluiu}],
 colunas:['situacao','prof','leitura','empuxoMed','coletado','pesoLiq'],grafico:'arquimedes',
 questoes:[
  {q:'O empuxo medido foi praticamente igual ao peso da água coletada na proveta. O que isso mostra?',op:['Que o empuxo depende só do material do cilindro','Que o empuxo é igual ao peso do líquido deslocado','Que a água ficou mais pesada','Que o dinamômetro estava com defeito'],ok:1,why:'Esse é o princípio de Arquimedes: todo corpo mergulhado num líquido recebe uma força para cima igual ao peso do líquido que ele desloca.'},
  {q:'Se o mesmo cilindro fosse mergulhado em álcool (menos denso que a água), o empuxo seria:',op:['Maior','Igual','Menor'],ok:2,why:'O volume deslocado seria o mesmo, mas o álcool tem menos massa por volume. O peso do líquido deslocado, e portanto o empuxo, seria menor.'},
  {q:'Por que o recipiente precisa estar cheio exatamente até a bica antes de começar?',op:['Para o cilindro afundar mais rápido','Para que todo o líquido deslocado saia pela bica e seja medido','Para a água ficar mais fria','Não faz diferença'],ok:1,why:'Se o nível estiver abaixo da bica, parte do volume deslocado só faz o nível subir e não é coletado: a proveta mostraria menos do que o volume real.'}],
 aberta:'Explique, com as suas medições, por que o dinamômetro marca menos quando o cilindro está dentro da água.',
 conclusao:'O empuxo medido pelo dinamômetro coincide com o peso do líquido deslocado coletado na proveta, dentro da precisão dos instrumentos: E = ρ · g · V(submerso).'},
{id:'densidade',num:12,nome:'Empuxo e densidade',cena:'cilindro',recipiente:'graduado',
 bncc:{ef:'Ciências · 9º ano (habilidade a validar pela equipe pedagógica)',em:'EM13CNT101 · EM13CNT301'},
 objetivos:['Comparar o empuxo sobre o mesmo cilindro em líquidos de densidades diferentes.','Relacionar flutuar ou afundar com as densidades do objeto e do líquido.'],
 previos:['Densidade é a massa por unidade de volume: ρ = m / V.','A água tem densidade de cerca de 1 000 kg/m³ (1 g/cm³).'],
 materiais:['Suporte universal e dinamômetro','Cilindros de alumínio, PVC e madeira','Béquer graduado','Água, água com sal, álcool, óleo de soja e glicerina'],
 hipotese:{q:'Em qual líquido o cilindro de alumínio vai receber o MAIOR empuxo?',op:['Álcool','Água','Glicerina','Em todos é igual'],ok:2},
 passos:[
  {t:'Mergulhe o cilindro de alumínio por inteiro na água e registre a medição.',ok:(s,c)=>c.medidas.some(m=>m.situ==='submerso'&&m.liquido==='agua')},
  {t:'Troque o líquido (painel lateral) e repita a medição com o cilindro totalmente submerso em pelo menos mais dois líquidos.',ok:(s,c)=>new Set(c.medidas.filter(m=>m.situ==='submerso').map(m=>m.liquido)).size>=3},
  {t:'Agora troque o cilindro por um de madeira e solte-o na água. O que acontece com o fio e com o dinamômetro?',ok:(s)=>s.situ==='flutua'},
  {t:'Veja o gráfico do empuxo em função da densidade do líquido e conclua a atividade.',ok:(s,c)=>c.concluiu}],
 colunas:['liquido','material','situacao','leitura','empuxoMed','empuxoTeo'],grafico:'densidade',
 questoes:[
  {q:'O gráfico do empuxo em função da densidade do líquido (mesmo volume submerso) é:',op:['Uma reta: o empuxo é proporcional à densidade','Uma curva que cai','Constante'],ok:0,why:'Com o mesmo volume submerso, E = ρ · g · V: dobrar a densidade do líquido dobra o empuxo.'},
  {q:'O cilindro de madeira flutua na água porque:',op:['A madeira é leve','A densidade da madeira é menor que a da água','A madeira absorve água','O fio segura o cilindro'],ok:1,why:'Um corpo flutua quando a densidade dele é menor que a do líquido: o empuxo da parte submersa já basta para equilibrar o peso.'},
  {q:'Que fração do cilindro de madeira (600 kg/m³) fica submersa na água (1 000 kg/m³)?',op:['40%','60%','100%'],ok:1,why:'Na flutuação, E = P: ρL · Vsub = ρO · V, então Vsub/V = 600/1 000 = 0,6.'}],
 aberta:'Um navio de aço flutua, mas um prego de aço afunda. Use o que você mediu para explicar.',
 conclusao:'Para o mesmo volume submerso, o empuxo é proporcional à densidade do líquido. Um corpo flutua quando a densidade dele é menor que a do líquido; a fração submersa é igual à razão entre as densidades.'},
{id:'pressao',num:13,nome:'Pressão hidrostática',cena:'cilindro',recipiente:'graduado',
 bncc:{ef:'Ciências · 9º ano (habilidade a validar pela equipe pedagógica)',em:'EM13CNT101 · EM13CNT301'},
 objetivos:['Medir como a pressão na base do cilindro muda com a profundidade.','Explicar por que o empuxo para de aumentar depois que o cilindro fica totalmente submerso.'],
 previos:['Pressão é força por área: p = F / A. A unidade é o pascal (Pa).','Quanto mais fundo, mais líquido existe acima de um ponto.'],
 materiais:['Suporte universal e dinamômetro','Cilindro de alumínio','Béquer graduado e régua','Água e outros líquidos'],
 hipotese:{q:'Depois que o cilindro fica totalmente submerso, se você descer mais, o empuxo:',op:['Continua aumentando','Fica igual','Diminui'],ok:1},
 passos:[
  {t:'Registre medições com a base do cilindro em pelo menos quatro profundidades diferentes, desde que ela toca a água até ficar todo submerso.',ok:(s,c)=>new Set(c.medidas.filter(m=>m.prof>0).map(m=>Math.round(m.prof*1000))).size>=4},
  {t:'Desça mais, com o cilindro já totalmente submerso, e registre mais duas medições.',ok:(s,c)=>c.medidas.filter(m=>m.situ==='submerso').length>=2},
  {t:'Compare os gráficos de pressão × profundidade e empuxo × profundidade e conclua.',ok:(s,c)=>c.concluiu}],
 colunas:['prof','pressao','leitura','empuxoMed','situacao'],grafico:'pressao',
 questoes:[
  {q:'O gráfico da pressão na base do cilindro em função da profundidade é:',op:['Uma reta que cresce: p = ρ · g · h','Uma curva que se estabiliza','Constante'],ok:0,why:'A pressão hidrostática cresce de forma proporcional à profundidade: cada centímetro a mais de água acrescenta ρ · g · 0,01 m ≈ 98 Pa.'},
  {q:'Por que o empuxo fica constante depois que o cilindro está todo submerso, mesmo descendo mais?',op:['Porque a pressão para de aumentar','Porque a diferença de pressão entre a base e o topo não muda','Porque a água fica mais densa'],ok:1,why:'Descendo, aumentam as pressões no topo e na base, mas a diferença entre elas (que gera o empuxo) depende só da altura do cilindro: E = ρ · g · V.'}],
 aberta:'Por que as barragens são mais grossas embaixo do que em cima?',
 conclusao:'A pressão hidrostática cresce linearmente com a profundidade (p = ρ · g · h). O empuxo vem da diferença de pressão entre a base e o topo do corpo, por isso depende do volume submerso e não da profundidade.'},
{id:'vasos',num:14,nome:'Vasos comunicantes',cena:'tuboU',
 bncc:{ef:'Ciências · 9º ano (habilidade a validar pela equipe pedagógica)',em:'EM13CNT101 · EM13CNT301'},
 objetivos:['Observar que um mesmo líquido fica no mesmo nível em vasos que se comunicam.','Medir alturas de dois líquidos que não se misturam e calcular a densidade de um deles.'],
 previos:['Pontos de um mesmo líquido em repouso, na mesma altura, têm a mesma pressão.','Água e óleo não se misturam.'],
 materiais:['Tubo em U de vidro com régua','Água','Óleo de soja, álcool ou outro líquido não miscível (simulado)'],
 hipotese:{q:'Ao despejar óleo num dos ramos do tubo em U com água, a superfície do óleo vai ficar:',op:['Mais alta que a da água','Na mesma altura','Mais baixa que a da água'],ok:0},
 passos:[
  {t:'Com só água no tubo, observe os dois ramos e registre a medição.',ok:(s,c)=>c.medidas.some(m=>m.vo===0)},
  {t:'Despeje o segundo líquido no ramo direito (controle de volume) e registre a medição com as alturas.',ok:(s,c)=>c.medidas.some(m=>m.vo>0)},
  {t:'Registre mais duas medições com volumes diferentes e compare ρ1 · h1 com ρ2 · h2.',ok:(s,c)=>c.medidas.filter(m=>m.vo>0).length>=3},
  {t:'Conclua a atividade.',ok:(s,c)=>c.concluiu}],
 colunas:['vo','ho','dh','desnivel','razao'],grafico:'vasos',
 questoes:[
  {q:'Com só água no tubo em U, os dois ramos ficam:',op:['No mesmo nível','O ramo maior mais alto','Depende da largura'],ok:0,why:'Pontos de um mesmo líquido na mesma altura têm a mesma pressão; para isso, as superfícies livres precisam estar no mesmo nível.'},
  {q:'Com 5,0 cm de óleo equilibrando 4,6 cm de água acima da interface, a densidade do óleo é:',op:['920 kg/m³','1 087 kg/m³','500 kg/m³'],ok:0,why:'ρóleo · hóleo = ρágua · hágua → ρóleo = 1 000 × 4,6 / 5,0 = 920 kg/m³.'}],
 aberta:'Como os pedreiros usam uma mangueira transparente com água para marcar o mesmo nível em paredes distantes?',
 conclusao:'Em vasos comunicantes, um mesmo líquido em repouso fica no mesmo nível. Com dois líquidos não miscíveis, as alturas acima da interface são inversamente proporcionais às densidades: ρ1 · h1 = ρ2 · h2.'}
];
window.LabAtividades=X;
})();
