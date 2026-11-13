"use client";

import { useEffect, useRef } from "react";
import { Photo } from "@/components/ui/Photo";
import { gsap } from "@/lib/gsap";

interface GalleryDragProps {
  images: string[];
  modelName: string;
}

/**
 * Horizontal drag-to-scroll gallery with momentum and item tilt.
 * Pointer Events API + inertia decay.
 * Emits 'cursormode' CustomEvent for the cursor label system.
 */
export default function GalleryDrag({ images, modelName }: GalleryDragProps) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const itemRefs  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let lastX = 0;
    let momentumId: number;

    function resetTilt() {
      itemRefs.current.forEach(item => {
        if (item) gsap.to(item, { rotate: 0, duration: 0.45, ease: "power2.out" });
      });
    }

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      startX = e.clientX;
      scrollLeft = track.scrollLeft;
      lastX = e.clientX;
      velocity = 0;
      track.setPointerCapture(e.pointerId);
      cancelAnimationFrame(momentumId);
      document.dispatchEvent(new CustomEvent("cursormode", { detail: "drag" }));
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      velocity = e.clientX - lastX;
      lastX = e.clientX;
      track.scrollLeft = scrollLeft - dx;

      // Tilt items based on drag velocity (max ±3°)
      const tilt = Math.max(-3, Math.min(3, -velocity * 0.18));
      itemRefs.current.forEach(item => {
        if (item) item.style.transform = `rotate(${tilt}deg)`;
      });
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      track.releasePointerCapture(0);
      document.dispatchEvent(new CustomEvent("cursormode", { detail: "default" }));
      resetTilt();

      // Momentum inertia
      function momentumScroll() {
        if (Math.abs(velocity) < 0.6 || !trackRef.current) {
          resetTilt();
          return;
        }
        velocity *= 0.91;
        trackRef.current.scrollLeft -= velocity;
        momentumId = requestAnimationFrame(momentumScroll);
      }
      momentumId = requestAnimationFrame(momentumScroll);
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup",   onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelAnimationFrame(momentumId);
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup",   onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={trackRef}
        className="drag-track flex gap-4 overflow-x-auto scrollbar-hide select-none"
        style={{
          scrollSnapType: "x mandatory",
          paddingInline: "clamp(24px, 4vw, 64px)",
          paddingBlock: "8px 16px",
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            ref={el => { itemRefs.current[i] = el; }}
            className="relative flex-shrink-0 rounded overflow-hidden"
            style={{
              width: "clamp(280px, 35vw, 480px)",
              aspectRatio: "4 / 3",
              scrollSnapAlign: "start",
              transition: "box-shadow 0.3s ease",
            }}
            data-cursor-view
          >
            <Photo
              src={src}
              alt={`${modelName} gallery ${i + 1}`}
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 35vw"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
