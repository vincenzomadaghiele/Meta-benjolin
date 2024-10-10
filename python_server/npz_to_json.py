import pandas as pd
import json
import numpy as np

data = np.load(r"C:\Users\Leonard\GitPrivate\Latent-benjolin-interface\python_server\latent_param_dataset_16.npz")

print(data)
params = data["parameter_matrix"]
df = pd.DataFrame(params)
json_dataset = {}
json_dataset['p1'] = df.to_numpy()[:,0].tolist()
json_dataset['p2'] = df.to_numpy()[:,1].tolist()
json_dataset['p3'] = df.to_numpy()[:,2].tolist()
json_dataset['p4'] = df.to_numpy()[:,3].tolist()
json_dataset['p5'] = df.to_numpy()[:,4].tolist()
json_dataset['p6'] = df.to_numpy()[:,5].tolist()
json_dataset['p7'] = df.to_numpy()[:,6].tolist()
json_dataset['p8'] = df.to_numpy()[:,7].tolist()
with open('parameters.json', 'w', encoding='utf-8') as f:
    json.dump(json_dataset, f, ensure_ascii=False, indent=4)

