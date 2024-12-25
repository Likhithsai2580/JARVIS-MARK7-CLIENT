from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    FIGMA_ACCESS_TOKEN: str = ""
    CDN_BASE_URL: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_BUCKET_NAME: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings() 