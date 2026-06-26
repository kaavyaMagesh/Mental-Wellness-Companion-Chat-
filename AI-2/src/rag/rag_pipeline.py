from src.rag.rag_search import (
    search_knowledge_base
)

from src.rag.gemini_service import (
    generate_answer
)


def answer_question(
    query
):

    chunks = (
        search_knowledge_base(
            query,
            top_k=3
        )
    )

    context = ""

    for i, chunk in enumerate(
        chunks,
        start=1
    ):

        context += (
            f"\n\nChunk {i}\n"
            f"{chunk['content']}"
        )

    prompt = f"""
You are a mental wellness assistant.

Use ONLY the information provided in the Knowledge Base.

If the answer is not contained in the Knowledge Base,
say:
"I don't have enough information in the knowledge base to answer that."

Do not make up information.
Do not use outside knowledge.

Knowledge Base:
{context}

User Question:
{query}

Answer:
"""

    answer = (
        generate_answer(
            prompt
        )
    )

    return {

        "query": query,

        "answer": answer,

        "sources": [
            {
                "chunk_id": chunk["chunk_id"],
                "similarity": chunk["similarity"]
            }
            for chunk in chunks
        ]
    }