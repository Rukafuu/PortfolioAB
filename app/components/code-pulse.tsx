"use client";

import { useEffect, useMemo, useState } from "react";
import type { CodePulsePayload, CodePulseSource } from "@/app/lib/code-pulse";

export function CodePulse({ language }: { language: "pt" | "en" }) {
  const [data, setData] = useState<CodePulsePayload | null>(null);
  const [source, setSource] = useState<"all" | CodePulseSource>("all");
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => { fetch("/api/code-pulse").then(async (response) => response.ok ? setData(await response.json() as CodePulsePayload) : setUnavailable(true)).catch(() => setUnavailable(true)); }, []);
  const totals = useMemo(() => {
    if (!data) return { total: 0, github: 0, bitbucket: 0, max: 0, days: [] as CodePulsePayload["days"] };
    const days = data.days.map((day) => ({ ...day, total: source === "all" ? day.total : day.sources[source] ?? 0 }));
    return { total: days.reduce((sum, day) => sum + day.total, 0), github: data.sources.github ?? 0, bitbucket: data.sources.bitbucket ?? 0, max: Math.max(1, ...days.map((day) => day.total)), days };
  }, [data, source]);
  const format = (date: string) => new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en-US", { dateStyle: "long", timeZone: "America/Sao_Paulo" }).format(new Date(`${date}T12:00:00Z`));
  if (unavailable) return <section className="pulse-section" id="pulse"><p className="section-index">SIDE A / DEV / PULSE</p><p className="pulse-unavailable">{language === "pt" ? "CODE PULSE / SINAL INDISPONÍVEL POR AGORA." : "CODE PULSE / SIGNAL UNAVAILABLE FOR NOW."}</p></section>;
  return <section className="pulse-section" id="pulse" aria-labelledby="pulse-title">
    <div className="pulse-heading"><div><p className="eyebrow acid">SIDE A / DEV / CODE PULSE</p><h2 id="pulse-title">Code<br />Pulse.</h2></div><p>{language === "pt" ? "Um rastro silencioso dos dias que passei construindo coisas." : "A quiet trace of the days I spent building things."}</p></div>
    {!data ? <div className="pulse-skeleton" aria-label={language === "pt" ? "Carregando atividade" : "Loading activity"} /> : <>
      <div className="pulse-meta"><strong>{totals.total}</strong><span>{language === "pt" ? "CONTRIBUIÇÕES / 365 DIAS" : "CONTRIBUTIONS / 365 DAYS"}</span><span>GITHUB {totals.github} · BITBUCKET {totals.bitbucket}</span></div>
      <div className="pulse-filters" role="group" aria-label={language === "pt" ? "Filtrar fonte" : "Filter source"}>{(["all", "github", "bitbucket"] as const).map((item) => <button key={item} className={source === item ? "active" : ""} aria-pressed={source === item} onClick={() => setSource(item)}>{item === "all" ? "ALL" : item.toUpperCase()}</button>)}</div>
      <div className="pulse-scroll"><div className="pulse-heatmap" role="grid" aria-label={language === "pt" ? "Mapa anual de contribuições" : "Annual contribution map"}>{totals.days.map((day) => { const level = day.total === 0 ? 0 : Math.min(4, Math.ceil((day.total / totals.max) * 4)); const label = `${format(day.date)}: ${day.total} ${language === "pt" ? "contribuições" : "contributions"}. GitHub: ${day.sources.github ?? 0}. Bitbucket: ${day.sources.bitbucket ?? 0}.`; return <button key={day.date} className={`pulse-day level-${level}`} role="gridcell" aria-label={label} title={label} />; })}</div></div>
      <div className="pulse-legend"><span>LESS</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={`level-${level}`} />)}<span>MORE</span></div>
    </>}
  </section>;
}
