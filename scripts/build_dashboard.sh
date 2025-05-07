# scripts/build_dashboard.shファイルを作成
cat > scripts/build_dashboard.sh << 'EOF'
#!/bin/bash

# Reactアプリケーションのビルド
cd dashboard
npm install
npm run build

echo "ダッシュボードをビルドしました"
EOF

# 実行権限を付与
chmod +x scripts/build_dashboard.sh