from json.decoder import JSONDecodeError
from dotenv import load_dotenv
load_dotenv()

import paho.mqtt.client as mqtt
import os, numpy as np
import json
from modules.obj_classes import *
from flask import Flask, jsonify, request

app = Flask(__name__)

machines: np.ndarray[Machine] = np.array([])

mqtt_broker = os.getenv("MQTT_BROKER")
mqtt_port = int(os.getenv("MQTT_PORT"))
mqtt_user = os.getenv("MQTT_USER")
mqtt_password = os.getenv("MQTT_PASSWORD")
mqtt_base_topic = os.getenv("MQTT_BASE_TOPIC")

mqtt_client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2, client_id="MONTIN-ADMIN")
mqtt_client.username_pw_set(mqtt_user, mqtt_password)

@mqtt_client.connect_callback()
def mqtt_onconnect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print("Connected to MQTT broker with success.")
        client.subscribe(mqtt_base_topic+"/global")
    else:
        print("Failed to connect to MQTT broker with reason code " + str(reason_code) + ".")


@mqtt_client.message_callback()
def mqtt_onmessage(client: mqtt.Client, userdata, message):
    global machines
    
    topic = message.topic
    qos = message.qos
    message = str(message.payload.decode("utf-8"))
    print(f"Received message on topic {topic} with QoS {qos}: {message}")
    
    if topic == mqtt_base_topic+"/global":
        if message.startswith("join"):
            id = message.split(" ")[1]
            if id not in [machine.id for machine in machines]:
                print(f"Subscribing montin/{id}")
                client.subscribe(f"montin/{id}")
                machines = np.append(machines, Machine(id))
            else:
                print(f"Machine {id} already in list.")
    elif topic.startswith(mqtt_base_topic+"/"):
        id = topic.split("/")[1]
        try:
            data = json.loads(message)
            if data is not None:
                found = False
                for index, machine in enumerate(machines):
                    if machine.id == id:
                        machines[index] = machine.update_sensor(data.get("loadcell_output", None),
                                                            data.get("ir_output", None))
                        found = True
                if not found:
                    mqtt_client.publish(mqtt_base_topic+"/"+id, "rejoin")
        except JSONDecodeError as e:
            print(f"Error while parsing message: {e}")

mqtt_client.connect(mqtt_broker, mqtt_port)

@app.route('/api/machines', methods=['GET'])
def get_machines():
    return jsonify([machine.get_dict() for machine in machines])

@app.route('/api/machine/<id>', methods=['GET'])
def get_machine(id):
    for machine in machines:
        if machine.id == id:
            return response(message="Berhasil mengambil data mesin",
                            data=machine.get_dict())
    return response(code=404, message="Tidak dapat menemukan ID mesin")

@app.route('/api/machine/<id>', methods=['PATCH'])
def patch_machine(id):
    global machines
    for index, machine in enumerate(machines):
        if machine.id == id:
            data = request.json
            machines[index] = machine.update_machine(data.get("display_name", None),
                                                    data.get("patient_id", None),
                                                    data.get("infus_volume", None))
            return response(message="Berhasil memperbarui data mesin",
                            data=[machine.get_dict() for machine in machines])
    return response(code=404, message="Tidak dapat menemukan ID mesin")

def response(code = 200, message = "Respon berhasil", data=None):
    return jsonify({
        "message": message,
        "data": data
    }), code

if __name__ == '__main__':
    mqtt_client.loop_start()
    app.run(host='0.0.0.0')