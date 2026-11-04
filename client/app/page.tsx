"use client";

import Link from "next/link";
import styles from "./page.module.css";

const MOTTO =
  "BECOME THE PERSON YOU PROMISED YOURSELF YOU WOULD BE.";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.headingMask}>
        <h1
          className={styles.heading}
        >
          AURE.
        </h1>
      </div>

      <p
        className={styles.motto}
      >
        {MOTTO}
      </p>

      <Link
        href="/pages/page-1"
        className={styles.cta}
      >
        GET STARTED
      </Link>
    </main>

  );
}