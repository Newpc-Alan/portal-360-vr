/* Sistema Solar VR · Céu real (v9.11)
   Troca o fundo de estrelas sorteadas pelo céu de verdade: as 5 mil estrelas visíveis a olho nu (magnitude até 6), cada uma
   na sua posição e com a sua cor, as linhas e os nomes das 88 constelações e a faixa da Via Láctea.
   O céu está no plano da eclíptica, o mesmo das órbitas: as constelações do zodíaco ficam alinhadas com os planetas, e da
   Terra a linha até o Sol aponta para a constelação em que o Sol está naquela data.
   Dados: d3-celestial (Olaf Frohn, licença BSD-3), a partir do catálogo Hipparcos/XHIP, das linhas da IAU e do contorno da
   Via Láctea de J. R. Vieira; convertidos para coordenadas eclípticas J2000 pela NEWPC (ceu-dados.js).
   Regra 9: controles com addEventListener, sem onclick. */
(function(){'use strict';
function pronto(fn){if(window.THREE&&window.CEU_DADOS&&typeof scene!=='undefined'&&scene&&typeof renderer!=='undefined'&&renderer)fn();else setTimeout(()=>pronto(fn),60);}
pronto(()=>{
const T=THREE,D=window.CEU_DADOS,R=1500;
const ZODIACO=new Set(['Ari','Tau','Gem','Cnc','Leo','Vir','Lib','Sco','Sgr','Cap','Aqr','Psc']);
let mostrarConst=true;try{mostrarConst=localStorage.getItem('pde_solar_constelacoes')!=='0';}catch(_){}
/* ponto redondo e suave (sem isso as estrelas viram quadradinhos) */
function texPonto(suave){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);
 if(suave){g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');}else{g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.9)');g.addColorStop(.6,'rgba(255,255,255,.25)');g.addColorStop(1,'rgba(255,255,255,0)');}
 x.fillStyle=g;x.fillRect(0,0,64,64);const t=new T.CanvasTexture(c);return t;}
const TEX_EST=texPonto(false),TEX_SUAVE=texPonto(true);
const grupo=new T.Group();grupo.name='ceuReal';grupo.material={opacity:1};/* o laço do v8 ajusta starfield.material.opacity */
/* estrelas em faixas de brilho: as mais brilhantes maiores (o tamanho é em pixels, igual de perto ou de longe) */
const FAIXAS=[[-2,.5,6.5],[.5,1.5,5],[1.5,2.5,3.8],[2.5,3.5,2.9],[3.5,4.5,2.2],[4.5,9,1.6]];
const materiaisEstrela=[];
FAIXAS.forEach(([m0,m1,px])=>{const lista=D.estrelas.filter(e=>e[3]>=m0&&e[3]<m1);if(!lista.length)return;
 const pos=new Float32Array(lista.length*3),cor=new Float32Array(lista.length*3);
 lista.forEach((e,i)=>{pos[i*3]=e[0]*R;pos[i*3+1]=e[1]*R;pos[i*3+2]=e[2]*R;const c=new T.Color('#'+e[4]);const k=Math.max(.32,Math.min(1,Math.pow(10,-.4*(e[3]-1.2))*1.0+.25));cor[i*3]=c.r*k;cor[i*3+1]=c.g*k;cor[i*3+2]=c.b*k;});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(cor,3));
 const m=new T.PointsMaterial({size:px,sizeAttenuation:false,vertexColors:true,map:TEX_EST,transparent:true,depthWrite:false,alphaTest:.02});m.userData.px=px;materiaisEstrela.push(m);
 const p=new T.Points(g,m);p.frustumCulled=false;p.renderOrder=-5;grupo.add(p);});
/* Via Láctea: mapa pré-calculado (1024 x 512, em coordenadas eclípticas) a partir dos contornos reais preenchidos e
   suavizados. Um shader lê o mapa pela direção do olhar, sem depender das coordenadas UV da esfera */
{const t=new T.TextureLoader().load(D.viaImg);t.minFilter=T.LinearFilter;t.wrapS=T.RepeatWrapping;
 const m=new T.ShaderMaterial({uniforms:{mapa:{value:t},forca:{value:.24}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.BackSide,
  vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform sampler2D mapa;uniform float forca;varying vec3 vD;void main(){vec3 d=normalize(vD);float lam=atan(-d.z,d.x);float bet=asin(clamp(d.y,-1.0,1.0));vec2 uv=vec2((lam+3.14159265)/6.2831853,0.5+bet/3.14159265);float a=texture2D(mapa,uv).r;gl_FragColor=vec4(vec3(0.78,0.83,1.0)*a*forca,1.0);}'});
 const esf=new T.Mesh(new T.SphereGeometry(R*1.03,64,32),m);esf.frustumCulled=false;esf.renderOrder=-7;esf.name='viaLactea';grupo.add(esf);}
/* constelações: linhas finas e nomes (zodíaco em dourado, Cruzeiro do Sul em destaque) */
const constGrupo=new T.Group();constGrupo.name='constelacoes';grupo.add(constGrupo);
{const pts=[];D.constelacoes.forEach(c=>c.l.forEach(linha=>{for(let i=0;i<linha.length-1;i++){const a=linha[i],b=linha[i+1];pts.push(a[0]*R*.995,a[1]*R*.995,a[2]*R*.995,b[0]*R*.995,b[1]*R*.995,b[2]*R*.995);}}));
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(pts),3));
 const l=new T.LineSegments(g,new T.LineBasicMaterial({color:0x6f9fe0,transparent:true,opacity:.32,depthWrite:false}));l.frustumCulled=false;l.renderOrder=-4;constGrupo.add(l);}
function rotulo(txt,cor){const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.font='600 44px Segoe UI,Arial';x.textAlign='center';x.textBaseline='middle';x.shadowColor='rgba(0,0,0,.9)';x.shadowBlur=8;x.fillStyle=cor;x.fillText(txt,256,50);
 const t=new T.CanvasTexture(c);t.minFilter=T.LinearMipmapLinearFilter;const s=new T.Sprite(new T.SpriteMaterial({map:t,transparent:true,depthWrite:false,opacity:.85}));s.scale.set(300,56,1);s.renderOrder=-3;return s;}
D.constelacoes.forEach(c=>{if(c.r>2&&!ZODIACO.has(c.id)&&c.id!=='Cru')return;const cor=c.id==='Cru'?'#ffe9a8':ZODIACO.has(c.id)?'#e9c46a':'#9fc3ee';const s=rotulo(c.n,cor);s.position.set(c.c[0]*R*.97,c.c[1]*R*.97,c.c[2]*R*.97);if(c.id==='Cru')s.scale.multiplyScalar(1.25);constGrupo.add(s);});
constGrupo.visible=mostrarConst;
/* troca o fundo antigo pelo céu real */
try{if(starfield&&starfield.parent)starfield.parent.remove(starfield);}catch(_){}
scene.add(grupo);try{starfield=grupo;}catch(_){}
/* no óculos a tela tem mais pixels: estrelas um pouco maiores para não sumirem */
let xrAntes=null;(function ajustar(){const xr=!!(renderer.xr&&renderer.xr.isPresenting);if(xr!==xrAntes){xrAntes=xr;materiaisEstrela.forEach(m=>{m.size=m.userData.px*(xr?1.7:1);});}setTimeout(ajustar,500);})();
/* liga e desliga as constelações (painel Exibir) */
function montar(){const g=document.getElementById('grpExibir');if(!g||document.getElementById('tgConst'))return;const tg=g.querySelector('.toggles')||g;
 const lab=document.createElement('label');lab.className='chk';lab.innerHTML='<input type="checkbox" id="tgConst"'+(mostrarConst?' checked':'')+'> Constelações (céu real)';tg.appendChild(lab);
 document.getElementById('tgConst').addEventListener('change',e=>{mostrarConst=e.target.checked;constGrupo.visible=mostrarConst;try{localStorage.setItem('pde_solar_constelacoes',mostrarConst?'1':'0');}catch(_){}});}
montar();
window.CEU_REAL={grupo,constGrupo,R};
});
})();
