from src.rag.eval_search import (
    search_knowledge_base
)

from tests.evaluation_queries import (
    TEST_QUERIES
)

total_precision = 0
top1_correct = 0
top3_correct = 0

failures = []

with open(
    "retrieval_results.txt",
    "w",
    encoding="utf-8"
) as report:

    for query, expected in TEST_QUERIES:

        results = search_knowledge_base(
            query,
            top_k=5
        )

        report.write(
            "\n" + "=" * 80 + "\n"
        )

        report.write(
            f"QUERY: {query}\n"
        )

        report.write(
            f"EXPECTED TOPIC: {expected}\n\n"
        )

        report.write(
            "TOP 5 RESULTS\n\n"
        )

        relevant = 0

        for rank, r in enumerate(
            results,
            start=1
        ):

            if r["chunk_id"].startswith(
                expected
            ):
                relevant += 1

            report.write(
                f"Rank {rank}\n"
            )

            report.write(
                f"Chunk ID   : {r['chunk_id']}\n"
            )

            report.write(
                f"Similarity : "
                f"{r['similarity']:.4f}\n"
            )

            report.write(
                f"Topic      : "
                f"{r.get('topic', 'N/A')}\n"
            )

            report.write(
                "Content:\n"
            )

            report.write(
                r["content"][:200]
            )

            report.write(
                "\n\n"
            )

        precision = relevant / 5

        total_precision += precision

        # Top1 Accuracy
        if (
            len(results) > 0
            and
            results[0]["chunk_id"].startswith(
                expected
            )
        ):
            top1_correct += 1

        # Top3 Accuracy
        top3 = any(
            r["chunk_id"].startswith(
                expected
            )
            for r in results[:3]
        )

        if top3:
            top3_correct += 1

        if relevant == 0:

            failures.append(
                (
                    query,
                    expected,
                    results[0]["chunk_id"]
                    if results
                    else "NONE"
                )
            )

        report.write(
            f"\nRelevant in Top5: {relevant}\n"
        )

        report.write(
            f"Precision@5: "
            f"{precision:.3f}\n"
        )

    avg_precision = (
        total_precision
        / len(TEST_QUERIES)
    )

    top1_accuracy = (
        top1_correct
        / len(TEST_QUERIES)
    )

    top3_accuracy = (
        top3_correct
        / len(TEST_QUERIES)
    )

    report.write(
        "\n" + "=" * 80 + "\n"
    )

    report.write(
        "FINAL RESULTS\n\n"
    )

    report.write(
        f"Precision@5: "
        f"{avg_precision:.3f}\n"
    )

    report.write(
        f"Top1 Accuracy: "
        f"{top1_accuracy:.3f}\n"
    )

    report.write(
        f"Top3 Accuracy: "
        f"{top3_accuracy:.3f}\n"
    )

    report.write(
        f"Failures: "
        f"{len(failures)}\n"
    )

    if failures:

        report.write(
            "\nFAILURES\n"
        )

        for failure in failures:

            report.write(
                f"{failure}\n"
            )

print("\nRESULTS\n")

print(
    f"Precision@5: "
    f"{avg_precision:.3f}"
)

print(
    f"Top1 Accuracy: "
    f"{top1_accuracy:.3f}"
)

print(
    f"Top3 Accuracy: "
    f"{top3_accuracy:.3f}"
)

print(
    f"Failures: "
    f"{len(failures)}"
)

print(
    "\nDetailed retrieval report saved to:"
)

print(
    "retrieval_results.txt"
)