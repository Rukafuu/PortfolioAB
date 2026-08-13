"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  GUESTBOOK_MESSAGE_MAX,
  GUESTBOOK_NAME_MAX,
  GuestbookEntry,
} from "@/lib/guestbook";
import Turnstile from "./turnstile";
import styles from "./guestbook.module.css";

type SubmissionState = "idle" | "submitting" | "success" | "error";
type FieldErrors = Record<string, string>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function linkLabel(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./u, "");
  } catch {
    return "visitor link";
  }
}

export default function GuestbookClient({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [statusMessage, setStatusMessage] = useState("");

  const fetchEntries = useCallback(async (cursor?: string) => {
    const response = await fetch(`/api/guestbook${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`);
    const payload = await response.json() as { entries?: GuestbookEntry[]; nextCursor?: string | null; error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Could not read the visitor log.");
    return payload;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchEntries()
      .then((payload) => {
        if (cancelled) return;
        setEntries(payload.entries ?? []);
        setNextCursor(payload.nextCursor ?? null);
      })
      .catch(() => setListError("The visitor log is quiet for a moment. Try again soon."))
      .finally(() => setLoadingEntries(false));
    return () => { cancelled = true; };
  }, [fetchEntries]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionState === "submitting") return;
    if (!turnstileToken) {
      setSubmissionState("error");
      setStatusMessage("Complete the verification before leaving your trace.");
      return;
    }

    setSubmissionState("submitting");
    setFieldErrors({});
    setStatusMessage("Leaving your trace...");

    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, message, url, company, turnstileToken }),
      });
      const payload = await response.json() as { error?: string; fields?: FieldErrors };
      if (!response.ok) {
        setFieldErrors(payload.fields ?? {});
        throw new Error(payload.error ?? "Your trace didn't make it into the log.");
      }

      setName("");
      setMessage("");
      setUrl("");
      setCompany("");
      setTurnstileToken("");
      setTurnstileReset((value) => value + 1);
      setSubmissionState("success");
      setStatusMessage("Trace received. It'll appear here after approval.");
    } catch (error) {
      setSubmissionState("error");
      setStatusMessage(error instanceof Error
        ? error.message
        : "Something went wrong. Your trace didn't make it into the log.");
      setTurnstileToken("");
      setTurnstileReset((value) => value + 1);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setListError("");
    try {
      const payload = await fetchEntries(nextCursor);
      setEntries((current) => [...current, ...(payload.entries ?? [])]);
      setNextCursor(payload.nextCursor ?? null);
    } catch {
      setListError("The next part of the log could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className={styles.contentGrid}>
      <section className={styles.formSection} aria-labelledby="leave-trace-title">
        <div className={styles.sectionLabel}>01 / WRITE TO THE LOG</div>
        <h2 id="leave-trace-title">Leave your trace</h2>
        <p>One name, one message, one small proof that our paths crossed.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="guestbook-name">Name <span>required</span></label>
              <output>{Array.from(name).length}/{GUESTBOOK_NAME_MAX}</output>
            </div>
            <input
              id="guestbook-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={GUESTBOOK_NAME_MAX}
              autoComplete="name"
              enterKeyHint="next"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "guestbook-name-error" : undefined}
              disabled={submissionState === "submitting"}
            />
            {fieldErrors.name && <small id="guestbook-name-error" role="alert">{fieldErrors.name}</small>}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="guestbook-message">Message <span>required</span></label>
              <output className={Array.from(message).length > GUESTBOOK_MESSAGE_MAX - 40 ? styles.counterNearLimit : undefined}>
                {Array.from(message).length}/{GUESTBOOK_MESSAGE_MAX}
              </output>
            </div>
            <textarea
              id="guestbook-message"
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={GUESTBOOK_MESSAGE_MAX}
              rows={6}
              placeholder="What stayed with you?"
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={fieldErrors.message ? "guestbook-message-error" : undefined}
              disabled={submissionState === "submitting"}
            />
            {fieldErrors.message && <small id="guestbook-message-error" role="alert">{fieldErrors.message}</small>}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="guestbook-url">Link <span>optional</span></label>
            </div>
            <input
              id="guestbook-url"
              name="url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="github.com/you"
              autoComplete="url"
              enterKeyHint="done"
              aria-invalid={Boolean(fieldErrors.url)}
              aria-describedby={fieldErrors.url ? "guestbook-url-error" : undefined}
              disabled={submissionState === "submitting"}
            />
            {fieldErrors.url && <small id="guestbook-url-error" role="alert">{fieldErrors.url}</small>}
          </div>

          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="guestbook-company">Company</label>
            <input id="guestbook-company" name="company" value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" />
          </div>

          <div className={styles.verification}>
            <Turnstile siteKey={turnstileSiteKey} resetSignal={turnstileReset} onToken={setTurnstileToken} />
          </div>

          <button className={styles.submitButton} type="submit" disabled={submissionState === "submitting" || !turnstileSiteKey}>
            {submissionState === "submitting" ? "Leaving your trace..." : "Leave your trace →"}
          </button>
          <p
            className={`${styles.formStatus} ${submissionState === "success" ? styles.success : ""} ${submissionState === "error" ? styles.error : ""}`}
            role="status"
            aria-live="polite"
          >
            {statusMessage || "Submissions enter the moderation queue before they become public."}
          </p>
        </form>
      </section>

      <section className={styles.logSection} aria-labelledby="visitor-log-title">
        <div className={styles.logHeader}>
          <div>
            <div className={styles.sectionLabel}>02 / PUBLIC TRACES</div>
            <h2 id="visitor-log-title">Visitor log</h2>
          </div>
          <span>{entries.length.toString().padStart(2, "0")} LOADED</span>
        </div>

        <div className={styles.entryList} aria-live="polite" aria-busy={loadingEntries}>
          {loadingEntries && <p className={styles.emptyState}>Reading the log...</p>}
          {!loadingEntries && listError && entries.length === 0 && <p className={styles.emptyState}>{listError}</p>}
          {!loadingEntries && !listError && entries.length === 0 && (
            <p className={styles.emptyState}>No traces yet.<br /><b>Be the first person to leave one.</b></p>
          )}
          {entries.map((entry, index) => (
            <article className={styles.entry} key={entry.publicId} style={{ "--entry-index": index } as React.CSSProperties}>
              <div className={styles.entryMeta}>
                <span>{entry.publicId}</span>
                <span>{formatDate(entry.createdAt)}</span>
              </div>
              <p className={styles.commitLine}>{entry.name} <span>committed a message</span></p>
              <blockquote>“{entry.message}”</blockquote>
              {entry.url && (
                <a href={entry.url} target="_blank" rel="nofollow ugc noopener noreferrer">
                  {linkLabel(entry.url)} ↗
                </a>
              )}
            </article>
          ))}
        </div>

        {listError && entries.length > 0 && <p className={styles.inlineError} role="alert">{listError}</p>}
        {nextCursor && (
          <button className={styles.loadMore} type="button" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? "Reading more..." : "Load more traces ↓"}
          </button>
        )}
      </section>
    </div>
  );
}
