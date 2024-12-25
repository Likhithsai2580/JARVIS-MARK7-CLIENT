import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ComponentConfig(BaseModel):
    backgroundColor: Optional[str] = None
    backgroundPattern: Optional[str] = None
    patternOpacity: Optional[float] = Field(None, ge=0, le=1)
    # Add other possible component properties

    model_config = {
        "extra": "allow"
    }

class ThemeModel(BaseModel):
    name: str
    version: str
    author: Optional[str] = None
    components: Dict[str, Dict[str, Any]]

    model_config = {
        "extra": "allow"
    }

class ThemeService:
    def __init__(self):
        self.default_theme = self.load_default_theme()
        self.theme_history: List[Dict] = []
        self.current_theme = self.default_theme.copy()

    def load_default_theme(self) -> Dict:
        """Load the default JARVIS theme configuration"""
        default_theme_path = Path(__file__).parent / "default_theme.json"
        try:
            with open(default_theme_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            # Return hardcoded default theme if file not found
            return {
                "name": "JARVIS Default",
                "author": "System",
                "version": "1.0.0",
                "components": {
                    "MainBackground": {
                        "backgroundColor": "#000913",
                        "backgroundPattern": "grid",
                        "patternOpacity": 0.1
                    },
                    "NavigationBar": {
                        "background": "gradient(to-r, from-blue-900/30, via-blue-800/20, to-blue-900/30)",
                        "blur": "md",
                        "borderColor": "blue-500/30"
                    },
                    # Add other default component styles
                }
            }

    def reset_to_default(self) -> Dict:
        """Reset all theme settings to default"""
        self.current_theme = self.default_theme.copy()
        self.save_theme_history({
            "theme": self.current_theme,
            "action": "reset",
            "timestamp": datetime.now().isoformat()
        })
        return self.current_theme

    def save_theme_history(self, entry: Dict) -> None:
        """Save theme to history"""
        self.theme_history.append(entry)
        # Keep only last 10 entries
        if len(self.theme_history) > 10:
            self.theme_history.pop(0)

    def get_theme_history(self) -> List[Dict]:
        """Get list of previously used themes"""
        return self.theme_history

    def apply_theme(self, theme_config: Dict) -> Dict:
        """Apply new theme configuration"""
        # Validate theme structure
        if not self._validate_theme_structure(theme_config):
            raise ValueError("Invalid theme configuration structure")

        # Merge with default theme to ensure all required properties exist
        merged_theme = self._merge_with_default(theme_config)
        
        # Save to history
        self.save_theme_history({
            "theme": merged_theme,
            "action": "apply",
            "timestamp": datetime.now().isoformat()
        })

        self.current_theme = merged_theme
        return self.current_theme

    def get_current_theme(self) -> Dict:
        """Get current active theme"""
        return self.current_theme

    def _validate_theme_structure(self, theme: Dict) -> bool:
        """Validate the basic structure of a theme configuration"""
        try:
            ThemeModel(**theme)
            return True
        except Exception as e:
            raise ValueError(f"Theme validation failed: {str(e)}")

    def _merge_with_default(self, theme: Dict) -> Dict:
        """Merge a theme with the default theme to ensure all properties exist"""
        merged = self.default_theme.copy()
        
        # Update top-level properties
        for key in ["name", "author", "version"]:
            if key in theme:
                merged[key] = theme[key]

        # Deep merge components
        if "components" in theme:
            for component, properties in theme["components"].items():
                if component not in merged["components"]:
                    merged["components"][component] = {}
                merged["components"][component].update(properties)

        return merged

    def validate_figma_url(self, url: str) -> bool:
        """Validate if a given URL is a valid Figma file URL"""
        # Basic validation - should be enhanced based on actual Figma URL format
        return url.startswith("https://www.figma.com/file/") 