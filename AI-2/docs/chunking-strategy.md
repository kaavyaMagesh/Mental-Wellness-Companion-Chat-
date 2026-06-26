# Chunking Strategy for Mental Wellness RAG Knowledge Base

## Overview

This document defines the chunking methodology used for preparing the cleaned knowledge base for embedding generation and retrieval-augmented generation (RAG).

The strategy is designed to:

- Preserve semantic meaning.
- Maintain context across chunk boundaries.
- Improve retrieval quality.
- Reduce information fragmentation.
- Support accurate source attribution.

The chunking process will be applied to all files within:

```text
cleaned-kb-v1/
```

---

# Chunk Configuration

## Primary Chunk Size

```text
512 tokens
```

### Rationale

A 512-token chunk provides sufficient context for semantic retrieval while remaining compact enough for efficient embedding generation and vector database storage.

Benefits:

- Preserve complete concepts.
- Improves retrieval relevance.
- Reduces excessive chunk counts.
- Works effectively with modern embedding models.

---

## Chunk Overlap

```text
64 tokens
```

### Rationale

Important information often appears near chunk boundaries.

Using overlap helps:

- Preserve continuity.
- Prevent context loss.
- Improve retrieval quality.
- Maintain coherence across adjacent chunks.

---

# Splitting Strategy

## Paragraph-Aware Chunking

Content should never be split in the middle of a sentence when avoidable.

Priority order:

1. Section headings
2. Paragraph boundaries
3. Sentence boundaries
4. Token limit enforcement

---

# Heading Preservation

Each chunk should inherit its parent heading information.

---

# Metadata Schema

Each chunk should contain metadata alongside content.

---

# Chunk Generation Workflow

Step 1: Load markdown document.
Step 2: Parse headings and paragraphs.
Step 3: Build chunks up to 512 tokens.
Step 4: Apply 64-token overlap.
Step 5: Attach metadata.
Step 6: Export chunk dataset.

---

# Quality Assurance

- No chunk exceeds 512 tokens.
- 64-token overlap is preserved.
- Metadata exists for every chunk.
- Source traceability is maintained.

---

# Readiness for Next Phase

Ready for Embedding Pipeline.
