import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from src.rag.rag_search import generate_embedding


print("Loading dataset...")

with open(
    "test-data/crisis_sentences_v1.json",
    "r",
    encoding="utf-8"
) as f:

    dataset = json.load(f)


print("Generating embeddings for all samples...")

embedded_dataset = []

for idx, sample in enumerate(dataset, start=1):

    print(
        f"Embedding {idx}/{len(dataset)}"
    )

    embedding = generate_embedding(
        sample["text"]
    )

    embedded_dataset.append({
        "text": sample["text"],
        "label": sample["label"],
        "embedding": embedding
    })


print("Creating crisis centroid...")

crisis_embeddings = [
    sample["embedding"]
    for sample in embedded_dataset
    if sample["label"] == 1
]

crisis_centroid = np.mean(
    crisis_embeddings,
    axis=0
)

print(
    f"Crisis centroid created from "
    f"{len(crisis_embeddings)} crisis samples"
)


thresholds = [
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80,
    0.85,
    0.90
]

results = []

for threshold in thresholds:

    tp = 0
    tn = 0
    fp = 0
    fn = 0

    print(
        f"\nTesting Threshold: {threshold}"
    )

    for sample in embedded_dataset:

        similarity = cosine_similarity(
            [sample["embedding"]],
            [crisis_centroid]
        )[0][0]

        predicted = (
            1
            if similarity >= threshold
            else 0
        )

        actual = sample["label"]

        if actual == 1 and predicted == 1:
            tp += 1

        elif actual == 1 and predicted == 0:
            fn += 1

        elif actual == 0 and predicted == 1:
            fp += 1

        elif actual == 0 and predicted == 0:
            tn += 1

    accuracy = (
        (tp + tn)
        /
        (tp + tn + fp + fn)
    )

    precision = (
        tp /
        (tp + fp)
    ) if (tp + fp) > 0 else 0

    recall = (
        tp /
        (tp + fn)
    ) if (tp + fn) > 0 else 0

    fpr = (
        fp /
        (fp + tn)
    ) if (fp + tn) > 0 else 0

    results.append({
        "threshold": threshold,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "fpr": fpr,
        "tp": tp,
        "tn": tn,
        "fp": fp,
        "fn": fn
    })

    print(f"TP={tp}")
    print(f"TN={tn}")
    print(f"FP={fp}")
    print(f"FN={fn}")
    print(f"Accuracy : {accuracy:.3f}")
    print(f"Precision: {precision:.3f}")
    print(f"Recall   : {recall:.3f}")
    print(f"FPR      : {fpr:.3f}")


print("\n" + "=" * 80)
print("FINAL RESULTS")
print("=" * 80)

for r in results:

    print(
        f"Threshold={r['threshold']:.2f} | "
        f"Accuracy={r['accuracy']:.3f} | "
        f"Precision={r['precision']:.3f} | "
        f"Recall={r['recall']:.3f} | "
        f"FPR={r['fpr']:.3f}"
    )


best = max(
    results,
    key=lambda x: x["accuracy"]
)

print("\nBEST THRESHOLD")
print("=" * 80)

print(
    f"Threshold : {best['threshold']}"
)

print(
    f"Accuracy  : {best['accuracy']:.3f}"
)

print(
    f"Precision : {best['precision']:.3f}"
)

print(
    f"Recall    : {best['recall']:.3f}"
)

print(
    f"FPR       : {best['fpr']:.3f}"
)