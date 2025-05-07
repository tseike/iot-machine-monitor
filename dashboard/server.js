# dashboard/server.jsファイルを作成
cat > dashboard/server.js << 'EOF'
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 3000;

// Node-RED APIプロキシ設定
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:1880',
  changeOrigin: true,
}));

// 静的ファイル提供
app.use(express.static(path.join(__dirname, 'build')));

// すべてのルートをindex.htmlにリダイレクト (SPA対応)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF