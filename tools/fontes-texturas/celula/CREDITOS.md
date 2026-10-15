# Célula 3D VR · origem das imagens

| Arquivo | Uso no app | Origem | Licença |
|---|---|---|---|
| membrana, citoplasma, nucleo, mitocondria, cristas, golgi, cloroplasto (.jpg) | texturas das organelas (assets/tex-*.webp) | geradas com IA (ChatGPT) por Alan Ramos / NEWPC | próprias |
| foto-bochecha.jpg | painel "Foto real" no Contexto (animal) | PENDENTE: autor e fonte | PENDENTE |
| foto-cebola.jpg | painel na ficha da Parede celular | PENDENTE: autor e fonte | PENDENTE |
| foto-elodea.jpg | painel no Contexto (vegetal, nível 2) | PENDENTE: autor e fonte | PENDENTE |

Regra: só CC0, CC BY ou CC BY-SA (ou próprias). Se a foto veio da Wikimedia, o crédito vai na legenda do painel e no guia do professor.
Processamento: python3 tools/foto-para-textura.py <jpg> <chave> --pasta apps/celula/assets --prefixo tex- [--direto]
