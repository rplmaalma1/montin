import pandas as pd
from sklearn.svm import SVR  # SVR untuk Support Vector Regression
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("infusion_drip_rate_dataset.csv")

X = df[["age","weight","gender","bpm","spO2","infus_factor"]]
y = df['drip_rate_per_min']

le_gender = LabelEncoder()
X.loc[:, "gender"] = le_gender.fit_transform(X["gender"])

le_factor = LabelEncoder()
X.loc[:, "infus_factor"] = le_factor.fit_transform(X['infus_factor'])

model = SVR(kernel='linear')
model.fit(X, y)

def create_data(patient, machine):
    return pd.DataFrame({
        "age": [patient.get("age",0)],
        "weight": [patient.get("weight", 0)],
        "gender": [le_gender.transform([patient.get("gender", "male")])[0]],
        "bpm": [patient.get("bpm", 0)],
        "spO2": [patient.get("spO2", 0)],
        "infus_factor": [le_factor.transform([machine.get("infus_factor", "macro")])[0]]
    })