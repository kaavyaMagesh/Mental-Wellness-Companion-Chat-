import os
import json
import tiktoken

CHUNK_SIZE = 512
CHUNK_OVERLAP = 64

INPUT_DIRS = [
    os.path.join(
        os.getcwd(),
        "knowledge-base",
        "cleaned-kb-v1"
    ),
    os.path.join(
        os.getcwd(),
        "knowledge-base",
        "cleaned-kb-v2"
    )
]

OUTPUT_DIR = os.path.join(
    os.getcwd(),
    "knowledge-base",
    "chunks"
)

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

    if filename.startswith("grief_support"):
        return "GRIEF"

    elif filename.startswith("relationship_stress"):
        return "RELATIONSHIP"

    elif filename.startswith("work_burnout"):
        return "BURNOUT"

    elif filename.startswith("sleep_disorders"):
        return "SLEEP_DISORDER"

    elif filename.startswith("substance_awareness"):
        return "SUBSTANCE"

    mapping = {
        "01-cbt-basics": "CBT",
        "02-stress-management": "STRESS",
        "03-sleep-hygiene": "SLEEP",
        "04-mindfulness": "MINDFULNESS",
        "05-anxiety-coping": "ANXIETY",
        "06-depression-awareness": "DEPRESSION"
    }

    return mapping.get(
        filename,
        "GENERAL"
    )


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

        chunk_id = (
            f"{filename.upper()}_"
            f"{str(index).zfill(3)}"
        )

        payload = {
            "chunk_id": chunk_id,
            "document": filename,
            "topic": title,
            "chunk_number": index,
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

    for input_dir in INPUT_DIRS:

        for file in os.listdir(input_dir):

            if (
                file.endswith(".md")
                and file != "README.md"
            ):

                files.append(
                    os.path.join(
                        input_dir,
                        file
                    )
                )

    print("Files Found:")

    for file in files:
        print(
            "-",
            os.path.basename(file)
        )

    for file in files:
        process_file(file)

    print(
        "\nChunk generation complete."
    )


if __name__ == "__main__":
    main()