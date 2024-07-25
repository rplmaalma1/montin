from dotenv import load_dotenv
load_dotenv()
from modules.mqtt_env import mqtt_broker, mqtt_base_topic, mqtt_port
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from modules.db_models import *
from mongoengine import NotUniqueError
from modules.model import model, create_data
import json
import paho.mqtt.client as mqtt
from json.decoder import JSONDecodeError
from bson import ObjectId

app = Flask(__name__)
CORS(app)
socket = SocketIO(app, cors_allowed_origins="*")

print("Connecting to broker "+mqtt_broker+"...")

mqtt_client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2, client_id="MONTIN-ADMIN")


@mqtt_client.connect_callback()
def mqtt_onconnect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print("Connected to MQTT broker with success.")
        client.subscribe(mqtt_base_topic+"/global")
    else:
        print("Failed to connect to MQTT broker with reason code " +
              str(reason_code) + ".")


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
            try:
                print(f"Subscribing montin/{id}")
                machine = Machine(unique=id)
                machine.save()
            except NotUniqueError as e:
                print(f"Machine with unique id {id} already exists!")
            finally:
                client.subscribe(f"montin/{id}")
    elif topic.startswith(mqtt_base_topic+"/"):
        id = topic.split("/")[1]
        try:
            data = json.loads(message)
            machine = Machine.objects(unique=id).first()
            if machine is None:
                machine = Machine(unique=id)
                machine.save()
            if data is not None:
                machine.update(**data)
                machines = Machine.objects()
                machines_data = json.loads(machines.to_json())
                for i, d in enumerate(machines_data):
                    machines_data[i]['id'] = d['_id']['$oid']
                    del machines_data[i]['_id']
                socket.emit("machines_update", data=machines_data)
        except JSONDecodeError as e:
            print(f"Error while parsing message: {e}")


mqtt_client.connect(mqtt_broker, mqtt_port)


@app.route("/api/machines", methods=["GET"])
def get_machines():
    try:
        machines: Machine = Machine.objects()
        machines_data = json.loads(machines.to_json())
        for i, d in enumerate(machines_data):
            machines_data[i]['id'] = d['_id']['$oid']
            del machines_data[i]['_id']

        patients: Patient = Patient.objects()
        patients_data = json.loads(patients.to_json())
        for i, d in enumerate(patients_data):
            patients_data[i]['id'] = d['_id']['$oid']
            del patients_data[i]['_id']
        json_data = {
            "machines": machines_data,
            "patients": patients_data
        }
        return response(message="Berhasil mengambil mesin!", data=json_data)
    except Exception as e:
        print(e)
        return response(400, message="Gagal mengambil mesin!")


@app.route("/api/machine/<id>", methods=["GET"])
def get_machine(id):
    try:
        machine: Machine = Machine.objects(id=ObjectId(id)).first()
        json_data = json.loads(machine.to_json())
        json_data['id'] = json_data['_id']['$oid']
        del json_data['_id']
        return response(message="Berhasil mengambil mesin!", data=json_data)
    except Exception as e:
        print(e)
        return response(400, message="Gagal mengambil mesin!")


@app.route("/api/machine/<id>", methods=["PATCH"])
def edit_machine(id):
    try:
        data = request.json
        machine = Machine.objects(id=ObjectId(id)).modify(
            upsert=False, new=True, **data)
        json_data = json.loads(machine.to_json())
        json_data['id'] = json_data['_id']['$oid']
        del json_data['_id']
        
        patient = Patient.objects(id=ObjectId(json_data['patient'])).first()
        if patient:
            pred = model.predict(create_data(json.loads(patient.to_json()), json_data)).round()
            machine.infus_rate_recommendation = pred[0]
        else:
            machine.patient = None
        machine.save()
        return response(message="Berhasil memperbarui mesin!", data=json_data)
    except Exception as e:
        print(e)
        return response(400, message="Gagal memperbarui mesin!")


@app.route("/api/patient", methods=["POST"])
def add_patient():
    try:
        data = request.json
        patient = Patient.from_json(json.dumps(data))
        patient.save()
        json_data = json.loads(patient.to_json())
        json_data['id'] = json_data['_id']['$oid']
        del json_data['_id']
        return response(message="Berhasil menambahkan pasien!", data=json_data)
    except Exception as e:
        print(e)
        return response(400, message="Gagal menambahkan pasien!")


@app.route("/api/patients", methods=["GET"])
def get_patients():
    try:
        patients: Patient = Patient.objects()
        json_data = json.loads(patients.to_json())
        for i, d in enumerate(json_data):
            json_data[i]['id'] = d['_id']['$oid']
            del json_data[i]['_id']
        return response(message="Berhasil mengambil pasien!", data=json_data)
    except Exception as e:
        print(e)
        return response(400, message="Gagal mengambil pasien!")


@app.route("/api/patient/<id>", methods=["GET"])
def get_patient(id):
    try:
        patient: Patient = Patient.objects(id=ObjectId(id)).first()
        json_data = json.loads(patient.to_json())
        json_data['id'] = json_data['_id']['$oid']
        del json_data['_id']
        return response(message="Berhasil mengambil pasien!", data=json_data)
    except Exception as e:
        print(e)
        return response(400, message="Gagal mengambil pasien!")


@app.route("/api/patient/<id>", methods=["PATCH"])
def edit_patient(id):
    try:
        data = request.json
        patient: Patient = Patient.objects(id=ObjectId(id)).modify(
            upsert=False, new=True, **data)
        json_data = json.loads(patient.to_json())
        json_data['id'] = json_data['_id']['$oid']
        del json_data['_id']
        
        machine: Machine = Machine.objects(patient=json_data['id']).first()
        if machine:
            pred = model.predict(create_data(json_data,json.loads(patient.to_json()))).round()
            machine.infus_rate_recommendation = pred[0]
            machine.save()
        return response(message="Berhasil mengedit pasien!", data=json_data)
    except Exception as e:
        print(e)
        return response(400, message="Gagal mengedit pasien!")


@app.route("/api/patient/<id>", methods=["DELETE"])
def delete_patient(id):
    try:
        patient: Patient = Patient.objects(id=ObjectId(id))
        patient.delete()
        return response(message="Berhasil menghapus pasien!")
    except Exception as e:
        print(e)
        return response(400, message="Gagal menghapus pasien!")


def response(code=200, message="Respon berhasil", data=None):
    return jsonify({
        "message": message,
        "data": data,
        "code": code
    })


if __name__ == '__main__':
    mqtt_client.loop_start()
    socket.run(app, host='0.0.0.0', debug=False)
