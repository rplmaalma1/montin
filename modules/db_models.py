from mongoengine import Document, LongField, ListField, StringField, BooleanField, IntField, FloatField, EnumField, ObjectIdField, connect
from modules.enums import *
import time

connect(db="db_montin",
    host="mongodb+srv://rplmaalma1:rplmaalma1@montin.qft3rmc.mongodb.net/?retryWrites=true&w=majority&appName=MontIn")


class Patient(Document):
    name = StringField(required=True)
    age = IntField(min=1, required=True)
    gender = EnumField(Gender, required=True)
    weight = IntField(required=True)
    bpm = FloatField(required=True)
    spO2 = IntField(required=True)
    meta={"collection":"patients"}

class Machine(Document):
    unique = StringField(required=True, unique=True)
    patient = StringField()
    infus_volume = FloatField(min=0, default=0)
    infus_rate = ListField(IntField(default=0, min_value=0), max_length=60)
    infus_rate_recommendation = IntField(default=0, min_value=0)
    infus_factor = EnumField(InfusionFactor, default=InfusionFactor.MACRO)
    machine_failure = BooleanField(default=False)
    meta = {"collection": "machines"}
