"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/host"];

export default function Footer() {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <footer className="bg-card border-t border-border py-3 px-4">
      <div className="max-w-2xl mx-auto flex items-center justify-center gap-4 text-xs text-text-secondary flex-wrap">
        <Image
          src="/assets/logos/the-parlour/the-parlour-p-gold.svg"
          alt="The Parlour"
          width={24}
          height={24}
          className="opacity-70"
        />

        <span>Created by Brendan Dudley & Sha&apos;Meaka King	|	© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
