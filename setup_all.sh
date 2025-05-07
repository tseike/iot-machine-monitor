# setup_all.shファイルを作成
cat > setup_all.sh << 'EOF'
#!/bin/bash

echo "IoT工作機械モニタリングシステムのセットアップを開始します..."

# 1. データベースのセットアップ
echo "=== データベースのセットアップ ==="
./db/setup_database.sh
./db/run_init_database.sh

# 2. MQTTブローカーのセットアップ
echo "=== MQTTブローカーのセットアップ ==="
./scripts/setup_mqtt.sh

# 3. Node-REDのセットアップ
echo "=== Node-REDのセットアップ ==="
./scripts/setup_nodered.sh
./scripts/import_nodered_flow.sh

# 4. ダッシュボードのビルドとセットアップ
echo "=== ダッシュボードのセットアップ ==="
./scripts/build_dashboard.sh
./scripts/setup_dashboard_service.sh

echo "セットアップが完了しました。以下のURLでアクセスできます:"
echo "ダッシュボード: http://$(hostname -I | awk '{print $1}'):3000"
echo "Node-RED: http://$(hostname -I | awk '{print $1}'):1880"
EOF

# 実行権限を付与
chmod +x setup_all.sh