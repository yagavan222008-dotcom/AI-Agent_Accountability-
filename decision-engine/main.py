from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
import os

from agent import simulate_decision
from sender import send_to_ledger

load_dotenv()

app = FastAPI(title="Decision Engine")

LEDGER_URL = os.getenv("LEDGER_URL")


@app.get("/")
def home():
    return {
        "message": "Decision Engine is running"
    }


@app.post("/simulate")
def simulate():
    scenario = (
        "Select the best fabrication vendor for manufacturing "
        "precision aluminum components."
    )

    options = [
        "Vendor Alpha",
        "Vendor Beta",
        "Vendor Gamma"
    ]

    record = simulate_decision(scenario, options)

    success = send_to_ledger(record, LEDGER_URL)

    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to send record to Trust Engine."
        )

    return {
        "message": "Decision generated successfully",
        "decision": record.model_dump()
    }