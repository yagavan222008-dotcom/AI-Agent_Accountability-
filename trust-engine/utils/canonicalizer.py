"""
Canonicalize JSON before hashing.
"""

import json


def canonicalize(data: dict) -> str:
    """
    Convert a dictionary into a deterministic JSON string.

    This ensures that logically identical JSON objects
    always produce the same SHA-256 hash.
    """

    return json.dumps(
        data,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False
    )