"""
Trust Score Service
"""


def calculate_trust_score(payload: dict) -> float:
    """
    Calculate a trust score for an AI decision.
    """

    score = 100.0

    confidence = payload.get("confidence")

    if confidence is not None:
        score = min(float(confidence), 100.0)

    return score