# db/run_init_database.shファイルを作成
cat > db/run_init_database.sh << 'EOF'
#!/bin/bash

# データベース初期化
echo "MySQLパスワードを入力してください:"
read -s MYSQL_PASS
mysql -u monitor_user -p${MYSQL_PASS} < db/init_database.sql

echo "データベースを初期化しました"
EOF

# 実行権限を付与
chmod +x db/run_init_database.sh