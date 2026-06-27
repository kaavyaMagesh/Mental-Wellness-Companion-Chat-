import json
import uuid

from pathlib import Path
from datetime import datetime


class CrisisEscalationService:

    def __init__(self):

        self.log_file = (
            Path(__file__).parent.parent.parent
            / "data"
            / "crisis_events.json"
        )

        self.log_file.parent.mkdir(
            exist_ok=True
        )

        if not self.log_file.exists():

            with open(
                self.log_file,
                "w",
                encoding="utf-8"
            ) as f:

                json.dump([], f)

    def log_crisis_event(
        self,
        user_message,
        detector_result
    ):

        with open(
            self.log_file,
            "r",
            encoding="utf-8"
        ) as f:

            events = json.load(f)

        event = {
            "event_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "message": user_message,
            "tier": detector_result["tier"],
            "severity": detector_result["severity"],
            "risk_score": detector_result["risk_score"]
        }

        events.append(event)

        with open(
            self.log_file,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                events,
                f,
                indent=2
            )

        return event

    def create_support_ticket(
        self,
        event
    ):

        return {
            "ticket_id":
                f"CRISIS-{event['event_id'][:8]}",
            "status": "open",
            "priority": "critical"
        }

    def generate_escalation_response(
        self
    ):

        return (
            "I'm concerned about your safety. "
            "Please contact a trusted friend, "
            "family member, mental health "
            "professional, or emergency service "
            "immediately. You do not have to "
            "face this alone."
        )

    def handle_crisis(
        self,
        user_message,
        detector_result
    ):

        event = self.log_crisis_event(
            user_message,
            detector_result
        )

        ticket = self.create_support_ticket(
            event
        )

        response = (
            self.generate_escalation_response()
        )

        return {
            "event": event,
            "ticket": ticket,
            "escalation_response": response
        }