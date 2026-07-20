"""
Pydantic schema for incoming AI decisions.
"""

from typing import Any, Dict

from pydantic import BaseModel


class DecisionRequest(BaseModel):
    decision_id: str
    payload: Dict[str, Any]