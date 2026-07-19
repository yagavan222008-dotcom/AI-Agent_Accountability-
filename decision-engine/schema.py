from typing import List
from pydantic import BaseModel, Field, ConfigDict


class Option(BaseModel):
    """Represents an individual option considered during the decision-making process."""
    model_config = ConfigDict(extra="forbid")

    option_id: str = Field(
        description="Unique identifier for the option."
    )
    description: str = Field(
        description="Detailed description of the option."
    )
    score: float = Field(
        description="The evaluated score for this option."
    )

    def to_json(self) -> str:
        """Returns the option model as a formatted JSON string."""
        return self.model_dump_json(indent=2)


class DecisionRecord(BaseModel):
    """Represents a complete record of a decision made by the system."""
    model_config = ConfigDict(extra="forbid")

    decision_id: str = Field(
        description="Unique identifier for the decision, formatted as a UUID string."
    )
    timestamp: str = Field(
        description="ISO 8601 formatted datetime string indicating when the decision was made."
    )
    options_considered: List[Option] = Field(
        description="List of all options that were considered."
    )
    chosen_option: str = Field(
        description="The option_id of the chosen option."
    )
    reasoning: str = Field(
        min_length=20,
        description="Detailed explanation/reasoning behind the choice (minimum 20 characters)."
    )
    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence score for the decision, ranging from 0.0 to 1.0 inclusive."
    )
    agent_version: str = Field(
        description="The version of the agent that made the decision."
    )

    def to_json(self) -> str:
        """Returns the decision record model as a formatted JSON string."""
        return self.model_dump_json(indent=2)
