/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6A9CFB',
        secondary: '#7FD1C9',
        accent: '#F6A6A1',
        tertiary: '#C4A8F5',
        background: {
          light: '#1a1a1a',
          muted: '#2a2a2a',
          DEFAULT: '#1a1a1a',
        },
        'bg-dark': '#1a1a1a',
        'bg-dark-muted': '#2a2a2a',
        text: {
          primary: '#FDFDFD',
          secondary: '#B0B0B0',
          DEFAULT: '#FDFDFD',
        },
        border: '#404040',
        success: '#9FDCA9',
        warning: '#FFD88B',
        error: '#F6A1A1',
        info: '#9ECDFB',
        card: {
          DEFAULT: '#2a2a2a',
          muted: '#333333',
          stripe1: '#F6A6A1',
          stripe2: '#7FD1C9',
        },
        button: {
          primary: '#6A9CFB',
          'primary-hover': '#588CE0',
          'primary-text': '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}