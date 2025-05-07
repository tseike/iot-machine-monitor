# IoT工作機械モニタリングシステム

## 概要
このシステムは工作機械の積層表示灯（赤・黄・緑）の状態を光センサーで検知し、稼働状況をリアルタイムで監視・記録するIoTシステムです。M5StickC Plusとラズベリーパイを利用して、工程の進捗と機械の状態をブラウザで確認できます。

## 機能
- **積層表示灯の状態検出**: BH1750FVI-TR光センサーを使用して赤・黄・緑の表示灯状態を検知
- **状態の区別**:
  - 緑色点灯: 稼働中
  - 黄色点灯: 完成
  - 赤色点灯: エラー発生
  - 点滅状態の検出
  - 全色無灯: 停止中
- **工程進捗管理**:
  - 大段取り進捗のカウント管理
  - 中段取り状態の検出と表示
- **データの可視化**:
  - 稼働状況のリアルタイム表示
  - 状態別の積算時間のグラフ表示
  - 段取り毎の状態時間の可視化

## ハードウェア構成
- **センサーノード**: M5StickC Plus
  - BH1750FVI-TR光センサー × 3個
  - 押しボタンスイッチ × 2個（大段取り用、中段取り用）
- **サーバー**: Raspberry Pi 4
  - MySQLデータベース
  - Node-RED
  - Webサーバー

## ソフトウェア構成
- **M5StickC Plus側**:
  - Arduino IDE/PlatformIOによるプログラミング
  - MQTTによるデータ送信
- **Raspberry Pi側**:
  - MySQL: データ保存
  - Node-RED: データフロー処理
  - Express + React: Webダッシュボード

## インストール手順

### 前提条件
- Raspberry Pi 4（Raspberry Pi OSがインストール済み）
- M5StickC Plus
- BH1750FVI-TR光センサー × 3個
- 配線材料
- Wi-Fi環境

### Raspberry Pi側のセットアップ
1. システムの更新
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. リポジトリのクローン
   ```bash
   git clone https://github.com/あなたのユーザー名/iot-machine-monitor.git
   cd iot-machine-monitor
   ```

3. セットアップスクリプトの実行権限を付与
   ```bash
   chmod +x setup_all.sh
   chmod +x db/*.sh
   chmod +x scripts/*.sh
   ```

4. セットアップスクリプトの実行
   ```bash
   ./setup_all.sh
   ```

### M5StickC Plusのセットアップ
1. Arduino IDEをインストール
2. ESP32ボードマネージャーの追加
   - ファイル→環境設定→追加のボードマネージャのURLに以下を追加:
   - `https://dl.espressif.com/dl/package_esp32_index.json`
3. 必要なライブラリのインストール
   - M5StickC Plus
   - BH1750
   - PubSubClient
4. `m5stickc_machine_monitor/m5stickc_machine_monitor.ino`を開く
5. Wi-FiとMQTT設定を環境に合わせて変更
   ```cpp
   // Wi-Fi設定
   const char* ssid = "your_wifi_ssid";
   const char* password = "your_wifi_password";
   
   // MQTT設定
   const char* mqtt_server = "raspberry_pi_ip_address";
   ```
6. M5StickC Plusにプログラムを書き込む

### センサーの設置
1. 各色の積層表示灯に対応する光センサーを適切な距離で固定
2. 外部光の影響を減らすためにセンサーを覆うケースを作成
3. 必要に応じて光センサーの感度を調整

## 使用方法
1. Raspberry Piとセンサーノード（M5StickC Plus）の電源を入れる
2. ダッシュボードにアクセス: `http://raspberry_pi_ip:3000`
3. 「稼働状況」タブで各機械の現在の状態を確認
4. 「記録」タブで状態別・段取り別の稼働時間の統計を確認

## システム拡張
- **複数機械の追加**: データベースに機械を追加するだけで対応可能
- **追加センサーの実装**: 温度や振動センサーを追加して機械の健全性監視
- **アラート機能**: 異常検知時にSlackやメールでの通知
- **データ分析**: 蓄積されたデータを元にした機械学習による異常予測

## トラブルシューティング
- **センサー検出の誤判定**: 閾値の調整と環境光対策を実施
- **Wi-Fi接続の不安定**: 再接続ロジックの実装とバッファリング機能を確認
- **データベースの肥大化**: 定期的なデータアーカイブと集計テーブルの作成を検討

## ライセンス
MIT

## 貢献
バグ報告や機能追加の提案はIssueまたはPull Requestを通じてお願いします。

## 作者
Tsubasa Seike - Ehime Institute of Industrial Technology

## 謝辞
このプロジェクトは以下のライブラリやツールを利用しています:
- M5StickC Plus
- Node-RED
- React + Tailwind CSS
- Recharts