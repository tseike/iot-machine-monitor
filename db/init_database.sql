# db/init_database.sqlファイルを作成
cat > db/init_database.sql << 'EOF'
USE machine_monitor;

-- 機械マスター
CREATE TABLE IF NOT EXISTS machines (
  machine_id INT PRIMARY KEY AUTO_INCREMENT,
  machine_name VARCHAR(50) NOT NULL,
  description TEXT
);

-- 状態マスター
CREATE TABLE IF NOT EXISTS states (
  state_id INT PRIMARY KEY AUTO_INCREMENT,
  state_name VARCHAR(50) NOT NULL,
  description TEXT
);

-- 稼働状況テーブル
CREATE TABLE IF NOT EXISTS operation_status (
  status_id INT PRIMARY KEY AUTO_INCREMENT,
  machine_id INT NOT NULL,
  state_id INT NOT NULL,
  major_setup_count INT DEFAULT 0,
  is_minor_setup BOOLEAN DEFAULT FALSE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (machine_id) REFERENCES machines(machine_id),
  FOREIGN KEY (state_id) REFERENCES states(state_id)
);

-- 稼働履歴テーブル
CREATE TABLE IF NOT EXISTS operation_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  machine_id INT NOT NULL,
  state_id INT NOT NULL,
  major_setup_count INT,
  is_minor_setup BOOLEAN,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration INT,
  FOREIGN KEY (machine_id) REFERENCES machines(machine_id),
  FOREIGN KEY (state_id) REFERENCES states(state_id)
);

-- サンプルデータ投入
INSERT INTO machines (machine_name, description) VALUES
('工作機械A', '1番機'),
('工作機械B', '2番機'),
('工作機械C', '3番機');

INSERT INTO states (state_id, state_name, description) VALUES
(0, '稼働中', '緑色点灯'),
(1, '完成', '黄色点灯'),
(2, 'エラー', '赤色点灯'),
(3, 'エラー (点滅)', '赤色点滅'),
(4, '停止中', '無灯'),
(5, '中段取り中', 'ボタン押下中'),
(6, '稼働中 (点滅)', '緑色点滅'),
(7, '完成 (点滅)', '黄色点滅');

-- 初期稼働状態
INSERT INTO operation_status (machine_id, state_id, major_setup_count, is_minor_setup) VALUES
(1, 4, 0, false),
(2, 4, 0, false),
(3, 4, 0, false);
EOF