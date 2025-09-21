"use client";

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

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`max-h-16 w-auto object-contain ${className}`}
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