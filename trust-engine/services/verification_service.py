"""
Verification Service

Verifies that an AI decision
has not been modified.
"""
import json

from utils.security import verify_signature
from services.hash_chain import create_hash_chain

from sqlalchemy.orm import Session

from database.models import DecisionRecord

def verify_decision(
    db: Session,
    decision_id: str
):
    """
    Verify a stored decision.
    """

    record = (
    db.query(DecisionRecord)
    .filter(
        DecisionRecord.decision_id == decision_id
    )
    .first()
    )

    if not record:
        return {
            "verified": False,
            "message": "Decision not found"
        }
    
    payload = json.loads(record.payload)

    expected_hash = create_hash_chain(
        decision_id=record.decision_id,
        payload=payload,
        timestamp=record.timestamp.isoformat(),
        previous_hash=record.previous_hash
    )

    hash_valid = (
    expected_hash == record.current_hash
    )

    signature_valid = verify_signature(
    record.current_hash,
    record.signature
    )

    chain_valid = len(record.previous_hash) == 64

    return {

    "decision_id": record.decision_id,

    "status": record.status,

    "hash_valid": hash_valid,

    "signature_valid": signature_valid,

    "chain_valid": chain_valid,

    "verified": (
        hash_valid
        and signature_valid
        and chain_valid
    )
    }

def verify_ledger(db: Session):

    records = (
        db.query(DecisionRecord)
        .order_by(DecisionRecord.id)
        .all()
    )

    if not records:
        return {
            "ledger_valid": True,
            "message": "Ledger is empty.",
            "verified_records": 0
        }

    previous_hash = "0" * 64

    for record in records:

        # -------------------------------
        # Step 1 : Verify chain link
        # -------------------------------
        if record.previous_hash != previous_hash:

            return {
                "ledger_valid": False,
                "broken_record": record.decision_id,
                "reason": "Previous hash mismatch"
            }

        # -------------------------------
        # Step 2 : Recreate the hash
        # -------------------------------
        payload = json.loads(record.payload)

        expected_hash = create_hash_chain(
            decision_id=record.decision_id,
            payload=payload,
            timestamp=record.timestamp.isoformat(),
            previous_hash=record.previous_hash
        )

        # -------------------------------
        # Step 3 : Compare hashes
        # -------------------------------
        if expected_hash != record.current_hash:

            return {
                "ledger_valid": False,
                "broken_record": record.decision_id,
                "reason": "Hash mismatch"
            }

        # -------------------------------
        # Step 4 : Update previous hash
        # -------------------------------
        previous_hash = record.current_hash


                # -------------------------------
        # Step 4 : Verify HMAC Signature
        # -------------------------------
        signature_valid = verify_signature(
            record.current_hash,
            record.signature
        )

        if not signature_valid:

            return {
                "ledger_valid": False,
                "broken_record": record.decision_id,
                "reason": "Invalid digital signature"
            }
    return {
        "ledger_valid": True,
        "verified_records": len(records),
        "total_records": len(records),
        "message": "Ledger integrity verified successfully."
        }