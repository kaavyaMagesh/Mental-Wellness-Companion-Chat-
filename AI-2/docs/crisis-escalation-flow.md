# Crisis Escalation Flow

## Objective

Handle detected crisis events by:

1. Logging crisis events
2. Creating support tickets
3. Returning escalation response scripts

## API Endpoint

POST /api/crisis/flag

## Flow

User Message
↓
Crisis Detector
↓
Crisis Detected
↓
POST /api/crisis/flag
↓
Log Crisis Event (crisis_events.json)
↓
Create Support Ticket
↓
Generate Escalation Response
↓
Return API Response

## Outputs

- Crisis event log
- Support ticket
- Escalation response message

## Sample Response

{
  "event": {...},
  "ticket": {...},
  "escalation_response": "..."
}