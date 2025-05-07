# scripts/setup_mqtt.shファイルを作成
cat > scripts/setup_mqtt.sh << 'EOF'
#!/bin/bash

# Mosquitto設定ファイルの作成
sudo tee /etc/mosquitto/conf.d/custom.conf > /dev/null << MQTT_CONF
listener 1883
allow_anonymous true
MQTT_CONF

# サービスの再起動と有効化
sudo systemctl restart mosquitto
sudo systemctl enable mosquitto

echo "MQTTブローカーをセットアップしました"
EOF

# 実行権限を付与
chmod +x scripts/setup_mqtt.sh