import os

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

mqtt_broker = os.getenv("MQTT_BROKER")
mqtt_port = int(os.getenv("MQTT_PORT"))
mqtt_base_topic = os.getenv("MQTT_BASE_TOPIC")