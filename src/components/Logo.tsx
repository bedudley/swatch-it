"use client";

import Image from "next/image";

interface LogoProps {
  logo?: string;
  className?: string;
  alt?: string;
}

export default function Logo({ logo, className = "", alt = "Logo" }: LogoProps) {
  // Determine the logo source
  const getLogoSrc = (): string => {
    if (!logo) {
      return "/assets/logos/swatch-it.png";
    }

    // Base64 data URL - use directly
    if (logo.startsWith("data:image/")) {
      return logo;
    }

    // Built-in logo names
    if (logo === "default" || logo === "swatch-it") {
      return `/assets/logos/swatch-it.png`;
    }

    // External URL - use directly
    if (logo.startsWith("http")) {
      return logo;
    }

    // Fallback to swatch-it
    return "/assets/logos/swatch-it.png";
  };

  const logoSrc = getLogoSrc();
  const isDataUrl = logoSrc.startsWith("data:image/");

  // For base64 data URLs, we need to use regular img tag
  // Next.js Image doesn't support data URLs
  if (isDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoSrc}
        alt={alt}
        className={`max-h-16 w-auto object-contain ${className}`}
      />
    );
  }

  // For regular URLs, use Next.js Image with unoptimized flag for external URLs
  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={64}
      height={64}
      className={`max-h-16 w-auto object-contain ${className}`}
      unoptimized={logoSrc.startsWith("http")}
      onError={(e) => {
        // Fallback to swatch-it logo if loading fails
        const target = e.target as HTMLImageElement;
        if (target.src !== "/assets/logos/swatch-it.png") {
          target.src = "/assets/logos/swatch-it.png";
        }
      }}
    />
  );
}