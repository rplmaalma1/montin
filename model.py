import pandas as pd
from sklearn.svm import SVR  # SVR untuk Support Vector Regression
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("infusion_drip_rate_dataset.csv")

X = df[["age","weight","gender","heart_rate","spO2","infusion_factor"]]
y = df[['drip_rate_per_min']]

le_gender = LabelEncoder()
le_gender.fit(["male", "famale"])
X["gender"] = le_gender.transform(X["gender"])

le_factor = LabelEncoder()
le_factor.fit(["macro", "micro", "transfusion"])
X["infusion_factor"] = le_factor.transform(X['infusion_factor'])

model = SVR(kernel='linear')
model.fit(X, y)