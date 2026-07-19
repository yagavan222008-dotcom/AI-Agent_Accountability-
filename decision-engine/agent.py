import json
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from openai import OpenAI
from schema import DecisionRecord

# Load environment variables (such as OPENAI_API_KEY)
load_dotenv()


def simulate_decision(scenario: str, options: list[str]) -> DecisionRecord:
    """Simulates a decision-making process using the OpenAI API.

    Args:
        scenario: A description of the scenario.
        options: A list of options to consider.

    Returns:
        A validated DecisionRecord object.

    Raises:
        ValueError: If both attempts to call the API and parse the response fail.
    """
    # Initialize client, automatically reading OPENAI_API_KEY from environment
    client = OpenAI()

    # System prompt specifying constraints and output structure
    system_prompt = (
        "You are an autonomous AI agent selecting the best option based on the given scenario.\n"
        "You must return ONLY a raw valid JSON object. Do not include markdown code block formatting (like ```json), "
        "do not include explanations, and do not include any text before or after the JSON.\n\n"
        "The JSON must have the following format:\n"
        "{\n"
        '  "options_considered": [\n'
        "    {\n"
        '      "option_id": "string",\n'
        '      "description": "string",\n'
        '      "score": float\n'
        "    }\n"
        "  ],\n"
        '  "chosen_option": "string",\n'
        '  "reasoning": "string",\n'
        '  "confidence": float\n'
        "}\n\n"
        "Rules:\n"
        "- The 'reasoning' field must be a detailed explanation under 60 words (at least 20 characters).\n"
        "- The 'confidence' field must be a float between 0.0 and 1.0 inclusive.\n"
        "- Return ONLY valid JSON."
    )

    user_message = f"Scenario: {scenario}\nOptions to consider: {options}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]

    try:
        # First attempt
        response = client.chat.completions.create(
            model="gpt-5",
            messages=messages,
            max_completion_tokens=500
        )
        response_text = response.choices[0].message.content.strip()
        parsed_json = json.loads(response_text)

        # Prepare data for strict validation
        record_data = {
            "decision_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent_version": "v1.0",
            **parsed_json
        }
        return DecisionRecord.model_validate(record_data)

    except Exception as first_error:
        # Stronger warning and retry instructions
        stronger_system_prompt = (
            f"{system_prompt}\n\n"
            "CRITICAL: The previous response failed to parse as valid JSON matching the schema. "
            "You MUST output ONLY a valid JSON object. Do NOT wrap it in markdown code blocks like ```json ... ```. "
            "Start your response with '{' and end with '}'."
        )

        retry_messages = [
            {"role": "system", "content": stronger_system_prompt},
            {"role": "user", "content": user_message}
        ]

        try:
            # Second attempt (retry once)
            response = client.chat.completions.create(
                model="gpt-5",
                messages=retry_messages,
                max_completion_tokens=500
            )
            response_text = response.choices[0].message.content.strip()
            parsed_json = json.loads(response_text)

            # Prepare data for strict validation
            record_data = {
                "decision_id": str(uuid.uuid4()),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "agent_version": "v1.0",
                **parsed_json
            }
            return DecisionRecord.model_validate(record_data)
        except Exception as second_error:
            raise ValueError(
                f"Failed to generate a valid decision record on second attempt.\n"
                f"First attempt error: {first_error}\n"
                f"Second attempt error: {second_error}"
            ) from second_error
