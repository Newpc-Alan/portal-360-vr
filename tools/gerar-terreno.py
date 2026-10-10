"""Gera, a partir de recortes do Copernicus DEM (dem/<chave>.npy, float32 em metros, janela quadrada em km),
o PNG de alturas 16 bits (R alto, G baixo) e a textura de cor (WebP) de cada vulcão para apps/terra/assets."""
import numpy as np,json,sys
from PIL import Image
OUT='/home/claude/portal-360-vr/apps/terra/assets/'
def resample(a,n):
    im=Image.fromarray(a.astype('float32'),mode='F');return np.asarray(im.resize((n,n),Image.BILINEAR),dtype='float32')
def ruido(n,oit=5,seed=1):
    r=np.random.default_rng(seed);out=np.zeros((n,n),'float32');amp=1;tot=0
    for o in range(oit):
        s=max(2,n>>(oit-1-o));base=r.random((s,s)).astype('float32');im=Image.fromarray(base,mode='F').resize((n,n),Image.BICUBIC);out+=np.asarray(im)*amp;tot+=amp;amp*=.5
    return out/tot
def ruidoGrosso(n,seed=5):
    r=np.random.default_rng(seed);out=np.zeros((n,n),'float32');amp=1;tot=0
    for s_ in (5,10,20):
        base=r.random((s_,s_)).astype('float32');im=Image.fromarray(base,mode='F').resize((n,n),Image.BICUBIC);out+=np.asarray(im)*amp;tot+=amp;amp*=.5
    return out/tot
def hillshade(h,cell,az=315,alt=45):
    gy,gx=np.gradient(h,cell);slope=np.arctan(np.hypot(gx,gy));aspect=np.arctan2(-gx,gy)
    azr=np.radians(az);altr=np.radians(alt)
    hs=np.sin(altr)*np.cos(slope)+np.cos(altr)*np.sin(slope)*np.cos(azr-aspect)
    return np.clip(hs,0,1),np.degrees(slope)
# arvore: altitude onde a vegetação acaba; neve: altitude da neve; mar: pinta h<=1 de água; lagos: água em áreas planas baixas;
# blast: leque cinza ao norte (St. Helens); pedra: cor da rocha nua (basalto escuro no Havaí); verdeSeco: vegetação mais amarelada
CFG={
 'fuji':{'km':34,'arvore':2500,'neve':3350,'lagos':True},
 'sthelens':{'km':22,'arvore':1700,'neve':2250,'blast':True},
 'vesuvio':{'km':22,'arvore':900,'neve':9999,'mar':True,'verdeSeco':True},
 'kilauea':{'km':24,'arvore':9999,'neve':9999,'mar':True,'pedra':[44,38,36],'pedra2':[30,26,25],'lavaNegra':True},
 'krakatoa':{'km':20,'arvore':9999,'neve':9999,'mar':True},
 'pocos':{'km':40,'arvore':9999,'neve':9999,'verdeSeco':True,'lagos':False},
 'etna':{'km':34,'arvore':2000,'neve':2900,'mar':True,'pedra':[52,46,44],'pedra2':[36,32,31]},
}
chaves=sys.argv[1:] or list(CFG)
meta={}
for name in chaves:
    c=CFG[name];a=np.load('dem/'+name+'.npy');N=256;C=512
    h=resample(a,N);hmin,hmax=float(h.min()),float(h.max())
    q=np.clip((h-hmin)/(hmax-hmin)*65535,0,65535).astype('uint16')
    png=np.zeros((N,N,3),'uint8');png[...,0]=q>>8;png[...,1]=q&255;Image.fromarray(png).save(OUT+'dem-'+name+'.png',optimize=True)
    hc=resample(a,C);cell=c['km']*1000/C;hs,slope=hillshade(hc,cell);nz=ruido(C,6,7);nz2=ruido(C,4,11)
    floresta=np.array([38,72,36]);floresta2=np.array([62,96,44]);campo=np.array([110,112,62]);neve=np.array([238,240,246]);cinza=np.array([150,144,134]);agua=np.array([40,80,120]);mar=np.array([24,58,98])
    if c.get('verdeSeco'):floresta=np.array([70,86,40]);floresta2=np.array([96,110,52]);campo=np.array([140,128,70])
    rocha=np.array(c.get('pedra',[96,84,76]));rochaEsc=np.array(c.get('pedra2',[70,62,60]))
    t_arv=np.clip((hc-(c['arvore']-500))/700,0,1)[...,None];t_neve=np.clip((hc-(c['neve']-150))/250,0,1)[...,None]
    verde=floresta*(1-nz[...,None])+floresta2*nz[...,None];verde=verde*(1-.35*nz2[...,None])+campo*(.35*nz2[...,None])
    pedra=rocha*(1-nz[...,None])+rochaEsc*nz[...,None]
    col=verde*(1-t_arv)+pedra*t_arv
    if c.get('lavaNegra'):  # campos de lava recentes em manchas e o piso da caldeira (plano, perto do centro)
        yy,xx=np.mgrid[0:C,0:C];d=np.hypot(yy-C/2,xx-C/2)/C*c['km'];ng=ruidoGrosso(C,5);mancha=np.clip((ng-.6)/.1,0,1)*.85;cald=np.clip((3.2-d)/1.2,0,1)
        k=np.clip(mancha+cald,0,1)[...,None];col=col*(1-k)+pedra*k
    ing=np.clip((slope-28)/14,0,1)[...,None];col=col*(1-ing)+pedra*ing
    col=col*(1-t_neve)+neve*t_neve
    if c.get('lagos'):
        plano=(slope<.6)&(hc<1000);col=np.where(plano[...,None],agua,col)
    if c.get('blast'):
        yy,xx=np.mgrid[0:C,0:C];cy,cx=C/2,C/2;d=np.hypot((yy-cy),(xx-cx))/C*c['km'];ang=np.arctan2(-(yy-cy),(xx-cx))
        leque=np.clip(1-(d-4)/9,0,1)*np.clip((np.sin(ang)-.1)/.5,0,1)*np.clip(1-nz2*.6,0,1);col=col*(1-leque[...,None])+cinza*leque[...,None]
    col=col*(.55+.6*hs[...,None])
    if c.get('mar'):
        m=(hc<=1.0);col=np.where(m[...,None],mar*(.85+.3*nz[...,None]),col)
    Image.fromarray(np.clip(col,0,255).astype('uint8')).save(OUT+'terreno-'+name+'.webp',quality=82,method=6)
    meta[name]={'min':round(hmin),'max':round(hmax),'km':c['km']}
print(json.dumps(meta))
