from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ..models.theme import Theme, ThemeCreate, ThemeUpdate
from ..services.theme_service import ThemeService

router = APIRouter()

# Create a dependency to get the theme service
def get_theme_service():
    return ThemeService()

@router.get("/", response_model=List[Theme])
async def get_themes(theme_service: ThemeService = Depends(get_theme_service)):
    """Get all available themes"""
    return await theme_service.get_all_themes()

@router.get("/current", response_model=Theme)
async def get_current_theme(theme_service: ThemeService = Depends(get_theme_service)):
    """Get the currently active theme"""
    return await theme_service.get_current_theme()

@router.post("/", response_model=Theme)
async def create_theme(theme: ThemeCreate, theme_service: ThemeService = Depends(get_theme_service)):
    """Create a new theme from Figma URL"""
    return await theme_service.create_theme(theme)

@router.put("/{theme_id}", response_model=Theme)
async def update_theme(theme_id: str, theme: ThemeUpdate, theme_service: ThemeService = Depends(get_theme_service)):
    """Update an existing theme"""
    return await theme_service.update_theme(theme_id, theme)

@router.delete("/{theme_id}")
async def delete_theme(theme_id: str, theme_service: ThemeService = Depends(get_theme_service)):
    """Delete a theme"""
    return await theme_service.delete_theme(theme_id)

@router.post("/apply/{theme_id}")
async def apply_theme(theme_id: str, theme_service: ThemeService = Depends(get_theme_service)):
    """Apply a theme as the current theme"""
    return await theme_service.apply_theme(theme_id)

@router.post("/reset")
async def reset_theme(theme_service: ThemeService = Depends(get_theme_service)):
    """Reset to the default theme"""
    return await theme_service.reset_theme() 