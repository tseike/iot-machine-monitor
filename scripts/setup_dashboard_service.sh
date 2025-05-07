# scripts/setup_dashboard_service.shファイルを作成
cat > scripts/setup_dashboard_service.sh << 'EOF'
#!/bin/bash

# サービス定義ファイルの作成
sudo tee /etc/systemd/system/machine-dashboard.service > /dev/null << SERVICE_CONF
[Unit]
Description=IoT Machine Dashboard
After=network.target

[Service]
WorkingDirectory=$(pwd)/dashboard
ExecStart=/usr/bin/node server.js
Restart=always
User=$(whoami)
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE_CONF

# サービスの有効化と起動
sudo systemctl enable machine-dashboard.service
sudo systemctl start machine-dashboard.service

echo "ダッシュボードサービスをセットアップしました"
EOF

# 実行権限を付与
chmod +x scripts/setup_dashboard_service.sh