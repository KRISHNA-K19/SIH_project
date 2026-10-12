"""
Tests for Officer Decision recording, mandatory justifications, and status synchronization.
"""

def test_record_officer_decision_cleared(client, supervisor_headers, officer_headers, officer_user):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Decision Test Case"})
    case_id = c_resp.json()["id"]

    # Record CLEARED decision
    dec_resp = client.post(
        f"/api/v1/cases/{case_id}/decisions",
        headers=officer_headers,
        json={
            "decision": "CLEARED",
            "comments": "Inspected passport under UV light. All security fibers and holograms verified authentic.",
        },
    )
    assert dec_resp.status_code == 201
    data = dec_resp.json()
    assert data["decision"] == "CLEARED"
    assert data["officer_id"] == officer_user.id

    # Verify case status transitioned to CLOSED
    case_get = client.get(f"/api/v1/cases/{case_id}", headers=supervisor_headers)
    assert case_get.json()["status"] == "CLOSED"


def test_record_officer_decision_escalated(client, supervisor_headers, officer_headers):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Escalation Case"})
    case_id = c_resp.json()["id"]

    dec_resp = client.post(
        f"/api/v1/cases/{case_id}/decisions",
        headers=officer_headers,
        json={
            "decision": "ESCALATED",
            "comments": "Font anomalies on surname field; submitted for secondary forensic team inspection.",
        },
    )
    assert dec_resp.status_code == 201
    assert dec_resp.json()["decision"] == "ESCALATED"

    case_get = client.get(f"/api/v1/cases/{case_id}", headers=supervisor_headers)
    assert case_get.json()["status"] == "ESCALATED"


def test_reject_invalid_decision_outcome(client, supervisor_headers, officer_headers):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Bad Decision Case"})
    case_id = c_resp.json()["id"]

    dec_resp = client.post(
        f"/api/v1/cases/{case_id}/decisions",
        headers=officer_headers,
        json={"decision": "APPROVE_AUTOMATICALLY", "comments": "Valid justification here."},
    )
    assert dec_resp.status_code == 400
    assert "Invalid decision" in dec_resp.json()["message"]


def test_reject_empty_comments_validation(client, supervisor_headers, officer_headers):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "No Comment Case"})
    case_id = c_resp.json()["id"]

    # Comments shorter than 5 chars
    dec_resp = client.post(
        f"/api/v1/cases/{case_id}/decisions",
        headers=officer_headers,
        json={"decision": "CLEARED", "comments": "ok"},
    )
    assert dec_resp.status_code == 422


def test_list_case_decisions(client, supervisor_headers, officer_headers):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Multi-Decision Case"})
    case_id = c_resp.json()["id"]

    # Decision 1: Referred
    client.post(
        f"/api/v1/cases/{case_id}/decisions",
        headers=officer_headers,
        json={"decision": "REFERRED_FOR_MANUAL_VERIFICATION", "comments": "Initial scan requires second check."},
    )

    # Decision 2: Cleared
    client.post(
        f"/api/v1/cases/{case_id}/decisions",
        headers=officer_headers,
        json={"decision": "CLEARED", "comments": "Secondary check satisfied."},
    )

    list_resp = client.get(f"/api/v1/cases/{case_id}/decisions", headers=supervisor_headers)
    assert list_resp.status_code == 200
    decisions = list_resp.json()
    assert len(decisions) == 2
