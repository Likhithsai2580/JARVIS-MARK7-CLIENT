import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to JARVIS Theme Service"
    assert response.json()["version"] == "1.0.0"
    assert response.json()["status"] == "operational"

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["service"] == "theme_service"

def test_get_themes():
    response = client.get("/api/themes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_current_theme():
    response = client.get("/api/themes/current")
    print("\n=== Current Theme ===")
    print(response.json())
    assert response.status_code == 200
    assert response.json()["id"] == "default"
    assert response.json()["name"] == "JARVIS Default Theme"

def test_reset_theme():
    response = client.post("/api/themes/reset")
    print("\n=== Reset Theme ===")
    print(response.json())
    assert response.status_code == 200
    assert response.json()["message"] == "Theme reset to default"

def test_delete_nonexistent_theme():
    response = client.delete("/api/themes/nonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Theme not found"

def test_apply_nonexistent_theme():
    response = client.post("/api/themes/apply/nonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Theme not found" 