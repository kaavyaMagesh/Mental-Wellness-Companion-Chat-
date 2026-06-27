import os
import json
import requests
import psycopg2

from dotenv import load_dotenv

load_dotenv()

CHUNKS_DIR = os.path.join(
    os.getcwd(),
    "knowledge-base",
    "chunks"
)

conn = psycopg2.connect(
    os.getenv("DATABASE_URL"),
    sslmode="require"
)

conn.autocommit = True


def get_chunk_files(directory):

    chunk_files = []

    for root, dirs, files in os.walk(directory):

        for file in files:

            if file.endswith(".json"):

                chunk_files.append(
                    os.path.join(
                        root,
                        file
                    )
                )

    return chunk_files


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

    if not data_line:

        raise Exception(
            "No embedding returned"
        )

    payload = json.loads(
        data_line.replace(
            "data:",
            ""
        )
    )

    return payload[0][
        "dense_embedding"
    ]


def chunk_exists(chunk_id):

    query = """
    SELECT id
    FROM knowledge_base
    WHERE metadata->>'chunk_id' = %s
    LIMIT 1
    """

    with conn.cursor() as cur:

        cur.execute(
            query,
            (chunk_id,)
        )

        return (
            cur.fetchone()
            is not None
        )


def insert_chunk(
    content,
    embedding,
    metadata
):

    query = """
    INSERT INTO knowledge_base
    (
        content,
        embedding,
        metadata
    )
    VALUES
    (
        %s,
        %s,
        %s
    )
    """

    with conn.cursor() as cur:

        cur.execute(
            query,
            (
                content,
                embedding,
                json.dumps(
                    metadata
                )
            )
        )


def process_chunk(file_path):

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as f:

        chunk = json.load(f)

    chunk_id = chunk[
        "chunk_id"
    ]

    content = chunk[
        "content"
    ]

    if chunk_exists(
        chunk_id
    ):

        print(
            f"Skipping {chunk_id}"
        )

        return

    print(
        f"Embedding {chunk_id}..."
    )

    embedding = (
        generate_embedding(
            content
        )
    )

    print(
        f"Vector Size: {len(embedding)}"
    )

    insert_chunk(
        content,
        embedding,
        chunk
    )

    print(
        f"Indexed {chunk_id}"
    )


def main():

    try:

        print(
            "\nStarting KB Indexing...\n"
        )

        files = sorted(
            get_chunk_files(
                CHUNKS_DIR
            )
        )

        print(
            f"Found {len(files)} chunk files\n"
        )

        for idx, file in enumerate(files, start=1):

            print(
                f"\n[{idx}/{len(files)}]"
            )

            process_chunk(file)

        print(
            "\nKB Indexing Complete."
        )

    except Exception as e:

        print(
            "\nPipeline Failed:"
        )

        print(e)

    finally:

        conn.close()


if __name__ == "__main__":
    main()