from mongoengine import Document, StringField, IntField, FloatField, EnumField, ObjectIdField, connect
from enum import Enum

connect(db="db_montin",
    host="mongodb+srv://rplmaalma1:rplmaalma1@montin.qft3rmc.mongodb.net/?retryWrites=true&w=majority&appName=MontIn")

class Gender(Enum):
    MALE="male"
    FAMALE="famale"

class Patient(Document):
    id = ObjectIdField()
    name = StringField(required=True)
    age = IntField(required=True)
    gender = EnumField(Gender, min=1, required=True)
    weight = IntField()
    bpm = FloatField()
    sp02 = IntField()

class Machine():
    def __init__(self, id, display_name=None, patient_id=None, infus_volume=None, drip_rate=0):
        self.id = id
        self.display_name = display_name
        self.patient_id = patient_id
        self.infus_volume = infus_volume
        self.drip_rate = drip_rate
    
    def is_ready(self):
        result = False
        if self.patient_id and self.infus_volume:
            result = True
        return result
    
    def update_machine(self, display_name=None, patient_id=None, infus_volume=None):
        self.display_name = display_name
        self.patient_id = patient_id
        self.infus_volume = infus_volume
        return self
    
    def update_sensor(self, loadcell_output, ir_output):
        self.drip_rate = ir_output
        return self
        
    def get_patient(self) -> Patient | None:
        return self.patient
    
    def get_dict(self):
        return {
            "id": self.id,
            "display_name": self.display_name,
            "patient_id": self.patient_id,
            "infus_volume": self.infus_volume,
            "drip_rate": self.drip_rate,
            "is_ready": self.is_ready(),
        }