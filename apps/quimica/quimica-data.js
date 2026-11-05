/* Química VR · dados (v1.0)
   Temas: Tabela periódica (Contexto, Explorar, Viagem ao átomo, Metal ou ametal?, Desafio)
          Teste de chama (Contexto, Bancada, Passo a passo, Desafio).
   Os ids internos dos temas (animal/vegetal, módulos ani/veg) vêm da casca da Célula 3D VR e não aparecem para o aluno.
   Textos no tom falado das narrações (chaves = nomes dos MP3 em audio/; o tema da chama usa o prefixo chama-).
   Dados numéricos dos elementos: Periodic-Table-JSON (Bowserinator), derivado da Wikipedia (CC BY-SA). Nomes em português: IUPAC/SBQ. */
(function(){'use strict';
const D={version:'1.1.0'};
D.temas=[
 {id:'animal',nome:'Tabela periódica',estuda:'Os 118 elementos e o átomo por dentro.',exemplos:'Famílias, períodos, monte o seu átomo e uma viagem dentro do átomo de sódio',modulo:'ani',atividades:['contexto','explorar','montar','viagem','comparar'],questoes:['numeroAtomico','familia','periodo','gasNobre','metal','sodio']},
 {id:'vegetal',nome:'Teste de chama',estuda:'Cada elemento acende uma cor.',exemplos:'Bancada de laboratório com sete sais, o salto do elétron e os fogos de artifício',modulo:'veg',atividades:['vegContexto','vegetalExp','fabrica'],questoes:['porqueCor','cobre','limpar','fogos','sodioAmarelo','identidade']}
];
D.modulos=[{id:'ani',label:'Tabela periódica',curto:'Tabela',pergunta:'Do que tudo é feito?'},{id:'veg',label:'Teste de chama',curto:'Chama',pergunta:'Por que cada elemento tem uma cor?'}];
D.PREF={ani:'',veg:'chama-'};
D.activities=[
 {id:'contexto',label:'Contexto',title:'Do que tudo é feito?',subtitle:'Da gota de água ao átomo, e do átomo à tabela periódica.',kicker:'LOCALIZE',modulo:'ani'},
 {id:'explorar',label:'Explorar',title:'A tabela periódica em 3D.',subtitle:'Toque em qualquer elemento para ver a ficha, o átomo e ouvir a explicação.',kicker:'EXPLORE',modulo:'ani'},
 {id:'montar',label:'Monte o átomo',title:'Monte um átomo, partícula por partícula.',subtitle:'Coloque prótons, nêutrons e elétrons e veja o elemento mudar na hora.',kicker:'CONSTRUA',modulo:'ani'},
 {id:'viagem',label:'Viagem ao átomo',title:'Encolha e entre num átomo de sódio.',subtitle:'Uma viagem em primeira pessoa, da nuvem de elétrons até o núcleo, em seis trechos.',kicker:'VIAJE',modulo:'ani'},
 {id:'comparar',label:'Metal ou ametal?',title:'Metal, ametal ou gás nobre?',subtitle:'Encontre o elemento na tabela e classifique.',kicker:'CLASSIFIQUE',modulo:'ani'},
 {id:'desafio',label:'Desafio',title:'Agora, explique o que descobriu.',subtitle:'Situações para aplicar o que você viu.',kicker:'APLIQUE',modulo:'ani'},
 {id:'vegContexto',label:'Contexto',title:'De onde vêm as cores dos fogos?',subtitle:'Dos fogos de artifício ao elétron que salta.',kicker:'LOCALIZE',modulo:'veg'},
 {id:'vegetalExp',label:'Bancada',title:'O teste de chama, sem risco.',subtitle:'Toque em um sal para levá-lo à chama e ver a cor que ele produz.',kicker:'EXPERIMENTE',modulo:'veg'},
 {id:'fabrica',label:'Passo a passo',title:'Monte o procedimento do teste.',subtitle:'Coloque as etapas na ordem certa, como num laboratório de verdade.',kicker:'ORGANIZE',modulo:'veg'}
];
/* ---------- os 118 elementos ----------
   [Z, símbolo, massa, coluna, linha na grade, família, estado a 25 °C, camadas, configuração, eletronegatividade] */
const EL=[[1,"H","1.008",1,1,"h","g","1","1s1",2.2],[2,"He","4.003",18,1,"gn","g","2","1s2",0],[3,"Li","6.94",1,2,"alc","s","2.1","[He] 2s1",0.98],[4,"Be","9.012",2,2,"ter","s","2.2","[He] 2s2",1.57],[5,"B","10.81",13,2,"sm","s","2.3","[He] 2s2 2p1",2.04],[6,"C","12.01",14,2,"am","s","2.4","[He] 2s2 2p2",2.55],[7,"N","14.01",15,2,"am","g","2.5","[He] 2s2 2p3",3.04],[8,"O","16",16,2,"am","g","2.6","[He] 2s2 2p4",3.44],[9,"F","19",17,2,"hal","g","2.7","[He] 2s2 2p5",3.98],[10,"Ne","20.18",18,2,"gn","g","2.8","[He] 2s2 2p6",0],[11,"Na","22.99",1,3,"alc","s","2.8.1","[Ne] 3s1",0.93],[12,"Mg","24.3",2,3,"ter","s","2.8.2","[Ne] 3s2",1.31],[13,"Al","26.98",13,3,"om","s","2.8.3","[Ne] 3s2 3p1",1.61],[14,"Si","28.09",14,3,"sm","s","2.8.4","[Ne] 3s2 3p2",1.9],[15,"P","30.97",15,3,"am","s","2.8.5","[Ne] 3s2 3p3",2.19],[16,"S","32.06",16,3,"am","s","2.8.6","[Ne] 3s2 3p4",2.58],[17,"Cl","35.45",17,3,"hal","g","2.8.7","[Ne] 3s2 3p5",3.16],[18,"Ar","39.95",18,3,"gn","g","2.8.8","[Ne] 3s2 3p6",0],[19,"K","39.1",1,4,"alc","s","2.8.8.1","[Ar] 4s1",0.82],[20,"Ca","40.08",2,4,"ter","s","2.8.8.2","[Ar] 4s2",1],[21,"Sc","44.96",3,4,"tr","s","2.8.9.2","[Ar] 3d1 4s2",1.36],[22,"Ti","47.87",4,4,"tr","s","2.8.10.2","[Ar] 3d2 4s2",1.54],[23,"V","50.94",5,4,"tr","s","2.8.11.2","[Ar] 3d3 4s2",1.63],[24,"Cr","52",6,4,"tr","s","2.8.13.1","[Ar] 3d5 4s1",1.66],[25,"Mn","54.94",7,4,"tr","s","2.8.13.2","[Ar] 3d5 4s2",1.55],[26,"Fe","55.85",8,4,"tr","s","2.8.14.2","[Ar] 3d6 4s2",1.83],[27,"Co","58.93",9,4,"tr","s","2.8.15.2","[Ar] 3d7 4s2",1.88],[28,"Ni","58.69",10,4,"tr","s","2.8.16.2","[Ar] 3d8 4s2",1.91],[29,"Cu","63.55",11,4,"tr","s","2.8.18.1","[Ar] 3d10 4s1",1.9],[30,"Zn","65.38",12,4,"tr","s","2.8.18.2","[Ar] 3d10 4s2",1.65],[31,"Ga","69.72",13,4,"om","s","2.8.18.3","[Ar] 3d10 4s2 4p1",1.81],[32,"Ge","72.63",14,4,"sm","s","2.8.18.4","[Ar] 3d10 4s2 4p2",2.01],[33,"As","74.92",15,4,"sm","s","2.8.18.5","[Ar] 3d10 4s2 4p3",2.18],[34,"Se","78.97",16,4,"am","s","2.8.18.6","[Ar] 3d10 4s2 4p4",2.55],[35,"Br","79.9",17,4,"hal","l","2.8.18.7","[Ar] 3d10 4s2 4p5",2.96],[36,"Kr","83.8",18,4,"gn","g","2.8.18.8","[Ar] 3d10 4s2 4p6",3],[37,"Rb","85.47",1,5,"alc","s","2.8.18.8.1","[Kr] 5s1",0.82],[38,"Sr","87.62",2,5,"ter","s","2.8.18.8.2","[Kr] 5s2",0.95],[39,"Y","88.91",3,5,"tr","s","2.8.18.9.2","[Kr] 4d1 5s2",1.22],[40,"Zr","91.22",4,5,"tr","s","2.8.18.10.2","[Kr] 4d2 5s2",1.33],[41,"Nb","92.91",5,5,"tr","s","2.8.18.12.1","[Kr] 4d4 5s1",1.6],[42,"Mo","95.95",6,5,"tr","s","2.8.18.13.1","[Kr] 4d5 5s1",2.16],[43,"Tc","[98]",7,5,"tr","s","2.8.18.13.2","[Kr] 4d5 5s2",1.9],[44,"Ru","101.07",8,5,"tr","s","2.8.18.15.1","[Kr] 4d7 5s1",2.2],[45,"Rh","102.91",9,5,"tr","s","2.8.18.16.1","[Kr] 4d8 5s1",2.28],[46,"Pd","106.42",10,5,"tr","s","2.8.18.18","[Kr] 4d10",2.2],[47,"Ag","107.87",11,5,"tr","s","2.8.18.18.1","[Kr] 4d10 5s1",1.93],[48,"Cd","112.41",12,5,"tr","s","2.8.18.18.2","[Kr] 4d10 5s2",1.69],[49,"In","114.82",13,5,"om","s","2.8.18.18.3","[Kr] 4d10 5s2 5p1",1.78],[50,"Sn","118.71",14,5,"om","s","2.8.18.18.4","[Kr] 4d10 5s2 5p2",1.96],[51,"Sb","121.76",15,5,"sm","s","2.8.18.18.5","[Kr] 4d10 5s2 5p3",2.05],[52,"Te","127.6",16,5,"sm","s","2.8.18.18.6","[Kr] 4d10 5s2 5p4",2.1],[53,"I","126.9",17,5,"hal","s","2.8.18.18.7","[Kr] 4d10 5s2 5p5",2.66],[54,"Xe","131.29",18,5,"gn","g","2.8.18.18.8","[Kr] 4d10 5s2 5p6",2.6],[55,"Cs","132.91",1,6,"alc","s","2.8.18.18.8.1","[Xe] 6s1",0.79],[56,"Ba","137.33",2,6,"ter","s","2.8.18.18.8.2","[Xe] 6s2",0.89],[57,"La","138.91",3,9,"lan","s","2.8.18.18.9.2","[Xe] 5d1 6s2",1.1],[58,"Ce","140.12",4,9,"lan","s","2.8.18.19.9.2","[Xe] 4f1 5d1 6s2",1.12],[59,"Pr","140.91",5,9,"lan","s","2.8.18.21.8.2","[Xe] 4f3 6s2",1.13],[60,"Nd","144.24",6,9,"lan","s","2.8.18.22.8.2","[Xe] 4f4 6s2",1.14],[61,"Pm","[145]",7,9,"lan","s","2.8.18.23.8.2","[Xe] 4f5 6s2",1.13],[62,"Sm","150.36",8,9,"lan","s","2.8.18.24.8.2","[Xe] 4f6 6s2",1.17],[63,"Eu","151.96",9,9,"lan","s","2.8.18.25.8.2","[Xe] 4f7 6s2",1.2],[64,"Gd","157.25",10,9,"lan","s","2.8.18.25.9.2","[Xe] 4f7 5d1 6s2",1.2],[65,"Tb","158.93",11,9,"lan","s","2.8.18.27.8.2","[Xe] 4f9 6s2",1.1],[66,"Dy","162.5",12,9,"lan","s","2.8.18.28.8.2","[Xe] 4f10 6s2",1.22],[67,"Ho","164.93",13,9,"lan","s","2.8.18.29.8.2","[Xe] 4f11 6s2",1.23],[68,"Er","167.26",14,9,"lan","s","2.8.18.30.8.2","[Xe] 4f12 6s2",1.24],[69,"Tm","168.93",15,9,"lan","s","2.8.18.31.8.2","[Xe] 4f13 6s2",1.25],[70,"Yb","173.05",16,9,"lan","s","2.8.18.32.8.2","[Xe] 4f14 6s2",1.1],[71,"Lu","174.97",17,9,"lan","s","2.8.18.32.9.2","[Xe] 4f14 5d1 6s2",1.27],[72,"Hf","178.49",4,6,"tr","s","2.8.18.32.10.2","[Xe] 4f14 5d2 6s2",1.3],[73,"Ta","180.95",5,6,"tr","s","2.8.18.32.11.2","[Xe] 4f14 5d3 6s2",1.5],[74,"W","183.84",6,6,"tr","s","2.8.18.32.12.2","[Xe] 4f14 5d4 6s2",2.36],[75,"Re","186.21",7,6,"tr","s","2.8.18.32.13.2","[Xe] 4f14 5d5 6s2",1.9],[76,"Os","190.23",8,6,"tr","s","2.8.18.32.14.2","[Xe] 4f14 5d6 6s2",2.2],[77,"Ir","192.22",9,6,"tr","s","2.8.18.32.15.2","[Xe] 4f14 5d7 6s2",2.2],[78,"Pt","195.08",10,6,"tr","s","2.8.18.32.17.1","[Xe] 4f14 5d9 6s1",2.28],[79,"Au","196.97",11,6,"tr","s","2.8.18.32.18.1","[Xe] 4f14 5d10 6s1",2.54],[80,"Hg","200.59",12,6,"tr","l","2.8.18.32.18.2","[Xe] 4f14 5d10 6s2",2],[81,"Tl","204.38",13,6,"om","s","2.8.18.32.18.3","[Xe] 4f14 5d10 6s2 6p1",1.62],[82,"Pb","207.21",14,6,"om","s","2.8.18.32.18.4","[Xe] 4f14 5d10 6s2 6p2",1.87],[83,"Bi","208.98",15,6,"om","s","2.8.18.32.18.5","[Xe] 4f14 5d10 6s2 6p3",2.02],[84,"Po","[209]",16,6,"om","s","2.8.18.32.18.6","[Xe] 4f14 5d10 6s2 6p4",2],[85,"At","[210]",17,6,"hal","s","2.8.18.32.18.7","[Xe] 4f14 5d10 6s2 6p5",2.2],[86,"Rn","[222]",18,6,"gn","g","2.8.18.32.18.8","[Xe] 4f14 5d10 6s2 6p6",2.2],[87,"Fr","[223]",1,7,"alc","s","2.8.18.32.18.8.1","[Rn] 7s1",0.79],[88,"Ra","[226]",2,7,"ter","s","2.8.18.32.18.8.2","[Rn] 7s2",0.9],[89,"Ac","[227]",3,10,"act","s","2.8.18.32.18.9.2","[Rn] 6d1 7s2",1.1],[90,"Th","232.04",4,10,"act","s","2.8.18.32.18.10.2","[Rn] 6d2 7s2",1.3],[91,"Pa","231.04",5,10,"act","s","2.8.18.32.20.9.2","[Rn] 5f2 6d1 7s2",1.5],[92,"U","238.03",6,10,"act","s","2.8.18.32.21.9.2","[Rn] 5f3 6d1 7s2",1.38],[93,"Np","[237]",7,10,"act","s","2.8.18.32.22.9.2","[Rn] 5f4 6d1 7s2",1.36],[94,"Pu","[244]",8,10,"act","s","2.8.18.32.24.8.2","[Rn] 5f6 7s2",1.28],[95,"Am","[243]",9,10,"act","s","2.8.18.32.25.8.2","[Rn] 5f7 7s2",1.13],[96,"Cm","[247]",10,10,"act","s","2.8.18.32.25.9.2","[Rn] 5f7 6d1 7s2",1.28],[97,"Bk","[247]",11,10,"act","s","2.8.18.32.27.8.2","[Rn] 5f9 7s2",1.3],[98,"Cf","[251]",12,10,"act","s","2.8.18.32.28.8.2","[Rn] 5f10 7s2",1.3],[99,"Es","[252]",13,10,"act","s","2.8.18.32.29.8.2","[Rn] 5f11 7s2",1.3],[100,"Fm","[257]",14,10,"act","?","2.8.18.32.30.8.2","[Rn] 5f12 7s2",1.3],[101,"Md","[258]",15,10,"act","?","2.8.18.32.31.8.2","[Rn] 5f13 7s2",1.3],[102,"No","[259]",16,10,"act","?","2.8.18.32.32.8.2","[Rn] 5f14 7s2",1.3],[103,"Lr","[266]",17,10,"act","?","2.8.18.32.32.8.3","[Rn] 5f14 7s2 7p1",1.3],[104,"Rf","[267]",4,7,"tr","?","2.8.18.32.32.10.2","[Rn] 5f14 6d2 7s2",0],[105,"Db","[268]",5,7,"tr","?","2.8.18.32.32.11.2","[Rn] 5f14 6d3 7s2",0],[106,"Sg","[269]",6,7,"tr","?","2.8.18.32.32.12.2","[Rn] 5f14 6d4 7s2",0],[107,"Bh","[270]",7,7,"tr","?","2.8.18.32.32.13.2","[Rn] 5f14 6d5 7s2",0],[108,"Hs","[269]",8,7,"tr","?","2.8.18.32.32.14.2","[Rn] 5f14 6d6 7s2",0],[109,"Mt","[278]",9,7,"tr","?","2.8.18.32.32.15.2","[Rn] 5f14 6d7 7s2",0],[110,"Ds","[281]",10,7,"tr","?","2.8.18.32.32.16.2","[Rn] 5f14 6d9 7s1",0],[111,"Rg","[282]",11,7,"tr","?","2.8.18.32.32.17.2","[Rn] 5f14 6d10 7s1",0],[112,"Cn","[285]",12,7,"tr","?","2.8.18.32.32.18.2","[Rn] 5f14 6d10 7s2",0],[113,"Nh","[286]",13,7,"tr","?","2.8.18.32.32.18.3","[Rn] 5f14 6d10 7s2 7p1",0],[114,"Fl","[289]",14,7,"om","?","2.8.18.32.32.18.4","[Rn] 5f14 6d10 7s2 7p2",0],[115,"Mc","[289]",15,7,"om","?","2.8.18.32.32.18.5","[Rn] 5f14 6d10 7s2 7p3",0],[116,"Lv","[293]",16,7,"om","?","2.8.18.32.32.18.6","[Rn] 5f14 6d10 7s2 7p4",0],[117,"Ts","[294]",17,7,"hal","?","2.8.18.32.32.18.7","[Rn] 5f14 6d10 7s2 7p5",0],[118,"Og","[294]",18,7,"gn","?","2.8.18.32.32.18.8","[Rn] 5f14 6d10 7s2 7p6",0]];
const NOMES='Hidrogênio,Hélio,Lítio,Berílio,Boro,Carbono,Nitrogênio,Oxigênio,Flúor,Neônio,Sódio,Magnésio,Alumínio,Silício,Fósforo,Enxofre,Cloro,Argônio,Potássio,Cálcio,Escândio,Titânio,Vanádio,Cromo,Manganês,Ferro,Cobalto,Níquel,Cobre,Zinco,Gálio,Germânio,Arsênio,Selênio,Bromo,Criptônio,Rubídio,Estrôncio,Ítrio,Zircônio,Nióbio,Molibdênio,Tecnécio,Rutênio,Ródio,Paládio,Prata,Cádmio,Índio,Estanho,Antimônio,Telúrio,Iodo,Xenônio,Césio,Bário,Lantânio,Cério,Praseodímio,Neodímio,Promécio,Samário,Európio,Gadolínio,Térbio,Disprósio,Hólmio,Érbio,Túlio,Itérbio,Lutécio,Háfnio,Tântalo,Tungstênio,Rênio,Ósmio,Irídio,Platina,Ouro,Mercúrio,Tálio,Chumbo,Bismuto,Polônio,Astato,Radônio,Frâncio,Rádio,Actínio,Tório,Protactínio,Urânio,Netúnio,Plutônio,Amerício,Cúrio,Berquélio,Califórnio,Einstênio,Férmio,Mendelévio,Nobélio,Laurêncio,Rutherfórdio,Dúbnio,Seabórgio,Bóhrio,Hássio,Meitnério,Darmstádio,Roentgênio,Copernício,Nihônio,Fleróvio,Moscóvio,Livermório,Tenesso,Oganessônio'.split(',');
D.FAMILIAS={
 h:{nome:'Hidrogênio',cor:'#f2f2f2',curta:'Hidrogênio',tipo:'ametal',texto:'O hidrogênio fica sozinho no alto da tabela: tem só um elétron e não se encaixa bem em nenhuma família.'},
 alc:{nome:'Metais alcalinos',cor:'#ff8a65',curta:'Alcalinos',tipo:'metal',texto:'Metais macios, que reagem muito com a água. Todos têm um elétron na última camada.'},
 ter:{nome:'Metais alcalino-terrosos',cor:'#ffc46b',curta:'Alcalino-terrosos',tipo:'metal',texto:'Metais que formam muitos minerais da crosta. Têm dois elétrons na última camada.'},
 tr:{nome:'Metais de transição',cor:'#f0a8c0',curta:'Transição',tipo:'metal',texto:'O bloco do meio da tabela: ferro, cobre, prata, ouro. Bons condutores, resistentes e muito usados.'},
 om:{nome:'Outros metais',cor:'#9fc6d8',curta:'Outros metais',tipo:'metal',texto:'Metais mais moles e de ponto de fusão mais baixo, como alumínio, estanho e chumbo.'},
 sm:{nome:'Semimetais',cor:'#b9d98a',curta:'Semimetais',tipo:'semimetal',texto:'Ficam na fronteira entre metais e ametais. O silício, base dos chips, é o mais famoso.'},
 am:{nome:'Ametais',cor:'#7fe0a8',curta:'Ametais',tipo:'ametal',texto:'Não conduzem bem eletricidade e formam a maior parte dos seres vivos: carbono, nitrogênio, oxigênio.'},
 hal:{nome:'Halogênios',cor:'#e6e36a',curta:'Halogênios',tipo:'ametal',texto:'Ametais muito reativos, com sete elétrons na última camada. Formam sais, como o sal de cozinha.'},
 gn:{nome:'Gases nobres',cor:'#8fd3ff',curta:'Gases nobres',tipo:'gasNobre',texto:'Têm a última camada completa e por isso quase não reagem com nada.'},
 lan:{nome:'Lantanídeos',cor:'#c9a8ff',curta:'Lantanídeos',tipo:'metal',texto:'Metais que ficam numa linha separada embaixo da tabela. Vários são usados em ímãs e telas.'},
 act:{nome:'Actinídeos',cor:'#e5a0e8',curta:'Actinídeos',tipo:'metal',texto:'Metais radioativos da última linha separada. Urânio e plutônio são os mais conhecidos.'}
};
const ESTADO={s:'sólido',l:'líquido',g:'gasoso','?':'desconhecido (só foram produzidos poucos átomos)'};
/* uso no cotidiano (os elementos mais presentes na escola) */
const USO={
 1:'É o elemento mais abundante do Universo: as estrelas, como o Sol, são feitas principalmente de hidrogênio. Na Terra, ele está em toda a água que bebemos.',
 2:'É o gás que faz os balões de festa flutuarem, porque é mais leve que o ar. Também é usado para resfriar ímãs de aparelhos de ressonância magnética.',
 3:'Está nas baterias do celular e do notebook, as baterias de íons de lítio.',
 6:'É a base da vida: todos os seres vivos são feitos de moléculas de carbono. O diamante e o grafite do lápis são feitos só de carbono.',
 7:'Forma cerca de 78% do ar que respiramos. As plantas usam nitrogênio para crescer, por isso ele está nos adubos.',
 8:'É o gás que respiramos: forma 21% do ar. Junto com o hidrogênio, forma a água.',
 9:'Está no creme dental, na forma de fluoreto, que deixa o esmalte dos dentes mais resistente.',
 10:'É o gás das placas luminosas vermelhas, os letreiros de neon.',
 11:'Junto com o cloro, forma o sal de cozinha. É ele que deixa amarela a chama do fogão quando cai água com sal.',
 12:'Fica no centro da clorofila, a molécula verde das plantas. Ligas de magnésio são leves e usadas em peças de carros e bicicletas.',
 13:'É o metal das latinhas de refrigerante e do papel-alumínio. Leve, não enferruja e é muito reciclado no Brasil.',
 14:'É a base dos chips de computador e dos painéis solares. Junto com o oxigênio, forma a areia e o vidro.',
 15:'Está nos ossos, nos dentes e no DNA. Também aparece na lixa da caixa de fósforos.',
 16:'O enxofre é amarelo e tem cheiro forte quando queima. É usado para fabricar borracha de pneu e ácido sulfúrico.',
 17:'É usado para tratar a água da torneira e das piscinas. Junto com o sódio, forma o sal de cozinha.',
 18:'É o gás mais comum entre os gases nobres no ar. Fica dentro de lâmpadas e protege soldas do oxigênio.',
 19:'É importante para os músculos e o coração. A banana é uma boa fonte de potássio.',
 20:'Forma os ossos e os dentes. Também está no calcário, no giz e no leite.',
 22:'O titânio é leve e muito resistente. É usado em próteses, implantes dentários e aviões.',
 24:'Dá o brilho das peças cromadas e torna o aço inoxidável resistente à ferrugem.',
 26:'É o metal mais usado pela humanidade: está no aço de prédios, carros e panelas. No corpo, o ferro do sangue leva o oxigênio.',
 27:'Dá a cor azul a vidros e cerâmicas. Também está na vitamina B12.',
 28:'Está nas moedas e no aço inoxidável. Também é usado em baterias recarregáveis.',
 29:'É o metal dos fios elétricos, porque conduz muito bem a eletricidade. Com zinco, forma o latão; com estanho, o bronze.',
 30:'Protege o aço contra a ferrugem na galvanização. Também é importante para o sistema imunológico.',
 31:'Derrete na palma da mão, a cerca de 30 °C. Está nos LEDs e em chips.',
 35:'Um dos dois únicos elementos líquidos na temperatura ambiente, junto com o mercúrio.',
 36:'Gás nobre usado em algumas lâmpadas e flashes de fotografia.',
 38:'Dá a cor vermelha aos fogos de artifício e aos sinalizadores.',
 47:'É o melhor condutor de eletricidade de todos os metais. Usado em joias, talheres e contatos elétricos.',
 50:'Cobre as latas de alimentos (folha de flandres) e forma a solda usada em eletrônica.',
 53:'É adicionado ao sal de cozinha no Brasil para prevenir problemas na tireoide.',
 54:'Gás nobre usado em faróis de carro de luz bem branca.',
 55:'É o elemento dos relógios atômicos, os mais precisos do mundo.',
 56:'Dá a cor verde aos fogos de artifício. O sulfato de bário é usado como contraste em exames de raio X.',
 60:'Forma os ímãs mais fortes que existem, usados em fones de ouvido, motores elétricos e discos rígidos.',
 74:'Tem o ponto de fusão mais alto entre os metais. Era o filamento das lâmpadas incandescentes.',
 78:'Metal nobre usado em joias e nos catalisadores dos carros, que diminuem a poluição.',
 79:'Não enferruja nem perde o brilho. Usado em joias e em contatos de circuitos eletrônicos.',
 80:'O único metal líquido na temperatura ambiente. É tóxico: já foi muito usado em termômetros.',
 82:'Metal pesado e tóxico. Usado em baterias de carro e para proteger contra raio X.',
 86:'Gás nobre radioativo que pode se acumular em porões de algumas regiões.',
 88:'Descoberto por Marie e Pierre Curie. É radioativo e brilha no escuro.',
 92:'É o combustível das usinas nucleares, como Angra 1 e 2, no Rio de Janeiro.',
 94:'Radioativo, produzido em reatores nucleares. É usado como fonte de energia em sondas espaciais.',
 95:'Uma pequeníssima quantidade de amerício fica dentro de alguns detectores de fumaça.'
};
D.EL={};D.info={};
EL.forEach(r=>{const [z,s,massa,col,lin,fam,est,cam,cfg,en]=r;const nome=NOMES[z-1];const camadas=cam.split('.').map(Number);const periodo=camadas.length;
 const e={z,s,nome,massa:String(massa).replace('.',','),col,lin,fam,est,camadas,periodo,cfg,en};D.EL[z]=e;const F=D.FAMILIAS[fam];
 const ult=camadas[camadas.length-1];
 const sint=z>=95?' Não existe na natureza: é produzido em laboratório, poucos átomos de cada vez.':(z===43||z===61||z>=84)?' É radioativo.':'';
 D.info['el-'+z]={name:nome+' ('+s+')',kind:F.nome+' · número atômico '+z,color:F.cor,elemento:z,
  text:nome+', símbolo '+s+', número atômico '+z+': tem '+z+(z===1?' próton':' prótons')+' no núcleo e '+z+(z===1?' elétron':' elétrons')+' em volta. '+(USO[z]||F.texto)+sint,
  detail:'Massa atômica: '+String(massa).replace('.',',')+' u. Camadas de elétrons: '+camadas.join(', ')+' ('+periodo+(periodo===1?' camada':' camadas')+', por isso fica no '+periodo+'º período). Última camada com '+ult+(ult===1?' elétron':' elétrons')+'. Estado a 25 °C: '+ESTADO[est]+'.',
  medio:'Configuração eletrônica: '+(cfg||'não determinada')+'.'+(en?' Eletronegatividade de Pauling: '+String(en).replace('.',',')+'.':'')+' Família: '+F.nome+'.'};
});
/* ---------- contexto: três etapas ---------- */
D.context=[
 {name:'Uma gota de água',target:'destaque',text:'Tudo o que existe, a água, o ar, o seu corpo e este celular, é feito de partículas pequenas demais para ver: os átomos. Uma única gota de água tem mais átomos do que estrelas existem em toda a nossa galáxia. Vamos ampliar a gota até chegar numa molécula de água.'},
 {name:'Um átomo de perto',target:'aberta',text:'Esta é a molécula de água: um átomo de oxigênio, o vermelho, ligado a dois átomos de hidrogênio. Agora vamos olhar só o oxigênio. No centro fica o núcleo, com prótons e nêutrons. Em volta, os elétrons giram em camadas.'},
 {name:'Os 118 elementos',text:'O que define um elemento é o número de prótons no núcleo, o número atômico. O oxigênio tem oito, o ferro tem vinte e seis, o ouro tem setenta e nove. Os 118 elementos conhecidos estão organizados nesta tabela: cada linha é um período e cada coluna é uma família, com propriedades parecidas.'}
];
D.vegContext=[
 {name:'Fogos de artifício',target:'celulas',text:'Você já reparou que os fogos de artifício têm cores bem diferentes? O vermelho, o verde, o amarelo e o azul não vêm de tinta. Vêm de elementos químicos misturados na pólvora. Cada elemento, quando esquenta, solta luz de uma cor própria.'},
 {name:'O elétron que salta',target:'cloroplasto',text:'Veja o que acontece dentro do átomo. O calor da chama dá energia a um elétron, e ele salta para uma camada mais longe do núcleo. Mas ele não fica lá: logo volta para a camada de origem e devolve a energia em forma de luz. A cor dessa luz depende do elemento.'},
 {name:'Cada elemento, uma cor',text:'Por isso o teste de chama funciona como uma impressão digital: sódio dá amarelo, cobre dá verde-azulado, estrôncio dá vermelho. Os químicos usam esse teste para descobrir que metal existe numa amostra. Agora é a sua vez de testar na bancada.'}
];
/* ---------- bancada: sais, equipamentos e passos ---------- */
const SAIS=[
 ['li','Cloreto de lítio','LiCl',3,'#ff2d55','vermelho-carmim','Os fogos vermelho-rosados e alguns sinalizadores usam sais de lítio.','A luz mais forte do lítio fica perto de 671 nanômetros, no vermelho.'],
 ['na','Cloreto de sódio','NaCl',11,'#ffb300','amarelo-alaranjado','É o sal de cozinha. O amarelo do sódio é tão forte que esconde as outras cores: por isso a alça precisa estar bem limpa.','O sódio emite o famoso dubleto de 589 nanômetros, a mesma luz amarela dos antigos postes de rua.'],
 ['k','Cloreto de potássio','KCl',19,'#b27cff','lilás','O lilás do potássio é fraco. Nos laboratórios, olha-se através de um vidro azul, que bloqueia o amarelo de restos de sódio.','As linhas mais fortes do potássio ficam em torno de 766 e 404 nanômetros: vermelho fundo e violeta, que juntos parecem lilás.'],
 ['ca','Cloreto de cálcio','CaCl₂',20,'#ff6a2b','vermelho-alaranjado','O cálcio dá um laranja parecido com cor de tijolo.','A cor vem principalmente de bandas de moléculas de cálcio formadas na chama, com destaque perto de 620 nanômetros.'],
 ['sr','Cloreto de estrôncio','SrCl₂',38,'#ff1f1f','vermelho intenso','É o vermelho dos fogos de artifício e dos sinalizadores de emergência.','O vermelho do estrôncio vem de bandas entre 600 e 690 nanômetros.'],
 ['ba','Cloreto de bário','BaCl₂',56,'#8fe04a','verde-claro','É o verde dos fogos de artifício. Sais de bário são tóxicos: no laboratório real, exigem cuidado.','O verde do bário fica perto de 524 e 554 nanômetros.'],
 ['cu','Cloreto de cobre(II)','CuCl₂',29,'#1fe0b0','verde-azulado','O cobre dá um verde-azulado bonito e é o mais fácil de reconhecer. Os fogos azuis também usam cobre.','No cloreto de cobre, a cor azulada vem de moléculas de cloreto de cobre formadas na chama.']
];
D.SAIS=SAIS.map(([id,nome,formula,z,cor,corNome,uso,medio])=>({id,nome,formula,z,cor,corNome}));
SAIS.forEach(([id,nome,formula,z,cor,corNome,uso,medio])=>{D.info['sal-'+id]={name:nome+' ('+formula+')',kind:'Chama em tom '+corNome+' · '+D.EL[z].nome,color:cor,sal:id,
 text:'Na chama, o '+nome.charAt(0).toLowerCase()+nome.slice(1)+' produz um tom '+corNome+'. Quem produz a cor é o '+D.EL[z].nome.toLowerCase()+': o calor faz os elétrons dele saltarem e, ao voltar, eles soltam luz dessa cor. '+uso,
 detail:'O cloro do sal quase não interfere na cor: quem colore a chama é o metal. Cada metal tem o seu conjunto de cores, como uma impressão digital.',
 medio};});
Object.assign(D.info,{
 bico:{name:'Bico de Bunsen',kind:'Equipamento · fonte de calor',color:'#5aa0ff',text:'O bico de Bunsen queima gás com ar e produz uma chama azul, quase invisível e muito quente. Ela é ideal para o teste porque não tem cor própria que atrapalhe.',detail:'A parte mais quente da chama fica logo acima do cone azul interno, perto de 1.500 °C.',medio:'A chama azul é de combustão completa: a janela de ar aberta fornece oxigênio suficiente e evita a fuligem amarela.'},
 alca:{name:'Alça de níquel-cromo',kind:'Equipamento · leva a amostra',color:'#c8ccd4',text:'A alça é um fio de metal com uma voltinha na ponta. Ela pega um pouquinho do sal e leva até a chama. É feita de um metal que não colore a chama.',detail:'Nos laboratórios antigos usava-se fio de platina, que é caro. Hoje é comum o fio de níquel-cromo.',medio:'O metal da alça precisa ter linhas de emissão fracas na faixa visível para não confundir o resultado.'},
 acido:{name:'Ácido clorídrico diluído',kind:'Limpeza da alça',color:'#d8f0ff',text:'Antes de cada teste, a alça é mergulhada no ácido e levada à chama até não dar mais cor. Assim, nenhum resto do sal anterior mistura as cores.',detail:'No laboratório real, o ácido exige óculos de proteção e luvas. Aqui no VR, você pratica sem risco.',medio:'Os cloretos formados na limpeza são voláteis e evaporam rápido na chama, deixando a alça limpa.'},
 passo_limpar:{name:'Limpar a alça',kind:'Etapa 1',color:'#d8f0ff',text:'Mergulhe a alça no ácido diluído e leve à chama até ela não colorir mais nada.'},
 passo_sal:{name:'Pegar o sal',kind:'Etapa 2',color:'#f2f2f2',text:'Encoste a alça limpa e úmida no sal: um pouquinho basta.'},
 passo_chama:{name:'Levar à chama',kind:'Etapa 3',color:'#5aa0ff',text:'Leve a ponta da alça à parte mais quente da chama azul.'},
 passo_observar:{name:'Observar a cor',kind:'Etapa 4',color:'#ffb300',text:'Olhe a cor da chama logo que o sal começa a queimar.'},
 passo_comparar:{name:'Comparar com a tabela',kind:'Etapa 5',color:'#8fe04a',text:'Compare a cor observada com a tabela de cores para descobrir o metal.'},
 passo_registrar:{name:'Registrar e limpar',kind:'Etapa 6',color:'#b27cff',text:'Anote o resultado e limpe a alça de novo antes do próximo sal.'}
});
/* listas do Explorar e da Bancada */
const G=(...zs)=>zs.map(z=>'el-'+z);
D.CATALOGO={
 explorar:[['Hidrogênio e metais alcalinos',G(1,3,11,19)],['Alcalino-terrosos',G(12,20)],['Metais de transição',G(26,29,47,79,80)],['Outros metais e semimetais',G(13,50,82,14)],['Ametais e halogênios',G(6,7,8,15,9,17,53)],['Gases nobres',G(2,10,18)],['Linhas de baixo',G(60,92)]],
 vegetalExp:[['Sais para testar na chama',SAIS.map(s=>'sal-'+s[0])],['Equipamentos da bancada',['bico','alca','acido']]]
};
D.LEGENDA=['alc','ter','tr','om','sm','am','hal','gn','lan','act'].map(f=>[D.FAMILIAS[f].cor,D.FAMILIAS[f].curta]);
D.LEGENDA_VEG=SAIS.map(s=>[s[4],s[2]]);
/* sequência: o procedimento do teste de chama */
D.sequencias={fabrica:{titulo:'PROCEDIMENTO DO TESTE DE CHAMA',cor:'#ffb300',ordem:['passo_limpar','passo_sal','passo_chama','passo_observar','passo_comparar','passo_registrar'],
 rotulos:{passo_limpar:'Limpar a alça no ácido',passo_sal:'Pegar um pouco de sal',passo_chama:'Levar à chama azul',passo_observar:'Observar a cor',passo_comparar:'Comparar com a tabela',passo_registrar:'Registrar e limpar'},
 pistas:['Antes de tudo, a alça precisa estar sem restos do teste anterior.','Só dá para ver uma cor depois que o sal chega à chama.','Para descobrir qual é o metal, você precisa de uma referência de cores.','O último passo prepara a alça para o próximo teste.']}};
D.FABRICA_FIM={text:'Procedimento completo. Limpar a alça, pegar o sal, levar à chama, observar a cor, comparar com a tabela e registrar. Limpar entre um teste e outro é o que garante que a cor é mesmo do sal que você está testando.',audio:'fabrica-concluido'};
/* viagem ao átomo de sódio: seis trechos */
D.viagem=[
 {titulo:'Chegando ao átomo',onde:'Átomo de sódio (Na)',tam:'Diâmetro: cerca de 0,4 nanômetro',alvo:'el-11',dur:12,text:'Encolhemos até ficar menores que um átomo. À frente, um átomo de sódio. Repare: quase tudo aqui é espaço vazio. Se o átomo fosse do tamanho de um estádio de futebol, o núcleo seria uma bolinha de gude no meio do campo.',audio:'viagem-0'},
 {titulo:'A última camada',onde:'Camada M',tam:'1 elétron',alvo:'el-11',dur:12,text:'Esta é a camada mais de fora, a camada M. No sódio, ela tem um único elétron. É esse elétron solitário que o sódio perde fácil quando reage, e é ele que salta na chama e dá a cor amarela.',audio:'viagem-1'},
 {titulo:'A camada do meio',onde:'Camada L',tam:'8 elétrons',alvo:'el-11',dur:12,text:'Chegamos à camada L, com oito elétrons. Oito é um número especial: uma camada externa com oito elétrons deixa o átomo estável, como acontece com os gases nobres.',audio:'viagem-2'},
 {titulo:'Perto do núcleo',onde:'Camada K',tam:'2 elétrons',alvo:'el-11',dur:11,text:'Esta é a camada K, a mais próxima do núcleo. Ela cabe no máximo dois elétrons. Elétrons perto do núcleo ficam mais presos, porque a atração da carga positiva é mais forte.',audio:'viagem-3'},
 {titulo:'O núcleo',onde:'Núcleo do sódio',tam:'11 prótons e 12 nêutrons',alvo:'el-11',dur:13,text:'Estamos no núcleo. Os prótons, em vermelho, têm carga positiva. Os nêutrons, em cinza, não têm carga. São os onze prótons que fazem deste átomo um sódio: se tivesse doze, seria magnésio.',audio:'viagem-4'},
 {titulo:'O salto do elétron',onde:'Camada M',tam:'Luz de 589 nanômetros',alvo:'el-11',dur:14,text:'Agora veja o elétron de fora receber energia. Ele salta para uma órbita mais distante, mas logo volta e solta um pacotinho de luz amarela. É exatamente isso que acontece milhões de vezes por segundo quando o sal cai na chama do fogão.',audio:'viagem-5'}
];
D.VIAGEM_FIM={text:'Viagem completa. O átomo de sódio tem onze prótons no núcleo e onze elétrons em três camadas: dois, oito e um. O elétron solitário da última camada é o que reage e o que acende a chama de amarelo.',audio:'viagem-fim'};
/* monte o átomo: metas (p prótons, n nêutrons, e elétrons) */
D.MONTAR=[
 {p:1,n:0,e:1,titulo:'Hidrogênio',texto:'Monte um átomo de hidrogênio neutro: um próton no núcleo e um elétron em volta.',feito:'Isso! Um próton faz o hidrogênio, o elemento mais simples e mais abundante do Universo. Com um elétron, as cargas se equilibram e o átomo fica neutro.'},
 {p:2,n:2,e:2,titulo:'Hélio',texto:'Agora monte o hélio, o gás dos balões: dois prótons, dois nêutrons e dois elétrons.',feito:'Hélio montado. Repare que o elemento mudou quando você colocou o segundo próton: é o número de prótons que decide o elemento.'},
 {p:6,n:6,e:6,titulo:'Carbono-12',texto:'Monte o carbono-12, a base da vida: seis prótons, seis nêutrons e seis elétrons. Veja os elétrons se dividirem em duas camadas.',feito:'Carbono-12 pronto. Os seis elétrons ficam dois na camada K e quatro na camada L. O 12 do nome é a soma de prótons e nêutrons, o número de massa.'},
 {p:8,n:8,e:8,titulo:'Oxigênio',texto:'Monte o oxigênio, o mesmo átomo que você viu na molécula de água: oito prótons, oito nêutrons e oito elétrons.',feito:'Oxigênio montado: dois elétrons na camada K e seis na L. Faltam dois para completar a camada, por isso o oxigênio reage com tanta coisa.'},
 {p:11,n:12,e:10,titulo:'Íon sódio (Na⁺)',texto:'Agora um íon: monte o sódio com onze prótons e doze nêutrons, mas com só dez elétrons. É o sódio que está no sal de cozinha.',feito:'Íon sódio formado. Com onze cargas positivas e só dez negativas, sobra uma carga positiva: Na mais. O sódio perdeu justamente o elétron solitário da camada M.'},
 {p:18,n:22,e:18,titulo:'Desafio',texto:'Desafio: monte o gás nobre do terceiro período, neutro e com vinte e dois nêutrons. Procure na tabela quantos prótons ele tem.',feito:'É o argônio! Dezoito prótons, e os dezoito elétrons fecham as camadas com dois, oito e oito. Com a última camada completa, ele quase não reage.'}
];
D.MONTAR_FIM={text:'Você montou todas as metas. O número de prótons define o elemento, prótons mais nêutrons dão o número de massa, e a diferença entre prótons e elétrons define se o átomo é neutro ou um íon.',audio:'montar-concluido'};
/* metal, ametal ou gás nobre (as chaves internas animal/vegetal/ambas vêm da casca) */
D.COMPARAR=[
 {key:'el-26',q:'Ferro: metal, ametal ou gás nobre?',resp:'animal',why:'O ferro é um metal de transição: brilha, conduz eletricidade e calor e pode ser moldado. Está no aço de prédios e carros.'},
 {key:'el-8',q:'Oxigênio: metal, ametal ou gás nobre?',resp:'vegetal',why:'O oxigênio é um ametal. Ele reage com quase tudo, ao contrário dos gases nobres, e não conduz eletricidade.'},
 {key:'el-10',q:'Neônio: metal, ametal ou gás nobre?',resp:'ambas',why:'O neônio é um gás nobre, da última coluna da tabela. A camada externa completa faz ele quase não reagir.'},
 {key:'el-11',q:'Sódio: metal, ametal ou gás nobre?',resp:'animal',why:'O sódio é um metal alcalino, da primeira coluna. É tão macio que dá para cortar com faca e reage forte com a água.'},
 {key:'el-16',q:'Enxofre: metal, ametal ou gás nobre?',resp:'vegetal',why:'O enxofre é um ametal: amarelo, quebradiço e mau condutor de eletricidade.'},
 {key:'el-29',q:'Cobre: metal, ametal ou gás nobre?',resp:'animal',why:'O cobre é um metal de transição e um dos melhores condutores de eletricidade. Por isso está nos fios.'},
 {key:'el-18',q:'Argônio: metal, ametal ou gás nobre?',resp:'ambas',why:'O argônio é um gás nobre. Por não reagir, é usado dentro de lâmpadas e para proteger soldas.'},
 {key:'el-17',q:'Cloro: metal, ametal ou gás nobre?',resp:'vegetal',why:'O cloro é um ametal da família dos halogênios. Fica na penúltima coluna, ao lado dos gases nobres, mas reage muito.'}
];
D.COMPARAR_FIM={text:'Classificação completa. A maior parte da tabela é de metais, à esquerda e no meio. Os ametais ficam no canto direito, e os gases nobres ocupam a última coluna.',audio:'comparar-concluido'};
D.ROTULO_GRUPO={animal:'Metal',vegetal:'Ametal',ambas:'Gás nobre'};
/* desafio */
D.questions=[
 {id:'numeroAtomico',skill:'atomo',q:'O número atômico de um elemento indica o quê?',options:['A massa do átomo','O número de prótons no núcleo','O número de camadas','A cor do elemento na chama'],correct:1,why:'O número atômico é o número de prótons no núcleo, e é ele que define o elemento. Todo átomo com oito prótons é oxigênio.'},
 {id:'familia',skill:'tabela',q:'Lítio, sódio e potássio ficam na mesma coluna da tabela. O que eles têm em comum?',options:['Têm a mesma massa','São todos gases','Têm um elétron na última camada e reagem de forma parecida','Foram descobertos no mesmo ano'],correct:2,why:'Elementos da mesma família têm o mesmo número de elétrons na última camada. Por isso reagem de forma parecida: todos os alcalinos reagem forte com a água.'},
 {id:'periodo',skill:'tabela',q:'O sódio fica no 3º período, a terceira linha da tabela. O que isso indica?',options:['Que ele tem três camadas de elétrons','Que ele tem três prótons','Que ele foi o terceiro descoberto','Que ele tem três nêutrons'],correct:0,why:'O período indica o número de camadas de elétrons. O sódio tem três: K com 2, L com 8 e M com 1.'},
 {id:'gasNobre',skill:'tabela',q:'Por que o hélio e o neônio quase não reagem com outros elementos?',options:['Porque são muito pesados','Porque têm a última camada completa de elétrons','Porque não têm núcleo','Porque são metais'],correct:1,why:'Os gases nobres já têm a última camada completa. Eles não precisam ganhar, perder nem compartilhar elétrons, e por isso são estáveis.'},
 {id:'metal',skill:'classificacao',q:'Os fios elétricos de casa são de cobre. Que propriedade dos metais explica essa escolha?',options:['Metais são transparentes','Metais conduzem bem a eletricidade','Metais são gases','Metais não têm elétrons'],correct:1,why:'Os metais conduzem bem eletricidade e calor porque parte dos elétrons se move com facilidade entre os átomos. O cobre é um dos melhores condutores.'},
 {id:'sodio',skill:'atomo',q:'O sódio tem 11 elétrons distribuídos em 2, 8 e 1. Quantos elétrons ele tem na última camada?',options:['11','8','2','1'],correct:3,why:'A última camada, a M, tem só um elétron. É esse elétron que o sódio perde fácil ao reagir, como os outros metais alcalinos.'},
 {id:'porqueCor',skill:'chama',q:'Por que um sal colore a chama?',options:['Porque o sal tem tinta','Porque o calor faz os elétrons saltarem e, ao voltar, eles soltam luz de uma cor própria','Porque o fogo muda de cor sozinho','Porque o sal apaga a chama'],correct:1,why:'O calor dá energia aos elétrons, que saltam para camadas mais distantes. Ao voltar, eles devolvem a energia como luz, e a cor depende do elemento.'},
 {id:'cobre',skill:'chama',q:'Num teste, a chama ficou verde-azulada. Qual metal provavelmente está na amostra?',options:['Sódio','Cobre','Potássio','Cálcio'],correct:1,why:'O verde-azulado é a marca do cobre. O sódio dá amarelo, o potássio dá lilás e o cálcio dá vermelho-alaranjado.'},
 {id:'limpar',skill:'procedimento',q:'Por que é preciso limpar a alça no ácido entre um teste e outro?',options:['Para esquentar a alça','Para que restos do sal anterior não misturem as cores','Para mudar a cor da chama','Não é preciso limpar'],correct:1,why:'Qualquer resto do sal anterior continuaria colorindo a chama. O amarelo do sódio, por exemplo, é tão forte que esconde as outras cores.'},
 {id:'fogos',skill:'chama',q:'Uma empresa quer fogos de artifício vermelhos. Que elemento ela deve usar?',options:['Estrôncio','Cobre','Sódio','Bário'],correct:0,why:'O estrôncio dá o vermelho intenso dos fogos e dos sinalizadores. O bário dá verde, o cobre dá azul-esverdeado e o sódio, amarelo.'},
 {id:'sodioAmarelo',skill:'chama',q:'Caiu água com sal na chama do fogão e a chama ficou amarela. Que elemento causou isso?',options:['O cloro','O oxigênio','O sódio','O hidrogênio'],correct:2,why:'O sal de cozinha é cloreto de sódio, e o sódio dá uma luz amarela muito intensa na chama.'},
 {id:'identidade',skill:'procedimento',q:'Para que os químicos usam o teste de chama?',options:['Para medir a temperatura','Para identificar metais numa amostra pela cor da chama','Para fabricar sal','Para apagar incêndios'],correct:1,why:'Cada metal produz um conjunto próprio de cores, como uma impressão digital. Pela cor, dá para descobrir que metal existe na amostra.'}
];
D.todasQuestoes=D.questions;
D.questions.forEach(q=>{if(['porqueCor','cobre','limpar','fogos','sodioAmarelo','identidade'].includes(q.id))q.pref='chama-';});
/* aula guiada */
D.guide=[
 {view:'contexto',title:'Localize-se',goal:'Amplie uma gota de água até a molécula, olhe um átomo de perto e conheça a tabela.',check:'contexto',audio:'aula-contexto'},
 {view:'explorar',title:'Investigue a tabela',goal:'Toque em pelo menos três elementos da tabela e ouça o que cada um tem de especial.',check:'explorar',audio:'aula-explorar'},
 {view:'montar',title:'Monte o átomo',goal:'Cumpra as seis metas: monte átomos e íons colocando prótons, nêutrons e elétrons.',check:'montar',audio:'aula-montar'},
 {view:'viagem',title:'Entre no átomo',goal:'Faça a viagem completa pelo átomo de sódio, da camada de fora até o núcleo.',check:'viagem',audio:'aula-viagem'},
 {view:'comparar',title:'Classifique',goal:'Encontre oito elementos na tabela e diga se cada um é metal, ametal ou gás nobre.',check:'comparar',audio:'aula-comparar'},
 {view:'desafio',title:'Mostre o que entendeu',goal:'Hora de mostrar o que você entendeu. Responda às situações e, no final, confira o seu resumo.',check:'desafio',audio:'aula-desafio'},
 {view:'vegContexto',title:'Localize-se',goal:'Veja os fogos de artifício, o salto do elétron e as cores de cada elemento.',check:'vegContexto',audio:'chama-aula-contexto'},
 {view:'vegetalExp',title:'Faça o teste',goal:'Leve pelo menos três sais diferentes à chama e compare as cores.',check:'vegetalExp',audio:'chama-aula-explorar'},
 {view:'fabrica',title:'Monte o procedimento',goal:'Coloque em ordem as seis etapas do teste de chama.',check:'fabrica',audio:'chama-aula-fabrica'},
 {view:'vegDesafio',title:'Mostre o que entendeu',goal:'Hora de mostrar o que você entendeu. Responda às situações e, no final, confira o seu resumo.',check:'vegDesafio',audio:'chama-aula-desafio'}
];
D.WELCOME='Bem-vindo à Química VR! Aqui você vai explorar a tabela periódica em 3D, encolher até entrar num átomo de sódio e fazer o teste de chama numa bancada de laboratório, sem nenhum risco. Vamos começar?';
D.sources=[['OpenStax · Chemistry 2e, capítulos 2 e 6: átomos, tabela periódica e estrutura eletrônica (CC BY 4.0)','https://openstax.org/books/chemistry-2e/pages/2-introduction'],['IUPAC · Periodic Table of the Elements','https://iupac.org/what-we-do/periodic-table-of-elements/'],['Periodic-Table-JSON (Bowserinator), dados numéricos derivados da Wikipedia (CC BY-SA)','https://github.com/Bowserinator/Periodic-Table-JSON'],['BNCC · Ciências, 9º ano: EF09CI01 e EF09CI03','http://basenacionalcomum.mec.gov.br/abase/#fundamental/ciencias']];
window.QUIMICA_DATA=D;
})();
