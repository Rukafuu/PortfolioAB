import type { Metadata } from "next";
import Link from "next/link";
import { getGuestbookEnv } from "@/lib/guestbook-server";
import GuestbookClient from "./guestbook-client";
import styles from "./guestbook.module.css";

export const metadata: Metadata = {
  title: "Leave a Trace — Lucas // Personal OS",
  description: "A small guestbook for the people who passed through Lucas // Personal OS.",
  alternates: { canonical: "/guestbook" },
  openGraph: {
    title: "Leave a Trace — Lucas // Personal OS",
    description: "The internet is full of visitors. This little corner remembers them.",
    url: "/guestbook",
  },
};

export default async function GuestbookPage() {
  const env = await getGuestbookEnv();
  const turnstileSiteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          LUCAS <b>{"//"}</b> PERSONAL OS
        </Link>
        <span>SIDE C / VISITOR LOG</span>
        <Link className={styles.backLink} href="/">← REWIND HOME</Link>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>GUESTBOOK / PUBLIC MEMORY / 2026</p>
        <h1>Leave a <em>trace.</em></h1>
        <p className={styles.intro}>
          The internet is full of visitors. This little corner remembers them.
        </p>
        <div className={styles.signal} aria-hidden="true">
          <span>REC</span><i /><span>WAITING FOR A SIGNAL</span>
        </div>
      </section>

      <GuestbookClient turnstileSiteKey={turnstileSiteKey} />

      <footer className={styles.footer}>
        <span>LUCAS // PERSONAL OS</span>
        <p>{"// someone was here"}</p>
        <Link href="/">REWIND ↑</Link>
      </footer>
    </main>
  );
}
