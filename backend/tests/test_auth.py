"""
Tests for Authentication, JWT tokens, RBAC roles, and logout revocation.
"""

def test_login_success(client, officer_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": officer_user.email, "password": "OfficerPass123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "OFFICER"
    assert data["email"] == officer_user.email


def test_login_invalid_password(client, officer_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": officer_user.email, "password": "WrongPassword999!"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["message"]


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@veritas.gov", "password": "SomePassword123!"},
    )
    assert response.status_code == 401


def test_get_current_user_me(client, officer_headers, officer_user):
    response = client.get("/api/v1/auth/me", headers=officer_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == officer_user.id
    assert data["email"] == officer_user.email
    assert data["role"] == "OFFICER"


def test_unauthenticated_request_rejected(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code in [401, 403]


def test_logout_revokes_token(client, officer_headers):
    # Call logout
    logout_resp = client.post("/api/v1/auth/logout", headers=officer_headers)
    assert logout_resp.status_code == 200

    # Attempt to reuse revoked token
    me_resp = client.get("/api/v1/auth/me", headers=officer_headers)
    assert me_resp.status_code == 401
    assert "revoked" in me_resp.json()["message"].lower()


def test_admin_create_user(client, admin_headers):
    response = client.post(
        "/api/v1/auth/users",
        headers=admin_headers,
        json={
            "email": "newofficer@veritas.gov",
            "password": "SecurePassword123!",
            "full_name": "New Recruited Officer",
            "role": "OFFICER",
            "badge_number": "BADGE-555",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newofficer@veritas.gov"
    assert data["role"] == "OFFICER"


def test_non_admin_cannot_create_user(client, officer_headers):
    response = client.post(
        "/api/v1/auth/users",
        headers=officer_headers,
        json={
            "email": "hacker@veritas.gov",
            "password": "Password123!",
            "full_name": "Unauthorized Attempt",
            "role": "ADMIN",
        },
    )
    assert response.status_code == 403
