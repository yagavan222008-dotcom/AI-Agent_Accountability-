"""
Verification API

Provides endpoints for verifying
stored AI decisions.
"""
from fastapi import Depends
from sqlalchemy.orm import Session

from database.db import get_db
from services.verification_service import verify_ledger

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from services.verification_service import verify_decision

router = APIRouter(
    prefix="/verify",
    tags=["Verification"]
)

@router.get("/ledger")
def verify_complete_ledger(
    db: Session = Depends(get_db)
):
    """
    Verify the integrity of the complete ledger.
    """
    return verify_ledger(db)

@router.get("/{decision_id}")
def verify(
    decision_id: str,
    db: Session = Depends(get_db)
):
    """
    Verify a stored decision.
    """

    return verify_decision(
        db,
        decision_id
    )

