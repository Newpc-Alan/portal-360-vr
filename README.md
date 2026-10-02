# Portal 360º VR · Portal do Educador

Catálogo de experiências imersivas (3D / WebXR) do Portal do Educador, com abertura em vídeo e retorno das aplicações direto ao catálogo (`?catalog=1`), sem repetir a abertura.

## Estrutura
```
index.html                      catálogo + abertura (YouTube)
assets/                         logo (256px) e capas em WebP
apps/sistema-solar/index.html   Sistema Solar 3D / VR
apps/sistema-solar/vendor/      three.js r128 e qrcode.js locais (funciona sem CDN)
```

## Comportamento em rede de escola
- A API do YouTube é carregada por JS. Se estiver bloqueada ou não responder em 8 s, a abertura é pulada e o aluno entra direto no catálogo.
- Após clicar em "Iniciar experiência", se o vídeo não começar em 4 s, entra no catálogo. O botão "Pular ▸" aparece após 2 s; `Esc` também pula.
- O hero do catálogo usa a capa em WebP; o vídeo em loop só é montado quando o YouTube respondeu.
- Three.js e QRCode são carregados de `vendor/`; o CDN é apenas reserva.

## Links
- `apps/sistema-solar/` abre em 3D.
- `apps/sistema-solar/?vr=1` destaca o botão "Entrar em VR" e orienta sobre o óculos (WebXR exige HTTPS).
- `apps/sistema-solar/?quiosque=0` desliga o modo quiosque (útil para testes fora do Webnode).

## Próximos passos
- Trocar o vídeo de abertura (ID em `VIDEO_ID` no `index.html`) pelo novo vídeo com identidade visual do Portal do Educador.
- Aplicar a identidade visual do Portal no catálogo.
