"""
Ledger Service

Coordinates the complete decision logging workflow.
"""

from sqlalchemy import desc
import json

from sqlalchemy.orm import Session

from database.models import DecisionRecord

from datetime import datetime

from services.hash_chain import create_hash_chain
from services.trust_score import calculate_trust_score
from services.policy_checker import check_policy
from utils.security import generate_signature


def process_decision(
    db,
    decision_id,
    payload
):
    """
    Process a decision and store it in the ledger.
    """

    timestamp = datetime.utcnow()

    policy_result = check_policy(payload)

    trust_score = calculate_trust_score(payload)
    
    last_record = (
    db.query(DecisionRecord)
    .order_by(desc(DecisionRecord.id))
    .first()
     )

    if last_record:
      previous_hash = last_record.current_hash
    else:
      previous_hash = "0" * 64

    current_hash = create_hash_chain(
    decision_id=decision_id,
    payload=payload,
    timestamp=timestamp.isoformat(),
    previous_hash=previous_hash
   )

    signature = generate_signature(current_hash)

    status = "APPROVED" if policy_result else "REJECTED"

    record = DecisionRecord(
    decision_id=decision_id,
    payload=json.dumps(payload),
    trust_score=trust_score,
    status=status,
    previous_hash=previous_hash,
    current_hash=current_hash,
    signature=signature,
    timestamp=timestamp,
    verification_version="1.0"
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record
    """
    Process an AI decision through the Trust Engine.

    Returns a dictionary ready to be stored
    in the database.
    """

    # Step 1: Timestamp
    timestamp = datetime.utcnow().isoformat()

    # Step 2: Policy Check
    policy_result = check_policy(payload)

    # Step 3: Trust Score
    trust_score = calculate_trust_score(payload)

    # Step 4: Generate Hash Chain
    current_hash = create_hash_chain(
        decision_id=decision_id,
        payload=payload,
        timestamp=timestamp,
        previous_hash=previous_hash
    )

    # Step 5: Generate Digital Signature
    signature = generate_signature(current_hash)

    # Step 6: Final Status
    status = "APPROVED" if policy_result else "REJECTED"

    return {
        "decision_id": decision_id,
        "payload": payload,
        "trust_score": trust_score,
        "status": status,
        "previous_hash": previous_hash,
        "current_hash": current_hash,
        "signature": signature,
        "timestamp": timestamp,
        "verification_version": "1.0"
    }

def get_chain(db: Session):
    """
    Return the complete immutable ledger.
    """

    records = (
        db.query(DecisionRecord)
        .order_by(DecisionRecord.id)
        .all()
    )

    chain = []

    for record in records:

        chain.append({

            "decision_id": record.decision_id,

            "timestamp": record.timestamp,

            "status": record.status,

            "trust_score": record.trust_score,

            "previous_hash": record.previous_hash,

            "current_hash": record.current_hash,

            "signature": record.signature

        })

    return chain