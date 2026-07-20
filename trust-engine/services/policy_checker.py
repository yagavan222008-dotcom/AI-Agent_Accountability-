"""
Policy Checker Service
"""


def check_policy(payload: dict) -> bool:
    """
    Basic policy validation.

    Returns True if the decision is acceptable.
    """

    confidence = payload.get("confidence", 100)

    if confidence < 50:
        return False

    return True