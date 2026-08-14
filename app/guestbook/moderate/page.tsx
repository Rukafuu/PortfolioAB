import type { Metadata } from "next";
import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getGuestbookEnv, isGuestbookAdminEmail } from "@/lib/guestbook-server";
import ModerationClient from "./moderation-client";
import styles from "../guestbook.module.css";

export const metadata: Metadata = {
  title: "Guestbook Moderation — Lucas // Personal OS",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function GuestbookModerationPage() {
  const user = await requireChatGPTUser("/guestbook/moderate");
  const env = await getGuestbookEnv();
  const allowed = isGuestbookAdminEmail(user.email, env);

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/guestbook">LUCAS <b>{"//"}</b> GUESTBOOK</Link>
        <span>PRIVATE / MODERATION</span>
        <Link className={styles.backLink} href="/guestbook">← PUBLIC LOG</Link>
      </header>
      <section className={styles.moderationHero}>
        <p className={styles.eyebrow}>ADMIN / NOINDEX / {user.email}</p>
        <h1>Trace review.</h1>
        {!allowed
          ? <p>This account is signed in, but it is not on the guestbook admin allowlist.</p>
          : <ModerationClient />}
      </section>
    </main>
  );
}
