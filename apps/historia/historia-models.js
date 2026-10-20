/* História VR · modelos (v1.2: Museu do Egito em tamanho real no lugar da maquete do Nilo)
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
  const W=9,H=7;const tx=texMapa();
  const mapa=new T.Mesh(new T.BoxGeometry(W,.12,H*.78),[mat(0xc8a878),mat(0xc8a878),mat(0xffffff,{map:tx,roughness:.9}),mat(0xc8a878),mat(0xc8a878),mat(0xc8a878)]);mapa.position.y=-.06;g.add(mapa);
  const rioHit=new T.Mesh(new T.BoxGeometry(.7,.2,H*.7),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));rioHit.position.set(.15,.05,.4);rioHit.userData.hit=CTX;g.add(rioHit);mapa.userData.hit=CTX;
  [[0.2,-1.95],[0.3,-1.7]].forEach(([x,z],i)=>{const p=piramide(.35,.25);p.position.set(x+i*.25,0,z);g.add(p);});
  rotulo(g,'Mar Mediterrâneo',-1.8,.5,-2.6,2.4,'#dff2ff');rotulo(g,'Rio Nilo',1.2,.5,0,1.6,'#cfeaff');rotulo(g,'Deserto',-2.6,.5,.8,1.4);rotulo(g,'Mar Vermelho',3.4,.5,1.2,2,'#dff2ff');rotulo(g,'ÁFRICA',-2.4,.5,2.2,1.6,'#ffe3a8');
  const linha=textFixo(g,'NORDESTE DA ÁFRICA · HÁ MAIS DE 5 MIL ANOS',0,2.4,-2.6,6,'#ffe3a8');return g;}
 if(level===1)return perfilVale();
 /* 2: pirâmide social */
 const niveis=[['Faraó','#e8c048'],['Sacerdotes e nobres','#c89048'],['Escribas','#b8a070'],['Artesãos e comerciantes','#a89070'],['Camponeses','#8a9a58'],['Escravizados','#7a6a58']];const h=.55;
 niveis.forEach(([n,c],i)=>{const w=.9+i*.95;const b=new T.Mesh(new T.BoxGeometry(w,h,1.2),mat(new T.Color(c).getHex(),{roughness:.7}));b.position.y=(niveis.length-1-i)*h+h/2;g.add(b);const r=rotuloFixo(n,'#1a120a',Math.min(w*.92,1.9),60,false);r.position.set(0,b.position.y,.61);g.add(r);
  if(i===0){const f=pessoa({nemes:true,colar:true});f.scale.setScalar(.75);f.position.set(0,niveis.length*h,0);g.add(f);}});
 rotulo(g,'Topo: poucos, com muito poder',2.3,3.05,0,2.4,'#ffe3a8');rotulo(g,'Base: a maioria da população',3.0,1.3,0,2.3,'#d8f0b0');g.userData.semGiro=true;return g;}
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
function dispose(g){if(!g)return;const geos=new Set(),mats=new Set(),tex=new Set();const comp=new Set(Object.values(TEXP));g.traverse(o=>{if(o.userData.compartilhado)return;if(o.geometry&&!o.isSprite)geos.add(o.geometry);for(const m of [].concat(o.material||[])){if(!m)continue;mats.add(m);for(const t of [m.map,m.emissiveMap,m.normalMap,m.bumpMap]){if(t&&!comp.has(t))tex.add(t);}}});geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());tex.forEach(x=>x.dispose());if(g.parent)g.parent.remove(g);}
/* ---------- modelos reais (Sketchfab, CC BY 4.0; otimizados pela NEWPC para o Quest) ----------
   Cada peça nasce procedural (aparece na hora, sem esperar a rede) e é trocada pelo modelo real assim que ele carrega,
   no mesmo tamanho e no mesmo lugar, mantendo o ponto clicável. Sem GLTFLoader ou sem o arquivo, fica o procedural.
   Geometria e texturas do modelo ficam em cache e são compartilhadas entre as cópias (dispose não as apaga). */
const GLB={},GLB_ESPERA={};
function glb(arq,cb){const c=GLB[arq];if(c===false)return;if(c){cb(c);return;}(GLB_ESPERA[arq]=GLB_ESPERA[arq]||[]).push(cb);if(GLB_ESPERA[arq].length>1)return;
 if(!T.GLTFLoader){GLB[arq]=false;return;}
 new T.GLTFLoader().load('modelos/'+arq+'.glb',gl=>{const sc=gl.scene;sc.updateMatrixWorld(true);const b=new T.Box3().setFromObject(sc),ce=b.getCenter(new T.Vector3());sc.position.sub(new T.Vector3(ce.x,b.min.y,ce.z));
   const u=new T.Group();u.add(sc);u.traverse(o=>{o.userData.compartilhado=true;if(o.isMesh){o.frustumCulled=true;[].concat(o.material||[]).forEach(m=>{if(m&&m.isMeshStandardMaterial&&!m.envMap){m.envMap=env();m.envMapIntensity=.55;m.needsUpdate=true;}});}});GLB[arq]=u;const fs=GLB_ESPERA[arq]||[];delete GLB_ESPERA[arq];fs.forEach(f=>{try{f(u);}catch(e){console.warn('modelo',arq,e);}});},
  undefined,()=>{GLB[arq]=false;delete GLB_ESPERA[arq];});}
/* troca o procedural pelo real. o.ajuste: 'max' (cabe na caixa do procedural, padrão) ou 'altura'; o.yaw gira o modelo (frente para +z) */
function real(arq,proc,o={}){const g=new T.Group();g.add(proc);proc.updateMatrixWorld(true);const pb=new T.Box3().setFromObject(proc),ps=pb.getSize(new T.Vector3()),pc=pb.getCenter(new T.Vector3());
 g.userData.real=arq;
 glb(arq,u=>{const rr=new T.Group(),c=u.clone(true);c.rotation.y=o.yaw||0;rr.add(c);rr.updateMatrixWorld(true);const s2=new T.Box3().setFromObject(rr).getSize(new T.Vector3());
  const k=(o.altura?o.altura/s2.y:o.ajuste==='altura'?ps.y/s2.y:Math.min(ps.x/s2.x,ps.y/s2.y,ps.z/s2.z))*(o.escala||1);rr.scale.setScalar(k);rr.position.set(pc.x,pb.min.y,pc.z);
  let hit=null;proc.traverse(x=>{if(!hit&&x.userData.hit)hit=x.userData.hit;});if(hit)tag(rr,hit);g.remove(proc);dispose(proc);g.add(rr);g.userData.trocado=true;const MM=window.HISTORIA_MODELS;if(hit&&MM&&MM.aoTrocar)MM.aoTrocar();});
 return g;}
/* peças de museu: escaneamentos reais (ficha, arquivo, giro, altura em metros na vitrine) */
const MUSEU=[['menkaure','estatua-menkaure-rainha',0,1.45],['triade','triade-menkaure',0,1.1],['reserva','cabeca-reserva',0,.5],['senenmut','estatua-senenmut',-Math.PI/2,1.0],
 ['nefertiti','nefertiti',Math.PI/2,.55],['ramses','estatua-ramses',0,1.1],['tanwetamani','estatua-tanwetamani',-Math.PI/2,1.2],['caixoes','caixoes-padimut',0,.7]];
const PECA_MUSEU=Object.fromEntries(MUSEU.map(([k,a,y,h])=>[k,{arq:a,yaw:y,h}]));
function caixaEspera(w,h,d){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:0xe8d8b0,transparent:true,opacity:.18,depthWrite:false}));m.position.y=h/2;const g=new T.Group();g.add(m);return g;}
function pedestal(w=.62,hh=.8){const g=new T.Group();const b=new T.Mesh(new T.BoxGeometry(w,hh,.62),mat(0x2a2620,{roughness:.6}));b.position.y=hh/2;g.add(b);const t=new T.Mesh(new T.BoxGeometry(w+.08,.04,.7),mat(0xc8a860,{metalness:.4,roughness:.4}));t.position.y=hh+.02;g.add(t);return g;}
/* ---------- v1.7 · acabamento do museu: pedra de verdade, luz quente, pilones e colunas papiriformes ----------
   Texturas geradas para o projeto (media/museu, sem licença de terceiros). Tudo é material simples ou plano aditivo:
   nenhuma luz extra, nenhum reflexo em tempo real, para manter os 72 quadros por segundo no óculos. */
const TLD=new T.TextureLoader(),TXM={};
function imgM(arq,cor=true,rep){const k=arq+(rep?rep.join('x'):'');if(TXM[k])return TXM[k];const t=TLD.load('media/museu/'+arq);t.wrapS=t.wrapT=T.RepeatWrapping;if(cor)t.encoding=T.sRGBEncoding;t.anisotropy=8;if(rep)t.repeat.set(rep[0],rep[1]);TXM[k]=t;return t;}
let ENVM=null;/* reflexo quente de museu: paredes de arenito e claraboia clara */
function envMuseu(){if(ENVM)return ENVM;const W=128;const face=(claro)=>{const c=document.createElement('canvas');c.width=c.height=W;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,W);g.addColorStop(0,'#f6e4bc');g.addColorStop(.5,'#b8925c');g.addColorStop(1,'#5a4128');x.fillStyle=g;x.fillRect(0,0,W,W);if(claro){x.filter='blur(5px)';x.fillStyle='#fff6dc';x.fillRect(W*.3,W*.08,W*.4,W*.3);x.filter='none';}return c;};
 const lado=face(false),luz=face(true),cima=document.createElement('canvas');cima.width=cima.height=W;const cx=cima.getContext('2d');const rg=cx.createRadialGradient(W/2,W/2,4,W/2,W/2,W*.7);rg.addColorStop(0,'#ffffff');rg.addColorStop(.4,'#ffeec8');rg.addColorStop(1,'#8a6a40');cx.fillStyle=rg;cx.fillRect(0,0,W,W);const baixo=document.createElement('canvas');baixo.width=baixo.height=W;const bx=baixo.getContext('2d');bx.fillStyle='#6a5236';bx.fillRect(0,0,W,W);
 ENVM=new T.CubeTexture([luz,lado,cima,baixo,lado,luz]);ENVM.encoding=T.sRGBEncoding;ENVM.needsUpdate=true;return ENVM;}
let MOURO=null;const ouroM=()=>MOURO||(MOURO=new T.MeshStandardMaterial({color:0xd8aa4c,metalness:.75,roughness:.3,envMap:envMuseu(),envMapIntensity:1.1}));
/* funde as malhas de um grupo por material (menos chamadas de desenho no óculos). Só para peças sem clique. */
function fundir(raiz){raiz.updateMatrixWorld(true);const inv=new T.Matrix4().copy(raiz.matrixWorld).invert(),porMat=new Map(),tirar=[];
 raiz.traverse(o=>{if(!o.isMesh||o.userData.hit)return;const mats=Array.isArray(o.material)?o.material:[o.material];let geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
  const mt=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);geo.applyMatrix4(mt);const grupos=Array.isArray(o.material)&&o.geometry.groups.length?o.geometry.groups:[{start:0,count:geo.attributes.position.count,materialIndex:0}];
  grupos.forEach(gr=>{const m=mats[gr.materialIndex||0];if(!porMat.has(m))porMat.set(m,[]);porMat.get(m).push({geo,start:gr.start,count:gr.count,ro:o.renderOrder});});tirar.push(o);});
 tirar.forEach(o=>o.parent.remove(o));
 porMat.forEach((lista,m)=>{const at={position:[],normal:[],uv:[]};lista.forEach(({geo,start,count})=>{for(const k in at){const a=geo.attributes[k];for(let i=start;i<start+count;i++){if(k==='uv'){at.uv.push(a?a.getX(i):0,a?a.getY(i):0);}else{at[k].push(a.getX(i),a.getY(i),a.getZ(i));}}}});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(at.position,3));g.setAttribute('normal',new T.Float32BufferAttribute(at.normal,3));g.setAttribute('uv',new T.Float32BufferAttribute(at.uv,2));
  const mesh=new T.Mesh(g,m);mesh.renderOrder=lista[0].ro;mesh.userData.semEnquadre=true;raiz.add(mesh);});
 return raiz;}
/* caixa com as faces laterais inclinadas (talude dos pilones): base wb x db, topo wt x dt */
function caixaTalude(wb,wt,db,dt,h){const g=new T.BoxGeometry(1,1,1);const p=g.attributes.position;for(let i=0;i<p.count;i++){const top=p.getY(i)>0;p.setXYZ(i,p.getX(i)*(top?wt:wb),p.getY(i)*h+h/2,p.getZ(i)*(top?dt:db));}g.computeVertexNormals();return g;}
/* disco solar alado (símbolo de proteção sobre as portas dos templos) */
function texDiscoAlado(){return texCanvas('discoAlado',1024,256,(x,W,H)=>{const cy=H*.52;
 for(const s of[-1,1]){for(let f=0;f<4;f++){x.beginPath();const y0=cy-38+f*22,len=W*.42-f*40;x.moveTo(W/2+s*70,y0);x.quadraticCurveTo(W/2+s*(len*.6),y0-30+f*6,W/2+s*len,y0-10+f*14);x.lineTo(W/2+s*(len-10),y0+12+f*6);x.quadraticCurveTo(W/2+s*(len*.55),y0+6+f*4,W/2+s*70,y0+18);x.closePath();x.fillStyle=['#e8c050','#2a6aa8','#e8c050','#1e8a7a'][f];x.fill();x.strokeStyle='#5a3a10';x.lineWidth=3;x.stroke();}
  x.beginPath();x.moveTo(W/2+s*52,cy+10);x.quadraticCurveTo(W/2+s*68,cy-40,W/2+s*56,cy-62);x.lineWidth=12;x.strokeStyle='#e8c050';x.stroke();}
 x.beginPath();x.arc(W/2,cy-6,50,0,Math.PI*2);const g=x.createRadialGradient(W/2-12,cy-20,6,W/2,cy-6,50);g.addColorStop(0,'#ff9a5a');g.addColorStop(1,'#b8301c');x.fillStyle=g;x.fill();x.lineWidth=6;x.strokeStyle='#e8c050';x.stroke();});}
/* coluna papiriforme: fuste com amarras, capitel em flor de papiro aberta e ábaco */
function colunaPapiro(h,r=.36){const g=new T.Group();const pedra=new T.MeshStandardMaterial({map:imgM('arenito.jpg',true,[2,3]),normalMap:imgM('arenito-n.jpg',false,[2,3]),roughness:.85,envMap:envMuseu(),envMapIntensity:.3});
 const hc=.95,hf=h-hc-.22;const base=new T.Mesh(new T.CylinderGeometry(r*1.35,r*1.4,.18,28),pedra);base.position.y=.09;g.add(base);
 const pts=[];for(let i=0;i<=10;i++){const t=i/10;pts.push(new T.Vector2(r*(1-.18*t)*(1+.08*Math.sin(t*Math.PI)),.18+t*hf));}const f=new T.Mesh(new T.LatheGeometry(pts,28),pedra);g.add(f);
 const azul=new T.MeshStandardMaterial({color:0x1f5a9a,roughness:.5}),verde=new T.MeshStandardMaterial({color:0x2f7a5a,roughness:.6});
 [0,1,2,3,4].forEach(i=>{const b=new T.Mesh(new T.CylinderGeometry(r*.86,r*.86,.05,28),i%2?azul:ouroM());b.position.y=.18+hf-.06-i*.06;g.add(b);});
 const cp=[];for(let i=0;i<=12;i++){const t=i/12;cp.push(new T.Vector2(r*.82+r*1.25*Math.pow(t,1.7),.18+hf+t*hc));}
 const tx=texCanvas('capitelPapiro',512,256,(x,W,H)=>{x.fillStyle='#d8b878';x.fillRect(0,0,W,H);for(let i=0;i<16;i++){const x0=i*W/16;x.fillStyle=i%2?'#2f7a5a':'#3a8a9a';x.beginPath();x.moveTo(x0+W/32,H);x.quadraticCurveTo(x0,H*.4,x0+W/32,0);x.quadraticCurveTo(x0+W/16,H*.4,x0+W/32,H);x.fill();}x.fillStyle='#e8c050';x.fillRect(0,0,W,18);x.fillStyle='#1f5a9a';x.fillRect(0,18,W,10);});
 const cap=new T.Mesh(new T.LatheGeometry(cp,28),new T.MeshStandardMaterial({map:tx,roughness:.7,side:T.DoubleSide}));g.add(cap);
 const ab=new T.Mesh(new T.BoxGeometry(r*2.4,.22,r*2.4),pedra);ab.position.y=h-.11;g.add(ab);g.traverse(o=>{o.userData.semEnquadre=true;});return g;}
/* pilone: duas torres em talude, lintel com cornija em gola, disco solar alado e o nome da ala em ouro.
   Fica na passagem do átrio para a ala (z local = +L/2), com vão de 4,4 m para andar. */
let MDISCO=null;
function pilone(par,ala){let lt0=null;const g=new T.Group();g.position.set(0,0,MU.L/2);par.add(g);const H=MU.H,A=MU.A;
 const rel=texParedeGlifos('paredeTemplo','#5a3a1c',[214,182,132],101).clone();rel.needsUpdate=true;rel.repeat.set(.5,1.4);
 const pedra=new T.MeshStandardMaterial({map:rel,roughness:.85,envMap:envMuseu(),envMapIntensity:.3});const liso=new T.MeshStandardMaterial({map:imgM('arenito.jpg',true,[3,1]),normalMap:imgM('arenito-n.jpg',false,[3,1]),roughness:.85,envMap:envMuseu(),envMapIntensity:.3});
 const vao=4.4,wt=(A-vao)/2,mFx=new T.MeshBasicMaterial({color:new T.Color(ala.cor),toneMapped:false});[-1,1].forEach(s=>{const t=new T.Mesh(caixaTalude(wt,wt*.86,.8,.62,H),[pedra,pedra,liso,liso,pedra,pedra]);t.position.x=s*(vao/2+wt/2);g.add(t);
  const fx=new T.Mesh(new T.BoxGeometry(wt*.9,.08,.84),mFx);fx.position.set(s*(vao/2+wt/2),2.95,0);g.add(fx);});
 const lin=new T.Mesh(new T.BoxGeometry(vao+.1,H-3.3,.66),liso);lin.position.y=(3.3+H)/2;g.add(lin);
 const fx=new T.Mesh(new T.BoxGeometry(vao+.1,.06,.68),mFx);fx.position.y=3.33;g.add(fx);
 const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(.04,0);sh.quadraticCurveTo(.06,.2,.24,.26);sh.lineTo(.24,.3);sh.lineTo(0,.3);sh.closePath();
 [1,-1].forEach(s=>{const ge=new T.ExtrudeGeometry(sh,{depth:vao+.1,bevelEnabled:false});const c=new T.Mesh(ge,ouroM());c.rotation.y=-s*Math.PI/2;c.position.set(s*(vao+.1)/2,H-.32,s*.33);g.add(c);
  const da=new T.Mesh(new T.PlaneGeometry(2.0,.5),MDISCO||(MDISCO=new T.MeshBasicMaterial({map:texDiscoAlado(),transparent:true,toneMapped:false,depthWrite:false})));da.position.set(0,H-.6,s*.335);if(s<0)da.rotation.y=Math.PI;g.add(da);
  const lt=lt0?new T.Mesh(lt0.geometry,lt0.material):(lt0=textoPlano(ala.nome.toUpperCase(),'#f0cf80',vao-.3,.34,{k:.72}));lt.position.set(0,3.6,s*.336);if(s<0)lt.rotation.y=Math.PI;g.add(lt);});
 fundir(g);return g;}
/* feixes de sol da claraboia: planos aditivos cruzados, inclinados como luz da tarde */
function feixes(H){const g=new T.Group();const tx=texCanvas('feixeSol',64,256,(x,W,Hh)=>{const gr=x.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,'rgba(255,240,200,.95)');gr.addColorStop(.6,'rgba(255,226,170,.35)');gr.addColorStop(1,'rgba(255,220,160,0)');x.fillStyle=gr;x.fillRect(0,0,W,Hh);const lx=x.createLinearGradient(0,0,W,0);lx.addColorStop(0,'rgba(0,0,0,1)');lx.addColorStop(.25,'rgba(0,0,0,0)');lx.addColorStop(.75,'rgba(0,0,0,0)');lx.addColorStop(1,'rgba(0,0,0,1)');x.globalCompositeOperation='destination-out';x.fillStyle=lx;x.fillRect(0,0,W,Hh);});
 const m=new T.MeshBasicMaterial({map:tx,transparent:true,opacity:.2,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false,fog:false});
 [[-.7,0],[0,.6],[.7,1.2],[0,-.5]].forEach(([ox,ry])=>{const p=new T.Mesh(new T.PlaneGeometry(1.1,H*1.15),m);p.position.set(ox*.8+.35,H/2,-.2);p.rotation.set(-.32,ry,0,'YXZ');p.renderOrder=4;p.userData.semEnquadre=true;g.add(p);});
 fundir(g);g.userData.semEnquadre=true;return g;}
/* ---------- v1.2 · Museu do Egito: um átrio e quatro alas, em tamanho real ----------
   No óculos o aluno fica dentro do prédio e anda por teleporte (marcadores no chão ou qualquer ponto do piso).
   No 3D a câmera vê o prédio em corte, como casa de bonecas: paredes e teto são planos de um lado só, virados para dentro,
   então fecham a sala vistos de dentro e somem vistos de fora. Cada peça tem uma caixa invisível de clique, para o raio
   não testar os milhares de triângulos dos escaneamentos (importante no Quest). Medidas em metros. */
const MU={A:7,L:6,H:4.4};MU.R=MU.A/2+MU.L/2;
const ALA_TH=[0,-Math.PI/2,Math.PI/2,Math.PI];
const EIXO_Y=V(0,1,0);
const TIPO={real:'Escaneamento 3D de peça real',peca:'Modelo 3D de peça real',repro:'Reprodução digital',did:'Modelo didático',replica:'Réplica didática',art:'Modelo 3D artístico',sitio:'Modelo 3D de lugar real'};
TX.piso=()=>texCanvas('pisoMuseu2',512,512,(x,W,H)=>{pixels(x,W,H,17,(u,v,nz)=>{const n=nz(u*8,v*8)*.5+nz(u*60,v*60)*.25;return [cl(70+n*30),cl(62+n*26),cl(54+n*22)];});x.strokeStyle='rgba(20,16,12,.85)';x.lineWidth=3;for(let i=0;i<=2;i++){x.beginPath();x.moveTo(i*W/2,0);x.lineTo(i*W/2,H);x.stroke();x.beginPath();x.moveTo(0,i*H/2);x.lineTo(W,i*H/2);x.stroke();}});
TX.reboco=()=>texCanvas('rebocoMuseu',256,256,(x,W,H)=>pixels(x,W,H,23,(u,v,nz)=>{const n=nz(u*6,v*6)*.5+nz(u*40,v*40)*.3;const c=cl(170+n*50);return [c,c,c];}));
TX.friso=()=>texParedeGlifos('frisoMuseu3','#e2b85a',[22,44,92],83);/* v1.7: azul egípcio, como o teto */
/* luz de museu sem custo de luz real: manchas aditivas (piso, parede) e pontos no teto */
TX.poca=()=>texCanvas('pocaLuz',128,128,(x,W,H)=>{const g=x.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.45,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,W,H);});
let MPOCA=null;function poca(w,h,op){if(!MPOCA)MPOCA=new T.MeshBasicMaterial({map:TX.poca(),color:0xffd8a0,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});const m=new T.Mesh(new T.PlaneGeometry(w,h),op===undefined?MPOCA:MPOCA.clone());if(op!==undefined)m.material.opacity=op;m.userData.semEnquadre=true;m.renderOrder=2;return m;}
const PAREDE_ALA=[0x16303c,0x4a1a14,0x221d33,0x243020];
/* v1.7: arenito em todas as alas, com um leve tom da ala (a cor forte fica na faixa e no pilone) */
const PAREDE_TOM=[0xf2f0e6,0xffe8dc,0xf0e8f2,0xeef2e0];
TX.glifosParede=()=>texParedeGlifos('paredeEscrita','#3a2614',[212,188,142],97);
function geoUV(w,h,ru,rv){const g=new T.PlaneGeometry(w,h);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*ru,uv.getY(i)*rv);uv.needsUpdate=true;return g;}
/* texto nítido em placa grande (2048 px de largura): títulos, faixas e letreiros */
function textoPlano(txt,cor,w,h,opt={}){const W=2048,H=Math.max(64,Math.round(W*h/w));const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');if(opt.fundo){x.fillStyle=opt.fundo;x.fillRect(0,0,W,H);}
 x.textAlign='center';x.textBaseline='middle';const f=s=>(opt.peso||'700')+' '+s+'px Segoe UI,Arial';let s=Math.round(H*(opt.k||.62));x.font=f(s);while(x.measureText(txt).width>W*.94&&s>12){s-=4;x.font=f(s);}
 if(opt.sombra!==false){x.shadowColor='rgba(0,0,0,.65)';x.shadowBlur=Math.max(4,s*.1);}x.fillStyle=cor;x.fillText(txt,W/2,H/2+s*.04);
 const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.anisotropy=8;tx.minFilter=T.LinearMipmapLinearFilter;tx.generateMipmaps=true;
 return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tx,transparent:!opt.fundo,depthWrite:!!opt.fundo,toneMapped:false}));}
/* etiqueta da peça: nome e o que ela é (peça real escaneada, réplica, modelo didático) */
function placa(nome,tipo,cor,w=.56){const c=document.createElement('canvas');c.width=512;c.height=200;const x=c.getContext('2d');x.fillStyle='#1c1610';x.fillRect(0,0,512,200);x.fillStyle=cor||'#c8a860';x.fillRect(0,0,512,12);x.textAlign='center';x.textBaseline='middle';
 const caber=(t,s0,peso,min)=>{let s=s0;x.font=peso+' '+s+'px Segoe UI,Arial';while(x.measureText(t).width>484&&s>min){s-=2;x.font=peso+' '+s+'px Segoe UI,Arial';}};
 caber(nome,58,'600',24);x.fillStyle='#f6e8c6';x.fillText(nome,256,86);caber(tipo,34,'400',16);x.fillStyle='#c4b089';x.fillText(tipo,256,152);
 const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.anisotropy=8;return new T.Mesh(new T.PlaneGeometry(w,w*200/512),new T.MeshBasicMaterial({map:tx,toneMapped:false}));}
function pedestal2(w,d,hh){const g=new T.Group();const b=new T.Mesh(new T.BoxGeometry(w,hh,d),new T.MeshStandardMaterial({color:0x3a322b,roughness:.45,envMap:envMuseu(),envMapIntensity:.6}));b.position.y=hh/2;g.add(b);const t=new T.Mesh(new T.BoxGeometry(w+.02,.025,d+.02),ouroM());t.position.y=hh+.012;g.add(t);const r=new T.Mesh(new T.BoxGeometry(w-.04,.05,d-.04),mat(0x0e0c0a));r.position.y=.025;g.add(r);b.position.y=hh/2+.03;b.scale.y=(hh-.03)/hh;return g;}
function vitrine(w,d,h){const g=new T.Group();const vid=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color:0xe6f4ff,transparent:true,opacity:.1,roughness:.05,metalness:0,envMap:env(),envMapIntensity:1.2,depthWrite:false}));vid.position.y=h/2;vid.renderOrder=3;g.add(vid);
 const tampa=new T.Mesh(new T.BoxGeometry(w+.02,.04,d+.02),mat(0xe6e0d4,{roughness:.7}));tampa.position.y=h+.02;g.add(tampa);const luz=new T.Mesh(new T.PlaneGeometry(w*.8,d*.8),new T.MeshBasicMaterial({color:0xfff4e0,toneMapped:false}));luz.rotation.x=Math.PI/2;luz.position.y=h-.002;g.add(luz);
 const ar=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w,h,d)),new T.LineBasicMaterial({color:0xdad4c8,transparent:true,opacity:.55}));ar.position.y=h/2;g.add(ar);return g;}
/* encaixa um modelo procedural na altura h, centrado e apoiado em y=0 */
function ajustar(o,h,maxW){o.updateMatrixWorld(true);const b=new T.Box3().setFromObject(o),s=b.getSize(V()),c=b.getCenter(V());let k=h/Math.max(s.y,1e-3);if(maxW&&Math.max(s.x,s.z)*k>maxW)k=maxW/Math.max(s.x,s.z);o.position.sub(V(c.x,b.min.y,c.z));const g=new T.Group();g.add(o);g.scale.setScalar(k);if(o.userData.tick)g.userData.tick=o.userData.tick;return g;}
/* caixa de clique invisível (não desenha, mas o raio encontra) */
function caixaHit(w,h,d,y0,data){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({visible:false}));m.position.y=y0+h/2;m.userData.hit=data;m.userData.semEnquadre=true;return m;}
function coluna(h){const g=new T.Group();const pedra=matTex('calcarioInt',0xffffff,{roughness:.8});const f=new T.Mesh(new T.CylinderGeometry(.26,.31,h-.75,18),pedra);f.position.y=(h-.75)/2;g.add(f);
 [.9,1.05].forEach(y=>{const a=new T.Mesh(new T.CylinderGeometry(.315,.315,.06,18),mat(0x2a5a8a,{roughness:.5}));a.position.y=y;g.add(a);});
 const cap=new T.Mesh(new T.CylinderGeometry(.5,.27,.55,18),mat(0x5f8f4e,{roughness:.7}));cap.position.y=h-.48;g.add(cap);const ab=new T.Mesh(new T.BoxGeometry(.72,.2,.72),pedra);ab.position.y=h-.1;g.add(ab);return g;}
function texMapaAntigo(){return texCanvas('mapaEgito',512,400,(x,w,h)=>{pixels(x,w,h,91,(u,v,nz)=>{const n=nz(u*8,v*8)*.5;return [cl(214+n*40),cl(184+n*36),cl(130+n*30)];});
 x.fillStyle='#3a78a8';x.beginPath();x.moveTo(0,0);x.lineTo(w,0);x.lineTo(w,62);x.bezierCurveTo(w*.75,80,w*.62,52,w*.55,74);x.bezierCurveTo(w*.48,92,w*.4,70,w*.3,80);x.bezierCurveTo(w*.18,88,w*.08,70,0,78);x.closePath();x.fill();
 x.beginPath();x.moveTo(w*.72,120);x.lineTo(w*.78,110);x.lineTo(w,330);x.lineTo(w,400);x.lineTo(w*.92,400);x.closePath();x.fill();
 x.strokeStyle='#6aa040';x.lineWidth=18;x.lineCap='round';x.beginPath();x.moveTo(w*.5,82);x.bezierCurveTo(w*.52,170,w*.47,240,w*.56,300);x.bezierCurveTo(w*.6,340,w*.52,370,w*.55,400);x.stroke();
 x.strokeStyle='#2a6aa0';x.lineWidth=6;x.stroke();x.fillStyle='#6aa040';x.beginPath();x.moveTo(w*.42,84);x.lineTo(w*.58,84);x.lineTo(w*.51,118);x.closePath();x.fill();
 x.fillStyle='#4a2a10';x.font='bold 15px Segoe UI';x.fillText('▲ Gizé',w*.52,132);x.fillText('● Tebas (Luxor)',w*.57,262);});}
/* v1.7: mapa ilustrado do Egito (gerado para o projeto e conferido: delta, Sinai, Mar Vermelho, Gizé, Faium, Tebas, 1ª catarata), com os nomes já aplicados */
function texMapa(){return imgM('mapa-egito.jpg');}
function texFarao(){return texCanvas('bandeiraFarao',256,384,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1d3a72');g.addColorStop(1,'#0f2246');x.fillStyle=g;x.fillRect(0,0,W,H);x.strokeStyle='#e8c048';x.lineWidth=8;x.strokeRect(10,10,W-20,H-20);
 glifo(x,'sol',W/2,70,70,'#e8c048');glifo(x,'cartucho',W/2,190,120,'#e8c048');glifo(x,'ankh',W*.27,320,60,'#e8c048');glifo(x,'olho',W*.73,320,60,'#e8c048');});}
/* placa de parede (mapa, bandeira, parede de hieróglifos) com moldura escura */
function painel(par,o){const g=new T.Group();g.position.set(o.x,o.y,o.z);g.rotation.y=o.r;par.add(g);{const pw=poca(o.w*1.5,o.h*1.6,.35);pw.position.z=.002;g.add(pw);}const mo=new T.Mesh(new T.PlaneGeometry(o.w+.12,o.h+.12),mat(0x241a12,{roughness:.6}));mo.position.z=.005;g.add(mo);
 const m=new T.Mesh(o.geo||new T.PlaneGeometry(o.w,o.h),new T.MeshStandardMaterial({map:o.map,roughness:.85,envMap:env(),envMapIntensity:.25}));m.position.z=.012;g.add(m);if(o.key){const hit={type:'inspect',key:o.key};m.userData.hit=hit;mo.userData.hit=hit;}return g;}
/* porta da missão no fundo de cada ala */
/* v1.6: a porta do fundo de cada ala abre o Caderno da ala (reflexão da visita de estudo) */
function portaMissao(par,ala){const hit={type:'caderno',ala:ala.id};const g=new T.Group();g.position.set(0,0,-MU.L/2+.02);par.add(g);
 /* v1.7: portal de templo em miniatura: batentes em talude com hieróglifos, lintel com disco solar alado e cornija dourada */
 const VW=1.45,VH=2.25,JW=.4,JD=.32,LH=.3;
 const tx=texCanvas('porta2-'+ala.id,256,512,(x,W,H)=>{const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#05070a');gr.addColorStop(.5,'#16110c');gr.addColorStop(1,ala.cor);x.fillStyle=gr;x.fillRect(0,0,W,H);const rg=x.createRadialGradient(W/2,H*.6,10,W/2,H*.6,W*.85);rg.addColorStop(0,'rgba(255,226,160,.6)');rg.addColorStop(1,'rgba(255,226,160,0)');x.fillStyle=rg;x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(232,192,80,.85)';x.lineWidth=5;x.strokeRect(14,14,W-28,H-28);x.lineWidth=2;x.strokeRect(24,24,W-48,H-48);glifo(x,'ankh',W/2,H*.16,56,'rgba(232,192,80,.9)');});
 const vao=new T.Mesh(new T.PlaneGeometry(VW,VH),new T.MeshBasicMaterial({map:tx,toneMapped:false}));vao.position.y=VH/2;vao.userData.hit=hit;g.add(vao);
 const deco=new T.Group();g.add(deco);
 {const halo=poca(VW*2.6,VH*1.7,.55);halo.position.set(0,VH*.6,.004);g.add(halo);}
 const rel=texParedeGlifos('paredeTemplo','#5a3a1c',[214,182,132],101).clone();rel.needsUpdate=true;rel.repeat.set(.3,1.1);
 const pedra=new T.MeshStandardMaterial({map:rel,roughness:.85,envMap:envMuseu(),envMapIntensity:.35}),liso=new T.MeshStandardMaterial({map:imgM('arenito.jpg',true,[1,.4]),normalMap:imgM('arenito-n.jpg',false,[1,.4]),roughness:.85,envMap:envMuseu(),envMapIntensity:.35});
 const mFx=new T.MeshBasicMaterial({color:new T.Color(ala.cor),toneMapped:false});
 [-1,1].forEach(sx=>{const j=new T.Mesh(caixaTalude(JW,JW*.82,JD,JD*.8,VH+.02),[pedra,pedra,liso,liso,pedra,pedra]);j.position.set(sx*(VW/2+JW/2-.02),0,JD/2);deco.add(j);
  const b=new T.Mesh(new T.BoxGeometry(JW*.84,.06,JD*.86),mFx);b.position.set(sx*(VW/2+JW/2-.02),VH*.78,JD/2);deco.add(b);
  const p=new T.Mesh(new T.BoxGeometry(JW+.08,.12,JD+.08),ouroM());p.position.set(sx*(VW/2+JW/2-.02),.06,JD/2);deco.add(p);});
 const LW=VW+2*JW+.1;const lin=new T.Mesh(new T.BoxGeometry(LW,LH,JD+.04),liso);lin.position.set(0,VH+LH/2,JD/2);deco.add(lin);
 const fx=new T.Mesh(new T.BoxGeometry(LW,.05,JD+.06),mFx);fx.position.set(0,VH+.025,JD/2);deco.add(fx);
 {const sh=new T.Shape();sh.moveTo(-JD-.02,0);sh.lineTo(.02,0);sh.quadraticCurveTo(.04,.13,.16,.17);sh.lineTo(.16,.2);sh.lineTo(-JD-.02,.2);sh.closePath();const ge=new T.ExtrudeGeometry(sh,{depth:LW+.1,bevelEnabled:false});const c=new T.Mesh(ge,ouroM());c.rotation.y=-Math.PI/2;c.position.set((LW+.1)/2,VH+LH,JD+.02);deco.add(c);}
 fundir(deco);
 const da=new T.Mesh(new T.PlaneGeometry(1.5,.37),MDISCO||(MDISCO=new T.MeshBasicMaterial({map:texDiscoAlado(),transparent:true,toneMapped:false,depthWrite:false})));da.position.set(0,VH+LH/2,JD+.025);g.add(da);
 const t1=textoPlano('CADERNO DA ALA','#ffe3a8',1.1,.17,{k:.7});t1.position.set(0,VH*.6,.02);t1.userData.hit=hit;g.add(t1);
 const t2=textoPlano('Responda aqui','#ffffff',1.12,.26,{k:.66});t2.position.set(0,VH*.48,.02);t2.userData.hit=hit;g.add(t2);
 const t3=textoPlano('✎','#ffffff',.38,.38,{k:.8});t3.position.set(0,VH*.33,.02);t3.userData.hit=hit;g.add(t3);
 return vao;}
/* marcador de teleporte no chão */
function marcador(par,x,z,nome,data,cor){const g=new T.Group();g.position.set(x,0,z);par.add(g);
 const disco=new T.Mesh(new T.CircleGeometry(.42,40),new T.MeshBasicMaterial({color:new T.Color(cor),transparent:true,opacity:.38,depthWrite:false,toneMapped:false}));disco.rotation.x=-Math.PI/2;disco.position.y=.012;disco.userData.hit=data;g.add(disco);
 const anel=new T.Mesh(new T.RingGeometry(.43,.5,48),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}));anel.rotation.x=-Math.PI/2;anel.position.y=.014;anel.userData.hit=data;g.add(anel);
 const t=textoPlano(nome,'#ffffff',1.6,.24,{k:.7});t.rotation.x=-Math.PI/2;t.position.set(0,.016,.72);t.userData.hit=data;g.add(t);
 g.userData.anel=anel;return g;}
/* uma peça no pedestal: escaneamento real (arq) ou modelo didático (proc) */
function pecaMuseu(par,o,cor,ticks){const D=window.HISTORIA_DATA;const b=new T.Group();b.position.set(o.x,0,o.z);b.rotation.y=o.r||0;par.add(b);
 const w=o.w||.62,d=o.d||.62,ph=o.ph||.3,hit={type:'inspect',key:o.key};const p=pedestal2(w,d,ph);tag(p,hit);b.add(p);
 let corpo;if(o.arq)corpo=real(o.arq,caixaEspera(o.cw||w*.82,o.h,o.cd||d*.82),{yaw:o.yaw||0,ajuste:o.ajuste||'altura'});else{corpo=ajustar(o.proc(),o.h,o.maxW||Math.max(w,d)*.9);if(corpo.userData.tick)ticks.push(corpo.userData.tick);}
 corpo.position.y=ph+.04;b.add(corpo);
 if(o.vit){const v=vitrine(w-.04,d-.04,o.h+.14);v.position.y=ph+.04;b.add(v);}
 b.add(caixaHit(w,o.h+.12,d,ph,hit));
 const i=D.info[o.key]||{};const pl=placa(i.name||o.key,o.tipo,cor,Math.min(.6,w*.92));pl.position.set(0,Math.max(.16,ph*.58),d/2+.007);pl.userData.hit=hit;b.add(pl);
 return {b,ph,h:o.h};}
const ATRIO_PECAS=[{key:'quefren',x:-2.5,z:-2.35,r:.5,arq:'estatua-quefren',h:1.68,ph:.3,w:.75,d:.95,cw:.62,cd:.85,tipo:TIPO.real},{key:'estelaRamses',x:2.45,z:-2.35,r:-.5,arq:'estela-ramses',ajuste:'max',cw:1.45,cd:.4,h:1.0,w:1.55,d:.55,ph:.4,tipo:TIPO.real}];
const ALAS_PECAS=[
 /* Vida no Nilo */
 [{key:'nilo',painel:true,x:-3.47,y:1.8,z:-.75,r:Math.PI/2,w:3.7,h:2.08,map:()=>texMapa()},
  {key:'portadora',x:2.85,z:-1.7,r:-Math.PI/2,arq:'portadora-oferendas',h:.3,ph:1.0,vit:1,tipo:TIPO.real},
  {key:'barco',x:2.75,z:.55,r:-Math.PI/2,arq:'barco-ncma',ajuste:'max',cw:1.2,cd:.6,h:.9,w:1.4,d:.8,vit:1,ph:.75,tipo:TIPO.real}],
 /* Faraós e deuses */
 [{key:'farao',painel:true,x:-2.3,y:2.42,z:-2.97,r:0,w:.9,h:1.3,map:()=>texFarao()},
  {key:'menkaure',x:-2.85,z:-1.9,r:Math.PI/2,arq:'estatua-menkaure-rainha',h:1.42,ph:.35,tipo:TIPO.real},
  {key:'triade',x:-2.85,z:-.1,r:Math.PI/2,arq:'triade-menkaure',h:.95,ph:.75,tipo:TIPO.real},
  {key:'ramses',x:-2.85,z:1.7,r:Math.PI/2,arq:'estatua-ramses',h:1.1,ph:.6,tipo:TIPO.peca},
  {key:'mentuhotep',x:2.85,z:-1.9,r:-Math.PI/2,arq:'estatua-mentuhotep',h:2.05,ph:.3,tipo:TIPO.real},
  {key:'nefertiti',x:2.85,z:-.1,r:-Math.PI/2,arq:'nefertiti',yaw:Math.PI/2,h:.49,ph:1.0,vit:1,tipo:TIPO.repro},
  {key:'tanwetamani',x:2.85,z:1.7,r:-Math.PI/2,arq:'estatua-tanwetamani',yaw:-Math.PI/2,h:1.3,ph:.45,tipo:TIPO.real},
  {key:'senenmut',x:-1.4,z:-2.4,r:.25,arq:'estatua-senenmut',yaw:-Math.PI/2,h:.95,ph:.7,tipo:TIPO.real},
  {key:'obelisco',x:1.75,z:-2.35,r:0,arq:'obelisco',h:2.75,ph:.3,tipo:TIPO.art}],
 /* Mumificação e vida após a morte */
 [{key:'caixaCanopica',x:1.75,z:-2.3,r:-.3,arq:'caixa-canopica',ajuste:'max',cw:.62,cd:.62,h:.5,w:.75,d:.75,vit:1,ph:.85,tipo:TIPO.real},
  {key:'hunefer',x:-1.75,z:-2.3,r:.3,arq:'sarcofago-hunefer',h:1.9,ph:.3,w:.8,d:.7,tipo:TIPO.real},
  {key:'tairkap',x:-2.7,z:-.45,r:Math.PI/2,arq:'tairkap',yaw:Math.PI/2,ajuste:'max',cw:1.95,cd:.75,h:.8,w:2.05,d:.85,ph:.35,tipo:TIPO.real},
  {key:'caixoes',x:-2.75,z:1.75,r:Math.PI/2,arq:'caixoes-padimut',ajuste:'max',cw:1.85,cd:.62,h:.72,w:1.95,d:.75,ph:.4,tipo:TIPO.real},
  {key:'canopicos',x:2.85,z:-1.9,r:-Math.PI/2,arq:'vaso-canopico',h:.42,ph:1.0,vit:1,tipo:TIPO.real},
  {key:'reserva',x:2.85,z:-.3,r:-Math.PI/2,arq:'cabeca-reserva',h:.32,ph:1.1,vit:1,tipo:TIPO.real},
  {key:'sarcofago',x:2.6,z:1.6,r:-Math.PI/2,arq:'sarcofago-khufudjedef',ajuste:'max',cw:2.0,cd:.85,h:.95,w:2.1,d:.95,ph:.3,tipo:TIPO.real}],
 /* Escrita e memória */
 [{key:'hieroglifos',painel:true,x:-3.47,y:1.65,z:-.3,r:Math.PI/2,w:5.0,h:2.2,map:()=>TX.glifosParede(),geo:()=>geoUV(5,2.2,5/(8*.32),2.2/(8*.32))},
  {key:'roseta',x:-1.7,z:-2.3,r:.3,proc:roseta,h:1.12,w:.9,d:.5,ph:.45,tipo:TIPO.replica},
  {key:'escriba',x:2.85,z:-1.9,r:-Math.PI/2,arq:'escriba-tjenty',h:.34,ph:1.0,vit:1,tipo:TIPO.real},
  {key:'estela',x:1.75,z:-2.3,r:-.3,arq:'estela-hmane',h:.5,ph:.95,vit:1,tipo:TIPO.real},
  {key:'papiro',x:2.85,z:-.2,r:-Math.PI/2,arq:'papiro-rolo',yaw:Math.PI/2,ajuste:'max',cw:.62,cd:.3,h:.25,w:.8,d:.55,vit:1,ph:1.0,tipo:'Escaneamento 3D · Rollins College'},
  {key:'paleta',x:-2.75,z:1.75,r:Math.PI/2,arq:'paleta-escriba',yaw:-Math.PI/2,h:.3,ph:1.0,vit:1,tipo:TIPO.real},
  {key:'papiroOld',ignorar:true,proc:()=>{const g=new T.Group();const p=papiro(14,5);g.add(p);const vaso=new T.Mesh(new T.CylinderGeometry(.36,.3,.3,16),mat(0x8a5a34,{roughness:.9}));vaso.position.y=.1;g.add(vaso);const folha=new T.Mesh(new T.PlaneGeometry(.5,.36),mat(0xffffff,{map:texParedeGlifos('papiroGlifos','#2a2018',[232,220,176],61),side:T.DoubleSide}));folha.position.set(.05,.5,.42);folha.rotation.x=-.5;g.add(folha);return g;},h:1.0,w:.8,d:.8,ph:.3,tipo:TIPO.did},
  {key:'templo',x:2.6,z:1.7,r:-Math.PI/2,arq:'templo-cgbang',ajuste:'max',cw:1.35,cd:.9,h:.6,w:1.5,d:1.0,ph:.8,tipo:TIPO.art}]
];
function museuEgito(){const D=window.HISTORIA_DATA;const g=new T.Group();const ticks=[],marcas=[],portas=[];const A=MU.A,L=MU.L,H=MU.H;
 const mPiso=new T.MeshStandardMaterial({map:imgM('piso.jpg'),normalMap:imgM('piso-n.jpg',false),normalScale:new T.Vector2(.5,.5),roughness:.2,metalness:0,envMap:envMuseu(),envMapIntensity:.85}),mFriso=mat(0xffffff,{map:TX.friso(),roughness:.85}),mTeto=new T.MeshStandardMaterial({map:imgM('teto.jpg'),roughness:.9,envMap:envMuseu(),envMapIntensity:.2}),mRodape=mat(0x3a2a1a,{roughness:.6});let mParede=null;
 const chaoHit={type:'chao'};
 const piso=(w,d,x,z)=>{const m=new T.Mesh(geoUV(w,d,w/2.4,d/2.4),mPiso);m.rotation.x=-Math.PI/2;m.position.set(x,0,z);m.userData.semEnquadre=true;g.add(m);const h=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({visible:false}));h.rotation.x=-Math.PI/2;h.position.set(x,.004,z);h.userData.hit=chaoHit;h.userData.semEnquadre=true;g.add(h);
  const t=new T.Mesh(geoUV(w,d,w/3.5,d/3.5),mTeto);t.rotation.x=Math.PI/2;t.position.set(x,H,z);t.userData.semEnquadre=true;g.add(t);};
 /* parede com rodapé, faixa da cor da ala e friso de hieróglifos; plano virado para dentro (+z local) */
 const parede=(par,w,x,z,r,cor)=>{const p=new T.Group();p.position.set(x,0,z);p.rotation.y=r;par.add(p);const m=new T.Mesh(geoUV(w,H,w/2.5,H/2.5),mParede);m.userData.semEnquadre=true;m.position.y=H/2;p.add(m);
  const rd=new T.Mesh(new T.PlaneGeometry(w,.28),mRodape);rd.position.set(0,.14,.006);p.add(rd);
  const fr=new T.Mesh(geoUV(w,.5,w/.5/8,.125),mFriso);fr.position.set(0,H-.55,.006);p.add(fr);
  const bl=new T.Mesh(new T.PlaneGeometry(w,H),new T.MeshBasicMaterial({visible:false}));bl.position.y=H/2;bl.userData.hit={type:'parede'};bl.userData.semEnquadre=true;p.add(bl);/* bloqueia o raio (só por dentro) */
  if(cor){const fx=new T.Mesh(new T.PlaneGeometry(w,.07),new T.MeshBasicMaterial({color:new T.Color(cor),toneMapped:false}));fx.position.set(0,H-.86,.008);p.add(fx);}return p;};
 piso(A,A,0,0);
 /* luz zenital sobre a maquete de Gizé */
 const zen=new T.Mesh(new T.PlaneGeometry(3.2,3.2),new T.MeshBasicMaterial({map:texCanvas('claraboia',256,256,(x,W,Hh)=>{x.fillStyle='#fff6de';x.fillRect(0,0,W,Hh);x.fillStyle='#8a6a3a';for(let i=0;i<=4;i++){x.fillRect(i*W/4-4,0,8,Hh);x.fillRect(0,i*Hh/4-4,W,8);}}),toneMapped:false}));zen.rotation.x=Math.PI/2;zen.position.y=H-.01;zen.userData.semEnquadre=true;g.add(zen);
 {const mold=new T.Mesh(new T.BoxGeometry(3.5,.14,3.5),ouroM());mold.position.y=H-.05;mold.scale.set(1,1,1);const fu=new T.Mesh(new T.BoxGeometry(3.3,.15,3.3),new T.MeshBasicMaterial({color:0xfff6de,toneMapped:false}));fu.position.y=H-.04;mold.userData.semEnquadre=fu.userData.semEnquadre=true;g.add(mold);g.add(fu);}
 const fx=feixes(H);g.add(fx);{const sol=poca(2.6,1.9,.5);sol.rotation.x=-Math.PI/2;sol.position.set(.6,.011,1.1);g.add(sol);}
 {const cols=new T.Group();g.add(cols);[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([sx,sz])=>{const c=colunaPapiro(H);c.position.set(sx*A/2,0,sz*A/2);cols.add(c);});fundir(cols);}
 const alas=[];const pecas={};
 D.ALAS.forEach((ala,i)=>{const th=ALA_TH[i];const dir=V(-Math.sin(th),0,-Math.cos(th)),centro=dir.clone().multiplyScalar(MU.R);
  const ga=new T.Group();ga.position.copy(centro);ga.rotation.y=th;g.add(ga);mParede=new T.MeshStandardMaterial({color:PAREDE_TOM[i],map:imgM('arenito.jpg'),normalMap:imgM('arenito-n.jpg',false),normalScale:new T.Vector2(.8,.8),roughness:.88,envMap:envMuseu(),envMapIntensity:.3});
  {const m=new T.Mesh(geoUV(A,L,A/2.4,L/2.4),mPiso);m.rotation.x=-Math.PI/2;m.userData.semEnquadre=true;ga.add(m);const h=new T.Mesh(new T.PlaneGeometry(A,L),new T.MeshBasicMaterial({visible:false}));h.rotation.x=-Math.PI/2;h.position.y=.004;h.userData.hit=chaoHit;h.userData.semEnquadre=true;ga.add(h);
   const t=new T.Mesh(geoUV(A,L,A/3.5,L/3.5),mTeto);t.rotation.x=Math.PI/2;t.position.y=H;t.userData.semEnquadre=true;ga.add(t);}
  parede(ga,A,0,-L/2,0,ala.cor);parede(ga,L,-A/2,0,Math.PI/2,ala.cor);parede(ga,L,A/2,0,-Math.PI/2,ala.cor);
  /* título no fundo e letreiro na entrada (virado para o átrio) */
  const tt=textoPlano(ala.nome.toUpperCase(),'#e9c987',5.4,.4,{k:.72});tt.position.set(0,3.32,-L/2+.02);ga.add(tt);
  const st=textoPlano(ala.sub,'#e8dcc0',4.6,.22,{k:.66,peso:'500'});st.position.set(0,3.0,-L/2+.02);ga.add(st);
  pilone(ga,ala);
  portas.push(portaMissao(ga,ala));
  const local=(x,z)=>V(x,0,z).applyAxisAngle(EIXO_Y,th).add(centro);
  ALAS_PECAS[i].forEach(o=>{if(o.ignorar)return;if(o.painel){painel(ga,Object.assign({},o,{map:o.map(),geo:o.geo&&o.geo()}));pecas[o.key]={pos:local(o.x+Math.sin(o.r)*.02,o.z+Math.cos(o.r)*.02),yaw:th+o.r,y:o.y,h:o.h,ala:i,painel:true};return;}
   const r=pecaMuseu(ga,o,ala.cor,ticks);pecas[o.key]={pos:local(o.x,o.z),yaw:th+(o.r||0),y:r.ph+.04+o.h/2,h:o.h,ala:i,raio:Math.hypot(o.w||.62,o.d||.62)/2+.22};
   const lz=new T.Mesh(new T.CircleGeometry(.16,24),new T.MeshBasicMaterial({color:0xfff3d6,toneMapped:false}));lz.rotation.x=Math.PI/2;lz.position.set(o.x,H-.012,o.z);ga.add(lz);
   const pc=poca(2.0,2.0,.75);pc.rotation.x=-Math.PI/2;pc.position.set(o.x,.01,o.z);ga.add(pc);
   const lado=Math.abs(o.x)>2.4?Math.sign(o.x):0;const pw=poca(2.2,3.6,.6);
   if(lado){pw.position.set(lado*(A/2-.015),2.0,o.z);pw.rotation.y=-lado*Math.PI/2;}else{pw.position.set(o.x,2.0,-L/2+.015);}ga.add(pw);});
  const mk=marcador(ga,0,1.55,ala.nome,{type:'ala',index:i},ala.cor);marcas.push(mk);
  alas.push({theta:th,centro,spot:local(0,1.55),nome:ala.nome});});
 /* átrio: maquete de Gizé com os modelos 3D das pirâmides e da Esfinge */
 {const m=new T.Group();g.add(m);const base=new T.Mesh(new T.CylinderGeometry(1.1,1.16,.78,48),mat(0x2c2620,{roughness:.55}));base.position.y=.39;m.add(base);const tampo=new T.Mesh(new T.CylinderGeometry(1.16,1.16,.05,48),mat(0xb89a58,{metalness:.45,roughness:.38}));tampo.position.y=.8;m.add(tampo);
  const areia=new T.Mesh(new T.CylinderGeometry(1.08,1.08,.03,48),matTex('areia',0xffffff,{roughness:1}));areia.position.y=.84;m.add(areia);
  const gz0=new T.Group();[[-.5,-.2,.6,.4],[.05,-.3,.56,.37],[.5,-.38,.3,.2]].forEach(([x,z,l,a],k)=>{const p=piramide(l,a,{topo:k===1});p.position.set(x,0,z);gz0.add(p);});
  const gz=real('piramide-giza',gz0);gz.position.y=.855;m.add(gz);const ph=caixaHit(1.6,.45,1.0,.85,{type:'inspect',key:'piramide'});ph.position.z=-.15;m.add(ph);
  const ef0=esfinge();const ef=real('esfinge-giza',ajustar(ef0,.12),{altura:.12});ef.position.set(-.35,.855,.5);ef.rotation.y=.2;m.add(ef);const eh=caixaHit(.42,.22,.26,.85,{type:'inspect',key:'esfinge'});eh.position.x=-.35;eh.position.z=.5;m.add(eh);
  const pz=poca(3.4,3.4,.55);pz.rotation.x=-Math.PI/2;pz.position.y=.01;m.add(pz);const pl=placa('Planalto de Gizé','Pirâmides e Esfinge · '+TIPO.sitio,'#d8c088',.62);pl.position.set(.45,.5,1.13);pl.rotation.y=.4;pl.userData.hit={type:'inspect',key:'piramide'};m.add(pl);
  pecas.piramide={pos:V(0,0,0),yaw:0,y:1.05,h:.45,ala:-1,raio:1.45};
  /* v1.3: Quéfren e a estela da Esfinge nos cantos do átrio, virados para quem entra */
  ATRIO_PECAS.forEach(o=>{const r=pecaMuseu(g,o,'#d8c088',ticks);pecas[o.key]={pos:V(o.x,0,o.z),yaw:o.r,y:r.ph+.04+o.h/2,h:o.h,ala:-1,raio:Math.hypot(o.w||.62,o.d||.62)/2+.22};
   const pc=poca(2.0,2.0,.75);pc.rotation.x=-Math.PI/2;pc.position.set(o.x,.01,o.z);g.add(pc);const lz=new T.Mesh(new T.CircleGeometry(.16,24),new T.MeshBasicMaterial({color:0xfff3d6,toneMapped:false}));lz.rotation.x=Math.PI/2;lz.position.set(o.x,MU.H-.012,o.z);g.add(lz);});pecas.esfinge={pos:V(-.35,0,.5),yaw:0,y:.95,h:.15,ala:-1};}
 const inicio={spot:V(0,0,2.4),theta:0};marcas.push(marcador(g,0,2.4,'Átrio',{type:'ala',index:-1},'#d8c088'));
 const boas=textoPlano('MUSEU DO EGITO ANTIGO','#c9a35a',3.4,.34,{k:.72,sombra:false});boas.rotation.x=-Math.PI/2;boas.position.set(0,.006,1.45);boas.userData.semEnquadre=true;g.add(boas);/* inscrição no piso do átrio */
 /* obstáculos para quem anda: pedestais, a mesa de Gizé e as colunas do átrio (círculos no piso) */
 const obst=Object.values(pecas).filter(p=>p.raio).map(p=>({x:p.pos.x,z:p.pos.z,r:p.raio})).concat([[1,1],[1,-1],[-1,1],[-1,-1]].map(([a,b])=>({x:a*MU.A/2,z:b*MU.A/2,r:.62})))
  .concat(alas.flatMap(a=>[-1,1].flatMap(s=>[2.65,3.15].map(xx=>{const p=V(s*xx,0,MU.L/2).applyAxisAngle(EIXO_Y,a.theta).add(a.centro);return {x:p.x,z:p.z,r:.48};}))));/* v1.7: torres dos pilones */
 g.userData={museu:true,tomQuente:true,semGiro:true,alas,pecas,inicio,obst,
  alaDe:p=>{const a=MU.A/2;if(Math.abs(p.x)<=a&&Math.abs(p.z)<=a)return -1;if(p.z<-a)return 0;if(p.x>a)return 1;if(p.x<-a)return 2;return 3;},
  tick:t=>{ticks.forEach(f=>f(t));marcas.forEach((m,i)=>{const k=1+.07*Math.sin(t*2.4+i);m.userData.anel.scale.set(k,k,1);});portas.forEach((p,i)=>p.material.color.setScalar(.82+.18*Math.sin(t*1.6+i)));}};
 return g;}
/* v1.4: cópia de uma peça do museu, para aparecer à frente do aluno (base em y=0, frente para +z) */
function copiaPeca(key){let g=null;
 if(key==='piramide'){const gz0=new T.Group();[[-.5,-.2,.6,.4],[.05,-.3,.56,.37],[.5,-.38,.3,.2]].forEach(([x,z,l,a],k)=>{const p=piramide(l,a,{topo:k===1});p.position.set(x,0,z);gz0.add(p);});g=real('piramide-giza',gz0);}
 else if(key==='esfinge')g=real('esfinge-giza',ajustar(esfinge(),.4),{altura:.4});
 else{const o=ALAS_PECAS.flat().concat(ATRIO_PECAS).find(x=>x.key===key&&!x.ignorar);if(!o)return null;
  if(o.painel){const mp=o.map();const geo=o.geo?o.geo():new T.PlaneGeometry(o.w,o.h);geo.translate(0,o.h/2,0);g=new T.Group();g.add(new T.Mesh(geo,new T.MeshBasicMaterial({map:mp,side:T.DoubleSide,toneMapped:false})));}
  else if(o.arq)g=real(o.arq,caixaEspera(o.cw||.5,o.h,o.cd||.4),{yaw:o.yaw||0,ajuste:o.ajuste||'altura'});
  else g=ajustar(o.proc(),o.h);}
 return g;}
/* desafio: a maquete de Gizé numa mesa, com os modelos 3D reais */
function desafio(){const g=new T.Group();const mesa=new T.Mesh(new T.CylinderGeometry(2.3,2.4,.24,56),matTex('calcarioInt',0xffffff,{roughness:.85}));mesa.position.y=-.12;mesa.userData.semEnquadre=true;g.add(mesa);const ins=k=>({type:'inspect',key:k});
 const gz0=new T.Group();[[-1.3,-.5,1.5,1.0],[0,-.75,1.4,.95],[1.15,-.95,.8,.52]].forEach(([x,z,l,a],i)=>{const p=piramide(l,a,{topo:i===1});p.position.set(x,0,z);gz0.add(p);});tag(gz0,ins('piramide'));g.add(real('piramide-giza',gz0));
 const ef0=esfinge();ef0.scale.setScalar(.3);tag(ef0,ins('esfinge'));const ef=real('esfinge-giza',ef0,{altura:.3});ef.position.set(-.6,0,1.05);ef.rotation.y=-.2;g.add(ef);
 [-1.7,1.7].forEach(x=>{const ob=obelisco(1.1);ob.position.set(x,0,1.25);tag(ob,ins('obelisco'));g.add(ob);});return g;}
/* contexto, etapa 2: corte do vale do Nilo (esquema fora de escala): deserto, lama fértil e o rio que enche e baixa */
function perfilVale(){const g=new T.Group();const CTX={type:'context'};const Z=2.4;
 const topo=[[-4.2,.95],[-2.7,.95],[-2.25,.4],[-.62,.34],[-.48,.06],[.48,.06],[.62,.34],[2.25,.4],[2.7,.95],[4.2,.95]];
 const off=(pts,d)=>pts.map(([x,y])=>[x,y-d]);
 const ext=(pts,cor)=>{const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>s.lineTo(p[0],p[1]));const geo=new T.ExtrudeGeometry(s,{depth:Z,bevelEnabled:false});geo.translate(0,0,-Z/2);const m=new T.Mesh(geo,mat(cor,{roughness:.95}));m.userData.hit=CTX;g.add(m);return m;};
 ext([[-4.2,-.5],...off(topo,.14),[4.2,-.5]],0x7a5a3c);
 const faixa=(pts,cor)=>ext([...pts,...off(pts,.14).reverse()],cor);
 faixa(topo.slice(0,3),0xe0c48e);faixa(topo.slice(7),0xe0c48e);faixa(topo.slice(2,5),0x3a2c1c);faixa(topo.slice(5,8),0x3a2c1c);faixa(topo.slice(4,6),0x5a4630);
 const agua=new T.Mesh(new T.BoxGeometry(4.7,1,Z-.06).translate(0,.5,0),new T.MeshStandardMaterial({color:0x3f8fc0,transparent:true,opacity:.82,roughness:.2,envMap:env(),envMapIntensity:.8}));agua.position.y=.06;agua.userData.hit=CTX;g.add(agua);
 const plantas=new T.InstancedMesh(new T.ConeGeometry(.05,.18,6).translate(0,.09,0),mat(0x6aa040,{roughness:.7}),48);const mt=new T.Matrix4();let n=0;[-1,1].forEach(sd=>{for(let i=0;i<6;i++)for(let j=0;j<4;j++){const x=sd*(.85+i*.24),y=.34+(Math.abs(x)-.62)/(2.25-.62)*.06;mt.makeTranslation(x,y,-.8+j*.55);plantas.setMatrixAt(n++,mt);}});plantas.instanceMatrix.needsUpdate=true;plantas.userData.hit=CTX;g.add(plantas);
 [[-2.05,-.7],[2.1,.5],[-2.1,.6]].forEach(([x,z],i)=>{const p=palmeira(.75,i+3);p.position.set(x,.4,z);g.add(p);});
 const c=casa();c.scale.setScalar(.38);c.position.set(-3.4,.95,-.2);c.traverse(o=>{if(o.isMesh)o.userData.hit=CTX;});g.add(c);
 const sh=shaduf();sh.scale.setScalar(.36);sh.position.set(.82,.34,.5);sh.rotation.y=Math.PI;g.add(sh);
 rotulo(g,'Deserto',-3.4,1.55,0,1.3);rotulo(g,'Deserto',3.4,1.55,0,1.3);rotulo(g,'Rio Nilo',0,1.0,0,1.3,'#cfeaff');rotulo(g,'Lama fértil = plantação',1.45,1.45,0,2.4,'#d8f0b0');
 const cheia=rotulo(g,'Cheia (julho a outubro): a água cobre os campos',0,2.15,0,4.6,'#cfeaff'),vaz=rotulo(g,'O rio baixa e deixa a lama preta: hora de plantar',0,2.15,0,4.6,'#d8f0b0');
 textFixo(g,'CORTE DO VALE DO NILO · ESQUEMA FORA DE ESCALA',0,2.75,-1.25,5,'#ffe3a8',false);
 g.userData.semGiro=true;g.userData.tick=t=>{const k=.5-.5*Math.cos(t*.45),L=.22+.27*k;agua.scale.y=L-.06;plantas.visible=L<.36;cheia.visible=L>=.36;vaz.visible=L<.36;sh.userData.tick&&sh.userData.tick(t);};
 g.traverse(o=>{if(o.isMesh&&!o.userData.hit)o.userData.hit=CTX;});return g;}
window.HISTORIA_MODELS={copiaPeca,poca,V,mat,ball,label,rotuloFixo,textFixo,textAt,tag,contexto,museuEgito,inspection,sequencia,viagemCena,hieroglifosCena,desafio,dispose,glifo,ESCALA_VR,real,glb,MU};
})();
