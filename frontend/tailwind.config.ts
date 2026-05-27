import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12202f',
        moss: '#0f9f8e',
        coral: '#ff6b6b',
        amberline: '#f8b84e',
        skywash: '#eef8ff',
        mintwash: '#eafbf6',
      },
      boxShadow: {
        soft: '0 16px 45px rgba(15, 88, 120, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
