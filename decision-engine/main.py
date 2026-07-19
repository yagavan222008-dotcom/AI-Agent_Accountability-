import os
import sys
from dotenv import load_dotenv
from agent import simulate_decision
from sender import send_to_ledger


def main() -> None:
    # Load environment variables from .env
    load_dotenv()

    openai_key = os.getenv("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")
    ledger_url = os.getenv("http://localhost:8000")

    # Verify environment variables exist
    if not openai_key:
        raise ValueError(
            "Missing environment variable: OPENAI_API_KEY is not set."
        )
    if not ledger_url:
        raise ValueError(
            "Missing environment variable: LEDGER_URL is not set."
        )

    scenario = (
        "Select the best fabrication vendor for manufacturing precision "
        "aluminum components."
    )
    options = ["Vendor Alpha", "Vendor Beta", "Vendor Gamma"]

    print("Simulating decision-making process...")
    try:
        # Simulate decision
        record = simulate_decision(scenario, options)

        print("\nGenerated Decision Record:")
        print(record.to_json())

        print("\nSending decision record to Trust Engine...")
        # Send to ledger
        success = send_to_ledger(record, ledger_url)

        if success:
            print("Successfully sent the record to the Trust Engine.")
        else:
            print("Failed to send the record to the Trust Engine.")

    except Exception as e:
        print(f"An error occurred during execution: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
