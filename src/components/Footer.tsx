import Image from "next/image";

export default function Footer() {
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
