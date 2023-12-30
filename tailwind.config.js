/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // 禁用预检，为了兼容 antd 样式
    // https://tailwindcss.com/docs/preflight
    preflight: false
  }
}

