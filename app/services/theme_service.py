import uuid
import logging
import traceback
from datetime import datetime
from typing import List, Optional, Dict
from fastapi import HTTPException
from ..models.theme import Theme, ThemeCreate, ThemeUpdate, ThemeAsset
from ..utils.figma import FigmaClient
from ..utils.asset_processor import AssetProcessor
from ..utils.theme_loader import ThemeLoader

logger = logging.getLogger(__name__)

class ThemeService:
    def __init__(self):
        logger.info("Initializing ThemeService")
        self.themes: Dict[str, Theme] = {}
        self.current_theme_id: Optional[str] = None
        self.figma_client = FigmaClient()
        self.asset_processor = AssetProcessor()
        self.theme_loader = ThemeLoader()
        
        # Load default theme
        try:
            logger.info("Loading default theme")
            default_theme = self.theme_loader.load_default_theme()
            self.themes[default_theme.id] = default_theme
            self.current_theme_id = default_theme.id
            logger.info("Default theme loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load default theme: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    async def get_all_themes(self) -> List[Theme]:
        """Get all available themes"""
        logger.info("Getting all themes")
        return list(self.themes.values())

    async def get_current_theme(self) -> Theme:
        """Get the currently active theme"""
        logger.info("Getting current theme")
        if not self.current_theme_id:
            # If no theme is active, try to use the default theme
            default_theme = self.themes.get("default")
            if default_theme:
                logger.info("No active theme found, using default theme")
                self.current_theme_id = "default"
                return default_theme
            logger.error("No active theme found and default theme is missing")
            raise HTTPException(status_code=404, detail="No active theme found")
        return self.themes[self.current_theme_id]

    async def create_theme(self, theme_create: ThemeCreate) -> Theme:
        """Create a new theme from Figma URL"""
        try:
            logger.info(f"Creating new theme: {theme_create.name}")
            # Generate unique ID for the theme
            theme_id = str(uuid.uuid4())
            
            # Extract components and assets from Figma
            logger.info("Extracting components from Figma")
            components = await self.figma_client.extract_components(theme_create.figma_url)
            
            # Validate theme structure
            logger.info("Validating theme structure")
            if not self.theme_loader.validate_theme_structure({"id": theme_id, "name": theme_create.name, "components": components}):
                logger.error("Invalid theme structure")
                raise ValueError("Invalid theme structure")
            
            # Process and store assets
            logger.info("Processing theme assets")
            processed_components = await self.asset_processor.process_assets(components)
            
            # Create theme object
            theme = Theme(
                id=theme_id,
                name=theme_create.name,
                description=theme_create.description,
                figma_url=theme_create.figma_url,
                components=processed_components,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_active=False
            )
            
            # Store theme
            self.themes[theme_id] = theme
            logger.info(f"Theme created successfully: {theme_id}")
            return theme
            
        except Exception as e:
            logger.error(f"Failed to create theme: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=400, detail=str(e))

    async def update_theme(self, theme_id: str, theme_update: ThemeUpdate) -> Theme:
        """Update an existing theme"""
        try:
            logger.info(f"Updating theme: {theme_id}")
            if theme_id not in self.themes:
                logger.error(f"Theme not found: {theme_id}")
                raise HTTPException(status_code=404, detail="Theme not found")
            
            # Cannot update default theme
            if theme_id == "default":
                logger.error("Attempted to update default theme")
                raise HTTPException(status_code=400, detail="Cannot update default theme")
            
            theme = self.themes[theme_id]
            
            # Update basic properties
            theme.name = theme_update.name
            theme.description = theme_update.description
            
            # Update Figma URL and components if provided
            if theme_update.figma_url:
                logger.info("Updating theme components from Figma")
                theme.figma_url = theme_update.figma_url
                components = await self.figma_client.extract_components(theme_update.figma_url)
                
                # Validate theme structure
                if not self.theme_loader.validate_theme_structure({"id": theme_id, "name": theme.name, "components": components}):
                    logger.error("Invalid theme structure")
                    raise HTTPException(status_code=400, detail="Invalid theme structure")
                
                theme.components = await self.asset_processor.process_assets(components)
            
            theme.updated_at = datetime.utcnow()
            logger.info(f"Theme updated successfully: {theme_id}")
            return theme
        except Exception as e:
            logger.error(f"Failed to update theme: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    async def delete_theme(self, theme_id: str) -> dict:
        """Delete a theme"""
        try:
            logger.info(f"Deleting theme: {theme_id}")
            if theme_id not in self.themes:
                logger.error(f"Theme not found: {theme_id}")
                raise HTTPException(status_code=404, detail="Theme not found")
            
            # Cannot delete default theme
            if theme_id == "default":
                logger.error("Attempted to delete default theme")
                raise HTTPException(status_code=400, detail="Cannot delete default theme")
            
            # Cannot delete active theme
            if theme_id == self.current_theme_id:
                logger.error("Attempted to delete active theme")
                raise HTTPException(status_code=400, detail="Cannot delete active theme")
            
            # Delete theme assets
            await self.asset_processor.delete_theme_assets(theme_id)
            
            # Remove theme
            del self.themes[theme_id]
            logger.info(f"Theme deleted successfully: {theme_id}")
            return {"message": "Theme deleted successfully"}
        except Exception as e:
            logger.error(f"Failed to delete theme: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    async def apply_theme(self, theme_id: str) -> dict:
        """Apply a theme as the current theme"""
        try:
            logger.info(f"Applying theme: {theme_id}")
            if theme_id not in self.themes:
                logger.error(f"Theme not found: {theme_id}")
                raise HTTPException(status_code=404, detail="Theme not found")
            
            # Deactivate current theme
            if self.current_theme_id:
                self.themes[self.current_theme_id].is_active = False
            
            # Activate new theme
            self.current_theme_id = theme_id
            self.themes[theme_id].is_active = True
            
            logger.info(f"Theme applied successfully: {theme_id}")
            return {"message": "Theme applied successfully"}
        except Exception as e:
            logger.error(f"Failed to apply theme: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    async def reset_theme(self) -> dict:
        """Reset to the default theme"""
        try:
            logger.info("Resetting to default theme")
            default_theme = self.themes.get("default")
            if not default_theme:
                logger.error("Default theme not found")
                raise HTTPException(status_code=404, detail="Default theme not found")
            
            # Deactivate current theme
            if self.current_theme_id and self.current_theme_id != "default":
                self.themes[self.current_theme_id].is_active = False
            
            # Activate default theme
            self.current_theme_id = "default"
            default_theme.is_active = True
            
            logger.info("Theme reset to default successfully")
            return {"message": "Theme reset to default"}
        except Exception as e:
            logger.error(f"Failed to reset theme: {str(e)}")
            logger.error(traceback.format_exc())
            raise 