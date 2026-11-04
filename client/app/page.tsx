"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

import styles from "./page.module.css";

gsap.registerPlugin(useGSAP, SplitText, ScrambleTextPlugin);

const MOTTO =
  "BECOME THE PERSON YOU PROMISED YOURSELF YOU WOULD BE.";

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mottoRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    if (
      !headingRef.current ||
      !mottoRef.current ||
      !buttonRef.current
    ) {
      return;
    }

    const split = SplitText.create(headingRef.current, {
      type: "chars",
      mask: "chars",
      charsClass: "char",
    });

    gsap.set(split.chars, {
      yPercent: 100,
    });

    gsap.set(buttonRef.current, {
      y: 20,
      opacity: 0,
    });

    gsap.to(split.chars, {
      yPercent: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
    });

    gsap.to(mottoRef.current, {
      duration: 2,
      scrambleText: {
        text: MOTTO,
      },
    });

    gsap.to(buttonRef.current, {
      y: 0,
      opacity: 1,
      duration: 1,
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
          AURE.
        </h1>
      </div>

      <p
        className={styles.motto}
        ref={mottoRef}
      >{MOTTO}</p>

      <Link href="/auth/login" className={styles.cta} ref={buttonRef}>
        GET STARTED
      </Link>
    </main>
  );
}