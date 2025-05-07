# scripts/import_nodered_flow.shファイルを作成
cat > scripts/import_nodered_flow.sh << 'EOF'
#!/bin/bash

# Node-REDにフローをインポート
curl -X POST http://localhost:1880/flows \
  -H "Content-Type: application/json" \
  -H "Node-RED-Deployment-Type: full" \
  -d @scripts/machine_monitor_flow.json

echo "Node-REDフローをインポートしました"
EOF

# 実行権限を付与
chmod +x scripts/import_nodered_flow.sh