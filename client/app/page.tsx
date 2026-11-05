"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

import styles from "./page.module.css";
import ImageTrail from "@/components/ImageTrail/ImageTrail";

gsap.registerPlugin(useGSAP, SplitText, ScrambleTextPlugin);

const MOTTO = "BECOME THE PERSON YOU PROMISED YOURSELF YOU WOULD BE.";

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mottoRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  // Homepage entrance timeline
  useGSAP(() => {
    if (!headingRef.current || !mottoRef.current || !buttonRef.current) {
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

    const timeline = gsap.timeline();

    timeline.to(split.chars, {
      yPercent: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
    });

    timeline.to(
      mottoRef.current,
      {
        duration: 2,
        scrambleText: {
          text: MOTTO,
        },
      },
      "<"
    );

    timeline.to(buttonRef.current, {
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
      <ImageTrail />

      {/* Homepage content */}
      <div className={styles.headingMask}>
        <h1 ref={headingRef} className={styles.heading}>
          AURE.
        </h1>
      </div>

      <p ref={mottoRef} className={styles.motto}>
        {MOTTO}
      </p>

      <Link
        href="/auth/login"
        className={styles.cta}
        ref={buttonRef}
      >
        GET STARTED
      </Link>
    </main>
  );
}
