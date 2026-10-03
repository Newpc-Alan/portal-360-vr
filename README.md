# Portal 360º VR · Portal do Educador

Catálogo de experiências imersivas (3D / WebXR) do Portal do Educador, com abertura em vídeo e retorno das aplicações direto ao catálogo (`?catalog=1`), sem repetir a abertura.

## Estrutura
```
index.html                      catálogo + abertura (YouTube)
assets/                         logo (256px) e capas em WebP
apps/sistema-solar/index.html   Sistema Solar 3D / VR
apps/sistema-solar/vendor/      three.js r128 e qrcode.js locais (funciona sem CDN)
apps/dna/index.html             DNA Imersivo (estrutura, pareamento, narração, VR)
apps/dna/audio/                 narrações (dna, adenina, timina, citosina, guanina, esqueleto, ligacoes) + fundo.mp3
apps/dna/vendor/                three.js r128 local
```

## Comportamento em rede de escola
- A API do YouTube é carregada por JS. Se estiver bloqueada ou não responder em 8 s, a abertura é pulada e o aluno entra direto no catálogo.
- Após clicar em "Iniciar experiência", se o vídeo não começar em 4 s, entra no catálogo. O botão "Pular ▸" aparece após 2 s; `Esc` também pula.
- O hero do catálogo usa a capa em WebP; o vídeo em loop só é montado quando o YouTube respondeu.
- Three.js e QRCode são carregados de `vendor/`; o CDN é apenas reserva.

## Links
- `apps/sistema-solar/` abre em 3D.
- "Entrar em VR" no catálogo abre a sessão WebXR direto: o app fica pré-carregado num iframe invisível de mesma origem (`apps/sistema-solar/?quiosque=0&embed=1`) e o clique do catálogo vale como gesto do usuário para ele. Se o app ainda não carregou, o link segue para `apps/sistema-solar/?vr=1`, que mostra uma tela de entrada com um único botão.
- Dentro do iframe, os botões "Catálogo" navegam a janela de cima (`irCatalogo()`).
- No 3D (desktop/Chromebook/lousa), clicar ou tocar num planeta no palco seleciona, abre a ficha e narra; clicar de novo para a narração. Arrastar continua girando a câmera.
- `apps/sistema-solar/?quiosque=0` desliga o modo quiosque (útil para testes fora do Webnode).

## Modo VR (Meta Quest)
O Sistema Solar vira uma maquete inclinada à frente do usuário (ao alcance das mãos), em vez de jogá-lo na borda do sistema.
- Gatilho num planeta: destaca, abre a ficha flutuante (diâmetro, distância, luas, temperatura, ano, dia, curiosidade) e inicia a narração. Gatilho no vazio fecha a ficha.
- Grip (aperto lateral) num planeta: aproxima o planeta até ~28 cm de raio à frente dos olhos, com a ficha ao lado; grip de novo volta à maquete.
- Manete: esquerda/direita gira a maquete; cima/baixo aproxima/afasta.
- Botão A/X: pausa ou retoma o movimento.
- A ficha fica fixa à direita do usuário, na altura dos olhos, com uma linha-guia até o planeta. Não há painel de missão: o foco é apontar, ver a ficha e ouvir a narração.
- Trilha de fundo: se existir `audio/fundo.mp3`, toca em loop (botão "Música"); sem o arquivo, usa o pad sintetizado. Abaixa durante a narração.
- Narração: ao apertar o gatilho num corpo (inclusive a Lua: `audio/lua.mp3`), toca `audio/<corpo>.mp3` saindo do próprio planeta (áudio posicional); a música ambiente abaixa; botão "Ouvir de novo / Parar" abaixo da ficha. Se o MP3 faltar, usa a voz do navegador (Web Speech); no desktop há o botão "Ouvir narração" na ficha.
- Botões fixos no mundo, à esquerda da maquete (não acompanham a cabeça): "Sair do VR" (encerra a sessão) e "Catálogo" (encerra e volta ao catálogo). Posições em `VR_CFG.btnSair` / `VR_CFG.btnCatalogo`.
- Parâmetros em `VR_CFG` (escala, altura, inclinação, tamanho do foco) no topo do bloco VR.

## Próximos passos
- Trocar o vídeo de abertura (ID em `VIDEO_ID` no `index.html`) pelo novo vídeo com identidade visual do Portal do Educador.
- Aplicar a identidade visual do Portal no catálogo.

## DNA Imersivo (`apps/dna/`)
- Mesma arquitetura do Sistema Solar: arquivo único, quiosque/embed, `irCatalogo()`, `alternarVR()` exposta, narração posicional com reserva de voz, trilha `audio/fundo.mp3`.
- Vistas: **Estrutura** (hélice com 24 pares, ficha por base/fita/ligações, legenda, 5′/3′) e **Pareamento** (10 pares sorteados; a base da fita 2 some e o aluno responde A/T/C/G; feedback e placar).
- VR: hélice em pé à frente do usuário (~1,5 m), gatilho = ficha + narração, grip = aproxima, manete = gira / sobe e desce, A/X = alterna Estrutura/Pareamento. No Pareamento, o painel da pergunta com 4 letras flutua à direita; também vale apontar e apertar numa base com a letra certa.
- Catálogo: card "DNA Imersivo" disponível; "Entrar em VR" direto funciona igual ao Sistema Solar (iframe pré-carregado por app).

## Sistema Solar v8 (camada `solar-v8.js` / `solar-v8.css`)
- Camada carregada depois do `index.html` que redefine funções do app: Comparar diâmetros, missão Dia e Noite, Aula guiada, Resumo exportável (JSON local), estações pelo Hemisfério Sul, Terra com nuvens/oceanos (`media/`), atmosferas, cometas com partículas, legendas, qualidade gráfica e console completo no VR (atividades sem sair do óculos, cópias seguráveis com o grip).
- Narração passou a usar um player único (`new Audio`), sem áudio posicional. Correção aplicada: `S.narrSeq` iniciava indefinido e o fim do áudio não liberava o estado (botão ficava em "Parar" e a música abaixada).
- A pasta `vendor/` continua obrigatória: o pacote v8.6 não a incluía.
