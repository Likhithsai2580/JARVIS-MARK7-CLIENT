from pydantic import BaseModel, HttpUrl, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class ThemeBase(BaseModel):
    name: str
    description: Optional[str] = None

class ThemeCreate(ThemeBase):
    figma_url: HttpUrl
    components: Optional[Dict[str, Any]] = None

class ThemeUpdate(ThemeBase):
    figma_url: Optional[HttpUrl] = None
    components: Optional[Dict[str, Any]] = None

class Theme(ThemeBase):
    id: str
    figma_url: str = ""
    components: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    is_active: bool = False

    class Config:
        from_attributes = True

class ThemeAsset(BaseModel):
    id: str
    theme_id: str
    asset_type: str
    url: str
    created_at: datetime

    class Config:
        from_attributes = True 