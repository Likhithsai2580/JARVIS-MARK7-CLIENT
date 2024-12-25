import requests
import json
from pprint import pprint

BASE_URL = "http://localhost:8000/api"

def test_health():
    response = requests.get("http://localhost:8000/health")
    print("\n=== Health Check ===")
    pprint(response.json())
    assert response.status_code == 200

def test_current_theme():
    response = requests.get(f"{BASE_URL}/theme/current")
    print("\n=== Current Theme ===")
    pprint(response.json())
    assert response.status_code == 200

def test_theme_history():
    response = requests.get(f"{BASE_URL}/theme/history")
    print("\n=== Theme History ===")
    pprint(response.json())
    assert response.status_code == 200

def test_reset_theme():
    response = requests.post(f"{BASE_URL}/theme/reset")
    print("\n=== Reset Theme ===")
    pprint(response.json())
    assert response.status_code == 200

def test_apply_theme():
    test_theme = {
        "name": "Test Theme",
        "version": "1.0.0",
        "components": {
            "MainBackground": {
                "backgroundColor": "#001122",
                "backgroundPattern": "dots",
                "patternOpacity": 0.2
            },
            "NavigationBar": {
                "background": "gradient(to-r, from-red-900/30, via-red-800/20, to-red-900/30)",
                "blur": "lg",
                "borderColor": "red-500/30"
            }
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/theme/apply",
        json=test_theme
    )
    print("\n=== Apply Theme ===")
    pprint(response.json())
    assert response.status_code == 200

def test_validate_theme():
    # Test valid theme
    valid_theme = {
        "name": "Valid Theme",
        "version": "1.0.0",
        "components": {}
    }
    
    response = requests.post(
        f"{BASE_URL}/theme/validate",
        json=valid_theme
    )
    print("\n=== Validate Valid Theme ===")
    pprint(response.json())
    assert response.status_code == 200
    
    # Test invalid theme
    invalid_theme = {
        "name": "Invalid Theme"
        # Missing required fields
    }
    
    response = requests.post(
        f"{BASE_URL}/theme/validate",
        json=invalid_theme
    )
    print("\n=== Validate Invalid Theme ===")
    pprint(response.json())
    assert response.status_code == 422

if __name__ == "__main__":
    print("Testing JARVIS Theme Service API...")
    
    try:
        test_health()
        test_current_theme()
        test_theme_history()
        test_reset_theme()
        test_apply_theme()
        test_validate_theme()
        print("\n✅ All tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}") 