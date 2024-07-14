class Patient():
    def __init__(self, id, nama, bb, bpm, spo2, faktor_tetes = None, kec_tetes = None):
        self.id = id
        self.nama = nama
        self.bb = bb
        self.bpm = bpm
        self.spo2 = spo2
        self._faktor_tetes = faktor_tetes
        self._kec_tetes = kec_tetes
    
    def get_dict(self):
        return {
            "id": self.id,
            "nama": self.nama,
            "bb": self.bb,
            "bpm": self.bpm,
            "spo2": self.spo2,
            "faktor_tetes": self._faktor_tetes,
            "kec_tetes": self._kec_tetes,
        }
        
    

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