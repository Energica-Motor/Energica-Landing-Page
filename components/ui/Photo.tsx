"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import placeholders from "@/data/image-placeholders.json";
import { cn } from "@/lib/utils";

const BLUR = placeholders as Record<string, string>;
// Remote images (YouTube thumbnails) have no build-time preview: a dark
// neutral close to their average stands in.
const REMOTE_PLACEHOLDER = "#161616";

type PhotoProps = Omit<ImageProps, "src" | "placeholder" | "blurDataURL" | "fill"> & { src: string };

const decode = (src: string) => {
  try { return decodeURI(src); } catch { return src; }
};

/**
 * A `fill` photo for a positioned box with a fixed size or aspect ratio:
 * a blurred preview (data/image-placeholders.json, built by
 * scripts/image-placeholders.mjs) sits behind it, and the photo fades in
 * over 200ms once loaded. The preview is a layer of its own because
 * next/image paints its blur on the <img> itself, which the fade would hide.
 * Priority (above-the-fold) photos skip the fade so LCP isn't held back;
 * without JavaScript every photo shows as soon as it loads.
 */
export function Photo({ src, className, priority, onLoad, alt, ...rest }: PhotoProps) {
  const blur = BLUR[decode(src)];
  const remote = /^https?:/.test(src);
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {/* Cut-out (transparent) images have no preview and keep the section's own background */}
      {(blur || remote) && (
        <span
          aria-hidden="true"
          className="photo-blur"
          style={blur ? { backgroundImage: `url(${blur})` } : { backgroundColor: REMOTE_PLACEHOLDER }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={cn(!priority && "photo-fade", className)}
        data-loaded={loaded || undefined}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        {...rest}
      />
    </>
  );
}
