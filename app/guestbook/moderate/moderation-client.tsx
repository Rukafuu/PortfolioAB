"use client";

import { useCallback, useEffect, useState } from "react";
import { GuestbookEntry, GuestbookStatus } from "@/lib/guestbook";
import styles from "../guestbook.module.css";

type AdminEntry = GuestbookEntry & { id: number; status: GuestbookStatus };

export default function ModerationClient() {
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [status, setStatus] = useState<GuestbookStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchQueue = useCallback(async (nextStatus: GuestbookStatus) => {
    const response = await fetch(`/api/guestbook/admin?status=${nextStatus}`, { cache: "no-store" });
    const payload = await response.json() as { entries?: AdminEntry[]; error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Could not read the queue.");
    return payload.entries ?? [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchQueue("pending")
      .then((nextEntries) => { if (!cancelled) setEntries(nextEntries); })
      .catch((error) => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Could not read the queue."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchQueue]);

  const changeStatus = async (nextStatus: GuestbookStatus) => {
    setStatus(nextStatus);
    setLoading(true);
    setMessage("");
    try {
      setEntries(await fetchQueue(nextStatus));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read the queue.");
    } finally {
      setLoading(false);
    }
  };

  const moderate = async (id: number, nextStatus: "approved" | "rejected") => {
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch(`/api/guestbook/admin/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("Moderation action failed.");
      setEntries((current) => current.filter((entry) => entry.id !== id));
      setMessage(`Trace ${nextStatus}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Moderation action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch(`/api/guestbook/admin/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed.");
      setEntries((current) => current.filter((entry) => entry.id !== id));
      setMessage("Trace deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.moderationPanel}>
      <div className={styles.filters} aria-label="Filter moderation queue">
        {(["pending", "approved", "rejected"] as const).map((value) => (
          <button key={value} type="button" className={status === value ? styles.activeFilter : ""} onClick={() => void changeStatus(value)}>
            {value}
          </button>
        ))}
      </div>
      <p className={styles.moderationStatus} role="status" aria-live="polite">
        {message || `${entries.length} ${status} trace${entries.length === 1 ? "" : "s"}.`}
      </p>
      {loading && <p className={styles.emptyState}>Reading moderation queue...</p>}
      {!loading && entries.length === 0 && <p className={styles.emptyState}>Queue clear.</p>}
      {!loading && entries.map((entry) => (
        <article className={styles.moderationEntry} key={entry.id}>
          <div><span>{entry.publicId}</span><b>{entry.name}</b></div>
          <p>{entry.message}</p>
          {entry.url && <a href={entry.url} target="_blank" rel="nofollow ugc noopener noreferrer">{entry.url}</a>}
          <div className={styles.moderationActions}>
            {entry.status !== "approved" && <button type="button" disabled={busyId === entry.id} onClick={() => moderate(entry.id, "approved")}>APPROVE ✓</button>}
            {entry.status !== "rejected" && <button type="button" disabled={busyId === entry.id} onClick={() => moderate(entry.id, "rejected")}>REJECT ×</button>}
            <button type="button" disabled={busyId === entry.id} onClick={() => remove(entry.id)}>DELETE</button>
          </div>
        </article>
      ))}
    </div>
  );
}
