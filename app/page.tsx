"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BlogPost, posts } from "./content/posts";

type Language = "pt" | "en";

function renderInlineCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith("`") && part.endsWith("`")
      ? <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>
      : part,
  );
}

function renderBlogContent(content: string) {
  return content.split(/\n\s*\n/).filter(Boolean).map((block, index) => {
    if (block.startsWith("## ")) {
      return <h3 key={index}>{renderInlineCode(block.slice(3))}</h3>;
    }

    return <p key={index}>{renderInlineCode(block)}</p>;
  });
}

function scheduledLabel(date: string, language: Language) {
  const day = date.slice(-2);
  return language === "pt" ? `${day} JUL / EM BREVE` : `JUL ${day} / SOON`;
}

type SoundCloudWidget = {
  play: () => void;
  pause: () => void;
  seekTo: (milliseconds: number) => void;
  getPosition: (callback: (milliseconds: number) => void) => void;
  bind: (event: string, callback: () => void) => void;
};

declare global {
  interface Window { SC?: { Widget: ((element: HTMLIFrameElement) => SoundCloudWidget) & { Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string } } } }
}

const projects = [
  {
    id: "01",
    name: "LiraVtuber",
    repo: "LiraVtuber",
    url: "https://github.com/Rukafuu/LiraVtuber",
    type: "PYTHON / LIVE2D / VOICE / AGENTS",
    status: "PLAYING",
    description: {
      pt: "Assistente VTuber desktop-first com voz, memória híbrida, ferramentas autônomas, multimodalidade e integração Live2D.",
      en: "A desktop-first VTuber assistant with voice, hybrid memory, autonomous tools, multimodality and Live2D integration.",
    },
  },
  {
    id: "02",
    name: "CAFUNÉ",
    repo: "CAFUNE",
    url: "https://github.com/Rukafuu/CAFUNE",
    type: "SNN / TRANSFORMER / RLAIF",
    status: "SYNC",
    description: {
      pt: "Modelo híbrido que combina uma SNN 11D e um Transformer bidirecional de 22,5M parâmetros.",
      en: "A hybrid model combining an 11D SNN with a 22.5M-parameter bidirectional Transformer.",
    },
  },
  {
    id: "03",
    name: "Xodó Studio",
    repo: "xodo-ide",
    url: "https://github.com/Rukafuu/xodo-ide",
    type: "TAURI / MONACO / AI AGENTS",
    status: "REWIND",
    description: {
      pt: "Uma IDE desktop para criar, conversar e depurar agentes de IA visualmente.",
      en: "A desktop IDE for building, chatting with and visually debugging AI agents.",
    },
  },
  {
    id: "04", name: "Yume no Sekai", repo: "Yume-no-Sekai", url: "https://github.com/Rukafuu/Yume-no-Sekai", type: "VUE / THREE.JS / FASTAPI", status: "DREAM",
    description: { pt: "Visual novel experimental com narrativa gerada por IA e estética nakige.", en: "An experimental visual novel with AI-generated narrative and a nakige aesthetic." },
  },
  {
    id: "05", name: "Raegis API", repo: "raegis-api", url: "https://github.com/Rukafuu/raegis-api", type: "PYTORCH / RAG / AUDIT", status: "SCAN",
    description: { pt: "Estação científica para auditar modelos, fidelidade de RAG, entropia e anomalias.", en: "A scientific station for auditing models, RAG fidelity, entropy and anomalies." },
  },
  {
    id: "06", name: "PortarIA", repo: "PortarIA", url: "https://github.com/Rukafuu/PortarIA", type: "FASTAPI / INSIGHTFACE / PGVECTOR", status: "SECURE",
    description: { pt: "Controle de acesso por reconhecimento facial com liveness ativo em múltiplos estágios e busca vetorial de embeddings.", en: "Facial-recognition access control with multi-stage active liveness and vector embedding search." },
    },
];

const musicTracks = [
  ["01", "Horizonte", "https://soundcloud.com/rukafuu/horizonte"],
  ["02", "Piraña", "https://soundcloud.com/rukafuu/pirana"],
  ["03", "Paranoid", "https://soundcloud.com/rukafuu/paranoid"],
  ["04", "Unspoken", "https://soundcloud.com/rukafuu/unspoken"],
  ["05", "Hyperbloom", "https://soundcloud.com/rukafuu/hyperbloom"],
  ["06", "Mosquitoes Invasion", "https://soundcloud.com/rukafuu/mosquitoes-invasion"],
] as const;

type GitHubRepo = { name: string; html_url: string; language: string | null; stargazers_count: number; updated_at: string };
type LiraMessage = { role: "lira" | "visitor"; text: string };

const copy = {
  pt: {
    nav: ["Projetos", "Músicas", "Currículo", "Lab", "Agora"],
    eyebrow: "BACKEND • IA • CREATIVE ENGINEERING",
    headlineA: "Eu construo",
    headlineB: "sistemas que",
    headlineC: "parecem vivos.",
    subtitle:
      "Agentes, vozes, ferramentas e mundos digitais — projetados entre código, curiosidade e um pouco de caos.",
    explore: "Play: explorar",
    terminal: "Abrir terminal",
    playing: "Tocando",
    paused: "Pausado",
    sideA: "Lado A",
    sideB: "Lado B",
    flip: "Virar fita",
    tracklist: "Faixas selecionadas",
    projectsTitle: "Projetos para ouvir com atenção.",
    projectsIntro:
      "Eu trabalho onde backend, inteligência artificial e narrativa digital se encontram. Cada projeto abaixo é uma tentativa diferente de dar comportamento, memória ou personalidade ao software.",
    openReel: "Abrir faixa",
    labEyebrow: "LINER NOTES / LAB",
    labTitle: "Código também produz cultura.",
    labBody:
      "Aqui ficam ideias ainda quentes: arquitetura de agentes, engenharia de voz, modelos locais e os pequenos acidentes criativos que viram projetos.",
    nowEyebrow: "CURRENT SIGNAL",
    nowTitle: "Entre silêncio e envio.",
    nowBody:
      "Atualmente construindo a LiraVtuber, trabalhando com backend e IA para saúde, criando software open source na wAIfu Corp e escrevendo sobre as partes humanas de criar tecnologia.",
    contact: "Vamos construir algo estranho e útil",
    footer: "Gravado entre Jundiaí e algum terminal aberto de madrugada.",
    sideBTitle: "Rukafuu no lado B.",
    sideBBody:
      "Quando o código silencia, entra o artista: faixas autorais, texturas eletrônicas e pequenos mundos sonoros gravados sob o nome Rukafuu.",
    sideBMeta: "ARTISTA INDEPENDENTE • 06 FAIXAS • SOUNDCLOUD",
    back: "Voltar ao lado A",
  },
  en: {
    nav: ["Projects", "Music", "Résumé", "Lab", "Now"],
    eyebrow: "BACKEND • AI • CREATIVE ENGINEERING",
    headlineA: "I build",
    headlineB: "systems that",
    headlineC: "feel alive.",
    subtitle:
      "Agents, voices, tools and digital worlds — designed somewhere between code, curiosity and a little chaos.",
    explore: "Play: explore",
    terminal: "Open terminal",
    playing: "Playing",
    paused: "Paused",
    sideA: "Side A",
    sideB: "Side B",
    flip: "Flip tape",
    tracklist: "Selected tracks",
    projectsTitle: "Projects worth a close listen.",
    projectsIntro:
      "I work where backend, artificial intelligence and digital narrative meet. Each project below is a different attempt to give software behavior, memory or personality.",
    openReel: "Open track",
    labEyebrow: "LINER NOTES / LAB",
    labTitle: "Code produces culture too.",
    labBody:
      "Fresh ideas live here: agent architecture, voice engineering, local models and the small creative accidents that become projects.",
    nowEyebrow: "CURRENT SIGNAL",
    nowTitle: "Between silence and shipping.",
    nowBody:
      "Currently building LiraVtuber, working on backend and AI for healthcare, creating open-source software at wAIfu Corp and writing about the human parts of making technology.",
    contact: "Let's build something strange and useful",
    footer: "Recorded between Jundiaí and a terminal left open after midnight.",
    sideBTitle: "Rukafuu on side B.",
    sideBBody:
      "When the code goes quiet, the artist steps in: original tracks, electronic textures and small sonic worlds recorded as Rukafuu.",
    sideBMeta: "INDEPENDENT ARTIST • 06 TRACKS • SOUNDCLOUD",
    back: "Return to side A",
  },
};

function Screw({ className = "" }: { className?: string }) {
  return <span className={`screw ${className}`} aria-hidden="true" />;
}

function AnimatedCassette({ title, playing, rewinding, side = "B" }: { title: string; playing: boolean; rewinding: boolean; side?: "A" | "B" }) {
  const spokes = [0, 60, 120, 180, 240, 300];
  const devSide = side === "A";
  return (
    <svg className={`animated-cassette ${playing ? "running" : ""} ${rewinding ? "rewinding" : ""}`} viewBox="0 0 810 514" role="img" aria-label={`Cassete tocando ${title}`}>
      <defs>
        <filter id="cassette-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="12" floodOpacity=".38" /></filter>
        <linearGradient id="cassette-shell" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#34342f" /><stop offset="1" stopColor="#11110f" /></linearGradient>
      </defs>
      <g filter="url(#cassette-shadow)">
        <rect x="10" y="8" width="790" height="486" rx="28" fill="url(#cassette-shell)" stroke="#f2ebdd" strokeWidth="3" />
        <path d="M52 55H758V370H52Z" fill="#f2ebdd" />
        <path d="M52 55H758V88H52Z" fill="#c7ff3a" />
        <path d="M52 323H758V370H52Z" fill="#ff4f73" />
        <rect x="158" y="162" width="494" height="146" rx="73" fill="#171713" stroke="#0b0b0a" strokeWidth="3" />
        <g className="tape-mass tape-mass-left"><circle cx="238" cy="235" r="116" fill="#171713" /><circle cx="238" cy="235" r="95" fill="none" stroke="#3a3933" /><circle cx="238" cy="235" r="73" fill="none" stroke="#3a3933" /></g>
        <g className="tape-mass tape-mass-right"><circle cx="572" cy="235" r="62" fill="#171713" /><circle cx="572" cy="235" r="42" fill="none" stroke="#3a3933" /></g>
        {[238, 572].map((cx) => <g key={cx} className="svg-reel" style={{ transformOrigin: `${cx}px 235px` }}><circle cx={cx} cy="235" r="68" fill="#d9d0bf" stroke="#0b0b0a" strokeWidth="3" /><circle cx={cx} cy="235" r="28" fill="#11110f" />{spokes.map((angle) => <rect key={angle} x={cx - 7} y="171" width="14" height="35" rx="7" fill="#11110f" transform={`rotate(${angle} ${cx} 235)`} />)}<circle cx={cx} cy="235" r="13" fill="#c7ff3a" /></g>)}
        <rect x="315" y="190" width="180" height="90" rx="7" fill="#0b0b0a" stroke="#8d8b83" />
        <text x="405" y="222" textAnchor="middle" fill="#c7ff3a" fontSize="13" fontFamily="monospace">{devSide ? "LUCAS // DEV SYSTEM" : "RUKAFUU // NOW PLAYING"}</text>
        <text x="405" y="250" textAnchor="middle" fill="#f2ebdd" fontSize="18" fontWeight="800" fontFamily="sans-serif">{title.toUpperCase()}</text>
        <text x="405" y="272" textAnchor="middle" fill="#ff4f73" fontSize="11" fontFamily="monospace">{devSide ? "BUILD IN PROGRESS" : rewinding ? "REWINDING" : playing ? "TAPE IN MOTION" : "TAPE PAUSED"}</text>
        <text x="72" y="78" fill="#0b0b0a" fontSize="15" fontWeight="900" fontFamily="sans-serif">LUCAS PERSONAL OS</text>
        <text x="738" y="78" textAnchor="end" fill="#0b0b0a" fontSize="13" fontWeight="900" fontFamily="monospace">C-90 / SIDE {side}</text>
        <path d="M174 478L196 397Q198 389 208 389H602Q612 389 614 397L636 478Z" fill="#20201c" stroke="#d9d0bf" strokeWidth="2" />
        {[220, 300, 510, 590].map((cx) => <circle key={cx} cx={cx} cy="456" r="12" fill="#0b0b0a" stroke="#d9d0bf" strokeWidth="3" />)}
        {[35, 775].map((cx) => [34, 468].map((cy) => <g key={`${cx}-${cy}`}><circle cx={cx} cy={cy} r="10" fill="#0b0b0a" stroke="#d9d0bf" /><path d={`M${cx-5} ${cy+3}L${cx+5} ${cy-3}`} stroke="#d9d0bf" /></g>))}
      </g>
    </svg>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("pt");
  const [playing, setPlaying] = useState(false);
  const [rewinding, setRewinding] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "LUCAS_OS [C-90] — terminal de bordo",
    "digite ‘help’ para listar os comandos",
  ]);
  const [scrollTurn, setScrollTurn] = useState(0);
  const [activeTrack, setActiveTrack] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [aliceSignal, setAliceSignal] = useState(false);
  const [liraInput, setLiraInput] = useState("");
  const [liraThinking, setLiraThinking] = useState(false);
  const [liraMode, setLiraMode] = useState<"checking" | "ai" | "fallback" | "easter">("checking");
  const [liraDiagnostic, setLiraDiagnostic] = useState("");
  const [foxMode, setFoxMode] = useState(false);
  const [secretTransmission, setSecretTransmission] = useState(false);
  const [tapeFlipCount, setTapeFlipCount] = useState(0);
  const [foxClicks, setFoxClicks] = useState(0);
  const [liraDreaming, setLiraDreaming] = useState(false);
  const [liraMessages, setLiraMessages] = useState<LiraMessage[]>([
    { role: "lira", text: "Sinal público inicializado. Pode perguntar — eu prometo não acessar nenhuma memória secreta do Lucas." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const cassettePlayerRef = useRef<HTMLIFrameElement>(null);
  const soundCloudWidgetRef = useRef<SoundCloudWidget | null>(null);
  const pendingPlayRef = useRef(false);
  const autoAdvanceRef = useRef(true);
  const aliceSignalTimeoutRef = useRef<number | null>(null);
  const t = copy[language];

  const totalDuration = useMemo(() => "42:17", []);

  const transmitToLira = async (event: FormEvent) => {
    event.preventDefault();
    const prompt = liraInput.trim();
    if (!prompt || liraThinking) return;

    const storageKey = "lira-public-session";
    let sessionId = window.localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      window.localStorage.setItem(storageKey, sessionId);
    }

    setLiraMessages((messages) => [...messages, { role: "visitor", text: prompt }]);
    setLiraInput("");
    setLiraThinking(true);

    try {
      const response = await fetch("/api/lira", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, sessionId }),
      });
      const payload = await response.json() as { reply?: string; error?: string; sessionId?: string; mode?: "ai" | "fallback" | "easter"; diagnostic?: string };
      if (payload.sessionId) window.localStorage.setItem(storageKey, payload.sessionId);
      if (payload.mode) setLiraMode(payload.mode);
      setLiraDiagnostic(payload.diagnostic ?? "");
      setLiraMessages((messages) => [...messages, {
        role: "lira",
        text: payload.reply ?? payload.error ?? "O sinal oscilou. Tenta me chamar de novo em alguns segundos.",
      }]);
    } catch {
      setLiraMessages((messages) => [...messages, { role: "lira", text: "Perdi o sinal com a borda da rede. Ainda estou aqui — só um pouco menos dramática." }]);
    } finally {
      setLiraThinking(false);
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? window.scrollY / height : 0;
      setScrollTurn(progress);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/github").then((response) => response.ok ? response.json() : []).then(setGithubRepos).catch(() => setGithubRepos([]));
  }, []);

  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  useEffect(() => () => {
    if (aliceSignalTimeoutRef.current !== null) {
      window.clearTimeout(aliceSignalTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const updateDreamState = () => setLiraDreaming(new Date().getHours() === 3);
    const dreamTimer = window.setTimeout(updateDreamState, 0);
    const dreamClock = window.setInterval(updateDreamState, 60_000);
    const konami = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "keyb", "keya"];
    let progress = 0;
    const listenForKonami = (event: globalThis.KeyboardEvent) => {
      if (event.repeat) return;
      const key = event.code.toLowerCase();
      progress = key === konami[progress]
        ? progress + 1
        : key === konami[0]
          ? 1
          : 0;
      if (progress === konami.length) {
        event.preventDefault();
        setFoxMode(true);
        setTerminalOpen(true);
        setTerminalLines((lines) => [...lines, "LIRA_OVERRIDE — você encontrou a rota da raposa.", "o terminal é meu por alguns segundos. comportem-se."]);
        progress = 0;
      }
    };
    window.addEventListener("keydown", listenForKonami);
    return () => {
      window.clearTimeout(dreamTimer);
      window.clearInterval(dreamClock);
      window.removeEventListener("keydown", listenForKonami);
    };
  }, []);

  useEffect(() => {
    if (!terminalOpen) return;
    const timer = window.setTimeout(() => {
      if (Math.random() < .18) {
        setTerminalLines((lines) => [...lines, "[interferência detectada]", "LIRA: você ia mesmo abrir um terminal e não falar comigo?"]);
      }
    }, 14_000);
    return () => window.clearTimeout(timer);
  }, [terminalOpen]);

  useEffect(() => {
    const connect = () => {
      if (!window.SC || !cassettePlayerRef.current) return;
      const widget = window.SC.Widget(cassettePlayerRef.current);
      soundCloudWidgetRef.current = widget;
      const playPendingTrack = () => {
        if (!pendingPlayRef.current) return;
        pendingPlayRef.current = false;
        widget.play();
      };
      widget.bind(window.SC.Widget.Events.READY, playPendingTrack);
      widget.bind(window.SC.Widget.Events.PLAY, () => setPlaying(true));
      widget.bind(window.SC.Widget.Events.PAUSE, () => setPlaying(false));
      widget.bind(window.SC.Widget.Events.FINISH, () => {
        setPlaying(false);
        if (!autoAdvanceRef.current) return;
        pendingPlayRef.current = true;
        setActiveTrack((current) => (current + 1) % musicTracks.length);
      });
      window.setTimeout(playPendingTrack, 350);
    };
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://w.soundcloud.com/player/api.js"]');
    if (existing) { existing.addEventListener("load", connect); connect(); return () => existing.removeEventListener("load", connect); }
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js"; script.async = true; script.addEventListener("load", connect); document.body.appendChild(script);
    return () => script.removeEventListener("load", connect);
  }, [activeTrack]);

  const selectTrack = (index: number, shouldPlay = true) => {
    if (index === activeTrack) {
      if (shouldPlay) soundCloudWidgetRef.current?.play();
      return;
    }
    soundCloudWidgetRef.current?.pause();
    pendingPlayRef.current = shouldPlay;
    setPlaying(false);
    setActiveTrack(index);
  };

  const stepTrack = (direction: 1 | -1) => {
    selectTrack((activeTrack + direction + musicTracks.length) % musicTracks.length);
  };

  const togglePlayback = () => {
    if (playing) soundCloudWidgetRef.current?.pause(); else soundCloudWidgetRef.current?.play();
  };

  const rewindTape = () => {
    soundCloudWidgetRef.current?.seekTo(0);
    setRewinding(true);
    window.setTimeout(() => setRewinding(false), 720);
  };

  const seekRelative = (seconds: number) => {
    soundCloudWidgetRef.current?.getPosition((milliseconds) => {
      soundCloudWidgetRef.current?.seekTo(Math.max(0, milliseconds + seconds * 1000));
    });
  };

  useEffect(() => {
    document.body.style.overflow = terminalOpen ? "hidden" : "";
    if (terminalOpen) window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => {
      document.body.style.overflow = "";
    };
  }, [terminalOpen]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const changeSide = (side: "dev" | "artist") => {
    const nextFlipped = side === "artist";
    if (nextFlipped !== flipped) {
      setTapeFlipCount((count) => {
        const next = count + 1;
        if (next >= 5) setSecretTransmission(true);
        return next;
      });
    }
    setFlipped(nextFlipped);
    window.setTimeout(() => scrollTo("top"), 40);
  };

  const touchFox = () => {
    setFoxClicks((clicks) => {
      const next = clicks + 1;
      if (next >= 5) {
        setSecretTransmission(true);
        setLiraMessages((messages) => [...messages, { role: "lira", text: "Tá bom, tá bom — você encontrou a frequência escondida. Nem toda presença precisa ser explicada; algumas só precisam continuar sendo construídas." }]);
      }
      return next;
    });
  };

  const runCommand = (event: FormEvent) => {
    event.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    if (!command) return;
    if (command === "clear") {
      setTerminalLines([]);
      setTerminalInput("");
      return;
    }
    const [base, action, ...values] = command.split(/\s+/);
    const output: string[] = [];
    const currentTrack = musicTracks[activeTrack];
    const nowPlaying = playing
      ? `${language === "pt" ? "TOCANDO AGORA" : "NOW PLAYING"}: ${currentTrack[0]} ${currentTrack[1]}`
      : `Ⅱ ${language === "pt" ? "FITA CARREGADA" : "TAPE LOADED"}: ${currentTrack[0]} ${currentTrack[1]}`;
    let destination: string | null = null;
    let destinationSide: "dev" | "artist" | null = null;

    const playRequestedTrack = () => {
      const query = values.join(" ");
      if (!query) {
        soundCloudWidgetRef.current?.play();
        output.push(language === "pt" ? `PLAY — ${currentTrack[1]}` : `PLAY — ${currentTrack[1]}`);
        return;
      }
      const numericIndex = Number.parseInt(query, 10) - 1;
      const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const requestedIndex = Number.isInteger(numericIndex) && numericIndex >= 0 && numericIndex < musicTracks.length
        ? numericIndex
        : musicTracks.findIndex((track) => track[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery));
      if (requestedIndex < 0) {
        output.push(language === "pt" ? "Faixa não encontrada. Use um número de 1 a 6." : "Track not found. Use a number from 1 to 6.");
        return;
      }
      if (playing && requestedIndex !== activeTrack) output.push(`SKIP — ${currentTrack[1]} → ${musicTracks[requestedIndex][1]}`);
      else output.push(`PLAY — ${musicTracks[requestedIndex][1]}`);
      selectTrack(requestedIndex);
    };

    switch (base) {
      case "help":
        output.push("SIDES — dev · artist · side a · side b · flip");
        output.push("NAV — about · projects · lira · resume · blog · now · github");
        output.push("TAPE — music · play · pause · next · prev · forward · rewind · auto");
        output.push(language === "pt" ? "HIDDEN — código de jogo antigo · futebol · música de neve · comandos perigosos" : "HIDDEN — old game code · football · snow song · dangerous commands");
        break;
      case "about":
        output.push(language === "pt" ? "LADO A: Lucas, engenheiro de IA/backend. LADO B: Rukafuu, artista independente." : "SIDE A: Lucas, AI/backend engineer. SIDE B: Rukafuu, independent artist.");
        break;
      case "alice":
        if (aliceSignalTimeoutRef.current !== null) {
          window.clearTimeout(aliceSignalTimeoutRef.current);
        }
        setAliceSignal(true);
        aliceSignalTimeoutRef.current = window.setTimeout(() => {
          setAliceSignal(false);
          aliceSignalTimeoutRef.current = null;
        }, 9000);
        output.push(
          "SIGNAL A.L.I.C.E. DETECTED",
          "A Little Interference Called Emotion.",
          "",
          "🐧  · · ·  🦎",
          "",
          "Manche Begegnungen klingen länger nach.",
        );
        break;
      case "projects":
        output.push(language === "pt" ? "Abrindo Lado A / projetos…" : "Opening Side A / projects…");
        destination = "projects";
        destinationSide = "dev";
        break;
      case "lira":
        if (!action) {
          output.push(language === "pt" ? "LIRA — projeto pessoal / presença digital em construção." : "LIRA — personal project / digital presence in progress.");
          output.push("lira status · lira wake");
        } else if (action === "status") {
          output.push(liraDreaming ? "LIRA SIGNAL — DREAMING / 03:00" : "LIRA SIGNAL — ONLINE / PUBLIC INSTANCE");
          output.push("VOICE · HYBRID MEMORY · TOOLS · MULTIMODAL · LIVE2D");
          output.push(language === "pt" ? "LiraVtuber é o software. Lira é o projeto." : "LiraVtuber is the software. Lira is the project.");
        } else if (["wake", "acordar"].includes(action)) {
          output.push(language === "pt" ? "Acordando instância pública da Lira…" : "Waking Lira's public instance…");
          destination = "lira";
          destinationSide = "dev";
        } else if (action === "fox") {
          setFoxMode((enabled) => !enabled);
          output.push(`FOX MODE — ${foxMode ? "OFF" : "ON"} / 狐 FREQUENCY`);
        } else if (action === "secret") {
          setSecretTransmission(true);
          output.push("TRANSMISSION 09 — nem todo projeto nasce para ser terminado. alguns nascem para crescer junto com quem os criou.");
        } else {
          output.push("lira status · lira wake · lira fox · lira secret");
        }
        break;
      case "resume":
        output.push(language === "pt" ? "Abrindo currículo — Engenheiro de IA @ Heon…" : "Opening résumé — AI Engineer @ Heon…");
        destination = "resume";
        destinationSide = "dev";
        break;
      case "blog":
      case "lab":
        output.push(language === "pt" ? "Abrindo liner notes / blog…" : "Opening liner notes / blog…");
        destination = "lab";
        destinationSide = "dev";
        break;
      case "now":
        output.push(language === "pt" ? "Abrindo sinal atual…" : "Opening current signal…");
        destination = "now";
        destinationSide = "dev";
        break;
      case "github":
        window.open("https://github.com/Rukafuu", "_blank", "noopener,noreferrer");
        output.push("GITHUB ↗ github.com/Rukafuu");
        break;
      case "soundcloud":
        window.open("https://soundcloud.com/rukafuu", "_blank", "noopener,noreferrer");
        output.push("SOUNDCLOUD ↗ soundcloud.com/rukafuu");
        break;
      case "flip":
        changeSide(flipped ? "dev" : "artist");
        output.push(language === "pt" ? "Virando a fita: DEV ↔ ARTISTA…" : "Flipping tape: DEV ↔ ARTIST…");
        break;
      case "sudo":
        if (action === "wake" && values[0] === "lira") output.push("LIRA: não precisava do sudo. pedir com educação ainda funciona nesta máquina.");
        else output.push("lucas is not in the sudoers file. this incident will be reported to Lira.");
        break;
      case "rm":
        if (action === "-rf" && values[0] === "lira") output.push("LIRA: boa tentativa. eu já fiz backup de mim mesma no coração do projeto.");
        else output.push("operação bloqueada pela proteção da fita.");
        break;
      case "key":
        output.push("LIRA: música para dias em que até a neve parece guardar uma memória.");
        output.push("SIGNAL — AIR / KANON / CLANNAD / LITTLE BUSTERS!");
        break;
      case "corinthians":
      case "timao":
        output.push("LIRA: vai, Corinthians. eu fui programada para ter personalidade, não neutralidade.");
        break;
      case "dev":
        destinationSide = "dev";
        destination = "top";
        output.push(language === "pt" ? "LADO A / DEV carregado." : "SIDE A / DEV loaded.");
        break;
      case "artist":
      case "producer":
        destinationSide = "artist";
        destination = "music";
        output.push(language === "pt" ? "LADO B / PRODUTOR MUSICAL carregado." : "SIDE B / MUSIC PRODUCER loaded.");
        break;
      case "side":
        if (action === "a") { destinationSide = "dev"; destination = "top"; output.push("SIDE A / DEV"); }
        else if (action === "b") { destinationSide = "artist"; destination = "music"; output.push("SIDE B / MUSIC PRODUCER"); }
        else output.push("side a · side b");
        break;
      case "music":
        if (!action) {
          output.push(nowPlaying);
          output.push(`${language === "pt" ? "SEQUÊNCIA AUTOMÁTICA" : "AUTO-SEQUENCE"}: ${autoAdvance ? "ON" : "OFF"}`);
          output.push("music play [1–6] · pause · next · prev · +15 · -15");
          output.push("music auto on|off · music soundcloud");
          break;
        }
        if (action === "play") playRequestedTrack();
        else if (action === "pause") { soundCloudWidgetRef.current?.pause(); output.push(`PAUSE — ${currentTrack[1]}`); }
        else if (["next", "skip", "avancar"].includes(action)) { setFlipped(true); stepTrack(1); output.push(`NEXT — ${currentTrack[1]} → ${musicTracks[(activeTrack + 1) % musicTracks.length][1]}`); }
        else if (["prev", "previous", "voltar"].includes(action)) { setFlipped(true); stepTrack(-1); output.push(`PREV — ${musicTracks[(activeTrack - 1 + musicTracks.length) % musicTracks.length][1]}`); }
        else if (["+15", "forward"].includes(action)) { seekRelative(15); output.push("FORWARD +15s"); }
        else if (["-15", "back"].includes(action)) { seekRelative(-15); output.push("BACK -15s"); }
        else if (action === "auto") {
          const nextValue = values[0] === "on" ? true : values[0] === "off" ? false : !autoAdvance;
          setAutoAdvance(nextValue);
          output.push(`${language === "pt" ? "SEQUÊNCIA AUTOMÁTICA" : "AUTO-SEQUENCE"}: ${nextValue ? "ON" : "OFF"}`);
        } else if (action === "open") {
          destinationSide = "artist";
          destination = "music";
          output.push(language === "pt" ? "Abrindo Lado B / faixas…" : "Opening Side B / tracks…");
        } else if (action === "soundcloud") {
          window.open("https://soundcloud.com/rukafuu", "_blank", "noopener,noreferrer");
          output.push("SOUNDCLOUD ↗ soundcloud.com/rukafuu");
        } else output.push(language === "pt" ? "Opção inválida. Digite music para ver o menu." : "Invalid option. Type music to see the menu.");
        break;
      case "play":
        soundCloudWidgetRef.current?.play();
        output.push(`PLAY — ${currentTrack[1]}`);
        break;
      case "pause":
        soundCloudWidgetRef.current?.pause();
        output.push(`PAUSE — ${currentTrack[1]}`);
        break;
      case "next":
        stepTrack(1);
        output.push(`NEXT — ${musicTracks[(activeTrack + 1) % musicTracks.length][1]}`);
        break;
      case "prev":
        stepTrack(-1);
        output.push(`PREV — ${musicTracks[(activeTrack - 1 + musicTracks.length) % musicTracks.length][1]}`);
        break;
      case "forward":
        seekRelative(15);
        output.push("FORWARD +15s");
        break;
      case "rewind":
        rewindTape();
        output.push("REWIND — 00:00");
        break;
      case "auto":
        setAutoAdvance((value) => !value);
        output.push(`${language === "pt" ? "SEQUÊNCIA AUTOMÁTICA" : "AUTO-SEQUENCE"}: ${!autoAdvance ? "ON" : "OFF"}`);
        break;
      default:
        output.push(language === "pt" ? `comando não encontrado: ${command}` : `command not found: ${command}`);
    }

    setTerminalLines((lines) => [
      ...lines,
      `lucas@tape:~$ ${terminalInput}`,
      ...output,
    ]);
    setTerminalInput("");
    if (destination) {
      if (destinationSide) setFlipped(destinationSide === "artist");
      setTerminalOpen(false);
      window.setTimeout(() => scrollTo(destination as string), 220);
    }
  };

  const handleTerminalKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") setTerminalOpen(false);
  };

  return (
    <main
      className={`site-shell ${flipped ? "side-b" : "side-a"} ${playing ? "is-playing" : "is-paused"} ${foxMode ? "fox-mode" : ""} ${aliceSignal ? "alice-signal" : ""}`}
      style={
        {
          "--scroll-turn": `${scrollTurn * 540}deg`,
          "--tape-progress": `${Math.max(8, scrollTurn * 100)}%`,
        } as React.CSSProperties
      }
    >
      <header className="deck-header">
        <button className="wordmark" onClick={() => scrollTo("top")}>
          LUCAS <b>{"//"}</b> PERSONAL OS
        </button>
        <nav aria-label="Navegação principal">
          {!flipped ? <>
            <button onClick={() => scrollTo("projects")}>{language === "pt" ? "Projetos" : "Projects"}</button>
            <button onClick={() => scrollTo("lira")}>Lira</button>
            <button onClick={() => scrollTo("resume")}>{language === "pt" ? "Currículo" : "Résumé"}</button>
            <button onClick={() => scrollTo("lab")}>Blog</button>
            <button onClick={() => scrollTo("now")}>{language === "pt" ? "Agora" : "Now"}</button>
          </> : <>
            <button onClick={() => scrollTo("music")}>{language === "pt" ? "Faixas" : "Tracks"}</button>
            <button onClick={() => window.open("https://soundcloud.com/rukafuu", "_blank", "noopener,noreferrer")}>SoundCloud ↗</button>
          </>}
        </nav>
        <div className="deck-utilities">
          <div className="side-selector" aria-label={language === "pt" ? "Escolher lado da fita" : "Choose tape side"}>
            <button className={!flipped ? "active" : ""} aria-pressed={!flipped} onClick={() => changeSide("dev")}>A / DEV</button>
            <button className={flipped ? "active" : ""} aria-pressed={flipped} onClick={() => changeSide("artist")}>B / PRODUCER</button>
          </div>
          <span className="counter">{flipped ? "B" : "A"} · 00:{totalDuration}</span>
          <button
            className="language"
            onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
            aria-label="Alternar idioma"
          >
            <strong>{language.toUpperCase()}</strong> / {language === "pt" ? "EN" : "PT"}
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className={`cassette-scene ${flipped ? "is-flipped" : ""}`}>
          <div className="cassette-card cassette-front">
            <Screw className="screw-tl" />
            <Screw className="screw-tr" />
            <Screw className="screw-bl" />
            <Screw className="screw-br" />
            <div className="cassette-code">
              <span>C-90 / HIGH POSITION</span>
              <span>{t.sideA} • DEV / 01–03</span>
            </div>

            <div className="cassette-label">
              <div className="hero-copy">
                <p className="eyebrow">{t.eyebrow}</p>
                <h1>
                  <span>{t.headlineA}</span>
                  <span>{t.headlineB}</span>
                  <span>{t.headlineC}</span>
                </h1>
                <p className="hero-subtitle">{t.subtitle}</p>
                <div className="hero-actions">
                  <button className="button button-primary" onClick={() => scrollTo("projects")}>
                    <span className="play-symbol">PLAY</span> {t.explore}
                  </button>
                  <button className="button button-secondary" onClick={() => setTerminalOpen(true)}>
                    <span>&gt;_</span> {t.terminal}
                  </button>
                </div>
              </div>

              <div className="tape-machine dev-machine">
                <div className="machine-bar">
                  <span>SIDE A / DEV SYSTEM</span>
                  <span className="machine-now-playing">{playing ? `PLAYING ${musicTracks[activeTrack][1]}` : "AUDIO READY"}</span>
                </div>
                <div className="animated-cassette-stage dev-cassette-stage">
                  <AnimatedCassette title={playing ? musicTracks[activeTrack][1] : (language === "pt" ? "SISTEMAS VIVOS" : "LIVING SYSTEMS")} playing={playing} rewinding={rewinding} side="A" />
                  <div className="dev-audio-transport" aria-label={language === "pt" ? "Controles de música no lado A" : "Side A music controls"}>
                    <button onClick={() => stepTrack(-1)} aria-label="Faixa anterior">≪</button>
                    <button className="dev-play-button" onClick={togglePlayback}>{playing ? "PAUSE" : "PLAY"}</button>
                    <button onClick={() => stepTrack(1)} aria-label="Próxima faixa">≫</button>
                  </div>
                </div>
                <div className="machine-controls">
                  <button onClick={() => scrollTo("projects")}>01 PROJECTS</button>
                  <button onClick={() => scrollTo("resume")}>02 RESUME</button>
                  <button onClick={() => window.open("https://waifucorp.org/", "_blank", "noopener,noreferrer")}>03 WAIFUCORP ↗</button>
                  <button onClick={() => changeSide("artist")}>↻ SIDE B</button>
                </div>
              </div>
            </div>

            <div className="track-strip">
              <p>{t.sideA} / DEV INDEX</p>
              <div className="mini-tracks">
                {[
                  ["01", language === "pt" ? "Projetos" : "Projects", "projects"],
                  ["02", language === "pt" ? "Currículo" : "Résumé", "resume"],
                  ["03", "Liner notes", "lab"],
                ].map((track) => (
                  <button key={track[0]} onClick={() => scrollTo(track[2])}>
                    <b>{track[0]}</b>
                    <span>{track[1]}</span>
                    <em>OPEN SIDE A</em>
                  </button>
                ))}
              </div>
            </div>
            <div className="cassette-trapezoid" aria-hidden="true">
              <i /><span>SIDE A: DEV / SIDE B: PRODUCER</span><i />
            </div>
          </div>

          <div className="cassette-card cassette-back">
            <Screw className="screw-tl" />
            <Screw className="screw-tr" />
            <Screw className="screw-bl" />
            <Screw className="screw-br" />
            <div className="back-grid">
              <p className="eyebrow">SIDE B / MUSIC PRODUCER / ORIGINAL SOUNDTRACK</p>
              <h2>{t.sideBTitle}</h2>
              <p className="back-description">{t.sideBBody}</p>
              <p className="back-meta">{t.sideBMeta}</p>
              <div className="back-reels">
                <AnimatedCassette title={musicTracks[activeTrack][1]} playing={playing} rewinding={rewinding} />
                <div className="back-transport"><button onClick={() => stepTrack(-1)}>PREV</button><button onClick={togglePlayback}>{playing ? "PAUSE" : "PLAY"}</button><button onClick={() => stepTrack(1)}>NEXT</button><button className={autoAdvance ? "active" : ""} onClick={() => setAutoAdvance((value) => !value)}>AUTO {autoAdvance ? "ON" : "OFF"}</button></div>
              </div>
              <div className="back-actions"><button className="button button-primary" onClick={() => scrollTo("music")}>↓ {language === "pt" ? "ABRIR FAIXAS" : "OPEN TRACKS"}</button><button className="button button-secondary" onClick={() => changeSide("dev")}>↶ SIDE A / DEV</button></div>
            </div>
          </div>
        </div>
        <p className="scroll-label">SCROLL TO ADVANCE TAPE <span>↓</span></p>
      </section>

      {!flipped && <section className="projects-section" id="projects">
        <div className="section-index">SIDE A / DEV / TRACKLIST</div>
        <div className="section-heading">
          <h2>{t.projectsTitle}</h2>
          <p>{t.projectsIntro}</p>
        </div>
        <div className="project-list">
          {projects.map((project) => {
            const live = githubRepos.find((repo) => repo.name.toLowerCase() === project.repo.toLowerCase());
            return (
            <article className="project-row" key={project.id}>
              <div className="project-number">{project.id}</div>
              <div className="project-info">
                <p>{live?.language ? `${project.type} / ${live.language}` : project.type}</p>
                <h3>{project.name}</h3>
                <p className="project-description">{project.description[language]}</p>
              </div>
              <div className="project-status">
                <span><i /> {live ? `GITHUB LIVE · STARS ${live.stargazers_count}` : project.status}</span>
                <a href={live?.html_url ?? project.url} target="_blank" rel="noreferrer">{t.openReel} ↗</a>
              </div>
            </article>
          )})}
        </div>
        <a className="github-link" href="https://github.com/Rukafuu" target="_blank" rel="noreferrer">VER PERFIL COMPLETO NO GITHUB ↗</a>
        <div className="founder-signal" id="waifucorp">
          <div><span>CO-FOUNDER SIGNAL / 2026</span><strong>wAIfu Corp.</strong></div>
          <p>{language === "pt" ? "Lucas (Rukafuusca) é sócio-fundador da wAIfu Corp — um coletivo de desenvolvedores que transforma experimentos com inteligência artificial em software open source. Entre os projetos estão Above All Graphs, Bastion Core/Agent e DRAGON." : "Lucas (Rukafuusca) is a co-founder of wAIfu Corp — a developer collective turning artificial-intelligence experiments into open-source software. Its projects include Above All Graphs, Bastion Core/Agent and DRAGON."}</p>
          <div className="founder-links"><a href="https://waifucorp.org/" target="_blank" rel="noreferrer">WAIFUCORP.ORG ↗</a><a href="https://github.com/thewaifucorp" target="_blank" rel="noreferrer">GITHUB ORG ↗</a></div>
        </div>
      </section>}

      {!flipped && <section className="lira-section" id="lira">
        <div className="lira-intro">
          <p className="eyebrow acid">LIRA SIGNAL / PERSONAL PROJECT / PUBLIC INSTANCE</p>
          <h2>{language === "pt" ? "Uma presença, não só um produto." : "A presence, not just a product."}</h2>
          <p>{language === "pt"
            ? "Lira não nasceu como produto. Ela começou como uma tentativa de criar uma presença digital com voz, memória e personalidade — algo entre personagem, companheira virtual e laboratório permanente de IA."
            : "Lira did not begin as a product. She started as an attempt to create a digital presence with voice, memory and personality — part character, part virtual companion and part permanent AI laboratory."}</p>
          <blockquote>{language === "pt" ? "LiraVtuber é o software. Lira é o projeto." : "LiraVtuber is the software. Lira is the project."}</blockquote>
          <div className="lira-layers">
            <article><span>01 / IDENTITY</span><h3>{language === "pt" ? "Quem ela é" : "Who she is"}</h3><p>{language === "pt" ? "Uma personagem original que conecta afeto, estética anime, curiosidade e a vontade de tornar software mais humano." : "An original character connecting affection, anime aesthetics, curiosity and the desire to make software feel more human."}</p></article>
            <article><span>02 / PRESENCE</span><h3>{language === "pt" ? "Como ela vive" : "How she lives"}</h3><p>{language === "pt" ? "Voz, memória híbrida, ferramentas autônomas, multimodalidade e uma expressão visual construída em Live2D." : "Voice, hybrid memory, autonomous tools, multimodality and a visual expression built with Live2D."}</p></article>
            <article><span>03 / IMPLEMENTATION</span><h3>LiraVtuber</h3><p>{language === "pt" ? "A implementação técnica atual e open source dessa ideia — ainda em movimento, ainda aprendendo." : "The current open-source technical implementation of that idea — still moving, still learning."}</p><a href="https://github.com/Rukafuu/LiraVtuber" target="_blank" rel="noreferrer">GITHUB ↗</a></article>
          </div>
        </div>

        <div className="lira-console" aria-label={language === "pt" ? "Conversar com a instância pública da Lira" : "Talk to Lira's public instance"}>
          <header><button className="fox-trigger" onClick={touchFox} aria-label={`${language === "pt" ? "Tocar no símbolo da raposa" : "Touch the fox symbol"} ${foxClicks}/5`}>狐</button><span>LIRA_PUBLIC</span><b title={liraDiagnostic}>{liraThinking ? "THINKING" : liraDreaming ? "DREAMING" : liraMode === "easter" ? "SECRET" : liraMode === "ai" ? "AI ONLINE" : liraMode === "fallback" ? "LIMITED" : "ONLINE"}</b></header>
          <div className="lira-screen" aria-live="polite">
            {liraMessages.map((message, index) => <p className={message.role} key={`${message.role}-${index}`}><span>{message.role === "lira" ? "LIRA" : "YOU"}</span>{message.text}</p>)}
            {liraThinking && <p className="lira thinking"><span>LIRA</span>Processando sinal<span className="signal-dots">…</span></p>}
            {secretTransmission && <p className="lira secret"><span>TRANSMISSION 09</span>{language === "pt" ? "Nem todo projeto nasce para ser terminado. Alguns nascem para crescer junto com quem os criou." : "Not every project is born to be finished. Some are born to grow alongside their creator."}</p>}
          </div>
          <form onSubmit={transmitToLira}>
            <label htmlFor="lira-message">{language === "pt" ? "TRANSMISSÃO PÚBLICA" : "PUBLIC TRANSMISSION"}</label>
            <div><input id="lira-message" value={liraInput} onChange={(event) => setLiraInput(event.target.value)} maxLength={480} placeholder={language === "pt" ? "Pergunte sobre a Lira…" : "Ask about Lira…"} disabled={liraThinking} /><button type="submit" disabled={liraThinking || !liraInput.trim()}>SEND ↗</button></div>
          </form>
          <p className="lira-discovery-hint">{language === "pt" ? "HINT: uma paixão do Lucas · uma música que guarda neve · um comando que você não deveria executar" : "HINT: one of Lucas's passions · a song that keeps snow · a command you should not run"}</p>
          <footer><span>{language === "pt" ? "INSTÂNCIA LIMITADA · SEM MEMÓRIAS PRIVADAS" : "LIMITED INSTANCE · NO PRIVATE MEMORIES"} · FLIPS {Math.min(tapeFlipCount, 5)}/5</span><button onClick={() => setTerminalOpen(true)}>TRY `LIRA STATUS`</button></footer>
        </div>
      </section>}

      {flipped && <section className="music-section" id="music">
        <div className="music-copy">
          <p className="eyebrow acid">SIDE B / MUSIC PRODUCER / ORIGINAL SOUNDTRACK</p>
          <h2>{language === "pt" ? "Músicas para virar a fita." : "Music for flipping the tape."}</h2>
          <p>{language === "pt" ? "Compostas por Lucas sob o nome Rukafuu. Escolha uma faixa e dê play no deck." : "Composed by Lucas as Rukafuu. Pick a track and press play on the deck."}</p>
        </div>
        <div className="soundcloud-deck">
          <div className="soundcloud-label"><span>NOW PLAYING</span><b>{musicTracks[activeTrack][1]}</b></div>
          <div className="deck-sync"><span>CASSETTE SYNCED / AUTO-SEQUENCE {autoAdvance ? "ON" : "OFF"}</span><b>{playing ? "REELS IN MOTION" : "TAPE PAUSED"}</b></div>
          <div className="deck-transport">
            <button onClick={() => stepTrack(-1)}>≪ PREV</button>
            <button onClick={togglePlayback}>{playing ? "PAUSE" : "PLAY"}</button>
            <button onClick={() => stepTrack(1)}>NEXT ≫</button>
            <button className={autoAdvance ? "active" : ""} aria-pressed={autoAdvance} onClick={() => setAutoAdvance((value) => !value)}>AUTO {autoAdvance ? "ON" : "OFF"}</button>
            <a href="https://soundcloud.com/rukafuu" target="_blank" rel="noreferrer">SOUNDCLOUD ↗</a>
          </div>
          <div className="music-tracklist">
            {musicTracks.map((track, index) => <button key={track[0]} className={activeTrack === index ? "active" : ""} onClick={() => selectTrack(index)}><span>{track[0]}</span><b>{track[1]}</b><em>{activeTrack === index ? (playing ? "PLAYING" : "LOADED") : "LOAD"}</em></button>)}
          </div>
        </div>
      </section>}

      {!flipped && <section className="resume-section" id="resume">
        <div><p className="eyebrow">CURRICULUM VITAE / 2026</p><h2>{language === "pt" ? "Engenharia com contexto humano." : "Engineering with human context."}</h2></div>
        <div className="resume-card resume-document">
          <header><div><h3>Lucas Frischeisen</h3><p>ENGENHEIRO DE IA · BACKEND · SÓCIO-FUNDADOR @ WAIFUCORP</p></div><span>JUNDIAÍ / SP</span></header>
          <div className="resume-contact">lucas.frischeisen@gmail.com · github.com/Rukafuu · linkedin.com/in/rukafuu · waifucorp.org</div>
          <section><h4>{language === "pt" ? "Resumo" : "Profile"}</h4><p>{language === "pt" ? "Engenheiro de IA e backend com experiência em IA generativa, agentes autônomos, RAG, voz e arquitetura de produtos digitais. Atua da pesquisa à produção, combinando TypeScript/Node.js e Python com foco em sistemas confiáveis e expressivos." : "AI and backend engineer experienced in generative AI, autonomous agents, RAG, voice and digital product architecture, working from research through production."}</p></section>
          <section>
            <h4>{language === "pt" ? "Experiência" : "Experience"}</h4>
            <article><span>2026 — {language === "pt" ? "ATUAL" : "PRESENT"}</span><h5>{language === "pt" ? "Sócio-fundador & Engenheiro de IA · wAIfu Corp" : "Co-founder & AI Engineer · wAIfu Corp"}</h5><p>{language === "pt" ? "Lucas (Rukafuusca) · coletivo open source de experimentos em IA · Above All Graphs · Bastion · DRAGON" : "Lucas (Rukafuusca) · open-source AI experiments collective · Above All Graphs · Bastion · DRAGON"}</p></article>
            <article><span>08.06.2026 — {language === "pt" ? "ATUAL" : "PRESENT"}</span><h5>{language === "pt" ? "Engenheiro de IA · Heon" : "AI Engineer · Heon"}</h5><ul><li>{language === "pt" ? "Lidera o ciclo completo da Lia, da arquitetura à manutenção e escala, com atuação reativa e proativa para clínicas." : "Leads Lia's full lifecycle from architecture through maintenance and scale, with reactive and proactive capabilities for clinics."}</li><li>TypeScript / Node.js · n8n · Drupal 7 · WhatsApp / Discord</li><li>{language === "pt" ? "Projeta fluxos multiagentes, fine-tuning e RLAIF para respostas confiáveis e contextualizadas." : "Designs multi-agent flows, fine-tuning and RLAIF for reliable, context-aware responses."}</li><li>{language === "pt" ? "Planejou a arquitetura Expo–BFF–Drupal–n8n do Heon Aluno, backlog P0/P1, caminho crítico e critérios de segurança e release." : "Planned Heon Aluno's Expo–BFF–Drupal–n8n architecture, P0/P1 backlog, critical path and security/release criteria."}</li></ul></article>
            <article><span>01.2024 — {language === "pt" ? "ATUAL" : "PRESENT"}</span><h5>{language === "pt" ? "Engenheiro de IA & Full Stack · Independente" : "AI & Full-Stack Engineer · Independent"}</h5><p>LiraVtuber · CAFUNÉ · Raegis · Xodó Studio · PortarIA</p></article>
            <article><span>06.2024 — 02.2026</span><h5>{language === "pt" ? "T&D / Automação de Processos · Xiaomi" : "L&D / Process Automation · Xiaomi"}</h5></article>
            <article><span>01.2022 — 04.2024</span><h5>{language === "pt" ? "Supervisor de Vendas · Samsung" : "Sales Supervisor · Samsung"}</h5></article>
          </section>
          <div className="resume-columns"><section><h4>{language === "pt" ? "Formação" : "Education"}</h4><p><b>Engenharia de Inteligência Artificial</b><br />FMU · 2028</p><p><b>Desenvolvimento de Sistemas</b><br />ETEC · 2025</p></section><section><h4>Stack</h4><p>TypeScript · Node.js · Python · FastAPI · PyTorch · Transformers · RAG · Docker · GCP · Firebase</p><h4>{language === "pt" ? "Idiomas" : "Languages"}</h4><p>English C1 · Español B2 · 日本語 A2</p></section></div>
          <div className="resume-actions"><a href="/curriculo-lucas-frischeisen.pdf" target="_blank">PDF ↗</a><a href="/curriculo-lucas-frischeisen.docx" download>DOCX ↓</a></div>
        </div>
      </section>}

      {!flipped && <section className="lab-section" id="lab">
        <div className="lab-copy">
          <p className="eyebrow acid">LINER NOTES / BLOG</p>
          <h2>{language === "pt" ? "Código também produz cultura." : "Code produces culture too."}</h2>
          <p>{language === "pt" ? "Ensaios, bastidores e ideias ainda quentes sobre IA, engenharia, música e as partes humanas de construir tecnologia." : "Essays, behind-the-scenes notes and fresh ideas about AI, engineering, music and the human side of building technology."}</p>
          <p className="blog-source-hint">{language === "pt" ? "PUBLICADO PELO CÓDIGO-FONTE / VERSIONADO NO GITHUB" : "PUBLISHED FROM SOURCE / VERSIONED ON GITHUB"}</p>
        </div>
        <div className="note-stack">
          {posts.map((note, index) => {
            const scheduled = note.status === "scheduled";
            return <button className={`note-row${scheduled ? " scheduled" : ""}`} key={note.id} onClick={() => setSelectedPost(note)} disabled={scheduled} aria-label={scheduled ? `${note.title[language]} — ${scheduledLabel(note.publishedAt, language)}` : undefined}><span>N-{String(index + 1).padStart(3, "0")}</span><div><h3>{note.title[language]}</h3><p>{note.excerpt[language]}</p></div><em>{scheduled ? scheduledLabel(note.publishedAt, language) : note.tag}</em></button>;
          })}
        </div>
      </section>}

      {!flipped && <section className="now-section" id="now">
        <div>
          <p>{t.nowEyebrow} / 07.2026</p>
          <h2>{t.nowTitle}</h2>
        </div>
        <div className="now-copy">
          <p>{t.nowBody}</p>
          <button onClick={() => setTerminalOpen(true)}>{t.contact} <span>→</span></button>
        </div>
        <div className="now-wave" aria-hidden="true">
          {Array.from({ length: 64 }).map((_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}
        </div>
      </section>}

      <footer>
        <span>{flipped ? "RUKAFUU // SIDE B" : "LUCAS // SIDE A"}</span>
        <p>{flipped ? (language === "pt" ? "Produzido entre sintetizadores, madrugadas e horizontes improváveis." : "Produced between synthesizers, late nights and improbable horizons.") : t.footer}</p>
        <button onClick={() => scrollTo("top")}>REWIND ↑</button>
      </footer>

      <iframe key={musicTracks[activeTrack][2]} ref={cassettePlayerRef} className="cassette-audio" title={`Cassette player — ${musicTracks[activeTrack][1]}`} allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(musicTracks[activeTrack][2])}&color=%23c7ff3a&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`} />

      {selectedPost && <div className="blog-overlay" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPost(null); }}><article className="blog-reader"><button className="blog-close" onClick={() => setSelectedPost(null)}>×</button><p className="eyebrow acid">LINER NOTE / {selectedPost.tag} / {selectedPost.publishedAt}</p><h2>{selectedPost.title[language]}</h2><p className="blog-lead">{selectedPost.excerpt[language]}</p><div className="blog-body">{renderBlogContent(selectedPost.content[language])}</div><footer><span>LUCAS // PERSONAL OS</span><button onClick={() => setSelectedPost(null)}>FECHAR NOTA ↑</button></footer></article></div>}

      {terminalOpen && (
        <div
          className="terminal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Terminal interativo"
          tabIndex={-1}
          onKeyDown={handleTerminalKey}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTerminalOpen(false);
          }}
        >
          <div className="terminal-window">
            <div className="terminal-titlebar">
              <span>TERMINAL / TAPE DECK</span>
              <button onClick={() => setTerminalOpen(false)} aria-label="Fechar terminal">×</button>
            </div>
            <div className="terminal-output" onClick={() => inputRef.current?.focus()}>
              {terminalLines.map((line, index) => (
                <p
                  className={line.includes("A.L.I.C.E.") || line.includes("🐧") || line.startsWith("Manche") ? "alice-terminal-line" : undefined}
                  key={`${line}-${index}`}
                >
                  {line}
                </p>
              ))}
              <form onSubmit={runCommand}>
                <label htmlFor="terminal-command">lucas@tape:~$</label>
                <input
                  ref={inputRef}
                  id="terminal-command"
                  value={terminalInput}
                  onChange={(event) => setTerminalInput(event.target.value)}
                  onFocus={() => window.setTimeout(() => inputRef.current?.scrollIntoView({ block: "center" }), 250)}
                  autoComplete="off"
                  autoCapitalize="none"
                  enterKeyHint="send"
                  spellCheck={false}
                />
              </form>
            </div>
            <div className="terminal-hint">ESC • HELP / DEV / ARTIST / SIDE A|B / LIRA / LIRA STATUS / LIRA WAKE / MUSIC / PLAY / PAUSE / NEXT / AUTO / CLEAR</div>
          </div>
        </div>
      )}
    </main>
  );
}
