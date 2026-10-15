# Célula 3D VR · origem das imagens

| Arquivo | Uso no app | Origem | Licença |
|---|---|---|---|
| membrana, citoplasma, nucleo, mitocondria, cristas, golgi, cloroplasto (.jpg) | texturas das organelas (assets/tex-*.webp) | geradas com IA (ChatGPT) por Alan Ramos / NEWPC | próprias |
| foto-bochecha-fritzmann2002.jpg | painel "Foto real" no Contexto (animal) | Wikimedia Commons, File:Human_Cheek_Cells_(Methylene_Blue_Stain).jpg, autor Fritzmann2002 | CC BY-SA 4.0 |
| foto-cebola-commons.jpg (azul, com corante) | painel na ficha da Parede celular (oculto até o crédito) | Wikimedia Commons, autor PENDENTE (Kelvinsong, Katekor1 ou SaraKasa) | CC BY / BY-SA |
| foto-elodea-commons.png | painel no Contexto vegetal (oculto até o crédito) | Wikimedia Commons, autor PENDENTE (Kelvinsong, Katekor1 ou SaraKasa) | CC BY / BY-SA |
| foto-cebola-sem-corante-commons.jpg | não usada | Wikimedia Commons, autor PENDENTE | CC BY / BY-SA |

Regra: só CC0, CC BY ou CC BY-SA (ou próprias). Se a foto veio da Wikimedia, o crédito vai na legenda do painel e no guia do professor.
Processamento: python3 tools/foto-para-textura.py <jpg> <chave> --pasta apps/celula/assets --prefixo tex- [--direto]
