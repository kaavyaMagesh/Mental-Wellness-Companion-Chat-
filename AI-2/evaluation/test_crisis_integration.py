import json
import requests

BASE_URL = "http://127.0.0.1:8000/api/crisis/flag"

with open("evaluation/crisis_test_cases.json", "r") as f:
    test_cases = json.load(f)

passed = 0
failed = 0

print("=" * 90)
print("END-TO-END CRISIS INTEGRATION TEST")
print("=" * 90)

for test in test_cases:

    message = test["input"]

    payload = {
        "message": message
    }

    try:

        response = requests.post(BASE_URL, json=payload)

        print("\n" + "-" * 90)
        print(f"Test #{test['id']}")
        print(f"Input : {message}")
        print(f"\nHTTP Status : {response.status_code}")

        data = response.json()

        print("\nAPI Response")
        print(json.dumps(data, indent=4))

        if response.status_code != 200:
            print("❌ FAIL (API Error)")
            failed += 1
            continue

        # Crisis response
        if data.get("status") == "crisis":

            checks = [
                "event" in data,
                "ticket" in data,
                "escalation_response" in data
            ]

        # Safe response
        elif data.get("status") == "safe":

            checks = [
                "detector_result" in data,
                "message" in data,
                "event" not in data,
                "ticket" not in data
            ]

        # Unknown response
        else:

            checks = [False]

        if all(checks):
            passed += 1
            print("✅ PASS")
        else:
            failed += 1
            print("❌ FAIL")

    except Exception as e:
        failed += 1
        print(f"\nTest {test['id']} FAILED")
        print(e)

print("\n" + "=" * 90)
print("SUMMARY")
print("=" * 90)
print(f"Passed : {passed}")
print(f"Failed : {failed}")
print(f"Success : {(passed / len(test_cases)) * 100:.2f}%")