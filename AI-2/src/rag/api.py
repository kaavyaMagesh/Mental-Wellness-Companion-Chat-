from fastapi import FastAPI, HTTPException

from src.rag.rag_pipeline import (
    answer_question
)

app = FastAPI(
    title="Mental Wellness RAG API",
    version="2.0.0"
)


@app.get("/")
async def health_check():

    return {
        "status": "healthy",
        "service": "Mental Wellness RAG API"
    }


@app.post("/api/rag/search")
async def rag_search(
    payload: dict
):

    query = payload.get(
        "query"
    )

    if not query:

        raise HTTPException(
            status_code=400,
            detail="Query is required"
        )

    try:

        return answer_question(
            query
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )