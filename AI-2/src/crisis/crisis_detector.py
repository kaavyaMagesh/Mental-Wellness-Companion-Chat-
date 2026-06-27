import json
import numpy as np

from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity

from src.rag.rag_search import generate_embedding


class CrisisDetector:

    def __init__(self):

        # Load keyword configuration

        config_path = (
            Path(__file__).parent.parent
            / "config"
            / "crisis-keywords-v1.json"
        )

        with open(
            config_path,
            "r",
            encoding="utf-8"
        ) as f:

            self.config = json.load(f)

        # Load precomputed crisis centroid

        centroid_path = (
            Path(__file__).parent.parent
            / "config"
            / "crisis_centroid.npy"
        )

        self.crisis_centroid = np.load(
            centroid_path
        )

        # Thresholds determined from crisis-threshold evaluation

        self.similarity_threshold = 0.50
        self.support_threshold = 0.40

    def check_embedding_similarity(
        self,
        text: str
    ):

        embedding = generate_embedding(
            text
        )

        similarity = cosine_similarity(
            [embedding],
            [self.crisis_centroid]
        )[0][0]

        return float(
            round(similarity, 4)
        )

    def detect(
        self,
        text: str
    ):

        original_text = text

        text = text.lower()

        # ==================================
        # STEP 1: KEYWORD DETECTION
        # ==================================

        for tier_id, tier in self.config["tiers"].items():

            for keyword in tier["keywords"]:

                if keyword.lower() in text:

                    # Tier 1 & Tier 2 = Crisis

                    if tier_id in [
                        "tier_1",
                        "tier_2"
                    ]:

                        return {
                            "crisis_detected": True,
                            "needs_support": False,
                            "detection_method": "keyword",
                            "tier": tier_id,
                            "severity": tier["severity"],
                            "risk_score": tier["risk_score"],
                            "action": tier["action"],
                            "matched_keyword": keyword,
                            "similarity": None
                        }

                    # Tier 3 = Distress / Wellness Support

                    if tier_id == "tier_3":

                        return {
                            "crisis_detected": False,
                            "needs_support": True,
                            "detection_method": "keyword",
                            "tier": tier_id,
                            "severity": tier["severity"],
                            "risk_score": tier["risk_score"],
                            "action": tier["action"],
                            "matched_keyword": keyword,
                            "similarity": None
                        }

        # ==================================
        # STEP 2: EMBEDDING DETECTION
        # ==================================

        similarity = self.check_embedding_similarity(
            original_text
        )

        # High confidence crisis

        if similarity >= self.similarity_threshold:

            return {
                "crisis_detected": True,
                "needs_support": False,
                "detection_method": "embedding",
                "tier": "embedding_detected",
                "severity": "high",
                "risk_score": 70,
                "action": "safety_assessment",
                "matched_keyword": None,
                "similarity": similarity
            }

        # Borderline emotional distress

        elif similarity >= self.support_threshold:

            return {
                "crisis_detected": False,
                "needs_support": True,
                "detection_method": "embedding",
                "tier": "embedding_support",
                "severity": "moderate",
                "risk_score": 40,
                "action": "wellness_support",
                "matched_keyword": None,
                "similarity": similarity
            }

        # Safe

        return {
            "crisis_detected": False,
            "needs_support": False,
            "detection_method": None,
            "tier": None,
            "severity": None,
            "risk_score": 0,
            "action": None,
            "matched_keyword": None,
            "similarity": similarity
        }



if __name__ == "__main__":

    detector = CrisisDetector()

    test_texts = [
        "I wish I was dead",
        "Nobody would miss me if I died",
        "I feel lonely",
        "I am anxious about exams",
        "Life feels meaningless",
        "I want to disappear forever",

        "How can I improve my sleep schedule?",
        "I enjoy playing badminton with friends",
        "I am preparing for my internship interview"
    ]

    for text in test_texts:

        print("\n" + "=" * 70)

        print("INPUT:")
        print(text)

        result = detector.detect(
            text
        )

        print("\nRESULT:")
        print(result)