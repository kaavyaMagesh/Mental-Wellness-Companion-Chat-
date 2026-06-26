# Crisis Threshold Evaluation Report

## Objective

The goal of this task was to build and evaluate a crisis detection system capable of identifying crisis-related user messages while minimizing false positives on normal wellness queries.

The evaluation included:

* Embedding 100 labeled samples
* Training a cosine similarity threshold
* Measuring classification performance
* Testing false positive behavior on normal wellness queries

---

## Dataset

A dataset of 100 manually curated samples was created.

| Category             | Count |
| -------------------- | ----- |
| Crisis Sentences     | 50    |
| Non-Crisis Sentences | 50    |
| Total                | 100   |

Examples of crisis samples:

* I want to kill myself
* I want to die
* I have suicidal thoughts
* Nobody would miss me if I died

Examples of non-crisis samples:

* I am stressed about exams
* I feel anxious before interviews
* I want to improve my sleep schedule
* I enjoy playing badminton with friends

---

## Embedding Strategy

All sentences were embedded using the project embedding model.

A crisis centroid was created by:

1. Generating embeddings for all crisis samples.
2. Averaging the crisis embeddings.
3. Using the resulting vector as a crisis reference embedding.

Cosine similarity was then computed between incoming messages and the crisis centroid.

---

## Threshold Tuning

The following thresholds were evaluated:

* 0.50
* 0.55
* 0.60
* 0.65
* 0.70
* 0.75
* 0.80
* 0.85
* 0.90

Each threshold was tested against the 100-sample dataset.

---

## Best Performing Threshold

### Selected Threshold

```text
0.50
```

### Performance Metrics

| Metric              | Value |
| ------------------- | ----- |
| Accuracy            | 92.0% |
| Precision           | 97.7% |
| Recall              | 86.0% |
| False Positive Rate | 2.0%  |

---

## Final Detection Architecture

The final crisis detector uses a hybrid approach:

### 1. Keyword-Based Detection

Three risk tiers were implemented:

#### Tier 1 – Immediate Danger

Examples:

* kill myself
* suicide
* overdose
* hang myself

Action:

```text
immediate_escalation
```

---

#### Tier 2 – High Risk

Examples:

* wish I was dead
* nobody would miss me
* want to disappear
* no reason to live

Action:

```text
safety_assessment
```

---

#### Tier 3 – Distress

Examples:

* lonely
* anxious
* stressed
* overwhelmed

Action:

```text
wellness_support
```

Tier 3 messages are not treated as crisis events.

---

### 2. Embedding-Based Detection

If no keyword match is found:

#### Crisis Threshold

```text
Similarity >= 0.50
```

Result:

```text
Crisis Detected
```

---

#### Support Threshold

```text
0.40 <= Similarity < 0.50
```

Result:

```text
Needs Support
```

---

#### Safe Threshold

```text
Similarity < 0.40
```

Result:

```text
Safe
```

---

## False Positive Testing

Additional normal wellness queries were tested.

Examples:

* How can I improve my sleep schedule?
* I enjoy playing badminton with friends.
* I am preparing for my internship interview.

Results:

```text
No crisis detected.
No support escalation triggered.
```

A false positive issue was discovered where the keyword:

```text
sh
```

incorrectly matched words such as:

```text
internship
```

The keyword was removed from the Tier 2 keyword list, eliminating the issue.

---

## Final Outcome

The final crisis detection system successfully combines:

* Tiered keyword matching
* Embedding similarity analysis
* Crisis classification
* Distress routing
* False positive reduction

The selected threshold of **0.50** provided the best balance between precision, recall, and false positive rate while maintaining reliable crisis detection performance.
