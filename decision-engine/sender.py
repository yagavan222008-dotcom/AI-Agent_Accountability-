import json
from pathlib import Path
import requests
from schema import DecisionRecord


def _post_record(record: DecisionRecord, url: str) -> requests.Response:
    """Helper to perform the HTTP POST request to the ledger endpoint."""
    headers = {"Content-Type": "application/json"}
    payload = record.to_json()
    response = requests.post(
        url,
        data=payload,
        headers=headers,
        timeout=5.0
    )
    return response


def _attempt_send(record: DecisionRecord, url: str) -> bool:
    """Helper to attempt sending a record and handling success status verification."""
    response = _post_record(record, url)
    if response.status_code in (200, 201):
        response_json = response.json()
        record_hash = response_json.get("record_hash")
        print("Decision successfully logged.")
        print(record_hash)
        return True
    else:
        # Raise HTTPError for any non-success status code
        raise requests.HTTPError(
            f"Unexpected status code: {response.status_code}",
            response=response
        )


def _append_to_failed_log(record: DecisionRecord) -> None:
    """Helper to append a failed send record to a local failed_sends.jsonl file."""
    failed_file_path = Path(__file__).parent / "failed_sends.jsonl"
    serialized_record = record.model_dump_json()
    with open(failed_file_path, "a", encoding="utf-8") as f:
        f.write(serialized_record + "\n")


def send_to_ledger(record: DecisionRecord, ledger_url: str) -> bool:
    """Sends the DecisionRecord to the Trust Engine ledger.

    Args:
        record: The DecisionRecord to send.
        ledger_url: The base URL of the ledger.

    Returns:
        True if successfully logged, False if both attempts fail.
    """
    url = f"{ledger_url}/log"

    # First attempt
    try:
        return _attempt_send(record, url)
    except (
        requests.Timeout,
        requests.ConnectionError,
        requests.HTTPError,
        requests.RequestException
    ) as e:
        print(f"First attempt failed: {e}. Retrying once...")

    # Second attempt (Retry exactly once)
    try:
        return _attempt_send(record, url)
    except (
        requests.Timeout,
        requests.ConnectionError,
        requests.HTTPError,
        requests.RequestException
    ) as e:
        print(f"Second attempt failed: {e}.")

    # Log failure locally if second attempt also fails
    _append_to_failed_log(record)
    print("Warning: Failed to log decision to ledger. The record has been saved locally to failed_sends.jsonl.")
    return False
