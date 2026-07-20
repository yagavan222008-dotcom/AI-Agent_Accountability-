from fastapi import FastAPI

# Import database components
from database.db import Base, engine

# Import models so SQLAlchemy knows what tables to create
from database import models
from api.ledger import router as ledger_router
from api.verification import router as verification_router

# --------------------------------------------------
# Create Database Tables
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# FastAPI Application
# --------------------------------------------------

app = FastAPI(
    title="AI Accountability Trust Engine",
    description="Trust Verification and Immutable Decision Ledger",
    version="1.0.0"
)

app.include_router(
    ledger_router,
    prefix="/ledger",
    tags=["Ledger"]
)
app.include_router(
    verification_router
)

# --------------------------------------------------
# Health Check Endpoint
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "AI Accountability Trust Engine",
        "status": "Running",
        "version": "1.0.0"
    }