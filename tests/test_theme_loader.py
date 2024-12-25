import pytest
from app.utils.theme_loader import ThemeLoader
from app.models.theme import Theme

def test_load_default_theme():
    """Test loading the default theme"""
    theme_loader = ThemeLoader()
    theme = theme_loader.load_default_theme()
    
    assert isinstance(theme, Theme)
    assert theme.id == "default"
    assert theme.name == "JARVIS Default Theme"
    assert theme.is_active == True
    assert theme.components is not None

def test_validate_theme_structure_valid():
    """Test theme structure validation with valid data"""
    theme_loader = ThemeLoader()
    valid_theme = {
        "id": "test",
        "name": "Test Theme",
        "components": {
            "app": {},
            "navbar": {},
            "sidebar": {},
            "button": {},
            "card": {},
            "input": {},
            "modal": {},
            "toast": {},
            "loading": {}
        }
    }
    
    assert theme_loader.validate_theme_structure(valid_theme) == True

def test_validate_theme_structure_invalid():
    """Test theme structure validation with invalid data"""
    theme_loader = ThemeLoader()
    
    # Missing required fields
    invalid_theme_1 = {
        "name": "Test Theme"
    }
    assert theme_loader.validate_theme_structure(invalid_theme_1) == False
    
    # Missing required components
    invalid_theme_2 = {
        "id": "test",
        "name": "Test Theme",
        "components": {
            "app": {}
        }
    }
    assert theme_loader.validate_theme_structure(invalid_theme_2) == False 