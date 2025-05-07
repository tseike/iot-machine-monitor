# M5StickC Plusプログラムを作成
mkdir -p m5stickc_machine_monitor
cat > m5stickc_machine_monitor/m5stickc_machine_monitor.ino << 'EOF'
#include <M5StickCPlus.h>
#include <WiFi.h>
#include <PubSubClient.h> // MQTT用
#include <Wire.h>
#include <BH1750.h>

// Wi-Fi設定
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// MQTT設定
const char* mqtt_server = "raspberry_pi_ip_address";
const int mqtt_port = 1883;
const char* mqtt_topic = "machine/status";
const char* mqtt_client_id = "machine1"; // 各機械で一意のIDに変更

// センサーピン設定
const int RED_SENSOR_SDA = 0; // 例えば、SDAピン
const int RED_SENSOR_SCL = 26; // 例えば、SCLピン

const int YELLOW_SENSOR_SDA = 0; // GROVE端子を使用
const int YELLOW_SENSOR_SCL = 26;

const int GREEN_SENSOR_SDA = 0;
const int GREEN_SENSOR_SCL = 26;

// ボタンピン設定
const int MAJOR_SETUP_BUTTON = 37; // M5StickCのボタンA
const int MINOR_SETUP_BUTTON = 39; // M5StickCのボタンB

// センサー閾値（要調整）
const float LIGHT_THRESHOLD = 50.0;

// 状態管理
bool redState = false;
bool yellowState = false;
bool greenState = false;
bool redBlink = false;
bool yellowBlink = false;
bool greenBlink = false;
bool minorSetupActive = false;
int majorSetupCount = 0;
int prevState = -1;
unsigned long lastBlinkCheck = 0;
unsigned long lastStateChange = 0;

// MQTT
WiFiClient espClient;
PubSubClient client(espClient);

// BH1750センサー
BH1750 redSensor;
BH1750 yellowSensor;
BH1750 greenSensor;
TwoWire I2Cone = TwoWire(0);
TwoWire I2Ctwo = TwoWire(1);
TwoWire I2Cthree = TwoWire(0); // ESP32は通常2つのI2Cバスしかないので、アドレス違いで区別

void setup() {
  M5.begin();
  M5.Lcd.setRotation(3);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 0, 2);
  M5.Lcd.println("Machine Status Monitor");

  // I2Cセットアップ
  I2Cone.begin(RED_SENSOR_SDA, RED_SENSOR_SCL);
  I2Ctwo.begin(YELLOW_SENSOR_SDA, YELLOW_SENSOR_SCL);
  I2Cthree.begin(GREEN_SENSOR_SDA, GREEN_SENSOR_SCL);

  // センサー初期化
  redSensor.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &I2Cone);
  yellowSensor.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x5C, &I2Ctwo); // アドレス変更が必要
  greenSensor.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &I2Cthree); // 別のI2Cバスを使用

  // ボタン設定
  pinMode(MAJOR_SETUP_BUTTON, INPUT_PULLUP);
  pinMode(MINOR_SETUP_BUTTON, INPUT_PULLUP);

  // Wi-Fi接続
  setupWifi();

  // MQTT設定
  client.setServer(mqtt_server, mqtt_port);
}

void setupWifi() {
  M5.Lcd.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    M5.Lcd.print(".");
  }
  
  M5.Lcd.println("\nWiFi connected");
  M5.Lcd.println("IP: " + WiFi.localIP().toString());
}

void reconnectMQTT() {
  while (!client.connected()) {
    if (client.connect(mqtt_client_id)) {
      M5.Lcd.println("MQTT connected");
    } else {
      M5.Lcd.println("MQTT failed, retry in 5s");
      delay(5000);
    }
  }
}

void detectBlinking() {
  static float lastRedValue = 0;
  static float lastYellowValue = 0;
  static float lastGreenValue = 0;
  static unsigned long lastCheckTime = 0;
  static int redChangeCount = 0;
  static int yellowChangeCount = 0;
  static int greenChangeCount = 0;
  
  unsigned long currentTime = millis();
  
  // 1秒ごとに点滅を確認
  if (currentTime - lastCheckTime > 1000) {
    float redValue = redSensor.readLightLevel();
    float yellowValue = yellowSensor.readLightLevel();
    float greenValue = greenSensor.readLightLevel();
    
    // 赤色の点滅検出
    if ((redValue > LIGHT_THRESHOLD && lastRedValue < LIGHT_THRESHOLD) || 
        (redValue < LIGHT_THRESHOLD && lastRedValue > LIGHT_THRESHOLD)) {
      redChangeCount++;
    }
    
    // 黄色の点滅検出
    if ((yellowValue > LIGHT_THRESHOLD && lastYellowValue < LIGHT_THRESHOLD) || 
        (yellowValue < LIGHT_THRESHOLD && lastYellowValue > LIGHT_THRESHOLD)) {
      yellowChangeCount++;
    }
    
    // 緑色の点滅検出
    if ((greenValue > LIGHT_THRESHOLD && lastGreenValue < LIGHT_THRESHOLD) || 
        (greenValue < LIGHT_THRESHOLD && lastGreenValue > LIGHT_THRESHOLD)) {
      greenChangeCount++;
    }
    
    // 3秒間の変化回数で点滅判定
    if (currentTime - lastBlinkCheck > 3000) {
      redBlink = (redChangeCount >= 2);
      yellowBlink = (yellowChangeCount >= 2);
      greenBlink = (greenChangeCount >= 2);
      
      redChangeCount = 0;
      yellowChangeCount = 0;
      greenChangeCount = 0;
      lastBlinkCheck = currentTime;
    }
    
    lastRedValue = redValue;
    lastYellowValue = yellowValue;
    lastGreenValue = greenValue;
    lastCheckTime = currentTime;
  }
}

int determineState() {
  // 中段取り中が最優先
  if (minorSetupActive) {
    return 5; // 中段取り中
  }
  
  // 点灯状態による判定
  if (redState) {
    return redBlink ? 3 : 2; // エラー（点滅/点灯）
  }
  
  if (yellowState) {
    return yellowBlink ? 7 : 1; // 完成（点滅/点灯）
  }
  
  if (greenState) {
    return greenBlink ? 6 : 0; // 稼働中（点滅/点灯）
  }
  
  // すべての灯が消えている場合
  return 4; // 停止中
}

void sendStatus() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  
  int currentState = determineState();
  
  // 状態に変化があった場合のみ送信
  if (currentState != prevState) {
    String statusMessage = String(mqtt_client_id) + "," + 
                           String(currentState) + "," + 
                           String(majorSetupCount) + "," + 
                           String(minorSetupActive ? 1 : 0);
    
    client.publish(mqtt_topic, statusMessage.c_str());
    prevState = currentState;
    lastStateChange = millis();
  }
}

void loop() {
  M5.update(); // ボタン状態更新
  
  // センサー読み取り
  float redValue = redSensor.readLightLevel();
  float yellowValue = yellowSensor.readLightLevel();
  float greenValue = greenSensor.readLightLevel();
  
  // 点灯状態判定
  redState = (redValue > LIGHT_THRESHOLD);
  yellowState = (yellowValue > LIGHT_THRESHOLD);
  greenState = (greenValue > LIGHT_THRESHOLD);
  
  // 点滅検出
  detectBlinking();
  
  // ボタン検出
  if (M5.BtnA.wasPressed()) {
    majorSetupCount++;
    M5.Lcd.fillRect(0, 30, 160, 20, BLACK);
    M5.Lcd.setCursor(0, 30);
    M5.Lcd.print("Major Setup: ");
    M5.Lcd.print(majorSetupCount);
  }
  
  if (M5.BtnB.wasReleased()) {
    minorSetupActive = !minorSetupActive;
    M5.Lcd.fillRect(0, 50, 160, 20, BLACK);
    M5.Lcd.setCursor(0, 50);
    M5.Lcd.print("Minor Setup: ");
    M5.Lcd.print(minorSetupActive ? "ON" : "OFF");
  }
  
  // 状態表示
  int state = determineState();
  String stateText;
  
  switch (state) {
    case 0: stateText = "Running"; break;
    case 1: stateText = "Completed"; break;
    case 2: stateText = "Error"; break;
    case 3: stateText = "Error (Blink)"; break;
    case 4: stateText = "Stopped"; break;
    case 5: stateText = "Minor Setup"; break;
    case 6: stateText = "Running (Blink)"; break;
    case 7: stateText = "Completed (Blink)"; break;
    default: stateText = "Unknown";
  }
  
  M5.Lcd.fillRect(0, 70, 160, 20, BLACK);
  M5.Lcd.setCursor(0, 70);
  M5.Lcd.print("State: ");
  M5.Lcd.print(stateText);
  
  // MQTT送信
  sendStatus();
  
  delay(100);
}
EOF