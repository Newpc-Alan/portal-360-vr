#!/usr/bin/env python3
"""Gera apps/corpo-humano/precache.json para o service worker (sw.js).
Rodar a cada publicação: python3 tools/gerar-precache.py
- casca: index.html, css/js com a versão lida do index.html, vendor e assets
- pesados: modelos/*.glb e audio/*.mp3 com hash (md5 curto) para atualizar só o que mudou"""
import hashlib,json,os,re,sys
raiz=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','apps','corpo-humano');raiz=os.path.normpath(raiz)
html=open(os.path.join(raiz,'index.html'),encoding='utf-8').read()
casca=['./','index.html']+sorted(set(re.findall(r'(?:src|href)="((?!https?:|\.\./)[^"]+\.(?:js|css|png|webp|svg|ico)(?:\?v=[^"]*)?)"',html)))
for extra in ['assets/logo.png','guia-professor.html']:
    if extra not in casca and os.path.exists(os.path.join(raiz,extra)):casca.append(extra)
def h(p):
    m=hashlib.md5()
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1<<20),b''):m.update(b)
    return m.hexdigest()[:10]
pesados=[];total=0
for pasta,ext in [('modelos','.glb'),('audio','.mp3')]:
    for n in sorted(os.listdir(os.path.join(raiz,pasta))):
        if not n.endswith(ext):continue
        p=os.path.join(raiz,pasta,n);tam=os.path.getsize(p);total+=tam
        pesados.append({'u':pasta+'/'+n,'h':h(p),'t':tam})
# sincroniza a VERSAO do sw.js com a versão da aplicação (corpo-data.js)
ver=re.search(r"version:'([^']+)'",open(os.path.join(raiz,'corpo-data.js'),encoding='utf-8').read()).group(1)
swp=os.path.join(raiz,'sw.js');sw=open(swp,encoding='utf-8').read();sw2=re.sub(r"const VERSAO='[^']+'","const VERSAO='"+ver+"'",sw)
if sw2!=sw:open(swp,'w',encoding='utf-8').write(sw2)
out={'versao':ver,'gerado':__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M'),'casca':casca,'pesados':pesados,'bytes':total}
json.dump(out,open(os.path.join(raiz,'precache.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('casca:',len(casca),'pesados:',len(pesados),'MB:',round(total/1e6,1))
