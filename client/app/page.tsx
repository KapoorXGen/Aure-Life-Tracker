"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

import styles from "./page.module.css";

gsap.registerPlugin(useGSAP, SplitText);

const MOTTO =
  "BECOME THE PERSON YOU PROMISED YOURSELF YOU WOULD BE.";

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!headingRef.current) return;

    const split = SplitText.create(headingRef.current, {
      type: "chars",
      mask: "chars",
      charsClass: "char",
    });

    gsap.set(split.chars, {
      yPercent: 100,
    });

    gsap.to(split.chars, {
      yPercent: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
    });

    return () => {
      split.revert();
    };
  });

  return (
    <main className={styles.main}>
      <div className={styles.headingMask}>
        <h1 ref={headingRef} className={styles.heading}>
          1207
        </h1>
      </div>

      <p className={styles.motto}>{MOTTO}</p>

      <Link href="/pages/page-1" className={styles.cta}>
        GET STARTED
      </Link>
    </main>
  );
}