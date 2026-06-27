from src.rag.eval_search import (
    search_knowledge_base
)

from tests.evaluation_queries import (
    TEST_QUERIES
)

THRESHOLDS = [
    0.20,
    0.25,
    0.30,
    0.35,
    0.40,
    0.45
]

print("\nTHRESHOLD TUNING\n")

for threshold in THRESHOLDS:

    total_precision = 0
    top1_correct = 0
    top3_correct = 0

    for query, expected in TEST_QUERIES:

        results = search_knowledge_base(
            query,
            top_k=5
        )

        results = [
            r
            for r in results
            if r["similarity"] >= threshold
        ]

        if len(results) == 0:
            continue

        relevant = sum(
            1
            for r in results
            if r["chunk_id"].startswith(
                expected
            )
        )

        precision = (
            relevant /
            len(results)
        )

        total_precision += precision

        if results[0][
            "chunk_id"
        ].startswith(expected):

            top1_correct += 1

        if any(
            r["chunk_id"].startswith(
                expected
            )
            for r in results[:3]
        ):
            top3_correct += 1

    avg_precision = (
        total_precision
        / len(TEST_QUERIES)
    )

    top1 = (
        top1_correct
        / len(TEST_QUERIES)
    )

    top3 = (
        top3_correct
        / len(TEST_QUERIES)
    )

    print(
        f"\nThreshold: {threshold}"
    )

    print(
        f"Precision: "
        f"{avg_precision:.3f}"
    )

    print(
        f"Top1: "
        f"{top1:.3f}"
    )

    print(
        f"Top3: "
        f"{top3:.3f}"
    )