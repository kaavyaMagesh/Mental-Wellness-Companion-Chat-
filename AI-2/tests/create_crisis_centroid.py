import json
import numpy as np

from src.rag.rag_search import generate_embedding

with open(
    "test-data/crisis_sentences_v1.json",
    "r",
    encoding="utf-8"
) as f:

    dataset = json.load(f)

crisis_embeddings = []

for sample in dataset:

    if sample["label"] == 1:

        embedding = generate_embedding(
            sample["text"]
        )

        crisis_embeddings.append(
            embedding
        )

crisis_centroid = np.mean(
    crisis_embeddings,
    axis=0
)

np.save(
    "src/config/crisis_centroid.npy",
    crisis_centroid
)

print("Centroid saved successfully")