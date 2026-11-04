"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

import styles from "./page.module.css";

gsap.registerPlugin(useGSAP, SplitText, ScrambleTextPlugin);

const MOTTO = "BECOME THE PERSON YOU PROMISED YOURSELF YOU WOULD BE.";

const TRAIL_IMAGES = [
  "https://assets.codepen.io/16327/Revised+Flair.png",
  "https://assets.codepen.io/16327/Revised+Flair-1.png",
  "https://assets.codepen.io/16327/Revised+Flair-2.png",
  "https://assets.codepen.io/16327/Revised+Flair-3.png",
  "https://assets.codepen.io/16327/Revised+Flair-4.png",
  "https://assets.codepen.io/16327/Revised+Flair-5.png",
  "https://assets.codepen.io/16327/Revised+Flair-6.png",
  "https://assets.codepen.io/16327/Revised+Flair-7.png",
  "https://assets.codepen.io/16327/Revised+Flair-8.png",
];

const TRAIL_DISTANCE = 100;

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mottoRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);

  // ImageTrail animation
  useGSAP(
    () => {
      const container = trailContainerRef.current;
      if (!container) return;

      const images = gsap.utils.toArray<HTMLImageElement>(
        `.${styles.flair}`,
        container
      );

      let imageIndex = 0;
      let mousePos = { x: 0, y: 0 };
      let lastMousePos = { x: 0, y: 0 };
      let hasPointerPosition = false;

      const imageTimelines = new Map<
        HTMLImageElement,
        gsap.core.Timeline
      >();

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;

        mousePos = {
          x: event.clientX,
          y: event.clientY,
        };

        if (!hasPointerPosition) {
          lastMousePos = { ...mousePos };
          hasPointerPosition = true;
        }
      };

      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      function animateImage() {
        const image = images[imageIndex % images.length];

        imageTimelines.get(image)?.kill();

        gsap.set(image, {
          clearProps: "transform,opacity,left,top",
        });

        gsap.set(image, {
          opacity: 1,
          left: mousePos.x,
          top: mousePos.y,
          xPercent: -50,
          yPercent: -50,
        });

        const timeline = gsap.timeline();

        timeline
          .from(image, {
            opacity: 0,
            scale: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)",
          })
          .to(
            image,
            {
              rotation: gsap.utils.random(-360, 360),
            },
            "<"
          )
          .to(
            image,
            {
              y: "120vh",
              duration: 1,
              ease: "back.in(0.4)",
            },
            0
          );

        imageTimelines.set(image, timeline);
        imageIndex++;
      }

      function imageTrail() {
        if (!hasPointerPosition) return;

        const distance = Math.hypot(
          mousePos.x - lastMousePos.x,
          mousePos.y - lastMousePos.y
        );

        if (distance > TRAIL_DISTANCE) {
          animateImage();
          lastMousePos = { ...mousePos };
        }
      }

      gsap.ticker.add(imageTrail);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        gsap.ticker.remove(imageTrail);

        imageTimelines.forEach((timeline) => timeline.kill());
        imageTimelines.clear();
      };
    },
    {
      scope: trailContainerRef,
    }
  );

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
      <div
        ref={trailContainerRef}
        className={styles.flairContainer}
        aria-hidden="true"
      >
        {Array.from({ length: 18 }).map((_, index) => (
          <img
            key={index}
            src={TRAIL_IMAGES[index % TRAIL_IMAGES.length]}
            className={styles.flair}
            alt=""
            draggable={false}
          />
        ))}
      </div>

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