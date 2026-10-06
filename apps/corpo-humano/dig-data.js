/* Corpo Humano Imersivo · Módulo 4: Sistema Digestório (v4.2)
   O Digestório deixa de ser uma missão única e vira módulo: Contexto, Explorar (13 fichas), Jornada do pão (8 paradas),
   Ordene o caminho (missão anterior) e Desafio (5 situações). Chaves de áudio: fichas = chave; orientações = dig-*. */
(function(D){'use strict';
const I={
 lingua:{name:'Língua',kind:'Boca',color:'#d96b73',text:'A língua é um músculo que mistura o alimento com a saliva, forma o bolo alimentar e o empurra para a garganta. E as papilas gustativas sentem o doce, o salgado, o azedo, o amargo e o umami.',detail:'São cerca de 10 mil papilas gustativas, renovadas a cada duas semanas. O gosto só aparece quando o alimento está dissolvido na saliva.',medio:'A língua também participa da fala e da deglutição: ela sela a boca e empurra o bolo para a orofaringe, disparando o reflexo de engolir.'},
 salivares:{name:'Glândulas salivares',kind:'Glândula anexa',color:'#f0b8b0',text:'Três pares de glândulas salivares produzem mais de um litro de saliva por dia. A saliva umedece o alimento, protege os dentes e traz a amilase, a primeira enzima da digestão, que começa a quebrar o amido ainda na boca.',detail:'Parótidas (na frente das orelhas), submandibulares (embaixo do queixo) e sublinguais (embaixo da língua). Só de pensar em comida, elas já trabalham.',medio:'A saliva tem lisozima e anticorpos (IgA), que ajudam a controlar as bactérias da boca; a caxumba é a inflamação da parótida.'},
 pancreas:{name:'Pâncreas',kind:'Glândula anexa',color:'#f2d39b',text:'O pâncreas fica atrás do estômago. Ele produz o suco pancreático, com enzimas para carboidratos, proteínas e gorduras, e o despeja no duodeno. E ainda fabrica a insulina, o hormônio que controla o açúcar no sangue.',detail:'Tem uns 15 centímetros e duas funções: digestiva (enzimas e bicarbonato, que neutraliza o ácido do estômago) e hormonal (insulina e glucagon).',medio:'Amilase, lipase e tripsina são as principais enzimas pancreáticas. Quando a insulina falta ou não funciona, surge o diabetes.'},
 vesicula:{name:'Vesícula biliar',kind:'Glândula anexa',color:'#7aa65a',text:'A vesícula biliar é uma bolsinha embaixo do fígado que guarda a bile. Quando uma refeição gordurosa chega ao duodeno, ela se contrai e despeja a bile pelo ducto biliar, quebrando a gordura em gotículas para as enzimas trabalharem.',detail:'A bile é produzida pelo fígado, não pela vesícula: a vesícula só armazena e concentra. Cabe cerca de 50 mililitros.',medio:'Quando a bile fica muito concentrada, formam-se cálculos (pedras na vesícula). A vesícula pode ser retirada; a bile passa a ir direto do fígado ao duodeno.'},
 duodeno:{name:'Duodeno',kind:'Intestino delgado',color:'#e8b065',text:'O duodeno é a primeira parte do intestino delgado, com uns 25 centímetros, em forma de C abraçando o pâncreas. É aqui que o quimo ácido do estômago encontra a bile e o suco pancreático. A maior parte da digestão química acontece neste trecho.',detail:'Depois do duodeno vêm o jejuno e o íleo, que completam os seis metros do intestino delgado.',medio:'O bicarbonato do pâncreas neutraliza o ácido vindo do estômago; sem isso, as enzimas intestinais não funcionariam e a parede do duodeno sofreria (úlcera duodenal).'},
 apendice:{name:'Apêndice',kind:'Intestino grosso',color:'#c99a6b',text:'O apêndice é um dedinho de uns 8 centímetros na entrada do intestino grosso. Durante muito tempo foi considerado inútil; hoje se sabe que ele guarda bactérias boas e participa da defesa do corpo. Quando inflama, é a apendicite.',detail:'Fica do lado direito, embaixo. A dor da apendicite costuma começar perto do umbigo e depois descer para esse ponto.',medio:'O apêndice é rico em tecido linfático e funciona como reserva da microbiota intestinal, repovoando o intestino depois de uma infecção.'}
};
Object.assign(D.info,I);
D.DIG_NOVAS=Object.keys(I);
D.DIG_TODAS=['boca','lingua','salivares','faringe','esofago','estomago','duodeno','intestino_delgado','intestino_grosso','apendice','figado','vesicula','pancreas'];
/* o Digestório vira módulo próprio: a missão Ordene (alimento) passa para ele */
const al=D.activities.find(a=>a.id==='alimento');if(al){al.modulo='dig';al.label='Ordene o caminho';}
D.activities.push(
 {id:'digContexto',label:'Contexto',title:'Um tubo que atravessa você.',subtitle:'Do corpo inteiro ao tubo digestório e às glândulas que o ajudam.',kicker:'LOCALIZE',modulo:'dig'},
 {id:'digestorio',label:'Explorar',title:'Quem faz o quê na digestão.',subtitle:'Aponte em um órgão para ver a ficha e ouvir a explicação.',kicker:'EXPLORE',modulo:'dig'},
 {id:'jornada',label:'Jornada do pão',title:'Um pedaço de pão, oito paradas.',subtitle:'Acompanhe o alimento e veja o que muda em cada órgão.',kicker:'ACOMPANHE',modulo:'dig'}
);
/* a missão Ordene fica depois da Jornada */
const idx=D.activities.findIndex(a=>a.id==='alimento');if(idx>=0){const [a]=D.activities.splice(idx,1);D.activities.push(a);}
D.digContext=[
 {name:'Corpo inteiro',text:'Veja o corpo inteiro. A digestão é um tubo que atravessa você de ponta a ponta: começa na boca e termina no ânus, com uns 9 metros no total. Toque no corpo para a gente avançar.',audio:'dig-contexto-0'},
 {name:'O tubo digestório',text:'Esse é o tubo digestório: boca, faringe, esôfago, estômago, intestino delgado e intestino grosso. O alimento passa por dentro dele, e o que o corpo aproveita atravessa a parede. Toque de novo para ver quem ajuda de fora.',audio:'dig-contexto-1'},
 {name:'As glândulas anexas',text:'Agora as glândulas anexas: as salivares, o fígado, a vesícula e o pâncreas. O alimento nunca passa por dentro delas, mas elas despejam no tubo os sucos que fazem a digestão acontecer. Na missão Explorar, aponte em cada órgão.',audio:'dig-contexto-2'}
];
D.jornada=[
 {orgao:'boca',titulo:'Boca',text:'Tudo começa aqui. Os dentes trituram o pão, a língua mistura, e a saliva já entra em ação: a amilase começa a quebrar o amido em açúcares. Por isso o pão fica adocicado se você mastiga bastante.',chips:['Mastigação','Amilase','Amido → açúcares'],audio:'dig-jornada-0'},
 {orgao:'esofago',titulo:'Faringe e esôfago',text:'Engoliu. O bolo passa pela faringe e entra no esôfago. Daqui para a frente você não controla mais nada: ondas de contração, o peristaltismo, empurram o alimento para baixo. Funciona até de cabeça para baixo.',chips:['Peristaltismo','25 cm','Uns 7 segundos'],audio:'dig-jornada-1'},
 {orgao:'estomago',titulo:'Estômago',text:'No estômago o pão é misturado com o suco gástrico, ácido o bastante para corroer metal. O ácido elimina micróbios e a pepsina começa a digerir as proteínas. Depois de umas três horas, sobra uma pasta: o quimo.',chips:['Ácido clorídrico','Pepsina → proteínas','Quimo · ~3 h'],audio:'dig-jornada-2'},
 {orgao:'duodeno',titulo:'Duodeno',text:'O quimo chega ao duodeno, a primeira parte do intestino delgado. Aqui entram dois reforços: a bile, que o fígado produz e a vesícula guarda, quebra as gorduras em gotículas; e o suco do pâncreas, que neutraliza o ácido e traz enzimas para carboidratos, proteínas e gorduras.',chips:['Bile → gorduras','Suco pancreático','Bicarbonato'],audio:'dig-jornada-3',extras:['vesicula','pancreas']},
 {orgao:'intestino_delgado',titulo:'Intestino delgado',text:'Seis metros de intestino, com a parede cheia de dobras e vilosidades. É aqui que a digestão termina e os nutrientes atravessam a parede e caem no sangue: glicose, aminoácidos, ácidos graxos, vitaminas.',chips:['Vilosidades','Absorção','~6 m'],audio:'dig-jornada-4'},
 {orgao:'figado',titulo:'Fígado',text:'O sangue que sai do intestino passa primeiro pelo fígado, pela veia porta. O fígado filtra, guarda glicose na forma de glicogênio, fabrica proteínas e neutraliza substâncias tóxicas. É a fábrica química do corpo.',chips:['Veia porta','Glicogênio','Desintoxicação'],audio:'dig-jornada-5'},
 {orgao:'intestino_grosso',titulo:'Intestino grosso',text:'O que não foi absorvido segue para o intestino grosso. Aqui o corpo recupera água e sais, e bilhões de bactérias terminam o serviço, produzindo até vitaminas. O resto vira fezes e é eliminado.',chips:['Água e sais','Microbiota','~1,5 m'],audio:'dig-jornada-6'},
 {orgao:null,titulo:'Fim da viagem',text:'Entre 24 e 72 horas depois, a energia daquele pão já está nas suas células, movendo músculos e alimentando o cérebro. A digestão é o sistema que transforma comida em você.',chips:['24 a 72 horas','Energia nas células'],audio:'dig-jornada-7'}
];
D.digGuide=[
 {view:'digContexto',title:'Localize o caminho',goal:'Vamos começar vendo o caminho inteiro. Avance do corpo até o tubo digestório e descubra quem são as glândulas anexas.',check:'digContexto',audio:'dig-aula-contexto'},
 {view:'digestorio',title:'Investigue os órgãos',goal:'Agora é com você. Aponte em pelo menos três órgãos e ouça o que cada um faz com o alimento.',check:'digestorio',audio:'dig-aula-explorar'},
 {view:'jornada',title:'Acompanhe o pão',goal:'Acompanhe um pedaço de pão da boca até o fim do caminho. Em cada parada, repare no que muda: o que é quebrado, quem ajuda e o que o corpo aproveita.',check:'jornada',audio:'dig-aula-jornada'},
 {view:'digDesafio',title:'Mostre o que entendeu',goal:'Hora de mostrar o que você entendeu. Responda às situações e, no final, confira o seu resumo.',check:'digDesafio',audio:'dig-aula-desafio'}
];
D.digQuestions=[
 {id:'digAmido',skill:'digestao',q:'Você mastiga um pedaço de pão por um bom tempo e ele vai ficando adocicado. O que está acontecendo?',options:['O açúcar do pão está derretendo na boca','A amilase da saliva está quebrando o amido em açúcares','O estômago já começou a trabalhar','Os dentes liberam açúcar ao triturar'],correct:1,why:'A amilase da saliva quebra o amido em açúcares menores. A digestão química começa na boca, antes de o alimento descer.'},
 {id:'digBile',skill:'digestao',q:'A vesícula biliar guarda a bile, que o fígado produz. Para que serve a bile?',options:['Digerir as proteínas no estômago','Absorver água no intestino grosso','Quebrar as gorduras em gotículas menores no intestino','Produzir o ácido do estômago'],correct:2,why:'A bile emulsiona as gorduras: transforma as gotas grandes em gotículas, aumentando a superfície para a lipase do pâncreas agir.'},
 {id:'digVilosidades',skill:'digestao',q:'O intestino delgado tem uns seis metros e a parede cheia de dobras e vilosidades. Qual é a vantagem disso?',options:['Aumentar a superfície para absorver nutrientes','Guardar mais alimento por mais tempo','Fazer o alimento passar mais rápido','Produzir mais ácido'],correct:0,why:'Dobras, vilosidades e microvilosidades multiplicam a área de contato: esticada, a superfície do intestino delgado chegaria ao tamanho de uma quadra.'}
];
D.digQuestions.forEach(q=>{q.pref='dig-';});
D.todasQuestoes=D.todasQuestoes.concat(D.digQuestions);
D.modulos.push({id:'dig',label:'Digestão',curto:'Digestão',pergunta:'Como a comida vira energia?'});
const sis=D.sistemas.find(x=>x.id==='digestorio');
if(sis){sis.modulo='dig';sis.exemplos='Boca, estômago, intestinos e glândulas';sis.atividades=['digContexto','digestorio','jornada','alimento'];sis.questoes=['absorcao','peristaltismo','digAmido','digBile','digVilosidades'];}
D.sequencias.alimento.titulo='CAMINHO DO ALIMENTO';
})(window.CORPO_DATA);
