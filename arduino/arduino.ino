#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "Android_87";
const char* password = "brainissue";

const char* mqttServer = "192.168.1.11";

#define UNIQUE_ID "MONTIN-"

int irPin = 15;
int irThreshold = 100;
unsigned long irPrevMillis = 0;
unsigned long irInterval = 10000;

unsigned long sendPrevMillis = 0;
unsigned long sendInterval = 1000;

int tetes = 0;
bool menetes = false;

WiFiClient espClient;
PubSubClient client(espClient);

void setupWifi()
{
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

void setupSensor()
{
  pinMode(irPin, INPUT);
}

void mqttConnect()
{
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");

    if (client.connect(UNIQUE_ID.c_str()))
    {
      Serial.print("connected ");
      Serial.println(getUniqueTopic(uniqueId));
      client.publish("montin/global", ("join "+uniqueId).c_str());
      client.subscribe(getUniqueTopic(uniqueId));
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup()
{
  Serial.begin(115200);
  Wire.begin(); // Inisialisasi I2C

  setupSensor();
  setupWifi();

  client.setServer(mqttServer, 1883);
  client.setCallback(mqttCallback);
}

void loop()
{
  if (!client.connected())
  {
    mqttConnect();
  }
  client.loop();

  bool state = analogRead(irPin) <= irThreshold;
  if (state && !menetes) menetes = true;
  else if (!state && menetes) {
    menetes = false;
    tetes++;
  }

  JsonDocument doc;

  if (millis() - irPrevMillis > irInterval) {
    irPrevMillis = millis();
    tetes=0;
  }
  
  if (millis() - sendPrevMillis > sendInterval) {
    doc["ir_output"] = tetes*60;

    String sensorOutput;
    serializeJson(doc, sensorOutput);
    client.publish(getUniqueTopic(uniqueId), sensorOutput.c_str());
    sendPrevMillis = millis();
  }
}

const char* getUniqueTopic(String uniqueId){
  return ("montin/"+UNIQUE_ID).c_str();
}

String getMessage(byte* payload, int length){
  String message;
  for (int i = 0; i < length; i++)
  {
    message += (char)payload[i];
  }
  return message;
}