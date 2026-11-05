/* Química VR · modelos (v1.0)
   Tudo gerado no navegador, sem arquivos externos: a tabela periódica em 3D (uma textura-atlas para as 118 faces),
   o átomo no modelo de camadas (Bohr), a bancada do teste de chama com bico de Bunsen, alça, ácido e sete sais,
   as chamas coloridas (cones aditivos com cintilação) e o átomo de sódio gigante da viagem.
   Cada peça clicável leva userData.hit = {type:'inspect', key}. Mesma API da Célula 3D VR. */
(function(){'use strict';
const T=THREE,D=window.QUIMICA_DATA,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);const API={modoVR:false};
let ENV=null;
function env(){if(ENV)return ENV;const W=128;const face=(topo,baixo,caixa)=>{const c=document.createElement('canvas');c.width=c.height=W;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,W);g.addColorStop(0,topo);g.addColorStop(.55,'#4c5866');g.addColorStop(1,baixo);x.fillStyle=g;x.fillRect(0,0,W,W);if(caixa){x.filter='blur(6px)';x.fillStyle=caixa;x.fillRect(W*.22,W*.12,W*.56,W*.4);x.filter='none';}return c;};
 const lado=face('#cfd8e6','#1e2430'),luz=face('#eef3fa','#1e2430','#ffffff');const cima=document.createElement('canvas');cima.width=cima.height=W;const cx=cima.getContext('2d');const rg=cx.createRadialGradient(W/2,W/2,4,W/2,W/2,W*.7);rg.addColorStop(0,'#ffffff');rg.addColorStop(1,'#a8b6c8');cx.fillStyle=rg;cx.fillRect(0,0,W,W);const baixo=document.createElement('canvas');baixo.width=baixo.height=W;const bx=baixo.getContext('2d');bx.fillStyle='#1a1e26';bx.fillRect(0,0,W,W);
 ENV=new T.CubeTexture([luz,lado,cima,baixo,lado,luz]);ENV.encoding=T.sRGBEncoding;ENV.needsUpdate=true;return ENV;}
const mat=(color,extra={})=>new T.MeshStandardMaterial(Object.assign({color,roughness:.55,metalness:0,envMap:env(),envMapIntensity:.45},extra));
function tag(o,data){o.traverse(x=>{if(x.isMesh)x.userData.hit=data;});o.userData.hit=data;return o;}
const ins=k=>({type:'inspect',key:k});
function ball(r,color,pos,extra,seg=24){const m=new T.Mesh(new T.SphereGeometry(r,seg,Math.max(10,seg*.7|0)),mat(color,extra));if(pos)m.position.copy(pos);return m;}
function label(text,color='#e7f6ff',width=1.5,size=56){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.font='600 '+size+'px Segoe UI,Arial';while(ctx.measureText(text).width>490&&size>17){size-=2;ctx.font='600 '+size+'px Segoe UI,Arial';}ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#031220';ctx.shadowBlur=7;ctx.fillStyle=color;ctx.fillText(text,256,64);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.minFilter=T.LinearMipmapLinearFilter;tx.generateMipmaps=true;tx.anisotropy=8;const sp=new T.Sprite(new T.SpriteMaterial({toneMapped:false,map:tx,transparent:true,depthWrite:false,depthTest:true}));sp.scale.set(width,width/4,1);return sp;}
function textAt(g,text,x,y,z=0,width=1.5,color){const sp=label(text,color,width);sp.position.set(x,y,z);g.add(sp);return sp;}
function rotuloFixo(text,color='#e7f6ff',width=1.5,size=56){const sp=label(text,color,width,size);const m=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:sp.material.map,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false}));sp.material.dispose();return m;}
function textFixo(g,text,x,y,z=0,width=1.5,color){const m=rotuloFixo(text,color,width);m.position.set(x,y,z);g.add(m);return m;}
const COR=f=>new T.Color(D.FAMILIAS[f].cor);
/* brilho radial reaproveitado por elétrons, fótons e chamas */
let GLOW=null;function glowTex(){if(GLOW)return GLOW;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);GLOW=new T.CanvasTexture(c);return GLOW;}
function brilho(cor,tam){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:cor,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));s.scale.set(tam,tam,1);s.userData.semEnquadre=true;return s;}

/* ---------- tabela periódica ---------- */
const CEL=112,ATL=2048;let ATLAS=null;
const celAtlas=z=>{const i=z-1;return [i%18,Math.floor(i/18)];};
function atlas(){if(ATLAS)return ATLAS;const c=document.createElement('canvas');c.width=c.height=ATL;const x=c.getContext('2d');
 for(let z=1;z<=118;z++){const e=D.EL[z],[ci,cj]=celAtlas(z),ox=ci*CEL,oy=cj*CEL;const F=D.FAMILIAS[e.fam];
  const g=x.createLinearGradient(0,oy,0,oy+CEL);g.addColorStop(0,F.cor);g.addColorStop(1,new T.Color(F.cor).multiplyScalar(.78).getStyle());x.fillStyle=g;x.fillRect(ox,oy,CEL,CEL);
  x.strokeStyle='rgba(10,20,30,.45)';x.lineWidth=3;x.strokeRect(ox+1.5,oy+1.5,CEL-3,CEL-3);
  x.fillStyle='#0d1a26';x.textBaseline='top';x.textAlign='left';x.font='700 19px Segoe UI,Arial';x.fillText(String(z),ox+8,oy+6);
  x.textAlign='right';x.font='600 13px Segoe UI,Arial';x.fillStyle='rgba(13,26,38,.8)';x.fillText(e.est==='g'?'gás':e.est==='l'?'líq.':'',ox+CEL-7,oy+8);
  x.textAlign='center';x.fillStyle='#0b1622';x.font='800 46px Segoe UI,Arial';x.fillText(e.s,ox+CEL/2,oy+27);
  let fs=15;x.font='600 '+fs+'px Segoe UI,Arial';while(x.measureText(e.nome).width>CEL-10&&fs>9){fs--;x.font='600 '+fs+'px Segoe UI,Arial';}x.fillText(e.nome,ox+CEL/2,oy+76);
  x.font='500 12px Segoe UI,Arial';x.fillStyle='rgba(11,22,34,.78)';x.fillText(e.massa,ox+CEL/2,oy+94);}
 ATLAS=new T.CanvasTexture(c);ATLAS.encoding=T.sRGBEncoding;ATLAS.anisotropy=8;return ATLAS;}
let FACE_MAT=null;const faceMat=()=>FACE_MAT||(FACE_MAT=new T.MeshBasicMaterial({map:atlas(),toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
function faceGeo(z){const g=new T.PlaneGeometry(.9,.9);const [ci,cj]=celAtlas(z);const u0=ci*CEL/ATL,u1=(ci+1)*CEL/ATL,v1=1-cj*CEL/ATL,v0=1-(cj+1)*CEL/ATL;const uv=g.attributes.uv;uv.setXY(0,u0,v1);uv.setXY(1,u1,v1);uv.setXY(2,u0,v0);uv.setXY(3,u1,v0);uv.needsUpdate=true;return g;}
const posTab=e=>{const extra=e.lin>7?.45:0;return V((e.col-9.5)*1.0,(4.5-e.lin)*1.0-extra,0);};
/* um ladrilho (corpo + face). O material do corpo é próprio, para o destaque ao apontar não acender a família toda */
function ladrilho(z,opt={}){const e=D.EL[z],g=new T.Group();const corpo=new T.Mesh(new T.BoxGeometry(.94,.94,.16),mat(COR(e.fam).multiplyScalar(.55),{roughness:.4,envMapIntensity:.6}));g.add(corpo);const face=new T.Mesh(faceGeo(z),faceMat());face.position.z=.1;g.add(face);
 const f2=face.clone();f2.rotation.y=Math.PI;f2.position.z=-.1;g.add(f2);if(opt.hit!==false)tag(g,opt.hit||ins('el-'+z));return g;}
/* tabela inteira. opt.destaque: chave 'el-Z' em evidência; opt.hit: função z→dados do clique; opt.filtro: família em destaque;
   opt.curva: raio (em ladrilhos) para a versão do óculos, uma parede curva em volta do aluno (padrão: API.modoVR) */
let VEU=null;const veuMat=()=>VEU||(VEU=new T.MeshBasicMaterial({color:0x061220,transparent:true,opacity:.72,depthWrite:false,toneMapped:false}));
function tabela(opt={}){const g=new T.Group();const alvo=opt.destaque?Number(String(opt.destaque).slice(3)):0;const R=opt.curva!==undefined?opt.curva:(API.modoVR?9.6:0);
 /* coloca um objeto na posição (x,y) da tabela, com recuo zOff em direção ao aluno */
 const put=(o,x,y,zOff=0)=>{if(R){const ang=x/R,r=R-zOff;o.position.set(r*Math.sin(ang),y,-r*Math.cos(ang));o.rotation.y=-ang;}else o.position.set(x,y,zOff);return o;};
 const ladr={};
 for(let z=1;z<=118;z++){const e=D.EL[z];const t=ladrilho(z,{hit:opt.hit?opt.hit(z):undefined});const p=posTab(e);let zo=0;
  const fora=opt.filtro&&e.fam!==opt.filtro;
  if(alvo){if(z===alvo){zo=.7;t.scale.setScalar(1.35);}else zo=-.05;}
  if(opt.filtro&&!fora){zo=.35;t.scale.setScalar(1.08);}
  if(fora){zo=-.15;t.scale.setScalar(.9);const v=new T.Mesh(new T.PlaneGeometry(.94,.94),veuMat());v.position.z=.11;v.userData.semEnquadre=true;t.add(v);}
  put(t,p.x,p.y,zo);g.add(t);ladr[z]=t;
  if(alvo&&z===alvo){const moldura=new T.Mesh(new T.TorusGeometry(.78,.035,8,4),new T.MeshBasicMaterial({color:0xffd27a,toneMapped:false}));moldura.rotation.z=Math.PI/4;const hm=new T.Group();hm.add(moldura);put(hm,p.x,p.y,zo+.12);g.add(hm);const b=brilho(0xffd27a,2.6);put(b,p.x,p.y,zo-.1);g.add(b);g.userData.pulso=moldura;}}
 /* lacunas dos lantanídeos e actinídeos */
 [[6,'57–71','#c9a8ff'],[7,'89–103','#e5a0e8']].forEach(([lin,txt,cor])=>{const x=3-9.5,y=4.5-lin;const m=new T.Mesh(new T.BoxGeometry(.94,.94,.08),mat(new T.Color(cor).multiplyScalar(.3),{transparent:true,opacity:.7}));put(m,x,y);g.add(m);const l=rotuloFixo(txt,cor,.9);put(l,x,y,.06);g.add(l);});
 for(let c=1;c<=18;c++){const m=rotuloFixo(String(c),'#7fa6bd',.9,110);put(m,c-9.5,4.15);g.add(m);}
 for(let l=1;l<=7;l++){const m=rotuloFixo(String(l),'#7fa6bd',.9,110);put(m,-10.3,4.5-l);g.add(m);}
 const gt=rotuloFixo('GRUPO (FAMÍLIA)','#9cc4d8',3.6);put(gt,0,4.85);g.add(gt);
 const pr=rotuloFixo('PERÍODO','#9cc4d8',2.4);put(pr,-11.05,1);pr.rotateZ(Math.PI/2);g.add(pr);
 const la=rotuloFixo('Lantanídeos','#c9a8ff',2.1);put(la,-9.4,(4.5-9)-.45);g.add(la);const ac=rotuloFixo('Actinídeos','#e5a0e8',2.1);put(ac,-9.4,(4.5-10)-.45);g.add(ac);
 if(opt.filtro){const F=D.FAMILIAS[opt.filtro];const ft=rotuloFixo('Destaque: '+F.nome,F.cor,5.5);put(ft,1,5.55);g.add(ft);}
 /* lupa: o elemento apontado salta da tabela, bem maior, para dar leitura no óculos e na lousa */
 let lupa=null,lupaZ=0;
 g.userData.lupa=key=>{const z=key&&/^el-\d+$/.test(key)?Number(key.slice(3)):0;if(z===lupaZ)return;lupaZ=z;if(lupa){g.remove(lupa);lupa.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material!==FACE_MAT&&o.material!==VEU)o.material.dispose();});lupa=null;}
  if(!z||(ladr[z]&&!ladr[z].visible))return;const e=D.EL[z],p=posTab(e);lupa=ladrilho(z,{hit:false});lupa.scale.setScalar(R?2.3:2.1);lupa.traverse(o=>{o.userData.semEnquadre=true;});put(lupa,p.x,Math.max(-5.2,p.y+.2),R?2.6:1.6);const b=brilho(new T.Color(D.FAMILIAS[e.fam].cor),1.9);b.material.opacity=.55;b.position.z=-.2;lupa.add(b);g.add(lupa);};
 g.userData.ocultar=(z,sim)=>{if(ladr[z])ladr[z].visible=!sim;if(sim&&z===lupaZ)g.userData.lupa(null);};
 g.userData.semGiro=true;g.userData.frontal=true;g.userData.tabela=true;g.userData.curva=R;
 g.userData.tick=t=>{if(g.userData.pulso)g.userData.pulso.scale.setScalar(1+.06*Math.sin(t*4));};return g;}
/* ---------- átomo no modelo de camadas ---------- */
const COR_P=0xe0533d,COR_N=0x9aa3ad,COR_E=0x63c8ff;
function nucleo(z,n,raio){const g=new T.Group();const total=Math.min(z+n,60),pz=Math.max(1,Math.round(total*z/(z+n)));const r=raio||.12;const R0=r*Math.cbrt(total)*.95;
 let s=z*7+3;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};const geo=new T.SphereGeometry(r,16,12);const mp=mat(COR_P,{roughness:.35}),mn=mat(COR_N,{roughness:.4});
 const tipos=[];for(let i=0;i<total;i++)tipos.push(i<pz);for(let i=total-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[tipos[i],tipos[j]]=[tipos[j],tipos[i]];}
 for(let i=0;i<total;i++){const k=(i+.5)/total,phi=Math.acos(1-2*k),th=Math.PI*(1+Math.sqrt(5))*i;const rr=total<3?r*.9*(i?1:-1):R0*Math.cbrt(rnd()*.6+.4);const m=new T.Mesh(geo,tipos[i]?mp:mn);if(total<3)m.position.set(rr,0,0);else m.position.set(rr*Math.sin(phi)*Math.cos(th),rr*Math.cos(phi),rr*Math.sin(phi)*Math.sin(th));g.add(m);}
 g.userData.raio=R0+r;return g;}
/* camadas: [2,8,1]; opt.salto: anima o elétron de fora saltando e emitindo um fóton da cor opt.corLuz */
function atomo(z,opt={}){const e=D.EL[z],g=new T.Group();const cam=e.camadas;const n=Math.max(0,Math.round(parseFloat(String(e.massa).replace(/[\[\]]/g,'').replace(',','.')))-z);
 const nuc=nucleo(z,n,opt.rNuc||(z>20?.075:.12));g.add(nuc);const rn=nuc.userData.raio;
 const passo=opt.passo||(cam.length>4?.34:.48),r0=rn+(opt.r0||.42);const eletrons=[];
 const matAnel=new T.MeshBasicMaterial({color:0x5c8fb0,transparent:true,opacity:.55,toneMapped:false});
 cam.forEach((q,k)=>{const r=r0+k*passo;const anel=new T.Mesh(new T.TorusGeometry(r,.008+.004*(cam.length<4),6,120),matAnel);anel.rotation.x=Math.PI/2;g.add(anel);
  for(let i=0;i<q;i++){const el=ball(.055+(cam.length<4?.02:0),COR_E,null,{emissive:0x1d6a9a,roughness:.25},14);el.userData.orb={r,a:i/q*Math.PI*2,w:(.9-k*.08)*(k%2?-1:1),k};g.add(el);eletrons.push(el);}
  if(opt.letras!==false&&cam.length<=4){const l=label('KLMNOPQ'[k],'#8fc6e6',.42);l.position.set(r+.02,.12,0);l.userData.semEnquadre=false;g.add(l);}});
 g.rotation.x=.42;
 let foton=null,salto=null;
 if(opt.salto){const ult=eletrons[eletrons.length-1];salto={el:ult,r:ult.userData.orb.r,rAlto:ult.userData.orb.r+passo*1.6};foton=brilho(new T.Color(opt.corLuz||'#ffb300'),.5);foton.visible=false;g.add(foton);
  const halo=new T.Mesh(new T.TorusGeometry(salto.rAlto,.006,6,120),new T.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.25,toneMapped:false}));halo.rotation.x=Math.PI/2;g.add(halo);}
 const glows=eletrons.map(el=>{const b=brilho(COR_E,.32);g.add(b);return b;});
 g.userData.tick=t=>{eletrons.forEach((el,i)=>{const o=el.userData.orb;let r=o.r;if(salto&&el===salto.el){const ciclo=(t%4)/4;/* 0–.35 parado, .35–.5 sobe, .5–.7 fica no alto, .7–.8 volta */const u=ciclo<.35?0:ciclo<.5?(ciclo-.35)/.15:ciclo<.7?1:ciclo<.8?1-(ciclo-.7)/.1:0;r=salto.r+(salto.rAlto-salto.r)*u;el.material.emissive.setHex(u>0?0xffc040:0x1d6a9a);
   if(foton){const f=ciclo>=.8?(ciclo-.8)/.2:-1;foton.visible=f>=0;if(f>=0){const a=o.a+t*o.w;foton.position.set(Math.cos(a)*(salto.r+f*2.2),0,Math.sin(a)*(salto.r+f*2.2));foton.material.opacity=1-f;foton.scale.setScalar(.35+.5*f);}}}
   const a=o.a+t*o.w;el.position.set(Math.cos(a)*r,0,Math.sin(a)*r);glows[i].position.copy(el.position);});nuc.rotation.y=t*.15;};
 g.userData.tick(0);return g;}

/* ---------- laboratório: bico de Bunsen, chama, alça, ácido, sais ---------- */
function gotaChama(r,h){const pts=[];for(let i=0;i<=24;i++){const t=i/24;pts.push(new T.Vector2(Math.max(.0001,r*Math.sin(Math.PI*Math.pow(t,.62))*(1-.25*t)),h*t));}return new T.LatheGeometry(pts,32);}
function chama(cor,opt={}){const g=new T.Group();const h=opt.h||1;
 const mk=(r,alt,c,op)=>new T.Mesh(gotaChama(r,alt),new T.MeshBasicMaterial({color:c,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false}));
 const azul=mk(.06*h,.26*h,0x4d7dff,cor?.45:.9);g.add(azul);
 const externa=cor?mk(.2*h,1.0*h,new T.Color(cor),.3):mk(.11*h,.55*h,0x2a4dcc,.4);g.add(externa);
 const meio=cor?mk(.12*h,.7*h,new T.Color(cor),.22):null;if(meio)g.add(meio);
 const luz=brilho(cor?new T.Color(cor):new T.Color(0x3a66ff),cor?1.6*h:.7*h);luz.position.y=(cor?.45:.25)*h;luz.material.opacity=.55;g.add(luz);
 g.userData.tick=t=>{const f=1+.06*Math.sin(t*23)+.05*Math.sin(t*37+1.3);externa.scale.set(1/Math.sqrt(f),f,1/Math.sqrt(f));externa.rotation.y=t*.7;if(meio)meio.scale.set(1,1+.08*Math.sin(t*29+.4),1);luz.material.opacity=.5+.08*Math.sin(t*31);};
 g.traverse(o=>{o.userData.semEnquadre=!!opt.semEnquadre;});return g;}
function bico(cor,opt={}){const g=new T.Group();const metal=mat(0xaab3bd,{metalness:.75,roughness:.3,envMapIntensity:1});
 const base=new T.Mesh(new T.CylinderGeometry(.38,.42,.08,40),mat(0x1d3a70,{roughness:.5}));base.position.y=.04;g.add(base);
 const tubo=new T.Mesh(new T.CylinderGeometry(.075,.075,.95,24),metal);tubo.position.y=.55;g.add(tubo);
 const anel=new T.Mesh(new T.CylinderGeometry(.095,.095,.12,24),mat(0xc9a14a,{metalness:.8,roughness:.3}));anel.position.y=.22;g.add(anel);
 const mangueira=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(.05,.12,0),V(.35,.12,.05),V(.7,.04,.25),V(1.1,.02,.3)]),24,.035,8,false),mat(0xd8692e,{roughness:.6}));g.add(mangueira);
 const ch=chama(cor,{h:opt.h||1});ch.position.y=1.03;g.add(ch);g.userData.tick=ch.userData.tick;g.userData.chama=ch;return g;}
function alca(opt={}){const g=new T.Group();const cabo=new T.Mesh(new T.CylinderGeometry(.035,.035,.5,14),mat(0x3b2a1f,{roughness:.7}));cabo.rotation.z=Math.PI/2;cabo.position.x=-.25;g.add(cabo);
 const fio=new T.Mesh(new T.CylinderGeometry(.008,.008,.62,8),mat(0xd0d4da,{metalness:.8,roughness:.3}));fio.rotation.z=Math.PI/2;fio.position.x=.31;g.add(fio);
 const volta=new T.Mesh(new T.TorusGeometry(.04,.008,8,24),fio.material);volta.position.x=.66;g.add(volta);
 if(opt.sal){const gr=ball(.035,new T.Color(opt.sal==='cu'?'#3fb8a0':'#f4f4f0').getHex(),V(.66,0,0),{roughness:.9},10);g.add(gr);}return g;}
function bequer(opt={}){const g=new T.Group();const vidro=new T.Mesh(new T.CylinderGeometry(.3,.28,.7,40,1,true),new T.MeshStandardMaterial({color:0xddeeff,transparent:true,opacity:.22,roughness:.05,metalness:0,envMap:env(),envMapIntensity:1.2,side:T.DoubleSide,depthWrite:false}));vidro.position.y=.35;g.add(vidro);
 const fundo=new T.Mesh(new T.CircleGeometry(.28,32),vidro.material);fundo.rotation.x=-Math.PI/2;fundo.position.y=.005;g.add(fundo);
 const liq=new T.Mesh(new T.CylinderGeometry(.27,.26,.36,32),new T.MeshStandardMaterial({color:0xbfe6ff,transparent:true,opacity:.45,roughness:.1,envMap:env()}));liq.position.y=.19;g.add(liq);
 if(opt.rotulo!==false)textFixo(g,'HCl diluído',0,.42,.31,.6,'#0f2c4a');return g;}
function vidroRelogio(sal){const g=new T.Group();const v=new T.Mesh(new T.SphereGeometry(.34,32,10,0,Math.PI*2,Math.PI*.72,Math.PI*.28),new T.MeshStandardMaterial({color:0xe6f2ff,transparent:true,opacity:.35,roughness:.05,envMap:env(),envMapIntensity:1.2,side:T.DoubleSide,depthWrite:false}));v.position.y=.33;g.add(v);
 const corSal=sal.id==='cu'?0x3fb8a0:0xf3f1ea;const monte=new T.Mesh(new T.SphereGeometry(.17,24,10,0,Math.PI*2,0,Math.PI/2),mat(corSal,{roughness:.95}));monte.scale.y=.45;monte.position.y=.05;g.add(monte);
 let s=sal.z;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};for(let i=0;i<14;i++){const gr=new T.Mesh(new T.BoxGeometry(.03,.03,.03),mat(corSal,{roughness:.8}));gr.position.set((rnd()-.5)*.26,.06+rnd()*.03,(rnd()-.5)*.26);gr.rotation.set(rnd()*3,rnd()*3,0);g.add(gr);}
 return g;}
function bancada(){const g=new T.Group();
 const tampo=new T.Mesh(new T.BoxGeometry(7.2,.16,2.6),mat(0xe9ecef,{roughness:.35,envMapIntensity:.7}));tampo.position.y=-.08;g.add(tampo);
 const saia=new T.Mesh(new T.BoxGeometry(7.0,1.1,2.4),mat(0x2f4b63,{roughness:.6}));saia.position.y=-.71;g.add(saia);
 const b=bico(null);b.position.set(0,0,-.55);tag(b,ins('bico'));g.add(b);
 const bq=bequer();bq.position.set(2.6,0,-.6);tag(bq,ins('acido'));g.add(bq);
 const al=alca();al.position.set(1.7,.04,-.1);al.rotation.y=.5;tag(al,ins('alca'));g.add(al);
 const sais=D.SAIS;sais.forEach((s,i)=>{const x=(i-(sais.length-1)/2)*.95;const vr=vidroRelogio(s);vr.position.set(x,0,.62);tag(vr,ins('sal-'+s.id));g.add(vr);
  const placa=new T.Mesh(new T.BoxGeometry(.82,.3,.03),mat(0xf7f8fa,{roughness:.6}));placa.position.set(x,.1,1.2);placa.rotation.x=-1.05;tag(placa,ins('sal-'+s.id));g.add(placa);
  const pl=rotuloFixo(s.formula,'#0f2c4a',.8,120);pl.position.set(0,0,.02);placa.add(pl);tag(pl,ins('sal-'+s.id));});
 /* quadro de referência com as cores (a tabela que se compara no passo 5) */
 const quadro=new T.Mesh(new T.BoxGeometry(4.6,1.25,.06),mat(0x16283a,{roughness:.6}));quadro.position.set(-.4,1.75,-1.25);g.add(quadro);
 textFixo(g,'CORES DA CHAMA',-.4,2.2,-1.21,2.4,'#ffd27a');
 sais.forEach((s,i)=>{const x=-.4+(i-(sais.length-1)/2)*.62;const sw=new T.Mesh(new T.PlaneGeometry(.5,.42),new T.MeshBasicMaterial({color:new T.Color(s.cor),toneMapped:false}));sw.position.set(x,1.78,-1.215);g.add(sw);const sl=rotuloFixo(D.EL[s.z].s,'#e7f6ff',.6,130);sl.position.set(x,1.38,-1.21);g.add(sl);});
 g.userData.tick=b.userData.tick;return g;}

/* ---------- contexto: gota → molécula/átomo → tabela ---------- */
function molAgua(esc=1){const g=new T.Group();const O=ball(.6*esc,0xe0533d,null,{roughness:.3});g.add(O);const ang=104.5/2*Math.PI/180;[-1,1].forEach(s=>{const H=ball(.4*esc,0xf2f4f6,V(Math.sin(ang)*s*.78*esc,-Math.cos(ang)*.78*esc,0),{roughness:.3});g.add(H);});return g;}
function contexto(level){const g=new T.Group();
 if(level===0){const gota=new T.Mesh(new T.SphereGeometry(1.6,64,48),new T.MeshStandardMaterial({color:0x7cc4ff,transparent:true,opacity:.35,roughness:.05,metalness:0,envMap:env(),envMapIntensity:1.4,depthWrite:false}));const p=gota.geometry.attributes.position,v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);if(v.y>0){const k=v.y/1.6;v.x*=1-.55*k*k;v.z*=1-.55*k*k;v.y*=1+.5*k*k;}p.setXYZ(i,v.x,v.y,v.z);}gota.geometry.computeVertexNormals();g.add(gota);
  let s=5;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};for(let i=0;i<34;i++){const m=molAgua(.12);let q;do{q=V(rnd()*2-1,rnd()*2-1,rnd()*2-1).multiplyScalar(1.3);}while(q.length()>1.25);m.position.copy(q);m.rotation.set(rnd()*6,rnd()*6,rnd()*6);g.add(m);}
  tag(g,{type:'context'});textAt(g,'UMA GOTA DE ÁGUA',0,2.9,0,3.2,'#9fd8ff');g.userData.tick=t=>{g.children.forEach((c,i)=>{if(i>0&&c.isGroup)c.rotation.y+=.01;});};}
 else if(level===1){const m=molAgua(1);m.position.set(-2.2,.2,0);g.add(m);textAt(g,'H₂O',-2.2,-1.5,0,1.2,'#ffd27a');
  const a=atomo(8,{});a.position.set(1.9,0,0);a.scale.setScalar(1.25);g.add(a);textAt(g,'ÁTOMO DE OXIGÊNIO',1.9,-1.9,0,3,'#9fd8ff');textAt(g,'8 prótons · 8 elétrons (2 e 6)',1.9,-2.35,0,3.4,'#cfe6f2');
  const seta=new T.ArrowHelper(V(1,0,0),V(-1.2,.2,0),1.2,0xffd27a,.25,.16);g.add(seta);tag(g,{type:'context'});g.userData.tick=a.userData.tick;}
 else{const tb=tabela();g.add(tb);g.userData.tick=tb.userData.tick;g.userData.semGiro=true;g.userData.frontal=true;}
 return g;}
function explorar(filtro){return tabela({filtro});}

/* ---------- contexto da chama: fogos → salto do elétron → sete cores ---------- */
function fogos(){const g=new T.Group();const cores=['#ff1f1f','#8fe04a','#ffb300','#1fe0b0','#b27cff','#ff2d55'];const estouros=[];
 cores.forEach((c,i)=>{const n=240,pos=new Float32Array(n*3),dir=[];for(let k=0;k<n;k++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,r=Math.sqrt(1-u*u);dir.push(V(r*Math.cos(a),u,r*Math.sin(a)));}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));const pts=new T.Points(geo,new T.PointsMaterial({color:new T.Color(c),size:.2,map:glowTex(),transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));
  const centro=V((i-(cores.length-1)/2)*1.25,.6+(i%2)*.9,(i%3-1)*.4);pts.userData={dir,centro,fase:i*.55};g.add(pts);estouros.push(pts);});
 const alvo=new T.Mesh(new T.SphereGeometry(3.4,16,12),new T.MeshBasicMaterial({visible:false}));alvo.position.y=.9;g.add(alvo);tag(g,{type:'context'});
 g.userData.tick=t=>{estouros.forEach(p=>{const {dir,centro,fase}=p.userData;const u=((t*.45+fase)%2.2)/2.2;const r=.15+1.35*Math.sqrt(u);const a=p.geometry.attributes.position;for(let k=0;k<dir.length;k++){a.setXYZ(k,centro.x+dir[k].x*r,centro.y+dir[k].y*r-u*u*.6,centro.z+dir[k].z*r);}a.needsUpdate=true;p.material.opacity=u<.8?1:1-(u-.8)/.2;});};
 g.userData.tick(0);textAt(g,'FOGOS DE ARTIFÍCIO',0,-1.4,0,3.4,'#ffd27a');g.userData.semGiro=true;g.userData.frontal=true;return g;}
function vegContexto(level){const g=new T.Group();
 if(level===0){const f=fogos();g.add(f);g.userData.tick=f.userData.tick;g.userData.semGiro=true;g.userData.frontal=true;}
 else if(level===1){const a=atomo(11,{salto:true,corLuz:'#ffb300'});a.scale.setScalar(1.3);g.add(a);tag(g,{type:'context'});textAt(g,'ÁTOMO DE SÓDIO NA CHAMA',0,-2.4,0,3.8,'#ffd27a');textAt(g,'o elétron de fora salta e, ao voltar, solta luz amarela',0,-2.85,0,5.2,'#cfe6f2');g.userData.tick=a.userData.tick;}
 else{const ticks=[];D.SAIS.forEach((s,i)=>{const x=(i-(D.SAIS.length-1)/2)*1.05;const b=bico(s.cor,{h:.9});b.scale.setScalar(.85);b.position.set(x,-1,0);tag(b,ins('sal-'+s.id));g.add(b);ticks.push(b.userData.tick);textAt(g,D.EL[s.z].nome,x,-1.35,.3,1.25,'#e7f6ff');textAt(g,s.formula,x,-1.68,.3,1.0,'#9cc4d8');});
  g.userData.tick=t=>ticks.forEach((f,i)=>f(t+i*.37));g.userData.semGiro=true;g.userData.frontal=true;}
 return g;}
function vegetalExp(){const b=bancada();b.userData.semGiro=true;return b;}

/* ---------- ficha ampliada (cópia que aparece ao lado) ---------- */
function passoIcone(key){const g=new T.Group();
 if(key==='passo_limpar'||key==='acido'){const bq=bequer({rotulo:key==='acido'});g.add(bq);if(key==='passo_limpar'){const a=alca();a.rotation.z=-1.1;a.position.set(-.05,.95,0);g.add(a);}}
 else if(key==='passo_sal'){const v=vidroRelogio(D.SAIS[1]);g.add(v);const a=alca({sal:'na'});a.position.set(-.66,.12,0);g.add(a);}
 else if(key==='passo_chama'||key==='bico'){const b=bico(null);g.add(b);g.userData.tick=b.userData.tick;if(key==='passo_chama'){const a=alca();a.position.set(-.7,1.15,0);g.add(a);}}
 else if(key==='passo_observar'){const b=bico('#ffb300');g.add(b);g.userData.tick=b.userData.tick;const a=alca({sal:'na'});a.position.set(-.7,1.15,0);g.add(a);}
 else if(key==='passo_comparar'){D.SAIS.forEach((s,i)=>{const sw=new T.Mesh(new T.BoxGeometry(.3,.5,.06),new T.MeshBasicMaterial({color:new T.Color(s.cor),toneMapped:false}));sw.position.set((i-3)*.36,.5,0);g.add(sw);});const lupa=new T.Mesh(new T.TorusGeometry(.32,.05,10,32),mat(0x2b3a48));lupa.position.set(.3,.55,.2);g.add(lupa);}
 else if(key==='passo_registrar'){const pr=new T.Mesh(new T.BoxGeometry(1,1.3,.05),mat(0x8a5a2b));pr.position.y=.65;g.add(pr);const fo=new T.Mesh(new T.PlaneGeometry(.86,1.1),mat(0xf6f3ea));fo.position.set(0,.62,.03);g.add(fo);for(let i=0;i<5;i++){const l=new T.Mesh(new T.PlaneGeometry(.66,.03),new T.MeshBasicMaterial({color:0x6b7a86}));l.position.set(0,.95-i*.16,.035);g.add(l);}}
 else if(key==='alca'){const a=alca();a.scale.setScalar(1.6);g.add(a);}
 return g;}
function inspection(key){const g=new T.Group();let o;
 if(/^el-\d+$/.test(key)){const z=Number(key.slice(3));o=new T.Group();const a=atomo(z,{});o.add(a);const t=ladrilho(z,{hit:false});t.scale.setScalar(.9);
  /* o ladrilho fica acima do átomo */const box=new T.Box3().setFromObject(a);t.position.set(0,box.max.y+.7,0);o.add(t);o.userData.tick=a.userData.tick;}
 else if(/^sal-/.test(key)){const s=D.SAIS.find(x=>'sal-'+x.id===key);o=bico(s.cor);const a=alca({sal:s.id});a.position.set(-.72,1.1,0);a.rotation.z=.15;o.add(a);}
 else o=passoIcone(key);
 tag(o,ins(key));g.add(o);g.userData.tick=o.userData.tick;g.userData.pegavel=true;return g;}

/* ---------- sequência (procedimento do teste) ---------- */
function sequencia(state,cfg){
 const g=new T.Group();const n=cfg.ordem.length,dy=.6,top=(n-1)*dy/2+.3;
 textFixo(g,cfg.titulo,.9,top+.75,0,3.6,cfg.cor);
 for(let i=0;i<n;i++){const y=top-i*dy;const key=state.colocados[i];
  const num=rotuloFixo(String(i+1),i===state.target?'#ffdb9f':'#8fb0c2',.5,96);num.position.set(-.55,y,.05);g.add(num);
  const cor=key&&D.info[key]?new T.Color(D.info[key].color).multiplyScalar(.6).getHex():0x23364a;
  const placa=new T.Mesh(new T.BoxGeometry(2.6,.46,.16),mat(cor,{transparent:!key,opacity:key?1:.7}));placa.position.set(.9,y,0);tag(placa,{type:'seqSlot',index:i});g.add(placa);
  const txt=rotuloFixo(key?cfg.rotulos[key]:'?',key?'#fff8ec':'#ffe3a8',2.4,key?66:96);txt.position.set(.9,y,.1);g.add(txt);
  if(key){const mini=inspection(key);mini.scale.multiplyScalar(.22);mini.position.set(2.5,y-.18,.1);mini.traverse(o=>{o.userData.hit=null;});g.add(mini);}
  if(i===state.target&&!key){const marc=new T.Mesh(new T.BoxGeometry(2.72,.56,.06),new T.MeshBasicMaterial({color:0xefd094,wireframe:true}));marc.position.set(.9,y,.02);g.add(marc);}
  if(i<n-1){const seta=new T.ArrowHelper(V(0,-1,0),V(.9,y-.25,0),.12,0xffb300,.08,.06);g.add(seta);}
 }
 const restantes=state.bandeja.filter(k=>!state.colocados.includes(k));
 restantes.forEach((k,i)=>{const cols=2,c=i%cols,r=Math.floor(i/cols);const x=-3.45+c*1.6,y=top-.1-r*.72;
  const peca=new T.Mesh(new T.BoxGeometry(1.48,.56,.2),mat(new T.Color(D.info[k].color).getHex(),{roughness:.45}));peca.position.set(x,y,.1);peca.userData.draggable=true;tag(peca,{type:'seqPiece',key:k});g.add(peca);
  const t=rotuloFixo(cfg.rotulos[k],'#10161c',1.46,60);t.position.set(x,y,.22);g.add(t);
  if(state.selected===k){const anel=new T.Mesh(new T.BoxGeometry(1.6,.68,.08),new T.MeshBasicMaterial({color:0xffffff,wireframe:true}));anel.position.set(x,y,.1);g.add(anel);}
 });
 if(!state.done)textFixo(g,'ETAPAS',-2.95,top+.75,0,1.4,'#ffb300');
 g.userData.slots={top,dy};g.userData.semGiro=true;g.userData.tick=t=>{g.traverse(o=>{if(o!==g&&o.userData.tick&&o.userData.pegavel)o.userData.tick(t);});};return g;}

/* ---------- viagem ao átomo de sódio (gigante) ---------- */
const ESCALA_VR=.5;
const RAIOS=[3,6,9.5];
const WAY=[V(2,3,42),V(3,2.4,22),V(5,1.6,14),V(8.6,1.2,9.4),V(7.2,1,5),V(5.4,.9,3.4),V(3.2,.8,2),V(2.1,.7,1.2),V(1.4,.6,.6),V(2.6,1.4,3),V(6,2.4,8),V(10,3,12)];
const TRECHOS=[[0,2],[2,4],[4,6],[6,7],[7,8],[8,11]];
function viagemCena(state){const g=new T.Group();const i=Math.min(state.trecho||0,TRECHOS.length-1);
 const at=new T.Group();g.add(at);
 const nuc=nucleo(11,12,.42);at.add(nuc);
 const matAnel=new T.MeshBasicMaterial({color:0x5c8fb0,transparent:true,opacity:.5,toneMapped:false});const cam=[2,8,1];const el=[];
 cam.forEach((q,k)=>{const r=RAIOS[k];[0,1,2].forEach(j=>{const anel=new T.Mesh(new T.TorusGeometry(r,.025,6,160),matAnel);anel.rotation.set(Math.PI/2+j*.5,j*1.1,0);anel.userData.semEnquadre=true;at.add(anel);});
  for(let m=0;m<q;m++){const e=ball(.28,COR_E,null,{emissive:0x2a8acb,roughness:.2},18);e.userData.orb={r,a:m/q*Math.PI*2,w:(.35-k*.06)*(k%2?-1:1),inc:(m%3)*.5,k};at.add(e);const b=brilho(COR_E,1.6);e.add(b);el.push(e);}
  const nuvem=new T.Points(new T.BufferGeometry(),new T.PointsMaterial({color:0x63c8ff,size:.05,transparent:true,opacity:.35,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));const n=900,pos=new Float32Array(n*3);for(let p=0;p<n;p++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,rr=r*(1+(Math.random()-.5)*.25),s=Math.sqrt(1-u*u);pos[p*3]=rr*s*Math.cos(a);pos[p*3+1]=rr*u;pos[p*3+2]=rr*s*Math.sin(a);}nuvem.geometry.setAttribute('position',new T.BufferAttribute(pos,3));nuvem.userData.semEnquadre=true;at.add(nuvem);});
 const luzNuc=new T.PointLight(0xffb39a,1.2,14,1.5);at.add(luzNuc);
 const rotulos=[['NÚCLEO · 11 prótons e 12 nêutrons',V(0,1.4,0)],['CAMADA K · 2 elétrons',V(0,RAIOS[0]+.6,0)],['CAMADA L · 8 elétrons',V(0,RAIOS[1]+.6,0)],['CAMADA M · 1 elétron',V(0,RAIOS[2]+.7,0)]];rotulos.forEach(([t,p],k)=>{const l=label(t,k?'#9fd8ff':'#ffc9b8',k?3.4:3.8);l.position.copy(p);l.userData.semEnquadre=true;at.add(l);});
 const foton=brilho(0xffb300,1.2);foton.visible=false;at.add(foton);const ext=el[el.length-1];
 const [a,b]=TRECHOS[i];const curva=new T.CatmullRomCurve3(WAY.slice(a,b+1));
 const trilha=new T.Mesh(new T.TubeGeometry(curva,80,.018,5,false),new T.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:.3,toneMapped:false,depthWrite:false}));trilha.userData.semEnquadre=true;g.add(trilha);
 const ALVOS=[V(0,0,0),V(0,0,0),V(0,0,0),V(0,0,0),V(0,0,0),V(0,0,0)];g.userData.viagem={curva,escalaVR:ESCALA_VR,claro:true,alvo:ALVOS[i]};
 g.userData.tick=t=>{el.forEach(e=>{const o=e.userData.orb;let r=o.r;if(e===ext&&i===5){const c=(t%5)/5;const u=c<.3?0:c<.45?(c-.3)/.15:c<.65?1:c<.75?1-(c-.65)/.1:0;r=o.r+4.5*u;e.material.emissive.setHex(u>0?0xffb000:0x2a8acb);const f=c>=.75?(c-.75)/.25:-1;foton.visible=f>=0;if(f>=0){const ang=o.a+t*o.w;foton.position.set(Math.cos(ang)*(o.r+f*9),f*2,Math.sin(ang)*(o.r+f*9));foton.material.opacity=1-f;}}
   const ang=o.a+t*o.w;e.position.set(Math.cos(ang)*r,Math.sin(ang)*Math.sin(o.inc)*r*.3,Math.sin(ang)*r*Math.cos(o.inc*.3));});nuc.rotation.y=t*.1;};
 g.userData.tick(0);g.userData.semGiro=true;return g;}

/* ---------- monte o átomo ---------- */
const camadasDe=e=>{const cap=[2,8,8,2],out=[];let r=e;for(const c of cap){if(r<=0)break;out.push(Math.min(c,r));r-=c;}return out;};
function bandeja(cor,rot,op,y,g){const prato=new T.Mesh(new T.CylinderGeometry(.62,.5,.14,32),mat(0x22384c,{roughness:.5}));prato.position.set(-4.3,y,0);prato.rotation.x=.5;tag(prato,{type:'montar',op:op+'+'});g.add(prato);
 let s=op.charCodeAt(0);const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};const geo=new T.SphereGeometry(.12,16,12),m=mat(cor,{roughness:.3,emissive:op==='e'?0x1d6a9a:0});for(let i=0;i<9;i++){const b=new T.Mesh(geo,m);b.position.set(-4.3+(rnd()-.5)*.7,y+.12+rnd()*.12,(rnd()-.5)*.5);tag(b,{type:'montar',op:op+'+'});g.add(b);}
 const mais=rotuloFixo('+ '+rot,'#e7f6ff',1.7,70);mais.position.set(-4.3,y-.52,.3);tag(mais,{type:'montar',op:op+'+'});g.add(mais);
 const menos=new T.Mesh(new T.CylinderGeometry(.22,.22,.08,24),mat(0x8a2e2e,{roughness:.4}));menos.rotation.x=Math.PI/2;menos.position.set(-3.05,y,0);tag(menos,{type:'montar',op:op+'-'});g.add(menos);
 const tm=rotuloFixo('−','#ffffff',1.1,120);tm.position.set(-3.05,y,.1);tag(tm,{type:'montar',op:op+'-'});g.add(tm);}
function montarCena(st,meta){const g=new T.Group();const p=st.p,n=st.n,e=st.e;
 bandeja(COR_P,'Próton','p',1.5,g);bandeja(COR_N,'Nêutron','n',0,g);bandeja(COR_E,'Elétron','e',-1.5,g);
 const at=new T.Group();g.add(at);at.position.set(.3,0,0);
 if(p>0){const nuc=nucleo(p,n,.13);at.add(nuc);}
 const cam=camadasDe(e);const eletrons=[];const rn=p>0?.13*Math.cbrt(p+n)*.95+.13:.2;const matAnel=new T.MeshBasicMaterial({color:0x5c8fb0,transparent:true,opacity:.55,toneMapped:false});
 [0,1,2,3].forEach(k=>{const r=rn+.45+k*.42;const anel=new T.Mesh(new T.TorusGeometry(r,.01,6,120),k<cam.length?matAnel:new T.MeshBasicMaterial({color:0x2c4256,transparent:true,opacity:.35,toneMapped:false}));anel.rotation.x=Math.PI/2;at.add(anel);
  const q=cam[k]||0;for(let i=0;i<q;i++){const el=ball(.075,COR_E,null,{emissive:0x1d6a9a,roughness:.25},14);el.userData.orb={r,a:i/q*Math.PI*2,w:(.9-k*.12)*(k%2?-1:1)};at.add(el);eletrons.push(el);const b=brilho(COR_E,.34);el.add(b);}
  const l=label('KLMN'[k]+(q?' · '+q:''),k<cam.length?'#8fc6e6':'#4d6a80',.6);l.position.set(r+.05,.14,0);at.add(l);});
 at.rotation.x=.38;at.scale.setScalar(1.3);
 /* identidade do átomo */
 if(p>0){const t=ladrilho(p,{hit:false});t.scale.setScalar(1.7);t.position.set(4.1,.9,0);g.add(t);const E=D.EL[p];
  const carga=p-e,txtC=carga===0?'neutro':(carga>0?'íon positivo '+carga+'+':'íon negativo '+(-carga)+'−');
  const l1=rotuloFixo(E.nome,'#ffffff',2.6,80);l1.position.set(4.1,-.35,0);g.add(l1);
  const l2=rotuloFixo('Número de massa: '+(p+n),'#cfe6f2',2.6,60);l2.position.set(4.1,-.8,0);g.add(l2);
  const l3=rotuloFixo('Carga: '+txtC,carga===0?'#9fe6b8':'#ffd27a',2.6,60);l3.position.set(4.1,-1.2,0);g.add(l3);
  const l4=rotuloFixo(p+' p · '+n+' n · '+e+' e','#9cc4d8',2.6,60);l4.position.set(4.1,-1.6,0);g.add(l4);}
 else{const l=rotuloFixo('Sem prótons, não há elemento','#ffd27a',3,60);l.position.set(4.1,0,0);g.add(l);}
 if(meta){const ok=meta.p===p&&meta.n===n&&meta.e===e;const m=rotuloFixo((ok?'✓ ':'Meta: ')+meta.titulo+' ('+meta.p+' p · '+meta.n+' n · '+meta.e+' e)',ok?'#7dffb0':'#ffe3a8',6,64);m.position.set(.3,2.75,0);g.add(m);if(ok){const b=brilho(0x7dffb0,4.5);b.position.set(.3,0,-.4);g.add(b);}}
 g.userData.tick=t=>{eletrons.forEach(el=>{const o=el.userData.orb;const a=o.a+t*o.w;el.position.set(Math.cos(a)*o.r,0,Math.sin(a)*o.r);});};g.userData.tick(0);
 g.userData.semGiro=true;g.userData.frontal=true;return g;}
/* ---------- metal, ametal ou gás nobre ---------- */
function compararCena(state){const g=new T.Group();const rod=D.COMPARAR[Math.min(state.rodada,D.COMPARAR.length-1)];const alvo=state.done?null:rod.key;
 const tb=tabela({destaque:alvo,hit:()=>({type:'cmpCel'})});g.add(tb);
 if(alvo){const R=tb.userData.curva||0;textAt(g,'Procure: '+D.info[alvo].name,0,5.7,R?-(R-.6):.5,6,'#ffe3a8');}
 g.userData.tick=tb.userData.tick;g.userData.semGiro=true;g.userData.frontal=true;return g;}
function desafio(modulo){return modulo==='veg'?vegetalExp():tabela();}
function dispose(g){if(!g)return;const geos=new Set(),mats=new Set(),tex=new Set();const fixos=new Set([ATLAS,GLOW,ENV]);g.traverse(o=>{if(o.geometry&&!o.isSprite)geos.add(o.geometry);for(const m of [].concat(o.material||[])){if(!m||m===FACE_MAT||m===VEU)continue;mats.add(m);for(const t of [m.map,m.emissiveMap,m.normalMap,m.bumpMap]){if(t&&!fixos.has(t))tex.add(t);}}});geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());tex.forEach(x=>x.dispose());if(g.parent)g.parent.remove(g);}
const API_LIST={montarCena,camadasDe,V,mat,ball,label,rotuloFixo,textFixo,textAt,tag,tabela,atomo,bico,chama,contexto,vegContexto,explorar,vegetalExp,inspection,sequencia,viagemCena,compararCena,desafio,dispose,ESCALA_VR,TRECHOS};Object.assign(API,API_LIST);window.QUIMICA_MODELS=API;
})();
