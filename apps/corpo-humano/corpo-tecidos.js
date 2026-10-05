/* Corpo Humano Imersivo · Tecidos (v3.6)
   Dá "pele" aos órgãos: textura procedural gerada por canvas (nada a baixar), aplicada por projeção triplanar no shader
   do MeshStandardMaterial (os modelos Z-Anatomy não têm UV), com relevo (bump por derivadas de tela), rugosidade variável,
   luz de contorno (fresnel) e pulso luminoso no coração. Mesma filosofia do Sistema Solar: visual rico sem arquivos externos.
   Pensado para Quest 2 e Chromebook: 3 amostras de textura por fragmento, sem pós-processamento. */
(function(){'use strict';
const T=window.THREE;if(!T)return;
const cache={};
/* ---------- geradores de textura (512 px, sem emendas: ruído periódico) ---------- */
function ruido(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function canvas(n=512){const c=document.createElement('canvas');c.width=c.height=n;return c;}
function valorRuido(n,oit,seed,periodo){/* ruído de valor periódico em várias oitavas, retorna Float32Array n*n em 0..1 */
 const out=new Float32Array(n*n);let amp=1,freq=periodo,soma=0;const r=ruido(seed);
 for(let o=0;o<oit;o++){const g=new Float32Array(freq*freq);for(let i=0;i<g.length;i++)g[i]=r();
  for(let y=0;y<n;y++){const fy=y/n*freq,y0=Math.floor(fy),ty=fy-y0,y1=(y0+1)%freq,sy=ty*ty*(3-2*ty);
   for(let x=0;x<n;x++){const fx=x/n*freq,x0=Math.floor(fx),tx=fx-x0,x1=(x0+1)%freq,sx=tx*tx*(3-2*tx);
    const a=g[y0*freq+x0],b=g[y0*freq+x1],c=g[y1*freq+x0],d=g[y1*freq+x1];
    out[y*n+x]+=amp*((a*(1-sx)+b*sx)*(1-sy)+(c*(1-sx)+d*sx)*sy);}}
  soma+=amp;amp*=.5;freq*=2;}
 for(let i=0;i<out.length;i++)out[i]/=soma;return out;}
function pintar(n,base,fn){const c=canvas(n),ctx=c.getContext('2d'),img=ctx.createImageData(n,n),d=img.data;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4;const px=fn(x,y,y*n+x);d[i]=px[0];d[i+1]=px[1];d[i+2]=px[2];d[i+3]=px[3];}
 ctx.putImageData(img,0,0);return c;}
function linhas(ctx,n,qtd,seed,cor,larg,curva){/* veias / fibras: curvas aleatórias periódicas (desenhadas 4x deslocadas para fechar a emenda) */
 const r=ruido(seed);ctx.strokeStyle=cor;ctx.lineWidth=larg;ctx.lineCap='round';
 for(let k=0;k<qtd;k++){const x0=r()*n,y0=r()*n,ang=r()*Math.PI*2,len=n*(.25+r()*.5),cv=(r()-.5)*curva;
  for(const [dx,dy] of [[0,0],[n,0],[-n,0],[0,n],[0,-n]]){ctx.beginPath();let x=x0+dx,y=y0+dy,a=ang;ctx.moveTo(x,y);const passos=24;
   for(let i=0;i<passos;i++){a+=cv/passos+(r()-.5)*.25;x+=Math.cos(a)*len/passos;y+=Math.sin(a)*len/passos;ctx.lineTo(x,y);}ctx.stroke();}}}
const GERA={
 pulmao(){const n=512,h=valorRuido(n,5,11,6),h2=valorRuido(n,3,12,24);const c=pintar(n,0,(x,y,i)=>{const v=h[i]*.7+h2[i]*.3;const t=.72+v*.5;return [Math.min(255,235*t),Math.min(255,150*t),Math.min(255,150*t),Math.round(255*v)];});
  const ctx=c.getContext('2d');ctx.globalAlpha=.22;linhas(ctx,n,26,13,'rgba(140,40,60,0.9)',1.6,2.2);ctx.globalAlpha=.14;linhas(ctx,n,14,14,'rgba(90,30,50,1)',3,1.6);return c;},
 coracao(){const n=512,h=valorRuido(n,4,21,8);const c=pintar(n,0,(x,y,i)=>{const fibra=.5+.5*Math.sin((x*.9+Math.sin(y*.05)*12)*.09);const v=h[i]*.75+fibra*.25;const t=.82+v*.3;return [Math.min(255,225*t),Math.min(255,80*t),Math.min(255,88*t),Math.round(255*(.4+v*.6))];});
  const ctx=c.getContext('2d');ctx.globalAlpha=.45;linhas(ctx,n,10,23,'rgba(255,130,120,0.9)',3,2.6);ctx.globalAlpha=.22;linhas(ctx,n,26,24,'rgba(110,20,30,1)',1.4,3);return c;},
 musculo(){const n=512,h=valorRuido(n,4,31,10);const c=pintar(n,0,(x,y,i)=>{const fibra=.5+.5*Math.sin(x*.16+h[i]*2.5);const v=h[i]*.6+fibra*.4;const t=.8+v*.35;return [Math.min(255,200*t),Math.min(255,52*t),Math.min(255,60*t),Math.round(255*(.3+v*.7))];});
  const ctx=c.getContext('2d');ctx.globalAlpha=.18;linhas(ctx,n,18,33,'rgba(255,200,200,0.8)',1.2,.6);return c;},
 osso(){const n=512,h=valorRuido(n,5,41,5),p=valorRuido(n,2,42,48);const c=pintar(n,0,(x,y,i)=>{const poro=p[i]>.72?(p[i]-.72)*3:0;const v=h[i];const t=.88+v*.2-poro*.35;return [Math.min(255,236*t),Math.min(255,228*t),Math.min(255,208*t),Math.round(255*(.6+v*.4-poro*.6))];});return c;},
 vaso(){const n=512,h=valorRuido(n,3,51,12);return pintar(n,0,(x,y,i)=>{const v=h[i];const t=.9+v*.2;return [Math.round(255*Math.min(1,t)),Math.round(255*Math.min(1,t)),Math.round(255*Math.min(1,t)),Math.round(255*(.5+v*.5))];});},
 viscera(){const n=512,h=valorRuido(n,5,61,7),h2=valorRuido(n,2,62,30);const c=pintar(n,0,(x,y,i)=>{const v=h[i]*.75+h2[i]*.25;const t=.85+v*.3;return [Math.round(255*Math.min(1,t)),Math.round(255*Math.min(1,t*.97)),Math.round(255*Math.min(1,t*.95)),Math.round(255*(.45+v*.55))];});
  const ctx=c.getContext('2d');ctx.globalAlpha=.22;linhas(ctx,n,45,63,'rgba(120,30,40,0.9)',1.2,2);return c;},
 cartilagem(){const n=256,h=valorRuido(n,3,71,6);return pintar(n,0,(x,y,i)=>{const v=h[i];const t=.92+v*.14;return [Math.round(255*Math.min(1,t)),Math.round(255*Math.min(1,t)),Math.round(255*Math.min(1,t)),Math.round(255*(.5+v*.5))];});}
};
function textura(tipo){if(cache[tipo])return cache[tipo];const g=GERA[tipo];if(!g)return null;const tx=new T.CanvasTexture(g());tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.encoding=T.sRGBEncoding;tx.minFilter=T.LinearMipmapLinearFilter;tx.magFilter=T.LinearFilter;tx.generateMipmaps=true;tx.anisotropy=4;cache[tipo]=tx;return tx;}
/* ---------- parâmetros por tecido ---------- */
const TEC={
 pulmao:{tex:'pulmao',escala:9,relevo:.8,rug:[.4,.78],rim:0xffb9b0,rimF:.55,tinta:.7},
 coracao:{tex:'coracao',escala:14,relevo:1.0,rug:[.26,.62],rim:0xff8a80,rimF:.65,tinta:.6,pulso:true},
 musculo:{tex:'musculo',escala:8,relevo:.6,rug:[.45,.7],rim:0xff9a8a,rimF:.45,tinta:.55},
 osso:{tex:'osso',escala:7,relevo:.7,rug:[.6,.92],rim:0xfff2cf,rimF:.35,tinta:.5},
 vaso:{tex:'vaso',escala:14,relevo:.3,rug:[.25,.45],rim:0xffffff,rimF:.5,tinta:.25},
 viscera:{tex:'viscera',escala:9,relevo:.7,rug:[.3,.62],rim:0xffd0c0,rimF:.5,tinta:.5},
 cartilagem:{tex:'cartilagem',escala:25,relevo:.4,rug:[.5,.75],rim:0xe0f4ff,rimF:.45,tinta:.3},
 pele:{tex:null,escala:1,relevo:0,rug:[.5,.5],rim:0x8fd3ff,rimF:1.4,tinta:0}
};
/* chave/parte → tecido */
function tecidoDe(key,parte){
 if(key==='coracao'){if(['aorta','pulmonar','cavas','veiasPulm','coronarias'].includes(parte))return 'vaso';return 'coracao';}
 if(key==='pulmoes'||key==='pulmoes_lobos')return 'pulmao';
 if(key==='aorta')return 'vaso';
 if(key==='traqueia'||key==='bronquios'||key==='laringe'||(key==='nariz'&&parte==='cartilagens'))return 'cartilagem';
 if(key==='costelas'||key==='esqueleto'||(key==='nariz'&&parte==='ossos')||['femur','tibia','fibula','patela','escapula','clavicula','umero','pelve','sacro','radio','ulna'].includes(parte))return 'osso';
 if(key==='musculos'||key==='diafragma')return 'musculo';
 if(['esofago','estomago','figado','intestino_delgado','intestino_grosso','boca','faringe'].includes(key)||['lingua','palato','uvula','mucosa','conchas'].includes(parte))return 'viscera';
 if(key==='silhueta'||key==='cabeca')return 'pele';
 return null;
}
const PULSO={value:0};
/* ---------- injeção no shader ---------- */
function aplicar(m,tipo){
 if(!m||!tipo||!TEC[tipo])return m;const cfg=TEC[tipo];m.userData.tecido=tipo;
 const tex=cfg.tex?textura(cfg.tex):null;
 m.roughness=(cfg.rug[0]+cfg.rug[1])/2;m.metalness=0;
 m.onBeforeCompile=sh=>{
  sh.uniforms.uTec={value:tex};sh.uniforms.uEsc={value:cfg.escala};sh.uniforms.uRelevo={value:cfg.relevo};sh.uniforms.uRug={value:new T.Vector2(cfg.rug[0],cfg.rug[1])};
  sh.uniforms.uRim={value:new T.Color(cfg.rim)};sh.uniforms.uRimF={value:cfg.rimF};sh.uniforms.uTinta={value:cfg.tinta};sh.uniforms.uPulso=PULSO;sh.uniforms.uTemTex={value:tex?1:0};sh.uniforms.uPulsoOn={value:cfg.pulso?1:0};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vTecPos;varying vec3 vTecNrm;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n{float escObj=length(modelMatrix[0].xyz);vTecPos=(modelMatrix*vec4(transformed,1.0)).xyz/max(escObj,1e-6);vTecNrm=normalize(mat3(modelMatrix)*objectNormal);}');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uTec;uniform float uEsc,uRelevo,uRimF,uTinta,uPulso,uTemTex,uPulsoOn;uniform vec2 uRug;uniform vec3 uRim;varying vec3 vTecPos;varying vec3 vTecNrm;\n'+
   'vec4 tecTri(vec3 p,vec3 n){vec3 w=abs(n);w=pow(w,vec3(4.0));w/=(w.x+w.y+w.z+1e-4);vec4 x=texture2D(uTec,p.yz*uEsc);vec4 y=texture2D(uTec,p.xz*uEsc);vec4 z=texture2D(uTec,p.xy*uEsc);return x*w.x+y*w.y+z*w.z;}\n'+
   'vec3 tecBump(vec3 surf_pos,vec3 surf_norm,float h,float esc){vec3 vSigmaX=dFdx(surf_pos);vec3 vSigmaY=dFdy(surf_pos);vec3 vN=surf_norm;vec3 R1=cross(vSigmaY,vN);vec3 R2=cross(vN,vSigmaX);float fDet=dot(vSigmaX,R1);fDet*=(float(gl_FrontFacing)*2.0-1.0);float dHx=dFdx(h)*esc,dHy=dFdy(h)*esc;vec3 vGrad=sign(fDet)*(dHx*R1+dHy*R2);return normalize(abs(fDet)*surf_norm-vGrad);}')
   .replace('#include <map_fragment>','#include <map_fragment>\nvec4 tec=vec4(1.0,1.0,1.0,0.5);if(uTemTex>0.5){tec=tecTri(vTecPos,normalize(vTecNrm));diffuseColor.rgb*=mix(vec3(1.0),tec.rgb,uTinta);}')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(uRug.x,uRug.y,tec.a);')
   .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nif(uTemTex>0.5&&uRelevo>0.0){normal=tecBump(-vViewPosition,normal,tec.a,uRelevo*0.012);}')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float fres=pow(1.0-max(dot(normalize(vViewPosition),normal),0.0),3.0);totalEmissiveRadiance+=uRim*fres*uRimF*0.35+uPulsoOn*uPulso*0.35*vec3(0.6,0.08,0.1);}');
 };
 m.extensions=Object.assign({},m.extensions,{derivatives:true});m.customProgramCacheKey=()=>'tecidos-v1';
 m.needsUpdate=true;return m;
}
function pulsar(t){PULSO.value=Math.max(0,Math.sin(t*5.2));}
window.CORPO_TECIDOS={aplicar,tecidoDe,textura,pulsar,PULSO,TEC};
})();
