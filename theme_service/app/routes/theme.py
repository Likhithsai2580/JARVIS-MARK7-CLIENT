from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List
from pydantic import BaseModel, HttpUrl
from ..services.figma_service import FigmaService
from ..services.theme_service import ThemeService

router = APIRouter()
theme_service = ThemeService()
figma_service = FigmaService()

class ThemeURL(BaseModel):
    url: HttpUrl

    model_config = {
        "extra": "allow"
    }

class ThemeConfig(BaseModel):
    name: str
    version: str
    components: Dict

    model_config = {
        "extra": "allow"
    }

@router.post("/generate")
async def generate_theme(theme_url: ThemeURL):
    """Generate theme configuration from Figma URL"""
    try:
        if not figma_service.validate_url(str(theme_url.url)):
            raise HTTPException(status_code=400, detail="Invalid Figma URL")
            
        # Extract file ID from URL
        file_id = str(theme_url.url).split("/")[-2]
        file_data = figma_service.get_file(file_id)
        
        # Extract styles and generate theme
        styles = figma_service.extract_styles(file_data)
        theme = theme_service.apply_theme(styles)
        
        return theme
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/current")
async def get_current_theme():
    """Get current active theme"""
    try:
        return theme_service.get_current_theme()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/apply")
async def apply_theme(theme: ThemeConfig):
    """Apply a new theme configuration"""
    try:
        return theme_service.apply_theme(theme.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset")
async def reset_theme():
    """Reset theme to default"""
    try:
        return theme_service.reset_to_default()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_theme_history():
    """Get theme application history"""
    try:
        return theme_service.get_theme_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate")
async def validate_theme(theme: ThemeConfig):
    """Validate a theme configuration"""
    try:
        is_valid = theme_service._validate_theme_structure(theme.dict())
        return {"valid": is_valid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 