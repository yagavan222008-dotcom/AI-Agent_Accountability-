"""
Utility functions for SHA-256 hashing.
"""

import hashlib


def generate_hash(data: str) -> str:
    """
    Generate a SHA-256 hash.
    """

    return hashlib.sha256(
        data.encode("utf-8")
    ).hexdigest()


def verify_hash(data: str, expected_hash: str) -> bool:
    """
    Verify that the generated hash matches the expected hash.
    """

    return generate_hash(data) == expected_hash