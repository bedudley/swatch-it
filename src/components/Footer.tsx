export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-text-secondary">
        <span>Created by Brendan Dudley & Sha&apos;Meaka King	|	© {new Date().getFullYear()}</span>

        <img
          src="/assets/logos/the-parlour/the-parlour-p-gold.svg"
          alt="The Parlour"
          className="h-6 w-6 opacity-70"
        />
      </div>
    </footer>
  );
}
