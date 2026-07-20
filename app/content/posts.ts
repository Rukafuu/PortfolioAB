export type BlogPost = {
  id: string;
  title: { pt: string; en: string };
  tag: string;
  excerpt: { pt: string; en: string };
  content: { pt: string; en: string };
  publishedAt: string;
  status: "published" | "scheduled";
};

// Para publicar um texto novo, duplique um objeto abaixo e altere seus campos.
// O post mais recente deve ficar no topo da lista.
export const posts: BlogPost[] = [
  {
    id: "ia-nao-conhece-projeto-readme",
    title: {
      pt: "A IA não conhece seu projeto só porque leu seu README",
      en: "AI does not know your project just because it read the README",
    },
    tag: "ENGINEERING / AI",
    excerpt: {
      pt: "Documentação conta a intenção. Para entender o sistema real, agentes precisam enxergar as relações que sobreviveram no código.",
      en: "Documentation tells the intended story. To understand the real system, agents need to see the relationships that survived in code.",
    },
    content: {
      pt: `Existe uma confiança quase religiosa no README.

Você abre um repositório, encontra uma descrição bonita, uma árvore de diretórios organizada, alguns comandos de instalação e pensa:

“Perfeito. Agora eu sei como esse projeto funciona.”

Não. Você sabe como alguém gostaria que ele funcionasse.

O README explica a intenção do projeto. O código mostra o que aconteceu depois que a realidade entrou na sala.

E isso vale tanto para desenvolvedores quanto para agentes de inteligência artificial.

## O README é o trailer, não o filme

Um bom README é extremamente útil. Ele apresenta o projeto, explica como executar, descreve algumas decisões e evita que o próximo desenvolvedor precise invocar espíritos antigos para descobrir qual variável de ambiente está faltando.

Mas ele continua sendo uma representação parcial do sistema.

Ele pode dizer que a aplicação segue uma arquitetura limpa, enquanto o código possui um controller chamando diretamente o banco de dados, uma regra de negócio escondida em um middleware e um arquivo chamado \`utils.ts\` com 1.700 linhas.

Ele pode afirmar que determinado módulo é responsável apenas por autenticação, mas esse mesmo módulo também envia e-mails, registra auditoria, atualiza o perfil do usuário e, por algum motivo desconhecido, calcula desconto.

O README não está necessariamente mentindo.

Ele só perdeu a luta contra o tempo.

Projetos mudam. Requisitos mudam. Pessoas entram e saem. Prazos apertam. Soluções provisórias ganham estabilidade emocional e passam a morar no código para sempre.

A documentação diz o que foi planejado.

O repositório revela o que sobreviveu.

## “Mas a IA consegue ler o código”

Consegue.

O problema é que “conseguir ler” e “entender o sistema” são coisas diferentes.

Um modelo de linguagem pode receber arquivos, interpretar funções, explicar classes e até sugerir mudanças com bastante qualidade. Mas, quando o projeto cresce, surge uma questão bem menos glamourosa:

Qual código ele deveria ler primeiro?

Enviar o repositório inteiro para o contexto parece uma solução óbvia até você lembrar que contexto não é infinito, tokens custam dinheiro e boa parte do código provavelmente não é relevante para a tarefa atual.

Então começamos a selecionar arquivos.

Primeiro o README.

Depois o arquivo principal.

Depois os serviços relacionados.

Depois uma interface.

Depois outra implementação.

Depois um middleware que aparentemente não tinha relação nenhuma com o problema, mas altera exatamente o valor que estamos tentando entender.

E, quando percebemos, estamos fazendo manualmente o trabalho que deveria existir antes da conversa com o modelo: mapear o sistema.

## Código não é uma pilha de arquivos

Nós costumamos visualizar projetos como diretórios.

\`controllers\`, \`services\`, \`repositories\`, \`models\`, \`utils\`.

Essa organização é importante para seres humanos, mas não representa completamente o comportamento da aplicação.

O software não funciona porque os arquivos estão em pastas bonitas. Ele funciona porque existem relações entre eles.

Uma função chama outra.

Uma classe implementa uma interface.

Um módulo importa outro.

Um evento dispara um handler.

Um endpoint atravessa camadas diferentes até chegar ao banco de dados.

Um tipo aparece em dezenas de pontos e conecta partes do sistema que, visualmente, parecem independentes.

Ou seja: o código é menos uma pilha de arquivos e mais uma rede de dependências.

Um grafo.

E é justamente aí que a leitura linear começa a falhar.

Encontrar uma função pela busca de texto responde:

“Onde isso está escrito?”

Mas não necessariamente responde:

“Quem depende disso?”

“O que chama isso?”

“Qual fluxo passa por aqui?”

“O que pode quebrar se eu alterar esse comportamento?”

“Esse arquivo é realmente importante ou apenas possui um nome parecido com o que estou procurando?”

Essas perguntas exigem estrutura, não apenas texto.

## O problema do contexto sem direção

Um agente de IA sem um mapa do projeto funciona um pouco como um desenvolvedor recém-contratado no primeiro dia.

Ele é inteligente, sabe programar e provavelmente já viu arquiteturas parecidas.

Mas ainda não sabe onde estão os corpos enterrados.

Então ele se apoia no que está disponível.

Se você entrega apenas o README, ele entende a versão oficial da história.

Se você entrega arquivos isolados, ele entende fragmentos.

Se você entrega código demais, ele precisa identificar sozinho quais partes realmente importam, disputando atenção entre centenas ou milhares de elementos.

Em projetos pequenos, isso pode funcionar bem.

Em projetos maiores, a diferença entre uma boa resposta e uma alteração desastrosa muitas vezes está no contexto que não foi enviado.

A função estava correta.

O arquivo estava correto.

A explicação também.

O problema era um efeito colateral três camadas depois.

## A IA precisa de contexto. Mas contexto não significa quantidade

Existe uma ideia recorrente de que melhorar um agente é simplesmente aumentar sua janela de contexto.

Mais arquivos. Mais documentação. Mais tokens. Mais tudo.

Só que contexto útil não é o mesmo que contexto abundante.

Um mapa com todas as ruas de um país não ajuda muito quando você só quer encontrar a farmácia mais próxima.

Para uma tarefa específica, o agente não precisa conhecer cada linha do repositório. Ele precisa conhecer as relações relevantes para aquela decisão.

Se a tarefa é alterar uma API, ele precisa enxergar o endpoint, o controller, os serviços envolvidos, os tipos utilizados, os consumidores daquela resposta e os testes relacionados.

Se a tarefa é investigar um bug, ele precisa seguir o fluxo de execução.

Se a tarefa é refatorar um módulo, ele precisa descobrir quem depende dele antes de sair movendo arquivos com a confiança de quem nunca precisou fazer rollback em produção.

A qualidade do contexto depende mais da precisão do que do volume.

## O README continua importante

Nada disso significa que devemos abandonar documentação e confiar cegamente em ferramentas automáticas.

O README continua sendo essencial.

Ele explica decisões que o código sozinho não consegue justificar. Mostra objetivos, restrições, formas de execução, convenções e informações que não existem formalmente na estrutura do software.

Mas ele não deveria trabalhar sozinho.

A documentação apresenta a intenção.

A análise estrutural apresenta a implementação.

O histórico apresenta a evolução.

E o agente deveria receber uma combinação dessas perspectivas, em vez de assumir que meia dúzia de parágrafos representa toda a realidade do projeto.

## É por isso que estamos construindo o Above All Graphs

O Above All Graphs parte de uma ideia relativamente simples:

Antes de pedir para uma IA entender um projeto, precisamos tornar esse projeto compreensível de forma estrutural.

Em vez de tratar o repositório apenas como uma coleção de arquivos, o AAG transforma seus elementos e relações em um grafo navegável.

Funções, classes, módulos, imports, chamadas e dependências deixam de ser informações espalhadas e passam a fazer parte de um mapa consultável.

Isso não substitui o desenvolvedor.

Também não transforma o agente em uma entidade onisciente capaz de compreender cada decisão arquitetural tomada às duas da manhã durante uma entrega urgente.

Mas reduz a quantidade de adivinhação.

O agente deixa de receber apenas arquivos aparentemente relacionados e passa a receber um contexto construído com base nas conexões reais do sistema.

O desenvolvedor deixa de depender exclusivamente de busca textual para investigar impacto.

E o repositório deixa de ser uma caixa-preta com um README otimista na entrada.

## No fim, o código sempre conta a história completa

O README pode dizer que o projeto utiliza microsserviços.

O diagrama pode mostrar seis blocos perfeitamente separados.

A apresentação pode falar sobre escalabilidade, isolamento e alta disponibilidade.

Mas, se todos os serviços compartilham o mesmo banco, dependem do mesmo módulo e precisam ser publicados juntos, o código provavelmente tem outra opinião.

E está tudo bem.

Software é vivo. Ele muda, acumula decisões, carrega limitações e se adapta às necessidades do momento.

O problema não é o código se afastar da documentação.

O problema é continuarmos tomando decisões como se isso nunca tivesse acontecido.

Uma IA pode ler seu README e aprender muito sobre o projeto.

Só não espere que, depois disso, ela saiba onde está aquele \`if\` criado há oito meses que controla metade da aplicação e que ninguém tem coragem de remover.

Para descobrir isso, ela vai precisar de um mapa.`,
      en: `There is an almost religious confidence in the README. It explains a project's intention; the code shows what happened after reality entered the room.

## The README is the trailer, not the movie

A good README is essential, but it is still a partial representation. Projects, requirements and people change. Temporary solutions settle permanently into the codebase. Documentation says what was planned; the repository reveals what survived.

## “But AI can read the code”

It can. Yet reading files is not the same as understanding a system. As a project grows, the real question becomes: which code should it read first? Sending everything is expensive and unfocused; selecting files manually means doing the mapping work before the conversation even starts.

## Code is not a pile of files

Software works through relationships: functions call each other, classes implement interfaces, modules import modules, events trigger handlers and endpoints cross layers. Code is less a stack of files than a dependency graph.

## Context needs direction

An AI agent without a map resembles a smart developer on their first day. Too little context creates fragments; too much forces the model to find relevance among thousands of elements. Useful context depends more on precision than volume.

## Why we are building Above All Graphs

Above All Graphs turns repository elements and their real relationships into a navigable graph. It does not replace developers or make agents omniscient. It reduces guessing by giving both humans and agents a structural map of the system.

In the end, the code always tells the complete story. The README remains important—but it should never have to work alone.`,
    },
    publishedAt: "2026-07-20",
    status: "published",
  },
  {
    id: "latencia-experiencia-usuario",
    title: { pt: "Latência também é experiência do usuário", en: "Latency is part of the user experience" },
    tag: "AGENTS",
    excerpt: { pt: "Velocidade percebida, confiança e o silêncio entre uma ação e sua resposta.", en: "Perceived speed, trust and the silence between an action and its response." },
    content: { pt: "Latência não é apenas um número no painel de observabilidade. Ela é uma sensação. Quando um agente demora para responder, o usuário não percebe filas, tokens ou chamadas externas — percebe hesitação. Projetar sistemas inteligentes também significa projetar esse intervalo: feedback imediato, estados honestos e respostas que chegam no ritmo certo.", en: "Latency is not only a number on an observability dashboard. It is a feeling. When an agent takes too long to respond, users do not see queues, tokens or external calls — they experience hesitation. Designing intelligent systems also means designing that interval: immediate feedback, honest states and responses arriving at the right rhythm." },
    publishedAt: "2026-07-22",
    status: "scheduled",
  },
  {
    id: "maquinas-com-presenca",
    title: { pt: "Máquinas com presença, não só respostas", en: "Machines with presence, not only answers" },
    tag: "AI / VOICE",
    excerpt: { pt: "A diferença entre uma ferramenta que responde e uma presença digital que acompanha.", en: "The difference between a tool that responds and a digital presence that stays with you." },
    content: { pt: "Presença não nasce de frases humanas simuladas. Ela aparece na continuidade: memória usada com cuidado, voz coerente, tempo de resposta, iniciativa e respeito ao contexto. Máquinas com presença não precisam fingir que são pessoas; precisam demonstrar que entenderam onde estão.", en: "Presence does not come from simulated human phrases. It appears through continuity: carefully used memory, a coherent voice, response timing, initiative and respect for context. Machines with presence do not need to pretend they are people; they need to show they understand where they are." },
    publishedAt: "2026-07-27",
    status: "scheduled",
  },
];
