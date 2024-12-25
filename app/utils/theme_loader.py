import json
import os
from typing import Dict, Any
from datetime import datetime
from ..models.theme import Theme

class ThemeLoader:
    @staticmethod
    def load_default_theme() -> Theme:
        """Load the default theme configuration"""
        try:
            # Get the path to the default theme file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            theme_path = os.path.join(current_dir, "..", "data", "default_theme.json")
            
            # Read and parse the theme file
            with open(theme_path, "r") as f:
                theme_data = json.load(f)
            
            # Create a Theme object
            return Theme(
                id=theme_data["id"],
                name=theme_data["name"],
                description=theme_data["description"],
                figma_url="",  # Default theme doesn't have a Figma URL
                components=theme_data["components"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_active=True
            )
            
        except Exception as e:
            raise ValueError(f"Failed to load default theme: {str(e)}")

    @staticmethod
    def validate_theme_structure(theme_data: Dict[str, Any]) -> bool:
        """Validate the structure of a theme configuration"""
        required_fields = ["id", "name", "components"]
        if not all(field in theme_data for field in required_fields):
            return False
        
        required_components = [
            "app",
            "navbar",
            "sidebar",
            "button",
            "card",
            "input",
            "modal",
            "toast",
            "loading"
        ]
        
        components = theme_data.get("components", {})
        return all(component in components for component in required_components) 