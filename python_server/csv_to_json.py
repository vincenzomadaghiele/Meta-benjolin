import pandas as pd
import json

df = pd.read_csv(r"C:\Users\Leonard\GitPrivate\Latent-benjolin-interface\python_server\dataset_umap.csv")

json_dataset = {}
json_dataset['x'] = df.to_numpy()[:,0].tolist()
json_dataset['y'] = df.to_numpy()[:,1].tolist()
json_dataset['z'] = df.to_numpy()[:,2].tolist()
with open('dataset_umap.json', 'w', encoding='utf-8') as f:
    json.dump(json_dataset, f, ensure_ascii=False, indent=4)