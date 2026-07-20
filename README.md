# LUCAS // PERSONAL OS

> **Lado A:** engenharia de IA, backend e projetos open source.
> **Lado B:** Rukafuu — música, texturas eletrônicas e mundos sonoros.

Portfólio pessoal de [Lucas (Rukafuusca)](https://github.com/Rukafuu), construído como uma fita cassete interativa. A ideia não é separar as duas metades: é deixar o código e a música dividirem o mesmo deck.

![Status](https://img.shields.io/badge/STATUS-EM%20MOTION-c7ff3a?style=flat-square&labelColor=0b0b0a)
![Stack](https://img.shields.io/badge/STACK-Next.js%20%2B%20Vinext%20%2B%20Cloudflare-ff4f73?style=flat-square&labelColor=0b0b0a)

## O que tem na fita

- Cassete animada com rotação vinculada à reprodução real das faixas.
- Lado A para projetos, currículo, blog e atuação como engenheiro de IA.
- Lado B para a discografia de Rukafuu no SoundCloud.
- Controles de música nos dois lados: play/pause, anterior, próxima e sequência automática.
- Terminal navegável com comandos para currículo, música, SoundCloud, GitHub e navegação entre os lados.
- Projetos atualizados a partir da API pública do GitHub.
- Currículo legível no próprio site, além das versões PDF e DOCX.
- Layout responsivo com atenção a áreas seguras do iOS.

## Faixas

1. Horizonte
2. Piraña
3. Paranoid
4. Unspoken
5. Hyperbloom
6. Mosquitoes Invasion

Ouça no [SoundCloud do Rukafuu](https://soundcloud.com/rukafuu).

## Projetos em destaque

- [LiraVtuber](https://github.com/Rukafuu/LiraVtuber) — VTuber com voz, memória híbrida e Live2D.
- [PortarIA](https://github.com/Rukafuu/PortarIA) — controle de acesso com reconhecimento facial e liveness ativo.
- [CAFUNÉ](https://github.com/Rukafuu/CAFUNE) — experimentos com SNN, Transformer e RLAIF.
- [wAIfu Corp](https://waifucorp.org/) — laboratório/coletivo do qual Lucas é sócio-fundador.

## Rodar localmente

Requer Node.js 22.13 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Verificação

```bash
npm run build
npm test
```

## Publicação no Cloudflare Workers

O build gera a configuração de deploy em `dist/server/wrangler.json`.

```bash
npm run build
npx wrangler deploy --config dist/server/wrangler.json
```

Para branches que não são de produção:

```bash
npx wrangler versions upload --config dist/server/wrangler.json
```

---

Gravado entre Jundiaí, um terminal aberto de madrugada e uma fita que ainda gira.
