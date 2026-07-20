"""
Security utilities for the AI Accountability Trust Engine.

This module provides:
- HMAC-SHA256 signature generation
- Signature verification
- Secret key management using .env
"""

import hashlib
import hmac
import os

from config import SECRET_KEY

if not SECRET_KEY:
    raise ValueError(
        "SECRET_KEY not found. Please add it to your .env file."
    )


# --------------------------------------------------
# Generate HMAC Signature
# --------------------------------------------------

def generate_signature(message: str) -> str:
    """
    Generate an HMAC-SHA256 signature.

    Args:
        message: The message to sign.

    Returns:
        Hexadecimal HMAC signature.
    """

    return hmac.new(
        key=SECRET_KEY.encode("utf-8"),
        msg=message.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()


# --------------------------------------------------
# Verify HMAC Signature
# --------------------------------------------------

def verify_signature(
    message: str,
    signature: str
) -> bool:
    """
    Verify an HMAC signature.

    Args:
        message: Original message.
        signature: Signature to verify.

    Returns:
        True if valid.
        False otherwise.
    """

    expected_signature = generate_signature(message)

    return hmac.compare_digest(
        expected_signature,
        signature
    )