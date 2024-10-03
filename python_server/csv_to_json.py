import pandas as pd
import json

df = pd.read_csv('dataset.csv')

json_dataset = {}
json_dataset['x'] = df.to_numpy()[:,0].tolist()
json_dataset['y'] = df.to_numpy()[:,1].tolist()
#json_dataset['z'] = df.to_numpy()[:,2].tolist()
with open('dataset.json', 'w', encoding='utf-8') as f:
    json.dump(json_dataset, f, ensure_ascii=False, indent=4)