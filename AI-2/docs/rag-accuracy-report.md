# RAG Accuracy Report

## Evaluation Objective

Evaluate retrieval quality of the Mental Wellness RAG system and validate the effectiveness of vector similarity search before Gemini-based answer generation.

---

## Evaluation Setup

### Evaluation Corpus

A separate evaluation knowledge base was created to enable meaningful retrieval testing.

Corpus Statistics:

* Total Topics: 6
* Chunks per Topic: 10
* Total Chunks: 60

Topics Covered:

* Stress Management
* Anxiety Coping
* Sleep Hygiene
* Mindfulness
* Cognitive Behavioral Therapy (CBT)
* Depression Awareness

---

## Retrieval Configuration

Embedding Model:

* Mentor HF Space Dense Embedding Model

Vector Store:

* Supabase PostgreSQL
* pgvector Extension

Similarity Search:

* Cosine Similarity

Retrieval:

* Top-K = 5

---

## Query Set

A total of 30 evaluation queries were created.

Distribution:

| Topic       | Queries |
| ----------- | ------- |
| Stress      | 5       |
| Anxiety     | 5       |
| Sleep       | 5       |
| Mindfulness | 5       |
| CBT         | 5       |
| Depression  | 5       |
| Total       | 30      |

---

## Baseline Evaluation Results

| Metric             | Score |
| ------------------ | ----- |
| Precision@5        | 0.793 |
| Top1 Accuracy      | 1.000 |
| Top3 Accuracy      | 1.000 |
| Retrieval Failures | 0     |

### Interpretation

#### Top1 Accuracy

The correct topic was retrieved as the highest-ranked result for every evaluation query.

Result:

* 30 / 30 successful queries
* Accuracy = 100%

#### Top3 Accuracy

The correct topic appeared within the first three retrieved results for every evaluation query.

Result:

* 30 / 30 successful queries
* Accuracy = 100%

#### Precision@5

The retriever achieved a Precision@5 score of 0.793, indicating that approximately 79.3% of retrieved results were relevant to the expected topic domain.

#### Failure Analysis

No complete retrieval failures were observed.

Result:

* Failures = 0

---

## Similarity Threshold Tuning

The retriever was evaluated using multiple similarity thresholds.

| Threshold | Precision | Top1 Accuracy | Top3 Accuracy |
| --------- | --------- | ------------- | ------------- |
| 0.20      | 0.793     | 1.000         | 1.000         |
| 0.25      | 0.793     | 1.000         | 1.000         |
| 0.30      | 0.813     | 1.000         | 1.000         |
| 0.35      | 0.823     | 1.000         | 1.000         |
| 0.40      | 0.867     | 1.000         | 1.000         |
| 0.45      | 0.886     | 1.000         | 1.000         |

### Recommended Threshold

Recommended Similarity Threshold:

**0.45**

Reason:

* Highest Precision Score (0.886)
* Top1 Accuracy remained 100%
* Top3 Accuracy remained 100%
* Reduced retrieval of lower-confidence chunks

---

## Observations

The evaluation demonstrated that retrieval quality improves as the similarity threshold increases.

Common semantic overlap was observed between:

* Stress and Anxiety
* Anxiety and Mindfulness
* Sleep and Stress

These overlaps appeared primarily in lower-ranked retrieval results and did not affect Top1 or Top3 retrieval accuracy.

---

## Conclusion

The Mental Wellness RAG retrieval system demonstrated strong retrieval performance across all evaluated wellness domains.

Key Findings:

* Perfect Top1 Accuracy (100%)
* Perfect Top3 Accuracy (100%)
* Strong Precision@5 (79.3%)
* Improved Precision (88.6%) after threshold tuning
* Zero retrieval failures

The current embedding model and pgvector-based similarity search configuration provide reliable retrieval performance and are suitable for grounding Gemini-generated responses.

### Final Recommendation

* Use Top-K = 3 for Gemini grounding
* Apply a similarity threshold of 0.45
* Continue expanding the production knowledge base with additional topic-specific chunks for future evaluation

Status: PASS ✅
