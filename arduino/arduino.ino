#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "Android_87";
const char* password = "brainissue";

const char* mqttServer = "192.168.1.11";

#define UNIQUE_ID_PREFIX "MONTIN-"

#define POX_DETECTING_PERIOD_MS 2000

PulseOximeter pox;
bool poxReport = false;
uint32_t lastPoxDetectionReport = 0;

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
String uniqueId = "";

void onBeatDetected()
{
  if (poxReport && millis() - lastPoxDetectionReport > POX_DETECTING_PERIOD_MS && client.connected())
  {
    float heartRate = pox.getHeartRate();
    float sp02 = pox.getSpO2();
    client.publish(getUniqueTopic(uniqueId), ("pox_detect "+String(heartRate)+" "+String(sp02)).c_str());
    lastPoxDetectionReport = millis();
  }
}

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


  // MAX30100 Sensor Initializing
  // Serial.print("Initializing pulse oximeter..");
  // while(!pox.begin());
  // Serial.println("SUCCESS");
  // pox.setOnBeatDetectedCallback(onBeatDetected);
}

void mqttCallback(char* topic, byte* payload, unsigned int length)
{
  if (strcmp(topic, getUniqueTopic(uniqueId)) == 0){
    String message = getMessage(payload, length);
    Serial.println("Get message: "+message);
    if (message == "pox_start"){
      Serial.println("POX Sensor Start!");
      poxReport = true;
    }else if (message == "pox_stop"){
      Serial.println("POX Sensor Stop!");
      poxReport = false;
    }else if (message == "rejoin"){
      client.disconnect();
    }
  }
}

void mqttConnect()
{
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    uniqueId = UNIQUE_ID_PREFIX;
    uniqueId += String(random(8999)+1000).c_str();

    if (client.connect(uniqueId.c_str()))
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
  // pox.update();

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
  return ("montin/"+uniqueId).c_str();
}

String getMessage(byte* payload, int length){
  String message;
  for (int i = 0; i < length; i++)
  {
    message += (char)payload[i];
  }
  return message;
}