"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import styles from "./ImageTrail.module.css";

gsap.registerPlugin(useGSAP);

const DEFAULT_IMAGES = [
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

interface ImageTrailProps {
  images?: string[];
  imageCount?: number;
  trailDistance?: number;
}

export default function ImageTrail({
  images = DEFAULT_IMAGES,
  imageCount = 18,
  trailDistance = 100,
}: ImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;

      if (!container || images.length === 0) return;

      const trailImages = gsap.utils.toArray<HTMLImageElement>(
        `.${styles.flair}`,
        container
      );

      if (trailImages.length === 0) return;

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
        const image = trailImages[imageIndex % trailImages.length];

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

        if (distance > trailDistance) {
          animateImage();
          lastMousePos = { ...mousePos };
        }
      }

      gsap.ticker.add(imageTrail);

      return () => {
        window.removeEventListener(
          "pointermove",
          handlePointerMove
        );

        gsap.ticker.remove(imageTrail);

        imageTimelines.forEach((timeline) => timeline.kill());
        imageTimelines.clear();
      };
    },
    {
      scope: containerRef,
      dependencies: [images, trailDistance],
      revertOnUpdate: true,
    }
  );

  return (
    <div
      ref={containerRef}
      className={styles.flairContainer}
      aria-hidden="true"
    >
      {Array.from({ length: imageCount }).map((_, index) => (
        <Image
          key={index}
          src={images[index % images.length]}
          className={styles.flair}
          alt=""
          width={80}
          height={80}
          unoptimized
          draggable={false}
        />
      ))}
    </div>
  );
}
