/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf2f2',
          100: '#fbd7d7',
          300: '#f3a6a6',
          500: '#e96363',
          600: '#d04848',
          700: '#a83232',
          900: '#5e1c1c',
        },
        sidebar: {
          DEFAULT: '#16191f',
          surface: '#1e2330',
          border: '#20262f',
          muted: '#6b7384',
          text: '#a8b1c0',
        },
        canvas: {
          DEFAULT: '#fcfbf8',
          muted: '#f0ebe7',
        },
        ink: {
          DEFAULT: '#1c1c1c',
          soft: '#3d3d3d',
          muted: '#6b6b6b',
        },
        line: {
          DEFAULT: '#e5dcd5',
          strong: '#d8cdc4',
          soft: '#efe7e0',
        },
        surface: '#ffffff',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card:    '0 1px 2px rgba(28,28,28,0.04), 0 4px 12px rgba(28,28,28,0.04)',
        elevate: '0 2px 6px rgba(28,28,28,0.06), 0 8px 24px rgba(28,28,28,0.06)',
        cta:     '0 2px 6px rgba(233,99,99,0.30)',
        'cta-hover': '0 6px 20px rgba(233,99,99,0.45)',
        focus:   '0 0 0 3px rgba(233,99,99,0.25)',
        nav:     '0 4px 12px rgba(233,99,99,0.25)',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '10px',
        xl: '12px',
      },
    },
  },
  plugins: [],
}
