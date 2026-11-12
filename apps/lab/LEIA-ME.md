# Portal Lab 3D

Laboratório virtual de ciências do Portal do Educador (NEWPC). Ele fica dentro do Portal 360º VR, na pasta `apps/lab/`.

- **Página inicial:** `apps/lab/index.html`, com as 13 bancadas e os 37 experimentos do catálogo.
- **Bancada 04 · Hidrostática** (disponível): `apps/lab/hidrostatica/`.

| Nº | Experimento | Recipiente |
|---|---|---|
| 11 | Princípio de Arquimedes | transbordamento com proveta |
| 12 | Empuxo e densidade | béquer graduado, 5 líquidos, flutuação |
| 13 | Pressão hidrostática | profundidade, gráficos de pressão e empuxo |
| 14 | Vasos comunicantes | tubo em U com dois líquidos |

Para abrir um experimento direto, use `hidrostatica/?exp=arquimedes|densidade|pressao|vasos` e, se quiser, `&nivel=ef|em`.

## Organização do código (Bancada 04)

| Arquivo | Papel |
|---|---|
| `fisica.js` | Núcleo científico puro, sem desenho. Calcula peso, empuxo pela geometria submersa, nível acoplado do líquido, transbordamento, flutuação, contato com o fundo, pressão hidrostática, leitura dos instrumentos e vasos comunicantes. Roda no navegador e no Node. |
| `equipamentos.js` | Equipamentos em 3D, com medidas reais e em metros: suporte universal, dinamômetros analógico (2, 5 e 10 N) e digital, cilindro, béquer, recipiente de transbordamento, proveta de 100 mL, régua e tubo em U. |
| `atividades.js` | Roteiros pedagógicos de cada experimento: objetivos, conhecimentos prévios, materiais, hipótese, procedimento com avanço automático, colunas da tabela, questões e conclusão. |
| `app.js` | Cena 3D (câmera, arrastar o cilindro), laço da simulação, assistente baseado nos dados, painéis, tabela, gráfico, comparação, relatório e armazenamento local. |
| `testes/fisica.test.js` | 42 verificações automáticas dos cálculos, com casos calculados à mão. |
| `../vendor/three.r128.min.js` | Three.js r128 (licença MIT). |

Para criar uma nova bancada, copie a pasta `hidrostatica/` e troque `fisica.js`, `equipamentos.js` e `atividades.js`. O `app.js` serve de base para o resto.

## Regras científicas

- Unidades do SI em todo o cálculo. A conversão para cm, cm³, mL e kPa acontece só na tela.
- O empuxo é E = ρ · g · V(submerso). O V(submerso) vem da parte do cilindro abaixo da superfície, e o nível é resolvido de forma exata, porque o cilindro desloca líquido e o nível sobe.
- A leitura do dinamômetro é a tensão no fio: T = P − E, com o cilindro pendurado e em equilíbrio.
  - **Flutuação:** o fio afrouxa (T = 0).
  - **Contato com o fundo:** o fio afrouxa e o fundo sustenta N = P − E.
- A **medição simulada** é o valor físico arredondado à resolução do instrumento: dinamômetro de 0,01 a 0,1 N e proveta de 1 mL. Não há números inventados. A tela mostra a medição e o valor teórico separados.

## Executar localmente

Precisa de um servidor local, porque o navegador não carrega os scripts direto do disco. Na raiz do repositório:

```bash
python3 -m http.server 8080
# abra http://localhost:8080/apps/lab/
```

## Rodar os testes dos cálculos

```bash
node apps/lab/hidrostatica/testes/fisica.test.js
```

O resultado esperado é `OK · 42 verificações certas, 0 erradas`.

## Publicar (GitHub Pages)

O repositório já é publicado pelo GitHub Pages em `portal360.portaldoeducador.com.br`. Basta fazer commit e push na branch `main`. O endereço final fica `/apps/lab/`.

## Limites atuais (próximas etapas)

- A versão para óculos VR ainda não existe; funciona em computador, Chromebook, tablet e lousa.
- O assistente funciona sem IA, com regras sobre os dados da simulação. A IA opcional entra depois, sem ser obrigatória.
- Os equipamentos são modelados no próprio código, em escala real. Modelos GLB fotográficos podem substituí-los aos poucos, sem mudar a física.
- Os códigos BNCC do Ensino Fundamental estão marcados "a validar" pela equipe pedagógica.
