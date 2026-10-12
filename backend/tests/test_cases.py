"""
Tests for Case Management, state machines, officer assignment, and access control.
"""

def test_create_case_with_subject(client, supervisor_headers):
    response = client.post(
        "/api/v1/cases",
        headers=supervisor_headers,
        json={
            "title": "Border Screening - John Doe",
            "description": "Suspicious travel history and document anomaly flag.",
            "priority": "HIGH",
            "subjects": [
                {
                    "full_name": "Johnathan Doe",
                    "date_of_birth": "1985-06-15",
                    "nationality": "USA",
                    "id_number": "P12345678",
                }
            ],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "case_number" in data
    assert data["case_number"].startswith("CAS-")
    assert data["status"] == "PENDING_REVIEW"
    assert data["priority"] == "HIGH"


def test_list_cases_with_pagination(client, supervisor_headers):
    # Create 3 cases
    for i in range(3):
        client.post(
            "/api/v1/cases",
            headers=supervisor_headers,
            json={"title": f"Test Case {i}", "priority": "MEDIUM"},
        )

    response = client.get("/api/v1/cases?page=1&page_size=2", headers=supervisor_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    assert len(data["items"]) == 2
    assert data["page"] == 1


def test_assign_officer_to_case(client, supervisor_headers, officer_user):
    # Create case
    c_resp = client.post(
        "/api/v1/cases",
        headers=supervisor_headers,
        json={"title": "Assignment Test Case"},
    )
    case_id = c_resp.json()["id"]

    # Assign officer
    assign_resp = client.post(
        f"/api/v1/cases/{case_id}/assign",
        headers=supervisor_headers,
        json={"officer_id": officer_user.id},
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["assigned_officer_id"] == officer_user.id
    assert assign_resp.json()["status"] == "IN_PROGRESS"


def test_officer_cannot_assign_case(client, officer_headers, officer_user):
    c_resp = client.post(
        "/api/v1/cases",
        headers=officer_headers,
        json={"title": "Officer Cannot Assign"},
    )
    case_id = c_resp.json()["id"]

    # Attempt assignment as Officer (requires Supervisor)
    assign_resp = client.post(
        f"/api/v1/cases/{case_id}/assign",
        headers=officer_headers,
        json={"officer_id": officer_user.id},
    )
    assert assign_resp.status_code == 403


def test_case_state_transitions(client, supervisor_headers):
    c_resp = client.post(
        "/api/v1/cases",
        headers=supervisor_headers,
        json={"title": "State Transition Test"},
    )
    case_id = c_resp.json()["id"]
    assert c_resp.json()["status"] == "PENDING_REVIEW"

    # Valid: PENDING_REVIEW -> IN_PROGRESS
    patch_resp = client.patch(
        f"/api/v1/cases/{case_id}",
        headers=supervisor_headers,
        json={"status": "IN_PROGRESS"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "IN_PROGRESS"

    # Valid: IN_PROGRESS -> CLOSED
    patch_resp2 = client.patch(
        f"/api/v1/cases/{case_id}",
        headers=supervisor_headers,
        json={"status": "CLOSED"},
    )
    assert patch_resp2.status_code == 200
    assert patch_resp2.json()["status"] == "CLOSED"

    # Invalid: CLOSED -> ESCALATED (Closed cases can only transition to IN_PROGRESS)
    patch_resp3 = client.patch(
        f"/api/v1/cases/{case_id}",
        headers=supervisor_headers,
        json={"status": "ESCALATED"},
    )
    assert patch_resp3.status_code == 400
    assert "Invalid state transition" in patch_resp3.json()["message"]


def test_case_timeline_and_notes(client, supervisor_headers):
    c_resp = client.post(
        "/api/v1/cases",
        headers=supervisor_headers,
        json={"title": "Timeline Test Case"},
    )
    case_id = c_resp.json()["id"]

    # Add investigative note
    note_resp = client.post(
        f"/api/v1/cases/{case_id}/notes",
        headers=supervisor_headers,
        json={"note": "Interviewed subject; claims passport was issued in consulate."},
    )
    assert note_resp.status_code == 201

    # Verify timeline
    tl_resp = client.get(f"/api/v1/cases/{case_id}/timeline", headers=supervisor_headers)
    assert tl_resp.status_code == 200
    events = tl_resp.json()
    assert any(e["event_type"] == "CASE_CREATED" for e in events)
    assert any(e["event_type"] == "NOTE_ADDED" for e in events)


def test_unauthorized_officer_case_isolation(client, supervisor_headers, officer_headers, officer_headers_2, officer_user):
    # Create case and assign to officer 1
    c_resp = client.post(
        "/api/v1/cases",
        headers=supervisor_headers,
        json={"title": "Isolated Case for Officer 1"},
    )
    case_id = c_resp.json()["id"]

    client.post(
        f"/api/v1/cases/{case_id}/assign",
        headers=supervisor_headers,
        json={"officer_id": officer_user.id},
    )

    # Officer 2 attempts to get or update this case -> 403 Forbidden
    get_resp = client.get(f"/api/v1/cases/{case_id}", headers=officer_headers_2)
    assert get_resp.status_code == 403

    patch_resp = client.patch(f"/api/v1/cases/{case_id}", headers=officer_headers_2, json={"title": "Tampered"})
    assert patch_resp.status_code == 403
