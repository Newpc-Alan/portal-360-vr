#!/usr/bin/env python3
"""Simulador mínimo da API REST do Firebase Realtime Database, para testar a Sala do professor sem internet.
Suporta: GET/PUT/PATCH/DELETE em /<caminho>.json, valor de servidor {".sv":"timestamp"} e streaming
(Accept: text/event-stream) com eventos "put" e "patch" no mesmo formato do Firebase.
Uso: python3 tools/rtdb-simulado.py 8790   →   DB em http://localhost:8790"""
import json,sys,time,threading
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from urllib.parse import urlparse
DB={};LOCK=threading.Lock();OUVINTES=[]  # (caminho, fila)
def partes(p):return [x for x in p.strip('/').split('/') if x]
def sv(v):
    if isinstance(v,dict):
        if v.get('.sv')=='timestamp':return int(time.time()*1000)
        return {k:sv(x) for k,x in v.items()}
    return v
def ler(p):
    n=DB
    for k in partes(p):
        if not isinstance(n,dict) or k not in n:return None
        n=n[k]
    return n
def gravar(p,v):
    global DB
    ps=partes(p)
    if not ps:DB=v if isinstance(v,dict) else {};return
    n=DB
    for k in ps[:-1]:
        if not isinstance(n.get(k),dict):n[k]={}
        n=n[k]
    if v is None:n.pop(ps[-1],None)
    else:n[ps[-1]]=v
def avisar(p):
    """avisa cada ouvinte cujo caminho contém p (ou está contido em p)"""
    for (op,q) in list(OUVINTES):
        a,b=partes(op),partes(p)
        if b[:len(a)]==a:rel='/'+'/'.join(b[len(a):]);q.append(('put',{'path':rel if rel!='/' else '/','data':ler(p)}))
        elif a[:len(b)]==b:q.append(('put',{'path':'/','data':ler(op)}))
class H(BaseHTTPRequestHandler):
    def log_message(self,*a):pass
    def cab(self,code=200,ct='application/json'):
        self.send_response(code);self.send_header('Content-Type',ct);self.send_header('Access-Control-Allow-Origin','*');self.send_header('Access-Control-Allow-Methods','GET,PUT,PATCH,DELETE,OPTIONS');self.send_header('Access-Control-Allow-Headers','*');self.end_headers()
    def caminho(self):return urlparse(self.path).path[:-5] if urlparse(self.path).path.endswith('.json') else urlparse(self.path).path
    def corpo(self):n=int(self.headers.get('Content-Length') or 0);return json.loads(self.rfile.read(n) or b'null')
    def do_OPTIONS(self):self.cab(204)
    def do_GET(self):
        p=self.caminho()
        if 'text/event-stream' in (self.headers.get('Accept') or ''):
            self.cab(200,'text/event-stream');q=[]
            with LOCK:q.append(('put',{'path':'/','data':ler(p)}));OUVINTES.append((p,q))
            try:
                ult=time.time()
                while True:
                    while q:
                        ev,d=q.pop(0);self.wfile.write(('event: %s\ndata: %s\n\n'%(ev,json.dumps(d))).encode());self.wfile.flush()
                    if time.time()-ult>15:self.wfile.write(b'event: keep-alive\ndata: null\n\n');self.wfile.flush();ult=time.time()
                    time.sleep(.05)
            except Exception:pass
            finally:
                with LOCK:OUVINTES[:]=[o for o in OUVINTES if o[1] is not q]
            return
        with LOCK:v=ler(p)
        self.cab();self.wfile.write(json.dumps(v).encode())
    def do_PUT(self):
        p=self.caminho();v=sv(self.corpo())
        with LOCK:gravar(p,v);avisar(p)
        self.cab();self.wfile.write(json.dumps(v).encode())
    def do_PATCH(self):
        p=self.caminho();v=sv(self.corpo())
        with LOCK:
            for k,x in (v or {}).items():gravar(p.rstrip('/')+'/'+k,x)
            avisar(p)
        self.cab();self.wfile.write(json.dumps(v).encode())
    def do_DELETE(self):
        p=self.caminho()
        with LOCK:gravar(p,None);avisar(p)
        self.cab();self.wfile.write(b'null')
if __name__=='__main__':
    porta=int(sys.argv[1]) if len(sys.argv)>1 else 8790
    print('RTDB simulado em http://localhost:%d'%porta);ThreadingHTTPServer(('0.0.0.0',porta),H).serve_forever()
