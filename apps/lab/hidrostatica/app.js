/* Portal Lab 3D · Bancada 04 · Hidrostática · aplicação (v1.0)
   Organização: estado e persistência · cena 3D (câmera, arrastar, montagem) · laço de simulação ·
   assistente baseado nos dados · painel lateral · painel inferior (resultados, fórmulas, tabela, gráfico, comparar, concluir) · relatório.
   Toda medição vem de LabFisica.passo() e de LabFisica.leitura(); nada é inventado na interface. */
(function(){'use strict';
const T=THREE,F=window.LabFisica,Q=window.LabEquip,AT=window.LabAtividades,E=F.EQUIP;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,d=2)=>(Math.round(v*Math.pow(10,d))/Math.pow(10,d)).toFixed(d).replace('.',',').replace(/^-(0,0+)$/,'$1');
const cm=v=>fmt(v*100,1),cm3=v=>fmt(v*1e6,1),ml=v=>fmt(v*1e6,0);
const CHAVE='portal_lab3d_b04_v1';
const SITU={fora:'Fora do líquido',parcial:'Parcialmente submerso',submerso:'Totalmente submerso',fundo:'Apoiado no fundo (fio frouxo)',flutua:'Flutuando (fio frouxo)'};
const LIQ2={oleo:{nome:'Óleo de soja',rho:920,cor:'#f2c45a'},querosene:{nome:'Querosene',rho:810,cor:'#f6e7b0'},oleoMineral:{nome:'Óleo mineral',rho:850,cor:'#efe4c4'}};

/* ---------------- estado ---------------- */
function padraoExp(id){const X=AT.experimentos.find(e=>e.id===id);return {p:{material:'aluminio',rhoO:F.MATERIAIS.aluminio.rho,V:50e-6,liquido:'agua',rhoL:1000,g:F.G,recipiente:X.recipiente||'graduado',dinamometro:'analogico2'},yCmd:.12,medidas:[],hip:null,respostas:{},aberta:'',comparou:false,concluiu:false,vasos:{liq2:'oleo',vo:0}};}
let salvo={};try{salvo=JSON.parse(localStorage.getItem(CHAVE)||'{}')||{};}catch(e){salvo={};}
const EXP_URL=new URLSearchParams(location.search).get('exp');const NIVEL_URL=new URLSearchParams(location.search).get('nivel');
const C={expId:(EXP_URL&&AT.experimentos.some(e=>e.id===EXP_URL))?EXP_URL:(salvo.expId||'arquimedes'),nivel:(NIVEL_URL==='em'||NIVEL_URL==='ef')?NIVEL_URL:(salvo.nivel||'ef'),aluno:salvo.aluno||{nome:'',turma:'',escola:''},exps:salvo.exps||{},pausado:false,forcas:false,formulas:false,aba:'resultados'};
AT.experimentos.forEach(x=>{if(!C.exps[x.id])C.exps[x.id]=padraoExp(x.id);});
const X=()=>AT.experimentos.find(e=>e.id===C.expId);
const S=()=>C.exps[C.expId];
let tSalvar=null;function salvar(){clearTimeout(tSalvar);tSalvar=setTimeout(()=>{try{localStorage.setItem(CHAVE,JSON.stringify({expId:C.expId,nivel:C.nivel,aluno:C.aluno,exps:C.exps}));}catch(e){}},300);}
let sim=null,R=null,yAtual=.12,eventos={},pAr=null;
function reiniciarSim(){const s=S();sim=F.inicial(s.p);yAtual=s.yCmd;eventos={};R=F.passo(s.p,sim,yAtual);sim={Vw:R.Vw,coletado:R.coletado};}

/* ---------------- cena 3D ---------------- */
const canvas=$('cena');
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const cena=new T.Scene();cena.background=new T.Color(0x1a2530);cena.fog=new T.Fog(0x1a2530,2.5,6);
const camera=new T.PerspectiveCamera(38,1,.01,20);
cena.add(new T.HemisphereLight(0xeaf2ff,0x3a3128,.55));
const sol=new T.DirectionalLight(0xfff4e6,1.15);sol.position.set(.6,1.4,.9);sol.castShadow=true;sol.shadow.mapSize.set(1024,1024);Object.assign(sol.shadow.camera,{left:-.5,right:.5,top:.6,bottom:-.3,near:.1,far:4});sol.shadow.bias=-.0005;sol.shadow.radius=4;cena.add(sol);
const fill=new T.DirectionalLight(0xcfe3ff,.35);fill.position.set(-1,.6,-.2);cena.add(fill);
cena.add(Q.sala());
const cam={alvo:new T.Vector3(.02,.2,0),dist:.72,az:.42,el:.22};
function posCamera(){const c=Math.cos(cam.el);camera.position.set(cam.alvo.x+Math.sin(cam.az)*c*cam.dist,cam.alvo.y+Math.sin(cam.el)*cam.dist,cam.alvo.z+Math.cos(cam.az)*c*cam.dist);camera.lookAt(cam.alvo);}
function cameraPadrao(){const x=X();if(x.cena==='tuboU')Object.assign(cam,{alvo:new T.Vector3(-.02,.12,0),dist:.42,az:.1,el:.08});else if(S().p.recipiente==='transbordamento')Object.assign(cam,{alvo:new T.Vector3(.03,.27,0),dist:.66,az:.32,el:.1});else Object.assign(cam,{alvo:new T.Vector3(0,.19,0),dist:.58,az:.34,el:.12});posCamera();}
function redimensionar(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(redimensionar).observe(canvas);

/* montagem da bancada do experimento atual */
let M={};const raizExp=new T.Group();cena.add(raizExp);
function limparCena(){while(raizExp.children.length){const o=raizExp.children.pop();o.traverse(m=>{if(m.geometry)m.geometry.dispose();const mats=[].concat(m.material||[]);mats.forEach(x=>{if(x.map&&x.map!==Q.ambiente())x.map.dispose();x.dispose();});});}M={};}
function baseY(){return S().p.recipiente==='transbordamento'?.18:0;}
function montar(){limparCena();const s=S(),x=X();
 if(x.cena==='tuboU'){M.tubo=Q.tuboU();raizExp.add(M.tubo);return;}
 const bY=baseY();
 if(bY>0){/* macaco elevatório (plataforma) sob o recipiente de transbordamento, para a bica ficar acima da proveta */
  const plat=new T.Group();const aco=Q.mat(0x9aa3ad,{metalness:.8,roughness:.35});const topo=new T.Mesh(new T.BoxGeometry(.13,.01,.13),aco);topo.position.y=bY-.005;plat.add(topo);const baseP=new T.Mesh(new T.BoxGeometry(.13,.01,.13),aco);baseP.position.y=.005;plat.add(baseP);
  [[-1,1],[1,-1]].forEach(([a,b])=>{const t=new T.Mesh(new T.BoxGeometry(.006,Math.hypot(bY,.11),.012),aco);t.position.set(0,bY/2,a*.04);t.rotation.x=b*Math.atan2(.11,bY);plat.add(t);});
  const rosca=new T.Mesh(new T.CylinderGeometry(.004,.004,.14,10),Q.mat(0xd0d5db,{metalness:1,roughness:.3}));rosca.rotation.z=Math.PI/2;rosca.position.y=bY/2;plat.add(rosca);Q.sombra(plat);raizExp.add(plat);}
 M.suporte=Q.suporte();M.suporte.position.z=.02;raizExp.add(M.suporte);
 M.rec=Q.recipiente(s.p.recipiente);M.rec.position.y=bY;raizExp.add(M.rec);
 M.liq=Q.liquido(F.LIQUIDOS[s.p.liquido]?F.LIQUIDOS[s.p.liquido].cor:'#9fd4ff');M.liq.position.y=bY;raizExp.add(M.liq);
 M.regua=Q.regua();M.regua.position.set(-.066,bY,.012);M.regua.rotation.y=.35;raizExp.add(M.regua);
 if(s.p.recipiente==='transbordamento'){M.prov=Q.proveta();const fim=M.rec.userData.bicaFim;M.prov.position.set(fim.x,0,0);raizExp.add(M.prov);
  M.jato=new T.Mesh(new T.CylinderGeometry(.0016,.0011,1,8),new T.MeshPhysicalMaterial({color:0xbfe6ff,transparent:true,opacity:.65,roughness:.05,envMap:Q.ambiente()}));M.jato.visible=false;raizExp.add(M.jato);}
 const din=F.DINAMOMETROS[s.p.dinamometro]||F.DINAMOMETROS.analogico2;M.din=din.tipo==='digital'?Q.dinamometroDigital():Q.dinamometroAnalogico(din.max);raizExp.add(M.din);
 M.cil=Q.cilindro(s.p.material in F.MATERIAIS?s.p.material:'personalizado',s.p.V);raizExp.add(M.cil);
 M.fio=Q.fio();raizExp.add(M.fio);
 M.setas={P:Q.seta('#ff6b5a'),E:Q.seta('#4fb3ff'),T:Q.seta('#5fe08a'),N:Q.seta('#ffb547')};Object.values(M.setas).forEach(a=>raizExp.add(a));
}
/* atualiza a cena com o resultado da física */
const ESC_F=.045;/* 1 N = 4,5 cm de seta */
function atualizarCena(dt){const s=S(),x=X();
 if(x.cena==='tuboU'){const v=vasosAtual();M.tubo.userData.set(v.r,LIQ2[s.vasos.liq2].cor);return;}
 const bY=baseY(),fundo=bY+.006,H=R.H;
 M.cil.position.set(0,fundo+R.yb,0);
 M.liq.userData.set(R.h,F.LIQUIDOS[s.p.liquido]?F.LIQUIDOS[s.p.liquido].cor:null);
 const din=F.DINAMOMETROS[s.p.dinamometro];const lt=F.leitura(R.T,din.res,din.max);
 if(M.din.userData.tipo==='digital')M.din.userData.set(R.T,lt.saturado?'-OL-':fmt(lt.valor,2));else M.din.userData.set(R.T);
 const topoCil=fundo+R.yb+H+.006;/* com o fio frouxo, o gancho fica onde o aluno pôs o suporte (o fio dobra) */
 const yGancho=(R.situ==='fundo'||R.situ==='flutua')?fundo+Math.max(yAtual,R.yb)+H+.006+.04:topoCil+.04;
 const topoDin=yGancho+M.din.userData.comprimento();M.din.position.set(0,topoDin,0);M.suporte.userData.setAltura(topoDin+.022);
 const ganchoP=new T.Vector3(0,yGancho,0),cilP=new T.Vector3(0,topoCil,0);
 if(R.situ==='fundo'||R.situ==='flutua'){/* fio frouxo: desenha uma barriga */const meio=new T.Vector3(.012,(yGancho+topoCil)/2,0);M.fio.userData.set(ganchoP,meio);}else M.fio.userData.set(ganchoP,cilP);
 if(M.prov){M.prov.userData.set(R.coletado,F.LIQUIDOS[s.p.liquido].cor);/* jato caindo da bica enquanto há transbordamento */
  if(R.transbordou>0)eventos._jato=.35;eventos._jato=Math.max(0,(eventos._jato||0)-dt);M.jato.visible=eventos._jato>0;if(M.jato.visible){const fim=M.rec.userData.bicaFim;const yTopo=bY+fim.y,yFim=.012+R.coletado/F.area(E.rProveta);M.jato.position.set(fim.x,(yTopo+yFim)/2,0);M.jato.scale.y=Math.max(.001,yTopo-yFim);}}
 /* setas de força, aplicadas no centro do cilindro (o empuxo no centro da parte submersa) */
 const vis=C.forcas;Object.values(M.setas).forEach(a=>a.visible=vis);if(vis){const c=new T.Vector3(.0,fundo+R.yb+H/2,.02),cE=new T.Vector3(.0,fundo+R.yb+R.hs/2,.02);
  M.setas.P.userData.set(c.clone().add(new T.Vector3(-.03,0,0)),new T.Vector3(0,-1,0),R.P*ESC_F,'P '+fmt(R.P)+' N');
  M.setas.E.userData.set(cE.clone().add(new T.Vector3(.03,0,0)),new T.Vector3(0,1,0),R.E*ESC_F,'E '+fmt(R.E)+' N');
  M.setas.T.userData.set(new T.Vector3(0,topoCil,.02),new T.Vector3(0,1,0),R.T*ESC_F,'T '+fmt(R.T)+' N');
  M.setas.N.userData.set(new T.Vector3(-.012,fundo,.02),new T.Vector3(0,1,0),R.N*ESC_F,'N '+fmt(R.N)+' N');}
}

/* ---------------- interação: girar, aproximar e arrastar o cilindro ---------------- */
const ray=new T.Raycaster(),ndc=new T.Vector2();const ptrs=new Map();let arrasto=null,orbita=null,pinca=null;
function raio(e){const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);}
function yMax(){return S().p.recipiente==='transbordamento'?.16:.2;}
function definirY(y,origem){const s=S();s.yCmd=Math.max(-.01,Math.min(yMax(),y));const sl=document.querySelector('[data-campo="y"]');if(sl&&origem!=='slider'){sl.value=Math.round(s.yCmd*1000);const o=sl.parentElement.querySelector('output');if(o)o.textContent=cm(s.yCmd)+' cm';}salvar();}
canvas.addEventListener('pointerdown',e=>{canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinca={d:Math.hypot(a.x-b.x,a.y-b.y),dist:cam.dist};arrasto=null;orbita=null;return;}
 if(X().cena!=='tuboU'&&M.cil){raio(e);const hit=ray.intersectObject(M.cil,true)[0];if(hit){const n=camera.getWorldDirection(new T.Vector3()).setY(0).normalize();const plano=new T.Plane().setFromNormalAndCoplanarPoint(n,hit.point);arrasto={plano,dy:hit.point.y-(baseY()+.006+S().yCmd)};canvas.style.cursor='grabbing';return;}}
 orbita={x:e.clientX,y:e.clientY,az:cam.az,el:cam.el};});
canvas.addEventListener('pointermove',e=>{if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinca&&ptrs.size>=2){const [a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);cam.dist=Math.max(.25,Math.min(1.8,pinca.dist*pinca.d/Math.max(1,d)));posCamera();return;}
 if(arrasto){raio(e);const p=new T.Vector3();if(ray.ray.intersectPlane(arrasto.plano,p))definirY(p.y-arrasto.dy-baseY()-.006);return;}
 if(orbita){cam.az=orbita.az-(e.clientX-orbita.x)*.006;cam.el=Math.max(-.05,Math.min(1.2,orbita.el+(e.clientY-orbita.y)*.005));posCamera();return;}
 if(e.pointerType==='mouse'&&M.cil){raio(e);canvas.style.cursor=ray.intersectObject(M.cil,true).length?'grab':'default';}});
const soltar=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinca=null;if(!ptrs.size){arrasto=null;orbita=null;canvas.style.cursor='default';}};
canvas.addEventListener('pointerup',soltar);canvas.addEventListener('pointercancel',soltar);
canvas.addEventListener('wheel',e=>{e.preventDefault();cam.dist=Math.max(.25,Math.min(1.8,cam.dist*Math.exp(e.deltaY*.0012)));posCamera();},{passive:false});
canvas.addEventListener('keydown',e=>{if(X().cena==='tuboU')return;const pas=e.shiftKey?.01:.002;if(e.key==='ArrowUp'){definirY(S().yCmd+pas);e.preventDefault();}else if(e.key==='ArrowDown'){definirY(S().yCmd-pas);e.preventDefault();}else if(e.key==='ArrowLeft'){cam.az-=.08;posCamera();e.preventDefault();}else if(e.key==='ArrowRight'){cam.az+=.08;posCamera();e.preventDefault();}else if(e.key===' '||e.key==='Enter'){acao('registrar');e.preventDefault();}});

/* ---------------- vasos comunicantes ---------------- */
function vasosAtual(){const s=S(),l=LIQ2[s.vasos.liq2],rT=.008-.0005,a=F.area(rT);const conx=Math.PI*.05*1.1*a*1.15;/* volume aproximado da curva inferior (só para o balanço de água) */
 const Va=conx+a*.09;const r=F.vasos({rTubo:rT,Va,Vc:conx,Vo:s.vasos.vo*1e-6,rhoA:1000,rhoO:l.rho,g:s.p.g});return {r,l};}

/* ---------------- assistente (regras sobre os dados da simulação; não depende de IA) ---------------- */
let ultimaFala='';
function assistente(extra){const x=X(),s=S();const i=passoAtual();const p=x.passos[Math.min(i,x.passos.length-1)];let h='';
 if(i<x.passos.length)h+='<div class="passo">Passo '+(i+1)+' de '+x.passos.length+'</div><p>'+esc(p.t)+'</p>';else h+='<div class="passo">Roteiro concluído</div><p>Você completou todos os passos. Gere o relatório na aba Concluir atividade.</p>';
 if(extra)h+='<p class="pergunta">'+extra+'</p>';$('assMsg').innerHTML=h;ultimaFala=$('assMsg').textContent;}
function passoAtual(){const x=X(),s=S();for(let i=0;i<x.passos.length;i++){if(!x.passos[i].ok(R||{},s))return i;}return x.passos.length;}
function falar(txt){/* o assistente comenta o que acabou de acontecer, sempre com os números da simulação */assistente(txt);}
function vigiar(){const x=X(),s=S();if(!R||x.cena==='tuboU')return;const din=F.DINAMOMETROS[s.p.dinamometro];
 if(R.situ==='fora'&&pAr===null)pAr={T:R.T};
 if(!eventos.toca&&R.hs>0){eventos.toca=true;const ar=F.leitura(R.P,din.res,din.max).valor;falar('A base do cilindro tocou o líquido. Antes, o dinamômetro marcava '+fmt(ar)+' N; agora marca '+fmt(F.leitura(R.T,din.res,din.max).valor)+' N. O que está empurrando o cilindro para cima?');}
 if(!eventos.sub&&R.situ==='submerso'){eventos.sub={prof:R.prof,E:R.E};falar('Todo o cilindro está submerso: o empuxo agora é '+fmt(R.E)+' N e o peso aparente é '+fmt(R.Pap)+' N. Continue descendo, sem tocar o fundo: o empuxo vai mudar?');}
 if(eventos.sub&&!eventos.fundo2&&R.situ==='submerso'&&R.prof-eventos.sub.prof>.015){eventos.fundo2=true;falar('Você desceu mais '+cm(R.prof-eventos.sub.prof)+' cm e o empuxo continua '+fmt(R.E)+' N. A pressão na base aumentou para '+fmt(R.pBase,0)+' Pa, mas o empuxo não mudou. Por quê?');}
 if(!eventos.fundo&&R.situ==='fundo'){eventos.fundo=true;falar('O cilindro apoiou no fundo e o fio afrouxou: o dinamômetro marca 0 N. Quem sustenta agora os '+fmt(R.N)+' N que faltam é o fundo do recipiente (força normal). Para medir o peso aparente, suba o cilindro até ele não tocar o fundo.');}
 if(!eventos.flutua&&R.situ==='flutua'){eventos.flutua=true;falar('O cilindro flutua: só '+fmt(R.fracao*100,0)+'% dele fica submerso. Densidade do objeto ÷ densidade do líquido = '+fmt(R.densRel,2)+'. Coincidência?');}
 if(!eventos.gota&&R.coletado>0){eventos.gota=true;falar('A água começou a cair na proveta. Cada mL que sai pela bica é volume que o cilindro ocupou dentro do líquido.');}
 const lt=F.leitura(R.T,din.res,din.max);if(lt.saturado&&!eventos.sat){eventos.sat=true;falar('A força ('+fmt(R.T)+' N) passou do fundo de escala do '+din.nome.toLowerCase()+'. Use "Trocar equipamento" para um dinamômetro de maior capacidade.');}
}

/* ---------------- registro de medições ---------------- */
function medidaAtual(){const s=S(),x=X();
 if(x.cena==='tuboU'){const {r,l}=vasosAtual();return {exp:x.id,vo:s.vasos.vo,liq2:s.vasos.liq2,rho2:l.rho,ho:r.ho,dh:r.dh,desnivel:r.desnivel,razao:r.ho>0?r.dh/r.ho:null,t:Date.now()};}
 const din=F.DINAMOMETROS[s.p.dinamometro];const lt=F.leitura(R.T,din.res,din.max);const vCol=Math.round(R.coletado*1e6)*1e-6;/* proveta: resolução de 1 mL */
 const ar=s.medidas.find(m=>m.situ==='fora'&&m.material===s.p.material&&Math.abs(m.V-s.p.V)<1e-9);
 return {exp:x.id,liquido:s.p.liquido,rhoL:s.p.rhoL,material:s.p.material,rhoO:s.p.rhoO,V:s.p.V,g:s.p.g,din:s.p.dinamometro,situ:R.situ,prof:R.prof,yb:R.yb,hs:R.hs,Vsub:R.Vsub,
  leitura:lt.valor,saturado:lt.saturado,Pteo:R.P,Eteo:R.E,Tteo:R.T,pBase:R.pBase,coletado:vCol,pesoLiq:s.p.rhoL*s.p.g*vCol,
  empuxoMed:ar&&R.situ!=='fundo'&&R.situ!=='flutua'?ar.leitura-lt.valor:null,t:Date.now()};}
const COLS={
 situacao:['Situação',m=>SITU[m.situ]||'-'],prof:['Profund. da base (cm)',m=>m.prof>0?cm(m.prof):'acima'],leitura:['Leitura (N)',m=>fmt(m.leitura)+(m.saturado?' (fora da escala)':'')],
 empuxoMed:['Empuxo medido (N)',m=>m.empuxoMed==null?'—':fmt(m.empuxoMed)],empuxoTeo:['Empuxo teórico (N)',m=>fmt(m.Eteo,3)],coletado:['Na proveta (mL)',m=>ml(m.coletado)],pesoLiq:['Peso do líquido coletado (N)',m=>fmt(m.pesoLiq,3)],
 liquido:['Líquido',m=>(F.LIQUIDOS[m.liquido]||{nome:'Personalizado'}).nome+' ('+m.rhoL+' kg/m³)'],material:['Cilindro',m=>(F.MATERIAIS[m.material]||{nome:'—'}).nome+' · '+cm3(m.V)+' cm³'],pressao:['Pressão na base (Pa)',m=>fmt(m.pBase,0)],
 vo:['2º líquido (cm³)',m=>fmt(m.vo,1)],ho:['Coluna do 2º líquido h₂ (cm)',m=>cm(m.ho)],dh:['Água acima da interface h₁ (cm)',m=>cm(m.dh)],desnivel:['Desnível (cm)',m=>cm(m.desnivel)],razao:['h₁/h₂ (= ρ₂/ρ₁)',m=>m.razao==null?'—':fmt(m.razao,3)]};

/* ---------------- painel lateral ---------------- */
function campoRange(id,rot,min,max,passo,val,txt){return '<div class="campo"><label for="c_'+id+'">'+rot+'</label><output>'+txt+'</output><input id="c_'+id+'" type="range" data-campo="'+id+'" min="'+min+'" max="'+max+'" step="'+passo+'" value="'+val+'"></div>';}
function campoSelect(id,rot,ops,val){return '<div class="campo"><label for="c_'+id+'">'+rot+'</label><span></span><select id="c_'+id+'" data-campo="'+id+'">'+ops.map(([v,t])=>'<option value="'+v+'"'+(v===val?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></div>';}
function painel(){const s=S(),x=X(),em=C.nivel==='em';let h='';
 if(x.cena==='tuboU'){h+='<div class="bloco"><h3>Segundo líquido</h3>'+campoSelect('liq2','Líquido (não se mistura com a água)',Object.entries(LIQ2).map(([k,v])=>[k,v.nome+(em?' · '+v.rho+' kg/m³':'')]),s.vasos.liq2)+campoRange('vo','Volume despejado no ramo direito',0,12,.5,s.vasos.vo,fmt(s.vasos.vo,1)+' cm³')+'<p class="nota">O tubo tem 1,5 cm de diâmetro interno. A água ocupa a curva e a base dos dois ramos.</p></div>';$('painelControles').innerHTML=h;return;}
 const din=F.DINAMOMETROS[s.p.dinamometro];
 h+='<div class="bloco"><h3>Posição do cilindro</h3>'+campoRange('y','Altura da base sobre o fundo',-10,Math.round(yMax()*1000),1,Math.round(s.yCmd*1000),cm(s.yCmd)+' cm')+'<p class="nota">Também dá para arrastar o cilindro na cena ou usar as setas ↑ ↓ (Shift = 1 cm).</p></div>';
 h+='<div class="bloco"><h3>Equipamento</h3><div class="seg"><button type="button" data-action="rec:graduado" class="'+(s.p.recipiente==='graduado'?'on':'')+'">Béquer graduado</button><button type="button" data-action="rec:transbordamento" class="'+(s.p.recipiente==='transbordamento'?'on':'')+'">Transbordamento + proveta</button></div>'+
  campoSelect('din','Dinamômetro',Object.entries(F.DINAMOMETROS).map(([k,v])=>[k,v.nome+' (resolução '+fmt(v.res,2)+' N)']),s.p.dinamometro)+'</div>';
 h+='<div class="bloco"><h3>Objeto</h3>'+campoSelect('mat','Material do cilindro',Object.entries(F.MATERIAIS).filter(([k])=>em||k!=='personalizado').map(([k,v])=>[k,v.nome+' · '+v.rho+' kg/m³']),s.p.material)+
  campoRange('V','Volume do cilindro',20,100,5,Math.round(s.p.V*1e6),cm3(s.p.V)+' cm³ (altura '+cm(F.alturaCilindro(s.p.V))+' cm)');
 if(em){h+=campoRange('rhoO','Densidade do objeto',300,9000,10,s.p.rhoO,s.p.rhoO+' kg/m³')+campoRange('m','Massa',Math.ceil(300*s.p.V*1000),Math.floor(9000*s.p.V*1000),1,Math.round(s.p.rhoO*s.p.V*1000),fmt(s.p.rhoO*s.p.V*1000,0)+' g');}
 else h+='<p class="nota">Massa: <b>'+fmt(s.p.rhoO*s.p.V*1000,0)+' g</b> (densidade × volume)</p>';
 h+='</div><div class="bloco"><h3>Líquido</h3>'+campoSelect('liq','Líquido no recipiente',Object.entries(F.LIQUIDOS).map(([k,v])=>[k,v.nome+' · '+v.rho+' kg/m³']).concat(em?[['personalizado','Personalizado']]:[]),s.p.liquido);
 if(em)h+=campoRange('rhoL','Densidade do líquido',700,1500,5,s.p.rhoL,s.p.rhoL+' kg/m³')+campoSelect('g','Gravidade',[['9.8','Terra · 9,8 m/s²'],['1.62','Lua · 1,62 m/s²'],['3.71','Marte · 3,71 m/s²']],String(s.p.g));
 h+='</div><div class="bloco"><h3>Leitura do instrumento</h3><p class="nota">'+esc(din.nome)+': resolução de '+fmt(din.res,2)+' N, fundo de escala '+din.max+' N. A tabela guarda a <b>medição simulada</b> (o valor arredondado à resolução do instrumento) e o <b>valor teórico</b> calculado.</p></div>';
 $('painelControles').innerHTML=h;}
function aoMudarCampo(el){const s=S(),k=el.dataset.campo,v=el.value;let remontar=false;
 if(k==='y'){definirY(Number(v)/1000,'slider');el.parentElement.querySelector('output').textContent=cm(Number(v)/1000)+' cm';return;}
 if(k==='din'){s.p.dinamometro=v;remontar=true;}
 else if(k==='mat'){s.p.material=v;if(F.MATERIAIS[v]&&v!=='personalizado')s.p.rhoO=F.MATERIAIS[v].rho;remontar=true;falar('Cilindro trocado: agora é '+F.MATERIAIS[v].nome.toLowerCase()+' ('+s.p.rhoO+' kg/m³). Peso no ar: '+fmt(s.p.rhoO*s.p.V*s.p.g)+' N.');pAr=null;}
 else if(k==='V'){s.p.V=Number(v)*1e-6;remontar=true;pAr=null;}
 else if(k==='rhoO'){s.p.rhoO=Number(v);s.p.material='personalizado';remontar=true;}
 else if(k==='m'){s.p.rhoO=Math.round(Number(v)/1000/s.p.V);s.p.material='personalizado';remontar=true;}
 else if(k==='liq'){s.p.liquido=v;if(F.LIQUIDOS[v])s.p.rhoL=F.LIQUIDOS[v].rho;const antes=R?R.E:0;reiniciarSim();remontar=true;if(R&&R.hs>0)falar('Líquido trocado para '+(F.LIQUIDOS[v]||{nome:'personalizado'}).nome.toLowerCase()+'. Com o mesmo volume submerso, o empuxo foi de '+fmt(antes)+' N para '+fmt(R.E)+' N.');}
 else if(k==='rhoL'){s.p.rhoL=Number(v);s.p.liquido='personalizado';}
 else if(k==='g'){s.p.g=Number(v);}
 else if(k==='liq2'){s.vasos.liq2=v;}
 else if(k==='vo'){s.vasos.vo=Number(v);}
 salvar();if(remontar){montar();}painel();}

/* ---------------- painel inferior ---------------- */
function card(cls,rot,val,obs){return '<div class="med '+cls+'"><small>'+rot+'</small><b>'+val+'</b>'+(obs?'<em>'+obs+'</em>':'')+'</div>';}
function abaResultados(){const s=S(),x=X();if(x.cena==='tuboU'){const {r,l}=vasosAtual();return '<div class="grade">'+card('','Coluna do '+l.nome.toLowerCase()+' (h₂)',cm(r.ho)+' cm','teórico')+card('','Água acima da interface (h₁)',cm(r.dh)+' cm','teórico')+card('','Desnível entre as superfícies',cm(r.desnivel)+' cm','teórico')+card('','Pressão na interface',fmt(r.pInterface,0)+' Pa','ρ₂ · g · h₂')+card('','h₁ ÷ h₂',r.ho>0?fmt(r.dh/r.ho,3):'—','= ρ₂ ÷ ρ₁ = '+fmt(l.rho/1000,3))+'</div>';}
 const din=F.DINAMOMETROS[s.p.dinamometro];const lt=F.leitura(R.T,din.res,din.max);const em=C.nivel==='em';
 return '<div class="grade">'+card('T','Leitura do dinamômetro',fmt(lt.valor)+' N'+(lt.saturado?' ⚠':''),'medição simulada · ±'+fmt(din.res/2,din.res<.05?3:2)+' N')+card('P','Peso (P)',fmt(R.P,3)+' N','teórico: m · g')+card('E','Empuxo (E)',fmt(R.E,3)+' N','teórico: ρ · g · V(sub)')+card('','Peso aparente',fmt(R.Pap,3)+' N','teórico: P − E')+(R.N>0?card('N','Força do fundo (N)',fmt(R.N,3)+' N','fio frouxo'):'')+
  card('','Volume submerso',cm3(R.Vsub)+' cm³',fmt(R.fracao*100,0)+'% do cilindro')+(s.p.recipiente==='transbordamento'?card('','Na proveta',ml(R.coletado)+' mL','medição · ±1 mL'):card('','Nível do líquido',cm(R.h)+' cm','lido na régua'))+card('','Profundidade da base',R.prof>0?cm(R.prof)+' cm':'acima do líquido','')+
  card('','Pressão na base',R.prof>0?fmt(R.pBase,0)+' Pa':'0 Pa',em?'= '+fmt(R.pBase/1000,3)+' kPa (relativa)':'pressão da água sobre a base')+card('','Situação',SITU[R.situ],'')+'</div>';}
function abaFormulas(){const s=S(),x=X(),em=C.nivel==='em';if(x.cena==='tuboU'){const {r,l}=vasosAtual();return '<div class="formula"><code>ρ₁ · g · h₁ = ρ₂ · g · h₂</code><br>1000 × '+cm(r.dh)+' cm = '+l.rho+' × '+cm(r.ho)+' cm → '+fmt(1000*r.dh*100,1)+' = '+fmt(l.rho*r.ho*100,1)+' (kg/m³ · cm)</div><div class="formula">Mesmo líquido, mesma altura ⇒ mesma pressão. Por isso, sem o 2º líquido, os ramos ficam no mesmo nível.</div>';}
 const g=s.p.g,m=s.p.rhoO*s.p.V;const lin=(f,c)=>'<div class="formula"><code>'+f+'</code><br>'+c+'</div>';
 if(!em)return lin('Peso = massa × gravidade',fmt(m,3)+' kg × '+fmt(g,2)+' m/s² = <b>'+fmt(R.P,3)+' N</b>')+lin('Empuxo = densidade do líquido × gravidade × volume submerso',s.p.rhoL+' kg/m³ × '+fmt(g,2)+' × '+cm3(R.Vsub)+' cm³ = <b>'+fmt(R.E,3)+' N</b>')+lin('Peso aparente = Peso − Empuxo',fmt(R.P,3)+' − '+fmt(R.E,3)+' = <b>'+fmt(R.Pap,3)+' N</b> (é o que o dinamômetro mostra com o cilindro pendurado)');
 return lin('P = m · g',fmt(m,4)+' kg · '+fmt(g,2)+' m/s² = <b>'+fmt(R.P,4)+' N</b>')+lin('E = ρ<sub>L</sub> · g · V<sub>sub</sub>',s.p.rhoL+' · '+fmt(g,2)+' · '+(R.Vsub*1e6).toFixed(2).replace('.',',')+'×10⁻⁶ m³ = <b>'+fmt(R.E,4)+' N</b>')+lin('V<sub>sub</sub> = π · r² · h<sub>sub</sub>','π · (0,016 m)² · '+fmt(R.hs,4)+' m = '+cm3(R.Vsub)+' cm³')+lin('T = P − E (pendurado, sem tocar o fundo)',fmt(R.P,4)+' − '+fmt(R.E,4)+' = <b>'+fmt(Math.max(0,R.Pap),4)+' N</b>')+lin('p = ρ<sub>L</sub> · g · h',s.p.rhoL+' · '+fmt(g,2)+' · '+fmt(Math.max(0,R.prof),4)+' m = <b>'+fmt(R.pBase,1)+' Pa</b>')+lin('Flutuação: ρ<sub>O</sub> < ρ<sub>L</sub> ⇒ V<sub>sub</sub>/V = ρ<sub>O</sub>/ρ<sub>L</sub>',s.p.rhoO+' / '+s.p.rhoL+' = '+fmt(s.p.rhoO/s.p.rhoL,3));}
function abaTabela(){const s=S(),x=X();if(!s.medidas.length)return '<p>Nenhuma medição ainda. Use <b>● Registrar medição</b> (ou Espaço com a cena selecionada) a cada situação do roteiro.</p>';
 const cols=x.colunas;return '<div class="linha-acoes"><button type="button" data-action="apagar-ultima">Apagar a última</button><button type="button" data-action="limpar-tabela">Limpar tabela</button><button type="button" data-action="csv">Baixar planilha (CSV)</button></div><table class="dados"><thead><tr><th>#</th>'+cols.map(c=>'<th>'+COLS[c][0]+'</th>').join('')+'</tr></thead><tbody>'+s.medidas.map((m,i)=>'<tr><td>'+(i+1)+'</td>'+cols.map(c=>'<td>'+esc(COLS[c][1](m))+'</td>').join('')+'</tr>').join('')+'</tbody></table>';}
function abaGrafico(){return '<canvas class="graf" id="graf" width="1000" height="380"></canvas><p class="nota" id="grafNota"></p>';}
/* gráficos: pontos = medições registradas; linha = previsão teórica calculada pela própria física */
function desenharGrafico(cv,notaEl){const s=S(),x=X();if(!cv)return;const c=cv.getContext('2d'),W=cv.width,H=cv.height;c.fillStyle='#0b1c2c';c.fillRect(0,0,W,H);
 const pad={l:96,r:24,t:40,b:56};let pts=[],teo=[],rx='',ry='',nota='';
 if(x.grafico==='pressao'||x.grafico==='arquimedes'){const par=Object.assign({},s.p,{recipiente:'graduado'});let st=F.inicial(par);
  for(let y=.2;y>=0;y-=.001){const r=F.passo(par,st,y);if(r.prof>0&&r.situ!=='fundo')teo.push(x.grafico==='pressao'?[r.prof*100,r.pBase]:[r.prof*100,r.E]);}
  pts=s.medidas.filter(m=>m.prof>0&&m.situ!=='fundo').map(m=>x.grafico==='pressao'?[m.prof*100,m.pBase]:[m.prof*100,m.empuxoMed!=null?m.empuxoMed:m.Eteo]);
  rx='Profundidade da base (cm)';ry=x.grafico==='pressao'?'Pressão na base (Pa)':'Empuxo (N)';nota=x.grafico==='pressao'?'A pressão cresce em linha reta com a profundidade (p = ρ · g · h).':'O empuxo cresce enquanto o cilindro afunda e fica constante quando ele está todo submerso.';}
 else if(x.grafico==='densidade'){const subs=s.medidas.filter(m=>m.situ==='submerso');pts=subs.map(m=>[m.rhoL,m.empuxoMed!=null?m.empuxoMed:m.Eteo]);for(let rho=700;rho<=1400;rho+=10)teo.push([rho,rho*s.p.g*s.p.V]);rx='Densidade do líquido (kg/m³)';ry='Empuxo (N)';nota='Com o cilindro todo submerso, o empuxo é proporcional à densidade do líquido (reta pela origem: E = ρ · g · V).';}
 else if(x.grafico==='vasos'){pts=s.medidas.filter(m=>m.vo>0).map(m=>[m.ho*100,m.dh*100]);const l=LIQ2[s.vasos.liq2];for(let h=0;h<=12;h+=.2)teo.push([h,h*l.rho/1000]);rx='Coluna do 2º líquido h₂ (cm)';ry='Água acima da interface h₁ (cm)';nota='h₁ = (ρ₂/ρ₁) · h₂: a inclinação da reta é a densidade relativa do 2º líquido.';}
 const todos=teo.concat(pts);if(!todos.length){c.fillStyle='#9fb6c9';c.font='28px Segoe UI';c.fillText('Registre medições para ver o gráfico.',pad.l,H/2);return;}
 let x0=Math.min(0,...todos.map(p=>p[0])),x1=Math.max(...todos.map(p=>p[0]))*1.05||1,y0=0,y1=Math.max(...todos.map(p=>p[1]))*1.12||1;if(x.grafico==='densidade'){x0=600;}
 const X_=v=>pad.l+(v-x0)/(x1-x0)*(W-pad.l-pad.r),Y_=v=>H-pad.b-(v-y0)/(y1-y0)*(H-pad.t-pad.b);
 c.strokeStyle='#24435f';c.lineWidth=1;c.fillStyle='#9fb6c9';c.font='20px Segoe UI';for(let i=0;i<=5;i++){const v=y0+(y1-y0)*i/5;c.beginPath();c.moveTo(pad.l,Y_(v));c.lineTo(W-pad.r,Y_(v));c.stroke();c.textAlign='right';c.fillText(fmt(v,y1>100?0:2),pad.l-8,Y_(v)+6);}
 for(let i=0;i<=6;i++){const v=x0+(x1-x0)*i/6;c.textAlign='center';c.fillText(fmt(v,x1>100?0:1),X_(v),H-pad.b+24);}
 c.fillStyle='#cfe6f2';c.font='600 21px Segoe UI';c.textAlign='center';c.fillText(rx,(pad.l+W-pad.r)/2,H-8);c.save();c.translate(22,(pad.t+H-pad.b)/2);c.rotate(-Math.PI/2);c.fillText(ry,0,0);c.restore();
 if(teo.length){c.strokeStyle='#4fb3ff';c.lineWidth=3;c.setLineDash([10,6]);c.beginPath();teo.sort((a,b)=>a[0]-b[0]).forEach((p,i)=>i?c.lineTo(X_(p[0]),Y_(p[1])):c.moveTo(X_(p[0]),Y_(p[1])));c.stroke();c.setLineDash([]);}
 pts.forEach(p=>{c.fillStyle='#ffd27a';c.strokeStyle='#0b1c2c';c.lineWidth=2;c.beginPath();c.arc(X_(p[0]),Y_(p[1]),8,0,Math.PI*2);c.fill();c.stroke();});
 c.font='600 19px Segoe UI';c.textAlign='left';c.fillStyle='#4fb3ff';c.fillText('— — previsão teórica',pad.l+8,22);c.fillStyle='#ffd27a';c.fillText('● medições registradas',pad.l+220,22);
 if(notaEl)notaEl.textContent=nota;}
function abaComparar(){const s=S(),x=X();S().comparou=true;salvar();setTimeout(()=>assistente(),50);let h='';
 if(x.id==='arquimedes'){const sub=s.medidas.filter(m=>m.situ==='submerso'&&m.empuxoMed!=null);if(!sub.length)return '<p>Registre o peso no ar (cilindro fora da água) e depois uma medição com o cilindro todo submerso.</p>';
  h+='<table class="dados"><thead><tr><th>Medição</th><th>Empuxo medido (N)</th><th>Peso do líquido coletado (N)</th><th>Diferença</th><th>Empuxo teórico (N)</th></tr></thead><tbody>'+sub.map((m,i)=>'<tr><td>'+(i+1)+'</td><td>'+fmt(m.empuxoMed)+'</td><td>'+fmt(m.pesoLiq,3)+'</td><td>'+fmt(Math.abs(m.empuxoMed-m.pesoLiq),3)+' N</td><td>'+fmt(m.Eteo,3)+'</td></tr>').join('')+'</tbody></table><p class="nota">A diferença vem da resolução dos instrumentos (dinamômetro e proveta), não de erro de cálculo.</p>';}
 else if(x.id==='densidade'){const sub=s.medidas.filter(m=>m.situ==='submerso');if(!sub.length)return '<p>Registre medições com o cilindro todo submerso em líquidos diferentes.</p>';const g={};sub.forEach(m=>{g[m.liquido]=m;});
  h+='<table class="dados"><thead><tr><th>Líquido</th><th>ρ (kg/m³)</th><th>Empuxo (N)</th><th>E ÷ ρ (×10⁻⁴)</th></tr></thead><tbody>'+Object.values(g).sort((a,b)=>a.rhoL-b.rhoL).map(m=>{const e=m.empuxoMed!=null?m.empuxoMed:m.Eteo;return '<tr><td>'+esc((F.LIQUIDOS[m.liquido]||{nome:'Personalizado'}).nome)+'</td><td>'+m.rhoL+'</td><td>'+fmt(e,3)+'</td><td>'+fmt(e/m.rhoL*1e4,3)+'</td></tr>';}).join('')+'</tbody></table><p class="nota">Se E ÷ ρ é praticamente constante, o empuxo é proporcional à densidade do líquido (constante = g · V).</p>';}
 else if(x.id==='pressao'){const sub=s.medidas.filter(m=>m.prof>0);if(!sub.length)return '<p>Registre medições em profundidades diferentes.</p>';h+='<table class="dados"><thead><tr><th>Profundidade (cm)</th><th>Pressão (Pa)</th><th>p ÷ h (Pa/cm)</th><th>Empuxo (N)</th></tr></thead><tbody>'+sub.map(m=>'<tr><td>'+cm(m.prof)+'</td><td>'+fmt(m.pBase,0)+'</td><td>'+fmt(m.pBase/(m.prof*100),1)+'</td><td>'+fmt(m.empuxoMed!=null?m.empuxoMed:m.Eteo,3)+'</td></tr>').join('')+'</tbody></table><p class="nota">p ÷ h constante (≈ ρ · g ÷ 100 = '+fmt(s.p.rhoL*s.p.g/100,1)+' Pa/cm) mostra a relação linear.</p>';}
 else{const sub=s.medidas.filter(m=>m.vo>0);if(!sub.length)return '<p>Registre medições com o segundo líquido.</p>';h+='<table class="dados"><thead><tr><th>h₂ (cm)</th><th>h₁ (cm)</th><th>ρ₂ calculado = 1000 · h₁/h₂</th></tr></thead><tbody>'+sub.map(m=>'<tr><td>'+cm(m.ho)+'</td><td>'+cm(m.dh)+'</td><td>'+fmt(1000*m.dh/m.ho,0)+' kg/m³</td></tr>').join('')+'</tbody></table>';}
 return h;}
function abaConcluir(){const s=S(),x=X();let h='<div class="bloco"><h3>Sua hipótese</h3><p>'+esc(x.hipotese.q)+'</p><p><b>'+(s.hip==null?'Ainda não registrada (abra o Roteiro).':esc(x.hipotese.op[s.hip]))+'</b>'+(s.hip!=null?(s.hip===x.hipotese.ok?' · confirmada pelas medições.':' · os dados mostraram outra coisa: veja as questões.'):'')+'</p></div>';
 h+=x.questoes.map((q,i)=>{const r=s.respostas[i];return '<div class="questao"><p>'+(i+1)+'. '+esc(q.q)+'</p><div class="ops">'+q.op.map((o,j)=>'<button type="button" data-action="resp:'+i+':'+j+'" class="'+(r!=null?(j===q.ok?'certa':j===r?'errada':''):'')+'">'+esc(o)+'</button>').join('')+'</div>'+(r!=null?'<div class="pq">'+(r===q.ok?'✓ ':'✗ ')+esc(q.why)+'</div>':'')+'</div>';}).join('');
 h+='<div class="questao"><p>'+(x.questoes.length+1)+'. '+esc(x.aberta)+'</p><textarea data-campo-texto="aberta" placeholder="Escreva com as suas palavras, usando as medições.">'+esc(s.aberta||'')+'</textarea></div>';
 h+='<div class="bloco"><h3>Identificação e relatório</h3><div class="linha-acoes"><input type="text" data-campo-texto="nome" placeholder="Nome do aluno ou do grupo" value="'+esc(C.aluno.nome)+'"><input type="text" data-campo-texto="turma" placeholder="Turma" value="'+esc(C.aluno.turma)+'"><input type="text" data-campo-texto="escola" placeholder="Escola" value="'+esc(C.aluno.escola)+'"></div><div class="linha-acoes"><button type="button" data-action="relatorio" class="btn-pri">Concluir e gerar relatório (PDF)</button></div><p class="nota">O relatório abre numa nova página; use "Salvar como PDF" na impressão. Os dados ficam só neste dispositivo.</p></div>';return h;}
function renderAba(){document.querySelectorAll('.abas [data-aba]').forEach(b=>b.classList.toggle('on',b.dataset.aba===C.aba));const f={resultados:abaResultados,formulas:abaFormulas,tabela:abaTabela,grafico:abaGrafico,comparar:abaComparar,concluir:abaConcluir}[C.aba];$('abaCorpo').innerHTML=f();if(C.aba==='grafico')desenharGrafico($('graf'),$('grafNota'));$('nMed').textContent=S().medidas.length;}

/* HUD sobre a cena */
function hud(){const s=S(),x=X();let h='';if(x.cena==='tuboU'){const {r}=vasosAtual();h='<div class="vl"><small>Desnível</small><b>'+cm(r.desnivel)+' cm</b></div><div class="vl"><small>h₂ (2º líquido)</small><b>'+cm(r.ho)+' cm</b></div><div class="vl"><small>h₁ (água)</small><b>'+cm(r.dh)+' cm</b></div>';}
 else{const din=F.DINAMOMETROS[s.p.dinamometro];const lt=F.leitura(R.T,din.res,din.max);h='<div class="vl'+(lt.saturado?' alerta':'')+'"><small>Dinamômetro</small><b>'+fmt(lt.valor)+' N</b></div><div class="vl"><small>Submerso</small><b>'+cm3(R.Vsub)+' cm³</b></div>'+(s.p.recipiente==='transbordamento'?'<div class="vl"><small>Proveta</small><b>'+ml(R.coletado)+' mL</b></div>':'<div class="vl"><small>Nível</small><b>'+cm(R.h)+' cm</b></div>')+'<div class="vl"><small>Situação</small><b style="font-size:14px">'+SITU[R.situ]+'</b></div>';
  if(C.formulas)h+='<div class="vl" style="flex-basis:100%"><small>Fórmulas agora</small><b style="font-size:14px">E = ρ·g·V<sub>sub</sub> = '+s.p.rhoL+' × '+fmt(s.p.g,2)+' × '+cm3(R.Vsub)+' cm³ = '+fmt(R.E,3)+' N · T = P − E = '+fmt(R.P,3)+' − '+fmt(R.E,3)+' = '+fmt(Math.max(0,R.Pap),3)+' N</b></div>';}
 if(C.pausado)h+='<div class="vl alerta"><small>Simulação</small><b>Pausada</b></div>';$('hud').innerHTML=h;}

/* ---------------- roteiro (guia) e relatório ---------------- */
function abrirGuia(){const x=X(),s=S();$('guiaCorpo').innerHTML='<h2>Experimento '+x.num+' · '+esc(x.nome)+'</h2><p class="nota">Bancada 04 · Hidrostática · BNCC: '+esc(C.nivel==='em'?x.bncc.em:x.bncc.ef)+'</p><h3>Objetivos</h3><ul>'+x.objetivos.map(o=>'<li>'+esc(o)+'</li>').join('')+'</ul><h3>Antes de começar, lembre</h3><ul>'+x.previos.map(o=>'<li>'+esc(o)+'</li>').join('')+'</ul><h3>Materiais</h3><ul>'+x.materiais.map(o=>'<li>'+esc(o)+'</li>').join('')+'</ul><h3>Procedimento</h3><ol>'+x.passos.map(p=>'<li>'+esc(p.t)+'</li>').join('')+'</ol><h3>Sua hipótese</h3><p>'+esc(x.hipotese.q)+'</p><div class="hip">'+x.hipotese.op.map((o,i)=>'<button type="button" data-action="hip:'+i+'" class="'+(s.hip===i?'on':'')+'">'+esc(o)+'</button>').join('')+'</div>';$('dlgGuia').showModal();}
function relatorio(){const s=S(),x=X();s.concluiu=true;salvar();const cv=document.createElement('canvas');cv.width=1000;cv.height=380;desenharGrafico(cv,null);const img=cv.toDataURL('image/png');
 const cols=x.colunas;const tab=s.medidas.length?'<table><thead><tr><th>#</th>'+cols.map(c=>'<th>'+COLS[c][0]+'</th>').join('')+'</tr></thead><tbody>'+s.medidas.map((m,i)=>'<tr><td>'+(i+1)+'</td>'+cols.map(c=>'<td>'+esc(COLS[c][1](m))+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<p>Nenhuma medição registrada.</p>';
 const acertos=x.questoes.filter((q,i)=>s.respostas[i]===q.ok).length;const data=new Date().toLocaleDateString('pt-BR');
 const html='<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório · '+esc(x.nome)+'</title><style>body{font-family:Segoe UI,Arial,sans-serif;color:#0f2c4a;margin:28px;font-size:13px}h1{margin:0;font-size:22px;color:#0f2c4a}h2{font-size:15px;color:#1a6b2a;border-bottom:2px solid #1a6b2a;padding-bottom:3px;margin-top:20px}table{border-collapse:collapse;width:100%;font-size:11.5px}th,td{border:1px solid #c9d4de;padding:4px 6px;text-align:right}th{background:#eef4f1;color:#0f2c4a}td:first-child,th:first-child{text-align:left}.cab{display:flex;justify-content:space-between;border-bottom:3px solid #0f2c4a;padding-bottom:8px}.id td{text-align:left;border:none;padding:2px 8px 2px 0}img{width:100%;border:1px solid #c9d4de;border-radius:6px}.q{margin:6px 0}.ok{color:#1a6b2a}.no{color:#a12a2a}footer{margin-top:24px;font-size:11px;color:#5a6b7a}@media print{button{display:none}}</style></head><body>'+
  '<div class="cab"><div><h1>Relatório experimental · '+esc(x.nome)+'</h1><div>Portal Lab 3D · Bancada 04 · Hidrostática · Experimento '+x.num+'</div></div><div style="text-align:right">NEWPC · Portal do Educador<br>'+data+'</div></div>'+
  '<table class="id"><tr><td><b>Aluno/grupo:</b> '+esc(C.aluno.nome||'—')+'</td><td><b>Turma:</b> '+esc(C.aluno.turma||'—')+'</td><td><b>Escola:</b> '+esc(C.aluno.escola||'—')+'</td><td><b>Nível:</b> '+(C.nivel==='em'?'Ensino Médio':'Ensino Fundamental')+'</td></tr></table>'+
  '<h2>Objetivos</h2><ul>'+x.objetivos.map(o=>'<li>'+esc(o)+'</li>').join('')+'</ul><h2>Hipótese</h2><p>'+esc(x.hipotese.q)+' <b>'+(s.hip==null?'não registrada':esc(x.hipotese.op[s.hip]))+'</b></p>'+
  '<h2>Materiais e condições</h2><p>'+esc(x.materiais.join(' · '))+'</p>'+(x.cena!=='tuboU'?'<p>Cilindro: '+esc((F.MATERIAIS[s.p.material]||{nome:'personalizado'}).nome)+', '+cm3(s.p.V)+' cm³, '+s.p.rhoO+' kg/m³ · Líquido: '+esc((F.LIQUIDOS[s.p.liquido]||{nome:'personalizado'}).nome)+' ('+s.p.rhoL+' kg/m³) · g = '+fmt(s.p.g,2)+' m/s² · '+esc(F.DINAMOMETROS[s.p.dinamometro].nome)+'</p>':'')+
  '<h2>Procedimento</h2><ol>'+x.passos.map(p=>'<li>'+esc(p.t)+'</li>').join('')+'</ol><h2>Dados coletados</h2>'+tab+'<p style="font-size:11px">Medições simuladas: valores arredondados à resolução de cada instrumento. Valores teóricos: calculados pelas leis físicas com os parâmetros escolhidos.</p>'+
  '<h2>Gráfico</h2><img src="'+img+'" alt="Gráfico do experimento"><h2>Análise</h2>'+x.questoes.map((q,i)=>'<div class="q"><b>'+(i+1)+'. '+esc(q.q)+'</b><br>Resposta: '+(s.respostas[i]==null?'não respondida':'<span class="'+(s.respostas[i]===q.ok?'ok':'no')+'">'+esc(q.op[s.respostas[i]])+'</span>')+'</div>').join('')+'<p>Acertos: <b>'+acertos+' de '+x.questoes.length+'</b></p>'+
  '<div class="q"><b>'+esc(x.aberta)+'</b><br>'+(s.aberta?esc(s.aberta).replace(/\n/g,'<br>'):'<i>sem resposta</i>')+'</div><h2>Conclusão</h2><p>'+esc(x.conclusao)+'</p><footer>Gerado pelo Portal Lab 3D (Portal do Educador · NEWPC Tecnologia). Simulação com as equações do SI; medições arredondadas à resolução dos instrumentos.</footer><p><button id="btImprimir">Imprimir / Salvar em PDF</button></p><script>document.getElementById("btImprimir").addEventListener("click",function(){print();});<\/script></body></html>';
 const w=window.open('','_blank');if(!w){alert('O navegador bloqueou a nova janela. Permita pop-ups para este site e tente de novo.');return;}w.document.open();w.document.write(html);w.document.close();setTimeout(()=>{try{w.focus();w.print();}catch(e){}},500);renderAba();assistente('Relatório gerado. Confira se o nome e a turma estão certos antes de salvar em PDF.');}
function csv(){const s=S(),x=X();const cols=x.colunas;const linhas=[['#'].concat(cols.map(c=>COLS[c][0]))].concat(s.medidas.map((m,i)=>[i+1].concat(cols.map(c=>COLS[c][1](m)))));const txt='﻿'+linhas.map(l=>l.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/csv'}));a.download='portal-lab3d-'+x.id+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}

/* ---------------- ações (delegação de eventos; nada de onclick no HTML) ---------------- */
function acao(a){const s=S(),x=X();const [k,v1,v2]=a.split(':');
 if(k==='iniciar'){reiniciar();abrirGuia();return;}
 if(k==='pausar'){C.pausado=!C.pausado;$('btPausar').textContent=C.pausado?'▶ Continuar':'❚❚ Pausar';hud();return;}
 if(k==='reiniciar'){reiniciar();assistente('Experimento reiniciado: recipiente cheio de novo, proveta vazia e cilindro no alto. As medições registradas continuam na tabela.');return;}
 if(k==='forcas'){C.forcas=!C.forcas;$('btForcas').setAttribute('aria-pressed',C.forcas);if(C.forcas&&R)assistente('Vermelho: peso (P = '+fmt(R.P)+' N). Azul: empuxo (E = '+fmt(R.E)+' N). Verde: tração no fio (T = '+fmt(R.T)+' N). Laranja: força do fundo, quando o cilindro apoia. Com o cilindro parado, T + E + N = P.');return;}
 if(k==='formulas'){C.formulas=!C.formulas;$('btFormulas').setAttribute('aria-pressed',C.formulas);C.aba=C.formulas?'formulas':C.aba;renderAba();hud();return;}
 if(k==='camera'){cameraPadrao();return;}
 if(k==='trocar'){const ks=Object.keys(F.DINAMOMETROS);s.p.dinamometro=ks[(ks.indexOf(s.p.dinamometro)+1)%ks.length];montar();painel();salvar();assistente('Equipamento trocado: '+F.DINAMOMETROS[s.p.dinamometro].nome+'. Resolução de '+fmt(F.DINAMOMETROS[s.p.dinamometro].res)+' N.');return;}
 if(k==='registrar'){if(x.cena!=='tuboU'&&!R)return;const m=medidaAtual();s.medidas.push(m);salvar();renderAba();
  const n=s.medidas.length;let msg='Medição '+n+' registrada';if(x.cena==='tuboU')msg+=': h₂ = '+cm(m.ho)+' cm e h₁ = '+cm(m.dh)+' cm.';else{msg+=': '+fmt(m.leitura)+' N no dinamômetro, '+SITU[m.situ].toLowerCase()+'.';if(m.empuxoMed!=null&&m.situ==='submerso')msg+=' Empuxo medido: '+fmt(m.empuxoMed)+' N.';if(m.situ==='fora')msg+=' Esse é o peso no ar: guarde esse valor.';}
  assistente(msg);const b=document.querySelector('.btn-reg');if(b){b.textContent='✓ Registrada';setTimeout(()=>{b.textContent='● Registrar medição';},900);}return;}
 if(k==='rec'){s.p.recipiente=v1;s.yCmd=Math.min(s.yCmd,yMax());reiniciar();painel();cameraPadrao();return;}
 if(k==='hip'){s.hip=Number(v1);salvar();abrirGuia();return;}
 if(k==='fechar-guia'){$('dlgGuia').close();assistente();return;}
 if(k==='guia'){abrirGuia();return;}
 if(k==='resp'){s.respostas[v1]=Number(v2);salvar();renderAba();return;}
 if(k==='relatorio'){relatorio();return;}
 if(k==='csv'){csv();return;}
 if(k==='apagar-ultima'){s.medidas.pop();salvar();renderAba();return;}
 if(k==='limpar-tabela'){if(confirm('Apagar todas as medições deste experimento?')){s.medidas=[];salvar();renderAba();}return;}
 if(k==='ouvir'){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(ultimaFala);u.lang='pt-BR';speechSynthesis.speak(u);}catch(e){}return;}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b){e.preventDefault();acao(b.dataset.action);return;}const t=e.target.closest('[data-aba]');if(t){C.aba=t.dataset.aba;renderAba();}});
document.addEventListener('input',e=>{const el=e.target;if(el.dataset.campo&&el.type==='range'){aoMudarCampo(el);return;}if(el.dataset.campoTexto){const k=el.dataset.campoTexto;if(k==='aberta')S().aberta=el.value;else C.aluno[k]=el.value;salvar();}});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset.campo&&el.tagName==='SELECT')aoMudarCampo(el);});
$('selExp').innerHTML=AT.experimentos.map(x=>'<option value="'+x.id+'">'+x.num+' · '+esc(x.nome)+'</option>').join('');
$('selExp').addEventListener('change',e=>{C.expId=e.target.value;salvar();trocarExperimento();});
$('selNivel').addEventListener('change',e=>{C.nivel=e.target.value;salvar();painel();renderAba();});
/* ferramenta "Trocar equipamento" entra na barra junto das outras */
(function(){const b=document.createElement('button');b.type='button';b.dataset.action='trocar';b.textContent='⇄ Trocar equipamento';b.title='Alterna entre os dinamômetros de 2 N, 5 N, 10 N e o digital';const ref=document.querySelector('[data-action="forcas"]');ref.parentNode.insertBefore(b,ref);})();

function reiniciar(){const s=S();s.yCmd=X().cena==='tuboU'?0:yMax()*.75;reiniciarSim();pAr=null;montar();painel();renderAba();}
function trocarExperimento(){const x=X();$('selExp').value=x.id;$('selNivel').value=C.nivel;document.querySelectorAll('[data-action="registrar"],[data-action="forcas"],[data-action="trocar"]').forEach(b=>{if(b.dataset.action!=='registrar')b.style.display=x.cena==='tuboU'?'none':'';});
 $('dica').textContent=x.cena==='tuboU'?'Arraste para girar · roda ou pinça para aproximar · ajuste o volume do 2º líquido no painel':'Arraste o cilindro para subir ou descer · arraste o fundo para girar · roda ou pinça para aproximar · setas ↑ ↓ movem o cilindro';
 reiniciarSim();montar();painel();cameraPadrao();C.aba='resultados';renderAba();assistente();if(S().hip==null)abrirGuia();}

/* ---------------- laço ---------------- */
let tAnt=performance.now(),acUI=0,acVig=0;
function quadro(t){const dt=Math.min(.05,(t-tAnt)/1000);tAnt=t;const s=S(),x=X();
 if(!C.pausado&&x.cena!=='tuboU'){const alvo=s.yCmd;const vmax=.12;const d=alvo-yAtual;yAtual+=Math.sign(d)*Math.min(Math.abs(d),vmax*dt);R=F.passo(s.p,sim,yAtual);sim={Vw:R.Vw,coletado:R.coletado};}
 if(x.cena!=='tuboU'&&R)atualizarCena(dt);else if(M.tubo)atualizarCena(dt);
 acUI+=dt;acVig+=dt;if(acUI>.15){acUI=0;hud();if(C.aba==='resultados'||C.aba==='formulas')renderAba();}
 if(acVig>.4){acVig=0;vigiar();const i=passoAtual();if(i!==quadro.passo){quadro.passo=i;if(!$('assMsg').querySelector('.pergunta'))assistente();}}
 renderer.render(cena,camera);requestAnimationFrame(quadro);}
redimensionar();trocarExperimento();$('carregando').classList.add('fim');requestAnimationFrame(quadro);
window.PortalLab={C,F,get R(){return R;},acao,definirY,S,X};
})();
