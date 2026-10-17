/* História VR · modelos (v1.0)
   Tudo gerado no navegador pela NEWPC, sem arquivos externos: o vale do Nilo em maquete (rio, margens férteis, deserto),
   as pirâmides de Gizé, a Esfinge, templo, obelisco, barco, shaduf, casas de adobe e figuras estilizadas; a pirâmide social;
   a mesa do embalsamador; o interior da Grande Pirâmide em metros reais; a parede de hieróglifos. Os hieróglifos são
   desenhados em canvas (não dependem de fonte). Cada peça clicável tem userData.hit = {type:'inspect', key}.
   Os cenários do Blender (modelos/*.glb) podem substituir as maquetes sem mudar as missões (ver cenarioExterno). */
(function(){'use strict';
const T=THREE,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
let ENV=null;
function env(){if(ENV)return ENV;const W=128;const face=(topo,baixo,caixa)=>{const c=document.createElement('canvas');c.width=c.height=W;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,W);g.addColorStop(0,topo);g.addColorStop(.55,'#4c5866');g.addColorStop(1,baixo);x.fillStyle=g;x.fillRect(0,0,W,W);if(caixa){x.filter='blur(6px)';x.fillStyle=caixa;x.fillRect(W*.22,W*.12,W*.56,W*.4);x.filter='none';}return c;};
 const lado=face('#cfd8e6','#1e2430'),luz=face('#eef3fa','#1e2430','#ffffff');const cima=document.createElement('canvas');cima.width=cima.height=W;const cx=cima.getContext('2d');const rg=cx.createRadialGradient(W/2,W/2,4,W/2,W/2,W*.7);rg.addColorStop(0,'#ffffff');rg.addColorStop(1,'#a8b6c8');cx.fillStyle=rg;cx.fillRect(0,0,W,W);const baixo=document.createElement('canvas');baixo.width=baixo.height=W;const bx=baixo.getContext('2d');bx.fillStyle='#1a1e26';bx.fillRect(0,0,W,W);
 ENV=new T.CubeTexture([luz,lado,cima,baixo,lado,luz]);ENV.encoding=T.sRGBEncoding;ENV.needsUpdate=true;return ENV;}
const mat=(color,extra={})=>new T.MeshStandardMaterial(Object.assign({color,roughness:.55,metalness:0,envMap:env(),envMapIntensity:.45},extra));
function tag(o,data){o.traverse(x=>{if(x.isMesh)x.userData.hit=data;});o.userData.hit=data;return o;}
const ins=k=>({type:'inspect',key:k});
function ball(r,color,pos,extra,seg=24){const m=new T.Mesh(new T.SphereGeometry(r,seg,Math.max(10,seg*.7|0)),mat(color,extra));if(pos)m.position.copy(pos);return m;}
/* v4.12: quando o texto não cabe numa linha sem encolher muito, quebra em duas linhas maiores (as peças das missões ficavam ilegíveis) */
function quebraLinhas(ctx,text,size,quebra=true){const F=s=>'600 '+s+'px Segoe UI,Arial',cabe=(s,ls)=>{ctx.font=F(s);return ls.every(l=>ctx.measureText(l).width<=490);};
  let s1=size;while(!cabe(s1,[text])&&s1>17)s1-=2;const w=String(text).split(' ');if(!quebra||s1>=size*.85||w.length<2){ctx.font=F(s1);return{linhas:[text],size:s1};}
  let melhor=null;for(let i=1;i<w.length;i++){const ls=[w.slice(0,i).join(' '),w.slice(i).join(' ')];ctx.font=F(40);const m=Math.max(...ls.map(l=>ctx.measureText(l).width));if(!melhor||m<melhor.m)melhor={ls,m};}
  let s2=Math.min(size,54);while(!cabe(s2,melhor.ls)&&s2>17)s2-=2;if(s2>s1){ctx.font=F(s2);return{linhas:melhor.ls,size:s2};}ctx.font=F(s1);return{linhas:[text],size:s1};}
function label(text,color='#e7f6ff',width=1.5,size=56,quebra=true){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');const q=quebraLinhas(ctx,text,size,quebra);ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#031220';ctx.shadowBlur=7;ctx.fillStyle=color;if(q.linhas.length===1)ctx.fillText(text,256,64);else{const d=q.size*.56;ctx.fillText(q.linhas[0],256,64-d);ctx.fillText(q.linhas[1],256,64+d);}const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.minFilter=T.LinearMipmapLinearFilter;tx.generateMipmaps=true;tx.anisotropy=8;const sp=new T.Sprite(new T.SpriteMaterial({toneMapped:false,map:tx,transparent:true,depthWrite:false,depthTest:true}));sp.scale.set(width,width/4,1);return sp;}
function textAt(g,text,x,y,z=0,width=1.5,color){const sp=label(text,color,width);sp.position.set(x,y,z);g.add(sp);return sp;}
/* v4.7.1 · rótulo fixo no mundo (plano, não sprite): no VR as letras dos tabuleiros não giram com a cabeça */
function rotuloFixo(text,color='#e7f6ff',width=1.5,size=56,quebra=true){const sp=label(text,color,width,size,quebra);const m=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:sp.material.map,transparent:true,depthWrite:false,side:T.DoubleSide}));sp.material.dispose();return m;}
function textFixo(g,text,x,y,z=0,width=1.5,color,quebra=true){const m=rotuloFixo(text,color,width,56,quebra);m.position.set(x,y,z);g.add(m);return m;}
/* ---------- texturas pintadas no navegador ---------- */
function ruido2(seed=1337){const P=new Uint8Array(512);let s=seed;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};const p=[];for(let i=0;i<256;i++)p.push(i);for(let i=255;i>0;i--){const j=Math.floor(rnd()*(i+1));[p[i],p[j]]=[p[j],p[i]];}for(let i=0;i<512;i++)P[i]=p[i&255];
  const fade=t=>t*t*t*(t*(t*6-15)+10),lerp=(a,b,t)=>a+t*(b-a),grad=(h,x,y)=>{const u=(h&1)?-x:x,v=(h&2)?-y:y;return u+v;};
  const n=(x,y)=>{const X=Math.floor(x)&255,Y=Math.floor(y)&255;x-=Math.floor(x);y-=Math.floor(y);const u=fade(x),v=fade(y);const A=P[X]+Y,B=P[X+1]+Y;return lerp(lerp(grad(P[A],x,y),grad(P[B],x-1,y),u),lerp(grad(P[A+1],x,y-1),grad(P[B+1],x-1,y-1),u),v);};
  return(x,y)=>{let a=0,f=1,amp=1,tot=0;for(let o=0;o<5;o++){a+=n(x*f,y*f)*amp;tot+=amp;amp*=.5;f*=2.1;}return a/tot;};}
const TEXP={};
function texCanvas(nome,W,H,pintar,rep){if(TEXP[nome])return TEXP[nome];const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');pintar(x,W,H);const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.anisotropy=8;if(rep)tx.repeat.set(rep[0],rep[1]);TEXP[nome]=tx;return tx;}
function pixels(x,W,H,seed,fn){const img=x.createImageData(W,H),d=img.data,nz=ruido2(seed);for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=(j*W+i)*4;const [r,g,b]=fn(i/W,j/H,nz);d[k]=r;d[k+1]=g;d[k+2]=b;d[k+3]=255;}x.putImageData(img,0,0);}
const cl=v=>Math.max(0,Math.min(255,v));
/* calcário em blocos (pirâmide, templo, corredores) */
function texBlocos(nome,cor,lin,col,seed){return texCanvas(nome,512,512,(x,W,H)=>{pixels(x,W,H,seed||7,(u,v,nz)=>{const n=nz(u*14,v*14)*.5+nz(u*60,v*60)*.25;return [cl(cor[0]+n*60),cl(cor[1]+n*55),cl(cor[2]+n*45)];});
  x.strokeStyle='rgba(60,40,20,.55)';x.lineWidth=3;const h=H/lin;for(let j=0;j<=lin;j++){x.beginPath();x.moveTo(0,j*h);x.lineTo(W,j*h);x.stroke();const off=(j%2)*W/col/2;for(let i=0;i<=col;i++){x.beginPath();x.moveTo(i*W/col+off,j*h);x.lineTo(i*W/col+off,(j+1)*h);x.stroke();}}
  x.fillStyle='rgba(255,240,210,.08)';for(let j=0;j<lin;j++)x.fillRect(0,j*h+2,W,4);});}
const TX={
 areia:()=>texCanvas('areia',256,256,(x,W,H)=>pixels(x,W,H,11,(u,v,nz)=>{const n=nz(u*8,v*8)*.6+nz(u*40,v*40)*.3;return [cl(222+n*40),cl(186+n*36),cl(128+n*30)];}),[6,6]),
 campo:()=>texCanvas('campo',256,256,(x,W,H)=>{pixels(x,W,H,12,(u,v,nz)=>{const n=nz(u*10,v*10)*.6+nz(u*50,v*50)*.3;return [cl(98+n*40),cl(140+n*50),cl(58+n*30)];});x.strokeStyle='rgba(60,90,30,.5)';x.lineWidth=2;for(let i=0;i<W;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();}},[4,4]),
 agua:()=>texCanvas('agua',256,256,(x,W,H)=>pixels(x,W,H,13,(u,v,nz)=>{const n=nz(u*6,v*20)*.6+nz(u*30,v*80)*.4;return [cl(52+n*40),cl(118+n*50),cl(160+n*60)];}),[3,1]),
 calcario:()=>texBlocos('calcario',[212,188,140],10,6,7),
 calcarioInt:()=>texBlocos('calcarioInt',[176,152,112],8,4,9),
 granito:()=>texCanvas('granito',256,256,(x,W,H)=>{pixels(x,W,H,21,(u,v,nz)=>{const n=nz(u*30,v*30),m=nz(u*120,v*120);const p=m>.35?60:m<-.35?-60:0;return [cl(150+n*40+p),cl(70+n*30+p*.6),cl(62+n*30+p*.6)];});x.strokeStyle='rgba(40,10,10,.45)';x.lineWidth=3;for(let j=0;j<=4;j++){x.beginPath();x.moveTo(0,j*H/4);x.lineTo(W,j*H/4);x.stroke();}},[1,1]),
 adobe:()=>texCanvas('adobe',256,256,(x,W,H)=>pixels(x,W,H,22,(u,v,nz)=>{const n=nz(u*12,v*12)*.6+nz(u*60,v*60)*.3;return [cl(186+n*40),cl(150+n*35),cl(104+n*30)];})),
 linho:()=>texCanvas('linho',128,128,(x,W,H)=>{x.fillStyle='#e6d8b4';x.fillRect(0,0,W,H);x.strokeStyle='rgba(120,90,50,.35)';x.lineWidth=2;for(let i=-H;i<W;i+=10){x.beginPath();x.moveTo(i,0);x.lineTo(i+H,H);x.stroke();}},[2,4])
};
const matTex=(nome,color,extra={})=>mat(color,Object.assign({map:TX[nome]()},extra));
/* ---------- hieróglifos desenhados (sem depender de fonte) ---------- */
function glifo(x,k,cx,cy,s,cor){x.save();x.translate(cx,cy);x.scale(s/100,s/100);x.strokeStyle=cor;x.fillStyle=cor;x.lineWidth=7;x.lineCap='round';x.lineJoin='round';
 const B=()=>x.beginPath();
 if(k==='sol'){B();x.arc(0,0,38,0,Math.PI*2);x.stroke();B();x.arc(0,0,9,0,Math.PI*2);x.fill();}
 else if(k==='agua'){B();x.moveTo(-46,0);for(let i=0;i<8;i++){x.lineTo(-46+i*12+6,i%2?8:-8);}x.lineTo(46,0);x.stroke();}
 else if(k==='boca'){B();x.ellipse(0,0,44,16,0,0,Math.PI*2);x.stroke();B();x.moveTo(-40,0);x.lineTo(40,0);x.stroke();}
 else if(k==='pao'){B();x.moveTo(-34,18);x.arc(0,18,34,Math.PI,0);x.closePath();x.stroke();}
 else if(k==='ankh'){B();x.ellipse(0,-30,16,22,0,0,Math.PI*2);x.stroke();B();x.moveTo(-34,-4);x.lineTo(34,-4);x.moveTo(0,-8);x.lineTo(0,48);x.stroke();}
 else if(k==='olho'){B();x.moveTo(-44,0);x.quadraticCurveTo(0,-34,44,0);x.quadraticCurveTo(0,26,-44,0);x.stroke();B();x.arc(0,-2,10,0,Math.PI*2);x.fill();B();x.moveTo(-10,14);x.lineTo(-18,44);x.moveTo(8,14);x.quadraticCurveTo(26,40,40,34);x.stroke();B();x.moveTo(-46,-20);x.quadraticCurveTo(0,-48,46,-22);x.stroke();}
 else if(k==='cartucho'){B();x.ellipse(0,-6,26,46,0,0,Math.PI*2);x.stroke();B();x.moveTo(-26,48);x.lineTo(26,48);x.stroke();x.save();x.scale(.4,.4);x.translate(0,-50);glifo(x,'sol',0,-40,100,cor);glifo(x,'agua',0,60,100,cor);x.restore();}
 else if(k==='passaro'){B();x.ellipse(-4,0,22,14,0,0,Math.PI*2);x.stroke();B();x.arc(22,-16,9,0,Math.PI*2);x.stroke();B();x.moveTo(30,-16);x.lineTo(42,-12);x.moveTo(-20,8);x.lineTo(-40,18);x.moveTo(-6,14);x.lineTo(-10,36);x.moveTo(6,14);x.lineTo(8,36);x.stroke();}
 else if(k==='junco'){B();x.moveTo(-6,44);x.quadraticCurveTo(-14,0,6,-44);x.quadraticCurveTo(14,0,-6,44);x.stroke();}
 else if(k==='mao'){B();x.moveTo(-40,12);x.lineTo(30,12);x.quadraticCurveTo(44,6,40,-4);x.lineTo(-40,-6);x.closePath();x.stroke();}
 else if(k==='cobra'){B();x.moveTo(-44,10);x.bezierCurveTo(-20,-20,0,30,24,0);x.quadraticCurveTo(34,-12,44,-6);x.stroke();}
 x.restore();}
const GLIFOS_TEXTO=['passaro','agua','boca','sol','junco','pao','ankh','mao','olho','cobra','cartucho'];
/* parede de templo coberta de colunas de hieróglifos */
function texParedeGlifos(nome,cor,fundo,seed){return texCanvas(nome,512,512,(x,W,H)=>{pixels(x,W,H,seed||31,(u,v,nz)=>{const n=nz(u*12,v*12)*.5+nz(u*60,v*60)*.25;return [cl(fundo[0]+n*50),cl(fundo[1]+n*45),cl(fundo[2]+n*40)];});let s=seed||31;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};
  x.strokeStyle='rgba(80,55,30,.5)';x.lineWidth=2;for(let c=0;c<=8;c++){x.beginPath();x.moveTo(c*64,0);x.lineTo(c*64,H);x.stroke();}
  for(let c=0;c<8;c++)for(let r=0;r<8;r++){glifo(x,GLIFOS_TEXTO[Math.floor(rnd()*GLIFOS_TEXTO.length)],c*64+32,r*64+32,44,cor);}});}
/* ---------- peças básicas ---------- */
const AREIA=0xe0c48e,CALC=0xe2d0a8;
function piramide(lado,alt,opt={}){const g=new T.Group();const geo=new T.ConeGeometry(lado/Math.SQRT2,alt,4,1);geo.rotateY(Math.PI/4);geo.translate(0,alt/2,0);const tx=TX.calcario().clone();tx.needsUpdate=true;tx.repeat.set(lado/6,alt/6);const m=new T.Mesh(geo,mat(0xffffff,{map:tx,roughness:.85,flatShading:true}));g.add(m);
 if(opt.topo){const tp=new T.Mesh(new T.ConeGeometry(lado*.08/Math.SQRT2,alt*.08,4,1).rotateY(Math.PI/4),mat(0xf4f0e4,{roughness:.4}));tp.position.y=alt*.96;g.add(tp);}return g;}
function esfinge(){const g=new T.Group();const m=matTex('calcario',0xe8d4a8,{roughness:.9});const corpo=new T.Mesh(T.CapsuleGeometry?new T.CapsuleGeometry(.5,1.6,6,12):new T.CylinderGeometry(.5,.5,2.2,16),m);corpo.rotation.z=Math.PI/2;corpo.scale.set(1,1,.9);corpo.position.set(0,.55,0);g.add(corpo);
 [[.95,.18,.28],[.95,.18,-.28]].forEach(([x,y,z])=>{const p=new T.Mesh(new T.BoxGeometry(.9,.22,.26),m);p.position.set(x+.15,y,z);g.add(p);});
 const pesc=new T.Mesh(new T.BoxGeometry(.42,.6,.5),m);pesc.position.set(.95,.95,0);g.add(pesc);const cab=new T.Mesh(new T.SphereGeometry(.28,20,14),m);cab.position.set(1.05,1.38,0);cab.scale.set(.95,1.1,.85);g.add(cab);
 const nemes=new T.Mesh(new T.CylinderGeometry(.18,.42,.62,4,1),mat(0xd8c088,{roughness:.8}));nemes.rotation.y=Math.PI/4;nemes.position.set(.98,1.3,0);nemes.scale.set(1,1,.9);g.add(nemes);
 const base=new T.Mesh(new T.BoxGeometry(2.9,.12,1.2),m);base.position.y=.04;g.add(base);return g;}
function obelisco(alt=3.2){const g=new T.Group();const geo=new T.CylinderGeometry(.13,.22,alt,4,1);geo.rotateY(Math.PI/4);const tx=texParedeGlifos('obeliscoGlifos','#6a4a28',[214,190,140],41);const m=new T.Mesh(geo,mat(0xffffff,{map:tx,roughness:.8}));m.position.y=alt/2;g.add(m);
 const pt=new T.Mesh(new T.ConeGeometry(.185,.32,4).rotateY(Math.PI/4),mat(0xf0c048,{metalness:.7,roughness:.25,emissive:0x3a2a08}));pt.position.y=alt+.16;g.add(pt);return g;}
function trapezio(wb,wt,h,d){const s=new T.Shape();s.moveTo(-wb/2,0);s.lineTo(wb/2,0);s.lineTo(wt/2,h);s.lineTo(-wt/2,h);s.lineTo(-wb/2,0);const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);return geo;}
function templo(){const g=new T.Group();const tx=texParedeGlifos('pilonoGlifos','#5a3c20',[206,182,138],51);const m=mat(0xffffff,{map:tx,roughness:.85});
 [-1.05,1.05].forEach(x=>{const t=new T.Mesh(trapezio(1.6,1.25,2.4,.7),m);t.position.x=x;g.add(t);const borda=new T.Mesh(new T.BoxGeometry(1.32,.12,.76),mat(0xc8a878));borda.position.set(x,2.42,0);g.add(borda);});
 const porta=new T.Mesh(new T.BoxGeometry(.5,1.5,.6),mat(0xc8b088,{roughness:.85}));porta.position.set(0,.75,0);g.add(porta);const lintel=new T.Mesh(new T.BoxGeometry(.8,.25,.62),mat(0xb89868));lintel.position.set(0,1.6,0);g.add(lintel);
 const vao=new T.Mesh(new T.PlaneGeometry(.34,1.2),new T.MeshBasicMaterial({color:0x1a120a}));vao.position.set(0,.6,.31);g.add(vao);
 [-.55,.55].forEach(x=>{const mastro=new T.Mesh(new T.CylinderGeometry(.025,.025,3.0,6),mat(0x8a6a40));mastro.position.set(x,1.5,.4);g.add(mastro);const band=new T.Mesh(new T.PlaneGeometry(.3,.18),mat(0xc83030,{side:T.DoubleSide}));band.position.set(x+.15,2.85,.4);g.add(band);});return g;}
function palmeira(alt=1.8,seed=1){const g=new T.Group();let s=seed*97;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};const curva=new T.CatmullRomCurve3([V(0,0,0),V(.05+rnd()*.1,alt*.5,0),V(.15+rnd()*.15,alt,0)]);
 g.add(new T.Mesh(new T.TubeGeometry(curva,10,.05,6,false),mat(0x8a6a44,{roughness:.95})));const topo=curva.getPoint(1);const fm=mat(0x4a8a38,{side:T.DoubleSide,roughness:.7});
 for(let i=0;i<8;i++){const f=new T.Mesh(new T.PlaneGeometry(.95,.16,6,1),fm);const p=f.geometry.attributes.position;for(let k=0;k<p.count;k++){const xx=p.getX(k)+.475;p.setY(k,p.getY(k)-xx*xx*.35);p.setX(k,xx);}p.needsUpdate=true;f.geometry.computeVertexNormals();f.position.copy(topo);f.rotation.y=i/8*Math.PI*2+rnd()*.3;f.rotation.z=.25;g.add(f);}
 return g;}
function papiro(n=9,seed=3){const g=new T.Group();let s=seed*31;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};const hm=mat(0x5a9a40),tm=mat(0x8ac050,{roughness:.6});
 for(let i=0;i<n;i++){const h=.6+rnd()*.5,x=(rnd()-.5)*.5,z=(rnd()-.5)*.5,inc=(rnd()-.5)*.25;const st=new T.Mesh(new T.CylinderGeometry(.012,.018,h,5),hm);st.position.set(x,h/2,z);st.rotation.z=inc;g.add(st);const tufo=new T.Mesh(new T.ConeGeometry(.12,.16,8,1,true),tm);tufo.rotation.x=Math.PI;tufo.position.set(x-Math.sin(inc)*h/2,h+.05,z);g.add(tufo);}return g;}
function barco(){const g=new T.Group();const casco=new T.Mesh(new T.CylinderGeometry(.22,.22,1.6,16,1,false,Math.PI,Math.PI),mat(0x9a6a3a,{side:T.DoubleSide,roughness:.8}));casco.rotation.z=Math.PI/2;casco.scale.set(1,1,.7);g.add(casco);
 const pontas=[-1,1].map(sx=>{const p=new T.Mesh(new T.ConeGeometry(.16,.4,12,1,false,0,Math.PI),mat(0x9a6a3a,{side:T.DoubleSide}));p.rotation.z=-sx*Math.PI/2;p.position.set(sx*.95,.05,0);p.scale.set(1,1,.7);return p;});pontas.forEach(p=>g.add(p));
 const mastro=new T.Mesh(new T.CylinderGeometry(.018,.022,1.5,6),mat(0x6a4a2a));mastro.position.y=.72;g.add(mastro);const s=new T.Shape();s.moveTo(0,0);s.lineTo(.9,0);s.lineTo(0,1.25);s.lineTo(0,0);const vela=new T.Mesh(new T.ShapeGeometry(s),mat(0xf2ead6,{side:T.DoubleSide,roughness:.9}));vela.position.set(.02,.2,0);g.add(vela);return g;}
function shaduf(){const g=new T.Group();const mm=mat(0x8a6a44,{roughness:.9});[-.18,.18].forEach(z=>{const p=new T.Mesh(new T.CylinderGeometry(.03,.035,1.1,6),mm);p.position.set(0,.55,z);g.add(p);});const eixo=new T.Mesh(new T.CylinderGeometry(.02,.02,.42,6),mm);eixo.rotation.x=Math.PI/2;eixo.position.y=1.08;g.add(eixo);
 const braco=new T.Group();braco.position.y=1.08;g.add(braco);const vara=new T.Mesh(new T.CylinderGeometry(.018,.022,2.0,6),mm);vara.rotation.z=Math.PI/2;braco.add(vara);const peso=new T.Mesh(new T.SphereGeometry(.12,12,8),mat(0x7a6650,{roughness:.95}));peso.position.x=-.95;braco.add(peso);
 const corda=new T.Mesh(new T.CylinderGeometry(.006,.006,.5,4),mat(0x5a4a3a));corda.position.set(.95,-.25,0);braco.add(corda);const balde=new T.Mesh(new T.CylinderGeometry(.08,.06,.12,10),mat(0xa87a48));balde.position.set(.95,-.52,0);braco.add(balde);
 braco.rotation.z=.25;g.userData.tick=t=>{braco.rotation.z=.25+Math.sin(t*.9)*.22;};return g;}
function casa(){const g=new T.Group();const m=matTex('adobe',0xffffff,{roughness:.95});const b=new T.Mesh(new T.BoxGeometry(1.0,.62,.8),m);b.position.y=.31;g.add(b);const c=new T.Mesh(new T.BoxGeometry(.45,.35,.4),m);c.position.set(.22,.8,-.15);g.add(c);
 const porta=new T.Mesh(new T.PlaneGeometry(.2,.36),new T.MeshBasicMaterial({color:0x2a1c10}));porta.position.set(-.2,.2,.401);g.add(porta);[.12,.36].forEach(x=>{const j=new T.Mesh(new T.PlaneGeometry(.1,.08),new T.MeshBasicMaterial({color:0x2a1c10}));j.position.set(x,.42,.401);g.add(j);});return g;}
/* figuras humanas estilizadas (sem rosto realista: como bonecos de madeira dos túmulos) */
function pessoa(opt={}){const g=new T.Group();const pele=mat(opt.pele||0xa8683e,{roughness:.6}),tecido=mat(opt.tecido||0xf2ead6,{roughness:.85});
 [-.07,.07].forEach(x=>{const p=new T.Mesh(new T.CylinderGeometry(.04,.035,.5,8),pele);p.position.set(x,.25,0);g.add(p);});
 const saia=new T.Mesh(new T.CylinderGeometry(.13,.2,.32,10),tecido);saia.position.y=.58;g.add(saia);const tronco=new T.Mesh(new T.CylinderGeometry(.15,.12,.36,10),pele);tronco.position.y=.9;g.add(tronco);
 if(opt.colar){const c=new T.Mesh(new T.TorusGeometry(.12,.035,6,18),mat(0x3a7ab8,{roughness:.4}));c.rotation.x=Math.PI/2;c.position.y=1.04;g.add(c);}
 [-.19,.19].forEach((x,i)=>{const b=new T.Mesh(new T.CylinderGeometry(.032,.03,.42,8),pele);b.position.set(x,.88,0);b.rotation.z=(i?-1:1)*(opt.bracoAberto?.5:.1);g.add(b);});
 const cab=new T.Mesh(new T.SphereGeometry(.1,14,10),pele);cab.position.y=1.17;g.add(cab);const cabelo=new T.Mesh(new T.SphereGeometry(.105,14,10,0,Math.PI*2,0,Math.PI*.55),mat(0x1a1410));cabelo.position.y=1.18;g.add(cabelo);
 if(opt.nemes){const n=new T.Mesh(new T.CylinderGeometry(.09,.17,.26,4,1),mat(0xffffff,{map:texCanvas('nemes',64,64,(x,W,H)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#2a4a9a':'#e8c048';x.fillRect(0,i*H/8,W,H/8);}}),roughness:.5}));n.rotation.y=Math.PI/4;n.position.set(0,1.17,-.01);g.add(n);const ureu=new T.Mesh(new T.ConeGeometry(.02,.07,6),mat(0xe8c048,{metalness:.6,roughness:.3}));ureu.position.set(0,1.26,.1);g.add(ureu);const barba=new T.Mesh(new T.CylinderGeometry(.02,.015,.1,6),mat(0x1a1410));barba.position.set(0,1.04,.08);g.add(barba);}
 if(opt.cajado){const cj=new T.Mesh(new T.CylinderGeometry(.012,.012,1.3,6),mat(0x6a4a2a));cj.position.set(.3,.65,.05);g.add(cj);}
 return g;}
function escribaSentado(){const g=new T.Group();const pele=mat(0xb0703e,{roughness:.55});const corpo=pessoa({pele:0xb0703e});corpo.children.slice(0,2).forEach(o=>o.visible=false);corpo.position.y=-.38;g.add(corpo);
 const pernas=new T.Mesh(new T.BoxGeometry(.5,.14,.36),mat(0xf2ead6,{roughness:.85}));pernas.position.set(0,.1,.06);g.add(pernas);const rolo=new T.Mesh(new T.BoxGeometry(.34,.02,.2),mat(0xe8dcb0,{map:texParedeGlifos('papiroGlifos','#2a2018',[232,220,176],61)}));rolo.position.set(0,.19,.12);g.add(rolo);
 const base=new T.Mesh(new T.BoxGeometry(.62,.08,.5),mat(0xc8b088));base.position.y=.0;g.add(base);return g;}
function estatuaFarao(){const g=new T.Group();const pedra={pele:0xc8a878,tecido:0xd8c098};const f=pessoa(Object.assign({nemes:true},pedra));f.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&!o.material.map&&!o.material.metalness){o.material=o.material.clone();o.material.color.lerp(new T.Color(0xd2b88c),.6);}});f.scale.setScalar(2.2);g.add(f);
 const ped=new T.Mesh(new T.BoxGeometry(.9,.3,.7),matTex('calcario',0xffffff));ped.position.y=-.15;g.add(ped);g.position.y=.3;return g;}
function nilometro(){const g=new T.Group();const m=matTex('calcario',0xd8c8a0);for(let i=0;i<7;i++){const d=new T.Mesh(new T.BoxGeometry(.6,.12,.18),m);d.position.set(0,.7-i*.12,i*.18);g.add(d);}
 const parede=new T.Mesh(new T.BoxGeometry(.08,.9,1.3),m);parede.position.set(-.34,.35,.55);g.add(parede);for(let i=0;i<6;i++){const mk=new T.Mesh(new T.BoxGeometry(.01,.02,.12),new T.MeshBasicMaterial({color:0x4a2a10}));mk.position.set(-.295,.15+i*.12,.55);g.add(mk);}return g;}
function estela(){const g=new T.Group();const s=new T.Shape();s.moveTo(-.4,0);s.lineTo(.4,0);s.lineTo(.4,1.0);s.absarc(0,1.0,.4,0,Math.PI,false);s.lineTo(-.4,0);const geo=new T.ExtrudeGeometry(s,{depth:.14,bevelEnabled:false});geo.translate(0,0,-.07);
 const tx=texParedeGlifos('estelaGlifos','#3a2614',[214,192,150],71);tx.repeat.set(1.2,1.2);const m=new T.Mesh(geo,mat(0xffffff,{map:tx,roughness:.85}));g.add(m);return g;}
function roseta(){const g=new T.Group();const tx=texCanvas('roseta',256,320,(x,W,H)=>{pixels(x,W,H,81,(u,v,nz)=>{const n=nz(u*20,v*20)*.5;return [cl(70+n*50),cl(72+n*50),cl(78+n*50)];});x.strokeStyle='rgba(220,220,225,.75)';x.fillStyle='rgba(220,220,225,.75)';
  for(let r=0;r<3;r++)for(let c=0;c<6;c++)glifo(x,GLIFOS_TEXTO[(r*6+c)%GLIFOS_TEXTO.length],22+c*42,24+r*36,30,'rgba(225,225,230,.8)');
  x.lineWidth=2;for(let r=0;r<6;r++){x.beginPath();let px=10;x.moveTo(px,130+r*14);while(px<W-10){px+=6+Math.random()*6;x.lineTo(px,130+r*14+(Math.random()-.5)*6);}x.stroke();}
  x.font='bold 15px serif';const gr='ΠΤΟΛΕΜΑΙΟΣ ΒΑΣΙΛΕΥΣ ΑΙΩΝΟΒΙΟΣ ΗΓΑΠΗΜΕΝΟΣ ΥΠΟ ΤΟΥ ΦΘΑ ΘΕΟΣ ΕΠΙΦΑΝΗΣ ΕΥΧΑΡΙΣΤΟΣ';for(let r=0;r<7;r++)x.fillText(gr.slice((r*9)%40,(r*9)%40+26),10,226+r*14);});
 const geo=new T.BoxGeometry(.72,.95,.2);const lado=mat(0x4a4c52,{roughness:.6});const m=new T.Mesh(geo,[lado,lado,lado,lado,mat(0xffffff,{map:tx,roughness:.55}),lado]);m.position.y=.475;g.add(m);return g;}
function sarcofago(){const g=new T.Group();const m=matTex('granito',0xffffff,{roughness:.45});const caixa=new T.Mesh(new T.BoxGeometry(2.3,1.05,1.0),m);caixa.position.y=.525;g.add(caixa);const dentro=new T.Mesh(new T.BoxGeometry(2.05,.9,.75),new T.MeshStandardMaterial({color:0x2a0c0a,side:T.BackSide}));dentro.position.y=.6;g.add(dentro);return g;}
function mumia(){const g=new T.Group();const m=matTex('linho',0xffffff,{roughness:.9});const corpo=new T.Mesh(new T.CylinderGeometry(.2,.13,1.5,14),m);corpo.rotation.z=Math.PI/2;corpo.scale.set(1,1,.7);g.add(corpo);const cab=new T.Mesh(new T.SphereGeometry(.15,14,10),m);cab.position.x=.85;g.add(cab);
 const masc=new T.Mesh(new T.SphereGeometry(.152,14,10,0,Math.PI),mat(0xe0b040,{metalness:.7,roughness:.3}));masc.position.set(.87,.0,0);masc.rotation.y=Math.PI/2;masc.rotation.z=-Math.PI/2;g.add(masc);g.position.y=.22;return g;}
function canopicos(){const g=new T.Group();const cores=[0xc8b898,0xb8a888,0xd0c0a0,0xc0b090];cores.forEach((c,i)=>{const v=new T.Group();const corpo=new T.Mesh(new T.CylinderGeometry(.14,.1,.42,14),mat(c,{roughness:.5}));corpo.position.y=.21;v.add(corpo);const t=new T.Mesh(new T.SphereGeometry(.13,14,10),mat(c));t.position.y=.5;t.scale.set(1,1.15,1);v.add(t);
  const orelha=i===0?null:new T.Mesh(new T.ConeGeometry(.04,.12,6),mat(c));if(orelha){orelha.position.set(.07,.62,0);v.add(orelha);}v.position.set(-.48+i*.32,0,0);g.add(v);});return g;}
/* ---------- o vale do Nilo (maquete) ---------- */
/* curva do rio na maquete (x de -7 a 7) */
const rioZ=x=>2.2+Math.sin(x*.42)*.55;
function terreno(opt={}){const g=new T.Group();const W=opt.w||16,H=opt.h||11,seg=96;const geo=new T.PlaneGeometry(W,H,seg,Math.round(seg*H/W));geo.rotateX(-Math.PI/2);const p=geo.attributes.position,cor=new Float32Array(p.count*3);const nz=ruido2(5);const ca=new T.Color(0xe2c28a),cv=new T.Color(0x6e9a3e),cm=new T.Color(0x8a7a5a);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const d=Math.abs(z-rioZ(x));let y=0;let c=ca.clone();if(d<.7)y=-.12;else if(d<2.1){c=cv.clone().lerp(ca,Math.max(0,(d-1.6)/.5));y=.0;}else{y=Math.max(0,(d-2.1))*.05+nz(x*.35,z*.35)*.35*Math.min(1,(d-2.1)/2);c.lerp(cm,Math.max(0,nz(x*.6,z*.6)));}
  p.setY(i,y);cor[i*3]=c.r;cor[i*3+1]=c.g;cor[i*3+2]=c.b;}
 geo.setAttribute('color',new T.BufferAttribute(cor,3));geo.computeVertexNormals();const chao=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.95,map:TX.areia()}));g.add(chao);
 /* rio: faixa de água acompanhando a curva */
 const pts=[];for(let x=-W/2;x<=W/2+.01;x+=.25)pts.push([x,rioZ(x)]);const s=new T.Shape();pts.forEach(([x,z],i)=>{i?s.lineTo(x,-(z-.62)):s.moveTo(x,-(z-.62));});for(let i=pts.length-1;i>=0;i--){const [x,z]=pts[i];s.lineTo(x,-(z+.62));}
 const ag=new T.ShapeGeometry(s);ag.rotateX(-Math.PI/2);const txa=TX.agua();const agua=new T.Mesh(ag,mat(0xffffff,{map:txa,roughness:.15,metalness:.1,envMapIntensity:1.1,transparent:true,opacity:.92}));agua.position.y=-.03;g.add(agua);
 g.userData.agua=agua;g.userData.tick=t=>{txa.offset.x=t*.02;};return g;}
function rotulo(g,t,x,y,z,w,c){return textAt(g,t,x,y,z,w||1.6,c||'#fff2d6');}
function contexto(level){const g=new T.Group();const CTX={type:'context'};
 if(level===0){/* mapa: nordeste da África, Mediterrâneo ao norte, o Nilo cortando o deserto */
  const W=9,H=7;const tx=texCanvas('mapaEgito',512,400,(x,w,h)=>{pixels(x,w,h,91,(u,v,nz)=>{const n=nz(u*8,v*8)*.5;return [cl(214+n*40),cl(184+n*36),cl(130+n*30)];});
    x.fillStyle='#3a78a8';x.beginPath();x.moveTo(0,0);x.lineTo(w,0);x.lineTo(w,62);x.bezierCurveTo(w*.75,80,w*.62,52,w*.55,74);x.bezierCurveTo(w*.48,92,w*.4,70,w*.3,80);x.bezierCurveTo(w*.18,88,w*.08,70,0,78);x.closePath();x.fill();
    x.beginPath();x.moveTo(w*.72,120);x.lineTo(w*.78,110);x.lineTo(w,330);x.lineTo(w,400);x.lineTo(w*.92,400);x.closePath();x.fill();
    x.strokeStyle='#6aa040';x.lineWidth=18;x.lineCap='round';x.beginPath();x.moveTo(w*.5,82);x.bezierCurveTo(w*.52,170,w*.47,240,w*.56,300);x.bezierCurveTo(w*.6,340,w*.52,370,w*.55,400);x.stroke();
    x.strokeStyle='#2a6aa0';x.lineWidth=6;x.stroke();x.fillStyle='#6aa040';x.beginPath();x.moveTo(w*.42,84);x.lineTo(w*.58,84);x.lineTo(w*.51,118);x.closePath();x.fill();
    x.fillStyle='#4a2a10';x.font='bold 15px Segoe UI';x.fillText('▲ Gizé',w*.52,132);x.fillText('● Tebas (Luxor)',w*.57,262);});
  const mapa=new T.Mesh(new T.BoxGeometry(W,.12,H*.78),[mat(0xc8a878),mat(0xc8a878),mat(0xffffff,{map:tx,roughness:.9}),mat(0xc8a878),mat(0xc8a878),mat(0xc8a878)]);mapa.position.y=-.06;g.add(mapa);
  const rioHit=new T.Mesh(new T.BoxGeometry(.7,.2,H*.7),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));rioHit.position.set(.15,.05,.4);rioHit.userData.hit=CTX;g.add(rioHit);mapa.userData.hit=CTX;
  [[0.2,-1.95],[0.3,-1.7]].forEach(([x,z],i)=>{const p=piramide(.35,.25);p.position.set(x+i*.25,0,z);g.add(p);});
  rotulo(g,'Mar Mediterrâneo',-1.8,.5,-2.6,2.4,'#dff2ff');rotulo(g,'Rio Nilo',1.2,.5,0,1.6,'#cfeaff');rotulo(g,'Deserto',-2.6,.5,.8,1.4);rotulo(g,'Mar Vermelho',3.4,.5,1.2,2,'#dff2ff');rotulo(g,'ÁFRICA',-2.4,.5,2.2,1.6,'#ffe3a8');
  const linha=textFixo(g,'NORDESTE DA ÁFRICA · HÁ MAIS DE 5 MIL ANOS',0,2.4,-2.6,6,'#ffe3a8');return g;}
 if(level===1){const t=terreno({w:12,h:8});g.add(t);t.traverse(o=>{if(o.isMesh)o.userData.hit=CTX;});
  const sh=shaduf();sh.position.set(-1.2,0,rioZ(-1.2)-1.0);sh.rotation.y=.4;g.add(sh);[[-3,.9],[2.5,1.1],[4,.8]].forEach(([x,dz],i)=>{const c=casa();c.position.set(x,0,rioZ(x)-1.9-dz*.2);c.rotation.y=(i-1)*.3;g.add(c);});
  for(let i=0;i<9;i++){const x=-5+i*1.25;const p=palmeira(1.5+(i%3)*.3,i+1);p.position.set(x,0,rioZ(x)+(i%2?1.25:-1.25));g.add(p);}
  const b=barco();b.position.set(.5,.08,rioZ(.5));b.rotation.y=.2;g.add(b);[-2.4,-.4,1.6,3.4].forEach((x,i)=>{const f=pessoa({tecido:0xf2ead6});f.scale.setScalar(.55);f.position.set(x,0,rioZ(x)-1.45+(i%2)*.3);g.add(f);});
  rotulo(g,'Cheia: julho a outubro',-3.5,1.6,0,2.6,'#cfeaff');rotulo(g,'Lama fértil = plantação',3.2,1.6,0,2.8,'#d8f0b0');
  const ag=t.userData.agua;g.userData.tick=tt=>{t.userData.tick(tt);ag.scale.z=1+.35*(.5+.5*Math.sin(tt*.6));sh.userData.tick(tt);b.position.y=.08+Math.sin(tt*1.4)*.02;};return g;}
 /* 2: pirâmide social */
 const niveis=[['Faraó','#e8c048'],['Sacerdotes e nobres','#c89048'],['Escribas','#b8a070'],['Artesãos e comerciantes','#a89070'],['Camponeses','#8a9a58'],['Escravizados','#7a6a58']];const h=.55;
 niveis.forEach(([n,c],i)=>{const w=.9+i*.95;const b=new T.Mesh(new T.BoxGeometry(w,h,1.2),mat(new T.Color(c).getHex(),{roughness:.7}));b.position.y=(niveis.length-1-i)*h+h/2;g.add(b);const r=rotuloFixo(n,'#1a120a',Math.min(w*.92,1.9),60,false);r.position.set(0,b.position.y,.61);g.add(r);
  if(i===0){const f=pessoa({nemes:true,colar:true});f.scale.setScalar(.75);f.position.set(0,niveis.length*h,0);g.add(f);}});
 rotulo(g,'Topo: poucos, com muito poder',2.3,3.05,0,2.4,'#ffe3a8');rotulo(g,'Base: a maioria da população',3.0,1.3,0,2.3,'#d8f0b0');g.userData.semGiro=true;return g;}
/* explorar: tarde às margens do Nilo, com Gizé ao fundo */
const EX={piramides:[[-4.2,-3.6,2.6,1.75],[-1.4,-3.95,2.4,1.62],[.8,-4.1,1.3,.86]],esfinge:[-2.6,-1.6],templo:[3.6,-1.2],obelisco:[2.3,-.6],farao:[4.9,-.3],escriba:[1.4,-1.1],estela:[.3,-.9],roseta:[.95,-.75],casas:[[-5.6,.6],[-4.4,.75]],palmeiras:[-6.3,-5,-3.1,-.8,2.2,4.6,6],papiros:[[-2.2,1],[3.2,1.1],[5.5,1]],shaduf:[-3.2,.95],nilometro:[1.1,1.2],campones:[[-4.8,1.25],[-2.8,1.45]],barco:[.2]};
function explorar(opt={}){const g=new T.Group();const t=terreno();g.add(t);const ins=k=>({type:'inspect',key:k});tag(t.userData.agua,ins('nilo'));
 {const gz=new T.Group();EX.piramides.forEach(([x,z,l,a],i)=>{const p=piramide(l,a,{topo:i===1});p.position.set(x,0,z);gz.add(p);});tag(gz,ins('piramide'));g.add(real('piramide-giza',gz));}
 const ef0=esfinge();ef0.scale.setScalar(.55);tag(ef0,ins('esfinge'));const ef=real('esfinge-giza',ef0,{altura:.5});ef.position.set(EX.esfinge[0],0,EX.esfinge[1]);ef.rotation.y=-.2;g.add(ef);
 const tp0=templo();tp0.scale.setScalar(.6);tag(tp0,ins('templo'));const tp=real('templo-cgbang',tp0,{altura:.72});tp.position.set(EX.templo[0],0,EX.templo[1]-.9);tp.rotation.y=-.12;/* templo real: entrada voltada para o rio */g.add(tp);
 const ob=obelisco(2.2);ob.position.set(EX.obelisco[0],0,EX.obelisco[1]);tag(ob,ins('obelisco'));g.add(ob);
 const fa=estatuaFarao();fa.scale.setScalar(.6);fa.position.set(EX.farao[0],0,EX.farao[1]);fa.rotation.y=-.5;tag(fa,ins('farao'));g.add(fa);
 const es=escribaSentado();es.scale.setScalar(.8);es.position.set(EX.escriba[0],0,EX.escriba[1]);es.rotation.y=.3;tag(es,ins('escriba'));g.add(es);
 const st=estela();st.scale.setScalar(.55);st.position.set(EX.estela[0],0,EX.estela[1]);tag(st,ins('hieroglifos'));g.add(st);
 const rs=roseta();rs.scale.setScalar(.6);rs.position.set(EX.roseta[0],0,EX.roseta[1]);rs.rotation.y=-.3;tag(rs,ins('roseta'));g.add(rs);
 EX.casas.forEach(([x,dz],i)=>{const c=casa();c.scale.setScalar(.75);c.position.set(x,0,rioZ(x)-1.6-dz);c.rotation.y=i*.4-.2;tag(c,ins('casa'));g.add(c);});
 EX.palmeiras.forEach((x,i)=>{const p=palmeira(1.3+(i%3)*.25,i+2);p.position.set(x,0,rioZ(x)+(i%2?1.2:-1.15));g.add(p);});
 EX.papiros.forEach(([x,dz],i)=>{const p=papiro(9,i+4);p.position.set(x,-.05,rioZ(x)+(i%2?-.68:.7));tag(p,ins('papiro'));g.add(p);});
 const sh=shaduf();sh.scale.setScalar(.75);sh.position.set(EX.shaduf[0],0,rioZ(EX.shaduf[0])-.85);sh.rotation.y=.5;tag(sh,ins('shaduf'));g.add(sh);
 const nm=nilometro();nm.scale.setScalar(.6);nm.position.set(EX.nilometro[0],-.05,rioZ(EX.nilometro[0])-1.25);tag(nm,ins('cheias'));g.add(nm);
 const camps=EX.campones.map(([x,dz],i)=>{const f=pessoa({tecido:0xf2ead6,bracoAberto:i===1});f.scale.setScalar(.5);f.position.set(x,0,rioZ(x)-dz);f.rotation.y=i?2.4:.6;tag(f,ins('campones'));g.add(f);return f;});
 const bc=barco();bc.scale.setScalar(.8);bc.position.set(EX.barco[0],.04,rioZ(EX.barco[0]));tag(bc,ins('barco'));g.add(bc);
 g.userData.tick=tt=>{t.userData.tick(tt);sh.userData.tick&&sh.userData.tick(tt);bc.position.x=EX.barco[0]+Math.sin(tt*.12)*2.2;bc.position.z=rioZ(bc.position.x);bc.position.y=.04+Math.sin(tt*1.3)*.015;camps[1].rotation.y=2.4+Math.sin(tt*.8)*.3;};
 return g;}
/* ---------- fichas ampliadas ---------- */
function inspection(key){const g=new T.Group();let o;
 if(PECA_MUSEU[key]){const pm=PECA_MUSEU[key],h=key==='caixoes'?.9:key==='reserva'||key==='nefertiti'?1.1:1.9,w=key==='caixoes'?2.6:.9;o=real(pm.arq,caixaEspera(w,h,w*.7),{yaw:pm.yaw,ajuste:'altura'});}
 else if(key==='piramide'){o=real('piramide-giza',piramide(2.4,1.55,{topo:true}),{escala:1.6});}
 else if(key==='esfinge'){o=real('esfinge-giza',esfinge());}
 else if(key==='templo'){o=real('templo-cgbang',templo());}
 else if(key==='obelisco'){o=obelisco(3);}
 else if(key==='farao'){o=real('triade-menkaure',estatuaFarao(),{ajuste:'altura'});}
 else if(key==='escriba'){o=escribaSentado();o.scale.setScalar(2);}
 else if(key==='campones'){o=new T.Group();const f=pessoa({bracoAberto:true});f.scale.setScalar(1.4);o.add(f);const ce=new T.Mesh(new T.CylinderGeometry(.18,.14,.28,12),mat(0xc89048));ce.position.set(.5,.14,.2);o.add(ce);}
 else if(key==='hieroglifos'){o=estela();o.scale.setScalar(1.6);}
 else if(key==='roseta'){o=roseta();o.scale.setScalar(1.8);}
 else if(key==='barco'){o=barco();o.scale.setScalar(1.3);}
 else if(key==='shaduf'){o=shaduf();}
 else if(key==='casa'){o=casa();o.scale.setScalar(1.4);}
 else if(key==='papiro'){o=new T.Group();const p=papiro(14,5);p.scale.setScalar(1.6);o.add(p);const folha=new T.Mesh(new T.PlaneGeometry(.7,.5),mat(0xffffff,{map:texParedeGlifos('papiroGlifos','#2a2018',[232,220,176],61),side:T.DoubleSide}));folha.position.set(.95,.6,0);folha.rotation.y=-.3;o.add(folha);}
 else if(key==='nilo'||key==='cheias'){o=terreno({w:5,h:3.4});if(key==='cheias'){const nm=nilometro();nm.position.set(.4,-.05,rioZ(.4)-1.2);o.add(nm);}}
 else if(key==='sarcofago'){const s0=sarcofago();s0.scale.setScalar(.9);o=real('sarcofago-khufudjedef',s0);}
 else if(key==='mumia'){o=mumia();o.scale.setScalar(1.5);}
 else if(key==='canopicos'){const c0=canopicos();c0.scale.setScalar(1.8);o=real('vaso-canopico',c0,{ajuste:'altura'});}
 else{o=piramide(2,1.3);}
 tag(o,{type:'inspect',key});g.add(o);g.userData.tick=o.userData.tick;g.userData.pegavel=true;return g;}
/* ---------- mumificação: tabuleiro de etapas + a mesa do embalsamador ---------- */
function mesaMumia(st){const g=new T.Group();const n=st.colocados.filter(Boolean).length,tem=k=>st.colocados.includes(k);
 const mesa=new T.Mesh(new T.BoxGeometry(2.0,.12,.7),mat(0x8a6a44,{roughness:.9}));mesa.position.y=.7;g.add(mesa);[[-.85,-.25],[.85,-.25],[-.85,.25],[.85,.25]].forEach(([x,z])=>{const p=new T.Mesh(new T.BoxGeometry(.08,.7,.08),mat(0x6a4a2a));p.position.set(x,.35,z);g.add(p);});
 if(!tem('sarcofago')){const corpo=tem('linho')?mumia():new T.Group();if(!tem('linho')){const pele=mat(tem('natrao')?0x8a6a4a:0xb07848,{roughness:.8});const c=new T.Mesh(new T.CylinderGeometry(.17,.12,1.4,12),pele);c.rotation.z=Math.PI/2;c.scale.set(1,1,.7);corpo.add(c);const cab=new T.Mesh(new T.SphereGeometry(.13,12,10),pele);cab.position.x=.8;corpo.add(cab);corpo.position.y=.2;}
  corpo.position.y+=.76;g.add(corpo);if(tem('natrao')&&!tem('oleos')){const sal=new T.Mesh(new T.SphereGeometry(.5,16,8,0,Math.PI*2,0,Math.PI/2),mat(0xf2ece0,{roughness:1}));sal.scale.set(1.6,.35,.6);sal.position.y=.76;g.add(sal);}}
 else{const s=sarcofago();s.scale.setScalar(.75);s.position.set(0,.76,0);g.add(s);}
 if(tem('canopicos')){const c=canopicos();c.scale.setScalar(.75);c.position.set(0,0,.75);g.add(c);}
 if(tem('lavar')&&!tem('orgaos')){const j=new T.Mesh(new T.CylinderGeometry(.14,.1,.3,12),mat(0x6aa0c8,{roughness:.3}));j.position.set(-1.25,.15,.2);g.add(j);}
 textFixo(g,'A MESA DO EMBALSAMADOR · '+n+' DE 7',0,1.75,0,3.2,'#e8c050',false);return g;}
function sequencia(state,cfg){
 const g=new T.Group();const n=cfg.ordem.length,dy=.62,top=(n-1)*dy/2+.3;const corDe=k=>(cfg.cores&&cfg.cores[k])||'#c8a070';
 textFixo(g,cfg.titulo,.9,top+1.32,0,3.6,cfg.cor);if(!state.done)textFixo(g,'PEÇA → ESPAÇO AMARELO',.9,top+.5,0,3.0,'#ffe3a8',false);
 for(let i=0;i<n;i++){const y=top-i*dy;const key=state.colocados[i];
  const num=rotuloFixo(String(i+1),i===state.target?'#ffdb9f':'#8fb0c2',.5,96);num.position.set(-.55,y,.05);g.add(num);
  const cor=key?new T.Color(corDe(key)).multiplyScalar(.6).getHex():0x23364a;
  const placa=new T.Mesh(new T.BoxGeometry(2.6,.46,.16),mat(cor,{transparent:!key,opacity:key?1:.7}));placa.position.set(.9,y,0);tag(placa,{type:'seqSlot',index:i});g.add(placa);
  const txt=rotuloFixo(key?cfg.rotulos[key]:'?',key?'#fff8ec':'#ffe3a8',2.4,key?66:96);txt.position.set(.9,y,.1);g.add(txt);
  if(i===state.target&&!key){const marc=new T.Mesh(new T.BoxGeometry(2.72,.56,.06),new T.MeshBasicMaterial({color:0xefd094,wireframe:true}));marc.position.set(.9,y,.02);g.add(marc);}
  if(i<n-1){const seta=new T.ArrowHelper(V(0,-1,0),V(.9,y-.25,0),.12,0xe8c050,.08,.06);g.add(seta);}}
 const restantes=state.bandeja.filter(k=>!state.colocados.includes(k));const x0=-4.25;
 restantes.forEach((k,i)=>{const cols=2,c=i%cols,r=Math.floor(i/cols);const x=x0+c*2.02,y=top-.1-r*.78;
  const peca=new T.Mesh(new T.BoxGeometry(1.9,.64,.2),mat(new T.Color(corDe(k)).getHex(),{roughness:.45}));peca.position.set(x,y,.1);peca.userData.draggable=true;tag(peca,{type:'seqPiece',key:k});g.add(peca);
  const t=rotuloFixo(cfg.rotulos[k],'#10161c',1.86,64);t.position.set(x,y,.22);g.add(t);
  if(state.selected===k){const anel=new T.Mesh(new T.BoxGeometry(2.04,.78,.08),new T.MeshBasicMaterial({color:0xffffff,wireframe:true}));anel.position.set(x,y,.1);g.add(anel);}});
 if(!state.done)textFixo(g,'PEÇAS',x0+1.01,top+.5,0,2.3,'#cfe3ee',false);
 const mesa=mesaMumia(state);mesa.scale.setScalar(.95);mesa.position.set(-3.25,-2.85+Math.max(0,(4-Math.ceil(restantes.length/2)))*.25,0);g.add(mesa);
 g.userData.slots={top,dy};g.userData.semGiro=true;return g;}
/* ---------- dentro da Grande Pirâmide (metros reais; o percurso é a altura dos olhos) ---------- */
const ESCALA_VR=1;
const PIR={lado:230,alt:146};
const CAM=[ /* pontos do percurso */
 [V(0,1.7,430),V(0,2,310),V(0,4,200),V(0,10,138),V(0,18.6,104)],
 [V(0,18.6,103),V(0,13.5,92),V(0,8.6,81),V(0,9.6,78.5),V(0,15.5,66),V(0,21.6,52)],
 [V(0,21.8,51),V(0,32,30),V(0,42.4,8)],
 [V(0,44.2,6.5),V(0,44.6,1.5),V(0,44.6,-3.2),V(-1.2,44.6,-5.2)],
 [V(-1.2,44.6,-5.2),V(4,46.5,-6.6),V(14,51,-6.6),V(29,53,-6.6)]];
const ALVOS=[V(0,40,100),null,null,V(-3.6,43.6,-6.6),V(-5,52.6,-6.6)];/* trecho 5: corte lateral, olhando a pilha de câmaras de fora */
function caixaInterna(w,h,l,tx,rep){const t=tx.clone();t.needsUpdate=true;t.repeat.set(rep||l/2,1);return new T.Mesh(new T.BoxGeometry(w,h,l),mat(0xffffff,{map:t,side:T.BackSide,roughness:.9}));}
function segmentoCorredor(a,b,w,h,tx,pisoAbaixo){/* túnel retangular de a até b (pontos dos olhos), com o piso pisoAbaixo m abaixo da linha */const d=b.clone().sub(a);const L=d.length();const g=new T.Group();const c=caixaInterna(w,h,L+.6,tx,L/2);c.position.y=h/2-pisoAbaixo;g.add(c);
 g.position.copy(a).add(b).multiplyScalar(.5);g.lookAt(b.x,b.y,b.z);return g;}
function viagemCena(state){const g=new T.Group();const i=Math.min(state.trecho||0,CAM.length-1);const fora=i===0;const txI=TX.calcarioInt(),txG=TX.granito();
 /* exterior: a pirâmide inteira, o planalto e as vizinhas (só visíveis de fora) */
 const pir=piramide(PIR.lado,PIR.alt,{topo:false});g.add(pir);const chao=new T.Mesh(new T.PlaneGeometry(1400,1400),mat(0xffffff,{map:(()=>{const t=TX.areia().clone();t.needsUpdate=true;t.repeat.set(120,120);return t;})(),roughness:1}));chao.rotation.x=-Math.PI/2;chao.userData.semEnquadre=true;g.add(chao);
 const q=piramide(215,136);q.position.set(-260,0,-330);g.add(q);const m=piramide(103,65);m.position.set(-420,0,-560);g.add(m);
 const ent=new T.Mesh(new T.PlaneGeometry(1.1,1.25),new T.MeshBasicMaterial({color:0x140c06}));const zFace=PIR.lado/2*(1-18/PIR.alt);ent.position.set(0,18,zFace+.05);ent.rotation.x=-Math.atan(PIR.alt/(PIR.lado/2))+Math.PI/2;g.add(ent);
 const ceu=new T.Mesh(new T.SphereGeometry(900,32,16),new T.MeshBasicMaterial({side:T.BackSide,map:texCanvas('ceuDeserto',64,256,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3a78c8');gr.addColorStop(.45,'#9cc8ec');gr.addColorStop(.52,'#f2dcb0');gr.addColorStop(1,'#d8b880');x.fillStyle=gr;x.fillRect(0,0,w,h);})}));ceu.userData.semEnquadre=true;ceu.visible=fora;g.add(ceu);
 /* interior: corredores, galeria, câmara do rei e câmaras de alívio */
 const C=CAM;const corr=[[C[1][0],C[1][2]],[C[1][3],C[1][5]]];corr.forEach(([a,b])=>g.add(segmentoCorredor(a,b,1.05,1.2,txI,.75)));
 const nicho=new T.Mesh(new T.BoxGeometry(2.4,2.4,4),mat(0xffffff,{map:txI,side:T.BackSide}));nicho.position.set(0,9.4,79.5);g.add(nicho);
 /* Grande Galeria: paredes em degraus (falsa abóbada) */
 const ga=C[2][0],gb=C[2][2];const gal=new T.Group();gal.position.copy(ga).add(gb).multiplyScalar(.5);gal.lookAt(gb.x,gb.y,gb.z);const L=ga.distanceTo(gb)+1;
 /* planos (não caixas): piso, paredes em 7 degraus que se aproximam e o teto estreito */const pm=()=>{const t=txI.clone();t.needsUpdate=true;t.repeat.set(L/2,1);return mat(0xffffff,{map:t,side:T.DoubleSide,roughness:.9});};
 const piso=new T.Mesh(new T.PlaneGeometry(2.1,L),pm());piso.rotation.x=-Math.PI/2;piso.position.y=-1.5;gal.add(piso);
 for(let k=0;k<7;k++){const w=2.1-k*.16,h=1.23,y0=-1.5+k*h;[-1,1].forEach(sx=>{const pa=new T.Mesh(new T.PlaneGeometry(L,h),pm());pa.rotation.y=sx*Math.PI/2;pa.position.set(sx*w/2,y0+h/2,0);gal.add(pa);
   if(k<6){const wn=2.1-(k+1)*.16;const ld=new T.Mesh(new T.PlaneGeometry((w-wn)/2,L),pm());ld.rotation.x=Math.PI/2;ld.position.set(sx*(w+wn)/4,y0+h,0);gal.add(ld);}});}
 const teto=new T.Mesh(new T.PlaneGeometry(2.1-6*.16,L),pm());teto.rotation.x=Math.PI/2;teto.position.y=-1.5+7*1.23;gal.add(teto);
 g.add(gal);
 /* câmara do rei (granito) com o sarcófago */
 const camBox=new T.Mesh(new T.BoxGeometry(10.5,5.8,5.2),mat(0xffffff,{map:txG,side:T.BackSide,roughness:.6}));camBox.position.set(0,45.9,-6.6);g.add(camBox);
 g.add(segmentoCorredor(C[3][0],V(0,44.6,-3.95),1.05,1.4,txG,.9));
 const sar=sarcofago();sar.position.set(-3.6,43,-6.6);tag(sar,{type:'inspect',key:'sarcofago'});g.add(sar);
 /* câmaras de alívio: cinco vãos baixos, com a inscrição dos trabalhadores no último */
 for(let k=0;k<5;k++){const cx=new T.Mesh(new T.BoxGeometry(10.5,1+(k===4?1.5:0),5.2),mat(0xffffff,{map:txG,side:T.BackSide,roughness:.6}));cx.position.set(0,49.6+k*2.2+(k===4?.75:0),-6.6);g.add(cx);}
 const graf=new T.Mesh(new T.PlaneGeometry(1.6,.8),new T.MeshBasicMaterial({transparent:true,map:texCanvas('grafite',256,128,(x,w,h)=>{x.clearRect(0,0,w,h);glifo(x,'cartucho',60,64,90,'#c02818');x.fillStyle='#c02818';x.font='bold 22px serif';x.fillText('Khufu',100,70);})}));graf.position.set(-5.2,58.6,-6.6);graf.rotation.y=Math.PI/2;g.add(graf);
 if(i===4){[pir,chao,q,m].forEach(o=>{o.visible=false;});const tF=txI.clone();tF.needsUpdate=true;tF.repeat.set(8,6);const fundoP=new T.Mesh(new T.PlaneGeometry(44,34),mat(0x8a7a62,{map:tF,roughness:1}));fundoP.rotation.y=Math.PI/2;fundoP.position.set(-5.7,52,-6.6);fundoP.userData.semEnquadre=true;g.add(fundoP);/* corte lateral: o maciço de pedra atrás das câmaras */
  textAt(g,'Câmara do Rei',6.2,45.9,-6.6,3.2,'#ffe3a8');textAt(g,'Câmaras de alívio',6.6,53.6,-6.6,3.6,'#ffe3a8');textAt(g,'Recado dos trabalhadores: "Khufu"',-2,61.4,-6.6,4.4,'#ffd0c0');}
 /* tochas de referência no caminho (a luz principal é a lanterna do visitante) */
 if(!fora){[[0,9.6,80],[0,22,50],[0,43,6],[-4.5,46,-4.4],[4.5,46,-4.4]].forEach(([x,y,z])=>{const l=new T.PointLight(0xffb060,.9,14,1.6);l.position.set(x,y,z);g.add(l);const ch=new T.Mesh(new T.SphereGeometry(.08,8,6),new T.MeshBasicMaterial({color:0xffc070}));ch.position.set(x,y,z);g.add(ch);});}
 const curva=new T.CatmullRomCurve3(CAM[i]);const trilha=new T.Mesh(new T.TubeGeometry(curva,80,.025,5,false),new T.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:.5}));trilha.userData.semEnquadre=true;trilha.position.y=-1.2;if(i!==4)g.add(trilha);
 g.userData.viagem={curva,escalaVR:ESCALA_VR,claro:fora||i===4,alvo:ALVOS[i],fixo:i===4};g.userData.semGiro=true;g.userData.semEnquadre=false;return g;}
/* ---------- hieróglifos: parede do templo e o sinal da rodada em destaque ---------- */
function placaGlifo(k,dest){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');const gr=x.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#e6d2a2');gr.addColorStop(1,'#c8aa72');x.fillStyle=gr;x.fillRect(0,0,512,512);x.strokeStyle='#7a5228';x.lineWidth=14;x.strokeRect(10,10,492,492);glifo(x,k,256,256,300,dest?'#1a3a7a':'#5a3a18');const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;return tx;}
function hieroglifosCena(state){const g=new T.Group();const R=window.HISTORIA_DATA.HIEROGLIFOS;const rod=R[Math.min(state.rodada,R.length-1)];
 const tx=texParedeGlifos('paredeTemplo','#4a2e14',[210,186,140],101);const tc=tx.clone();tc.needsUpdate=true;tc.repeat.set(3,1.5);const parede=new T.Mesh(new T.BoxGeometry(9,4.2,.4),mat(0xffffff,{map:tc,roughness:.85}));parede.position.set(0,1.6,-.6);g.add(parede);
 [-4.7,4.7].forEach(x=>{const col=new T.Mesh(new T.CylinderGeometry(.35,.4,4.6,16),matTex('calcario',0xe0d0a8));col.position.set(x,1.8,-.3);g.add(col);const cap=new T.Mesh(new T.CylinderGeometry(.6,.35,.5,16),mat(0x6a9a58));cap.position.set(x,4.3,-.3);g.add(cap);});
 const placa=new T.Mesh(new T.BoxGeometry(2.1,2.1,.12),[mat(0xb89060),mat(0xb89060),mat(0xb89060),mat(0xb89060),mat(0xffffff,{map:placaGlifo(state.done?'cartucho':rod.glifo,true),roughness:.6}),mat(0xb89060)]);placa.position.set(0,1.75,-.25);placa.userData.hit={type:'glifo'};g.add(placa);
 const moldura=new T.Mesh(new T.TorusGeometry(1.55,.05,8,48),new T.MeshBasicMaterial({color:0xffd27f}));moldura.position.set(0,1.75,-.18);g.add(moldura);
 R.forEach((r,i)=>{const p=new T.Mesh(new T.PlaneGeometry(.55,.55),new T.MeshBasicMaterial({map:placaGlifo(r.glifo,false),transparent:true,opacity:i<state.rodada||state.done?1:.35}));p.position.set(-2.7+i*.9,-.25,-.35);g.add(p);if(i===state.rodada&&!state.done){const m=new T.Mesh(new T.PlaneGeometry(.66,.66),new T.MeshBasicMaterial({color:0xffd27f,wireframe:true}));m.position.copy(p.position).add(V(0,0,-.01));g.add(m);}});
 textFixo(g,state.done?'VOCÊ LEU COMO UM ESCRIBA':'O QUE ESTE SINAL QUER DIZER?',0,4.05,-.35,4.4,'#ffe3a8',false);
 const piso=new T.Mesh(new T.BoxGeometry(10,.1,3),matTex('calcario',0xd8c8a0));piso.position.set(0,-.65,.6);g.add(piso);g.userData.semGiro=true;return g;}
function desafio(){const g=explorar();g.scale.setScalar(.85);return g;}
function dispose(g){if(!g)return;const geos=new Set(),mats=new Set(),tex=new Set();const comp=new Set(Object.values(TEXP));g.traverse(o=>{if(o.userData.compartilhado)return;if(o.geometry&&!o.isSprite)geos.add(o.geometry);for(const m of [].concat(o.material||[])){if(!m)continue;mats.add(m);for(const t of [m.map,m.emissiveMap,m.normalMap,m.bumpMap]){if(t&&!comp.has(t))tex.add(t);}}});geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());tex.forEach(x=>x.dispose());if(g.parent)g.parent.remove(g);}
/* ---------- modelos reais (Sketchfab, CC BY 4.0; otimizados pela NEWPC para o Quest) ----------
   Cada peça nasce procedural (aparece na hora, sem esperar a rede) e é trocada pelo modelo real assim que ele carrega,
   no mesmo tamanho e no mesmo lugar, mantendo o ponto clicável. Sem GLTFLoader ou sem o arquivo, fica o procedural.
   Geometria e texturas do modelo ficam em cache e são compartilhadas entre as cópias (dispose não as apaga). */
const GLB={},GLB_ESPERA={};
function glb(arq,cb){const c=GLB[arq];if(c===false)return;if(c){cb(c);return;}(GLB_ESPERA[arq]=GLB_ESPERA[arq]||[]).push(cb);if(GLB_ESPERA[arq].length>1)return;
 if(!T.GLTFLoader){GLB[arq]=false;return;}
 new T.GLTFLoader().load('modelos/'+arq+'.glb',gl=>{const sc=gl.scene;sc.updateMatrixWorld(true);const b=new T.Box3().setFromObject(sc),ce=b.getCenter(new T.Vector3());sc.position.sub(new T.Vector3(ce.x,b.min.y,ce.z));
   const u=new T.Group();u.add(sc);u.traverse(o=>{o.userData.compartilhado=true;if(o.isMesh){o.frustumCulled=true;}});GLB[arq]=u;const fs=GLB_ESPERA[arq]||[];delete GLB_ESPERA[arq];fs.forEach(f=>{try{f(u);}catch(e){console.warn('modelo',arq,e);}});},
  undefined,()=>{GLB[arq]=false;delete GLB_ESPERA[arq];});}
/* troca o procedural pelo real. o.ajuste: 'max' (cabe na caixa do procedural, padrão) ou 'altura'; o.yaw gira o modelo (frente para +z) */
function real(arq,proc,o={}){const g=new T.Group();g.add(proc);proc.updateMatrixWorld(true);const pb=new T.Box3().setFromObject(proc),ps=pb.getSize(new T.Vector3()),pc=pb.getCenter(new T.Vector3());
 g.userData.real=arq;
 glb(arq,u=>{const rr=new T.Group(),c=u.clone(true);c.rotation.y=o.yaw||0;rr.add(c);rr.updateMatrixWorld(true);const s2=new T.Box3().setFromObject(rr).getSize(new T.Vector3());
  const k=(o.altura?o.altura/s2.y:o.ajuste==='altura'?ps.y/s2.y:Math.min(ps.x/s2.x,ps.y/s2.y,ps.z/s2.z))*(o.escala||1);rr.scale.setScalar(k);rr.position.set(pc.x,pb.min.y,pc.z);
  let hit=null;proc.traverse(x=>{if(!hit&&x.userData.hit)hit=x.userData.hit;});if(hit)tag(rr,hit);g.remove(proc);dispose(proc);g.add(rr);g.userData.trocado=true;});
 return g;}
/* peças de museu: escaneamentos reais (ficha, arquivo, giro, altura em metros na vitrine) */
const MUSEU=[['menkaure','estatua-menkaure-rainha',0,1.45],['triade','triade-menkaure',0,1.1],['reserva','cabeca-reserva',0,.5],['senenmut','estatua-senenmut',-Math.PI/2,1.0],
 ['nefertiti','nefertiti',Math.PI/2,.55],['ramses','estatua-ramses',0,1.1],['tanwetamani','estatua-tanwetamani',-Math.PI/2,1.2],['caixoes','caixoes-padimut',0,.7]];
const PECA_MUSEU=Object.fromEntries(MUSEU.map(([k,a,y,h])=>[k,{arq:a,yaw:y,h}]));
function caixaEspera(w,h,d){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:0xe8d8b0,transparent:true,opacity:.18,depthWrite:false}));m.position.y=h/2;const g=new T.Group();g.add(m);return g;}
function pedestal(w=.62,hh=.8){const g=new T.Group();const b=new T.Mesh(new T.BoxGeometry(w,hh,.62),mat(0x2a2620,{roughness:.6}));b.position.y=hh/2;g.add(b);const t=new T.Mesh(new T.BoxGeometry(w+.08,.04,.7),mat(0xc8a860,{metalness:.4,roughness:.4}));t.position.y=hh+.02;g.add(t);return g;}
function museu(){const g=new T.Group();const D=window.HISTORIA_DATA;
 const piso=new T.Mesh(new T.CircleGeometry(4.5,64),mat(0xffffff,{map:(()=>{const t=TX.calcario().clone();t.needsUpdate=true;t.repeat.set(6,6);return t;})(),roughness:.9}));piso.rotation.x=-Math.PI/2;piso.userData.semEnquadre=true;g.add(piso);
 const n=MUSEU.length,R=3.6;
 MUSEU.forEach(([k,arq,yaw,h],i)=>{const a=-1.25+2.5*i/(n-1);const x=Math.sin(a)*R,z=-Math.cos(a)*R;const base=new T.Group();base.position.set(x,0,z);base.rotation.y=-a;g.add(base);
  const cx=k==='caixoes',ph=cx?.45:.8;const p=pedestal(cx?1.5:.62,ph);base.add(p);const larg=cx?1.45:.6;const esp=caixaEspera(larg,h,cx?.6:larg*.7);tag(esp,{type:'inspect',key:k});
  const r=real(arq,esp,{yaw,ajuste:cx?'max':'altura'});r.position.y=ph+.04;base.add(r);
  const nome=(D.info[k]||{}).name||k;const pl=rotuloFixo(nome,'#ffe9b8',cx?1.3:.6,cx?60:72);pl.position.set(0,ph*.62,.315);base.add(pl);tag(p,{type:'inspect',key:k});});
 textFixo(g,'PEÇAS REAIS · ESCANEADAS EM MUSEUS',0,2.5,-3.4,3.6,'#e8c050',false);
 g.userData.semGiro=true;return g;}
window.HISTORIA_MODELS={V,mat,ball,label,rotuloFixo,textFixo,textAt,tag,contexto,explorar,inspection,sequencia,viagemCena,hieroglifosCena,desafio,dispose,glifo,ESCALA_VR,museu,real,glb};
})();
