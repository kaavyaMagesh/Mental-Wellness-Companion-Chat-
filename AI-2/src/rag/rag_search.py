import os
import json
import requests
import psycopg2

from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    os.getenv("DATABASE_URL"),
    sslmode="require"
)


def generate_embedding(text):

    response = requests.post(
        "https://dpv007-embedding-model.hf.space/gradio_api/call/embed_dense",
        json={
            "data": [text]
        }
    )

    response.raise_for_status()

    event_id = response.json()["event_id"]

    result = requests.get(
        f"https://dpv007-embedding-model.hf.space/gradio_api/call/embed_dense/{event_id}"
    )

    result.raise_for_status()

    data_line = None

    for line in result.text.split("\n"):

        if line.startswith("data:"):

            data_line = line
            break

    payload = json.loads(
        data_line.replace(
            "data:",
            ""
        )
    )

    return payload[0]["dense_embedding"]


def search_knowledge_base(
    query,
    top_k=5
):

    embedding = generate_embedding(
        query
    )

    sql = """
    SELECT
        content,
        metadata,
        1 - (
            embedding <=> %s::vector
        ) AS similarity

    FROM knowledge_base

    ORDER BY
        embedding <=> %s::vector

    LIMIT %s;
    """

    with conn.cursor() as cur:

        cur.execute(
            sql,
            (
                embedding,
                embedding,
                top_k
            )
        )

        rows = cur.fetchall()

    results = []

    for row in rows:

        results.append({

            "chunk_id":
            row[1].get(
                "chunk_id"
            ),

            "topic":
            row[1].get(
                "topic"
            ),

            "similarity":
            float(row[2]),

            "content":
            row[0]
        })

    return results