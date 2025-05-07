# scripts/setup_nodered.shファイルを作成
cat > scripts/setup_nodered.sh << 'EOF'
#!/bin/bash

# Node-REDインストールスクリプトを実行
bash <(curl -sL https://raw.githubusercontent.com/node-red/linux-installers/master/deb/update-nodejs-and-nodered)

# Node-REDを自動起動に設定
sudo systemctl enable nodered.service
sudo systemctl start nodered.service

# 必要なノードのインストール
cd ~/.node-red
npm install node-red-node-mysql node-red-contrib-mqtt-broker node-red-dashboard

echo "Node-REDをセットアップしました"
EOF

# 実行権限を付与
chmod +x scripts/setup_nodered.sh