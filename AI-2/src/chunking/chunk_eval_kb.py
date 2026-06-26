import os
import json
import tiktoken
from pathlib import Path

CHUNK_SIZE = 512
CHUNK_OVERLAP = 64

# Evaluation KB Input
INPUT_DIR = Path("evaluation-kb")

# Evaluation Chunk Output
OUTPUT_DIR = Path("evaluation-chunks")

encoder = tiktoken.get_encoding(
    "cl100k_base"
)


def count_tokens(text):
    return len(
        encoder.encode(text)
    )


def ensure_directory(path):
    os.makedirs(
        path,
        exist_ok=True
    )


def get_topic_code(filename):

    filename = filename.lower()

    if filename.startswith("stress"):
        return "STRESS"

    elif filename.startswith("anxiety"):
        return "ANXIETY"

    elif filename.startswith("sleep"):
        return "SLEEP"

    elif filename.startswith("mindfulness"):
        return "MINDFULNESS"

    elif filename.startswith("cbt"):
        return "CBT"

    elif filename.startswith("depression"):
        return "DEPRESSION"

    return "GENERAL"


def extract_title(content):

    for line in content.splitlines():

        if line.startswith("# "):
            return line.replace(
                "# ",
                ""
            ).strip()

    return "Untitled"


def chunk_text(text):

    paragraphs = [
        p.strip()
        for p in text.split("\n\n")
        if p.strip()
    ]

    chunks = []

    current_chunk = ""

    for paragraph in paragraphs:

        candidate = (
            paragraph
            if not current_chunk
            else current_chunk +
                 "\n\n" +
                 paragraph
        )

        if (
            count_tokens(candidate)
            <= CHUNK_SIZE
        ):
            current_chunk = candidate

        else:

            if current_chunk:
                chunks.append(
                    current_chunk
                )

            current_chunk = paragraph

    if current_chunk:
        chunks.append(
            current_chunk
        )

    final_chunks = []

    for i, chunk in enumerate(chunks):

        if i == 0:
            final_chunks.append(chunk)
            continue

        previous_tokens = encoder.encode(
            chunks[i - 1]
        )

        overlap_tokens = (
            previous_tokens[
                max(
                    0,
                    len(previous_tokens)
                    - CHUNK_OVERLAP
                ):
            ]
        )

        overlap_text = encoder.decode(
            overlap_tokens
        )

        final_chunks.append(
            overlap_text +
            "\n\n" +
            chunk
        )

    return final_chunks


def process_file(file_path):

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as f:

        content = f.read()

    filename = os.path.splitext(
        os.path.basename(file_path)
    )[0]

    topic_code = get_topic_code(
        filename
    )

    title = extract_title(
        content
    )

    chunks = chunk_text(
        content
    )

    topic_folder = os.path.join(
        OUTPUT_DIR,
        topic_code
    )

    ensure_directory(
        topic_folder
    )

    print(
        f"\nProcessing {filename}"
    )

    for index, chunk in enumerate(
        chunks,
        start=1
    ):

        chunk_id = filename.upper()

        payload = {
            "chunk_id": chunk_id,
            "document": filename,
            "topic": title,
            "chunk_number": 1,
            "token_count":
                count_tokens(chunk),
            "version": "1.0",
            "content": chunk
        }

        output_file = os.path.join(
            topic_folder,
            f"{chunk_id}.json"
        )

        with open(
            output_file,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                payload,
                f,
                indent=2,
                ensure_ascii=False
            )

        print(
            f"Created {chunk_id}"
        )


def main():

    ensure_directory(
        OUTPUT_DIR
    )

    files = []

    for root, _, filenames in os.walk(
        INPUT_DIR
    ):

        for file in filenames:

            if file.endswith(".md"):

                files.append(
                    os.path.join(
                        root,
                        file
                    )
                )

    print(
        f"Found {len(files)} files"
    )

    for file in files:
        process_file(file)

    print(
        "\nChunk generation complete."
    )


if __name__ == "__main__":
    main()