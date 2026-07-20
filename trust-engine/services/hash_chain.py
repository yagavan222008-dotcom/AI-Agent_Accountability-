"""
Hash Chain Service

Creates immutable ledger hashes by linking each
decision with the previous record.
"""

from utils.canonicalizer import canonicalize
from utils.hashing import generate_hash


def create_hash_chain(
    decision_id: str,
    payload: dict,
    timestamp: str,
    previous_hash: str
) -> str:
    """
    Generate the current ledger hash.

    Args:
        decision_id: Unique decision identifier.
        payload: Decision JSON.
        timestamp: ISO timestamp.
        previous_hash: Hash of previous ledger entry.

    Returns:
        Current ledger hash.
    """

    canonical_payload = canonicalize(payload)

    ledger_data = (
        previous_hash +
        decision_id +
        canonical_payload +
        timestamp
    )

    return generate_hash(ledger_data)