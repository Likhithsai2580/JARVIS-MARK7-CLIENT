import requests
from ..config import settings

class FigmaService:
    def __init__(self):
        self.api_base = "https://api.figma.com/v1"
        self.headers = {
            "Authorization": f"Bearer {settings.FIGMA_ACCESS_TOKEN}"
        }
    
    def get_file(self, file_id: str):
        """Fetch Figma file data"""
        response = requests.get(
            f"{self.api_base}/files/{file_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def extract_styles(self, file_data: dict):
        """Extract styles from Figma file"""
        # TODO: Implement style extraction logic
        pass
    
    def validate_url(self, url: str) -> bool:
        """Validate if URL is a valid Figma file URL"""
        # Example: https://www.figma.com/file/xxxxx/filename
        return url.startswith("https://www.figma.com/file/") 