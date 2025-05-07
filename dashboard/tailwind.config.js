# dashboard/tailwind.config.jsファイルを作成
cat > dashboard/tailwind.config.js << 'EOF'
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF