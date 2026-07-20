import json
import sys
from pathlib import Path

# Add the decision-engine directory to sys.path to resolve imports
decision_engine_path = Path(__file__).parent.parent / "decision-engine"
sys.path.append(str(decision_engine_path))

from schema import DecisionRecord


def generate_schema() -> None:
    # Generate Pydantic V2 JSON Schema
    schema = DecisionRecord.model_json_schema()
    output_path = Path(__file__).parent / "decision_schema.json"

    # Write schema with 2 space indents
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)

    print(f"Successfully generated schema contract at {output_path}")


if __name__ == "__main__":
    generate_schema()
