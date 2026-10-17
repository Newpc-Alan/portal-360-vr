# Cenários do Blender (opcional)

A História VR funciona sem nada nesta pasta: todas as cenas são geradas no navegador.
Quando houver um cenário modelado no Blender, ele entra aqui e substitui o procedural daquela cena, sem mexer nas missões.

| Arquivo | Cena | Observações |
|---|---|---|
| `egito-nilo.glb` | Explorar o Nilo | Y para cima, 1 unidade = 1 metro da maquete (a maquete tem ~12 m × 8 m). Na ligação, objetos com os nomes `piramide`, `esfinge`, `templo`, `obelisco`, `casa`, `shaduf`, `barco` e `papiro` serão usados como pontos clicáveis. |
| `egito-piramide-interior.glb` | Dentro da pirâmide | Tamanho real, em metros, origem no centro da base da pirâmide. Corredor, Grande Galeria e Câmara do Rei nas cotas do modelo procedural. |

Exportar em glTF binário (.glb), com texturas embutidas, até ~15 MB por arquivo (Quest 3S).
Junto com o primeiro .glb entra o `vendor/GLTFLoader.r128.js` (o mesmo do Corpo Humano) e a ligação no `historia-app.js`.
Licença: só modelos próprios ou CC0 / CC BY / CC BY-SA, com crédito em "Fontes e limites".
