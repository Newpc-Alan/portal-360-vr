/* Sistema Solar VR · Céu da cidade (v9.21)
   O aluno fica no chão de uma cidade brasileira e vê o céu real daquela data e hora: estrelas e constelações (do céu real),
   Lua com a fase verdadeira, Sol e os planetas visíveis a olho nu, horizonte com pontos cardeais e o céu que clareia de dia.
   Painel "O que procurar agora" com a direção e a altura de cada objeto. Botão para passar as horas (movimento aparente,
   EF05CI11) e lista de cidades (capitais e cidades de MS).
   Astronomia: posições dos planetas pelos elementos orbitais aproximados do JPL (Standish, 1800 a 2050); Lua por fórmula
   simplificada (erro de cerca de 1 grau); hora sideral de Greenwich (IAU). Precisão suficiente para observação a olho nu.
   Funciona no 3D (arrastar olha em volta) e no óculos (o aluno olha em volta; painel e botões em 3D).
   Regra 9: controles com addEventListener, sem onclick. */
(function(){'use strict';
function pronto(fn){if(window.THREE&&window.CEU_REAL&&window.CEU_DADOS&&typeof entrarVista==='function'&&window.PortalSolarV8&&document.querySelector('.barrasup')&&typeof acaoBotaoVR==='function')fn();else setTimeout(()=>pronto(fn),100);}
pronto(()=>{
const T=THREE,RAD=Math.PI/180,EPS=23.4392911*RAD,R=1450;
/* ---------- cidades: [nome, UF, latitude, longitude, fuso UTC] ---------- */
const CIDADES=[
 ['Campo Grande','MS',-20.4697,-54.6201,-4],['Aquidauana','MS',-20.4666,-55.7868,-4],['Brasilândia','MS',-21.2544,-52.0365,-4],['Corumbá','MS',-19.0077,-57.651,-4],
 ['Dourados','MS',-22.2231,-54.812,-4],['Ponta Porã','MS',-22.5361,-55.7256,-4],['Ribas do Rio Pardo','MS',-20.4445,-53.7588,-4],['Três Lagoas','MS',-20.7849,-51.7007,-4],
 ['Aracaju','SE',-10.9472,-37.0731,-3],['Belém','PA',-1.4558,-48.4902,-3],['Belo Horizonte','MG',-19.9167,-43.9345,-3],['Boa Vista','RR',2.8235,-60.6758,-4],
 ['Brasília','DF',-15.7939,-47.8828,-3],['Cuiabá','MT',-15.6014,-56.0979,-4],['Curitiba','PR',-25.4284,-49.2733,-3],['Florianópolis','SC',-27.5954,-48.548,-3],
 ['Fortaleza','CE',-3.7319,-38.5267,-3],['Goiânia','GO',-16.6869,-49.2648,-3],['João Pessoa','PB',-7.1195,-34.845,-3],['Macapá','AP',0.0349,-51.0694,-3],
 ['Maceió','AL',-9.6658,-35.7353,-3],['Manaus','AM',-3.119,-60.0217,-4],['Natal','RN',-5.7945,-35.211,-3],['Palmas','TO',-10.2491,-48.3243,-3],
 ['Porto Alegre','RS',-30.0346,-51.2177,-3],['Porto Velho','RO',-8.7612,-63.9004,-4],['Recife','PE',-8.0476,-34.877,-3],['Rio Branco','AC',-9.9747,-67.8243,-5],
 ['Rio de Janeiro','RJ',-22.9068,-43.1729,-3],['Salvador','BA',-12.9714,-38.5014,-3],['São Luís','MA',-2.5307,-44.3068,-3],['São Paulo','SP',-23.5505,-46.6333,-3],
 ['Teresina','PI',-5.092,-42.8038,-3],['Vitória','ES',-20.3155,-40.3128,-3]];
let cidade=0;try{const c=localStorage.getItem('pde_solar_cidade');if(c!==null&&CIDADES[+c])cidade=+c;}catch(_){}
/* ---------- efemérides ---------- */
/* elementos J2000 e taxas por século: a, e, I, L, perihélio, nodo (JPL, Standish) */
const EL={
 mercurio:[[.38709927,.20563593,7.00497902,252.2503235,77.45779628,48.33076593],[.00000037,.00001906,-.00594749,149472.67411175,.16047689,-.12534081]],
 venus:[[.72333566,.00677672,3.39467605,181.9790995,131.60246718,76.67984255],[.0000039,-.00004107,-.0007889,58517.81538729,.00268329,-.27769418]],
 terra:[[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0],[.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0]],
 marte:[[1.52371034,.0933941,1.84969142,-4.55343205,-23.94362959,49.55953891],[.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343]],
 jupiter:[[5.202887,.04838624,1.30439695,34.39644051,14.72847983,100.47390909],[-.00011607,-.00013253,-.00183714,3034.74612775,.21252668,.20469106]],
 saturno:[[9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448],[-.0012506,-.00050991,.00193609,1222.49362201,-.41897216,-.28867794]]};
function helio(k,Tc){const e0=EL[k][0],r=EL[k][1],v=i=>e0[i]+r[i]*Tc;const a=v(0),e=v(1),I=v(2)*RAD,L=v(3),w_=v(4),O=v(5)*RAD;
 const w=(w_-v(5))*RAD;let M=((L-w_)%360+540)%360-180;M*=RAD;let E=M+e*Math.sin(M);for(let i=0;i<6;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
 const x1=a*(Math.cos(E)-e),y1=a*Math.sqrt(1-e*e)*Math.sin(E),cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(O),sO=Math.sin(O),cI=Math.cos(I),sI=Math.sin(I);
 return [(cw*cO-sw*sO*cI)*x1+(-sw*cO-cw*sO*cI)*y1,(cw*sO+sw*cO*cI)*x1+(-sw*sO+cw*cO*cI)*y1,sw*sI*x1+cw*sI*y1];}
function eclEq(x,y,z){return new T.Vector3(x,y*Math.cos(EPS)-z*Math.sin(EPS),y*Math.sin(EPS)+z*Math.cos(EPS));}
function lua(d){const L=(218.316+13.176396*d)*RAD,M=(134.963+13.064993*d)*RAD,F=(93.272+13.22935*d)*RAD;const lam=L+6.289*RAD*Math.sin(M),bet=5.128*RAD*Math.sin(F);
 return {v:eclEq(Math.cos(bet)*Math.cos(lam),Math.cos(bet)*Math.sin(lam),Math.sin(bet)).normalize(),lam};}
/* ---------- estado do tempo ---------- */
let ms=Date.now(),rodando=false;
function noiteDeHoje(){const tz=CIDADES[cidade][4],loc=new Date(Date.now()+tz*3600e3);const h=loc.getUTCHours();if(h>=19||h<5)return Date.now();
 return Date.UTC(loc.getUTCFullYear(),loc.getUTCMonth(),loc.getUTCDate(),20,0,0)-tz*3600e3;}
function local(){const tz=CIDADES[cidade][4],d=new Date(ms+tz*3600e3);return d;}
function rotuloHora(){const d=local(),m=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][d.getUTCMonth()];return d.getUTCDate()+' de '+m+' de '+d.getUTCFullYear()+', '+String(d.getUTCHours()).padStart(2,'0')+'h'+String(d.getUTCMinutes()).padStart(2,'0');}
/* base local (equatorial -> cena): x = Leste, y = zênite, -z = Norte */
const E_=new T.Vector3(),Z_=new T.Vector3(),N_=new T.Vector3();
function base(){const c=CIDADES[cidade],phi=c[2]*RAD;const jd=ms/86400000+2440587.5,dd=jd-2451545;const lst=((280.46061837+360.98564736629*dd+c[3])%360)*RAD;
 Z_.set(Math.cos(phi)*Math.cos(lst),Math.cos(phi)*Math.sin(lst),Math.sin(phi));const P=new T.Vector3(0,0,1);N_.copy(P).addScaledVector(Z_,-P.dot(Z_)).normalize();E_.crossVectors(N_,Z_);return dd;}
function cena(v,out){return (out||new T.Vector3()).set(v.dot(E_),v.dot(Z_),-v.dot(N_));}
/* dados do céu real estão em eclíptica (x = ponto vernal, y = polo da eclíptica, z = -(longitude 90°)): matriz para o horizonte */
function matrizCeu(){const ce=Math.cos(EPS),se=Math.sin(EPS);const Q=new T.Matrix4().set(1,0,0,0, 0,-se,-ce,0, 0,ce,-se,0, 0,0,0,1);
 const H=new T.Matrix4().set(E_.x,E_.y,E_.z,0, Z_.x,Z_.y,Z_.z,0, -N_.x,-N_.y,-N_.z,0, 0,0,0,1);return H.multiply(Q);}
const ROSA=['Norte','Nordeste','Leste','Sudeste','Sul','Sudoeste','Oeste','Noroeste'];
function onde(s){const az=(Math.atan2(s.x,-s.z)/RAD+360)%360,alt=Math.asin(Math.max(-1,Math.min(1,s.y/s.length())))/RAD;return {az,alt,dir:ROSA[Math.round(az/45)%8]};}
/* ---------- cena ---------- */
let ativo=false,modo='tela',g=null,itens={},fundo=null,chao=null,luzLua=null,vr={painel:null,botoes:[]},ultPainel='';
function tex(txt,cor,w,h,font){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.font=font;x.textAlign='center';x.textBaseline='middle';x.shadowColor='rgba(0,0,0,.95)';x.shadowBlur=10;x.fillStyle=cor;x.fillText(txt,w/2,h/2+2);const t=new T.CanvasTexture(c);t.minFilter=T.LinearMipmapLinearFilter;return t;}
/* rótulo com a largura do próprio texto; 'alt' é a altura do rótulo em unidades da cena (a 1.400 de distância, 40 ≈ 1,6°) */
function rotulo(txt,cor,alt){const f='700 64px Segoe UI,Arial',m=document.createElement('canvas').getContext('2d');m.font=f;const w=Math.ceil(m.measureText(txt).width)+40;
 const s=new T.Sprite(new T.SpriteMaterial({map:tex(txt,cor,w,96,f),transparent:true,depthWrite:false,depthTest:false}));const h=alt||40;s.scale.set(h*w/96,h,1);s.renderOrder=4;return s;}
const TEX_BRILHO=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new T.CanvasTexture(c);})();
const PLANETAS=[['mercurio','Mercúrio','#d8cfc0',13],['venus','Vênus','#fff4d8',30],['marte','Marte','#ff9a6a',17],['jupiter','Júpiter','#ffe9c8',24],['saturno','Saturno','#f2deb0',18]];
function montar(){g=new T.Group();g.name='ceuCidade';scene.add(g);itens={};
 /* céu de fundo (além das estrelas): cor pela altura do Sol, horizonte mais claro, brilho em volta do Sol no crepúsculo */
 fundo=new T.Mesh(new T.SphereGeometry(1580,48,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{sol:{value:new T.Vector3(0,-1,0)},dia:{value:0},cre:{value:0}},
  vertexShader:'varying vec3 d;void main(){d=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 sol;uniform float dia;uniform float cre;varying vec3 d;void main(){float h=clamp(d.y,0.0,1.0);vec3 noite=mix(vec3(.035,.05,.09),vec3(.008,.012,.03),h);vec3 diaC=mix(vec3(.62,.78,.95),vec3(.22,.45,.85),pow(h,.6));float s=max(dot(d,normalize(sol)),0.0);vec3 c=mix(noite,diaC,dia);c+=vec3(1.0,.5,.2)*cre*pow(s,6.0)*(1.0-h)*.9;c+=vec3(1.0,.95,.8)*dia*pow(s,200.0);gl_FragColor=vec4(c,1.0);}'}));
 fundo.renderOrder=-20;fundo.frustumCulled=false;g.add(fundo);
 /* chão: meia esfera abaixo do horizonte (esconde o que está abaixo dele), mais clara junto ao horizonte */
 const gg=new T.SphereGeometry(1400,64,16,0,Math.PI*2,Math.PI/2,Math.PI/2),cols=[],p=gg.attributes.position;for(let i=0;i<p.count;i++){const y=-p.getY(i)/1400,k=Math.max(0,1-y*6);cols.push(.004+.012*k,.008+.016*k,.006+.01*k);}
 gg.setAttribute('color',new T.Float32BufferAttribute(cols,3));chao=new T.Mesh(gg,new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide}));chao.frustumCulled=false;g.add(chao);
 const anel=new T.Mesh(new T.RingGeometry(1395,1402,128),new T.MeshBasicMaterial({color:0x4d8a6a,side:T.DoubleSide,transparent:true,opacity:.6}));anel.rotation.x=-Math.PI/2;anel.position.y=-1;g.add(anel);
 ['N','NE','L','SE','S','SO','O','NO'].forEach((t,i)=>{const a=i*45*RAD,s=rotulo(t,i%2?'#9fc9b0':'#e9fff2',i%2?120:170);s.position.set(Math.sin(a)*1380,i%2?30:42,-Math.cos(a)*1380);g.add(s);});
 /* Sol, Lua (ampliada 3x, fase real) e planetas a olho nu */
 const sol=new T.Sprite(new T.SpriteMaterial({map:TEX_BRILHO,color:0xfff3c0,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));sol.scale.set(110,110,1);g.add(sol);itens.sol={s:sol,l:rotulo('Sol','#ffe08a')};g.add(itens.sol.l);
 const lm=(typeof esfera==='function')?esfera(1,0xcfd3d8,false,'lua'):new T.Mesh(new T.SphereGeometry(1,32,16),new T.MeshStandardMaterial({color:0xcfd3d8}));lm.userData.corpoKey=null;lm.userData.vrInterativo=false;lm.scale.setScalar(19);g.add(lm);
 luzLua=new T.DirectionalLight(0xffffff,1.6);g.add(luzLua);g.add(luzLua.target);luzLua.target=lm;itens.lua={s:lm,l:rotulo('Lua','#e8eef7')};g.add(itens.lua.l);
 PLANETAS.forEach(([k,n,cor,tam])=>{const s=new T.Sprite(new T.SpriteMaterial({map:TEX_BRILHO,color:new T.Color(cor),transparent:true,depthWrite:false}));s.scale.set(tam,tam,1);s.renderOrder=3;g.add(s);const l=rotulo(n,cor,38);g.add(l);itens[k]={s,l,n};});}
function desmontar(){if(g){scene.remove(g);g.traverse(o=>{if(o.geometry&&o.geometry!==undefined&&o.userData.corpoKey===undefined)o.geometry.dispose();if(o.material&&o.material.map&&o.material.map!==TEX_BRILHO&&o.isSprite)o.material.map.dispose();});}g=null;itens={};limparVR();}
/* opacidade do céu real (estrelas, linhas, nomes, Via Láctea) conforme a claridade */
function brilhoCeu(f){CEU_REAL.grupo.traverse(o=>{const m=o.material;if(!m||!m.isMaterial)return;if(m.uniforms&&m.uniforms.forca){if(m.userData.f0===undefined)m.userData.f0=m.uniforms.forca.value;m.uniforms.forca.value=m.userData.f0*f;return;}if(m.userData.op0===undefined)m.userData.op0=m.opacity;m.opacity=m.userData.op0*f;m.transparent=true;});}
function restaurarCeu(){CEU_REAL.grupo.traverse(o=>{const m=o.material;if(!m||!m.isMaterial)return;if(m.uniforms&&m.uniforms.forca&&m.userData.f0!==undefined)m.uniforms.forca.value=m.userData.f0;else if(m.userData.op0!==undefined)m.opacity=m.userData.op0;});
 CEU_REAL.grupo.matrixAutoUpdate=true;CEU_REAL.grupo.position.set(0,0,0);CEU_REAL.grupo.rotation.set(0,0,0);CEU_REAL.grupo.scale.set(1,1,1);CEU_REAL.grupo.updateMatrix();}
let lista=[];
function atualizar(){const dd=base(),Tc=dd/36525;
 const M=matrizCeu();CEU_REAL.grupo.matrixAutoUpdate=false;CEU_REAL.grupo.matrix.copy(M);CEU_REAL.grupo.matrixWorldNeedsUpdate=true;
 const t=helio('terra',Tc),solEq=eclEq(-t[0],-t[1],-t[2]).normalize(),sv=cena(solEq),so=onde(sv);
 const dia=Math.max(0,Math.min(1,(sv.y+.1)/.25)),noite=Math.max(0,Math.min(1,(-sv.y-.05)/.16)),cre=Math.max(0,1-Math.abs(sv.y+.05)/.15);
 fundo.material.uniforms.sol.value.copy(sv);fundo.material.uniforms.dia.value=dia;chao.material.color.setRGB(1+dia*7,1+dia*8,1+dia*5);fundo.material.uniforms.cre.value=cre;brilhoCeu(Math.max(.05,noite));
 itens.sol.s.position.copy(sv).multiplyScalar(R);itens.sol.l.position.copy(itens.sol.s.position).add(new T.Vector3(0,70,0));itens.sol.s.visible=itens.sol.l.visible=so.alt>-1;
 const L=lua(dd),lv=cena(L.v),lo=onde(lv);itens.lua.s.position.copy(lv).multiplyScalar(R*.98);itens.lua.l.position.copy(itens.lua.s.position).add(new T.Vector3(0,42,0));itens.lua.s.visible=itens.lua.l.visible=lo.alt>-1;
 luzLua.position.copy(itens.lua.s.position).addScaledVector(sv,3000);
 const elong=Math.acos(Math.max(-1,Math.min(1,L.v.dot(solEq)))),frac=(1-Math.cos(elong))/2,sl=Math.atan2(solEq.y*Math.cos(EPS)+solEq.z*Math.sin(EPS),solEq.x);
 const cres=((L.lam-sl)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)<Math.PI;const fase=frac<.04?'Lua Nova':frac>.96?'Lua Cheia':frac<.45?(cres?'Lua crescente':'Lua minguante'):frac>.55?(cres?'Lua crescente quase cheia':'Lua minguante, ainda bem iluminada'):(cres?'Quarto crescente':'Quarto minguante');
 lista=[];if(lo.alt>2)lista.push({n:'Lua',t:fase+' ('+Math.round(frac*100)+'% iluminada)',o:lo});
 for(const [k,n] of PLANETAS){const p=helio(k,Tc),gv=eclEq(p[0]-t[0],p[1]-t[1],p[2]-t[2]).normalize(),c=cena(gv),o=onde(c),it=itens[k];it.s.position.copy(c).multiplyScalar(R);it.l.position.copy(it.s.position).add(new T.Vector3(0,34,0));
  const vis=o.alt>-1&&(dia<.6||k==='venus');it.s.visible=it.l.visible=vis;if(o.alt>5&&dia<.35){const ang=Math.acos(Math.max(-1,Math.min(1,gv.dot(solEq))))/RAD;if(ang>12)lista.push({n,t:'planeta (brilha sem piscar)',o});}}
 const D=CEU_DADOS;for(const [id,n,dica] of [['Cru','Cruzeiro do Sul','aponta para o polo sul celeste'],['Ori','Órion','procure as Três Marias'],['Sco','Escorpião','a estrela vermelha Antares'],['UMa','Ursa Maior','visível baixa no norte do Brasil']]){
  const c=D.constelacoes.find(x=>x.id===id);if(!c)continue;const v=new T.Vector3(...c.c).applyMatrix4(M);const o=onde(v);if(o.alt>8&&noite>.5)lista.push({n,t:dica,o});}
 itens.sol.info={alt:so.alt,dir:so.dir};
 const S=painelTexto();if(modo==='tela')painelHTML(S);else if(S.chave!==ultPainel){ultPainel=S.chave;painelVR(S);}}
function painelTexto(){const c=CIDADES[cidade],so=itens.sol.info;let ceu=so.alt>0?'Dia: o Sol está a '+Math.round(so.alt)+'° de altura, a '+so.dir+'.':so.alt>-12?'Crepúsculo: o Sol se pôs ou vai nascer ('+so.dir+').':'Noite.';
 const linhas=lista.sort((a,b)=>b.o.alt-a.o.alt).slice(0,6).map(x=>({n:x.n,t:x.t,o:x.o.dir+', '+Math.round(x.o.alt)+'° de altura'}));
 return {tit:c[0]+' ('+c[1]+') · '+rotuloHora(),ceu,linhas,chave:cidade+'|'+rotuloHora()+'|'+linhas.map(l=>l.n+l.o).join(';')};}
/* ---------- interface do 3D ---------- */
const css=document.createElement('style');css.textContent=`
#cidPainel{position:absolute;right:12px;top:12px;width:min(390px,calc(100% - 24px));max-height:calc(100% - 24px);overflow:auto;background:rgba(6,18,34,.92);border:1px solid #2c5b7a;border-radius:14px;padding:12px 14px;color:#e8f2ff;font:14px/1.45 'Segoe UI',Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45)}
#cidPainel .topo{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#cidPainel h3{margin:0;font-size:16px;color:#8fe0b4;flex:1;min-width:220px}
#cidPainel select{background:#0d2a40;color:#e8f2ff;border:1px solid #2f6b8f;border-radius:8px;padding:5px 8px;font:600 13px 'Segoe UI',Arial}
#cidPainel .bts{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
#cidPainel button{border:1px solid #2f6b8f;background:#0d2a40;color:#cfe6ff;border-radius:8px;padding:5px 10px;font:600 12.5px 'Segoe UI',Arial;cursor:pointer}
#cidPainel button.on{background:#1a6b2a;border-color:#3fae5a;color:#fff}#cidPainel button.sair{background:#5a2222;border-color:#8a3a3a;color:#fff;margin-left:auto}
#cidPainel .ceu{margin:8px 0 4px;color:#bfe6f2;font-size:13px}
#cidPainel ul{margin:0;padding-left:18px}#cidPainel li{break-inside:avoid;margin:2px 0;font-size:13px}#cidPainel li b{color:#ffe9a8}
#cidPainel .nota{font-size:11.5px;opacity:.7;margin-top:6px}
#cidPainel.min .bts,#cidPainel.min .ceu,#cidPainel.min ul,#cidPainel.min .nota,#cidPainel.min select{display:none}#cidPainel .rec{margin-left:auto;padding:2px 9px}#cidPainel h3{font-size:15px}`;document.head.appendChild(css);
const palco=document.querySelector('.palco');const painel=document.createElement('div');painel.id='cidPainel';painel.hidden=true;palco.appendChild(painel);
painel.innerHTML='<div class="topo"><h3 id="cidTit"></h3><button data-cid="recolher" class="rec" title="Recolher ou abrir o painel">–</button><select id="cidSel" aria-label="Cidade"></select></div><div class="bts"><button data-cid="-1440">« dia</button><button data-cid="-60">‹ 1 hora</button><button data-cid="noite">Hoje à noite</button><button data-cid="agora">Agora</button><button data-cid="60">1 hora ›</button><button data-cid="1440">dia »</button><button data-cid="rodar" id="cidRodar">▶ Passar as horas</button><button data-cid="sair" class="sair">✕ Sair</button></div><div class="ceu" id="cidCeu"></div><ul id="cidLista"></ul><div class="nota">Arraste para olhar em volta. A Lua aparece 3 vezes maior que o real para facilitar a observação; planetas são pontos, como a olho nu.</div>';
const sel=painel.querySelector('#cidSel');CIDADES.forEach((c,i)=>{const o=document.createElement('option');o.value=i;o.textContent=c[0]+' ('+c[1]+')';sel.appendChild(o);});sel.value=cidade;
sel.addEventListener('change',()=>{cidade=+sel.value;try{localStorage.setItem('pde_solar_cidade',String(cidade));}catch(_){}if(ativo)atualizar();});
painel.addEventListener('click',e=>{const b=e.target.closest('[data-cid]');if(b)acao(b.dataset.cid);});
function painelHTML(S){painel.querySelector('#cidTit').textContent='🌃 Céu de '+S.tit;painel.querySelector('#cidCeu').textContent=S.ceu+(S.linhas.length?' O que procurar agora:':' Nada de destaque acima do horizonte neste momento: avance as horas.');
 painel.querySelector('#cidLista').innerHTML=S.linhas.map(l=>'<li><b>'+l.n+'</b>: '+l.o+' · '+l.t+'</li>').join('');painel.querySelector('#cidRodar').classList.toggle('on',rodando);painel.querySelector('#cidRodar').textContent=rodando?'⏸ Pausar':'▶ Passar as horas';}
function acao(a){if(a==='sair'){sair();return;}if(a==='recolher'){const m=painel.classList.toggle('min');painel.querySelector('.rec').textContent=m?'+':'–';return;}if(a==='rodar')rodando=!rodando;else if(a==='agora'){rodando=false;ms=Date.now();}else if(a==='noite'){rodando=false;ms=noiteDeHoje();}
 else if(a==='cid+'||a==='cid-'){cidade=(cidade+(a==='cid+'?1:CIDADES.length-1))%CIDADES.length;sel.value=cidade;try{localStorage.setItem('pde_solar_cidade',String(cidade));}catch(_){}}
 else{rodando=false;ms+=Number(a)*60000;}if(ativo)atualizar();}
/* botões de entrada: barra de vistas, menu da Imersão e menu do óculos (view:cidade) */
const barra=document.querySelector('.barrasup');const btn=document.createElement('button');btn.className='btn';btn.id='btnCidade';btn.textContent='🌃 Céu da cidade';
const ref=document.getElementById('btnEscala')||barra.querySelector('[data-v="desafio"]');if(ref&&ref.nextSibling)barra.insertBefore(btn,ref.nextSibling);else barra.appendChild(btn);
btn.addEventListener('click',()=>{if(ativo)sair();else entrar();});
/* abrir a Escala real (barra ou menu da Imersão) fecha o Céu da cidade antes */
['btnEscala','btnEscalaIm'].forEach(id=>{const b=document.getElementById(id);if(b)b.addEventListener('click',()=>{if(ativo)sair(false);},true);});
const imMenu=document.getElementById('imMenu');let btnIm=null;if(imMenu){btnIm=document.createElement('button');btnIm.textContent='🌃 Céu da cidade';imMenu.insertBefore(btnIm,imMenu.firstChild);btnIm.addEventListener('click',()=>{if(ativo)sair();else entrar();});}
/* ---------- óculos: painel e botões 3D ---------- */
function limparVR(){if(vr.painel){if(vr.painel.parent)vr.painel.parent.remove(vr.painel);vr.painel.material.map.dispose();vr.painel=null;}for(const b of vr.botoes){const k=vrBotoes.indexOf(b);if(k>=0)vrBotoes.splice(k,1);if(b.parent)b.parent.remove(b);b.material.map.dispose();}vr.botoes=[];ultPainel='';}
let ancora=null;
function ancorar(){const p=new T.Vector3(),q=new T.Quaternion();let cam=camera;try{if(renderer.xr.isPresenting)cam=renderer.xr.getCamera(camera);}catch(_){}cam.getWorldPosition(p);cam.getWorldQuaternion(q);const f=new T.Vector3(0,0,-1).applyQuaternion(q);f.y=0;if(f.lengthSq()<.01)f.set(0,0,-1);f.normalize();ancora={p,f,r:new T.Vector3(-f.z,0,f.x)};}
function emAncora(x,y,z){return ancora.p.clone().addScaledVector(ancora.r,x).addScaledVector(ancora.f,z).add(new T.Vector3(0,y,0));}
function painelVR(S){if(!ancora)ancorar();if(vr.painel){scene.remove(vr.painel);vr.painel.material.map.dispose();}
 vr.painel=textoCanvasVR(1024,560,(gx,c)=>{gx.fillStyle='rgba(5,19,34,.92)';gx.beginPath();gx.roundRect(0,0,c.width,c.height,30);gx.fill();gx.strokeStyle='#37b1da';gx.lineWidth=5;gx.stroke();
  gx.fillStyle='#8fe0b4';gx.font='700 40px Segoe UI,Arial';gx.fillText('Céu de '+S.tit,30,58);gx.fillStyle='#bfe6f2';gx.font='500 30px Segoe UI,Arial';let y=104;for(const l of quebrarLinhas(gx,S.ceu,c.width-60).slice(0,2)){gx.fillText(l,30,y);y+=38;}
  y+=6;for(const l of S.linhas.slice(0,6)){gx.fillStyle='#ffe9a8';gx.font='700 30px Segoe UI,Arial';gx.fillText(l.n,30,y);const w=gx.measureText(l.n+'  ').width;gx.fillStyle='#e4f3ff';gx.font='500 28px Segoe UI,Arial';gx.fillText(l.o,30+w,y);y+=46;}
  if(!S.linhas.length){gx.fillStyle='#e4f3ff';gx.fillText('Nada de destaque acima do horizonte: avance as horas.',30,y);}});
 vr.painel.scale.set(1.0,.55,1);vr.painel.position.copy(emAncora(0,-.42,1.25));scene.add(vr.painel);
 if(!vr.botoes.length){[['‹ 1 hora','cid:-60',-.48,-.80],['Hoje à noite','cid:noite',0,-.80],['1 hora ›','cid:60',.48,-.80],['‹ cidade','cid:cid-',-.48,-.92],[rodando?'⏸ Pausar':'▶ Passar as horas','cid:rodar',0,-.92],['cidade ›','cid:cid+',.48,-.92],['✕ Sair','cid:sair',0,-1.04]].forEach(([t,a,x,y])=>{
  const b=criarBotaoVR(t,a,a==='cid:sair'?'rgba(120,26,26,.96)':a==='cid:rodar'?'rgba(26,107,42,.96)':null);b.scale.set(.42,.105,1);b.position.copy(emAncora(x,y,1.22));scene.add(b);vr.botoes.push(b);});}}
function esconderXR(){const S=PortalSolarV8.state;[S.xrPanel,S.xrCaption,S.xrFocus].concat(S.ctxBtns||[],S.inspections||[]).forEach(o=>{if(o)o.visible=false;});if(S.xrLabels)S.xrLabels.forEach(l=>{if(l.sp)l.sp.visible=false;});}
/* ---------- entrar e sair ---------- */
let fovAntes=45;
function entrar(){if(window.SOLAR_ESCALA&&SOLAR_ESCALA.estado().ativo)SOLAR_ESCALA.sair(false);if(estado.vista!=='sistema')entrarVista('sistema');if(typeof narrParar==='function')narrParar();
 const S=PortalSolarV8.state;if(S.desktopFocus){const d=S.desktopFocus;if(d.parent)d.parent.remove(d);S.desktopFocus=null;S.desktopFocusKey=null;document.body.classList.remove('v8-system-focus');}
 modo=estado.vr?'vr':'tela';ativo=true;root.visible=false;ms=noiteDeHoje();rodando=false;montar();btn.classList.add('on');if(btnIm)btnIm.textContent='✕ Sair do céu da cidade';
 if(modo==='tela'){document.getElementById('labels').style.visibility='hidden';painel.hidden=false;{const gt=document.getElementById('grpTempo');if(gt)gt.style.display='none';}document.querySelectorAll('.barrasup [data-v]').forEach(b=>b.classList.remove('on'));
  const bd=document.getElementById('badge');if(bd)bd.textContent='Céu da cidade';const dc=document.getElementById('dica');if(dc)dc.style.visibility='hidden';
  fovAntes=camera.fov;camera.fov=75;camera.updateProjectionMatrix();camAzim=Math.PI;camElev=.22;atualizarCamera();}
 else{ancora=null;ancorar();if(S.menuVR&&PortalSolarV8.menuVRAlternar)PortalSolarV8.menuVRAlternar();esconderXR();}
 atualizar();if(typeof atualizarBncc==='function')atualizarBncc();}
function sair(volta){if(!ativo)return;ativo=false;rodando=false;desmontar();restaurarCeu();root.visible=!(window.SOLAR_ESCALA&&SOLAR_ESCALA.estado().ativo);painel.hidden=true;btn.classList.remove('on');if(btnIm)btnIm.textContent='🌃 Céu da cidade';
 document.getElementById('labels').style.visibility='';const dc=document.getElementById('dica');if(dc)dc.style.visibility='';try{mostrarGrupos();}catch(_){}
 if(modo==='tela'){camera.fov=fovAntes;camera.updateProjectionMatrix();}
 if(volta!==false)entrarVista('sistema');else if(typeof atualizarBncc==='function')atualizarBncc();}
/* câmera do 3D em primeira pessoa (no chão, olhando em volta): arrastar "puxa" o céu */
const camAntes=atualizarCamera;
atualizarCamera=function(){if(!(ativo&&modo==='tela')||estado.vr)return camAntes.apply(this,arguments);camera.position.set(0,0,0);
 const el=camElev,az=camAzim;camera.lookAt(Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el));};
const vistaAntes=entrarVista;entrarVista=function(v){if(v==='cidade'){entrar();return;}if(ativo)sair(false);return vistaAntes.apply(this,arguments);};
const acaoAntesVR=acaoBotaoVR;acaoBotaoVR=function(a){if(a==='view:cidade'){entrar();return;}if(a==='view:escala'&&ativo)sair(false);if(a&&a.startsWith('cid:')){acao(a.slice(4));if(ativo&&modo==='vr'){limparVR();atualizar();}return;}return acaoAntesVR.apply(this,arguments);};
/* durante Céu da cidade e Escala real, cliques e gatilhos não selecionam os planetas escondidos da maquete */
const modoEspecial=()=>ativo||(window.SOLAR_ESCALA&&SOLAR_ESCALA.estado().ativo);
canvas3d.addEventListener('click',e=>{if(modoEspecial())e.stopImmediatePropagation();},true);
canvas3d.addEventListener('touchend',e=>{if(modoEspecial())e.stopImmediatePropagation();},true);
if(typeof tratarSelecaoVR==='function'){const selAntes=tratarSelecaoVR;tratarSelecaoVR=function(ctrl){if(modoEspecial()){const b=raycastBotoesVR(ctrl);if(b)acaoBotaoVR(b.userData.vrBotao);return;}return selAntes.apply(this,arguments);};}
if(typeof bnccVista==='function'&&typeof B!=='undefined'){const bAntes=bnccVista;bnccVista=function(){if(ativo&&B.ceu)return[B.ceu,B.rot];return bAntes.apply(this,arguments);};}
let ult=performance.now(),acum=0;const labelsAntes=atualizarLabels;
atualizarLabels=function(){const t=performance.now(),dt=Math.min(.05,(t-ult)/1000);ult=t;
 if(ativo){if(window.SOLAR_ESCALA&&SOLAR_ESCALA.estado().ativo)sair(false);else if((modo==='vr')!==!!estado.vr)sair();else{if(modo==='vr')esconderXR();if(rodando){ms+=dt*90*60000;acum+=dt;}if(rodando&&acum>.12){acum=0;atualizar();}else if(!rodando&&acum>0){acum=0;}}}
 return labelsAntes.apply(this,arguments);};
window.SOLAR_CIDADE={entrar,sair,acao,estado:()=>({ativo,modo,cidade:CIDADES[cidade][0],hora:rotuloHora(),lista:lista.map(l=>l.n+' '+l.o.dir+' '+Math.round(l.o.alt))})};
});
})();
