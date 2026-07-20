"""
Ledger API
"""
from fastapi import Depends
from sqlalchemy.orm import Session

from database.db import get_db

from fastapi import APIRouter

from schemas.decision import DecisionRequest
from services.ledger_service import (
    process_decision,
    get_chain
)

router = APIRouter()


GENESIS_HASH = "0" * 64


@router.post("/log")
def log_decision(
    request: DecisionRequest,
    db: Session = Depends(get_db)
):

    result = process_decision(
        db=db,
        decision_id=request.decision_id,
        payload=request.payload
    )

    return {
        "message": "Decision stored successfully",
        "decision_id": result.decision_id,
        "trust_score": result.trust_score,
        "status": result.status,
        "current_hash": result.current_hash
    }

@router.get("/chain")
def ledger_chain(
    db: Session = Depends(get_db)
):
    """
    Return the complete immutable ledger.
    """

    return get_chain(db)