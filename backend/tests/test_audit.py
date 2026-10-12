"""
Tests for Tamper-Evident Audit Trail logging and querying.
"""

def test_audit_log_captures_actions(client, supervisor_headers, officer_user):
    # Perform an action: create case
    client.post(
        "/api/v1/cases",
        headers=supervisor_headers,
        json={"title": "Audited Action Case"},
    )

    # Query audit events as Supervisor
    audit_resp = client.get("/api/v1/audit", headers=supervisor_headers)
    assert audit_resp.status_code == 200
    data = audit_resp.json()
    assert data["total"] > 0
    actions = [item["action"] for item in data["items"]]
    assert "CREATE_CASE" in actions


def test_officer_cannot_view_audit_log(client, officer_headers):
    # Officer attempting to view audit log -> 403 Forbidden
    resp = client.get("/api/v1/audit", headers=officer_headers)
    assert resp.status_code == 403
