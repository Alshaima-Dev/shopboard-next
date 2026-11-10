"use client";

import Image from "next/image";
import { useState } from "react";
import type { ReactNode } from "react";

interface ProductPhotoProps {
  image: string;
  alt: string;
  unavailable: string;
  sizes: string;
  children?: ReactNode;
}

export function ProductPhoto({ image, alt, unavailable, sizes, children }: ProductPhotoProps) {
  const [failures, setFailures] = useState(0);
  const fallback = !image || failures > 0;
  const exhausted = failures >= (image ? 2 : 1);

  return (
    <div className="relative grid aspect-square shrink-0 place-items-center overflow-hidden rounded-image bg-background">
      {!exhausted && (
        <Image
          src={fallback ? "/images/products/fallback.svg" : `/${image.replace(/^\/+/, "")}`}
          alt={failures ? unavailable : alt}
          fill
          sizes={sizes}
          loading="lazy"
          decoding="async"
          unoptimized={fallback}
          className="object-contain object-center outline-1 -outline-offset-1 outline-black/10"
          onError={() => setFailures((count) => count + 1)}
        />
      )}
      {failures > 0 && (
        <span role="status" className="absolute inset-s-0 inset-e-0 bottom-0 bg-background/94 p-5 text-center text-caption text-foreground">
          {unavailable}
        </span>
      )}
      {children}
    </div>
  );
}
