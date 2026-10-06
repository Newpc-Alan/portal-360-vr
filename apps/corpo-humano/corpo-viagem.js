/* Corpo Humano Imersivo · Viagem do ar (v4.6) · missão em primeira pessoa: do nariz ao capilar
   O aluno viaja por dentro das vias aéreas (modelos Z-Anatomy vistos por dentro, em escala ~90x), entra no alvéolo e termina no
   capilar. No 3D a câmera percorre o caminho; no VR o mundo se move em volta do aluno (o caminho passa pela cabeça dele).
   Dados (trechos, textos, áudios viagem-*) e cenas no mesmo arquivo. */
(function(){'use strict';
const T=THREE,D=CORPO_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const G=()=>window.CORPO_GLTF,M=()=>window.CORPO_MODELS;
D.activities.push({id:'viagem',label:'Viagem do ar',title:'Entre pelo nariz e vá até a célula.',subtitle:'Uma viagem em primeira pessoa pelas vias aéreas, o alvéolo e o sangue.',kicker:'VIAJE',modulo:'resp'});
(function(){const sis=D.sistemas.find(x=>x.id==='respiratorio');if(sis&&!sis.atividades.includes('viagem')){const i=sis.atividades.indexOf('troca');sis.atividades.splice(i<0?sis.atividades.length:i+1,0,'viagem');}})();
D.guide.push({view:'viagem',title:'Viaje com o ar',goal:'Entre pelo nariz e acompanhe o ar até o alvéolo e o sangue. Em cada trecho, olhe em volta e repare no que muda.',check:'viagem',audio:'aula-viagem'});
/* trechos: pontos em metros (Z-Anatomy), duração em segundos, cena ('corpo' = vias aéreas por dentro; 'alveolo'; 'sangue') */
D.viagem=[
 {titulo:'Nariz',orgao:'nariz',cena:'corpo',dur:14,pts:[[0.005,1.573,0.108],[0.005,1.571,0.085],[0.005,1.569,0.065],[0,1.566,0.046],[0,1.58,0.042]],text:'Respire fundo. Estamos entrando pelo nariz. As conchas aquecem e umedecem o ar, e os pelos e o muco seguram a poeira. Olhe em volta: o teto é o osso do crânio.',audio:'viagem-0'},
 {titulo:'Faringe',orgao:'faringe',cena:'corpo',dur:12,pts:[[0,1.58,0.042],[0,1.57,0.03],[0,1.552,0.02],[0,1.53,0.022],[0,1.512,0.018]],text:'Descemos pela faringe, o corredor que o ar divide com o alimento. Quando você engole, a epiglote fecha a porta de baixo para o alimento não entrar na via do ar.',audio:'viagem-1'},
 {titulo:'Laringe',orgao:'laringe',cena:'corpo',dur:12,pts:[[0,1.512,0.018],[0,1.495,0.021],[0,1.48,0.018],[0,1.468,0.012]],text:'Chegamos à laringe, a caixa da voz. Duas pregas vibram quando o ar passa e você fala. A cartilagem da frente é o pomo de adão.',audio:'viagem-2'},
 {titulo:'Traqueia',orgao:'traqueia',cena:'corpo',dur:14,pts:[[0,1.468,0.012],[0,1.44,0.008],[0,1.41,0.0],[0,1.375,-0.0095]],text:'Agora a traqueia: um tubo de 12 centímetros com anéis de cartilagem, que o mantêm aberto. Os cílios da parede varrem o muco para cima, levando a sujeira de volta para a garganta.',audio:'viagem-3'},
 {titulo:'Brônquios',orgao:'bronquios',cena:'corpo',dur:16,pts:[[0,1.375,-0.0095],[0.011,1.355,-0.0146],[0.032,1.331,-0.0195],[0.062,1.307,-0.0204],[0.081,1.271,-0.0185],[0.087,1.223,-0.049]],text:'A traqueia se divide em dois brônquios, um para cada pulmão, e eles vão se ramificando em tubos cada vez mais finos, como os galhos de uma árvore: a árvore brônquica.',audio:'viagem-4'},
 {titulo:'Alvéolo',orgao:'alveolos',cena:'alveolo',dur:16,text:'No fim dos galhos, os alvéolos: bolsinhas de parede finíssima, 300 milhões delas, envolvidas por capilares. Aqui o oxigênio atravessa para o sangue, e o gás carbônico faz o caminho de volta.',audio:'viagem-5'},
 {titulo:'Sangue',orgao:'sangue',cena:'sangue',dur:16,text:'Entramos no sangue. As hemácias carregam o oxigênio, preso à hemoglobina. Num capilar bem fino, ele deixa o sangue e entra na célula. Chegamos: o ar que você puxou virou energia.',audio:'viagem-6'}
];
D.VIAGEM_FIM={text:'Viagem completa! Nariz, faringe, laringe, traqueia, brônquios, alvéolo e sangue. Agora você sabe o caminho que cada respiração faz dentro de você.',audio:'viagem-fim'};
const ESCALA_VR=6;       /* 1 m de anatomia = 45 m no VR (7,5 unidades × 6): a traqueia vira um túnel de ~90 cm; Maior/Menor ajustam */
function doisLados(o){o.traverse(x=>{if(x.isMesh&&x.material){x.material.side=T.DoubleSide;}});}
function curvaDe(pts){const g=G();return new T.CatmullRomCurve3(pts.map(p=>g.ponto(...p)),false,'catmullrom',.3);}
/* cena por trecho; devolve Group com userData.viagem = {curva (unidades do app) ou null, escalaVR, olharVR} */
function cena(state){
  const tr=D.viagem[state.trecho]||D.viagem[0],Mo=M(),g=G(),w=new T.Group();
  if(tr.cena==='corpo'){
    const dup=(inst)=>doisLados(inst);
    ['nariz','faringe','laringe','traqueia','bronquios'].forEach(k=>w.add(g.orgao(k,null,null,{aoCarregar:dup})));
    const pul=g.orgao('pulmoes',null,null,{opacidade:.3,aoCarregar:dup});w.add(pul);
    const cab=g.orgao('cabeca',null,null,{opacidade:.1});cab.userData.semEnquadre=true;w.add(cab);
    const curva=curvaDe(tr.pts);
    /* trilha luminosa do ar: pontos suaves ao longo do trecho, para dar direção */
    const n=14;for(let i=0;i<=n;i++){const p=curva.getPointAt(i/n);const b=Mo.ball(.0022,0x9ff3ff,p,{emissive:0x4fd0ff,emissiveIntensity:1.2,transparent:true,opacity:.8});b.userData.semEnquadre=true;b.userData.trilha=i/n;w.add(b);}
    w.userData.viagem={curva,escalaVR:ESCALA_VR,raioOlhar:0};
    w.userData.tick=t=>{w.traverse(o=>{if(o.userData.trilha!==undefined){o.material.opacity=.35+.5*Math.pow(Math.max(0,Math.sin(t*3-o.userData.trilha*8)),2);}});};
  }else if(tr.cena==='alveolo'){
    const a=Mo.alveolo({o2:true,co2:true});doisLados(a);w.add(a);
    w.userData.viagem={curva:null,centro:V(0,0,0),escalaVR:2.6,girar:true};
    const tickA=a.userData.tick;w.userData.tick=t=>{if(tickA)tickA(t);};
  }else{
    const s=Mo.inspection('sangue');doisLados(s);w.add(s);
    const curva=new T.CatmullRomCurve3([V(-1.3,0,0),V(-.6,.14,.08),V(.4,-.12,-.08),V(1.2,0,0)]);
    w.userData.viagem={curva,escalaVR:2.6,raioOlhar:0};
    const tickS=s.userData.tick;w.userData.tick=t=>{if(tickS)tickS(t);};
  }
  w.userData.semGiro=true;
  return w;
}
window.CORPO_VIAGEM={cena,ESCALA_VR};
})();
