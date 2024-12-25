import os
from typing import Dict, List, Optional
import aiohttp
from fastapi import HTTPException

class FigmaClient:
    def __init__(self):
        self.api_key = os.getenv("FIGMA_API_KEY")
        self.base_url = "https://api.figma.com/v1"
        
        if not self.api_key:
            raise ValueError("FIGMA_API_KEY environment variable is not set")

    async def _make_request(self, method: str, endpoint: str, **kwargs) -> dict:
        """Make a request to the Figma API"""
        async with aiohttp.ClientSession() as session:
            headers = {
                "X-Figma-Token": self.api_key,
                "Content-Type": "application/json"
            }
            
            url = f"{self.base_url}/{endpoint}"
            
            async with session.request(method, url, headers=headers, **kwargs) as response:
                if response.status != 200:
                    error_data = await response.json()
                    raise HTTPException(
                        status_code=response.status,
                        detail=error_data.get("message", "Figma API request failed")
                    )
                return await response.json()

    def _extract_file_key(self, figma_url: str) -> str:
        """Extract file key from Figma URL"""
        try:
            # URL format: https://www.figma.com/file/{file_key}/...
            parts = figma_url.split("/")
            file_key_index = parts.index("file") + 1
            return parts[file_key_index]
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=400,
                detail="Invalid Figma URL format"
            )

    async def extract_components(self, figma_url: str) -> Dict[str, str]:
        """Extract components and their properties from a Figma file"""
        try:
            file_key = self._extract_file_key(figma_url)
            
            # Get file data
            file_data = await self._make_request("GET", f"files/{file_key}")
            
            # Extract components
            components = {}
            await self._process_node(file_data["document"], components)
            
            return components
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to extract components: {str(e)}"
            )

    async def _process_node(self, node: dict, components: Dict[str, str], parent_name: str = "") -> None:
        """Recursively process nodes to extract component information"""
        # Get node name
        name = node.get("name", "")
        full_name = f"{parent_name}/{name}" if parent_name else name
        
        # Process component properties
        if node.get("type") == "COMPONENT":
            # Extract relevant properties (colors, dimensions, etc.)
            style_props = self._extract_style_properties(node)
            components[full_name] = style_props
        
        # Process children
        if "children" in node:
            for child in node["children"]:
                await self._process_node(child, components, full_name)

    def _extract_style_properties(self, node: dict) -> str:
        """Extract style properties from a node"""
        props = {}
        
        # Extract fill (background color)
        if "fills" in node:
            props["fill"] = self._process_fills(node["fills"])
        
        # Extract stroke (border)
        if "strokes" in node:
            props["stroke"] = self._process_strokes(node["strokes"])
        
        # Extract effects (shadows, etc.)
        if "effects" in node:
            props["effects"] = self._process_effects(node["effects"])
        
        # Extract layout properties
        props.update(self._extract_layout_properties(node))
        
        return props

    def _process_fills(self, fills: List[dict]) -> dict:
        """Process fill properties"""
        if not fills or not fills[0].get("visible", True):
            return None
            
        fill = fills[0]
        if fill["type"] == "SOLID":
            return {
                "type": "solid",
                "color": self._rgb_to_hex(fill["color"]),
                "opacity": fill.get("opacity", 1)
            }
        return None

    def _process_strokes(self, strokes: List[dict]) -> dict:
        """Process stroke properties"""
        if not strokes:
            return None
            
        stroke = strokes[0]
        return {
            "color": self._rgb_to_hex(stroke["color"]),
            "weight": stroke.get("strokeWeight", 1),
            "opacity": stroke.get("opacity", 1)
        }

    def _process_effects(self, effects: List[dict]) -> List[dict]:
        """Process effect properties"""
        processed_effects = []
        for effect in effects:
            if not effect.get("visible", True):
                continue
                
            processed_effect = {
                "type": effect["type"].lower(),
                "offset": {"x": effect.get("offset", {}).get("x", 0),
                          "y": effect.get("offset", {}).get("y", 0)},
                "radius": effect.get("radius", 0),
                "color": self._rgb_to_hex(effect.get("color", {"r": 0, "g": 0, "b": 0})),
                "opacity": effect.get("opacity", 1)
            }
            processed_effects.append(processed_effect)
        return processed_effects

    def _extract_layout_properties(self, node: dict) -> dict:
        """Extract layout properties from a node"""
        return {
            "width": node.get("absoluteBoundingBox", {}).get("width"),
            "height": node.get("absoluteBoundingBox", {}).get("height"),
            "padding": {
                "top": node.get("paddingTop", 0),
                "right": node.get("paddingRight", 0),
                "bottom": node.get("paddingBottom", 0),
                "left": node.get("paddingLeft", 0)
            },
            "spacing": node.get("itemSpacing", 0)
        }

    def _rgb_to_hex(self, color: dict) -> str:
        """Convert RGB color to hex format"""
        r = int(color["r"] * 255)
        g = int(color["g"] * 255)
        b = int(color["b"] * 255)
        return f"#{r:02x}{g:02x}{b:02x}" 