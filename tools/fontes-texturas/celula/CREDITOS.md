# Célula 3D VR · origem das imagens

| Arquivo | Uso no app | Origem | Licença |
|---|---|---|---|
| membrana, citoplasma, nucleo, mitocondria, cristas, golgi, cloroplasto (.jpg) | texturas das organelas (assets/tex-*.webp) | geradas com IA (ChatGPT) por Alan Ramos / NEWPC | próprias |
| foto-bochecha-fritzmann2002.jpg | painel "Foto real" no Contexto (animal) | Wikimedia Commons, File:Human_Cheek_Cells_(Methylene_Blue_Stain).jpg, autor Fritzmann2002 | CC BY-SA 4.0 |
| foto-cebola-katekor1.jpg | painel na ficha da Parede celular | Wikimedia Commons, File:Onion_skin_cells_under_a_microscope.jpg, autor Katekor1 | CC BY 4.0 |
| foto-elodea-kelvinsong.png | painel no Contexto vegetal | Wikimedia Commons, File:Elodea_chloroplasts_1_400×.png, autor Kelvinsong | CC BY-SA 3.0 |
| foto-cebola-sarakasa.jpg | não usada (reserva) | Wikimedia Commons, File:Onion_epidermis.jpg, autor SaraKasa | CC BY 4.0 |

Regra: só CC0, CC BY ou CC BY-SA (ou próprias). Se a foto veio da Wikimedia, o crédito vai na legenda do painel e no guia do professor.
Processamento: python3 tools/foto-para-textura.py <jpg> <chave> --pasta apps/celula/assets --prefixo tex- [--direto]
