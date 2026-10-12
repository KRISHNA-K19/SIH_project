"""
Tests for Health and Readiness probes.
"""

def test_root_status(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["documentation"] == "/docs"


def test_health_liveness(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "timestamp" in data


def test_health_readiness(client):
    response = client.get("/health/ready")
    assert response.status_code in [200, 503]
    data = response.json()
    assert "database_connected" in data
    assert "storage_writable" in data
