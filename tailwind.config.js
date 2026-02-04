/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 功能性配色
        'llm': {
          DEFAULT: '#8b5cf6', // 紫色 - LLM角色/指令
          light: '#a78bfa',
          dark: '#7c3aed',
        },
        'drawing': {
          DEFAULT: '#3b82f6', // 蓝色 - AI绘画风格/画质
          light: '#60a5fa',
          dark: '#2563eb',
        },
        'highlight': {
          DEFAULT: '#f97316', // 橙色 - 选中高亮
          light: '#fb923c',
          dark: '#ea580c',
        },
      },
    },
  },
  plugins: [],
}
