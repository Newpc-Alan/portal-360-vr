#!/usr/bin/env python3
"""Gera demo/legendas.js: legenda frase por frase, sincronizada com a narração do Modo Estande.
Rodar sempre que um áudio estande-*.mp3 ou o ROTEIRO-AUDIOS.csv mudar:  python3 tools/gerar-legendas-estande.py
Como sincroniza: mede os silêncios de cada MP3 (ffmpeg silencedetect), distribui as frases pelo tempo de fala
proporcional ao número de letras e encaixa o início de cada frase no fim do silêncio mais próximo (as pausas gravadas)."""
import csv,json,os,re,subprocess
raiz=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','demo')
MAX=78  # letras por frase na tela (duas linhas)
def frases(txt):
    out=[]
    for s in re.split(r'(?<=[.!?:])\s+',txt.strip()):
        if len(s)<=MAX:out.append(s);continue
        partes=re.split(r'(?<=,)\s+',s);atual=''
        for p in partes:
            if atual and len(atual)+1+len(p)>MAX:out.append(atual);atual=p
            else:atual=(atual+' '+p).strip()
        if atual:out.append(atual)
    return out
def silencios(arq):
    r=subprocess.run(['ffmpeg','-nostdin','-i',arq,'-af','silencedetect=n=-40dB:d=0.25','-f','null','-'],capture_output=True,text=True).stderr
    ini=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',r)];fim=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',r)]
    dur=float(re.search(r'Duration: (\d+):(\d+):([\d.]+)',r).groups()[2])+60*float(re.search(r'Duration: (\d+):(\d+):',r).group(2))
    return list(zip(ini,fim+[dur]*(len(ini)-len(fim)))),dur
def tempo_real(frac,fala):
    tot=sum(b-a for a,b in fala);alvo=frac*tot
    for a,b in fala:
        if alvo<=b-a:return a+alvo
        alvo-=b-a
    return fala[-1][1]
saida={}
with open(os.path.join(raiz,'ROTEIRO-AUDIOS.csv'),encoding='utf-8-sig') as f:
    for lin in csv.DictReader(f,delimiter=';'):
        arq=lin['Arquivo (nome exato)'];chave=arq[len('estande-'):-4];caminho=os.path.join(raiz,'audio',arq)
        if not os.path.exists(caminho):continue
        sil,dur=silencios(caminho)
        fala=[];t=0.0
        for a,b in sil:
            if a>t:fala.append((t,a))
            t=b
        if t<dur:fala.append((t,dur))
        F=frases(lin['Texto para gravar']);pesos=[len(x) for x in F];tot=sum(pesos);acc=0;itens=[]
        for i,x in enumerate(F):
            ini=tempo_real(acc/tot,fala);acc+=pesos[i]
            if i==0:ini=fala[0][0]
            else:
                perto=[(min(abs(a-ini),abs(b-ini)),b) for a,b in sil if min(abs(a-ini),abs(b-ini))<1.0 and b>itens[-1]['t']+0.3]
                if perto:ini=min(perto)[1]
            itens.append({'t':round(ini,2),'txt':x})
        for i,it in enumerate(itens):
            prox=itens[i+1]['t'] if i+1<len(itens) else dur
            fim=min(prox,max(b for a,b in fala if a<prox))
            it['f']=round(fim,2)
        saida[chave]=itens
open(os.path.join(raiz,'legendas.js'),'w',encoding='utf-8').write('/* gerado por tools/gerar-legendas-estande.py: frases da narração com início (t) e fim da fala (f), em segundos */\nwindow.LEGENDAS='+json.dumps(saida,ensure_ascii=False,indent=0)+';\n')
for k,v in saida.items():print(k,[(i['t'],i['f'],i['txt'][:30]) for i in v])
