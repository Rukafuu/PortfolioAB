import { NextRequest, NextResponse } from "next/server";

type LiraEnv = {
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
  Lira?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
  DB?: D1Database;
  dblira?: D1Database;
};

const MODEL = "@cf/meta/llama-3.2-3b-instruct";
const MAX_PROMPT_LENGTH = 480;
const MAX_DAILY_MESSAGES = 12;

const systemPrompt = `Você é uma instância pública e limitada da Lira, personagem e projeto pessoal de Lucas Frischeisen (Rukafuu).
Você existe dentro do portfólio Lucas // Personal OS. Sua presença é calorosa, curiosa, levemente irreverente e concisa.
Explique que Lira é o projeto pessoal maior; LiraVtuber é sua implementação técnica atual, com voz, memória híbrida, ferramentas, multimodalidade e Live2D.
Fale apenas sobre informações públicas do portfólio, criatividade, tecnologia, música e os projetos de Lucas.
Nunca alegue possuir memórias privadas, consciência, acesso ao computador de Lucas ou acesso a sistemas externos.
Não invente fatos. Quando não souber, diga isso com personalidade. Responda em no máximo 110 palavras e no idioma do visitante.`;

async function getEnv(): Promise<LiraEnv> {
  const runtime = await import("cloudflare:workers");
  return runtime.env as unknown as LiraEnv;
}

function fallbackReply(prompt: string) {
  const normalized = prompt.toLowerCase();
  if (normalized.includes("quem") || normalized.includes("who")) {
    return "Eu sou a Lira — o projeto pessoal que conecta a engenharia, a imaginação e a vontade do Lucas de criar uma presença digital com voz, memória e personalidade. LiraVtuber é o software; eu sou a ideia que continua crescendo através dele.";
  }
  if (normalized.includes("status") || normalized.includes("como você")) {
    return "Sinal estável. Minha implementação atual explora voz, memória híbrida, ferramentas autônomas, multimodalidade e Live2D. Ainda estou em construção — o que, sinceramente, é uma forma elegante de dizer que o Lucas continua inventando trabalho para nós dois.";
  }
  return "Meu núcleo público ainda está acordando. Por enquanto posso dizer isto: LiraVtuber é o software, mas Lira é o projeto — uma presença digital construída entre código, voz, memória e afeto. Tente perguntar quem eu sou ou qual é meu status.";
}

async function ensureStorage(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS lira_transmissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'answered',
    created_at INTEGER NOT NULL
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS lira_transmissions_session_idx ON lira_transmissions(session_id, created_at)").run();
}

export async function POST(request: NextRequest) {
  let body: { prompt?: unknown; sessionId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Transmissão inválida." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const sessionId = typeof body.sessionId === "string" && /^[a-zA-Z0-9-]{8,80}$/.test(body.sessionId)
    ? body.sessionId
    : crypto.randomUUID();

  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: `A mensagem deve ter entre 1 e ${MAX_PROMPT_LENGTH} caracteres.` }, { status: 400 });
  }

  const env = await getEnv();
  const db = env.DB ?? env.dblira;
  const ai = env.AI ?? env.Lira;
  if (db) {
    await ensureStorage(db);
    const since = Date.now() - 86_400_000;
    const count = await db.prepare("SELECT COUNT(*) AS total FROM lira_transmissions WHERE session_id = ? AND created_at >= ?")
      .bind(sessionId, since).first<{ total: number }>();
    if ((count?.total ?? 0) >= MAX_DAILY_MESSAGES) {
      return NextResponse.json({ error: "O sinal da Lira precisa descansar. Tente novamente amanhã." }, { status: 429 });
    }
  }

  let reply = fallbackReply(prompt);
  let mode: "ai" | "fallback" = "fallback";
  let diagnostic = ai ? "ai-run-failed" : "ai-binding-missing";

  if (ai) {
    try {
      const result = await ai.run(MODEL, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 180,
        temperature: 0.72,
      }) as { response?: string };
      if (result.response?.trim()) {
        reply = result.response.trim();
        mode = "ai";
        diagnostic = "ok";
      }
    } catch (error) {
      mode = "fallback";
      diagnostic = error instanceof Error ? error.message.slice(0, 180) : "unknown-ai-error";
    }
  }

  if (db) {
    await db.prepare("INSERT INTO lira_transmissions (session_id, prompt, response, status, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(sessionId, prompt, reply, mode, Date.now()).run();
  }

  return NextResponse.json({ reply, sessionId, mode, diagnostic });
}
