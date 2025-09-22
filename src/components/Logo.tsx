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
      return "/assets/logos/default.png";
    }

    // Base64 data URL - use directly
    if (logo.startsWith("data:image/")) {
      return logo;
    }

    // Built-in logo names
    if (logo.startsWith("default")) {
      return `/assets/logos/${logo}.png`;
    }

    // External URL - use directly
    if (logo.startsWith("http")) {
      return logo;
    }

    // Fallback to default
    return "/assets/logos/default.png";
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
        // Fallback to default logo if loading fails
        const target = e.target as HTMLImageElement;
        if (target.src !== "/assets/logos/default.png") {
          target.src = "/assets/logos/default.png";
        }
      }}
    />
  );
}