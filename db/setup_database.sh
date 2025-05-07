# db/setup_database.shファイルを作成
cat > db/setup_database.sh << 'EOF'
#!/bin/bash

# MySQLルートパスワードを入力
echo "MySQLルートパスワードを入力してください:"
read -s MYSQL_ROOT_PASS

# データベースとユーザー作成
mysql -u root -p${MYSQL_ROOT_PASS} << MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS machine_monitor;
CREATE USER IF NOT EXISTS 'monitor_user'@'localhost' IDENTIFIED BY 'monitor_password';
GRANT ALL PRIVILEGES ON machine_monitor.* TO 'monitor_user'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

echo "データベースとユーザーを作成しました"
EOF

# 実行権限を付与
chmod +x db/setup_database.sh