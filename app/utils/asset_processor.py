import os
import uuid
import aiofiles
import aiohttp
from typing import Dict, List, Optional
from PIL import Image
from io import BytesIO
from fastapi import HTTPException

class AssetProcessor:
    def __init__(self):
        self.assets_dir = os.path.join("public", "assets")
        self.ensure_assets_directory()

    def ensure_assets_directory(self):
        """Ensure the assets directory exists"""
        os.makedirs(self.assets_dir, exist_ok=True)

    async def process_assets(self, components: Dict[str, dict]) -> Dict[str, dict]:
        """Process and store assets from component data"""
        processed_components = {}
        
        for component_name, component_data in components.items():
            processed_data = await self._process_component_assets(component_name, component_data)
            processed_components[component_name] = processed_data
        
        return processed_components

    async def _process_component_assets(self, component_name: str, component_data: dict) -> dict:
        """Process assets for a single component"""
        processed_data = component_data.copy()
        
        # Process background images
        if "backgroundImage" in component_data:
            image_url = component_data["backgroundImage"]
            processed_data["backgroundImage"] = await self._download_and_process_image(image_url)
        
        # Process other image assets
        if "images" in component_data:
            processed_images = {}
            for image_name, image_url in component_data["images"].items():
                processed_images[image_name] = await self._download_and_process_image(image_url)
            processed_data["images"] = processed_images
        
        return processed_data

    async def _download_and_process_image(self, image_url: str) -> str:
        """Download, process, and store an image asset"""
        try:
            # Generate unique filename
            filename = f"{uuid.uuid4()}.png"
            filepath = os.path.join(self.assets_dir, filename)
            
            # Download image
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url) as response:
                    if response.status != 200:
                        raise HTTPException(
                            status_code=response.status,
                            detail="Failed to download image asset"
                        )
                    
                    image_data = await response.read()
            
            # Process image
            image = Image.open(BytesIO(image_data))
            
            # Optimize image
            image = self._optimize_image(image)
            
            # Save processed image
            image.save(filepath, "PNG", optimize=True)
            
            # Return relative path
            return f"/assets/{filename}"
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to process image asset: {str(e)}"
            )

    def _optimize_image(self, image: Image.Image) -> Image.Image:
        """Optimize image for web use"""
        # Convert to RGB if necessary
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        # Resize if too large
        max_size = 2000
        if image.width > max_size or image.height > max_size:
            image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        return image

    async def delete_theme_assets(self, theme_id: str) -> None:
        """Delete all assets associated with a theme"""
        try:
            # Get list of asset files for the theme
            theme_assets = self._get_theme_assets(theme_id)
            
            # Delete each asset file
            for asset_path in theme_assets:
                if os.path.exists(asset_path):
                    os.remove(asset_path)
                    
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete theme assets: {str(e)}"
            )

    def _get_theme_assets(self, theme_id: str) -> List[str]:
        """Get list of asset files for a theme"""
        # This is a placeholder implementation
        # In a real application, you would maintain a database of asset-theme relationships
        return [] 